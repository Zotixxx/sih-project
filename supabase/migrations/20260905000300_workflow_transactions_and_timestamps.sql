-- Transactional workflow helpers and updated_at maintenance.
-- This migration is additive and does not delete application data.

create or replace function public.set_metrix_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_metrix_updated_at();

drop trigger if exists businesses_updated_at on public.businesses;
create trigger businesses_updated_at
before update on public.businesses
for each row execute function public.set_metrix_updated_at();

drop trigger if exists lmos_updated_at on public.lmos;
create trigger lmos_updated_at
before update on public.lmos
for each row execute function public.set_metrix_updated_at();

drop trigger if exists assistant_controllers_updated_at on public.assistant_controllers;
create trigger assistant_controllers_updated_at
before update on public.assistant_controllers
for each row execute function public.set_metrix_updated_at();

drop trigger if exists instruments_updated_at on public.instruments;
create trigger instruments_updated_at
before update on public.instruments
for each row execute function public.set_metrix_updated_at();

drop trigger if exists verification_applications_updated_at on public.verification_applications;
create trigger verification_applications_updated_at
before update on public.verification_applications
for each row execute function public.set_metrix_updated_at();

drop trigger if exists inspections_updated_at on public.inspections;
create trigger inspections_updated_at
before update on public.inspections
for each row execute function public.set_metrix_updated_at();

drop trigger if exists application_drafts_updated_at on public.application_drafts;
create trigger application_drafts_updated_at
before update on public.application_drafts
for each row execute function public.set_metrix_updated_at();

create or replace function public.approve_application_and_generate_certificate(
  p_application_ref text,
  p_actor_user_id uuid,
  p_actor_role public.metrix_role,
  p_valid_from date,
  p_valid_until date,
  p_security_hash text,
  p_official_number text,
  p_public_snapshot jsonb,
  p_remarks text default null
)
returns setof public.certificates
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application public.verification_applications%rowtype;
  v_inspection public.inspections%rowtype;
  v_certificate public.certificates%rowtype;
  v_business_user_id uuid;
begin
  select *
  into v_application
  from public.verification_applications
  where application_id = p_application_ref
     or id::text = p_application_ref
  for update;

  if not found then
    raise exception 'Application not found.' using errcode = 'P0002';
  end if;

  select *
  into v_certificate
  from public.certificates
  where application_id = v_application.id
  for update;

  if found then
    raise exception 'A certificate has already been generated for this application.' using errcode = '23505';
  end if;

  if v_application.status <> 'AWAITING_APPROVAL' then
    raise exception 'Application must be in AWAITING_APPROVAL state.' using errcode = 'P0001';
  end if;

  select *
  into v_inspection
  from public.inspections
  where application_id = v_application.id
  for update;

  if not found then
    raise exception 'Inspection record was not found for this application.' using errcode = 'P0002';
  end if;

  if v_inspection.status <> 'SUBMITTED' then
    raise exception 'Inspection must be submitted before approval.' using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.inspection_measurements
    where inspection_id = v_inspection.id
  ) then
    raise exception 'Inspection measurements are required before certificate approval.' using errcode = 'P0001';
  end if;

  insert into public.certificates (
    certificate_id,
    certificate_number,
    official_number,
    application_id,
    inspection_id,
    business_id,
    district_id,
    status,
    valid_from,
    valid_until,
    security_hash,
    qr_verification_token,
    public_snapshot
  )
  values (
    v_application.application_id,
    v_application.application_id,
    p_official_number,
    v_application.id,
    v_inspection.id,
    v_application.business_id,
    v_application.district_id,
    'VALID',
    p_valid_from,
    p_valid_until,
    p_security_hash,
    v_application.application_id,
    p_public_snapshot
  )
  returning * into v_certificate;

  update public.inspections
  set status = 'APPROVED',
      certificate_id = v_application.application_id,
      certificate_number = v_application.application_id,
      approved_date = p_valid_from
  where id = v_inspection.id;

  update public.verification_applications
  set status = 'CERTIFIED',
      certificate_id = v_application.application_id,
      certificate_number = v_application.application_id,
      certified_at = now()
  where id = v_application.id;

  insert into public.application_status_history (
    application_id,
    from_status,
    to_status,
    actor_user_id,
    reason
  )
  values
    (v_application.id, v_application.status, 'APPROVED', p_actor_user_id, coalesce(p_remarks, 'Verification approved.')),
    (v_application.id, 'APPROVED', 'CERTIFIED', p_actor_user_id, 'Certificate issued.');

  insert into public.audit_logs (
    actor_user_id,
    actor_role,
    district_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values
    (
      p_actor_user_id,
      p_actor_role,
      v_application.district_id,
      'APPLICATION_APPROVED',
      'APPLICATION',
      v_application.application_id,
      jsonb_build_object('inspectionId', v_inspection.inspection_id, 'remarks', p_remarks)
    ),
    (
      p_actor_user_id,
      p_actor_role,
      v_application.district_id,
      'CERTIFICATE_GENERATED',
      'CERTIFICATE',
      v_application.application_id,
      jsonb_build_object('applicationId', v_application.application_id, 'securityHash', p_security_hash)
    );

  select user_id
  into v_business_user_id
  from public.businesses
  where id = v_application.business_id;

  if v_business_user_id is not null then
    insert into public.notifications (
      recipient_user_id,
      category,
      title,
      message,
      related_application_id,
      metadata
    )
    values (
      v_business_user_id,
      'CERTIFICATE_GENERATED',
      'Certificate Issued',
      'Certificate ' || v_application.application_id || ' has been issued for application ' || v_application.application_id || '.',
      v_application.id,
      jsonb_build_object('link', '/' || v_business_user_id::text || '/certificates', 'district_id', v_application.district_id)
    );
  end if;

  return query
  select *
  from public.certificates
  where id = v_certificate.id;
end;
$$;
