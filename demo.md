# MetriX — Demo Guide & Evaluator Manual
### Legal Metrology Digital Verification & Certification Platform (SIH 2026)

This guide provides instructions for judges, evaluators, and developers to test the complete end-to-end Legal Metrology verification lifecycle across all three operational roles and multiple districts.

---

## 1. Quick Start

### Backend API (Express.js)
```bash
cd backend
npm install
node src/server.js
```
*Runs on `http://localhost:5001/api` and stores state in `backend/src/data/metrix.sqlite`.*

To reset local data to the seeded Ajmer/Jaipur dataset:
```bash
curl -X POST -H "x-user-id: SYS-ADMIN-001" http://localhost:5001/api/reset
```

### Frontend Web Portal (Next.js)
```bash
cd frontend/web
npm install
npm run dev
```
*Runs on `http://localhost:3000`*

### Automated backend checks
```bash
cd backend
npm test
```

The test suite resets the local database and covers the complete Business -> Assistant
Controller -> LMO -> Assistant Controller -> Certificate -> Public QR workflow, including
district isolation, role authorization, ownership, drafts, document rules, and certificate
ID consistency. Local login accepts the seeded user IDs listed below and returns a signed
bearer token; the frontend uses that token for API requests.

---

## 2. Testing Accounts & Personas

Switch personas instantly using the **Persona Switcher** in the top navigation bar:

| Role | Name | Officer / User ID | District | Context / Jurisdiction |
|---|---|---|---|---|
| **Assistant Controller** | Dr. R. K. Sharma | `AC-AJM-001` | **Ajmer (AJM)** | Supervising Regulatory Authority, Ajmer |
| **Assistant Controller** | Dr. M. L. Gupta | `AC-JPR-001` | **Jaipur (JPR)** | Supervising Regulatory Authority, Jaipur |
| **Field LMO** | Rajesh Kumar | `LMO-AJM-021` | **Ajmer (AJM)** | Field Officer, Ajmer Central Zone |
| **Field LMO** | Sanjay Verma | `LMO-JPR-001` | **Jaipur (JPR)** | Field Officer, Jaipur North Zone |
| **Business / Merchant** | Ramesh Agarwal | `BIZ-AJM-001` | **Ajmer (AJM)** | Shree Balaji Traders & Cold Storage |
| **Business / Merchant** | Naresh Sharma | `BIZ-JPR-001` | **Jaipur (JPR)** | Jaipur Agro & Pulse Processing Mills |
| **System Admin** | Admin | `SYS-ADMIN-001` | **Statewide** | Technical Platform Administration |

---

## 3. End-to-End Workflow Test Walkthrough

Follow these sequential steps to witness the full statutory workflow from filing to digital certificate generation:

### Step 1: Assistant Controller Reviews Fresh Filing & Assigns LMO
1. Switch persona to **Dr. R. K. Sharma** (`AC-AJM-001`, Ajmer Assistant Controller).
2. Notice the navigation tabs:
   - **Dashboard**
   - **Fresh Applications**
   - **Verify**
   - **LMOs**
   - **Notifications**
   - **Settings**
3. Navigate to **Fresh Applications** (`/admin/fresh-applications`).
4. Find application `APP-AJM-002` (*Platform Scale*).
5. Click **Accept & Assign LMO**:
   - Select **Rajesh Kumar** (`LMO-AJM-021`).
   - Pick date and time slot.
   - Click **Accept & Assign LMO**.
6. **Statutory Check**: The application status transitions to `SCHEDULED`. **Notice that NO certificate is created at this point.**

---

### Step 2: Field LMO Inspects Instrument on Site & Submits Field Test Data
1. Switch persona to **Rajesh Kumar** (`LMO-AJM-021`, Ajmer Field LMO).
2. Notice the navigation tabs:
   - **Dashboard**
   - **Inspections**
   - **Verification Details**
   - **Notifications**
   - **Settings**
3. On the **Dashboard**, see your pending inspections for today.
4. Navigate to **Inspections** (`/inspections`).
5. Click **Open Field Inspection** on `APP-AJM-002`.
6. Click **Start Field Inspection**:
   - Verify physical plaque & zero-setting checkboxes.
   - Enter standard load test results (Nominal 5000 kg, Indicated 5002 kg, Deviation +2 kg within allowable ±5 kg MPE).
   - Enter lead wire seal number (e.g. `SEAL-RAJ-99412`).
   - GPS coordinates and test remarks are recorded.
7. Click **Submit Inspection to Assistant Controller**.
8. Navigate to **Verification Details** (`/lmo/verification-details`) to view your locked, submitted field test record.

---

