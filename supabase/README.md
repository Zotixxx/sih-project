# MetriX Supabase Setup

This directory contains the reproducible database and storage setup for MetriX.

## Migration Files

- `20260905000100_initial_metrix_schema.sql`: tables, enums, constraints, indexes, baseline RLS policies, and private storage buckets.
- `20260905000200_runtime_supabase_alignment.sql`: runtime columns, `application_drafts`, tighter role/jurisdiction RLS, and extra indexes.
- `20260905000300_workflow_transactions_and_timestamps.sql`: `updated_at` triggers and the transactional approval RPC `approve_application_and_generate_certificate`.
- `20260906000100_system_admin_portal.sql`: System Admin support columns, account status fields, AC/LMO/audit search indexes, and admin-aligned RLS policy refresh.

No migration inserts operational application, business, officer, certificate, inspection, notification, or audit data.

## Required Environment Variables

Backend only:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=<service-role-secret>
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

Frontend-safe:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

Never expose `SUPABASE_SECRET_KEY` to browser code.

## Apply Migrations

Preferred CLI workflow:

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push
```

Dashboard SQL Editor fallback:

1. Open SQL Editor in the Supabase Dashboard.
2. Run `supabase/migrations/20260905000100_initial_metrix_schema.sql`.
3. Run `supabase/migrations/20260905000200_runtime_supabase_alignment.sql`.
4. Run `supabase/migrations/20260905000300_workflow_transactions_and_timestamps.sql`.
5. Run `supabase/migrations/20260906000100_system_admin_portal.sql`.

Do not run a destructive reset against a project that contains meaningful data.

## Dashboard Configuration

Authentication:

- Enable Email/Password provider.
- Create users manually in Authentication > Users.
- Keep email confirmation settings consistent with how you plan to test sign-in.

Storage:

- Confirm these private buckets exist:
  - `business-documents`
  - `instrument-documents`
  - `inspection-evidence`
- Do not mark the buckets public.
- The Express API creates signed URLs when private file access is needed.

## Create Districts

Create jurisdiction rows before role-specific records. The Business registration page reads this table through `GET /api/public/districts`, so users select a configured State/District instead of typing a district code.

To import the complete India state/district reference CSV:

```bash
cd backend
npm run import:districts
```

The importer reads `backend/src/db/india_states_districts.csv`, creates stable IDs such as `RJ-AJMER`, and upserts rows into `public.districts`. Use this instead of manually typing every district.

```sql
insert into public.districts (id, name, state, zone, controller_office)
values ('TEST', 'Test District', 'Test State', 'Test Zone', 'Office of the Assistant Controller, Test District')
on conflict (id) do update
set name = excluded.name,
    state = excluded.state,
    zone = excluded.zone,
    controller_office = excluded.controller_office;
```

For Ajmer/Rajasthan testing after running the CSV importer, use the generated district ID `RJ-AJMER`:

```sql
insert into public.districts (id, name, state, zone, controller_office)
values ('RJ-AJMER', 'Ajmer', 'Rajasthan', 'Ajmer Zone', 'Office of the Assistant Controller, Ajmer')
on conflict (id) do update
set name = excluded.name,
    state = excluded.state,
    zone = excluded.zone,
    controller_office = excluded.controller_office;
```

## Create Users And Domain Records

After creating each Supabase Auth user, copy its `auth.users.id`.

Business accounts can also be created from the web app at `/register/business`. The first screen only creates the Supabase Auth email/password account. After email verification and sign-in, users without a MetriX profile are redirected to `/register/business?complete=1` to enter business details and create the `BUSINESS` profile/domain record. For local testing, either keep email confirmation enabled and follow the email link, or temporarily disable confirmation in a disposable project.

Government accounts must not be publicly self-registered.

Bootstrap the first System Admin through the Supabase Dashboard plus SQL below. After that, create Assistant Controller district accounts from the System Admin portal at `/{adminAuthUuid}/assistant-controllers`; the backend creates the Supabase Auth user and database profile using the server-only key.

LMO accounts remain an Assistant Controller responsibility in the operational workflow. System Admin can search/view LMOs for oversight but does not create them from the admin page.

Business:

```sql
insert into public.profiles (user_id, role, display_name, district_id, email)
values ('<BUSINESS_AUTH_UUID>', 'BUSINESS', 'MetriX Test Business', 'RJ-AJMER', '<business-email>')
on conflict (user_id) do update
set role = excluded.role,
    display_name = excluded.display_name,
    district_id = excluded.district_id,
    email = excluded.email;

