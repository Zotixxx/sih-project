# MetriX — Product Requirements Document

**Project:** MetriX — Legal Metrology Digital Verification & Certification Platform  
**Competition:** Smart India Hackathon 2026  
**Document Version:** 1.0  
**Status:** Product Definition / Architecture  
**Platform:** Web + Mobile  
**Domain:** Legal Metrology / Government Digital Services

---

## 1. Executive Summary

MetriX is a unified digital platform designed to digitize the lifecycle of weighing and measuring instruments regulated under Legal Metrology.

The platform enables businesses/instrument owners to register instruments, submit verification and re-verification applications, track application status, receive verification certificates, and monitor certificate validity.

Legal Metrology Officers (LMOs) and Government Approved Test Centres (GATCs) receive and perform assigned verification activities through digital workflows. Field officers can record inspection observations, measurements, photographs, location information, and verification results.

Administrators manage stakeholders, applications, scheduling, assignments, monitoring, certificates, and audit trails.

The system additionally provides digitally verifiable certificates containing QR codes, allowing consumers and authorized users to independently verify certificate status.

The long-term objective is to create a traceable, secure, centralized and extensible digital ecosystem for Legal Metrology verification.

---

## 2. Problem Statement

The current Legal Metrology verification process can involve manual or fragmented activities such as:

- Verification application submission
- Inspection scheduling
- LMO/GATC allocation
- Inspection observation recording
- Certificate issuance
- Record maintenance
- Certificate validity monitoring
- Re-verification

Fragmentation can lead to:

- Delays
- Difficulty retrieving historical records
- Limited visibility into pending applications
- Difficulty monitoring expiry
- Fragmented verification history
- Increased administrative workload
- Limited transparency

MetriX proposes a unified digital workflow covering the complete verification lifecycle.

---

## 3. Product Vision

> **Create a trusted digital lifecycle for every regulated weighing and measuring instrument—from registration and verification to certification, public verification, expiry and re-verification.**

```text
Digital Registration
        ↓
Online Application
        ↓
Digital Scheduling
        ↓
Field Verification
        ↓
Digital Evidence
        ↓
Verification Result
        ↓
Digital Certificate
        ↓
QR Verification
        ↓
Validity Monitoring
        ↓
Re-verification
```

---

## 4. Product Goals

1. Digitize verification and re-verification workflows.
2. Maintain centralized digital records for instruments.
3. Provide role-specific interfaces.
4. Enable digital scheduling and assignment.
5. Support field verification.
6. Maintain inspection evidence.
7. Generate digital verification certificates.
8. Provide QR-based certificate verification.
9. Track certificate validity and expiry.
10. Maintain verification history.
11. Maintain audit trails.
12. Reduce administrative effort and manual record handling.

---

## 5. Non-Goals for the Initial Prototype

The SIH prototype will not initially attempt to become a complete nationwide government deployment.

Out of scope for the initial MVP:

- Full integration with all existing government systems
- Nationwide deployment
- Production-grade government hosting
- Complete coverage of every Legal Metrology instrument category
- Automated legal decision-making
- AI-based autonomous verification
- Full multilingual deployment
- Complete SMS infrastructure
- Advanced predictive analytics
- Automatic statutory-rule interpretation

These may be considered future extensions.

---

## 6. Target Users

### 6.1 Business / Instrument Owner

Responsibilities:

- Manage account
- Register instruments
- Submit applications
- Upload documents
- Track applications
- View certificates
- Monitor expiry
- Apply for re-verification

### 6.2 Legal Metrology Officer — LMO

Responsibilities:

- Secure login
- View assigned inspections
- Access instrument/application details
- View schedule
- Conduct inspection
- Record measurements
- Record observations
- Capture evidence
- Record location
- Submit results

### 6.3 Government Approved Test Centre — GATC

Responsibilities:

- Receive assignments
- Access instrument information
- Perform applicable testing
- Record results
- Upload evidence
- Submit verification reports
- Maintain history

### 6.4 Administrator

Responsibilities:

- Manage stakeholders
- Manage LMOs
- Manage GATCs
- Review applications
- Assign verification activities
- Schedule inspections
- Monitor pending work
- Monitor expiry
- View analytics
- Access audit logs

### 6.5 Public / Consumer

No account required.

Capabilities:

- Scan QR code
- Verify certificate
- Determine validity
- View basic certificate information

---

## 7. Identity & Account Model

### 7.1 Business Accounts

For the SIH MVP, a business does **not** require a multi-user organization/member system.

```text
Business Account
      │
      ├── Instruments
      ├── Applications
      ├── Certificates
      └── Documents
```

A single business account can manage its instruments.

Future production versions may support multiple employees/users within a business.

### 7.2 LMO Accounts

LMOs cannot self-register.

Their accounts are provisioned by the appropriate administrative authority.

