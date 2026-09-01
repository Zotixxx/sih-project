"use client";

import React, { useState, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import CertificatePreviewModal from "@/components/certificates/CertificatePreviewModal";
import { useMetrixStore } from "@/lib/store";
import { formatDate, getNormalizedChecklist } from "@/lib/utils";

export default function ApplicationDetailPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const appId = decodeURIComponent(unwrappedParams.id);

  const {
    currentUser,
    userRole,
    applications,
    inspections,
    certificates,
    lmos,
    acceptApplication,
    rejectApplication,
    assignLmo,
    approveInspection,
    returnInspection,
  } = useMetrixStore();

  const isAssistantController =
    userRole === "admin" ||
    currentUser?.role === "ASSISTANT_CONTROLLER" ||
    currentUser?.role === "SYSTEM_ADMIN";

  // Find Application by ID or associated Inspection ID
  const app = useMemo(() => {
    let found = (applications || []).find(
      (a) => a.id.toLowerCase() === appId.toLowerCase()
    );
    if (!found) {
      const insp = (inspections || []).find(
        (i) => i.id.toLowerCase() === appId.toLowerCase()
      );
      if (insp) {
        found = (applications || []).find((a) => a.id === insp.applicationId);
      }
    }
    return found;
  }, [applications, inspections, appId]);

  // Associated Inspection if exists
  const inspection = useMemo(() => {
    if (!app) return null;
    return (inspections || []).find(
      (i) => i.applicationId === app.id || i.instrumentId === app.instrumentId
    );
  }, [inspections, app]);

  // Associated Certificate if certified
  const certificate = useMemo(() => {
    if (!app) return null;
    return (certificates || []).find(
      (c) =>
        c.id === app.certificateId ||
        c.instrumentId === app.instrumentId ||
        c.id === inspection?.certificateNumber
    );
  }, [certificates, app, inspection]);

  // Modals state
  const [rejectingApp, setRejectingApp] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [assigningApp, setAssigningApp] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [scheduledDate, setScheduledDate] = useState("2026-09-03");
  const [scheduledTime, setScheduledTime] = useState("11:30 AM");
  const [returningInspection, setReturningInspection] = useState(false);
  const [inspectionReturnReason, setInspectionReturnReason] = useState("");
  const [controllerRemarks, setControllerRemarks] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  if (!app) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex">
        <SideNavBar />
        <div className="flex-1 ml-[260px] flex flex-col min-w-0">
          <TopNavBar
            title="Application Not Found"
            subtitle="The requested verification application record could not be found."
            breadcrumbs={[
              { label: "MetriX", href: "/dashboard" },
              { label: "Applications", href: "/applications" },
              { label: "Not Found" },
            ]}
          />
          <main className="p-12 max-w-lg mx-auto text-center space-y-4">
            <span className="material-symbols-outlined text-[48px] text-slate-400">
              search_off
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Application ID &quot;{appId}&quot; Not Found
            </h3>
            <p className="text-xs text-slate-500">
              Please verify the application reference or return to the applications queue.
            </p>
            <Link
              href="/applications"
              className="inline-block px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
            >
              ← Back to Applications
            </Link>
          </main>
        </div>
      </div>
    );
  }

  // Has LMO Inspection Data been submitted?
  const hasLmoInspectionData =
    Boolean(inspection) &&
    (app.status === "AWAITING_APPROVAL" ||
      app.status === "CERTIFIED" ||
      inspection.status === "SUBMITTED_FOR_APPROVAL" ||
      inspection.status === "APPROVED" ||
      inspection.status === "REJECTED");

  // Actions
  const handleAccept = async () => {
    await acceptApplication(app.id);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    await rejectApplication(app.id, rejectionReason);
    setRejectingApp(false);
    setRejectionReason("");
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    const officerId = selectedOfficer || (lmos[0]?.officerId || "LMO-AJM-021");
    await assignLmo({
      applicationId: app.id,
      officerId,
      scheduledDate,
      scheduledTime,
    });
    setAssigningApp(false);
  };

  const handleApproveInspection = async () => {
    setIsApproving(true);
    try {
      const cert = await approveInspection({
        applicationId: app.id,
        remarks:
          controllerRemarks ||
          "All measurements verified within Schedule VII MPE limits. Certificate sanctioned.",
      });
      if (cert) {
        setViewingCertificate(cert);
      }
    } catch (err) {
      alert("Error approving inspection: " + err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleConfirmReturnInspection = async (e) => {
    e.preventDefault();
    if (!inspectionReturnReason.trim()) return;
    try {
      await returnInspection({
        applicationId: app.id,
        reason: inspectionReturnReason,
      });
      setReturningInspection(false);
      setInspectionReturnReason("");
    } catch (err) {
      alert("Error returning inspection: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title={`Application Details: ${app.id}`}
          subtitle={`${app.businessName} • ${app.instrumentName} (S/N: ${app.serialNumber})`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Applications", href: "/applications" },
            { label: app.id },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Top Header Card */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono-code font-black text-slate-900 text-lg">
                    {app.id}
                  </span>
                  <Badge status={app.status} className="text-xs px-2.5 py-0.5" />
                  {hasLmoInspectionData && (
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">
                      + Field Inspection Data Included
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {app.businessName} — {app.instrumentName}
                </h2>
                <p className="text-xs text-slate-500">
                  Application Type: <strong>{app.applicationType}</strong> • District: <strong>{app.district || "Ajmer"}, Rajasthan</strong>
                </p>
              </div>

              {/* Action Buttons - ONLY ASSISTANT CONTROLLER CAN ACCEPT, REJECT, ASSIGN, OR APPROVE */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {isAssistantController && (
                  <>
                    {/* 1. Initial Review Actions */}
                    {(app.status === "SUBMITTED" || app.status === "UNDER_REVIEW") && (
                      <>
                        <button
                          onClick={handleAccept}
                          className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          Accept Application
                        </button>
                        <button
                          onClick={() => setRejectingApp(true)}
                          className="px-4 py-2 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">cancel</span>
                          Reject Filing
                        </button>
                      </>
                    )}

                    {/* 2. Accepted -> Assign LMO */}
                    {app.status === "ACCEPTED" && (
                      <button
                        onClick={() => setAssigningApp(true)}
                        className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Assign LMO &amp; Schedule
                      </button>
                    )}

                    {/* 3. Awaiting Final Approval -> Approve / Return */}
                    {(app.status === "AWAITING_APPROVAL" ||
                      inspection?.status === "SUBMITTED_FOR_APPROVAL") && (
                      <>
                        <button
                          onClick={handleApproveInspection}
                          disabled={isApproving}
                          className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-2xs disabled:opacity-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                          {isApproving ? "Sanctioning..." : "Approve & Generate Certificate"}
                        </button>
                        <button
                          onClick={() => setReturningInspection(true)}
                          className="px-4 py-2.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">cancel</span>
                          Return / Reject
                        </button>
                      </>
                    )}
                  </>
                )}

                {/* 4. Certified -> View Certificate (Visible to Business & Everyone) */}
                {(app.status === "CERTIFIED" || certificate) && (
                  <button
                    onClick={() => setViewingCertificate(certificate)}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">qr_code</span>
                    View Official Certificate &amp; QR
                  </button>
                )}
              </div>
            </div>

            {/* Status Summary Banner */}
            {app.status === "REJECTED" && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                <span className="font-bold block text-rose-950">Statutory Rejection Notice:</span>
                <p className="mt-0.5">{app.rejectionReason || "Application did not meet statutory specifications under Legal Metrology Rules."}</p>
              </div>
            )}

            {app.status === "ACCEPTED" && (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-700 text-[20px] shrink-0">task_alt</span>
                  <div>
                    <span className="font-bold text-blue-950">Application Accepted by Assistant Controller</span>
                    <p className="text-[11px] text-blue-800 mt-0.5">
                      Statutory documents verified. Ready for Legal Metrology Officer field inspection assignment.
                    </p>
                  </div>
                </div>
                {isAssistantController && (
                  <button
                    onClick={() => setAssigningApp(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shrink-0 transition-colors shadow-2xs"
                  >
                    Schedule LMO Now →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* =========================================================================
              SECTION 1: APPLICATION INFORMATION
             ========================================================================= */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              SECTION 1 — APPLICATION INFORMATION
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Application ID</span>
                <span className="font-mono-code font-bold text-slate-900 text-sm">{app.id}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Filing Type</span>
                <span className="font-bold text-slate-800">{app.applicationType}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Submission Date</span>
                <span className="font-medium text-slate-800">{formatDate(app.submissionDate || app.applicationDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Statutory Fee Paid</span>
                <span className="font-mono-code font-bold text-emerald-800">{app.feePaid || "₹ 1,500.00"}</span>
                <span className="text-[10px] text-slate-400 block truncate">{app.transactionId || "TXN-VERIFIED"}</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 2: APPLICANT / BUSINESS
             ========================================================================= */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              SECTION 2 — APPLICANT &amp; BUSINESS DETAILS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Commercial Establishment</span>
                <p className="font-bold text-slate-900 text-sm">{app.businessName}</p>
                <p className="text-slate-500">Applicant / Owner: <strong>{app.applicantName}</strong></p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Regulatory Contact</span>
                <p className="font-medium text-slate-800">📞 {app.phone}</p>
                <p className="font-medium text-slate-800">✉️ {app.email}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Operating Premises Location</span>
                <p className="font-medium text-slate-800">
                  {app.address}, District {app.district || "Ajmer"}, {app.state || "Rajasthan"} - {app.pincode || "305001"}
                </p>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 3: INSTRUMENT
             ========================================================================= */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              SECTION 3 — REGULATED INSTRUMENT SPECIFICATIONS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Instrument Name</span>
                <span className="font-bold text-slate-900">{app.instrumentName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Category / Type</span>
                <span className="font-semibold text-slate-800">{app.instrumentType}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Serial Number</span>
                <span className="font-mono-code font-bold text-slate-900">{app.serialNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Capacity &amp; Interval</span>
                <span className="font-bold text-slate-900">{app.capacity}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Manufacturer</span>
                <span className="font-medium text-slate-800">{app.manufacturer}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Model</span>
                <span className="font-medium text-slate-800">{app.model}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Unit</span>
                <span className="font-medium text-slate-800">Kilograms (kg) / Litres</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Accuracy Class</span>
                <span className="font-medium text-slate-800">Class III (Medium)</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              SECTION 4: DOCUMENTS
             ========================================================================= */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              SECTION 4 — UPLOADED STATUTORY DOCUMENTS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(app.documents || []).map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate mr-2">
                    <span className="material-symbols-outlined text-red-600 text-[20px]">
                      picture_as_pdf
                    </span>
                    <div className="truncate">
                      <p className="font-bold text-slate-900 truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-500">{doc.size} • Uploaded {doc.uploadDate || "Aug 2026"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Previewing statutory file: ${doc.name}`)}
                    className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 font-bold text-[11px] hover:bg-slate-100 shrink-0"
                  >
                    Preview
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* =========================================================================
              SECTION 5: PHOTOGRAPHS GALLERY
             ========================================================================= */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              SECTION 5 — APPLICATION PHOTOGRAPHS (CLICK TO ENLARGE)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(app.photographs || []).map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(photo)}
                  className="group relative h-32 bg-slate-900 rounded-lg overflow-hidden border border-slate-200 cursor-pointer flex flex-col justify-end p-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10" />
                  <span className="material-symbols-outlined absolute top-2 right-2 text-white/70 group-hover:text-white text-[18px] z-20">
                    zoom_in
                  </span>
                  <span className="text-white text-xs font-bold relative z-20 truncate">
                    {photo.title}
                  </span>
                  <span className="text-slate-300 text-[10px] relative z-20">
                    {photo.uploadDate ? `Uploaded ${photo.uploadDate}` : "On record"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* =========================================================================
              SECTION 6: LMO FIELD VERIFICATION FINDINGS (IF SUBMITTED)
             ========================================================================= */}
          {hasLmoInspectionData && inspection && (
            <div className="bg-white border-2 border-blue-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-blue-700">
                    assignment_turned_in
                  </span>
                  SECTION 6 — LMO FIELD VERIFICATION AUDIT &amp; MEASUREMENTS (SUBMITTED)
                </h3>
                <span className="font-mono-code font-bold text-blue-800 text-[11px]">
                  {inspection.id}
                </span>
              </div>

              {/* LMO Details */}
              <div className="bg-blue-50/40 rounded-lg p-3.5 border border-blue-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Inspecting LMO</span>
                  <span className="font-bold text-slate-900">{inspection.officer}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Badge ID</span>
                  <span className="font-mono-code font-bold text-slate-900">{inspection.officerBadge || "LMO-AJM"}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Inspection Executed</span>
                  <span className="font-semibold text-slate-800">{inspection.inspectionDate || inspection.scheduledDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Lead Wire Seal #</span>
                  <span className="font-mono-code font-bold text-emerald-800">{inspection.sealNumber || "SEAL-AJM-2026"}</span>
                </div>
              </div>

              {/* Error Measurements Table vs MPE */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 text-xs block">
                  Statutory Test Load Readings vs Maximum Permissible Error (MPE):
                </span>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                      <tr>
                        <th className="py-2.5 px-3.5">Applied Test Load</th>
                        <th className="py-2.5 px-3.5">Observed Reading</th>
                        <th className="py-2.5 px-3.5">Statutory MPE Limit</th>
                        <th className="py-2.5 px-3.5 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono-code text-[11px]">
                      {(inspection.measurements || []).map((m, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3.5 font-bold text-slate-900">{m.testLoad}</td>
                          <td className="py-2 px-3.5 text-slate-800">{m.observed}</td>
                          <td className="py-2 px-3.5 text-slate-600">{m.mpe}</td>
                          <td className="py-2 px-3.5 text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {m.result}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Schedule VII Checklist & Standards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 block">Schedule VII Mandatory Checklist:</span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <span aria-hidden="true" className="material-symbols-outlined text-[12px] text-emerald-600">tablet_mac</span>
                      Tablet Synced
                    </span>
                  </div>
                  {getNormalizedChecklist(inspection).map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-[11px] text-slate-700 py-1 border-b border-slate-100 last:border-0 gap-2">
                      <div className="flex items-center gap-1.5">
                        <span aria-hidden="true" className={`material-symbols-outlined text-[15px] select-none shrink-0 ${
                          c.passed ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {c.passed ? "check_circle" : "cancel"}
                        </span>
                        <span className="leading-tight">{c.label}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                        c.passed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Standards Equipment</span>
                    <p className="font-medium text-slate-800">{inspection.standardsUsed || "Government Certified Test Weights"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">GPS Coordinates</span>
                    <p className="font-mono-code font-bold text-slate-900">{inspection.gpsCoords || "26.4499° N, 74.6399° E"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">LMO Officer Remarks</span>
                    <p className="text-slate-700 italic">{inspection.officerRemarks}</p>
                  </div>
                </div>
              </div>

              {/* Controller Endorsement input if awaiting sanction - ONLY visible to Assistant Controller */}
              {isAssistantController && (inspection.status === "SUBMITTED_FOR_APPROVAL" || app.status === "AWAITING_APPROVAL") && (
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg space-y-2">
                  <label className="font-bold text-amber-950 text-xs block">
                    Assistant Controller Final Sanction Endorsement:
                  </label>
                  <input
                    type="text"
                    value={controllerRemarks}
                    onChange={(e) => setControllerRemarks(e.target.value)}
                    placeholder="e.g. Verified and approved under Schedule VII. Stamping valid for 12 months."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReturningInspection(true)}
                      className="px-3.5 py-2 rounded-lg border border-rose-300 bg-white text-rose-700 font-bold text-xs hover:bg-rose-50"
                    >
                      Return / Reject
                    </button>
                    <button
                      type="button"
                      onClick={handleApproveInspection}
                      disabled={isApproving}
                      className="px-5 py-2 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-2xs disabled:opacity-50"
                    >
                      {isApproving ? "Sanctioning..." : "Approve & Issue Certificate"}
                    </button>
                  </div>
                </div>
              )}

              {/* Status Note for Business Applicant */}
              {!isAssistantController && app.status === "AWAITING_APPROVAL" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3 text-xs text-blue-950">
                  <span className="material-symbols-outlined text-[24px] text-blue-700 shrink-0">
                    pending_actions
                  </span>
                  <div>
                    <p className="font-bold">Field Inspection Completed — Awaiting Final Approval</p>
                    <p className="text-blue-900/80 text-[11px] mt-0.5">
                      The Legal Metrology Officer has recorded on-site test results and applied the lead seal. Your application is currently under final review by the Assistant Controller for certificate issuance.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              SECTION 7: TRACKING AND TIMELINE
             ========================================================================= */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Section 7 — Tracking and Timeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current statutory status and stage progression for this application.
              </p>
            </div>

            {/* Visual Tracking Stepper */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                {
                  id: "SUBMITTED",
                  title: "1. Submitted",
                  desc: "Application filed",
                  isDone: true,
                  isActive: app.status === "SUBMITTED" || app.status === "UNDER_REVIEW",
                },
                {
                  id: "ACCEPTED",
                  title: "2. Accepted",
                  desc: "Accepted by AC",
                  isDone:
                    app.status === "ACCEPTED" ||
                    app.status === "SCHEDULED" ||
                    app.status === "IN_PROGRESS" ||
                    app.status === "AWAITING_APPROVAL" ||
                    app.status === "CERTIFIED",
                  isActive: app.status === "ACCEPTED",
                },
                {
                  id: "SCHEDULED",
                  title: "3. Inspection",
                  desc: app.assignedLmoName ? `LMO: ${app.assignedLmoName.split(" ")[0]}` : "Field inspection",
                  isDone: app.status === "AWAITING_APPROVAL" || app.status === "CERTIFIED",
                  isActive: app.status === "SCHEDULED" || app.status === "IN_PROGRESS",
                },
                {
                  id: "AWAITING_APPROVAL",
                  title: "4. Final Review",
                  desc: "Review by AC",
                  isDone: app.status === "CERTIFIED",
                  isActive: app.status === "AWAITING_APPROVAL",
                },
                {
                  id: "CERTIFIED",
                  title: "5. Certificate",
                  desc: app.status === "REJECTED" ? "Rejected" : "Certificate Issued",
                  isDone: app.status === "CERTIFIED",
                  isActive: app.status === "CERTIFIED",
                  isRejected: app.status === "REJECTED",
                },
              ].map((step, sIdx) => {
                const isStepCompleted = step.isDone && !step.isActive;
                const isStepActive = step.isActive;
                const isRejected = step.isRejected;

                return (
                  <div
                    key={sIdx}
                    className={`p-3 rounded-lg border text-xs transition-colors ${
                      isRejected
                        ? "bg-rose-50 border-rose-200 text-rose-900"
                        : isStepCompleted
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                        : isStepActive
                        ? "bg-blue-50 border-blue-300 text-blue-950 shadow-2xs ring-1 ring-blue-300"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <span className="material-symbols-outlined text-[16px]">
                        {isRejected
                          ? "cancel"
                          : isStepCompleted
                          ? "check_circle"
                          : isStepActive
                          ? "pending"
                          : "radio_button_unchecked"}
                      </span>
                      <span>{step.title}</span>
                    </div>
                    <p className={`text-[11px] truncate ${isStepActive ? "text-blue-800 font-medium" : "text-slate-500"}`}>
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Sequential Timeline Events */}
            <div className="space-y-3 pl-2 text-xs pt-2 border-t border-slate-100">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Event History
              </h4>
              {(() => {
                const events = [...(app.timeline || [])];
                const hasAcceptedEvent = events.some(
                  (e) => e.event?.toLowerCase().includes("accepted")
                );
                if (
                  (app.status === "ACCEPTED" ||
                    app.status === "SCHEDULED" ||
                    app.status === "IN_PROGRESS" ||
                    app.status === "AWAITING_APPROVAL" ||
                    app.status === "CERTIFIED") &&
                  !hasAcceptedEvent
                ) {
                  events.push({
                    event: "Application Accepted by Assistant Controller",
                    date: app.acceptedDate ? formatDate(app.acceptedDate) : "Accepted",
                    actor: app.acceptedByName || "Dr. R. K. Sharma (Assistant Controller)",
                    note: "Statutory documents verified. Application approved for LMO field inspection.",
                  });
                }
                return events.map((t, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-slate-200 pb-2.5 last:border-l-0">
                    <span className="absolute -left-[7px] top-0.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-white" />
                    <p className="font-bold text-slate-900 text-xs">{t.event}</p>
                    <p className="text-[10px] text-slate-400">{t.date} • {t.actor}</p>
                    {t.note && (
                      <p className="text-[11px] text-slate-600 mt-0.5 bg-slate-50 p-2 rounded border border-slate-100">
                        {t.note}
                      </p>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </main>
      </div>

      {/* Rejection Modal for Initial Application */}
      {rejectingApp && (
        <Modal
          isOpen={rejectingApp}
          onClose={() => setRejectingApp(false)}
          title="Reject Verification Application"
          subtitle={`Application ID: ${app.id} • ${app.businessName}`}
          maxWidth="max-w-md"
          footer={
            <>
              <button
                type="button"
                onClick={() => setRejectingApp(false)}
                className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-rose-700 text-white hover:bg-rose-800 transition-colors shadow-2xs"
              >
                Confirm Rejection
              </button>
            </>
          }
        >
          <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Enter mandatory statutory rejection reason to be dispatched to the applicant.
            </p>
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Rejection Reason *</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Model approval certificate invalid or expired..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Assign LMO Modal */}
      {assigningApp && (
        <Modal
          isOpen={assigningApp}
          onClose={() => setAssigningApp(false)}
          title="Assign Legal Metrology Officer (LMO)"
          subtitle={`Application ID: ${app.id} • ${app.instrumentName}`}
          maxWidth="max-w-lg"
          footer={
            <>
              <button
                type="button"
                onClick={() => setAssigningApp(false)}
                className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssign}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
              >
                Confirm Field Assignment
              </button>
            </>
          }
        >
          <form onSubmit={handleConfirmAssign} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Select {app.district || "District"} LMO (Same-District Enforcement)
              </label>
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                required
              >
                <option value="">-- Choose Field Officer --</option>
                {(lmos || [])
                  .filter((lmo) => !lmo.district_id || lmo.district_id === app.district_id)
                  .map((lmo) => (
                    <option key={lmo.officerId || lmo.id} value={lmo.officerId || lmo.id}>
                      {lmo.name} ({lmo.officerId || lmo.badgeNumber || lmo.id}) — {lmo.jurisdiction}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Scheduled Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Time Slot</label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  <option>10:00 AM</option>
                  <option>11:30 AM</option>
                  <option>02:00 PM</option>
                  <option>04:00 PM</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Return Inspection Modal */}
      {returningInspection && (
        <Modal
          isOpen={returningInspection}
          onClose={() => setReturningInspection(false)}
          title="Return Field Inspection for Correction"
          subtitle={`Inspection: ${inspection?.id} • ${app.businessName}`}
          maxWidth="max-w-md"
          footer={
            <>
              <button
                type="button"
                onClick={() => setReturningInspection(false)}
                className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturnInspection}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-rose-700 text-white hover:bg-rose-800 transition-colors shadow-2xs"
              >
                Confirm Return
              </button>
            </>
          }
        >
          <form onSubmit={handleConfirmReturnInspection} className="space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Enter the reason why this inspection is being rejected or returned to the LMO.
            </p>
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Non-Compliance Reason *</label>
              <textarea
                rows={3}
                value={inspectionReturnReason}
                onChange={(e) => setInspectionReturnReason(e.target.value)}
                placeholder="e.g. Volumetric delivery error exceeds allowable MPE..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <Modal
          isOpen={Boolean(selectedImage)}
          onClose={() => setSelectedImage(null)}
          title={selectedImage.title}
          subtitle="Verification Evidence Photograph"
          maxWidth="max-w-xl"
          footer={
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              Close Preview
            </button>
          }
        >
          <div className="h-64 bg-slate-900 rounded-lg flex items-center justify-center p-4 text-center text-slate-300 text-xs">
            <div>
              <span className="material-symbols-outlined text-[48px] text-slate-500 block mb-2">
                image
              </span>
              <p className="font-bold text-white text-sm">{selectedImage.title}</p>
              <p className="text-[10px] text-slate-400 mt-1">High-resolution verification evidence image on record.</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Certificate Preview Modal */}
      {viewingCertificate && (
        <CertificatePreviewModal
          certificate={viewingCertificate}
          isOpen={Boolean(viewingCertificate)}
          onClose={() => setViewingCertificate(null)}
        />
      )}
    </div>
  );
}
