# SIH 2026 — Legal Metrology Digital Verification & Certification Platform

> A secure, unified digital platform for the registration, verification, certification, and lifecycle management of weighing and measuring instruments under Legal Metrology regulations.

**Competition:** Smart India Hackathon 2026\
**Status:** 🟡 Planning / Architecture\
**Repository:** `sih-project`

---

## 📌 Problem Overview

Under the **Legal Metrology Act, 2009** and the **Legal Metrology (General) Rules, 2011**, weighing and measuring instruments used in transactions and for protection are required to be periodically verified and stamped before being put into use.

The current verification process involves several manual or fragmented activities, including:

- Submission of verification applications
- Scheduling inspections
- Allocation of Legal Metrology Officers (LMOs)
- Recording inspection observations
- Issuing verification certificates
- Maintaining physical/digital records
- Monitoring certificate validity
- Managing re-verification

Fragmented processes can result in:

- Delays in verification
- Difficulty retrieving historical records
- Limited visibility into pending applications
- Difficulty tracking certificate expiry
- Lack of centralized verification history
- Limited transparency for businesses and consumers
- Increased administrative workload

### Our Goal

Build a **unified digital ecosystem** that brings the complete verification lifecycle online while improving transparency, traceability, security, and ease of compliance.

---

# 🎯 Project Objective

The platform will allow stakeholders to manage the complete lifecycle of weighing and measuring instruments:

```text
Stakeholder Registration
        ↓
Instrument Registration
        ↓
Verification Application
        ↓
Scheduling & Allocation
        ↓
Field Verification
        ↓
Inspection & Evidence
        ↓
Approval / Rejection
        ↓
Digital Certificate
        ↓
QR-Based Verification
        ↓
Validity Monitoring
        ↓
Expiry Alerts
        ↓
Re-verification
```

The system aims to improve:

- Transparency
- Efficiency
- Traceability
- Compliance
- Record management
- Evidence integrity
- Accessibility
- Administrative efficiency

---

# 👥 System Stakeholders

## 🏢 Business / Instrument Owner

Businesses can:

- Create an organization/profile
- Register weighing and measuring instruments
- Submit verification applications
- Apply for re-verification
- Upload supporting documents
- Track application status
- View verification history
- Download digital certificates
- Receive expiry reminders

---

## 👮 Legal Metrology Officer (LMO)

LMOs can:

- View assigned verification applications
- Access instrument information
- View scheduled inspections
- Perform field verification
- Record inspection observations
- Enter measurement/test results
- Capture photographs
- Record GPS/location information
- Submit verification results
- Approve/reject verification where authorized

---

## 🧪 Government Approved Test Centre (GATC)

GATCs can:

- Receive testing/verification assignments
- Access instrument information
- Record test results
- Upload supporting evidence
- Submit verification reports
- Maintain testing history

---

## 🛠️ Administrator

Administrators can:

- Manage stakeholders
- Manage LMOs and GATCs
- Review applications
- Assign verification activities
- Monitor pending applications
- Monitor expired/expiring instruments
- View system analytics
- Manage system configuration
- Access audit logs

---

## 👤 Public / Consumer

Public users do not need an account to:

- Scan a certificate QR code
- Verify certificate authenticity
- Check certificate validity
- View basic certificate information

---

# 🚀 Core Features

## 1. Stakeholder Registration

Secure registration and profile management for:

- Businesses
- Instrument owners
- LMOs
- GATCs
- Administrators

The system will use **Role-Based Access Control (RBAC)** so each stakeholder only has access to the functionality relevant to their role.

---

## 2. Instrument Registration

Businesses can register their weighing and measuring instruments.

Example information:

```text
Instrument ID
Instrument Type
Manufacturer
Model
Serial Number
Capacity
Location
Owner
Registration Date
Status
```

Each instrument will have a unique digital record and complete verification history.

---

## 3. Verification & Re-verification

Businesses can submit applications online.

```text
Draft
  ↓
Submitted
  ↓
Under Review
  ↓
Scheduled
  ↓
Verification
  ↓
Approved / Rejected
```

Every application maintains a complete status history.

---

## 4. Verification Scheduling

Administrators can assign verification activities to:

- Legal Metrology Officers
- Government Approved Test Centres