```text
Administrative Authority
          ↓
Creates / provisions LMO account
          ↓
LMO receives credentials
          ↓
LMO Login
```

There should be no public "Create LMO account" option.

### 7.3 Government Organizations

Government-side users require organizational context.

```text
Legal Metrology Department
        │
        ├── Regional Office
        │       ├── LMO
        │       └── LMO
        │
        └── District Office
                ├── LMO
                └── LMO
```

This enables jurisdiction, assignment and administrative access rules.

---

## 8. Roles & Authorization

Initial roles:

```text
BUSINESS
LMO
GATC
ADMIN
```

Role determines what a user can do.

Data ownership/scope determines which records they can access.

```text
Role
 ↓
What can I do?

Data Scope
 ↓
Which records can I access?
```

Authorization must be enforced by the backend and database, not only by hiding UI elements.

---

## 9. Core User Journeys

### 9.1 Business Registration

```text
Login
   ↓
Create Business Account
   ↓
Business Information
   ↓
Contact Information
   ↓
Address
   ↓
Account Credentials
   ↓
Registration Complete
   ↓
Business Dashboard
```

### 9.2 Business Instrument Lifecycle

```text
Business Login
      ↓
Dashboard
      ↓
Register Instrument
      ↓
Instrument Record Created
      ↓
Submit Verification Application
      ↓
Application Review
      ↓
Scheduling
      ↓
LMO/GATC Assignment
      ↓
Verification
      ↓
Result
      ↓
Certificate
      ↓
Validity Tracking
      ↓
Re-verification
```

### 9.3 LMO Workflow

```text
LMO Login
    ↓
LMO Dashboard
    ↓
Assigned Inspection
    ↓
Inspection Details
    ↓
Start Inspection
    ↓
Instrument Verification
    ↓
Measurements
    ↓
Observations
    ↓
Photo Evidence
    ↓
GPS / Location
    ↓
Review
    ↓
PASS / FAIL / REQUIRES REVIEW
    ↓
Submit
```

### 9.4 Admin Workflow

```text
Admin Login
      ↓
Dashboard
      ↓
Application Queue
      ↓
Review Application
      ↓
Select LMO / GATC
      ↓
Schedule Verification
      ↓
Monitor Progress
      ↓
Review Result
      ↓
Certificate / Rejection
```

### 9.5 Public Certificate Workflow

```text
Certificate
    ↓
QR Code
    ↓
Public Verification
    ↓
Certificate Lookup
    ↓
VALID / EXPIRED / REVOKED / NOT FOUND
```

---

## 10. Functional Requirements

### FR-01 — Authentication

#### Business

- Login
- Registration
- Logout
- Password recovery
- Session management

#### LMO

- Login only
- No public self-registration

#### Admin

- Login only
- Provision/manage authorized accounts

#### Public

- No authentication required for QR verification

### FR-02 — Business Registration

The system shall allow businesses to create accounts.

Potential information:

- Business name
- Registration number
- Business type
- Contact person
- Email
- Phone
- Address
- State
- District
- City
- Pincode
- Login credentials

Actual mandatory fields must be validated against final regulatory requirements.

### FR-03 — Instrument Registration

Businesses shall be able to register instruments.

Initial data model:

- Instrument ID
- Instrument type
- Manufacturer
- Model
- Serial number
- Capacity
- Capacity unit
- Accuracy class where applicable
- Location
- Registration date
- Status

### FR-04 — Instrument Search

Authorized users shall be able to search using:

- Instrument ID
- Serial number
- Certificate ID
- Owner
- Instrument type
- Location
- Verification status

### FR-05 — Verification Application

Businesses shall be able to submit:

- Initial verification
- Re-verification

Applications support:

- Instrument selection
- Application type
- Location
- Preferred date/time
- Documents
- Notes
- Submission

### FR-06 — Application Workflow

```text
DRAFT
 ↓
SUBMITTED
 ↓
UNDER_REVIEW
 ↓
SCHEDULED
 ↓
UNDER_VERIFICATION
 ↓
PASSED / FAILED
```

Every significant status transition must be recorded.

### FR-07 — Document Management

The system shall support supporting-document uploads.

Store metadata such as:

- File name
- File type
- File size
- Storage path
- Uploading user
- Upload timestamp
- File integrity hash where required

Files should reside in object storage rather than PostgreSQL.

### FR-08 — Scheduling

Administrators shall schedule verification activities based on:

- Application
- Instrument
- Location
- Date
- Time
- Assigned LMO/GATC
- Availability
- Current workload

### FR-09 — LMO/GATC Assignment

Assignment records should maintain:

- Assigned person/organization
- Assigned by
- Assignment timestamp
- Scheduled date
- Location
- Assignment status
- Reassignment/rescheduling information

### FR-10 — Field Verification

