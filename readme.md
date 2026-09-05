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
```

The Next middleware checks the Supabase session, verifies `{userId}` equals the Auth UUID, reads `profiles.role`, and gates the route by role. Legacy unscoped routes redirect into the scoped URL.

Business users may create a new account from `/register/business`. That flow uses Supabase Auth signup, loads configured districts from the Express API, then creates a `BUSINESS` profile and `businesses` domain record. Government users are not self-registered from the public UI.

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

## Testing

Static checks:

```bash
cd backend
find src -name '*.js' -exec node --check {} \;
node --check test_e2e_scenarios.js
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

## Current Notes

The previous SQLite runtime and seeded user files have been removed from source. Three ignored SQLite binary files may remain under `backend/src/data` if a local process holds them open; they are not imported by the backend and are ignored by `.gitignore`.