The scheduling system will help coordinate:

- Officer availability
- Inspection date
- Location
- Application
- Assigned verification activity

---

# 📱 5. Mobile Field Verification

A dedicated mobile application will support LMOs during field inspections.

The mobile application can provide:

- Assigned inspections
- Instrument information
- Digital inspection forms
- Measurement entry
- Photo capture
- GPS coordinates
- Timestamp
- Officer remarks
- Supporting documents
- Verification result submission

### Offline-First Capability

The application is planned to support areas with unreliable connectivity.

```text
Field Inspection
      ↓
Local Storage
      ↓
Internet Available
      ↓
Synchronization
      ↓
Backend API
      ↓
Central Database
```

---

# 📷 6. Digital Evidence Collection

During verification, LMOs can capture:

- Instrument photographs
- Serial number photographs
- Display/measurement photographs
- Stamping/sealing evidence
- Supporting documents

Evidence will be linked to the relevant:

```text
Application
     ↓
Inspection
     ↓
Instrument
```

---

# 📜 7. Digital Verification Certificates

After successful verification, the system will generate a digital certificate containing information such as:

```text
Certificate ID
Instrument ID
Owner
Instrument Type
Manufacturer
Model
Serial Number
Verification Date
Valid Until
Verification Result
Issuing Authority
```

Certificates can be:

- Viewed online
- Downloaded
- Printed
- Shared
- Verified using QR code

---

# 🔲 8. QR-Based Certificate Verification

Every digital certificate will have a unique QR code.

```text
Digital Certificate
        ↓
Unique Certificate ID
        ↓
QR Code
        ↓
Public Verification Portal
        ↓
Database Lookup
        ↓
Certificate Status
```

The verification portal can display:

```text
✓ VALID
✗ EXPIRED
✗ REVOKED
⚠ NOT FOUND
```

The QR code will provide a simple way for consumers, businesses, and authorized personnel to verify certificate information.

---

# 🔐 9. Certificate Integrity

The platform will explore cryptographic mechanisms for protecting certificate integrity.

Potential mechanisms include:

- SHA-256 hashing
- Digital signatures
- Unique certificate identifiers
- Tamper detection
- Audit trails

The objective is to ensure that a certificate can be independently verified against the record maintained by the system.

---

# ⏰ 10. Validity & Expiry Management

The system will track certificate validity automatically.

Example:

```text
30 Days Before Expiry
        ↓
Reminder

7 Days Before Expiry
        ↓
Urgent Reminder

Certificate Expired
        ↓
Re-verification Required
```

Potential notification channels:

- In-app notifications
- Email
- Mobile push notifications

---

# 📊 11. Dashboards

Different stakeholders will receive role-specific dashboards.

### Business Dashboard

```text
Total Instruments
Valid
Expiring Soon
Expired

Applications
Pending
Approved
Rejected
```

### LMO Dashboard

```text
Assigned Inspections
Today's Inspections
Pending Verifications
Completed Verifications
```

### Administrator Dashboard

```text
Total Instruments
Total Applications
Pending Applications
Verified Instruments
Expired Instruments
Active LMOs
Active GATCs
District-wise Statistics
```

---

# 🔎 12. Search & Verification History

Authorized users will be able to search using:

- Instrument ID
- Serial number
- Certificate ID
- Owner
- Instrument type
- Location
- Verification status

Each instrument will maintain a complete lifecycle history.

Example:

```text
Instrument
│
├── Registered — 2024
│
├── Verified — 2024
│   └── PASS
│
├── Re-verified — 2025
│   └── PASS
│
└── Re-verified — 2026
    └── PASS
```

---

# 🧾 13. Audit Trail

Important system actions will be recorded in an audit trail.

Example:

```text
User: LMO-102

Action:
Approved Verification

Application:
APP-2026-00192

Previous Status:
UNDER_VERIFICATION

New Status:
APPROVED

Timestamp:
2026-08-23 14:32
```

This improves accountability and traceability.

---

# 🏗️ Proposed Architecture

The system will initially follow a modular client-server architecture.

