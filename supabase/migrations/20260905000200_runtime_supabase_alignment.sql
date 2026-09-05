-- Runtime alignment for the Supabase-backed MetriX API.
-- This migration is additive and avoids dropping application data.

alter table public.verification_applications
  add column if not exists certificate_id text,
  add column if not exists certificate_number text,
  add column if not exists certified_at timestamptz,
  add column if not exists accepted_at timestamptz,
  add column if not exists assigned_at timestamptz,
  add column if not exists rejected_at timestamptz,
  add column if not exists rejection_reason text,
  add column if not exists returned_reason text;

alter table public.inspections
  add column if not exists district_id text references public.districts(id) on update cascade,
  add column if not exists scheduled_date date,
  add column if not exists returned_at timestamptz,
  add column if not exists return_reason text,
  add column if not exists certificate_id text,
  add column if not exists certificate_number text,
  add column if not exists approved_date date;

update public.inspections i
set district_id = a.district_id
from public.verification_applications a
where i.application_id = a.id
  and i.district_id is null;

alter table public.certificates
  add column if not exists district_id text references public.districts(id) on update cascade,
  add column if not exists business_id uuid references public.businesses(id) on delete restrict;

update public.certificates c
set district_id = a.district_id,
    business_id = a.business_id
from public.verification_applications a
where c.application_id = a.id
  and (c.district_id is null or c.business_id is null);

alter table public.notifications
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.audit_logs
  add column if not exists district_id text references public.districts(id) on update cascade;

create table if not exists public.application_drafts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  draft_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.application_drafts enable row level security;

create unique index if not exists inspection_evidence_unique_idx
  on public.inspection_evidence (inspection_id, document_id);
create index if not exists applications_certificate_idx
  on public.verification_applications (certificate_id);
create index if not exists applications_accepted_idx
  on public.verification_applications (accepted_at);
create index if not exists inspections_district_idx
  on public.inspections (district_id);
create index if not exists inspections_status_idx
  on public.inspections (status);
create index if not exists certificates_business_idx
  on public.certificates (business_id);
create index if not exists certificates_district_idx
  on public.certificates (district_id);
create index if not exists audit_district_idx
  on public.audit_logs (district_id, created_at desc);
create index if not exists application_drafts_user_idx
  on public.application_drafts (user_id);

drop policy if exists lmos_scope_read on public.lmos;
drop policy if exists instrument_owner_or_scope on public.instruments;
drop policy if exists application_owner_or_scope on public.verification_applications;
drop policy if exists inspection_assigned_or_scope on public.inspections;
drop policy if exists certificate_owner_or_scope on public.certificates;
drop policy if exists audit_scope_read on public.audit_logs;
drop policy if exists application_documents_owner_read on public.application_documents;
drop policy if exists application_history_scope_read on public.application_status_history;
drop policy if exists measurements_assigned_read on public.inspection_measurements;
drop policy if exists evidence_assigned_read on public.inspection_evidence;
drop policy if exists documents_owner_read on public.documents;
drop policy if exists application_drafts_owner on public.application_drafts;

create policy lmos_scope_read on public.lmos for select using (
  user_id = auth.uid()
  or public.current_role() = 'SYSTEM_ADMIN'
  or (public.current_role() = 'ASSISTANT_CONTROLLER' and district_id = public.current_district())
);

create policy instrument_owner_or_scope on public.instruments for select using (
  business_id = public.current_business_uuid()
  or public.current_role() = 'SYSTEM_ADMIN'
  or (public.current_role() = 'ASSISTANT_CONTROLLER' and district_id = public.current_district())
  or exists (
    select 1 from public.verification_applications a
    where a.instrument_id = instruments.id
      and a.assigned_lmo_id = public.current_lmo_uuid()
  )
);

create policy application_owner_or_scope on public.verification_applications for select using (
  business_id = public.current_business_uuid()
  or assigned_lmo_id = public.current_lmo_uuid()
  or public.current_role() = 'SYSTEM_ADMIN'
  or (public.current_role() = 'ASSISTANT_CONTROLLER' and district_id = public.current_district())
);

