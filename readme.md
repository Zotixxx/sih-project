# MetriX

Legal Metrology Digital Verification and Certification Platform for SIH 2026.

MetriX is now structured as one Supabase-backed system:

```text
Next.js web portal
  -> Express REST API
  -> services and repositories
  -> Supabase PostgreSQL

Supabase also provides Auth, private Storage, and RLS.
```

The runtime source of truth is Supabase PostgreSQL. The web UI must not use local mock arrays, local user roles, or seeded demo records for operational workflows.
District reference data comes from `backend/src/db/india_states_districts.csv` and can be imported with `cd backend && npm run import:districts`.

## Applications

- `frontend/web`: Next.js, JavaScript, Tailwind CSS, shadcn-style local UI components.
- `backend`: Node.js and Express API layer.
- `supabase/migrations`: reproducible PostgreSQL schema, RLS, storage buckets, triggers, and workflow RPCs.
- `mobile`: Flutter field-app prototype. The production web/API migration does not depend on it.

## Roles

The system supports exactly:

- `BUSINESS`
- `LMO`
- `ASSISTANT_CONTROLLER`
- `SYSTEM_ADMIN`

Roles are resolved from `profiles.role` after Supabase Auth verifies the user. The frontend never supplies a trusted role.

## Auth And Routing

Supabase Auth is the identity provider. Protected portal URLs use the authenticated Auth UUID:

```text
/{userId}/dashboard
/{userId}/applications
/{userId}/certificates
/{userId}/instruments
/{userId}/notifications
/{userId}/settings
/{userId}/inspections
/{userId}/verification-details
/{userId}/fresh-applications
/{userId}/verify
/{userId}/lmos
/{userId}/assistant-controllers
/{userId}/audit-logs
```

The Next middleware checks the Supabase session, verifies `{userId}` equals the Auth UUID, reads `profiles.role`, and gates the route by role. Legacy unscoped routes redirect into the scoped URL.

Business users may create a new account from `/register/business`. The first step only creates the Supabase Auth email/password account. After email verification and sign-in, the app redirects missing business profiles to `/register/business?complete=1`, loads configured districts from the Express API, then creates the `BUSINESS` profile and `businesses` domain record. Government users are not self-registered from the public UI.

System Admin users are bootstrap-created through Supabase Auth plus a `profiles` row with role `SYSTEM_ADMIN`. After login, the System Admin portal uses:

```text
/{adminAuthUuid}/dashboard
/{adminAuthUuid}/assistant-controllers
/{adminAuthUuid}/lmos
/{adminAuthUuid}/audit-logs
/{adminAuthUuid}/settings
```

System Admin navigation is limited to Dashboard, Assistant Controllers, LMOs, Audit Logs, and Settings. Assistant Controller application workflow pages remain separate.

## Environment Variables

Backend `.env`:

```env
PORT=5001
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=your-server-only-service-role-key
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
CORS_ORIGIN=http://localhost:3000
```

Frontend `frontend/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Never put `SUPABASE_SECRET_KEY` in frontend code. Do not commit real `.env` files.

## Local Setup

Install dependencies:

```bash
cd backend
npm install
cd ../frontend/web
npm install
```

Apply Supabase migrations first, then run:

```bash
cd backend
npm run import:districts
```

```bash
cd backend
npm run dev
```

```bash
cd frontend/web
npm run dev
```

Open `http://localhost:3000`.

## Workflow

The intended production flow is:

```text
Business completes profile
Business registers instrument with purchase bill
Business selects verification State/District and submits application
Application is stored under the selected district jurisdiction
Assistant Controller for that district reviews fresh applications
Assistant Controller accepts and assigns an LMO
LMO sees assigned inspection
LMO records measurements/findings/evidence
LMO submits verification
Assistant Controller performs final review
Assistant Controller approves
Backend transaction creates certificate
Certificate ID = Application ID
Business sees certificate
Certificate QR opens /verify/{certificateId}
```

Certificates are never generated at submission or initial acceptance. Duplicate certificate generation is blocked by database uniqueness and the approval RPC.

## API Structure

Protected API requests require `Authorization: Bearer <Supabase access token>`.

