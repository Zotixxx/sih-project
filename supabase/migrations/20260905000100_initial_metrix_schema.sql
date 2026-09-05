-- MetriX Supabase foundation.
-- No operational/demo records are inserted by this migration.

create extension if not exists pgcrypto;

do $$
begin
  create type public.metrix_role as enum (
    'BUSINESS',
    'LMO',
    'ASSISTANT_CONTROLLER',
    'SYSTEM_ADMIN'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.application_status as enum (
    'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REJECTED', 'ACCEPTED',
    'SCHEDULED', 'UNDER_VERIFICATION', 'VERIFICATION_COMPLETED',
    'AWAITING_APPROVAL', 'APPROVED', 'CERTIFIED'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.inspection_status as enum (
    'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'RETURNED', 'APPROVED'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.certificate_status as enum ('VALID', 'EXPIRED', 'REVOKED');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.metrix_role not null,
  display_name text not null,
  district_id text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.districts (
  id text primary key,
  name text not null,
  state text not null,
  zone text,
  controller_office text,
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  business_id text not null unique,
  user_id uuid not null unique references auth.users(id) on delete restrict,
  district_id text not null references public.districts(id) on update cascade,
  name text not null,
  gstin text,
  pan text,
  registration_number text,
  contact_person text,
  phone text,
  email text,
  address text,
  city text,
  state text,
  pincode text,
  nature_of_business text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lmos (
  id uuid primary key default gen_random_uuid(),
  lmo_id text not null unique,
  user_id uuid not null unique references auth.users(id) on delete restrict,
  district_id text not null references public.districts(id) on update cascade,
  name text not null,
  designation text,
  badge_number text,
  jurisdiction text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assistant_controllers (
  id uuid primary key default gen_random_uuid(),
  ac_id text not null unique,
  user_id uuid not null unique references auth.users(id) on delete restrict,
  district_id text not null references public.districts(id) on update cascade,
  name text not null,
  designation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.instrument_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.instruments (
  id uuid primary key default gen_random_uuid(),
  instrument_id text not null unique,
  business_id uuid not null references public.businesses(id) on delete restrict,
  district_id text not null references public.districts(id) on update cascade,
  instrument_type_id uuid references public.instrument_types(id),
  name text not null,
  manufacturer text,
  model text,
  serial_number text not null,
  capacity text,
  accuracy_class text,
  year_of_manufacture integer,
  purchase_date date,
  purpose text,
  location text,
  city text,
  state text,
  pincode text,
  status text not null default 'READY_FOR_VERIFICATION',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, serial_number)
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  storage_bucket text not null,
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  file_size bigint not null check (file_size >= 0),
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  business_id uuid references public.businesses(id) on delete restrict,
  instrument_id uuid references public.instruments(id) on delete cascade,
  application_id uuid,
  inspection_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.verification_applications (
  id uuid primary key default gen_random_uuid(),
  application_id text not null unique,
  business_id uuid not null references public.businesses(id) on delete restrict,
  instrument_id uuid not null references public.instruments(id) on delete restrict,
  district_id text not null references public.districts(id) on update cascade,
  assigned_lmo_id uuid references public.lmos(id) on delete restrict,
  status public.application_status not null default 'DRAFT',
  verification_type text not null,
  verification_location jsonb not null,
  business_snapshot jsonb not null,
  instrument_snapshot jsonb not null,
  applicant_name text not null,
  notes text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents
  add constraint documents_application_fk
  foreign key (application_id) references public.verification_applications(id) on delete cascade;

create table if not exists public.application_documents (
  application_id uuid not null references public.verification_applications(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  primary key (application_id, document_id)
);

create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.verification_applications(id) on delete cascade,
  from_status public.application_status,
  to_status public.application_status not null,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  inspection_id text not null unique,
  application_id uuid not null unique references public.verification_applications(id) on delete restrict,
  lmo_id uuid not null references public.lmos(id) on delete restrict,
  status public.inspection_status not null default 'ASSIGNED',
  inspection_date date,
  gps_coordinates text,
  seal_number text,
  standards_used text,
  checklist jsonb not null default '{}'::jsonb,
  officer_remarks text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inspection_measurements (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references public.inspections(id) on delete cascade,
  test_load text not null,
  indicated_weight text,
  error text,
  mpe_limit text,
  result text not null check (result in ('PASS', 'FAIL')),
  created_at timestamptz not null default now()
);

create table if not exists public.inspection_evidence (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references public.inspections(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_id text not null unique,
  application_id uuid not null unique references public.verification_applications(id) on delete restrict,
  inspection_id uuid not null references public.inspections(id) on delete restrict,
  status public.certificate_status not null default 'VALID',
  certificate_number text not null unique,
  official_number text,
  valid_from date not null,
  valid_until date not null,
  security_hash text not null,
  qr_verification_token text not null unique,
  public_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  title text not null,
  message text not null,
  related_application_id uuid references public.verification_applications(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  actor_role public.metrix_role not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists instruments_business_idx on public.instruments (business_id);
create index if not exists applications_business_idx on public.verification_applications (business_id);
create index if not exists applications_status_idx on public.verification_applications (status);
create index if not exists applications_lmo_idx on public.verification_applications (assigned_lmo_id);
create index if not exists inspections_lmo_idx on public.inspections (lmo_id);
create index if not exists notifications_recipient_idx on public.notifications (recipient_user_id, created_at desc);
create index if not exists audit_entity_idx on public.audit_logs (entity_type, entity_id);

create or replace function public.current_role()
returns public.metrix_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where user_id = auth.uid() $$;

create or replace function public.current_district()
returns text
language sql stable security definer set search_path = public
as $$ select district_id from public.profiles where user_id = auth.uid() $$;

create or replace function public.current_business_uuid()
returns uuid
language sql stable security definer set search_path = public
as $$ select id from public.businesses where user_id = auth.uid() $$;

create or replace function public.current_lmo_uuid()
returns uuid
language sql stable security definer set search_path = public
as $$ select id from public.lmos where user_id = auth.uid() $$;

alter table public.profiles enable row level security;
alter table public.districts enable row level security;
alter table public.businesses enable row level security;
alter table public.lmos enable row level security;
alter table public.assistant_controllers enable row level security;
alter table public.instrument_types enable row level security;
alter table public.instruments enable row level security;
alter table public.documents enable row level security;
alter table public.verification_applications enable row level security;
alter table public.application_documents enable row level security;
alter table public.application_status_history enable row level security;
alter table public.inspections enable row level security;
alter table public.inspection_measurements enable row level security;
alter table public.inspection_evidence enable row level security;
alter table public.certificates enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists profiles_self_read on public.profiles;
drop policy if exists districts_authenticated_read on public.districts;
drop policy if exists businesses_owner_or_admin on public.businesses;
drop policy if exists lmos_scope_read on public.lmos;
drop policy if exists ac_scope_read on public.assistant_controllers;
drop policy if exists instrument_owner_or_scope on public.instruments;
drop policy if exists instrument_owner_write on public.instruments;
drop policy if exists instrument_owner_update on public.instruments;
drop policy if exists application_owner_or_scope on public.verification_applications;
drop policy if exists application_owner_insert on public.verification_applications;
drop policy if exists inspection_assigned_or_scope on public.inspections;
drop policy if exists inspection_lmo_update on public.inspections;
drop policy if exists certificate_owner_or_scope on public.certificates;
drop policy if exists notification_recipient_read on public.notifications;
drop policy if exists audit_scope_read on public.audit_logs;
drop policy if exists application_documents_owner_read on public.application_documents;
drop policy if exists application_history_scope_read on public.application_status_history;
drop policy if exists measurements_assigned_read on public.inspection_measurements;
drop policy if exists evidence_assigned_read on public.inspection_evidence;
drop policy if exists documents_owner_read on public.documents;
drop policy if exists storage_business_documents_read on storage.objects;
drop policy if exists storage_business_documents_insert on storage.objects;
drop policy if exists storage_instrument_documents_read on storage.objects;
drop policy if exists storage_instrument_documents_insert on storage.objects;
drop policy if exists storage_inspection_evidence_read on storage.objects;
drop policy if exists storage_inspection_evidence_insert on storage.objects;

create policy profiles_self_read on public.profiles for select using (user_id = auth.uid() or public.current_role() = 'SYSTEM_ADMIN');
create policy districts_authenticated_read on public.districts for select to authenticated using (true);
create policy businesses_owner_or_admin on public.businesses for all using (user_id = auth.uid() or public.current_role() = 'SYSTEM_ADMIN') with check (user_id = auth.uid() or public.current_role() = 'SYSTEM_ADMIN');
create policy lmos_scope_read on public.lmos for select using (user_id = auth.uid() or public.current_role() in ('ASSISTANT_CONTROLLER', 'SYSTEM_ADMIN') and district_id = public.current_district());
create policy ac_scope_read on public.assistant_controllers for select using (user_id = auth.uid() or public.current_role() = 'SYSTEM_ADMIN');
create policy instrument_owner_or_scope on public.instruments for select using (business_id = public.current_business_uuid() or public.current_role() in ('LMO', 'ASSISTANT_CONTROLLER', 'SYSTEM_ADMIN') and district_id = public.current_district());
create policy instrument_owner_write on public.instruments for insert with check (business_id = public.current_business_uuid());
create policy instrument_owner_update on public.instruments for update using (business_id = public.current_business_uuid()) with check (business_id = public.current_business_uuid());
create policy application_owner_or_scope on public.verification_applications for select using (business_id = public.current_business_uuid() or public.current_role() in ('LMO', 'ASSISTANT_CONTROLLER', 'SYSTEM_ADMIN') and district_id = public.current_district());
create policy application_owner_insert on public.verification_applications for insert with check (business_id = public.current_business_uuid());
create policy inspection_assigned_or_scope on public.inspections for select using (lmo_id = public.current_lmo_uuid() or public.current_role() in ('ASSISTANT_CONTROLLER', 'SYSTEM_ADMIN') and exists (select 1 from public.verification_applications a where a.id = inspections.application_id and a.district_id = public.current_district()));
create policy inspection_lmo_update on public.inspections for update using (lmo_id = public.current_lmo_uuid()) with check (lmo_id = public.current_lmo_uuid());
create policy certificate_owner_or_scope on public.certificates for select using (exists (select 1 from public.verification_applications a where a.id = certificates.application_id and (a.business_id = public.current_business_uuid() or public.current_role() in ('LMO', 'ASSISTANT_CONTROLLER', 'SYSTEM_ADMIN') and a.district_id = public.current_district())));
create policy notification_recipient_read on public.notifications for select using (recipient_user_id = auth.uid());
create policy audit_scope_read on public.audit_logs for select using (actor_user_id = auth.uid() or public.current_role() in ('ASSISTANT_CONTROLLER', 'SYSTEM_ADMIN'));

create policy application_documents_owner_read on public.application_documents for select using (
  exists (
    select 1 from public.verification_applications a
    where a.id = application_documents.application_id
      and (a.business_id = public.current_business_uuid() or public.current_role() in ('LMO', 'ASSISTANT_CONTROLLER', 'SYSTEM_ADMIN'))
  )
);
create policy application_history_scope_read on public.application_status_history for select using (
  exists (
    select 1 from public.verification_applications a
    where a.id = application_status_history.application_id
      and (a.business_id = public.current_business_uuid() or public.current_role() in ('LMO', 'ASSISTANT_CONTROLLER', 'SYSTEM_ADMIN'))
  )
);
create policy measurements_assigned_read on public.inspection_measurements for select using (
  exists (select 1 from public.inspections i where i.id = inspection_measurements.inspection_id and (i.lmo_id = public.current_lmo_uuid() or public.current_role() in ('ASSISTANT_CONTROLLER', 'SYSTEM_ADMIN')))
);
create policy evidence_assigned_read on public.inspection_evidence for select using (
  exists (select 1 from public.inspections i where i.id = inspection_evidence.inspection_id and (i.lmo_id = public.current_lmo_uuid() or public.current_role() in ('ASSISTANT_CONTROLLER', 'SYSTEM_ADMIN')))
);
create policy documents_owner_read on public.documents for select using (
  uploaded_by = auth.uid()
  or business_id = public.current_business_uuid()
  or public.current_role() in ('LMO', 'ASSISTANT_CONTROLLER', 'SYSTEM_ADMIN')
);

create policy storage_business_documents_read on storage.objects for select to authenticated using (
  bucket_id = 'business-documents' and (owner_id = auth.uid()::text or public.current_role() = 'SYSTEM_ADMIN')
);
create policy storage_business_documents_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'business-documents' and owner_id = auth.uid()::text
);
create policy storage_instrument_documents_read on storage.objects for select to authenticated using (
  bucket_id = 'instrument-documents' and (owner_id = auth.uid()::text or public.current_role() in ('LMO', 'ASSISTANT_CONTROLLER', 'SYSTEM_ADMIN'))
);
create policy storage_instrument_documents_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'instrument-documents' and owner_id = auth.uid()::text
);
create policy storage_inspection_evidence_read on storage.objects for select to authenticated using (
  bucket_id = 'inspection-evidence' and (owner_id = auth.uid()::text or public.current_role() in ('LMO', 'ASSISTANT_CONTROLLER', 'SYSTEM_ADMIN'))
);
create policy storage_inspection_evidence_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'inspection-evidence' and owner_id = auth.uid()::text
);

insert into storage.buckets (id, name, public) values
  ('business-documents', 'business-documents', false),
  ('instrument-documents', 'instrument-documents', false),
  ('inspection-evidence', 'inspection-evidence', false)
on conflict (id) do nothing;
