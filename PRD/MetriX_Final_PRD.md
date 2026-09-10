# MetriX Final Product Requirements Document

**Project:** MetriX - Unified Legal Metrology Verification and Digital Certification Platform  
**Problem Statement Source:** Smart India Hackathon - Legal Metrology digital verification and certification system  
**Document Type:** Final PRD and requirement-fit assessment  
**Version:** 1.0  
**Date:** 10 September 2026  
**Status:** Final project PRD for repository submission  

---

## 1. Executive Summary

MetriX is a secure web and mobile-enabled platform for digitizing the verification, certification, and lifecycle management of weighing and measuring instruments used under Legal Metrology regulations.

The system replaces manual and fragmented workflows with a centralized digital process covering stakeholder registration, instrument registration, verification applications, district-level scrutiny, LMO assignment, field inspection, evidence upload, final approval, QR-enabled certificate generation, public certificate verification, validity tracking, notifications, dashboards, audit logs, and administrative account management.

The implemented SIH prototype focuses on the State Legal Metrology Department workflow:

- Business / instrument owner
- Legal Metrology Officer (LMO)
- Assistant Controller
- System Admin
- Public certificate verifier

Government Approved Test Centre (GATC) workflows are intentionally excluded from this prototype scope by project decision. The architecture leaves room to add GATC as a future role and assignment target.

## 2. Problem Context

Under Legal Metrology requirements, weighing and measuring instruments used in transactions or protection must be periodically verified and stamped before use. Existing workflows often depend on physical applications, manual scheduling, paper-based inspection records, locally maintained registers, and manually issued certificates.

These fragmented processes create delays, weak visibility across jurisdictions, difficult record retrieval, and limited transparency for businesses, regulators, and consumers.

MetriX addresses this by creating a unified digital workflow and trusted digital certificate repository with QR-based public verification.

## 3. Product Vision

Create a traceable digital lifecycle for every regulated weighing or measuring instrument, from business registration and application submission to field verification, certificate issuance, public verification, expiry monitoring, and re-verification.

```text
Business Registration
        |
Instrument Registration
        |
Verification / Re-verification Application
        |
Assistant Controller Review
        |
LMO Assignment and Scheduling
        |
Field Inspection and Measurement Entry
        |
Final Review and Sanction
        |
QR-enabled Digital Certificate
        |
Public Verification and Validity Tracking
        |
Expiry / Re-verification Workflow
```

## 4. Goals

1. Digitize application submission for verification and re-verification.
2. Maintain a centralized repository of businesses, instruments, applications, inspections, documents, and certificates.
3. Provide role-based secure access for business users, LMOs, Assistant Controllers, and System Admins.
4. Support district-scoped review, scheduling, and assignment of field verification activities.
5. Enable digital field inspection with measurement entry, checklist capture, and evidence upload.
6. Generate digital certificates with QR codes and integrity metadata.
7. Provide public certificate verification through QR scan or certificate ID search.
8. Track certificate validity and show expired status after validity ends.
9. Provide dashboards for applications, inspections, certificates, pendency, and expiring certificates.
10. Maintain audit logs for administrative and workflow actions.

## 5. Non-Goals and Explicit Scope Decisions

The following items are not part of the current SIH prototype:

- GATC workflows, GATC registration, and GATC assignment. This was intentionally skipped.
- Full production deployment on government infrastructure.
- Integration with external government identity systems.
- SMS, WhatsApp, or email gateway integration for production alerts.
- Full multilingual support.
- Offline-first production mobile sync with conflict resolution.
- Complete statutory rule engine for every instrument category.
- Payment gateway integration.
- Digital signature certificate integration through a licensed e-sign provider.

## 6. User Roles

### 6.1 Business / Instrument Owner

Business users can:

- Register and log in securely.
- Complete business profile details.
- Register weighing or measuring instruments.
- Upload purchase bills and supporting documents.
- Submit verification or re-verification applications.
- Track application status.
- View issued certificates.
- Monitor certificate validity.
- Access notifications.