The system shall support:

- Instrument information
- Inspection checklist
- Measurement entry
- Observations
- Remarks
- Photographs
- GPS
- Timestamp
- Supporting evidence
- Result submission

### FR-11 — Offline Field Verification

The mobile application should support field verification without connectivity.

```text
Inspection Assigned
       ↓
Download Required Data
       ↓
Field Inspection
       ↓
Local Storage
       ↓
No Internet
       ↓
Continue Working
       ↓
Internet Available
       ↓
Synchronization
       ↓
Backend
```

Synchronization should eventually handle:

- Failed uploads
- Retry
- Duplicate prevention
- Conflict handling
- Sync status

### FR-12 — Inspection Evidence

LMOs should be able to capture:

- Instrument photographs
- Serial number photographs
- Display/measurement photographs
- Stamping/sealing evidence
- Supporting documents

Evidence should be linked to:

```text
Application
    ↓
Inspection
    ↓
Instrument
```

### FR-13 — Inspection Measurements

The system should support structured measurement/test results.

The architecture should support configurable inspection templates:

```text
Instrument Type
      ↓
Inspection Template
      ↓
Checklist / Parameters
      ↓
Observed Values
      ↓
Result
```

Statutory parameters must be validated from official rules/specifications before being treated as regulatory requirements.

### FR-14 — Verification Result

Potential results:

```text
PASS
FAIL
REQUIRES_REVIEW
```

The authority permitted to finalize a result must be configurable according to the actual departmental workflow.

### FR-15 — Digital Certificate

Upon successful verification, the system shall generate a digital certificate containing, as applicable:

- Certificate ID
- Instrument ID
- Owner
- Instrument type
- Manufacturer
- Model
- Serial number
- Verification date
- Valid until
- Verification result
- Issuing authority
- QR code

### FR-16 — QR Verification

Each digital certificate shall have a unique QR code.

```text
QR
 ↓
Certificate ID / Secure Token
 ↓
Public API
 ↓
Authoritative Certificate Record
 ↓
Verification Result
```

### FR-17 — Certificate Status

The system shall support:

```text
VALID
EXPIRED
REVOKED
```

Public lookup failure:

```text
NOT FOUND
```

### FR-18 — Certificate Integrity

Potential mechanisms:

- SHA-256 hash
- Certificate hash
- Unique certificate ID
- Audit trail
- Digital signatures in future production architecture

### FR-19 — Validity & Expiry

Track:

- Certificate issue date
- Valid-from date
- Expiry date
- Current status

Example prototype configuration:

```text
30 days before
      ↓
Reminder

7 days before
      ↓
Urgent Reminder

Expired
      ↓
Re-verification Required
```

Exact validity periods and notification thresholds must be configurable and legally validated.

### FR-20 — Notifications

Potential events:

- Application submitted
- Application reviewed
- Verification scheduled
- Inspection assigned
- Verification completed
- Certificate generated
- Certificate expiring
- Certificate expired
- Re-verification required

Channels:

- In-app
- Email
- Push notification

### FR-21 — Dashboards

#### Business Dashboard

- Total instruments
- Valid instruments
- Expiring soon
- Expired
- Pending applications
- Approved
- Rejected
- Upcoming verification

#### LMO Dashboard

- Assigned inspections
- Today's inspections
- Pending verification
- Completed verification

#### Admin Dashboard

- Total instruments
- Total applications
- Pending applications
- Verified instruments
- Expired instruments
- Active LMOs
- Active GATCs
- District-wise statistics

### FR-22 — Audit Trail

Important system actions shall be recorded.

Example:

```text
User:
LMO-102

Action:
Verification Approved

Application:
APP-2026-00192

Previous Status:
UNDER_VERIFICATION

New Status:
APPROVED

Timestamp:
...
```

---

## 11. Page / Screen Architecture

### Public

1. Login
2. Business Registration
3. Forgot Password
4. Reset Password
5. Public Certificate Verification
6. Certificate Invalid / Not Found
7. Certificate Expired
8. Certificate Revoked

### Business

9. Business Dashboard
10. Instrument List
11. Register Instrument
12. Instrument Details
13. Instrument Verification History
14. Application List
15. New Verification Application
16. Application Details
17. Application Documents
18. Certificate List
19. Certificate Details
20. Profile / Settings
21. Notifications

### LMO

22. LMO Dashboard
23. Assigned Inspections
24. Inspection Details
25. Start Inspection
26. Inspection Checklist
27. Measurements / Observations
28. Evidence Capture
29. Location Confirmation
30. Inspection Review
31. Submit Result
32. Inspection History

### GATC

33. GATC Dashboard
34. Assigned Applications
35. Verification Details
36. Test / Inspection Entry
37. Evidence Upload
38. Submit Verification
39. Verification History

### Admin