insert into public.businesses (
  business_id,
  user_id,
  district_id,
  name,
  contact_person,
  phone,
  email,
  address,
  city,
  state,
  pincode,
  gstin
)
values (
  'BUS-TEST-001',
  '<BUSINESS_AUTH_UUID>',
  'RJ-AJMER',
  'MetriX Test Business',
  'MetriX Test Owner',
  '9000000000',
  '<business-email>',
  'Test Registered Office',
  'Test City',
  'Test State',
  '000000',
  '00TESTGSTIN1Z0'
)
on conflict (business_id) do update
set user_id = excluded.user_id,
    district_id = excluded.district_id,
    name = excluded.name,
    contact_person = excluded.contact_person,
    phone = excluded.phone,
    email = excluded.email,
    address = excluded.address,
    city = excluded.city,
    state = excluded.state,
    pincode = excluded.pincode,
    gstin = excluded.gstin;
```

LMO:

```sql
insert into public.profiles (user_id, role, display_name, district_id, email)
values ('<LMO_AUTH_UUID>', 'LMO', 'MetriX Test LMO', 'RJ-AJMER', '<lmo-email>')
on conflict (user_id) do update
set role = excluded.role,
    display_name = excluded.display_name,
    district_id = excluded.district_id,
    email = excluded.email;

insert into public.lmos (lmo_id, user_id, district_id, name, designation, badge_number, jurisdiction)
values ('LMO-TEST-001', '<LMO_AUTH_UUID>', 'RJ-AJMER', 'MetriX Test LMO', 'Legal Metrology Officer', 'LMO-TEST-001', 'Ajmer')
on conflict (lmo_id) do update
set user_id = excluded.user_id,
    district_id = excluded.district_id,
    name = excluded.name,
    designation = excluded.designation,
    badge_number = excluded.badge_number,
    jurisdiction = excluded.jurisdiction;
```

Assistant Controller fallback SQL:

Prefer the System Admin portal/API for new Assistant Controller accounts. Use this SQL only when bootstrapping or repairing a test environment after manually creating the Supabase Auth user.

```sql
insert into public.profiles (user_id, role, display_name, district_id, email, status)
values ('<AC_AUTH_UUID>', 'ASSISTANT_CONTROLLER', 'MetriX Test AC', 'RJ-AJMER', '<ac-email>', 'ACTIVE')
on conflict (user_id) do update
set role = excluded.role,
    display_name = excluded.display_name,
    district_id = excluded.district_id,
    email = excluded.email,
    status = excluded.status;

insert into public.assistant_controllers (
  ac_id,
  user_id,
  district_id,
  name,
  designation,
  jurisdiction,
  organization,
  status
)
values (
  'AC-TEST-001',
  '<AC_AUTH_UUID>',
  'RJ-AJMER',
  'MetriX Test AC',
  'Assistant Controller',
  'Ajmer',
  'Office of the Assistant Controller, Ajmer',
  'ACTIVE'
)
on conflict (ac_id) do update
set user_id = excluded.user_id,
    district_id = excluded.district_id,
    name = excluded.name,
    designation = excluded.designation,
    jurisdiction = excluded.jurisdiction,
    organization = excluded.organization,
    status = excluded.status;