### 6.2 Legal Metrology Officer

LMOs can:

- Log in using administrator-provisioned credentials.
- View assigned inspections.
- Start field inspection.
- Record physical verification checklist values.
- Enter multiple load verification measurements.
- Upload evidence photos or documents.
- Submit inspection findings to the Assistant Controller.
- View submitted verification records.

### 6.3 Assistant Controller

Assistant Controllers can:

- Review fresh applications within their district.
- Accept or reject applications with reasons.
- Assign accepted applications to LMOs.
- Review submitted inspection reports.
- Return inspections for correction.
- Sanction final certificates.
- Create LMO accounts for their district.
- Search certificates and verification records.

### 6.4 System Admin

System Admins can:

- View platform-level dashboard and health status.
- Create and manage Assistant Controller accounts.
- Search and inspect LMO accounts.
- View audit logs.
- Monitor administrative activity.

### 6.5 Public / Consumer

Public users can:

- Open a QR verification URL without login.
- Search or scan a certificate ID.
- View certificate status, certificate details, validity period, instrument details, and issuing authority.
- See `EXPIRED` when a certificate is opened after its valid-until date.

## 7. Core Product Modules

### 7.1 Authentication and Role-Based Access

MetriX uses Supabase Auth for identity and an Express backend for trusted role resolution. Roles are stored in the `profiles` table and enforced server-side.

Supported roles:

- `BUSINESS`
- `LMO`
- `ASSISTANT_CONTROLLER`
- `SYSTEM_ADMIN`

Protected portal routes are scoped by authenticated user ID. The frontend never supplies a trusted role for authorization.

### 7.2 Business Profile and Instrument Management

The system supports business onboarding, profile completion, instrument registration, purchase bill upload, instrument listing, and instrument detail views.

Instrument records include:

- Instrument ID
- Instrument type/category
- Manufacturer
- Model
- Serial number
- Capacity
- Accuracy class
- Location
- Purchase bill reference
- Current verification status

### 7.3 Application Workflow

Business users submit online applications for:

- First-time verification
- Re-verification

Applications include instrument selection, applicant details, verification location, preferred schedule information, supporting documents, and notes for field verification.

Application lifecycle:

```text
SUBMITTED
  -> UNDER_REVIEW
  -> ACCEPTED / REJECTED
  -> SCHEDULED
  -> UNDER_VERIFICATION
  -> AWAITING_APPROVAL
  -> CERTIFIED / RETURNED / REJECTED
```

### 7.4 Scheduling and LMO Assignment

Assistant Controllers review fresh applications and assign field verification to district LMOs. The selected LMO receives the inspection assignment and can start field verification.

The current prototype supports LMO assignment. GATC assignment is not included by scope decision.

### 7.5 Digital Field Inspection

LMOs can record field verification digitally through the inspection page.

Supported inspection data:

- Physical verification checklist
- Multiple measurement rows
- Test load
- Indicated value
- Allowable MPE
- Computed error
- Computed pass/fail result
- Evidence document or photo upload

Measurement pass/fail is calculated on the frontend for officer feedback and recalculated on the backend before storage. Certificate sanction is blocked if any measurement fails.

### 7.6 Certificate Generation

Assistant Controllers can sanction submitted inspections. The backend generates a certificate only after:

- The application is awaiting approval.
- The inspection exists.
- The inspection is submitted.
- At least one measurement exists.
- No measurement has failed.
- A duplicate certificate does not already exist.

Generated certificate data includes:

- Certificate ID / number
- Official number
- Application reference
- Instrument details
- Business/owner details
- Verification date
- Valid-from date
- Valid-until date
- Issuing authority
- Verifying officer
- Approving officer
- Security hash
- Public certificate snapshot
- QR verification reference

### 7.7 QR-Based Public Verification

Each certificate includes a QR code that opens a public verification URL.