40. Admin Dashboard
41. Application Management
42. Application Details
43. Scheduling Calendar
44. Assignment Interface
45. LMO Management
46. GATC Management
47. Instrument Management
48. Certificate Management
49. Reports
50. Audit Logs
51. System Settings

---

## 12. SIH MVP Page Set

We should **not build all 51 screens initially**.

### Authentication

1. Login
2. Business Registration

### Business

3. Business Dashboard
4. Instrument List
5. Register Instrument
6. Instrument Details
7. Application List
8. New Verification Application
9. Application Details

### Admin

10. Admin Dashboard
11. Application Management
12. Scheduling / Assignment

### LMO

13. LMO Dashboard
14. Assigned Inspections
15. Inspection Details
16. Inspection Form
17. Inspection Review / Submit

### Certificate

18. Certificate Details
19. Public QR Verification

### Supporting

20. Notifications

This is the **SIH vertical slice**, not the final production scope.

---

## 13. Database Requirements

The database should model the actual domain rather than simply mirroring UI pages.

### Core Entities

```text
profiles
businesses
government_organizations
government_memberships

instrument_types
manufacturers
locations

instruments
instrument_location_history

verification_applications
application_documents
application_status_history

verification_assignments

inspections
inspection_templates
inspection_template_items
inspection_measurements
inspection_evidence

certificates
certificate_verification_logs

notifications
audit_logs
```

### Key Relationships

```text
Business
   │
   └── Instruments
          │
          └── Verification Applications
                    │
                    └── Assignments
                              │
                              └── Inspections
                                    ├── Measurements
                                    ├── Evidence
                                    └── Result
                                          │
                                          ▼
                                      Certificate
                                          │
                                          ▼
                                   QR Verification
```

Government:

```text
Government Organization
        │
        ├── LMO
        ├── LMO
        └── GATC
```

A business account does not need a complex multi-user organization model for the MVP, while government-side organizational structure is important.

---

## 14. Technology Architecture

### Web

**Next.js + JavaScript**

Responsibilities:

- Business portal
- Admin portal
- LMO/GATC web interfaces where appropriate
- Public certificate verification
- Responsive UI

### UI

- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod where useful
- Recharts for analytics

### Backend

**Node.js + Express.js**

Responsibilities:

- Business logic
- Workflow management
- Authorization
- Application state transitions
- Scheduling
- Certificate generation
- Audit events
- Secure APIs
- Integration layer

Critical business rules must not exist only in the client.

---

## 15. Database / Infrastructure

### Supabase

#### PostgreSQL

Primary relational database.

#### Supabase Auth

Authentication and identity management.

#### Supabase Storage

Stores:

- Photos
- Supporting documents
- Certificate PDFs
- Other uploaded evidence

#### Supabase Realtime

Optional future capability for:

- Live dashboard updates
- Assignment changes
- Notifications

---

## 16. Supabase Deployment Strategy

Supabase is being used for the **SIH prototype to accelerate development**.

It should not be presented as a permanent government deployment decision.

The architecture should maintain separation between:

```text
Application Business Logic
        ↓
Express API
        ↓
Infrastructure
```

This allows future migration to government-controlled infrastructure.

---

## 17. Mobile Architecture

The LMO field application will use:

**Flutter + Dart**

Primary responsibilities:

- LMO authentication
- Assigned inspections
- Instrument details
- Inspection checklist
- Measurements
- Camera/evidence capture
- GPS
- Offline storage
- Synchronization
- Verification result submission

---

## 18. Offline Architecture

```text
Flutter
   ↓
Local SQLite
   ↓
Inspection Data
   ↓
Sync Manager
   ↓
Internet?
 ┌─┴─┐
NO  YES
│    │
Local Upload
     ↓
Express API
     ↓
Supabase
```

Offline synchronization must eventually address:

- Retry
- Duplicate submission
- Conflict resolution
- Sync state
- Failed uploads

---

## 19. Security Requirements

Because the platform manages regulatory records and certificates, security is a core requirement.

### Authentication

- Supabase Auth
- Secure sessions
- Password recovery
- Session expiration

### Authorization

- RBAC
- Backend authorization
- Supabase Row Level Security
- Data-scope validation

### API

- HTTPS
- Input validation
- Authorization checks
- Rate limiting where required
- Secure error handling

### Files

- Restricted storage
- File type validation
- File size limits
- Access-controlled URLs
- Malware/security scanning strategy for production

### Auditability

Important actions should generate audit records.

---

## 20. Certificate Security

Certificate security should include:

```text
Certificate ID
     +
QR Token
     +
Database Record
     +
SHA-256 Hash
     +
Audit Trail
```

The public QR page should **not trust information supplied directly by the QR code**.

Instead:

```text
QR
 ↓
Secure identifier
 ↓
Server lookup
 ↓
Authoritative certificate record
 ↓
Status
```

