You are a senior Flutter UI/UX engineer designing the mobile field-verification application for a government Legal Metrology platform called "MetriX".

IMPORTANT:
This is ONLY the frontend/UI prototype.
Do not implement backend APIs, Supabase, authentication logic, database logic, or real GPS/camera functionality yet.
Use realistic mock data and clean model classes where necessary so the UI can later be connected to APIs.

TECHNOLOGY:
- Flutter
- Dart
- Material 3
- Responsive design
- Android-first
- Use clean reusable widgets
- Use a professional government-service visual language
- Do NOT use excessive gradients, glassmorphism, neon colors, or decorative animations.
- The application should feel trustworthy, modern, professional and practical for field officers.

APPLICATION PURPOSE:

MetriX digitizes the verification workflow of weighing and measuring instruments under Legal Metrology.

This mobile application is specifically for Legal Metrology Officers (LMOs).

The primary purpose of the mobile application is FIELD VERIFICATION.

LMOs use the application to:
- Login
- View assigned/pending inspections
- View upcoming inspection details
- Open an inspection
- View shop/business and instrument information
- Perform field verification
- Record inspection observations
- Eventually capture photographs and location
- Submit verification results
- View completed inspections
- View inspection history

--------------------------------------------------
1. APP STRUCTURE
--------------------------------------------------

Create the following screens:

1. Splash Screen
2. LMO Login
3. LMO Home Dashboard
4. Pending Inspection Details
5. Completed Inspection Details
6. Inspection History
7. Inspection History Details
8. Profile / Account screen
9. Field Inspection screen
10. Inspection Review / Submit screen

For this first frontend version, prioritize:
- Login
- Home Dashboard
- Pending Inspection Details
- Completed Inspection Details
- Inspection History
- Field Inspection
- Review / Submit

--------------------------------------------------
2. SPLASH SCREEN
--------------------------------------------------

Create a minimal professional splash screen.

Display:

METRIX

Legal Metrology Verification System

Use a simple weighing-scale / measurement inspired icon.

Do not make it overly animated.

After a short delay, navigate to the Login screen.

--------------------------------------------------
3. LOGIN SCREEN
--------------------------------------------------

Create a professional LMO login page.

Layout:

Top:
MetriX logo

Heading:
"Legal Metrology Officer"

Subheading:
"Sign in to access your verification assignments"

Form:
- Officer ID / Email
- Password

Password field must include show/hide password functionality.

Primary button:
"Sign In"

Below the button:
"Authorized officers only"

Do NOT show:
- Create Account
- Sign Up
- Register as LMO

LMO accounts are provisioned by the administrative authority.

Include a small "Forgot Password?" option.

Use proper validation UI, but use mock authentication for now.

After successful mock login:
navigate to LMO Dashboard.

--------------------------------------------------
4. LMO HOME DASHBOARD
--------------------------------------------------

This is the most important screen.

The LMO should immediately understand:
- who they are
- which district they belong to
- what inspections are pending
- what inspections are completed
- what needs attention today

HEADER:

Left:
Circular officer profile photo/avatar.

Beside it:

"Good morning, Rajesh"

"Legal Metrology Officer"

Right:
District information.

Example:

"Ajmer"
"District"

Use a location icon.

Below header:

"Today's Overview"

Show compact summary cards:

Pending
8

Today's Inspections
3

Completed
24

Then create two main sections:

SECTION 1:
"Pending Inspections"

Show a list of inspection cards.

Each card should display:

- Application ID
- Business / Shop name
- Instrument type
- Scheduled date
- Scheduled time
- Location / area
- Status badge

Example:

Application #LM-2026-0184

Shree Balaji Traders

Electronic Weighing Machine

Today • 11:30 AM

Ajmer, Rajasthan

Status:
Scheduled

Each card must be tappable.

When tapped:
navigate to Pending Inspection Details.

SECTION 2:
"Completed Inspections"

Show recent completed inspections.

Each card should display:

- Business/shop name
- Instrument
- Inspection date
- Location
- Result
- Application ID

Example:

Mahesh General Store

Platform Weighing Scale

26 Aug 2026

Ajmer, Rajasthan

Result:
Verified

Tapping opens Completed Inspection Details.

At the bottom or in the main navigation provide:

"Inspection History"

This opens the history screen.

--------------------------------------------------
5. BOTTOM NAVIGATION
--------------------------------------------------

Use a simple Material 3 bottom navigation bar.

Recommended navigation:

Home
Inspections
History
Profile

Home:
Dashboard.

Inspections:
Pending/current assigned inspections.

History:
Completed inspection history.

Profile:
Officer information and logout.

Do not overload the navigation.

--------------------------------------------------
6. PENDING INSPECTION DETAILS
--------------------------------------------------

When the LMO taps a pending inspection, show a detailed inspection page.

Top app bar:

Back button

Title:
"Inspection Details"

Status badge:
"Scheduled"

Create clearly separated information sections.

SECTION: APPLICATION

Application ID:
LM-2026-0184

Application Type:
Verification

Scheduled Date:
31 August 2026