- `GET /api/auth/profile`: authenticated profile and role record.
- `POST /api/auth/register-business`: authenticated Supabase user completes a BUSINESS profile.
- `GET /api/public/districts`: public state/district reference list for registration.
- `GET /api/dashboard/stats`: role-scoped dashboard counts.
- `GET/PUT /api/business/profile`: business profile.
- `GET/POST/PUT /api/instruments`: business instruments and purchase bill association.
- `GET/POST /api/applications`: application list and submission.
- `POST /api/applications/:id/accept`: AC initial acceptance.
- `POST /api/applications/:id/reject`: AC rejection with reason.
- `POST /api/applications/:id/assign`: AC accept-and-assign workflow.
- `GET/POST /api/inspections`: LMO/AC inspection workflow.
- `GET /api/approvals/awaiting`: AC final review queue.
- `POST /api/approvals/approve`: transactional final approval and certificate generation.
- `POST /api/approvals/return`: AC return to LMO with reason.
- `GET /api/certificates`: role-scoped certificate list.
- `GET /api/certificates/search?q=...`: authenticated database search.
- `GET /api/public/certificates/:id`: anonymous QR verification projection.
- `POST /api/documents/upload`: private Supabase Storage upload metadata.
- `GET /api/admin/dashboard`: System Admin counts and health checks.
- `GET /api/admin/assistant-controllers?search=...&districtId=...`: limited server-side AC search.
- `POST /api/admin/assistant-controllers`: create an AC district account using the server-side Supabase admin API.
- `GET /api/admin/assistant-controllers/:id`: fetch one AC district account.
- `PATCH /api/admin/assistant-controllers/:id`: edit current officer details/status without creating a new Auth account.
- `GET /api/admin/lmos?search=...&districtId=...`: limited server-side LMO search.
- `GET /api/admin/lmos/:id`: fetch one LMO administrative profile.
- `GET /api/admin/audit-logs?...`: paginated read-only audit log search.

## System Admin Portal

The System Admin portal is intentionally simple:

- Dashboard counts come from Supabase-backed API counts for Assistant Controllers, active LMOs, and businesses.
- Health cards call lightweight checks for Supabase Auth, database, Storage, and the Express API.
- Assistant Controllers is search-first and does not load the full directory on page open.
- Creating an Assistant Controller creates a Supabase Auth user, `profiles` row, and `assistant_controllers` row from the backend only.
- The Assistant Controller account represents a stable district account. Officer details can be edited later without changing the Auth user, district, or account email.
- LMOs is search-first for System Admin and supports district/status filters.
- Audit Logs is read-only and paginated.

## Testing

Static checks:

```bash
cd backend
find src -name '*.js' -exec node --check {} \;
node --check test_e2e_scenarios.js
node --check test_admin_scenarios.js
```

```bash
cd frontend/web
npm run lint
npm run build
```

Golden Supabase workflow test:

```bash
cd backend
METRIX_API_BASE_URL=http://localhost:5001/api \
SUPABASE_URL=https://your-project-ref.supabase.co \
SUPABASE_PUBLISHABLE_KEY=your-publishable-key \
METRIX_TEST_BUSINESS_EMAIL=business@example.com \
METRIX_TEST_BUSINESS_PASSWORD=... \
METRIX_TEST_AC_EMAIL=ac@example.com \
METRIX_TEST_AC_PASSWORD=... \
METRIX_TEST_LMO_EMAIL=lmo@example.com \
METRIX_TEST_LMO_PASSWORD=... \
METRIX_TEST_INSTRUMENT_ID=INS-TEST-001 \
METRIX_TEST_APPLICATION_ID=APP-TEST-001 \
METRIX_TEST_LMO_ID=LMO-TEST-001 \
npm test
```

Use a disposable Supabase project or a clean set of domain IDs for the golden test.

System Admin workflow test:

```bash
cd backend
METRIX_API_BASE_URL=http://localhost:5001/api \
SUPABASE_URL=https://your-project-ref.supabase.co \
SUPABASE_PUBLISHABLE_KEY=your-publishable-key \
METRIX_TEST_ADMIN_EMAIL=admin@example.com \
METRIX_TEST_ADMIN_PASSWORD=... \
METRIX_ADMIN_TEST_AC_EMAIL=ac.southdelhi@metrix.com \
METRIX_ADMIN_TEST_AC_PASSWORD=... \
METRIX_ADMIN_TEST_DISTRICT_ID=DL-SOUTH_DELHI \
npm run test:admin
```

Optional negative checks are included if these credentials are also set: `METRIX_TEST_BUSINESS_EMAIL`, `METRIX_TEST_BUSINESS_PASSWORD`, `METRIX_TEST_LMO_EMAIL`, `METRIX_TEST_LMO_PASSWORD`, `METRIX_TEST_AC_EMAIL`, `METRIX_TEST_AC_PASSWORD`.

## Current Notes

The previous SQLite runtime and seeded user files have been removed from source. Three ignored SQLite binary files may remain under `backend/src/data` if a local process holds them open; they are not imported by the backend and are ignored by `.gitignore`.