This prevents a QR code from simply carrying arbitrary certificate information.

---

## 21. UI/UX Requirements

MetriX should look like a **modern government digital service**, not an outdated government portal.

### Visual principles

- Professional
- Trustworthy
- Clean
- Accessible
- Modern
- High information clarity
- Strong visual hierarchy

Avoid:

- Excessive gradients
- Excessive glassmorphism
- Unnecessary animations
- Overly decorative dashboards
- Excessive rounded cards
- Dense unexplained data

---

## 22. Navigation

Authenticated desktop applications should use role-specific navigation.

Example:

```text
Sidebar
 ├── Dashboard
 ├── Instruments
 ├── Applications
 ├── Inspections
 ├── Certificates
 ├── Schedule
 ├── Notifications
 ├── Reports
 └── Settings
```

---

## 23. Design System

A reusable design system should be established before generating the complete UI.

Components:

- Buttons
- Inputs
- Selects
- Date pickers
- Tables
- Cards
- Status badges
- Alerts
- Modals
- Toasts
- Timeline
- File upload
- Calendar
- QR certificate card
- Empty states
- Loading states
- Error states

---

## 24. Status Design

### Positive

```text
VERIFIED
APPROVED
VALID
COMPLETED
```

### Pending

```text
DRAFT
SUBMITTED
UNDER_REVIEW
SCHEDULED
```

### Warning

```text
EXPIRING_SOON
REQUIRES_REVIEW
```

### Negative

```text
REJECTED
FAILED
EXPIRED
REVOKED
CANCELLED
```

---

## 25. Dashboard Requirements

Dashboards should not merely display attractive statistics.

Every metric should connect to an actionable workflow.

Example:

```text
3 Expiring Certificates
        ↓
Click
        ↓
List of instruments
        ↓
Re-verification
```

Similarly:

```text
12 Pending Applications
        ↓
Click
        ↓
Application Queue
```

---

## 26. Search Requirements

Search should support:

- Instrument ID
- Serial number
- Certificate ID
- Owner/business
- Instrument type
- Location
- Verification status

Filters should be contextual to the user's role.

---

## 27. Certificate Verification UX

The public page should prioritize trust.

Example:

```text
METRIX

Certificate Verification

             ✓
       CERTIFICATE VALID

Certificate ID
LM-2026-001238

Instrument
Electronic Weighing Instrument

Serial Number
XYZ12345

Verified On
26 Aug 2026

Valid Until
25 Aug 2027

Issuing Authority
[Authority]
```

The page should clearly communicate:

- Valid
- Expired
- Revoked
- Not found

---

## 28. Notifications

Notifications should be event-driven.

```text
Application submitted
        ↓
Notification

Verification scheduled
        ↓
Notification

Certificate issued
        ↓
Notification

Certificate nearing expiry
        ↓
Notification
```

---

## 29. Auditability

The system should preserve a history of important actions.

Examples:

- User login
- Application submission
- Application status change
- Assignment
- Rescheduling
- Inspection submission
- Certificate generation
- Certificate revocation
- User/role changes

Audit logs should be append-oriented and should not be casually editable through normal application workflows.

---

## 30. API Architecture

The Express backend should expose domain-oriented APIs.

```text
/api/auth
/api/businesses
/api/instruments
/api/applications
/api/assignments
/api/inspections
/api/certificates
/api/verification
/api/notifications
/api/admin
```

The exact API structure can evolve during implementation.

### Example Operations

#### Instruments

```text
GET    /api/instruments
GET    /api/instruments/:id
POST   /api/instruments
PATCH  /api/instruments/:id
```

#### Applications

```text
GET    /api/applications
GET    /api/applications/:id
POST   /api/applications
PATCH  /api/applications/:id
POST   /api/applications/:id/submit
```

#### Assignments

```text
GET    /api/assignments
POST   /api/assignments
PATCH  /api/assignments/:id
```

#### Inspections

```text
GET    /api/inspections/:id
POST   /api/inspections
PATCH  /api/inspections/:id
POST   /api/inspections/:id/submit
```

#### Certificates

```text
GET    /api/certificates
GET    /api/certificates/:id
GET    /api/certificates/:id/download
```

#### Public Verification

```text
GET    /api/public/certificates/:token
```

---

## 31. State Machine

The application state machine should be treated as a core business rule.

```text
DRAFT
  │
  ▼
SUBMITTED
  │
  ▼
UNDER_REVIEW
  │
  ├──────────────→ REJECTED
  │
  ▼
SCHEDULED
  │
  ▼
UNDER_VERIFICATION
  │
  ├──────────────→ FAILED
  │
  ▼
PASSED
  │
  ▼
CERTIFICATE ISSUED
  │
  ▼
VALID
  │
  ▼
EXPIRED
  │
  ▼
RE-VERIFICATION
```

