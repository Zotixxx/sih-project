# MetriX Supabase Setup

This directory contains the reproducible database and storage setup for MetriX.

## Migration Files

- `20260905000100_initial_metrix_schema.sql`: tables, enums, constraints, indexes, baseline RLS policies, and private storage buckets.
- `20260905000200_runtime_supabase_alignment.sql`: runtime columns, `application_drafts`, tighter role/jurisdiction RLS, and extra indexes.
- `20260905000300_workflow_transactions_and_timestamps.sql`: `updated_at` triggers and the transactional approval RPC `approve_application_and_generate_certificate`.

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

Business accounts can also be created from the web app at `/register/business`. For local testing, either disable Supabase email confirmation temporarily or create the Auth user manually first, sign in, and complete the business profile when redirected.

Government accounts must not be publicly self-registered. Create Assistant Controller, LMO, and System Admin users through the Supabase Dashboard plus SQL below, or through a future server-side admin invitation endpoint that enforces role and district checks.

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

Assistant Controller:

```sql
insert into public.profiles (user_id, role, display_name, district_id, email)
values ('<AC_AUTH_UUID>', 'ASSISTANT_CONTROLLER', 'MetriX Test AC', 'RJ-AJMER', '<ac-email>')
on conflict (user_id) do update
set role = excluded.role,
    display_name = excluded.display_name,
    district_id = excluded.district_id,
    email = excluded.email;

insert into public.assistant_controllers (ac_id, user_id, district_id, name, designation)
values ('AC-TEST-001', '<AC_AUTH_UUID>', 'RJ-AJMER', 'MetriX Test AC', 'Assistant Controller')
on conflict (ac_id) do update
set user_id = excluded.user_id,
    district_id = excluded.district_id,
    name = excluded.name,
    designation = excluded.designation;
```

System Admin:

```sql
insert into public.profiles (user_id, role, display_name, district_id, email)
values ('<ADMIN_AUTH_UUID>', 'SYSTEM_ADMIN', 'MetriX System Admin', 'ALL', '<admin-email>')
on conflict (user_id) do update
set role = excluded.role,
    display_name = excluded.display_name,
    district_id = excluded.district_id,
    email = excluded.email;
```

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