The public verification page shows:

- Valid / expired certificate state
- Certificate number
- Instrument name/type
- Serial number
- Capacity
- Registered business
- Location
- Verification date
- Valid-until date
- Issuing authority
- Integrity hash

If the certificate validity has ended, opening the QR link shows the certificate as `EXPIRED`.

### 7.8 Validity Tracking and Expiry Handling

Certificates include a `valid_until` date. The backend computes effective certificate status at read time:

- `VALID` if current date is on or before `valid_until`.
- `EXPIRED` if current date is after `valid_until`.
- `REVOKED` remains revoked if explicitly revoked.

Dashboards count expiring certificates within the defined upcoming expiry window.

### 7.9 Notifications and Alerts

The system includes an in-app notification model and notification pages. Workflow notifications are generated for events such as application submission, assignment, inspection submission, return, and administrative notices.

External channels such as SMS, email reminders, and WhatsApp are future integrations.

### 7.10 Dashboards and Monitoring

Dashboards are role-specific.

Business dashboard:

- Applications count
- Instruments count
- Certificates count
- Active/pending workflow status

LMO dashboard:

- Assigned inspections
- In-progress inspections
- Submitted inspections
- Completed inspection counts

Assistant Controller dashboard:

- New applications
- Accepted applications
- Scheduled verifications
- Awaiting final approval
- Completed verifications
- Active LMOs
- Expiring certificates

System Admin dashboard:

- Assistant Controller count
- LMO count
- Business count
- Auth/database/storage/API health cards

### 7.11 Search, Retrieval, Export, and Printing

The system supports:

- Certificate search by certificate number, business name, serial number, and related references.
- Application and inspection listing with search and filters.
- Public certificate lookup by QR/certificate ID.
- Certificate print output using an A4-optimized print view.
- Report summary endpoints for dashboard/reporting use.

PDF download and advanced report export are future enhancements. Certificate printing is implemented.

### 7.12 Mobile Field Support

The repository includes a Flutter-based LMO field unit prototype with:

- Officer login screen
- Dashboard
- Inspection detail screen
- Checklist update
- Measurement update
- Photo record support
- GPS coordinate update
- Local database helper
- Sync queue concept

The responsive web LMO inspection flow is production-connected to the backend. The Flutter app demonstrates mobile field support and can be connected to the same backend APIs in a future phase.

## 8. Requirement Satisfaction Matrix

| SIH Requirement | Current Status | Evidence in Product |
| --- | --- | --- |
| Online registration of stakeholders | Mostly satisfied | Business self-registration exists. Government users are provisioned by admins. GATC intentionally skipped. |
| Online submission of verification/re-verification applications | Satisfied | Business application workflow supports first-time verification and re-verification. |
| Scheduling and allocation to LMOs or GATCs | Partially satisfied | LMO assignment and scheduling are implemented. GATC assignment is intentionally out of scope. |
| Digital verification certificates with QR codes | Satisfied | Certificates include QR codes and public verification URLs. |
| Digital recording of inspection observations and results | Satisfied | LMO inspection form records checklist, measurements, calculated pass/fail, and evidence. |
| Tracking validity and due dates | Satisfied | Certificates store validity dates and show expired after validity ends. Dashboards count expiring certificates. |
| Alerts/reminders for expiring validity | Partially satisfied | In-app notifications and expiring certificate counts exist. External reminder channels are future scope. |
| Dashboards for monitoring status and pendency | Satisfied | Role-specific dashboards exist for business, LMO, Assistant Controller, and System Admin. |
| Mobile support for field verification | Partially satisfied | Responsive web field flow is connected. Flutter mobile prototype exists, but full production API sync is future scope. |
| Digital repository of certificates and instrument records | Satisfied | Supabase PostgreSQL stores instruments, applications, inspections, documents, and certificates. |
| QR code authentication system | Satisfied | Anonymous public endpoint verifies certificate records and effective status. |
| Search and retrieval of records/certificates | Satisfied | Certificate, application, inspection, LMO, AC, and audit search/list flows exist. |
| Role-based secure login | Satisfied | Supabase Auth plus backend role enforcement and scoped frontend routes. |
| Upload photographs/supporting documents | Satisfied | Document upload and attachment flows exist for instruments, applications, and inspections. |
| Export and printing facility | Partially satisfied | Certificate printing is implemented. Full PDF/report export is future enhancement. |
| Technical documentation | Satisfied | README plus this PRD document cover architecture, security, scope, and deployment basics. |

