"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import CertificatePreviewModal from "@/components/certificates/CertificatePreviewModal";
import { useMetrixStore } from "@/lib/store";
import { metrixApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function VerifyPage() {
  const {
    inspections,
    applications,
    certificates,
    currentUser,
    district,
    approveInspection,
    returnInspection,
  } = useMetrixStore();

  const [activeTab, setActiveTab] = useState("awaiting"); // 'awaiting' | 'search'
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [controllerRemarks, setControllerRemarks] = useState("");
  const [returningApp, setReturningApp] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [generatedCertificate, setGeneratedCertificate] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  // Search Completed Records state
  const [recordSearchQuery, setRecordSearchQuery] = useState("");
  const [apiSearchResults, setApiSearchResults] = useState(null);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState(null);

  // Filter applications waiting for Assistant Controller final sanction
  const awaitingList = useMemo(() => {
    return (applications || [])
      .filter((a) => a.status === "AWAITING_APPROVAL")
      .map((a) => {
        const insp = (inspections || []).find(
          (i) => i.applicationId === a.id || i.instrumentId === a.instrumentId
        );
        return {
          ...a,
          inspection: insp,
          ownerName: a.businessName,
          officer: a.assignedLmoName || insp?.officerName || insp?.officer || "Field LMO",
          officerBadge: insp?.officerBadge || a.assignedLmoId,
          inspectionId: insp?.id || a.inspectionId,
          sealNumber: insp?.sealNumber || a.sealNumber || "SEAL-RAJ-2026",
          inspectionDate: insp?.inspectionDate || a.inspectionDate,
        };
      })
      .filter((item) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.businessName.toLowerCase().includes(q) ||
          item.instrumentName.toLowerCase().includes(q) ||
          item.serialNumber?.toLowerCase().includes(q) ||
          item.officer?.toLowerCase().includes(q)
        );
      });
  }, [applications, inspections, search]);

  // Handle on-demand search for completed records (Section 40)
  useEffect(() => {
    if (!recordSearchQuery.trim()) {
      setApiSearchResults(null);
      return;
    }

    let isMounted = true;
    const delayDebounce = setTimeout(async () => {
      setIsSearchingApi(true);
      try {
        const res = await metrixApi.searchCertificates(recordSearchQuery.trim());
        if (isMounted && res?.data) {
          setApiSearchResults(res.data);
        }
      } catch (err) {
        console.warn("Backend certificate search fallback:", err);
      } finally {
        if (isMounted) setIsSearchingApi(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(delayDebounce);
    };
  }, [recordSearchQuery]);

  const searchResults = useMemo(() => {
    if (!recordSearchQuery.trim()) return [];
    if (apiSearchResults !== null) return apiSearchResults;

    const q = recordSearchQuery.toLowerCase().trim();
    return (certificates || []).filter((cert) => {
      return (
        cert.id?.toLowerCase().includes(q) ||
        cert.certificateNumber?.toLowerCase().includes(q) ||
        cert.ownerName?.toLowerCase().includes(q) ||
        cert.businessName?.toLowerCase().includes(q) ||
        cert.instrumentName?.toLowerCase().includes(q) ||
        cert.serialNumber?.toLowerCase().includes(q)
      );
    });
  }, [recordSearchQuery, apiSearchResults, certificates]);

  // Handle Final Approval & Automatic Certificate Issuance
  const handleApprove = async () => {
    if (!selectedApp) return;
    setIsApproving(true);
    try {
      const cert = await approveInspection({
        applicationId: selectedApp.id,
        remarks:
          controllerRemarks ||
          "All measurements verified within Schedule VII MPE limits. Certificate sanctioned.",
      });
      setSelectedApp(null);
      setControllerRemarks("");
      if (cert) {
        setGeneratedCertificate(cert);
      }
    } catch (err) {
      alert("Error generating certificate: " + err.message);
    } finally {
      setIsApproving(false);
    }
  };

  // Handle Return with Note
  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (!returningApp || !returnReason.trim()) return;
    try {
      await returnInspection({
        applicationId: returningApp.id,
        reason: returnReason.trim(),
      });
      setReturningApp(null);
      setReturnReason("");
      if (selectedApp?.id === returningApp.id) {
        setSelectedApp(null);
      }
    } catch (err) {
      alert("Error returning inspection: " + err.message);
    }
  };

  const districtName = district?.name || currentUser?.districtName || "Ajmer";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Verify"
          subtitle={`Review completed field inspections for ${districtName} District • Grant final approval or return with note.`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Verify" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Subtabs: Awaiting Final Review vs Search Completed Records */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("awaiting")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                  activeTab === "awaiting"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">pending_actions</span>
                Awaiting Final Review
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  activeTab === "awaiting" ? "bg-amber-400 text-slate-950 font-black" : "bg-slate-100 text-slate-700"
                }`}>
                  {awaitingList.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("search")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                  activeTab === "search"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">search</span>
                Search Completed Records
              </button>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              District: <strong className="text-slate-900">{districtName}</strong>
            </span>
          </div>

          {/* TAB 1: Awaiting Final Review */}
          {activeTab === "awaiting" && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-600">
                  Inspections submitted by LMOs requiring Assistant Controller review before digital certificate issuance.
                </p>
                <div className="relative w-full sm:w-72">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by business, instrument, officer..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                {awaitingList.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs space-y-3">
                    <span className="material-symbols-outlined text-[40px] text-slate-300 block">
                      verified
                    </span>
                    <p className="font-bold text-slate-700 text-sm">No Inspections Awaiting Approval</p>
                    <p className="text-slate-500">All submitted field inspections in this district have been processed.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Business</th>
                          <th className="py-3 px-4">Instrument</th>
                          <th className="py-3 px-4">Field LMO</th>
                          <th className="py-3 px-4">Inspection Date</th>
                          <th className="py-3 px-4">Seal Number</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {awaitingList.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-900 block">{item.businessName}</span>
                              <span className="text-[11px] text-slate-500 font-mono-code">{item.id}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-900 block">{item.instrumentName}</span>
                              <span className="text-[11px] text-slate-500 font-mono-code">S/N: {item.serialNumber}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-900 block">{item.officer}</span>
                              <span className="text-[10px] font-mono-code text-slate-500">{item.officerBadge}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {formatDate(item.inspectionDate || item.scheduledDate)}
                            </td>
                            <td className="py-3.5 px-4 font-mono-code font-bold text-slate-800">
                              {item.sealNumber}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => setSelectedApp(item)}
                                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs"
                              >
                                Review &amp; Decide
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Search Completed Records */}
          {activeTab === "search" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Search Completed Certificate Records</h3>
                  <p className="text-xs text-slate-500">
                    Search historical certificates in {districtName} by Certificate Number, Business Name, or Serial Number.
                  </p>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={recordSearchQuery}
                    onChange={(e) => setRecordSearchQuery(e.target.value)}
                    placeholder="Enter Certificate ID (e.g. LM-AJM-2026-000114), Business Name, or Serial Number..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>
                {/* Sample Search Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-slate-400 text-[11px] font-bold uppercase">Quick Samples:</span>
                  {[
                    "LM-AJM-2026",
                    "Shree Balaji",
                    "Pushkar",
                    "SN-983421",
                  ].map((sample) => (
                    <button
                      key={sample}
                      onClick={() => setRecordSearchQuery(sample)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono-code font-bold text-[11px]"
                    >
                      🔍 {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Results */}
              {recordSearchQuery.trim() && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                  {isSearchingApi ? (
                    <div className="p-8 text-center text-xs text-slate-500">Searching records...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No matching certificate records found for &quot;{recordSearchQuery}&quot;.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Certificate ID</th>
                          <th className="py-3 px-4">Business</th>
                          <th className="py-3 px-4">Instrument</th>
                          <th className="py-3 px-4">Verification Date</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {searchResults.map((cert) => (
                          <tr key={cert.id || cert.certificateNumber} className="hover:bg-slate-50/80">
                            <td className="py-3.5 px-4 font-mono-code font-bold text-slate-900">
                              {cert.certificateNumber || cert.id}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              {cert.ownerName || cert.businessName}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-900 block">{cert.instrumentName}</span>
                              <span className="text-[11px] text-slate-500 font-mono-code">S/N: {cert.serialNumber}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {formatDate(cert.verificationDate)}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge status={cert.status} className="text-[10px]" />
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => setViewingCertificate(cert)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                              >
                                View Certificate
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Review & Decide Modal (Complete Inspection Dossier) */}
      {selectedApp && (
        <Modal
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title={`Final Review: ${selectedApp.id}`}
          subtitle={`${selectedApp.businessName} • ${selectedApp.instrumentName}`}
          maxWidth="max-w-4xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReturningApp(selectedApp);
                    setSelectedApp(null);
                  }}
                  className="px-3.5 py-2 text-xs font-bold rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  Reject / Return with Note
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-2xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  {isApproving ? "Generating..." : "Approve & Generate Certificate"}
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* 1. Application & Business Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Business</span>
                <span className="font-bold text-slate-900">{selectedApp.businessName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant</span>
                <span className="font-semibold text-slate-800">{selectedApp.applicantName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Instrument</span>
                <span className="font-bold text-slate-900">{selectedApp.instrumentName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Serial Number</span>
                <span className="font-mono-code font-bold text-slate-900">{selectedApp.serialNumber}</span>
              </div>
            </div>

            {/* 2. LMO Field Inspection Data */}
            <div className="bg-white border-2 border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-700 text-[18px]">engineering</span>
                  LMO Field Verification Results
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                  VERIFIED BY: {selectedApp.officer}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Inspection Date</span>
                  <span className="font-semibold text-slate-900">{formatDate(selectedApp.inspectionDate || selectedApp.scheduledDate)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Applied Seal Number</span>
                  <span className="font-mono-code font-bold text-emerald-800">{selectedApp.sealNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">GPS Coordinates</span>
                  <span className="font-mono-code text-slate-700">{selectedApp.inspection?.gpsCoords || "26.4499° N, 74.6399° E"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Verification Result</span>
                  <span className="font-bold text-emerald-700">PASSED &amp; STAMPED</span>
                </div>
              </div>

              {/* Checklist & Measurements */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-700 block">Physical Checklist &amp; Measurements:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2 text-emerald-900">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                    Visual Plaque &amp; Model Approval: Passed
                  </div>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2 text-emerald-900">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                    Zero Setting &amp; Leveling: Verified
                  </div>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2 text-emerald-900">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                    Load Error Test: Within MPE Tolerance
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-1 pt-1">
                <label className="font-bold text-slate-800 block">Assistant Controller Sanction Remarks</label>
                <textarea
                  rows={2}
                  value={controllerRemarks}
                  onChange={(e) => setControllerRemarks(e.target.value)}
                  placeholder="All measurements verified within Schedule VII MPE limits. Certificate sanctioned."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Return / Reject with Note Modal */}
      {returningApp && (
        <Modal
          isOpen={Boolean(returningApp)}
          onClose={() => setReturningApp(null)}
          title="Return Field Inspection with Note"
          subtitle={`Application: ${returningApp.id} • ${returningApp.businessName}`}
          maxWidth="max-w-md"
          footer={
            <>
              <button
                type="button"
                onClick={() => setReturningApp(null)}
                className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                disabled={!returnReason.trim()}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-rose-700 text-white hover:bg-rose-800 transition-colors shadow-2xs disabled:opacity-50"
              >
                Submit Return Note
              </button>
            </>
          }
        >
          <form onSubmit={handleConfirmReturn} className="space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Enter the reason why this inspection is being returned for correction. The application will revert to the LMO for re-check.
            </p>
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Return Reason *</label>
              <textarea
                rows={3}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="e.g. Volumetric delivery error exceeds allowable MPE..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Certificate Generated Success Modal */}
      {generatedCertificate && (
        <CertificatePreviewModal
          certificate={generatedCertificate}
          isOpen={Boolean(generatedCertificate)}
          onClose={() => setGeneratedCertificate(null)}
        />
      )}

      {/* View Certificate Modal from Search */}
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
