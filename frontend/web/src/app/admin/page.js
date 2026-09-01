"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import MetricCard from "@/components/ui/MetricCard";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import VerificationTrendsChart from "@/components/charts/VerificationTrendsChart";
import CategoryDistributionChart from "@/components/charts/CategoryDistributionChart";
import DistrictComplianceChart from "@/components/charts/DistrictComplianceChart";
import InspectionLocationMap from "@/components/map/InspectionLocationMap";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { exportToCSV } from "@/lib/exportUtils";

export default function AssistantControllerPortalPage() {
  const {
    applications,
    instruments,
    inspections,
    certificates,
    lmoDistrictOfficers,
    assignOfficerAndSchedule,
    approveLmoSubmissionAndIssueCertificate,
    rejectLmoSubmission,
  } = useMetrixStore();

  const [activeTab, setActiveTab] = useState("submissions"); // 'submissions' | 'officers' | 'certificates' | 'allocation' | 'analytics'
  const [certSearch, setCertSearch] = useState("");
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [rejectingSubmission, setRejectingSubmission] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(
    "Corner eccentricity test load error (+15g) exceeded Maximum Permissible Error tolerance. Mechanical recalibration required before re-inspection."
  );
  const [controllerApprovalRemarks, setControllerApprovalRemarks] = useState(
    "Verified all standard test load errors are within Schedule VII MPE limits. Tamper-proof seal verified. Certificate sanctioned."
  );
  const [viewingCertificate, setViewingCertificate] = useState(null);

  // Application allocation modal state
  const [assigningApp, setAssigningApp] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState("Inspector Rajesh Sharma (LMO-104-DL)");
  const [scheduledDate, setScheduledDate] = useState("2026-09-03");
  const [scheduledTime, setScheduledTime] = useState("11:00 AM");

  // Filter Submissions
  const pendingSubmissions = inspections.filter(
    (i) => i.status === "SUBMITTED_FOR_APPROVAL" || i.status === "SCHEDULED"
  );
  const awaitingApprovalOnly = inspections.filter(
    (i) => i.status === "SUBMITTED_FOR_APPROVAL"
  );

  const pendingApplications = applications.filter(
    (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
  );

  // Filter Certificates Created Till Now
  const filteredCertificates = useMemo(() => {
    return certificates.filter((c) => {
      if (!certSearch.trim()) return true;
      const q = certSearch.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.certificateNumber.toLowerCase().includes(q) ||
        c.instrumentName.toLowerCase().includes(q) ||
        c.serialNumber.toLowerCase().includes(q) ||
        c.ownerName.toLowerCase().includes(q) ||
        c.officerName.toLowerCase().includes(q)
      );
    });
  }, [certificates, certSearch]);

  // Actions
  const handleApproveSubmission = () => {
    if (!reviewingSubmission) return;
    approveLmoSubmissionAndIssueCertificate(
      reviewingSubmission.id,
      controllerApprovalRemarks
    );
    setReviewingSubmission(null);
  };

  const handleConfirmRejection = (e) => {
    e.preventDefault();
    if (!rejectingSubmission) return;
    rejectLmoSubmission(rejectingSubmission.id, rejectionReason);
    setRejectingSubmission(null);
    setReviewingSubmission(null);
  };

  const handleConfirmAssignment = (e) => {
    e.preventDefault();
    if (!assigningApp) return;

    assignOfficerAndSchedule(
      assigningApp.id,
      selectedOfficer,
      scheduledDate,
      scheduledTime
    );
    setAssigningApp(null);
  };

  const handleExportCertificates = () => {
    const data = certificates.map((c) => ({
      "Certificate ID": c.id,
      "Certificate Number": c.certificateNumber,
      "Instrument": c.instrumentName,
      "Serial Number": c.serialNumber,
      "Registered Owner": c.ownerName,
      "Valid From": c.validFrom,
      "Valid Until": c.validUntil,
      "Status": c.status,
      "Issuing LMO": c.officerName,
      "Approving Authority": c.approvingAuthority || "Dr. S. K. Narula, Assistant Controller",
      "Seal Number": c.sealNumber,
      "Security Hash": c.securityHash,
    }));
    exportToCSV(`District_LegalMetrology_Certificates_${new Date().toISOString().split("T")[0]}.csv`, data);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Assistant Controller Management Portal"
          subtitle="District Jurisdiction: South Delhi District • Supervisory Officer: Dr. S. K. Narula, Assistant Controller of Legal Metrology"
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            { label: "Assistant Controller Portal" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Authority Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-600 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-[28px]">
                  account_balance
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    District Authority Console
                  </span>
                  <span className="text-slate-400 text-xs font-mono-code">
                    AUTH-DL-AC-04
                  </span>
                </div>
                <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                  Office of the Assistant Controller of Legal Metrology
                </h1>
                <p className="text-xs text-slate-300">
                  Supervising Officer: <strong className="text-white">Dr. S. K. Narula</strong> • South Delhi Enforcement District
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab("submissions")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "submissions"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                Pending Submissions ({awaitingApprovalOnly.length})
              </button>
              <button
                onClick={() => setActiveTab("certificates")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "certificates"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                Certificates ({certificates.length})
              </button>
            </div>
          </div>

          {/* Assistant Controller KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="District LMO Units"
              value={lmoDistrictOfficers ? lmoDistrictOfficers.length : 4}
              subtitle="Active field inspection officers"
              icon="engineering"
            />
            <MetricCard
              title="Awaiting Approval"
              value={awaitingApprovalOnly.length}
              subtitle="LMO submissions to sanction"
              icon="approval"
              trend={awaitingApprovalOnly.length > 0 ? "Requires review" : "Up to date"}
              trendPositive={awaitingApprovalOnly.length === 0}
            />
            <MetricCard
              title="Certificates Created"
              value={certificates.length}
              subtitle="Total verified & sealed till now"
              icon="verified"
              trend="+2 this month"
              trendPositive={true}
            />
            <MetricCard
              title="District Compliance"
              value="98.4%"
              subtitle="Statutory target: 95.0%"
              icon="balance"
              trend="+3.4% above quota"
              trendPositive={true}
            />
          </div>

          {/* Main Navigation Tabs */}
          <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab("submissions")}
              className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "submissions"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                assignment_turned_in
              </span>
              LMO Field Submissions Review
              {awaitingApprovalOnly.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                  {awaitingApprovalOnly.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("officers")}
              className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "officers"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
              District LMO Officers Roster
            </button>

            <button
              onClick={() => setActiveTab("certificates")}
              className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "certificates"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                verified
              </span>
              Certificates Created Till Now ({certificates.length})
            </button>

            <button
              onClick={() => setActiveTab("allocation")}
              className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "allocation"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                person_add
              </span>
              Application Allocation Queue ({pendingApplications.length})
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "analytics"
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                insights
              </span>
              District Analytics &amp; GIS
            </button>
          </div>

          {/* =========================================================================
              TAB 1: LMO FIELD SUBMISSIONS REVIEW (APPROVAL & REJECTION PIPELINE)
             ========================================================================= */}
          {activeTab === "submissions" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    LMO Field Verification Submissions
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review on-site error tolerances, physical checklists, and lead wire stamps. Approve to sanction digital certificates or reject with notes to applicants.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                  {awaitingApprovalOnly.length} Submissions Pending Controller Decision
                </span>
              </div>

              {pendingSubmissions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500">
                  ✓ No pending submissions from district LMOs at this time.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSubmissions.map((insp) => (
                    <div
                      key={insp.id}
                      className="bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-2xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                    >
                      <div className="space-y-2 text-xs flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono-code font-bold text-slate-900 text-sm">
                            {insp.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              insp.status === "SUBMITTED_FOR_APPROVAL"
                                ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                                : "bg-blue-100 text-blue-900 border border-blue-200"
                            }`}
                          >
                            {insp.status === "SUBMITTED_FOR_APPROVAL"
                              ? "⚡ Awaiting Controller Approval"
                              : insp.status}
                          </span>
                          <span className="text-slate-500 font-semibold">
                            Filing Ref: {insp.applicationId}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">
                              Regulated Instrument
                            </span>
                            <p className="font-bold text-slate-900 text-sm">
                              {insp.instrumentName}
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              S/N: {insp.serialNumber || "SN-2022-901"} • Cap: {insp.capacity || "60T"}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">
                              Submitting Field Officer
                            </span>
                            <p className="font-bold text-slate-900">
                              {insp.officer}
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              Badge: {insp.officerBadge || "LMO-104-DL"} • {insp.officerRole}
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500">Premises: </span>
                            <strong className="text-slate-800">{insp.location}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500">Security Seal: </span>
                            <strong className="text-emerald-700 font-mono-code">
                              {insp.sealNumber || "SEAL-DL-2026-8819"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-500">Test Result: </span>
                            <span className="font-bold text-emerald-700">
                              All MPE Tolerances Passed (✓)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Review & Approve / Reject Actions */}
                      <div className="flex flex-row lg:flex-col items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                        <button
                          onClick={() => setReviewingSubmission(insp)}
                          className="w-full sm:w-auto lg:w-44 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            fact_check
                          </span>
                          Review &amp; Verify Details
                        </button>
                        <button
                          onClick={() => {
                            setRejectingSubmission(insp);
                            setReviewingSubmission(null);
                          }}
                          className="w-full sm:w-auto lg:w-44 px-4 py-2 rounded-lg border border-rose-300 text-rose-700 bg-rose-50/50 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            cancel
                          </span>
                          Reject with Note
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 2: DISTRICT LMO OFFICERS ROSTER
             ========================================================================= */}
          {activeTab === "officers" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    District Legal Metrology Officers (LMOs) Roster
                  </h3>
                  <p className="text-xs text-slate-500">
                    Field verification workforce assigned to South Delhi district jurisdiction
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg">
                  {lmoDistrictOfficers ? lmoDistrictOfficers.length : 4} Officers Under Controller Jurisdiction
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(lmoDistrictOfficers || []).map((off) => (
                  <div
                    key={off.badgeId}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                          {off.name.split(" ")[1]?.substring(0, 2) || "LM"}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">
                            {off.name}
                          </h4>
                          <span className="font-mono-code font-bold text-[11px] text-slate-500">
                            Badge: {off.badgeId} • {off.designation}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {off.status === "ON_DUTY" ? "Active Field" : "Lab Duty"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">
                          Assigned Territory Zone
                        </span>
                        <p className="font-semibold text-slate-800">{off.zone}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div>
                          <span className="text-slate-400">Official Phone:</span>
                          <p className="font-mono-code font-semibold text-slate-700">
                            {off.phone}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Govt. Email:</span>
                          <p className="font-mono-code font-semibold text-slate-700 truncate">
                            {off.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Active Load
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {off.activeInspections}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Completed
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {off.completedTotal}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Compliance
                        </span>
                        <span className="font-bold text-emerald-700 text-sm">
                          {off.complianceRate}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: CERTIFICATES CREATED TILL NOW (WITH REAL-TIME SEARCH)
             ========================================================================= */}
          {activeTab === "certificates" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    District Certificates Created Till Now
                  </h3>
                  <p className="text-xs text-slate-500">
                    Authoritative registry of all legally verified and sealed weighing &amp; measuring certificates in South Delhi
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportCertificates}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      download
                    </span>
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Search Filter Bar */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search certificate by ID, Certificate Number, Instrument Name, Serial No, Merchant, or Officer..."
                  value={certSearch}
                  onChange={(e) => setCertSearch(e.target.value)}
                  className="flex-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
                {certSearch && (
                  <button
                    onClick={() => setCertSearch("")}
                    className="text-xs text-slate-400 hover:text-slate-700 px-2"
                  >
                    Clear
                  </button>
                )}
              </div>

              {filteredCertificates.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500">
                  No certificates found matching "{certSearch}".
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono-code font-bold text-slate-900 text-sm">
                            {cert.id}
                          </span>
                          <span className="font-mono-code text-[11px] text-slate-500 font-semibold px-2 py-0.5 bg-slate-100 rounded">
                            {cert.certificateNumber}
                          </span>
                          <Badge status={cert.status} />
                        </div>

                        <p className="font-bold text-sm text-slate-900">
                          {cert.instrumentName} (S/N: {cert.serialNumber})
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1">
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">
                              Registered Business / Establishment
                            </span>
                            <p className="font-semibold text-slate-800">
                              {cert.ownerName}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block">
                              Issuing LMO &amp; Approving Authority
                            </span>
                            <p className="font-semibold text-slate-800">
                              {cert.officerName} • {cert.approvingAuthority || "Dr. S. K. Narula, Assistant Controller"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                          <span>
                            📅 Valid: <strong>{formatDate(cert.validFrom)}</strong> to{" "}
                            <strong>{formatDate(cert.validUntil)}</strong>
                          </span>
                          <span>
                            🔒 Seal: <strong className="font-mono-code text-slate-800">{cert.sealNumber}</strong>
                          </span>
                          <span className="font-mono-code truncate max-w-xs">
                            Hash: {cert.securityHash}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                        <button
                          onClick={() => setViewingCertificate(cert)}
                          className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            visibility
                          </span>
                          View Certificate
                        </button>
                        <Link
                          href={`/verify/${cert.id}`}
                          className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Public QR Verification Link"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            qr_code
                          </span>
                          Verify QR
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 4: APPLICATIONS ALLOCATION QUEUE
             ========================================================================= */}
          {activeTab === "allocation" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Merchant Filings Awaiting LMO Officer Dispatch
                  </h3>
                  <p className="text-xs text-slate-500">
                    Assign field verification duty and inspection dates to district LMO officers
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                  {pendingApplications.length} Unallocated Applications
                </span>
              </div>

              {pendingApplications.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500">
                  ✓ All submitted merchant applications have been scheduled with assigned LMO officers.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                  {pendingApplications.map((app) => (
                    <div
                      key={app.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-code font-bold text-slate-900">
                            {app.id}
                          </span>
                          <Badge status={app.status} />
                          <span className="text-slate-500 font-semibold">
                            {app.applicationType}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900">
                          {app.instrumentName} (S/N: {app.serialNumber})
                        </p>
                        <p className="text-slate-500">
                          📍 {app.location} • Submitted: {formatDate(app.submissionDate)} • Fee: {app.feePaid}
                        </p>
                      </div>

                      <button
                        onClick={() => setAssigningApp(app)}
                        className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs shrink-0 self-start sm:self-auto"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          person_add
                        </span>
                        Assign LMO &amp; Schedule
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 5: DISTRICT ANALYTICS & GIS RADAR
             ========================================================================= */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <InspectionLocationMap inspections={inspections} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Monthly District Verification Trends (2026)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Merchant applications filed vs. certificates sanctioned
                    </p>
                  </div>
                  <VerificationTrendsChart />
                </div>

                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Instrument Category Shares
                    </h3>
                    <p className="text-xs text-slate-500">
                      South Delhi registered commercial fleet
                    </p>
                  </div>
                  <CategoryDistributionChart />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      District-Wise Statutory Compliance Rates
                    </h3>
                    <p className="text-xs text-slate-500">
                      South Delhi Zone vs Other NCT Delhi Districts
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    Statutory Benchmark: 95.0%
                  </span>
                </div>
                <DistrictComplianceChart />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MODAL 1: REVIEW & VERIFY LMO SUBMISSION (ASSISTANT CONTROLLER SANCTION)
         ========================================================================= */}
      {reviewingSubmission && (
        <Modal
          isOpen={Boolean(reviewingSubmission)}
          onClose={() => setReviewingSubmission(null)}
          title="Supervisory Review of LMO Field Verification"
          subtitle={`Submission Ref: ${reviewingSubmission.id} • ${reviewingSubmission.instrumentName}`}
          maxWidth="max-w-3xl"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setRejectingSubmission(reviewingSubmission);
                  setReviewingSubmission(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-lg border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
                Reject &amp; Send Rejection Note
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingSubmission(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleApproveSubmission}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Approve &amp; Generate Certificate
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Officer & Premises Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Field Officer Details
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {reviewingSubmission.officer}
                </p>
                <p className="text-slate-600 text-[11px]">
                  Badge: {reviewingSubmission.officerBadge || "LMO-104-DL"} • {reviewingSubmission.officerRole}
                </p>
                <p className="text-slate-500 text-[10px] mt-1">
                  GPS Geotag: <span className="font-mono-code">{reviewingSubmission.gpsCoords}</span>
                </p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Establishment &amp; Plaque
                </span>
                <p className="font-bold text-slate-900">
                  {reviewingSubmission.ownerName}
                </p>
                <p className="text-slate-600 text-[11px]">
                  📍 {reviewingSubmission.location}
                </p>
                <p className="text-emerald-700 font-mono-code text-[11px] font-bold mt-1">
                  Lead Wire Seal Affixed: {reviewingSubmission.sealNumber || "SEAL-DL-2026-8819"}
                </p>
              </div>
            </div>

            {/* Checklist items */}
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider block mb-2">
                Field Inspection Checklist (Schedule VII Compliance)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {reviewingSubmission.checklistItems?.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <span className="text-[11px] font-medium text-slate-800">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.passed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {item.passed ? "✓ PASS" : "FAIL"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Measurement Errors vs MPE */}
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider block mb-2">
                Standard Test Load Observations vs Max Permissible Error (MPE)
              </span>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="py-2 px-3">Standard Test Load</th>
                      <th className="py-2 px-3">Observed Reading</th>
                      <th className="py-2 px-3">MPE Limit</th>
                      <th className="py-2 px-3 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reviewingSubmission.measurements?.map((m, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {m.testLoad}
                        </td>
                        <td className="py-2 px-3 font-mono-code text-slate-800">
                          {m.observed}
                        </td>
                        <td className="py-2 px-3 font-mono-code text-slate-600">
                          {m.mpe}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                            {m.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Officer Remarks */}
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider block mb-1">
                LMO Officer Observations
              </span>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 italic">
                "{reviewingSubmission.officerRemarks || reviewingSubmission.remarks}"
              </p>
            </div>

            {/* Assistant Controller Remarks Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 flex items-center justify-between">
                <span>Assistant Controller Approval Sanction Note</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  Appears on official certificate audit trail
                </span>
              </label>
              <textarea
                rows={2}
                value={controllerApprovalRemarks}
                onChange={(e) => setControllerApprovalRemarks(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 2: REJECT LMO SUBMISSION & SEND REJECTION NOTE TO BUSINESS
         ========================================================================= */}
      {rejectingSubmission && (
        <Modal
          isOpen={Boolean(rejectingSubmission)}
          onClose={() => setRejectingSubmission(null)}
          title="Reject Verification & Send Statutory Rejection Note"
          subtitle={`Instrument: ${rejectingSubmission.instrumentName} • Applicator: ${rejectingSubmission.ownerName}`}
          maxWidth="max-w-lg"
          footer={
            <>
              <button
                type="button"
                onClick={() => setRejectingSubmission(null)}
                className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-rose-700 text-white hover:bg-rose-800 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                Issue Statutory Rejection Notice
              </button>
            </>
          }
        >
          <form onSubmit={handleConfirmRejection} className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-rose-700">
                  warning
                </span>
                Immediate Statutory Action
              </span>
              <p className="text-[11px] leading-relaxed">
                Issuing a rejection will set this instrument to <strong>OUT OF STAMP (EXPIRED)</strong> and dispatch the formal rejection note directly to the merchant's portal so they can recalibrate and file a re-verification application.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">
                Statutory Reason for Rejection / Non-Compliance Note:
              </label>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                required
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p>
                <strong>Applicant:</strong> {rejectingSubmission.ownerName}
              </p>
              <p>
                <strong>Instrument S/N:</strong> {rejectingSubmission.serialNumber || "AW-60T-2022-901"}
              </p>
              <p>
                <strong>Inspecting LMO:</strong> {rejectingSubmission.officer}
              </p>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 3: VIEW OFFICIAL CERTIFICATE (PDF SLAB)
         ========================================================================= */}
      {viewingCertificate && (
        <Modal
          isOpen={Boolean(viewingCertificate)}
          onClose={() => setViewingCertificate(null)}
          title="Digital Verification Certificate"
          subtitle={`Certificate ID: ${viewingCertificate.id} • ${viewingCertificate.certificateNumber}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-500 font-mono-code">
                Hash: {viewingCertificate.securityHash}
              </span>
              <button
                type="button"
                onClick={() => setViewingCertificate(null)}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                Close Certificate
              </button>
            </div>
          }
        >
          <div className="border-4 border-double border-slate-800 p-6 bg-amber-50/20 rounded-xl space-y-4 text-xs font-serif text-slate-900">
            <div className="text-center space-y-1 border-b border-slate-300 pb-3">
              <span className="text-[10px] font-sans uppercase font-bold tracking-widest text-slate-600">
                Government of National Capital Territory of Delhi
              </span>
              <h2 className="text-lg font-bold font-sans text-slate-900">
                DIRECTORATE OF LEGAL METROLOGY
              </h2>
              <p className="text-xs italic text-slate-700">
                Certificate of Verification of Weighing and Measuring Instrument
              </p>
              <span className="text-[10px] font-mono-code font-bold bg-slate-900 text-white px-2 py-0.5 rounded inline-block">
                {viewingCertificate.certificateNumber}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <p className="leading-relaxed">
                This is to certify that the weighing / measuring instrument described below has been officially inspected, verified, and stamped in accordance with the <strong>Legal Metrology Act, 2009</strong> and the <strong>Delhi Legal Metrology Enforcement Rules</strong>.
              </p>

              <div className="bg-white/80 p-3 rounded border border-slate-300 grid grid-cols-2 gap-2 text-[11px] font-sans">
                <div>
                  <span className="text-slate-500">Instrument:</span>{" "}
                  <strong>{viewingCertificate.instrumentName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Serial No:</span>{" "}
                  <strong className="font-mono-code">{viewingCertificate.serialNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Registered Owner:</span>{" "}
                  <strong>{viewingCertificate.ownerName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Security Seal No:</span>{" "}
                  <strong className="font-mono-code text-emerald-800">{viewingCertificate.sealNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Valid From:</span>{" "}
                  <strong>{formatDate(viewingCertificate.validFrom)}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Valid Until:</span>{" "}
                  <strong className="text-rose-700">{formatDate(viewingCertificate.validUntil)}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-300 pt-3 text-[11px] font-sans">
              <div>
                <span className="text-slate-500 block">Inspected by:</span>
                <strong>{viewingCertificate.officerName}</strong>
                <p className="text-[10px] text-slate-500">{viewingCertificate.officerDesignation}</p>
              </div>

              <div className="text-right">
                <span className="text-slate-500 block">Sanctioned &amp; Approved by:</span>
                <strong className="text-slate-900">
                  {viewingCertificate.approvingAuthority || "Dr. S. K. Narula"}
                </strong>
                <p className="text-[10px] text-slate-500">Assistant Controller of Legal Metrology</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 4: ALLOCATE APPLICATION TO LMO
         ========================================================================= */}
      {assigningApp && (
        <Modal
          isOpen={Boolean(assigningApp)}
          onClose={() => setAssigningApp(null)}
          title="Schedule Inspection &amp; Allocate District Officer"
          subtitle={`Filing ID: ${assigningApp.id} • ${assigningApp.instrumentName}`}
          maxWidth="max-w-lg"
          footer={
            <>
              <button
                type="button"
                onClick={() => setAssigningApp(null)}
                className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                className="px-5 py-2 text-xs font-bold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
              >
                Confirm Allocation
              </button>
            </>
          }
        >
          <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Select District Legal Metrology Officer (LMO)
              </label>
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                required
              >
                {(lmoDistrictOfficers || []).map((off) => (
                  <option key={off.badgeId} value={`${off.name} (${off.badgeId})`}>
                    {off.name} ({off.badgeId}) — {off.zone}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Scheduled Visit Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Time Slot
                </label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                >
                  <option>10:00 AM</option>
                  <option>11:30 AM</option>
                  <option>02:00 PM</option>
                  <option>04:00 PM</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              <span className="font-bold text-slate-900 block">
                Operating Premises:
              </span>
              {assigningApp.location}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