## 9. Overall Requirement Fit

MetriX satisfies the core SIH problem statement as a functional prototype for a unified online Legal Metrology verification and digital certification system.

The strongest fulfilled areas are:

- Role-based workflow management
- Business registration and instrument onboarding
- Online verification/re-verification applications
- District Assistant Controller review
- LMO assignment
- Digital inspection entry
- Evidence upload
- Final approval workflow
- QR-enabled certificate generation
- Public certificate verification
- Validity expiry handling
- Dashboards and auditability

The known intentional or prototype-level gaps are:

- GATC workflows are intentionally skipped.
- External alert delivery is not integrated.
- Flutter mobile app is a field prototype, while the connected production workflow is currently the responsive web app.
- Certificate PDF download and advanced report exports are future improvements.

Conclusion: The project is suitable for SIH submission as a strong web-first implementation of the stated requirement, provided the presentation clearly explains the intentional GATC exclusion and positions mobile as a working prototype/future extension.

## 10. Functional Requirements

### FR-1 Business Registration

Business users shall be able to create an authenticated account and complete their business profile before applying for verification.

Acceptance criteria:

- A new business can register using email/password.
- Business profile completion is required before application submission.
- Business data is stored in Supabase-backed domain tables.

### FR-2 Instrument Registration

Business users shall be able to register regulated instruments.

Acceptance criteria:

- Required fields include instrument name, serial number, and capacity.
- Purchase bill upload is required.
- Instrument details are viewable after creation.

### FR-3 Verification Application

Business users shall be able to submit first-time verification and re-verification applications.

Acceptance criteria:

- Application must reference an owned instrument.
- Verification location must include district information.
- Supporting documents can be attached.
- Application moves to `SUBMITTED` status.

### FR-4 Application Review

Assistant Controllers shall be able to review, accept, reject, and assign applications.

Acceptance criteria:

- District scope is enforced.
- Rejection requires a reason.
- Accepted applications can be assigned to LMOs.
- Status history and audit entries are recorded.

### FR-5 LMO Inspection

LMOs shall be able to complete digital field inspections.

Acceptance criteria:

- Assigned LMO can start inspection.
- Physical checklist can be recorded.
- Multiple measurement values can be entered.
- Each measurement stores computed error and pass/fail.
- Evidence documents can be uploaded.
- Inspection can be submitted for final review.

### FR-6 Final Approval and Certificate Generation

Assistant Controllers shall be able to approve submitted inspections and generate certificates.

Acceptance criteria:

- Certificate is generated only from submitted inspections.
- Duplicate certificate generation is blocked.
- Failed measurements block sanction.
- Certificate includes validity period and QR verification data.

### FR-7 Public Certificate Verification

Public users shall be able to verify certificates by QR or certificate ID.

Acceptance criteria:

- Public verification does not require login.
- Valid certificates show verified status.
- Expired certificates show expired status after `valid_until`.
- Certificate details and integrity hash are displayed.

### FR-8 Dashboards and Notifications

Each role shall receive a dashboard relevant to its responsibilities.

Acceptance criteria:

- Business sees instruments/applications/certificates.
- LMO sees assigned and submitted inspections.
- Assistant Controller sees pendency and verification pipeline.
- System Admin sees account counts and system health.
- Notifications are available in-app.

### FR-9 Administration