Actual transitions and authorization must be validated against the final departmental workflow.

---

## 32. Business Rules

### Instrument

- Instrument ID must be unique.
- Serial number should be validated where appropriate.
- Instrument belongs to one business account.
- Instrument can have multiple verification events over its lifecycle.

### Application

- Application must reference an instrument.
- Application must have an applicant.
- Application cannot be submitted without required information.
- Application status transitions must be controlled.
- Every significant status change should be recorded.

### Inspection

- Inspection must be linked to an application/assignment.
- Evidence must be associated with the inspection.
- Final result requires completion of required fields.
- Submitted inspections should not be silently overwritten.

### Certificate

- Certificate must reference a successful verification event.
- Certificate ID must be unique.
- Certificate status must be managed consistently.
- Revocation must record who revoked it and why.

---

## 33. Data Integrity

The system should enforce:

- Primary keys
- Foreign keys
- Unique constraints
- Required fields
- Valid enum/status values
- Referential integrity
- Timestamps
- Audit records
- Hashes where appropriate

---

## 34. Performance Requirements

For the SIH prototype:

- Dashboard operations should feel responsive.
- Tables should use pagination.
- Search should be indexed.
- Large evidence files should not be loaded unnecessarily.
- Images should use optimized thumbnails where appropriate.
- API responses should avoid unnecessary fields.

Production performance targets require real workload testing.

---

## 35. Reliability

The prototype should handle:

- Network failures
- API errors
- File upload failures
- Mobile sync failures
- Expired sessions
- Invalid requests
- Duplicate submissions

The UI should provide understandable error messages.

---

## 36. Accessibility

The UI should aim for accessible design:

- Sufficient contrast
- Keyboard navigation
- Clear focus states
- Descriptive labels
- Accessible form validation
- Semantic structure
- Avoid relying only on color for status

---

## 37. Testing Strategy

Testing should occur throughout development.

### Frontend

- Component tests
- Form validation
- Role-based UI behavior
- Error states
- Loading states

### Backend

- API tests
- Authentication tests
- Authorization tests
- Workflow tests
- Validation tests

### Database

- Relationship integrity
- Constraint testing
- RLS testing
- Transaction behavior

### Mobile

- Offline operation
- Sync
- Camera permissions
- GPS permissions
- Failed synchronization

### Security

- Authentication bypass
- Unauthorized access
- RLS bypass attempts
- File upload security
- Input validation
- Certificate integrity

---

## 38. Development Strategy

Build **vertical slices**, not isolated technology layers.

### Avoid

```text
Build entire frontend
      ↓
Build entire backend
      ↓
Build database
      ↓
Connect everything
```

### Preferred

```text
Business Registration
       ↓
Business Dashboard
       ↓
Instrument Registration
       ↓
Application
       ↓
Admin Assignment
       ↓
LMO Inspection
       ↓
Certificate
       ↓
QR Verification
```

This produces an end-to-end demonstrable system early.

---

## 39. Development Phases

### Phase 1 — Foundation

- Repository
- Next.js
- Express
- Supabase
- Authentication
- Database foundation
- Design system
- RBAC architecture

### Phase 2 — Business

- Business registration
- Business dashboard
- Instrument registration
- Instrument list
- Instrument details
- Application creation
- Application tracking

### Phase 3 — Government Workflow

- Admin dashboard
- Application management
- Scheduling
- LMO assignment
- LMO dashboard
- Inspection workflow

### Phase 4 — Certification

- Certificate generation
- PDF generation
- QR generation
- Public verification
- Certificate status

### Phase 5 — Mobile

- Flutter
- LMO login
- Assigned inspections
- Field inspection
- Camera
- GPS
- Offline storage
- Synchronization

### Phase 6 — Monitoring

- Expiry tracking
- Notifications
- Analytics
- Reports
- Audit logs

---

## 40. Future Features

### AI-Assisted Inspection

- Instrument recognition
- OCR
- Anomaly detection
- Image-assisted inspection

### Advanced Analytics

- Geographic compliance heatmaps
- District-level analytics
- Officer workload analysis
- Verification trends

### Government Integration

- Existing government databases
- State systems
- National systems
- Government identity systems

### Communication

- SMS
- Multilingual interface
- Additional officially appropriate notification channels

### Deployment

- Government-controlled cloud
- On-premise deployment
- State-level deployment
- National-scale deployment

---

## 41. Innovation Strategy

MetriX should not position itself merely as:

> "An online application form."

The differentiation should come from the **complete trusted lifecycle**.

### 1. Instrument-Centric Lifecycle

```text
Instrument
   ↓
Entire historical lifecycle
```

### 2. Traceable Verification

```text
Application
 ↓
Assignment
 ↓
Officer
 ↓
Location
 ↓
Inspection
 ↓
Evidence
 ↓
Result
 ↓
Certificate
```

