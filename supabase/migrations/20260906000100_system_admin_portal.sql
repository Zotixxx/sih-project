-- System Admin portal support.
-- Additive migration: no operational data is deleted or reset.

create extension if not exists pg_trgm;

alter table public.profiles
  add column if not exists status text default 'ACTIVE';

update public.profiles
set status = 'ACTIVE'
where status is null;

alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  add constraint profiles_status_check
  check (status in ('ACTIVE', 'INACTIVE')) not valid;

alter table public.assistant_controllers
  add column if not exists jurisdiction text,
  add column if not exists organization text,
  add column if not exists status text default 'ACTIVE';

update public.assistant_controllers
set status = 'ACTIVE'
where status is null;

update public.assistant_controllers ac
set jurisdiction = d.name
from public.districts d
where ac.district_id = d.id
  and ac.jurisdiction is null;

update public.assistant_controllers ac
set organization = coalesce(d.controller_office, 'Office of the Assistant Controller, ' || d.name)
from public.districts d
where ac.district_id = d.id
  and ac.organization is null;

alter table public.assistant_controllers
  drop constraint if exists assistant_controllers_status_check;

alter table public.assistant_controllers
  add constraint assistant_controllers_status_check
  check (status in ('ACTIVE', 'INACTIVE')) not valid;

alter table public.lmos
  add column if not exists status text default 'ACTIVE',
  add column if not exists phone text,
  add column if not exists email text;

update public.lmos
set status = 'ACTIVE'
where status is null;

update public.lmos l
set phone = p.phone,
    email = p.email
from public.profiles p
where l.user_id = p.user_id
  and (l.phone is null or l.email is null);

alter table public.lmos
  drop constraint if exists lmos_status_check;

alter table public.lmos
  add constraint lmos_status_check
  check (status in ('ACTIVE', 'INACTIVE')) not valid;

create index if not exists profiles_role_status_idx
  on public.profiles (role, status);
create index if not exists profiles_email_lower_idx
  on public.profiles (lower(email));
create index if not exists profiles_display_name_trgm_idx
  on public.profiles using gin (display_name gin_trgm_ops);
create index if not exists profiles_email_trgm_idx
  on public.profiles using gin (email gin_trgm_ops);

create index if not exists assistant_controllers_district_idx
  on public.assistant_controllers (district_id);
create index if not exists assistant_controllers_status_idx
  on public.assistant_controllers (status);
create index if not exists assistant_controllers_name_trgm_idx
  on public.assistant_controllers using gin (name gin_trgm_ops);
create index if not exists assistant_controllers_ac_id_trgm_idx
  on public.assistant_controllers using gin (ac_id gin_trgm_ops);
create index if not exists assistant_controllers_jurisdiction_trgm_idx
  on public.assistant_controllers using gin (jurisdiction gin_trgm_ops);
create index if not exists assistant_controllers_organization_trgm_idx
  on public.assistant_controllers using gin (organization gin_trgm_ops);

create index if not exists lmos_district_status_idx
  on public.lmos (district_id, status);
create index if not exists lmos_name_trgm_idx
  on public.lmos using gin (name gin_trgm_ops);
create index if not exists lmos_lmo_id_trgm_idx
  on public.lmos using gin (lmo_id gin_trgm_ops);
create index if not exists lmos_badge_number_trgm_idx
  on public.lmos using gin (badge_number gin_trgm_ops);
create index if not exists lmos_jurisdiction_trgm_idx
  on public.lmos using gin (jurisdiction gin_trgm_ops);

create index if not exists audit_created_at_idx
  on public.audit_logs (created_at desc);
create index if not exists audit_actor_role_idx
  on public.audit_logs (actor_role, created_at desc);
create index if not exists audit_district_created_at_idx
  on public.audit_logs (district_id, created_at desc);
create index if not exists audit_action_trgm_idx
  on public.audit_logs using gin (action gin_trgm_ops);
create index if not exists audit_entity_type_trgm_idx
  on public.audit_logs using gin (entity_type gin_trgm_ops);
create index if not exists audit_entity_id_trgm_idx
  on public.audit_logs using gin (entity_id gin_trgm_ops);

do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'assistant_controllers_one_account_per_district_idx'
  )
  and not exists (
    select 1
    from (
      select district_id
      from public.assistant_controllers
      group by district_id
      having count(*) > 1
    ) duplicate_districts
  ) then
    execute 'create unique index assistant_controllers_one_account_per_district_idx on public.assistant_controllers (district_id)';
  end if;
end $$;

drop policy if exists profiles_self_read on public.profiles;
drop policy if exists lmos_scope_read on public.lmos;
drop policy if exists ac_scope_read on public.assistant_controllers;

create policy profiles_self_read on public.profiles for select using (
  user_id = auth.uid()
  or public.current_role() = 'SYSTEM_ADMIN'
);

create policy lmos_scope_read on public.lmos for select using (
  user_id = auth.uid()
  or public.current_role() = 'SYSTEM_ADMIN'
  or (
    public.current_role() = 'ASSISTANT_CONTROLLER'
    and district_id = public.current_district()
  )
);

create policy ac_scope_read on public.assistant_controllers for select using (
  user_id = auth.uid()
  or public.current_role() = 'SYSTEM_ADMIN'
);