System Admins and Assistant Controllers shall manage government accounts according to their authority.

Acceptance criteria:

- System Admin can create Assistant Controller accounts.
- Assistant Controller can create LMO accounts within district scope.
- Account creation is performed through backend admin APIs.
- Audit logs are recorded.

## 11. Architecture

```text
Next.js Web Portal
        |
        | HTTPS REST calls
        v
Express API
        |
        | service/repository layer
        v
Supabase
  - Auth
  - PostgreSQL
  - Storage
  - RLS policies
  - RPC workflow transactions

Flutter LMO Field Prototype
        |
        | Future API sync / local queue
        v
Express API / Supabase
```

### Frontend

- Next.js 16
- React
- Tailwind CSS
- Role-scoped pages and navigation
- Public verification pages
- Certificate preview and print UI

### Backend

- Node.js
- Express
- Service/repository architecture
- Supabase server-side admin client
- Auth middleware
- District and role authorization
- Audit logging

### Database and Storage

- Supabase PostgreSQL stores operational records.
- Supabase Storage stores uploaded documents and evidence.
- Migrations define schema and reproducible setup.

## 12. Security Requirements

1. Authentication must be handled by Supabase Auth.
2. Protected APIs must require a Supabase access token.
3. User role must be resolved from backend-trusted profile records.
4. Business users must only access their own records.
5. LMOs must only access assigned inspections.
6. Assistant Controllers must only access district-scoped records.
7. System Admins can perform platform administration.
8. Public certificate verification must expose only safe public certificate fields.
9. Server-side services must enforce workflow transitions.
10. Audit logs must capture sensitive workflow and admin actions.

## 13. Data Entities

Primary entities:

- `profiles`
- `businesses`
- `assistant_controllers`
- `lmos`
- `districts`
- `instruments`
- `verification_applications`
- `application_documents`
- `application_status_history`
- `inspections`
- `inspection_measurements`
- `inspection_evidence`
- `documents`
- `certificates`
- `notifications`
- `audit_logs`

## 14. Success Metrics

For an SIH prototype demonstration, success is measured by:

- Business can complete profile and register an instrument.
- Business can submit a verification/re-verification application.
- Assistant Controller can accept and assign it.
- LMO can submit digital inspection with multiple measurements.
- Assistant Controller can approve and generate a QR certificate.
- Public QR verification opens the certificate without login.
- Certificate shows expired after validity ends.
- Dashboards show the status pipeline.
- Audit records are generated for key actions.

## 15. Deployment Methodology

Local development:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend/web
npm install
npm run dev
```

Production deployment model:

1. Deploy Supabase project.
2. Apply database migrations.
3. Configure Supabase Auth and Storage.
4. Deploy Express API with server-only Supabase service key.
5. Deploy Next.js frontend with public Supabase and API URLs.
6. Configure CORS and environment variables.
7. Bootstrap System Admin profile.
8. Import district reference data.

## 16. Future Enhancements

1. Add GATC role and assignment workflow.
2. Add external SMS/email reminder delivery.
3. Add PDF certificate download.
4. Add advanced reports and downloadable CSV/PDF exports.
5. Connect Flutter mobile app directly to production APIs.
6. Add offline-first mobile sync with conflict handling.
7. Add digital signature provider integration.
8. Add multilingual support.
9. Add payment and fee management if required by department workflow.
10. Add stronger statutory rule templates per instrument category.

## 17. Final Assessment

MetriX is aligned with the SIH problem statement and satisfies the primary requirement: a unified online verification and digital certification system for weighing and measuring instruments.

The implementation is best described as:

- Complete for the core web-based business, LMO, Assistant Controller, System Admin, certificate, QR verification, and dashboard workflows.
- Partial for external reminders, advanced exports, and production mobile integration.
- Intentionally not covering GATC workflows in this prototype.

This positioning should be clearly stated during demo and evaluation so the scope decision is understood as deliberate rather than accidental.