```

System Admin:

```sql
insert into public.profiles (user_id, role, display_name, district_id, email, status)
values ('<ADMIN_AUTH_UUID>', 'SYSTEM_ADMIN', 'MetriX System Admin', 'ALL', '<admin-email>', 'ACTIVE')
on conflict (user_id) do update
set role = excluded.role,
    display_name = excluded.display_name,
    district_id = excluded.district_id,
    email = excluded.email,
    status = excluded.status;
```

## System Admin Account Creation

1. Create the first admin user in Supabase Authentication > Users.
2. Copy the Auth user UUID.
3. Insert the `SYSTEM_ADMIN` profile row shown above.
4. Start backend and frontend with the required environment variables.
5. Log in through the Authority tab.
6. Open `/{adminAuthUuid}/assistant-controllers`.
7. Create district AC accounts with district, account email, current officer name, phone, and a temporary password.
8. Share the temporary password privately and rotate/reset it through Supabase Auth when needed.

Creating an Assistant Controller from the portal writes:

- one Supabase Auth user
- one `profiles` row with role `ASSISTANT_CONTROLLER`
- one `assistant_controllers` district-account row
- one `audit_logs` entry

Editing the current officer later updates the existing `profiles` and `assistant_controllers` rows. It does not create another Auth user.

## Domain ID Rules

- Supabase Auth identity: `auth.users.id`, stored as `profiles.user_id`.
- Human-readable MetriX IDs stay separate:
  - `businesses.business_id`
  - `lmos.lmo_id`
  - `assistant_controllers.ac_id`
  - `instruments.instrument_id`
  - `verification_applications.application_id`
  - `certificates.certificate_id`
- For an approved application, `certificates.certificate_id = verification_applications.application_id`.

## Application District Routing

Applications are routed by `verification_applications.district_id`. The business application form sends the selected verification district ID from the `districts` table, and the backend validates it before insert. Assistant Controller queues use the AC user's `profiles.district_id`, so an AC with `district_id = 'RJ-AJMER'` receives applications submitted for Ajmer.

## RLS Smoke Checks

Use the Supabase Dashboard API docs or SQL Editor with JWT impersonation to verify:

```sql
select * from public.profiles;
select * from public.instruments;
select * from public.verification_applications;
select * from public.inspections;
select * from public.certificates;
select * from public.notifications;
```

Expected behavior:

- Business users see only their own business, instruments, applications, certificates, documents, drafts, and notifications.
- LMOs see only assigned applications/inspections and related records.
- Assistant Controllers see district-scoped applications, inspections, certificates, and LMOs.
- `SYSTEM_ADMIN` can inspect administrative records.
- System Admin can use `/api/admin/*`; Business, LMO, and Assistant Controller users must receive `403` from those endpoints.
- Anonymous users cannot browse protected tables.
- Anonymous QR verification goes through `GET /api/public/certificates/:id`, not a general table/browser endpoint.

## Golden Workflow Test

Start backend and frontend with real environment variables, then run:

```bash
cd backend
METRIX_API_BASE_URL=http://localhost:5001/api \
SUPABASE_URL=https://<project-ref>.supabase.co \
SUPABASE_PUBLISHABLE_KEY=<publishable-key> \
METRIX_TEST_BUSINESS_EMAIL=<business-email> \
METRIX_TEST_BUSINESS_PASSWORD=<business-password> \
METRIX_TEST_AC_EMAIL=<ac-email> \
METRIX_TEST_AC_PASSWORD=<ac-password> \
METRIX_TEST_LMO_EMAIL=<lmo-email> \
METRIX_TEST_LMO_PASSWORD=<lmo-password> \
METRIX_TEST_INSTRUMENT_ID=INS-TEST-001 \
METRIX_TEST_APPLICATION_ID=APP-TEST-001 \
METRIX_TEST_LMO_ID=LMO-TEST-001 \
npm test
```

The script signs in with Supabase Auth, calls the Express API with bearer tokens, and verifies the application-to-certificate ID rule.