### 3. Digital Evidence

Photos, measurements, location and timestamps become linked to the inspection record.

### 4. Public Certificate Verification

A consumer can independently check certificate status.

### 5. Offline Field Verification

LMOs can continue field work despite connectivity limitations.

### 6. Auditability

Important changes are traceable.

These features form the basis of the innovation story. Their actual novelty should be validated against competing solutions before the final SIH submission.

---

## 42. Feasibility

The prototype is feasible using established technologies:

```text
Next.js
Express
PostgreSQL / Supabase
Flutter
REST APIs
Object Storage
QR Codes
```

The main technical challenges are:

- Domain modeling
- Workflow design
- Secure authorization
- Evidence handling
- Offline synchronization
- Certificate integrity
- Multi-stakeholder workflows

---

## 43. Major Risks

### Risk 1 — Regulatory Assumptions

**Problem:** Incorrect assumptions about verification procedures or certificate fields.

**Mitigation:** Validate requirements against official Legal Metrology rules, notifications and departmental procedures.

### Risk 2 — Too Many Features

**Problem:** Attempting to build the entire platform may produce an incomplete prototype.

**Mitigation:** Prioritize the end-to-end MVP.

### Risk 3 — Offline Synchronization Complexity

**Problem:** Offline systems can create conflicts and duplicate submissions.

**Mitigation:** Implement controlled synchronization for the prototype and document advanced conflict handling for future versions.

### Risk 4 — Security

**Problem:** Regulatory records must not be freely editable.

**Mitigation:**

- Supabase Auth
- RLS
- Express authorization
- Audit logs
- Controlled state transitions
- Hashing

### Risk 5 — Supabase Dependency

**Problem:** Government production deployment may not use Supabase.

**Mitigation:** Keep business logic inside Express and treat Supabase as the prototype infrastructure layer.

---

## 44. Team Development Structure

| Area | Responsibility |
|---|---|
| Architecture / Coordination | Project Lead |
| Backend | API, database, workflow |
| Frontend | Next.js application |
| Mobile | Flutter application |
| Security | Auth, RBAC, certificate integrity |
| UI/UX | Design system, screens |
| Documentation | PRD, architecture, SOP, presentation |

---

## 45. Git & Collaboration

The `main` branch should contain stable code.

Feature work should happen in branches:

```text
main
 │
 ├── feature/auth
 ├── feature/business-dashboard
 ├── feature/instruments
 ├── feature/verification
 ├── feature/admin
 ├── feature/lmo-inspection
 ├── feature/certificate
 └── feature/mobile
```

Workflow:

```text
Issue
 ↓
Branch
 ↓
Development
 ↓
Pull Request
 ↓
Code Review
 ↓
Merge
```

---

## 46. Documentation

The repository should eventually contain:

```text
docs/
├── architecture/
│   └── system-architecture.md
│
├── database/
│   ├── er-diagram.md
│   └── schema.md
│
├── api/
│   └── api-documentation.md
│
├── security/
│   └── security-architecture.md
│
├── mobile/
│   └── mobile-architecture.md
│
├── certificates/
│   └── certificate-specification.md
│
├── deployment/
│   └── deployment-guide.md
│
├── testing/
│   └── testing-strategy.md
│
├── sop/
│   └── standard-operating-procedure.md
│
└── user-manual/
    └── user-manual.md
```

---

## 47. Success Criteria

The SIH MVP should demonstrate the following complete flow:

```text
BUSINESS
   │
   ▼
Create Account
   │
   ▼
Register Instrument
   │
   ▼
Submit Verification Application
   │
   ▼
ADMIN
   │
   ▼
Review Application
   │
   ▼
Assign LMO
   │
   ▼
Schedule Inspection
   │
   ▼
LMO
   │
   ▼
Open Assignment
   │
   ▼
Perform Inspection
   │
   ├── Measurements
   ├── Photos
   ├── Location
   └── Remarks
   │
   ▼
Submit Result
   │
   ▼
CERTIFICATE
   │
   ▼
Generate PDF + QR
   │
   ▼
PUBLIC
   │
   ▼
Scan QR
   │
   ▼
✓ Certificate Verified
```

**This is the single most important prototype success criterion.**

---

## 48. Demo Acceptance Criteria

### Business

- Create/login to account
- Register an instrument
- Submit application
- Track application

### Admin

- See application
- Assign LMO
- Schedule inspection

### LMO

- See assignment
- Open instrument
- Perform digital inspection
- Add evidence
- Submit result

### Certificate

- Generate certificate
- Display QR

### Public

- Scan/enter certificate
- Verify certificate
- See status

The demo should show a coherent end-to-end workflow rather than disconnected dashboards.

---

## 49. Product Principles

