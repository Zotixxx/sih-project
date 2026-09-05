"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useMetrixStore } from "@/lib/store";
import { portalPath } from "@/lib/routes";
import { formatDate } from "@/lib/utils";
import { exportToCSV } from "@/lib/exportUtils";

export default function ApplicationsPage() {
  const router = useRouter();
  const {
    currentUser,
    userRole,
    applications,
    lmos,
    currentDraft,
    clearDraft,
    acceptApplication,
    rejectApplication,
    assignLmo,
  } = useMetrixStore();
  const href = (path) => portalPath(currentUser, path);

  const isBusiness = userRole === "business" || currentUser?.role === "BUSINESS";
  const isAssistantController =
    userRole === "admin" ||
    currentUser?.role === "ASSISTANT_CONTROLLER" ||
    currentUser?.role === "SYSTEM_ADMIN";
  const districtLabel = currentUser?.districtName || currentUser?.district_id || "District";

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [lmoFilter, setLmoFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Modals state
  const [viewingApp, setViewingApp] = useState(null);
  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [assigningApp, setAssigningApp] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Distinct Instrument Types for Filter
  const instrumentTypes = useMemo(() => {
    const types = new Set((applications || []).map((a) => a.instrumentType));
    return Array.from(types);
  }, [applications]);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return (applications || [])
      .filter((app) => {
        // Status filter
        if (statusFilter !== "ALL" && app.status !== statusFilter) return false;
        // Instrument type filter
        if (typeFilter !== "ALL" && app.instrumentType !== typeFilter) return false;
        // LMO filter
        if (lmoFilter !== "ALL" && app.assignedLmoId !== lmoFilter) return false;
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matches =
            app.id.toLowerCase().includes(q) ||
            app.businessName.toLowerCase().includes(q) ||
            app.applicantName.toLowerCase().includes(q) ||
            app.serialNumber?.toLowerCase().includes(q) ||
            app.instrumentName.toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      });
  }, [applications, statusFilter, typeFilter, lmoFilter, search]);

  const formatApplicationAddress = (app) =>
    [app?.address, app?.city, app?.district || app?.district_id, app?.state, app?.pincode]
      .filter(Boolean)
      .join(", ") || "Not recorded";

  // Actions
  const handleAccept = async (app) => {
    await acceptApplication(app.id);
    if (viewingApp?.id === app.id) {
      setViewingApp((prev) => ({ ...prev, status: "ACCEPTED" }));
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingApp || !rejectionReason.trim()) return;

    await rejectApplication(rejectingApp.id, rejectionReason);
    setRejectingApp(null);
    setRejectionReason("");
    if (viewingApp?.id === rejectingApp.id) {
      setViewingApp(null);
    }
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!assigningApp) return;
    if (!selectedOfficer) return;

    await assignLmo({
      applicationId: assigningApp.id,
      officerId: selectedOfficer,
      scheduledDate,
    });
    setAssigningApp(null);
    if (viewingApp?.id === assigningApp.id) {
      setViewingApp(null);
    }
  };

  const handleExportCSV = () => {
    const data = filteredApplications.map((a) => ({
      "Application ID": a.id,
      "Business Name": a.businessName,
      "Applicant Name": a.applicantName,
      "Instrument Type": a.instrumentType,
      "Serial Number": a.serialNumber,
      "Application Date": a.applicationDate,
      "Status": a.status,
      "Assigned LMO": a.assignedLmoName,
      "Fee Paid": a.feePaid,
    }));
    exportToCSV(`MetriX_Applications_${districtLabel}_${new Date().toISOString().split("T")[0]}.csv`, data);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
          <TopNavBar
          title={isBusiness ? "Applications" : "Verification Applications Queue"}
          subtitle={
            isBusiness
              ? "Track your submitted verification applications and workflow history."
              : `Review statutory verification filings submitted across ${districtLabel}.`
          }
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            { label: "Applications" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Controls: Search & Filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {isBusiness ? "My Applications" : `Applications Registry (${districtLabel})`}
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {filteredApplications.length} of {applications.length} total filings
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Export CSV
                </button>

                <Link
                  href={href("/applications/apply")}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  New Application
                </Link>
              </div>
            </div>

            {/* Saved Draft Notification Banner (Section 36, 37) */}
            {currentDraft && (
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                    <span className="material-symbols-outlined text-[20px]">edit_document</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-xs">
                        Saved Application Draft ({currentDraft.instrumentName || "Weighing Instrument"})
                      </p>
                      <span className="px-1.5 py-0.2 bg-blue-200 text-blue-900 text-[10px] font-bold rounded">
                        Step {currentDraft.step || 1} of 5
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      You have an unfinished verification application. You can resume right where you left off.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={href("/applications/apply?resumeDraft=true")}
                    className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    Continue Application
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                  <button
                    onClick={clearDraft}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white text-xs font-semibold transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Application ID, Business Name, Applicant Name, or Serial Number..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Dropdowns & Status Chips */}
            <div className="flex flex-wrap items-center gap-3 text-xs border-t border-slate-100 pt-3">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px] font-bold uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="AWAITING_APPROVAL">Awaiting Approval</option>
                  <option value="CERTIFIED">Certified</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Instrument Type Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px] font-bold uppercase">Instrument:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="ALL">All Instrument Types</option>
                    {instrumentTypes.map((type) => (
                      <option key={type || "unknown-instrument-type"} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned LMO Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px] font-bold uppercase">LMO:</span>
                <select
                  value={lmoFilter}
                  onChange={(e) => setLmoFilter(e.target.value)}
                  className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="ALL">All Officers</option>
                  {(lmos || []).map((lmo) => (
                      <option key={lmo.lmo_id || lmo.domainId || lmo.id} value={lmo.lmo_id || lmo.domainId || lmo.id}>
                        {lmo.name} ({lmo.lmo_id || lmo.domainId || lmo.id})
                    </option>
                  ))}
                </select>
              </div>

              {(statusFilter !== "ALL" || typeFilter !== "ALL" || lmoFilter !== "ALL" || search) && (
                <button
                  onClick={() => {
                    setStatusFilter("ALL");
                    setTypeFilter("ALL");
                    setLmoFilter("ALL");
                    setSearch("");
                  }}
                  className="ml-auto text-xs text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>

          {/* Applications Data Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Business &amp; Applicant</th>
                    <th className="py-3 px-4">Instrument Type</th>
                    <th className="py-3 px-4">Serial Number</th>
                    <th className="py-3 px-4">Application Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assigned LMO</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                        No applications found matching the selected search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        onClick={() => router.push(href(`/applications/${app.id}`))}
                      >
                        <td className="py-3.5 px-4 font-mono-code font-bold text-slate-900 group-hover:text-blue-900">
                          {app.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 group-hover:text-blue-900">
                            {app.businessName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {app.applicantName} • {app.phone}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">
                            {app.instrumentType}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">
                            {app.instrumentName}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-mono-code text-slate-700 font-semibold">
                          {app.serialNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {formatDate(app.applicationDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={app.status} />
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[11px] font-semibold ${
                              app.assignedLmoId
                                ? "text-slate-900"
                                : "text-slate-400 italic"
                            }`}
                          >
                            {app.assignedLmoName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={href(`/applications/${app.id}`)}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 transition-colors shadow-2xs inline-block"
                            >
                              View Details
                            </Link>

                            {/* Quick Accept/Assign ONLY for Assistant Controller */}
                            {isAssistantController && (
                              <>
                                {(app.status === "SUBMITTED" || app.status === "UNDER_REVIEW") && (
                                  <button
                                    onClick={() => handleAccept(app)}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors shadow-2xs"
                                    title="Accept Application"
                                  >
                                    Accept
                                  </button>
                                )}

                                {app.status === "ACCEPTED" && (
                                  <button
                                    onClick={() => setAssigningApp(app)}
                                    className="px-2.5 py-1.5 rounded-lg bg-blue-700 text-white font-bold text-[11px] hover:bg-blue-800 transition-colors shadow-2xs"
                                    title="Assign LMO"
                                  >
                                    Assign
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* =========================================================================
          APPLICATION DETAILS MODAL (6 DISTINCT SECTIONS)
         ========================================================================= */}
      {viewingApp && (
        <Modal
          isOpen={Boolean(viewingApp)}
          onClose={() => setViewingApp(null)}
          title="Application Details"
          subtitle={`Application ID: ${viewingApp.id} • ${viewingApp.businessName}`}
          maxWidth="max-w-4xl"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3 w-full">
              {/* Decision Actions - ONLY for Assistant Controller */}
              <div className="flex items-center gap-2">
                {isAssistantController && (
                  <>
                    {(viewingApp.status === "SUBMITTED" || viewingApp.status === "UNDER_REVIEW") && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAccept(viewingApp)}
                          className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          Accept Application
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingApp(viewingApp);
                          }}
                          className="px-4 py-2 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">cancel</span>
                          Reject Application
                        </button>
                      </>
                    )}

                    {viewingApp.status === "ACCEPTED" && (
                      <button
                        type="button"
                        onClick={() => setAssigningApp(viewingApp)}
                        className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">person_add</span>
                        Assign LMO &amp; Schedule
                      </button>
                    )}
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewingApp(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Close Details
              </button>
            </div>
          }
        >
          <div className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* SECTION 1 — APPLICATION */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  SECTION 1 — APPLICATION INFORMATION
                </span>
                <Badge status={viewingApp.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Application ID</span>
                  <span className="font-mono-code font-bold text-slate-900">{viewingApp.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Application Type</span>
                  <span className="font-bold text-slate-800">{viewingApp.applicationType}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Application Date</span>
                  <span className="font-medium text-slate-800">{formatDate(viewingApp.applicationDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Fee Paid</span>
                  <span className="font-mono-code font-bold text-emerald-800">{viewingApp.feePaid || "₹ 1,500.00"}</span>
                </div>
              </div>
            </div>

            {/* SECTION 2 — APPLICANT / BUSINESS */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-2">
                SECTION 2 — APPLICANT &amp; BUSINESS DETAILS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Business / Establishment</span>
                  <p className="font-bold text-slate-900 text-sm">{viewingApp.businessName}</p>
                  <p className="text-[11px] text-slate-500">Owner: {viewingApp.applicantName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Contact Information</span>
                  <p className="font-medium text-slate-800">📞 {viewingApp.phone}</p>
                  <p className="font-medium text-slate-800">✉️ {viewingApp.email}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Business Premises Address</span>
                  <p className="font-medium text-slate-800">
                    {formatApplicationAddress(viewingApp)}
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 3 — INSTRUMENT */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-2">
                SECTION 3 — REGULATED INSTRUMENT SPECIFICATIONS
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Instrument ID</span>
                  <span className="font-mono-code font-bold text-slate-900">{viewingApp.instrumentId}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Instrument Type</span>
                  <span className="font-bold text-slate-800">{viewingApp.instrumentType}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Manufacturer</span>
                  <span className="font-medium text-slate-800">{viewingApp.manufacturer}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Model</span>
                  <span className="font-medium text-slate-800">{viewingApp.model}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Serial Number</span>
                  <span className="font-mono-code font-bold text-slate-900">{viewingApp.serialNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Max Capacity &amp; Interval</span>
                  <span className="font-bold text-slate-900">{viewingApp.capacity}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Unit</span>
                  <span className="font-medium text-slate-800">Kilograms (kg)</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Accuracy Class</span>
                  <span className="font-medium text-slate-800">Class III (Medium)</span>
                </div>
              </div>
            </div>

            {/* SECTION 4 — DOCUMENTS */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-2">
                SECTION 4 — UPLOADED STATUTORY DOCUMENTS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(viewingApp.documents || []).map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 truncate mr-2">
                      <span className="material-symbols-outlined text-red-600 text-[20px]">
                        picture_as_pdf
                      </span>
                      <div className="truncate">
                        <p className="font-bold text-slate-900 text-xs truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-500">{doc.size} • {doc.uploadDate || "31 Aug 2026"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Viewing document: ${doc.name}`)}
                      className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 text-[11px] font-bold hover:bg-slate-100 shrink-0"
                    >
                      Preview
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 5 — PHOTOGRAPHS (LIGHTBOX GALLERY) */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-2">
                SECTION 5 — APPLICATION PHOTOGRAPHS (CLICK TO ENLARGE)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(viewingApp.photographs || []).map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(photo)}
                    className="group relative h-28 bg-slate-900 rounded-lg overflow-hidden border border-slate-200 cursor-pointer flex flex-col justify-end p-2.5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10" />
                    <span className="material-symbols-outlined absolute top-2 right-2 text-white/70 group-hover:text-white text-[18px] z-20">
                      zoom_in
                    </span>
                    <span className="text-white text-[11px] font-bold relative z-20 truncate">
                      {photo.title}
                    </span>
                    <span className="text-slate-300 text-[9px] relative z-20">
                      Uploaded {photo.uploadDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 6 — APPLICATION HISTORY */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block border-b border-slate-100 pb-2">
                SECTION 6 — AUDIT TIMELINE &amp; LIFECYCLE HISTORY
              </span>
              <div className="space-y-3 pl-2">
                {(viewingApp.timeline || []).map((t, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-slate-200 pb-2 last:border-l-0">
                    <span className="absolute -left-[7px] top-0.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-white" />
                    <p className="font-bold text-slate-900 text-xs">{t.event}</p>
                    <p className="text-[10px] text-slate-400">{t.date} • {t.actor}</p>
                    {t.note && <p className="text-[11px] text-slate-600 mt-0.5 bg-slate-50 p-1.5 rounded border border-slate-100">{t.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          REJECT APPLICATION MODAL
         ========================================================================= */}
      {rejectingApp && (
        <Modal
          isOpen={Boolean(rejectingApp)}
          onClose={() => setRejectingApp(null)}
          title="Reject Verification Application"
          subtitle={`Filing ID: ${rejectingApp.id} • ${rejectingApp.businessName}`}
          maxWidth="max-w-md"
          footer={
            <>
              <button
                type="button"
                onClick={() => setRejectingApp(null)}
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
              Please enter the mandatory statutory reason for rejection. This note will be recorded in the audit history and dispatched to the applicant.
            </p>
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Rejection Reason *</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Mandatory OEM model approval certificate is missing or illegible..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================================
          ASSIGN LMO MODAL
         ========================================================================= */}
      {assigningApp && (
        <Modal
          isOpen={Boolean(assigningApp)}
          onClose={() => setAssigningApp(null)}
          title="Assign Legal Metrology Officer (LMO)"
          subtitle={`Application ID: ${assigningApp.id} • ${assigningApp.instrumentName}`}
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
                onClick={handleConfirmAssign}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">event_available</span>
                Assign Inspection
              </button>
            </>
          }
        >
          <form onSubmit={handleConfirmAssign} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Select LMO Officer</label>
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                required
              >
                <option value="">Select LMO</option>
                {(lmos || []).map((lmo) => {
                  const officerId = lmo.lmo_id || lmo.domainId || lmo.officerId || lmo.id;
                  return (
                    <option key={officerId} value={officerId}>
                      {lmo.name} ({officerId}) — {lmo.jurisdiction || ""} [Active: {lmo.activeWorkload || 0}]
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Scheduled Inspection Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              <span className="font-bold text-slate-900 block">Inspection Premises Location:</span>
              {assigningApp.verificationLocation?.address || assigningApp.location || "Location will be taken from the application."}
            </div>
          </form>
        </Modal>
      )}

      {/* Lightbox Modal for Photographs */}
      {selectedImage && (
        <Modal
          isOpen={Boolean(selectedImage)}
          onClose={() => setSelectedImage(null)}
          title={selectedImage.title}
          subtitle={`Uploaded on ${selectedImage.uploadDate}`}
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
    </div>
  );
}
