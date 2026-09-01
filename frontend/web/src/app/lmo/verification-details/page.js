"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useMetrixStore } from "@/lib/store";
import { formatDate, getNormalizedChecklist, getNormalizedMeasurements } from "@/lib/utils";

export default function LmoVerificationDetailsPage() {
  const { inspections, applications, currentUser } = useMetrixStore();

  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [visibleCount, setVisibleCount] = useState(8); // Lazy loading initial count

  // Submitted verification records entered by the logged-in LMO
  const submittedRecords = useMemo(() => {
    return (inspections || [])
      .filter((i) => {
        // Belongs to current LMO if logged in as LMO, or matches district
        if (currentUser?.role === "LMO") {
          return i.officerId === currentUser.id || i.officerId === currentUser.badge || !i.officerId;
        }
        return true;
      })
      .filter(
        (i) =>
          i.status === "SUBMITTED" ||
          i.status === "SUBMITTED_FOR_APPROVAL" ||
          i.status === "APPROVED" ||
          i.status === "COMPLETED"
      )
      .filter((i) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          i.id.toLowerCase().includes(q) ||
          i.ownerName?.toLowerCase().includes(q) ||
          i.instrumentName?.toLowerCase().includes(q) ||
          i.sealNumber?.toLowerCase().includes(q) ||
          i.serialNumber?.toLowerCase().includes(q)
        );
      });
  }, [inspections, currentUser, search]);

  const pagedRecords = submittedRecords.slice(0, visibleCount);
  const hasMore = visibleCount < submittedRecords.length;

  const loadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Verification Details"
          subtitle="Submitted field test records and physical plaque verifications recorded on-site."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Verification Details" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Overview & Search */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Field Verification Records
                <span className="px-2 py-0.5 rounded-full text-xs font-mono-code font-bold bg-emerald-100 text-emerald-900">
                  {submittedRecords.length} Records
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical checklists, load test measurements, and seal numbers submitted by you.
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by business, instrument, seal..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            {submittedRecords.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs space-y-3">
                <span className="material-symbols-outlined text-[40px] text-slate-300 block">
                  fact_check
                </span>
                <p className="font-bold text-slate-700 text-sm">No Submitted Verifications Found</p>
                <p className="text-slate-500">You have not submitted any field inspection records yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Inspection ID</th>
                      <th className="py-3 px-4">Business</th>
                      <th className="py-3 px-4">Instrument</th>
                      <th className="py-3 px-4">Inspection Date</th>
                      <th className="py-3 px-4">Applied Seal</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {pagedRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono-code font-bold text-slate-900">
                          {item.id}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {item.ownerName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 block">{item.instrumentName}</span>
                          <span className="text-[11px] text-slate-500 font-mono-code">S/N: {item.serialNumber}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(item.inspectionDate || item.submissionDate || item.scheduledDate)}
                        </td>
                        <td className="py-3.5 px-4 font-mono-code font-bold text-emerald-800">
                          {item.sealNumber || "SEAL-RAJ-99412"}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={item.status} className="text-[10px]" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedRecord(item)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                          >
                            View Record
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Lazy Loading More Bar */}
            {hasMore && (
              <div className="p-4 border-t border-slate-100 text-center bg-slate-50">
                <button
                  onClick={loadMore}
                  className="px-5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors shadow-2xs"
                >
                  Load More History ({submittedRecords.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Record Inspection Details Modal */}
      {selectedRecord && (
        <Modal
          isOpen={Boolean(selectedRecord)}
          onClose={() => setSelectedRecord(null)}
          title={`Verification Record: ${selectedRecord.id}`}
          subtitle={`${selectedRecord.ownerName} • ${selectedRecord.instrumentName}`}
          maxWidth="max-w-2xl"
          footer={
            <button
              type="button"
              onClick={() => setSelectedRecord(null)}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              Close Record
            </button>
          }
        >
          <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
            {/* Overview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Business</span>
                <span className="font-bold text-slate-900">{selectedRecord.ownerName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Instrument</span>
                <span className="font-bold text-slate-900">{selectedRecord.instrumentName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Serial Number</span>
                <span className="font-mono-code font-bold text-slate-900">{selectedRecord.serialNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Inspection Date</span>
                <span className="font-semibold text-slate-800">{formatDate(selectedRecord.inspectionDate || selectedRecord.submissionDate)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Wire Seal</span>
                <span className="font-mono-code font-bold text-emerald-700">{selectedRecord.sealNumber || "SEAL-RAJ-99412"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">GPS Coordinates</span>
                <span className="font-mono-code text-slate-700">{selectedRecord.gpsCoords || "26.4499° N, 74.6399° E"}</span>
              </div>
            </div>

            {/* Checklist & Physical Tests (Entered via Field Tablet) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    Field Physical Verification Checklist
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Entered on tablet during on-site inspection (Schedule VII Compliance)
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <span aria-hidden="true" className="material-symbols-outlined text-[13px] text-emerald-600 select-none">tablet_mac</span>
                  Tablet Synced
                </span>
              </div>

              <div className="space-y-2">
                {getNormalizedChecklist(selectedRecord).map((chk) => (
                  <div
                    key={chk.id}
                    className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      chk.passed
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                        : "bg-rose-50 border-rose-200 text-rose-950"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 select-none ${
                          chk.passed ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {chk.passed ? "check_circle" : "cancel"}
                      </span>
                      <div>
                        <span className="font-semibold text-xs block leading-tight">
                          {chk.label}
                        </span>
                        {chk.notes && (
                          <span className="text-[10px] text-slate-600 block mt-0.5">
                            {chk.notes}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded self-start sm:self-center shrink-0 ${
                        chk.passed
                          ? "bg-emerald-200/80 text-emerald-900"
                          : "bg-rose-200 text-rose-900"
                      }`}
                    >
                      {chk.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gravimetric Load Test Measurements from Tablet */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    Gravimetric Load Test Measurements
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Observed on-site load cell test values
                  </p>
                </div>
                <span className="text-[10px] font-medium text-slate-500">
                  Tolerance: Schedule VII MPE
                </span>
              </div>
              <div className="overflow-x-auto border border-slate-100 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="py-2 px-3">Test Load</th>
                      <th className="py-2 px-3">Indicated Weight</th>
                      <th className="py-2 px-3">Observed Error</th>
                      <th className="py-2 px-3">Statutory MPE</th>
                      <th className="py-2 px-3 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono-code text-[11px]">
                    {getNormalizedMeasurements(selectedRecord).map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-900">{m.testLoad}</td>
                        <td className="py-2 px-3 text-slate-700">{m.indicatedWeight}</td>
                        <td className="py-2 px-3 text-slate-700">{m.error}</td>
                        <td className="py-2 px-3 text-slate-500">{m.mpeLimit}</td>
                        <td className="py-2 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded font-sans font-bold text-[10px] ${
                            m.result === "PASS"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
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
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Officer Field Remarks</span>
              <p className="text-slate-700 leading-relaxed">
                {selectedRecord.remarks || "Physical tests conducted using certified standard weights. Instrument verified and stamped with lead wire security seal."}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