create policy inspection_assigned_or_scope on public.inspections for select using (
  lmo_id = public.current_lmo_uuid()
  or public.current_role() = 'SYSTEM_ADMIN'
  or (
    public.current_role() = 'ASSISTANT_CONTROLLER'
    and exists (
      select 1 from public.verification_applications a
      where a.id = inspections.application_id
        and a.district_id = public.current_district()
    )
  )
);

create policy certificate_owner_or_scope on public.certificates for select using (
  business_id = public.current_business_uuid()
  or public.current_role() = 'SYSTEM_ADMIN'
  or exists (
    select 1 from public.verification_applications a
    where a.id = certificates.application_id
      and (
        a.assigned_lmo_id = public.current_lmo_uuid()
        or (public.current_role() = 'ASSISTANT_CONTROLLER' and a.district_id = public.current_district())
      )
  )
);

create policy audit_scope_read on public.audit_logs for select using (
  actor_user_id = auth.uid()
  or public.current_role() = 'SYSTEM_ADMIN'
  or (public.current_role() = 'ASSISTANT_CONTROLLER' and district_id = public.current_district())
);

create policy application_documents_owner_read on public.application_documents for select using (
  exists (
    select 1 from public.verification_applications a
    where a.id = application_documents.application_id
      and (
        a.business_id = public.current_business_uuid()
        or a.assigned_lmo_id = public.current_lmo_uuid()
        or public.current_role() = 'SYSTEM_ADMIN'
        or (public.current_role() = 'ASSISTANT_CONTROLLER' and a.district_id = public.current_district())
      )
  )
);

create policy application_history_scope_read on public.application_status_history for select using (
  exists (
    select 1 from public.verification_applications a
    where a.id = application_status_history.application_id
      and (
        a.business_id = public.current_business_uuid()
        or a.assigned_lmo_id = public.current_lmo_uuid()
        or public.current_role() = 'SYSTEM_ADMIN'
        or (public.current_role() = 'ASSISTANT_CONTROLLER' and a.district_id = public.current_district())
      )
  )
);

create policy measurements_assigned_read on public.inspection_measurements for select using (
  exists (
    select 1 from public.inspections i
    join public.verification_applications a on a.id = i.application_id
    where i.id = inspection_measurements.inspection_id
      and (
        i.lmo_id = public.current_lmo_uuid()
        or public.current_role() = 'SYSTEM_ADMIN'
        or (public.current_role() = 'ASSISTANT_CONTROLLER' and a.district_id = public.current_district())
      )
  )
);

create policy evidence_assigned_read on public.inspection_evidence for select using (
  exists (
    select 1 from public.inspections i
    join public.verification_applications a on a.id = i.application_id
    where i.id = inspection_evidence.inspection_id
      and (
        i.lmo_id = public.current_lmo_uuid()
        or public.current_role() = 'SYSTEM_ADMIN'
        or (public.current_role() = 'ASSISTANT_CONTROLLER' and a.district_id = public.current_district())
      )
  )
);

create policy documents_owner_read on public.documents for select using (
  uploaded_by = auth.uid()
  or business_id = public.current_business_uuid()
  or public.current_role() = 'SYSTEM_ADMIN'
  or exists (
    select 1 from public.verification_applications a
    where a.id = documents.application_id
      and (
        a.assigned_lmo_id = public.current_lmo_uuid()
        or (public.current_role() = 'ASSISTANT_CONTROLLER' and a.district_id = public.current_district())
      )
  )
  or exists (
    select 1 from public.inspections i
    join public.verification_applications a on a.id = i.application_id
    where i.id = documents.inspection_id
      and (
        i.lmo_id = public.current_lmo_uuid()
        or (public.current_role() = 'ASSISTANT_CONTROLLER' and a.district_id = public.current_district())
      )
  )
);

create policy application_drafts_owner on public.application_drafts for all using (
  user_id = auth.uid() or public.current_role() = 'SYSTEM_ADMIN'
) with check (
  user_id = auth.uid() or public.current_role() = 'SYSTEM_ADMIN'
);
