Design a modern, production-quality web application UI for a Government Legal Metrology Verification & Certification Platform called "MetriVerify".

CONTEXT:
The platform digitizes the complete lifecycle of weighing and measuring instruments under Legal Metrology regulations. Businesses register instruments and submit verification/re-verification applications. Legal Metrology Officers (LMOs) and Government Approved Test Centres (GATCs) perform verification. Administrators manage applications, scheduling, users and compliance. The platform generates digitally verifiable certificates with QR codes.

DESIGN GOAL:
Create a trustworthy, professional government-grade digital platform, but avoid an outdated government portal appearance. The interface should feel modern, clean, highly usable, accessible and credible.

TARGET USERS:
1. Business / Instrument Owner
2. Legal Metrology Officer (LMO)
3. Government Approved Test Centre (GATC)
4. Administrator
5. Public user for certificate verification

VISUAL STYLE:
- Modern enterprise SaaS + government digital service aesthetic
- Clean and minimal
- Professional and trustworthy
- White/light neutral background
- Deep navy/blue as the primary brand color
- Green for verified/success states
- Amber for pending/warning states
- Red only for errors, expired or rejected states
- Avoid excessive gradients
- Avoid flashy glassmorphism
- Avoid excessive rounded cards
- Use subtle borders and shadows
- Strong visual hierarchy
- Excellent whitespace
- Accessible contrast
- Responsive desktop-first design

TYPOGRAPHY:
Use a clean modern sans-serif font.
Large, clear page titles.
Readable body text.
Compact but legible tables and dashboard metrics.

GLOBAL NAVIGATION:
Create a persistent left sidebar on authenticated desktop screens.

Sidebar:
- Logo + "MetriVerify"
- Dashboard
- Instruments
- Applications
- Inspections
- Certificates
- Schedule
- Notifications
- Reports
- Settings

Bottom of sidebar:
- User profile
- Role
- Logout

Top navigation:
- Breadcrumbs
- Search
- Notifications
- User avatar/profile menu

BUSINESS DASHBOARD:
Create a polished dashboard for an instrument owner.

Header:
"Good morning, [Business Name]"
Subtitle: "Overview of your instruments and verification activities."

Metric cards:
- Total Instruments
- Active / Verified
- Expiring Soon
- Expired

Main sections:
1. Verification application overview
   - Pending
   - Scheduled
   - Under Verification
   - Approved
   - Rejected

2. Upcoming verifications
   Show:
   - Instrument
   - Location
   - Date
   - Assigned LMO/GATC
   - Status

3. Instruments requiring attention
   Highlight:
   - Expiring certificates
   - Expired certificates
   - Pending applications

4. Recent activity timeline

5. Quick actions:
   - Register Instrument
   - Apply for Verification
   - Apply for Re-verification
   - View Certificates

INSTRUMENT MANAGEMENT:
Create an Instruments page with:
- Search
- Filters
- Status filter
- Instrument type filter
- Location filter
- Add Instrument button

Table columns:
- Instrument ID
- Instrument Type
- Manufacturer
- Model
- Serial Number
- Location
- Verification Status
- Valid Until
- Actions

Create an instrument detail page showing:
- Instrument information
- Owner information
- Current verification status
- Certificate
- Verification history timeline
- Inspection records
- Evidence/photos
- Re-verification action

VERIFICATION APPLICATION:
Create a multi-step application form.

Steps:
1. Instrument
2. Application Details
3. Documents
4. Preferred Schedule
5. Review & Submit

Include:
- Instrument selection
- Verification/re-verification type
- Location
- Supporting documents
- Preferred date
- Notes
- Review summary

Show a clear progress indicator.

APPLICATION DETAILS PAGE:
Show:
- Application ID
- Instrument
- Applicant
- Submission date
- Current status
- Assigned officer/GATC
- Scheduled date
- Timeline of status changes
- Uploaded documents
- Inspection information

Use clear status badges:
DRAFT
SUBMITTED
UNDER REVIEW
SCHEDULED
UNDER VERIFICATION
APPROVED
REJECTED

CERTIFICATE PAGE:
Create a highly trustworthy digital verification certificate interface.

Show:
- Official-looking certificate header
- Certificate ID
- Instrument ID
- Instrument details
- Owner
- Verification date
- Valid until
- Verification result
- Issuing authority
- QR code
- Certificate integrity / verification indicator

Actions:
- Download PDF
- Print
- Share
- Verify certificate

PUBLIC QR VERIFICATION PAGE:
This is extremely important.

Design a public page that does NOT look like an internal dashboard.

At the top:
"Certificate Verification"

Show a prominent success state:

✓ CERTIFICATE VERIFIED

Then:
- Certificate ID
- Instrument type
- Manufacturer
- Model
- Serial number
- Verification date
- Valid until
- Issuing authority

Show a clear:
"VALID" status.

Also design states for:
- VALID
- EXPIRED
- REVOKED
- NOT FOUND

Include a small note:
"Information displayed is retrieved from the official digital verification record."

LMO DASHBOARD:
Create a separate role-specific dashboard for Legal Metrology Officers.

Metrics:
- Today's Inspections
- Assigned
- Pending
- Completed
- Overdue

Main sections:
- Today's inspection schedule
- Assigned applications
- Pending verification
- Recent completed inspections

Include a map-oriented section showing inspection locations.

LMO INSPECTION PAGE:
Create a field-verification interface optimized for tablets and smaller screens.

Sections:
1. Application information
2. Instrument information
3. Inspection checklist
4. Measurements / observations
5. Photo evidence
6. GPS/location
7. Officer remarks
8. Verification result
9. Submit verification

Make the interface highly usable in the field.

Include clear actions:
"Save Draft"
"Submit Verification"

ADMIN DASHBOARD:
Create a government administration dashboard.

Metrics:
- Total Instruments
- Pending Applications
- Scheduled Inspections
- Verified Instruments
- Expiring Certificates
- Expired Instruments

Charts:
- Verification activity over time
- Application status distribution
- District-wise verification activity
- LMO workload
- GATC performance

Include:
- Pending applications table
- Recent verification activity
- Alerts
- Compliance overview

ADMIN APPLICATION MANAGEMENT:
Create a table with:
- Application ID
- Applicant
- Instrument
- Location
- Submitted
- Status
- Assigned LMO/GATC
- Scheduled date
- Actions

Include advanced filtering and sorting.

SCHEDULING INTERFACE:
Create a calendar + assignment interface.

Show:
- Available LMOs
- Available GATCs
- Inspection locations
- Date/time
- Current workload

Allow administrators to assign an application to an LMO/GATC.

DESIGN SYSTEM:
Create reusable components:
- Sidebar
- Navbar
- Metric cards
- Tables
- Status badges
- Forms
- Modal dialogs
- Confirmation dialogs
- Toast notifications
- Timeline
- Calendar
- File upload
- QR certificate card
- Empty states
- Loading states
- Error states

UX REQUIREMENTS:
- Responsive design
- Desktop, tablet and mobile layouts
- Clear keyboard navigation
- Accessible forms
- Helpful validation messages
- Avoid unnecessary animations
- Use subtle transitions
- Make important actions visually obvious
- Never hide critical information behind excessive menus
- Maintain consistent spacing and component styles

IMPORTANT:
This is a regulatory workflow application, not a generic SaaS dashboard.

Prioritize:
1. Trust
2. Clarity
3. Traceability
4. Accessibility
5. Efficient workflows
6. Data density where appropriate

The UI should look credible enough to be presented to government officials and SIH judges while still feeling like a modern software product.

Generate realistic sample data throughout the UI so the prototype looks complete and convincing.