Scheduled Time:
11:30 AM

SECTION: BUSINESS / SHOP

Business Name:
Shree Balaji Traders

Owner:
Ramesh Kumar

Phone:
+91 XXXXX XXXXX

Address:
123, Main Market,
Ajmer, Rajasthan

SECTION: INSTRUMENT

Instrument Type:
Electronic Weighing Instrument

Manufacturer:
Example Manufacturer

Model:
EW-500

Serial Number:
SN123456789

Capacity:
50 kg

SECTION: LOCATION

Display:
Shop address.

Include a map placeholder card.

Show:
Ajmer, Rajasthan

A button:

"Open Directions"

For the UI prototype this can be non-functional.

At the bottom, use a prominent primary CTA:

"Start Inspection"

Tapping this opens the Field Inspection screen.

--------------------------------------------------
7. FIELD INSPECTION SCREEN
--------------------------------------------------

This is the most important operational screen of the mobile application.

The design must prioritize usability while an LMO is standing in the field.

Top:

Application ID
LM-2026-0184

Progress indicator:

Step 1 of 4

Suggested workflow:

1. Instrument
2. Measurements
3. Evidence
4. Review

SECTION 1 — INSTRUMENT

Display instrument details.

Provide a confirmation:

"Is this the correct instrument?"

[Yes, Continue]

SECTION 2 — MEASUREMENTS

Create structured input fields.

Examples:

Test Parameter
Observed Value
Unit
Remarks

Use clear numeric input fields.

Do NOT assume these exact measurements are statutory requirements.
They are mock prototype fields.

SECTION 3 — OBSERVATIONS

Large text field:

"Inspection observations"

Placeholder:
"Enter observations recorded during verification..."

SECTION 4 — EVIDENCE

Create cards/buttons:

"Capture Instrument Photo"

"Capture Serial Number Photo"

"Capture Display Photo"

For this frontend prototype:
show camera placeholders or mocked image previews.

SECTION 5 — LOCATION

Display:

"Inspection Location"

Latitude:
26.xxxx

Longitude:
74.xxxx

Status:

"Location captured"

For now, use mock coordinates.

At the bottom:

"Continue"

--------------------------------------------------
8. INSPECTION REVIEW / SUBMIT
--------------------------------------------------

Before final submission, show a review screen.

Heading:

"Review Inspection"

Sections:

Application
Business
Instrument
Measurements
Observations
Evidence
Location

Each section should have a small "Edit" action.

At the bottom display an important warning:

"Please verify all inspection details before submitting."

Primary CTA:

"Submit Verification Result"

After tapping:

Show confirmation dialog:

"Submit inspection result?"

"Once submitted, the inspection record will be recorded in the system."

Buttons:

Cancel
Submit

After mock submission:

Show success screen:

"Inspection Submitted"

"Your verification result has been successfully submitted."

Button:

"Back to Dashboard"

--------------------------------------------------
9. COMPLETED INSPECTION DETAILS
--------------------------------------------------

When the LMO taps a completed inspection, show a read-only detail screen.

Top:

"Completed"

Result badge:

"Verified"

Display:

Application ID
Inspection date
Inspection time
Business name
Owner
Phone number
Shop address

Instrument information:

Instrument type
Manufacturer
Model
Serial number
Capacity

Verification information:

Verified by
Officer ID
Verification date
Result

Evidence section:

Show thumbnails of submitted photographs.

Location section:

Show inspection location.

Certificate section:

If a certificate exists, display:

Certificate ID

Status:
Valid

Button:

"View Certificate"

For the frontend prototype this can open a certificate preview screen/card.

--------------------------------------------------
10. INSPECTION HISTORY
--------------------------------------------------

Create a dedicated Inspection History screen.

This screen should show the LMO's previous inspections.

Top:

"Inspection History"

Search bar:

"Search by application ID, shop or instrument..."

Filters:

- All
- Verified
- Failed
- Date

List each inspection as a clean card.

Each card:

Application ID
Shop name
Instrument
Inspection date
Location
Result

Example:

LM-2026-0132

Agarwal Traders

Platform Weighing Scale

28 Aug 2026

Ajmer

Verified

Tapping opens Inspection History Details.

The history screen should support scrolling and pagination-like mock loading.

--------------------------------------------------
11. HISTORY DETAIL
--------------------------------------------------

Create a read-only detailed page.

Display:

Application information
Business information
Instrument information
Inspection date/time
Measurements
Observations
Evidence
Location
Result
Certificate information

The data should clearly communicate that this is a historical record.

--------------------------------------------------
12. PROFILE SCREEN
--------------------------------------------------

Create a professional profile screen.

Show:

Circular profile image

Rajesh Kumar

Legal Metrology Officer

Officer ID:
LMO-AJM-021

District:
Ajmer

Department:
Legal Metrology Department

Contact:
official@example.gov.in

Phone:
+91 XXXXX XXXXX

Sections:

Account
Notifications
Help
About MetriX

Bottom:

"Logout"

Show confirmation before logout.