### 1. Traceability Over Convenience

Regulatory actions should be explainable.

### 2. Security by Design

Authorization should exist at backend/database level, not only in the UI.

### 3. Instrument-Centric Lifecycle

The instrument's history should remain accessible.

### 4. Evidence-Backed Verification

Where applicable, inspection results should have supporting evidence.

### 5. Role-Specific UX

Business users, LMOs and administrators should not see the same interface.

### 6. Prototype Pragmatism

Use established infrastructure to move quickly without compromising the conceptual architecture.

### 7. Regulatory Humility

Never invent statutory requirements.

---

## 50. Current Technology Stack

| Layer | Technology |
|---|---|
| Web | **Next.js + JavaScript** |
| Styling | **Tailwind CSS** |
| UI Components | **shadcn/ui** |
| Forms | **React Hook Form** |
| Validation | **Zod when useful** |
| Backend | **Node.js + Express.js** |
| Database | **Supabase PostgreSQL** |
| Authentication | **Supabase Auth** |
| Authorization | **RBAC + Supabase RLS** |
| Storage | **Supabase Storage** |
| Mobile | **Flutter + Dart** |
| Mobile Local DB | **SQLite** |
| Charts | **Recharts** |
| Maps | **Leaflet + OpenStreetMap** |
| QR | QR-code library |
| Certificate PDF | Puppeteer |
| Notifications | Firebase Cloud Messaging where required |
| API Documentation | OpenAPI / Swagger |
| Version Control | Git + GitHub |
| CI/CD | GitHub Actions |
| Containerization | Docker where useful |

---

## 51. Architecture Overview

```text
                         METRIX
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
          ▼                ▼                 ▼
      Next.js           Flutter           Public
        Web             Mobile           Verification
          │                │                 │
          └────────────────┼─────────────────┘
                           │
                          HTTPS
                           │
                           ▼
                   Express Backend
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │
       ▼                   ▼                    ▼
   Auth/RBAC           Workflow Engine     Certificate
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
                           ▼
                      Supabase
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          PostgreSQL      Auth        Storage
              │
              ▼
         Audit / History
```

---

## 52. Final Product Definition

MetriX is **not simply an online form system**.

Its intended product model is:

> **A unified digital lifecycle management and verification platform for regulated weighing and measuring instruments.**

The fundamental object is the **instrument**, and the platform maintains its lifecycle:

```text
Instrument
    │
    ├── Registration
    │
    ├── Verification Application
    │
    ├── Scheduling
    │
    ├── Field Inspection
    │      ├── Measurements
    │      ├── Evidence
    │      └── Location
    │
    ├── Verification Result
    │
    ├── Certificate
    │      └── QR Verification
    │
    ├── Validity
    │
    └── Re-verification
```

This lifecycle is the core product architecture.

---

## 53. Immediate Development Plan

### Step 1 — Product / Domain

**ER diagram + state machine**

Before creating the actual Supabase schema.

### Step 2 — Design

**MetriX design system**

Then:

```text
Login
↓
Business Registration
↓
Business Dashboard
```

### Step 3 — Database

Convert the approved ER model into:

- PostgreSQL tables
- Constraints
- Indexes
- RLS policies
- Storage buckets

### Step 4 — Backend

Build:

```text
Auth
↓
Business
↓
Instrument
↓
Application
↓
Assignment
↓
Inspection
↓
Certificate
```

### Step 5 — Frontend

Connect UI to real APIs/data instead of building the entire interface around mock data.

### Step 6 — LMO Mobile

Build the field workflow after the underlying inspection model is stable.

---

## 54. Important Regulatory Note

This document is a product/engineering specification derived from the team's discussions and supplied SIH materials. It is **not** a statement that every field, workflow, certificate rule, validity period, or authority structure described here is legally mandated.

Actual legal workflows, verification rules, certificate formats, validity periods, statutory requirements, and integration requirements must be validated against applicable official Legal Metrology laws, rules, government notifications, and departmental procedures before production deployment.

The software architecture can be designed now without inventing regulatory rules.

---

## 55. SIH Presentation Relationship

This PRD is the internal product and engineering specification.

The final SIH idea presentation should extract only the strongest points:

1. Title / Problem
2. Proposed Solution
3. Innovation & Uniqueness
4. Technical Approach
5. Feasibility & Viability
6. Impact & Benefits / Research

The detailed PRD should **not** be directly converted into the presentation.

---

## 56. PRD Baseline

**MetriX PRD v1.0 is the baseline product specification.**

Any major change to:

- User roles
- Account model
- Workflow
- Database architecture
- Certificate architecture
- Security model
- MVP scope
- Technology architecture

should be discussed and reflected in a new PRD version before implementation proceeds.

**Next recommended artifact:**

> `docs/database/schema.md` — complete database schema and ERD derived from this PRD.