### Step 3: Assistant Controller Performs Final Sanction & Generates Certificate
1. Switch persona back to **Dr. R. K. Sharma** (`AC-AJM-001`).
2. Navigate to **Verify** (`/admin/verify`).
3. Notice that `APP-AJM-002` appears in the **Awaiting Final Review** queue.
4. Click **Review & Decide**:
   - Inspect the complete dossier: Business details, instrument specifications, LMO on-site measurements, MPE compliance, seal number, and GPS.
5. Click **Approve & Generate Certificate**:
   - The backend validates regulatory compliance.
   - Generates unique Certificate ID: `LM-AJM-2026-XXXXXX`.
   - Computes cryptographic SHA-256 integrity hash.
   - Generates tamper-proof QR code token.
   - Application status updates to `CERTIFIED`.
6. A printable, official Government of Rajasthan Verification Certificate modal appears with QR code and stamping seal.

---

### Step 4: Business Tracks Application & Views Official Certificate
1. Switch persona to **Ramesh Agarwal** (`BIZ-AJM-001`, Shree Balaji Traders).
2. Notice the navigation tabs:
   - **Dashboard**
   - **Applications**
   - **Certificates**
   - **Instruments**
   - **Notifications**
   - **Settings**
3. Navigate to **Applications** (`/applications`):
   - Notice the status progress tracker showing `Certificate Issued`.
4. Navigate to **Certificates** (`/certificates`):
   - The newly generated certificate appears in the list.
   - Click **View** to inspect, print, or download the certificate.
   - Click the **QR Code** icon to view the scannable code.

---

### Step 5: Public Citizen QR Code Verification
1. Open the public verification URL directly in your browser:
   `http://localhost:3000/verify/LM-AJM-2026-000114`
2. Notice that:
   - **No login is required** (accessible to any consumer or merchant).
   - Real-time validity badge (`✓ Official Certificate Verified`) displays.
   - Displays instrument specifications, verification date, validity period, verifying LMO, and statutory lead wire seal number retrieved live from the backend API.

---

## 4. Multi-District Isolation & Security Tests

MetriX enforces strict district authorization at the **Express backend layer**:

### Test A: Assistant Controller Cross-District Access (Ajmer vs Jaipur)
1. Switch persona to **Dr. R. K. Sharma** (`AC-AJM-001`, Ajmer).
   - In **Fresh Applications** and **Verify**, only Ajmer filings are returned.
   - Jaipur applications (`APP-JPR-001`, `APP-JPR-002`) are completely hidden.
2. In your browser or API client (Postman/curl), attempt to access Jaipur application directly with Ajmer headers:
   ```bash
   curl -H "x-user-id: AC-AJM-001" http://localhost:5001/api/applications/APP-JPR-001
   ```
   **Result**: Backend immediately blocks the request with `HTTP 403 Forbidden`:
   ```json
   {
     "success": false,
     "error": {
       "code": "FORBIDDEN",
       "message": "You do not have administrative jurisdiction for district JPR."
     }
   }
   ```
3. Now switch persona to **Dr. M. L. Gupta** (`AC-JPR-001`, Jaipur):
   - The dashboard dynamically displays Jaipur District.
   - Only Jaipur applications and Jaipur LMOs are listed.

### Test B: LMO Role & Action Security
1. An LMO cannot approve applications or generate certificates.
   ```bash
   curl -X POST -H "x-user-id: LMO-AJM-021" http://localhost:5001/api/approvals/approve -d '{"applicationId":"APP-AJM-001"}'
   ```
   **Result**: Backend blocks with `HTTP 403 Forbidden`.

---

## 5. Automated Verification Test Suite

To run the automated test suite covering all 7 statutory scenarios:
```bash
cd backend
node test_e2e_scenarios.js
```
Output:
```text
=======================================================
🧪 RUNNING METRIX MULTI-DISTRICT REGULATORY TEST SUITE
=======================================================
  ✓ Database reset to initial multi-district state
  ▶ TEST 1: Full End-to-End Lifecycle Workflow (Ajmer) [PASSED]
  ▶ TEST 2: Rejection Flow with Mandatory Reason [PASSED]
  ▶ TEST 3: Return for Correction Flow [PASSED]
  ▶ TEST 4: Multi-District Data Isolation (Ajmer vs Jaipur) [PASSED]
  ▶ TEST 5: LMO Role & Action Isolation [PASSED]
  ▶ TEST 6: Certificate Consistency & Public QR Verification [PASSED]
  ▶ TEST 7: Search-Driven Certificates Vault [PASSED]
=======================================================
🎉 ALL 7 REGULATORY WORKFLOW & ISOLATION TESTS PASSED!
=======================================================
```
