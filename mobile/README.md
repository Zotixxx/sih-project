# MetriX Mobile

LMO mobile and tablet application for the MetriX Legal Metrology verification workflow.

This app is intentionally scoped to the Legal Metrology Officer workflow. It does not include GPS-based tracking, GATC workflow, public certificate verification, Business portal features, or Assistant Controller final approval.

## Current Scope

Implemented:

- LMO email/password sign-in through Supabase Auth.
- LMO-only access guard after backend profile lookup.
- Mobile dashboard with assigned, in-progress, and submitted inspections.
- Pull-to-refresh inspection queue.
- Search and status filters.
- Inspection detail view with business, instrument, serial number, capacity, schedule, district, and location.
- Start assigned inspections.
- Add multiple measurement rows.
- Local MPE pass/fail calculation matching the backend unit parsing approach.
- Physical verification checklist.
- Optional camera/gallery evidence upload to the existing `inspection-evidence` Supabase Storage bucket through the Express API.
- Submit inspection findings to the existing backend.
- Read-only submitted/closed inspection records.
- LMO profile and logout.

Not implemented in this mobile scope:

- GPS tracking or GPS stamping.
- Offline SQLite queue.
- Background sync.
- Certificate approval or certificate generation.
- Assistant Controller or Business workflows.
- GATC workflow.

## Architecture

```text
Flutter Android app
  -> Supabase Auth REST API
  -> Render Express API
  -> Supabase PostgreSQL and Storage
```

The app uses the same backend authorization model as the web portal:

- Supabase Auth verifies the officer identity.
- The mobile app sends the Supabase access token to the Express API.
- The Express API loads the authenticated profile and enforces the LMO role.
- LMO inspection access is scoped to inspections assigned to that LMO.

## Required Runtime Configuration

Pass configuration with Flutter dart defines:

```bash
flutter run \
  --dart-define=METRIX_API_BASE_URL=https://sih-project-bpyq.onrender.com/api \
  --dart-define=METRIX_SUPABASE_URL=https://your-project-ref.supabase.co \
  --dart-define=METRIX_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

For Android emulator against a local backend:

```bash
flutter run \
  --dart-define=METRIX_API_BASE_URL=http://10.0.2.2:5001/api \
  --dart-define=METRIX_SUPABASE_URL=https://your-project-ref.supabase.co \
  --dart-define=METRIX_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Do not put the Supabase server secret/service-role key in the mobile app.

## Install and Run

```bash
cd mobile
flutter pub get
flutter run
```

If using the deployed backend, include the dart defines shown above.

## Android Permissions

The Android manifest requests:

- Internet access.
- Network state access.
- Camera/storage access for optional evidence image upload.

It does not request location permissions.

## LMO Workflow

```text
LMO signs in
LMO dashboard loads assigned inspections
LMO opens an inspection
LMO starts the inspection
LMO enters one or more measurement rows
LMO records checklist values
LMO optionally uploads evidence photos
LMO submits verification
Backend moves application to Assistant Controller final review
```

Certificate generation remains controlled by the Assistant Controller approval workflow in the web/backend system.
