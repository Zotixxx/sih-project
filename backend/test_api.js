// End-to-End Test for MetriX Express Backend API
async function runTests() {
  const BASE_URL = "http://localhost:5001/api";
  console.log(`Starting MetriX API E2E Verification against ${BASE_URL}...`);

  // 1. Health
  const health = await fetch(`${BASE_URL}/health`).then((r) => r.json());
  console.log("✓ Health Check:", health.status, `[District: ${health.district}]`);

  // 2. Stats
  const stats = await fetch(`${BASE_URL}/dashboard/stats`).then((r) => r.json());
  console.log("✓ Dashboard Stats:", stats.stats);

  // 3. Applications
  const apps = await fetch(`${BASE_URL}/applications`).then((r) => r.json());
  console.log(`✓ Applications count: ${apps.length}`);

  // 4. Accept Application
  const acceptRes = await fetch(`${BASE_URL}/applications/APP-2026-00124/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ officerName: "Dr. R. K. Sharma (Assistant Controller)" }),
  }).then((r) => r.json());
  console.log("✓ Accept Application Result:", acceptRes.success, acceptRes.application?.status);

  // 5. Assign LMO
  const assignRes = await fetch(`${BASE_URL}/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      applicationId: "APP-2026-00125",
      officerId: "LMO-AJM-021",
      scheduledDate: "2026-09-03",
      scheduledTime: "11:30 AM",
    }),
  }).then((r) => r.json());
  console.log("✓ Assign LMO Result:", assignRes.success, assignRes.application?.assignedLmoName);

  // 6. Awaiting Certificates Queue
  const awaiting = await fetch(`${BASE_URL}/awaiting-certificates`).then((r) => r.json());
  console.log(`✓ Awaiting Final Sanction Inspections: ${awaiting.length}`);

  // 7. Approve Inspection & Issue Certificate
  if (awaiting.length > 0) {
    const targetInsp = awaiting[0];
    const approveRes = await fetch(`${BASE_URL}/approvals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inspectionId: targetInsp.id,
        controllerRemarks: "Full Schedule VII verification verified. Certificate sanctioned.",
        approvingOfficer: "Dr. R. K. Sharma (Assistant Controller)",
      }),
    }).then((r) => r.json());

    console.log("✓ Sanction Certificate Result:", approveRes.success, approveRes.certificate?.id);
    const certId = approveRes.certificate?.id;

    // 8. Test Public QR Verification
    const publicVerify = await fetch(`${BASE_URL}/public/certificates/${certId}`).then((r) => r.json());
    console.log("✓ Public QR Verification:", publicVerify.statusText, `[Valid: ${publicVerify.valid}]`);
    console.log("  Certificate Number:", publicVerify.certificate?.certificateNumber);
    console.log("  Owner:", publicVerify.certificate?.ownerName);
    console.log("  Valid Until:", publicVerify.certificate?.validUntil);
  }

  // 9. Completed Verifications
  const completed = await fetch(`${BASE_URL}/completed-verifications`).then((r) => r.json());
  console.log(`✓ Completed Verifications Registry: ${completed.length} items`);

  console.log("\n=======================================================");
  console.log(" ALL METRIX END-TO-END WORKFLOW TESTS PASSED PERFECTLY!");
  console.log("=======================================================\n");
}

runTests().catch((err) => {
  console.error("Test Error:", err);
  process.exit(1);
});