```text
                         CLIENT LAYER
              ┌──────────────────────────┐
              │                          │
              │       Next.js Web        │
              │   JavaScript + Tailwind  │
              │                          │
              │       Flutter App        │
              │                          │
              └────────────┬─────────────┘
                           │
                         HTTPS
                           │
                           ▼
                    BACKEND API
                  Node.js + Express
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
          Auth/RBAC     Workflow     Certificates
             │             │             │
             └─────────────┼─────────────┘
                           │
                           ▼
                      PostgreSQL
                           │
                 ┌─────────┴─────────┐
                 │                   │
                 ▼                   ▼
           Object Storage        Background Jobs
           Photos/Documents      Notifications
```

---

# 🛠️ Technology Stack

| Layer                  | Technology               |
| ---------------------- | ------------------------ |
| Web Frontend           | **Next.js + JavaScript** |
| UI / Styling           | **Tailwind CSS**         |
| UI Components          | **shadcn/ui**            |
| Web Forms              | React Hook Form          |
| Validation             | Zod                      |
| Server State           | TanStack Query           |
| Charts                 | Recharts                 |
| Mobile                 | **Flutter + Dart**       |
| Backend                | **Node.js + Express.js** |
| Database               | **PostgreSQL**           |
| ORM                    | **Prisma**               |
| Authentication         | JWT + Refresh Tokens     |
| Authorization          | RBAC                     |
| File Storage           | S3 / Cloudflare R2       |
| QR Generation          | QR Code Library          |
| Certificate Generation | Puppeteer                |
| Maps                   | Leaflet + OpenStreetMap  |
| Notifications          | Firebase Cloud Messaging |
| Background Jobs        | Redis + BullMQ           |
| API Documentation      | OpenAPI / Swagger        |
| Containerization       | Docker                   |
| Version Control        | Git + GitHub             |

> **Note:** The technology stack is not considered final until the architecture and requirements are validated by the team. Avoid introducing additional technologies unless they solve a clearly identified problem.

---

# 🔒 Security

Security is a core requirement because the platform will manage regulatory records and potentially sensitive organizational information.

Planned security mechanisms include:

- Secure authentication
- Role-Based Access Control
- Password hashing
- JWT-based authorization
- HTTPS/TLS
- API rate limiting
- Input validation
- Secure file uploads
- Audit logging
- Database access controls
- Certificate integrity verification
- Protection against common web vulnerabilities

---

# 📱 Offline-First Mobile Architecture

The LMO mobile application will maintain inspection data locally when an internet connection is unavailable.

```text
                 MOBILE APP
                      │
              ┌───────▼───────┐
              │ Local Storage │
              │    SQLite     │
              └───────┬───────┘
                      │
                 Inspection
                    Data
                      │
                      ▼
                Sync Manager
                      │
             Internet Available?
                  /        \
                NO          YES
                │            │
          Keep Locally     Upload
                             │
                             ▼
                         Backend API
                             │
                             ▼
                         PostgreSQL
```

The synchronization mechanism will need to handle:

- Offline records
- Failed uploads
- Duplicate submissions
- Retry logic
- Conflict handling
- Sync status

---

# 📁 Repository Structure

```text
sih-project/
│
├── frontend/
│   └── web/
│
├── backend/
│   ├── src/
│   ├── prisma/
│   └── tests/
│
├── mobile/
│
├── docs/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   ├── security/
│   └── research/
│
├── .github/
│   ├── workflows/
│   └── ISSUE_TEMPLATE/
│
├── README.md
├── CONTRIBUTING.md
└── .gitignore
```

---

# 🌿 Git Branching Strategy

The `main` branch should always contain stable code.

Feature development should happen in separate branches.

```text
main
 │
 ├── feature/auth
 ├── feature/instrument-registration
 ├── feature/verification-workflow
 ├── feature/lmo-mobile
 ├── feature/certificate
 └── feature/dashboard
```

### Development Workflow

```text
Create Issue
     ↓
Create Feature Branch
     ↓
Develop
     ↓
Commit
     ↓
Push
     ↓
Pull Request
     ↓
Code Review
     ↓
Merge → main
```

### Rule

**Avoid direct pushes to ****`main`****.**

---

# 🗂️ Project Management

GitHub Issues and GitHub Projects will be used for task management.

Every major feature should have an issue.

Example:

```text
Issue #12

Title:
Implement LMO Authentication and RBAC

Requirements:
- LMO login
- JWT authentication
- Role validation
- Protected routes
- Logout

Acceptance Criteria:
- LMO can log in
- Unauthorized users cannot access LMO routes
- Correct role is available to the frontend
- Invalid/expired tokens are rejected
```

### Project Board

```text
BACKLOG
   ↓
TODO
   ↓
IN PROGRESS
   ↓
REVIEW
   ↓
DONE
```

---

# 🎯 MVP Roadmap

The initial objective is to build a complete **end-to-end working workflow** before adding advanced features.

## Phase 1 — Foundation

- [ ] Repository setup
- [ ] Next.js web application
- [ ] Express backend
- [ ] PostgreSQL database
- [ ] Prisma setup
- [ ] Authentication
- [ ] RBAC
- [ ] Basic UI design system

## Phase 2 — Instrument Management

- [ ] Stakeholder registration
- [ ] Instrument registration
- [ ] Instrument search
- [ ] Instrument details
- [ ] Instrument history

## Phase 3 — Verification Workflow

- [ ] Verification application
- [ ] Application status
- [ ] Scheduling
- [ ] LMO assignment
- [ ] Verification forms
- [ ] Inspection results
- [ ] Evidence upload

## Phase 4 — Digital Certification

- [ ] Certificate generation
- [ ] QR generation
- [ ] Public verification portal
- [ ] Certificate status
- [ ] Certificate integrity validation

## Phase 5 — Mobile Application

- [ ] LMO mobile login
- [ ] Assigned inspections
- [ ] Field verification
- [ ] Photo capture
- [ ] GPS
- [ ] Offline storage
- [ ] Synchronization

## Phase 6 — Monitoring & Analytics

- [ ] Expiry tracking
- [ ] Notifications
- [ ] Admin dashboard
- [ ] Analytics
- [ ] Audit logs
- [ ] Reports

---

# 🌟 Future Enhancements

Potential future features include:

- AI-assisted inspection
- OCR-based serial number extraction
- Automatic instrument identification
- Advanced anomaly detection
- Geographic compliance heatmaps
- Advanced government analytics
- Multilingual interface
- SMS notifications
- Integration with existing government systems
- State-wide deployment
- National-scale deployment

---

# 👨‍💻 Team

| Member | Role                  | Responsibilities                    |
| ------ | --------------------- | ----------------------------------- |
| TBD    | Project Lead          | Architecture, coordination          |
| TBD    | Backend Developer     | APIs, database, workflows           |
| TBD    | Frontend Developer    | Web application                     |
| TBD    | Mobile Developer      | Flutter application                 |
| TBD    | Security              | Authentication, RBAC, certificates  |
| TBD    | UI/UX & Documentation | Design, presentation, documentation |

---

# 📚 Documentation

Project documentation will be maintained inside the `docs/` directory.

Planned documentation:

- System Architecture
- Database Design
- API Documentation
- Security Architecture
- Mobile Architecture
- Certificate Specification
- Deployment Guide
- Testing Strategy
- Standard Operating Procedures
- User Manual

---

# 🧪 Testing Strategy

Testing will be introduced alongside development rather than at the end.

Planned testing areas:

### Frontend

- Component testing
- Form validation
- Role-based UI access
- Error states

### Backend

- API testing
- Authentication testing
- Authorization testing
- Validation testing
- Workflow testing

### Database

- Schema validation
- Relationship integrity
- Transaction testing

### Mobile

- Offline functionality
- Synchronization
- Field data validation
- Permission handling

### Security

- Authentication bypass attempts
- RBAC testing
- Input validation
- File upload security
- API rate limiting
- Certificate integrity

---

# ⚠️ Important Disclaimer

This project is being developed as a **prototype for Smart India Hackathon 2026**.

Actual legal workflows, verification rules, certificate formats, validity periods, statutory requirements, and integration requirements must be validated against the applicable **Legal Metrology laws, rules, government notifications, and official departmental procedures** before production deployment.

The team will not assume regulatory rules that have not been verified from official sources.

---

# 🚀 Project Status

**Status:** 🟡 Planning / Architecture

**Competition:** Smart India Hackathon 2026

**Domain:** Legal Metrology / Government Digital Services

**Primary Focus:** Digital Verification, Certification & Lifecycle Management

---

## Let's build it. 🚀
# sih-project