--------------------------------------------------
13. UI DESIGN SYSTEM
--------------------------------------------------

Use a professional government-oriented design.

Design goals:

- Trustworthy
- Clean
- Accessible
- Information-focused
- Modern
- Mobile-first
- Easy to use outdoors
- Large enough touch targets

Use:

- Material 3 components
- Cards
- Outlined input fields
- Clear status badges
- Bottom sheets where appropriate
- Sticky primary action buttons when useful
- Clear typography hierarchy

Avoid:

- Excessive rounded cards
- Excessive shadows
- Neon colors
- Glassmorphism
- Large decorative illustrations
- Excessive animations
- Dark futuristic dashboard styling

--------------------------------------------------
14. STATUS COLORS
--------------------------------------------------

Use semantic colors consistently.

Verified / Completed:
positive green semantic treatment

Pending / Scheduled:
neutral or blue semantic treatment

Expiring / Attention:
warning treatment

Failed / Rejected:
error treatment

Do not rely only on color.
Always include text labels.

--------------------------------------------------
15. MOBILE FIELD UX
--------------------------------------------------

This application will be used by officers in real field environments.

Therefore:

- Use large touch targets.
- Avoid tiny text.
- Avoid overly dense tables.
- Use clear section headings.
- Keep important actions near the bottom.
- Use sticky CTA buttons where appropriate.
- Provide clear confirmation before irreversible actions.
- Make forms easy to complete with one hand where possible.
- Use numeric keyboards for measurement fields.
- Make evidence capture highly visible.
- Make network/sync status visible in future architecture.

--------------------------------------------------
16. OFFLINE UI PREPARATION
--------------------------------------------------

The actual offline functionality will be implemented later.

However, design the UI so it can eventually display:

"Offline Mode"

"Last synchronized: 10:42 AM"

"3 inspections waiting to sync"

Use a small sync-status indicator in the application shell.

For now, these can be mock states.

--------------------------------------------------
17. MOCK DATA
--------------------------------------------------

Create realistic mock data for:

LMO:

Name:
Rajesh Kumar

Officer ID:
LMO-AJM-021

District:
Ajmer

Department:
Legal Metrology Department

Pending inspections:
At least 5

Completed inspections:
At least 10

Use realistic Indian business names, addresses and instrument information.

Do not use real people's personal information.

--------------------------------------------------
18. CODE ARCHITECTURE
--------------------------------------------------

Use a clean Flutter project structure.

Recommended:

lib/
├── main.dart
├── app/
│   ├── app.dart
│   ├── routes.dart
│   └── theme.dart
│
├── models/
│   ├── lmo.dart
│   ├── inspection.dart
│   ├── instrument.dart
│   └── certificate.dart
│
├── data/
│   └── mock_data.dart
│
├── screens/
│   ├── splash/
│   ├── auth/
│   ├── dashboard/
│   ├── inspections/
│   ├── history/
│   └── profile/
│
├── widgets/
│   ├── inspection_card.dart
│   ├── status_badge.dart
│   ├── dashboard_stat_card.dart
│   ├── section_card.dart
│   └── primary_button.dart
│
└── services/
    └── mock_auth_service.dart

Keep widgets reusable.

Do not put large amounts of UI code directly inside main.dart.

--------------------------------------------------
19. NAVIGATION
--------------------------------------------------

Implement navigation using named routes or a clean routing approach.

Required flow:

Splash
→ Login
→ Dashboard

Dashboard
→ Pending Inspection Details
→ Field Inspection
→ Review
→ Success
→ Dashboard

Dashboard
→ Completed Inspection Details

Dashboard
→ Inspection History
→ History Details

Dashboard
→ Profile

--------------------------------------------------
20. RESPONSIVENESS
--------------------------------------------------

Primary target:

Android smartphones.

Support common screen sizes such as:

360 × 800
390 × 844
412 × 915

Avoid hardcoded dimensions that break on smaller devices.

Use:

- MediaQuery where necessary
- Expanded/Flexible
- SafeArea
- ListView
- SingleChildScrollView
- LayoutBuilder where appropriate

--------------------------------------------------
21. ACCESSIBILITY
--------------------------------------------------

Ensure:

- Good contrast
- Readable typography
- Proper semantic labels
- Large tap targets
- Clear error messages
- Icons are not used without labels where meaning would be ambiguous

--------------------------------------------------
22. IMPORTANT PRODUCT DECISION
--------------------------------------------------

Do NOT create a complicated desktop-style dashboard inside the mobile application.

The mobile application is specifically designed for field officers.

Prioritize:

Assignment → Inspection → Evidence → Result

The complete administrative and analytical experience will exist in the web application.

--------------------------------------------------
23. DELIVERABLE
--------------------------------------------------

Generate a complete Flutter frontend prototype containing all screens described above.

The application should run immediately with:

flutter run

Use mock data and mock authentication.

No backend integration yet.

The code should be structured so Supabase/Express APIs can be connected later without rewriting the UI architecture.

The final result should look like a credible government Legal Metrology field-verification application suitable for an SIH 2026 prototype demonstration.