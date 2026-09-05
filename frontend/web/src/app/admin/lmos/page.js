"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Modal from "@/components/ui/Modal";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function LmosManagementPage() {
  const { lmos, inspections, currentUser, district } = useMetrixStore();

  const [search, setSearch] = useState("");
  const [selectedLmo, setSelectedLmo] = useState(null);
  const districtLabel = district?.name || currentUser?.districtName || currentUser?.district_id || "District";

  // Filtered LMO list
  const filteredLmos = useMemo(() => {
    return (lmos || []).filter((lmo) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        lmo.name.toLowerCase().includes(q) ||
        lmo.officerId.toLowerCase().includes(q) ||
        lmo.jurisdiction.toLowerCase().includes(q) ||
        lmo.phone.includes(q)
      );
    });
  }, [lmos, search]);

  // Get officer workload and inspection history
  const officerInspections = useMemo(() => {
    if (!selectedLmo) return { assigned: [], completed: [] };
    const all = (inspections || []).filter(
      (i) => i.officerId === selectedLmo.officerId || i.officerId === selectedLmo.id
    );
    return {
      assigned: all.filter((i) => i.status !== "APPROVED"),
      completed: all.filter((i) => i.status === "APPROVED"),
    };
  }, [selectedLmo, inspections]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="LMOs"
          subtitle={`District Field Officers • ${districtLabel}`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "LMOs" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  District Officers ({filteredLmos.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Field verification officers for {districtLabel}
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
                  placeholder="Search LMO by name, badge ID, zone..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          {/* LMO Officers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLmos.map((lmo) => (
              <div
                key={lmo.officerId}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Officer Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                        {lmo.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {lmo.name}
                        </h4>
                        <span className="text-[10px] font-mono-code font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {lmo.officerId}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ● Active
                    </span>
                  </div>

                  {/* Details */}
                  <div className="text-xs space-y-1.5 text-slate-600">
                    <p className="font-semibold text-slate-800">{lmo.designation}</p>
                    <p className="text-[11px] text-slate-500">
                      📍 <strong>Jurisdiction:</strong> {lmo.jurisdiction}
                    </p>
                    <p className="text-[11px]">📞 {lmo.phone}</p>
                    <p className="text-[11px] truncate">✉️ {lmo.email}</p>
                  </div>

                  {/* Workload Chips */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">
                        Active Load
                      </span>
                      <span className="font-mono-code font-black text-slate-900 text-base">
                        {lmo.activeWorkload}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">
                        Completed
                      </span>
                      <span className="font-mono-code font-bold text-emerald-700 text-base">
                        {lmo.completedInspections}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">
                        Compliance
                      </span>
                      <span className="font-mono-code font-bold text-blue-700 text-xs">
                        {lmo.complianceRate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedLmo(lmo)}
                    className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    View Officer Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* LMO Officer Dossier Modal */}
      {selectedLmo && (
        <Modal
          isOpen={Boolean(selectedLmo)}
          onClose={() => setSelectedLmo(null)}
          title={`Legal Metrology Officer Dossier: ${selectedLmo.name}`}
          subtitle={`Badge ID: ${selectedLmo.officerId} • ${selectedLmo.jurisdiction}`}
          maxWidth="max-w-3xl"
          footer={
            <button
              type="button"
              onClick={() => setSelectedLmo(null)}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            >
              Close Dossier
            </button>
          }
        >
          <div className="space-y-5 text-xs max-h-[70vh] overflow-y-auto pr-1">
            {/* Officer Profile Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Officer Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedLmo.name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Badge ID</span>
                <span className="font-mono-code font-bold text-slate-900">{selectedLmo.officerId}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Designation</span>
                <span className="font-medium text-slate-800">{selectedLmo.designation}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">District Authority</span>
                <span className="font-medium text-slate-800">{selectedLmo.district_id || districtLabel}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Contact Phone</span>
                <span className="font-medium text-slate-800">{selectedLmo.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Official Email</span>
                <span className="font-medium text-slate-800">{selectedLmo.email}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Territorial Jurisdiction</span>
                <span className="font-bold text-slate-900">{selectedLmo.jurisdiction}</span>
              </div>
            </div>

            {/* Active / Assigned Inspections List */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Assigned Field Inspections ({officerInspections.assigned.length})
                </span>
              </div>

              {officerInspections.assigned.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">No active inspections currently assigned to this officer.</p>
              ) : (
                <div className="space-y-2">
                  {officerInspections.assigned.map((insp) => (
                    <div
                      key={insp.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono-code font-bold text-slate-900 mr-2">{insp.id}</span>
                        <span className="font-bold text-slate-800">{insp.instrumentName}</span>
                        <p className="text-[11px] text-slate-500">🏢 {insp.ownerName} • Scheduled: {insp.scheduledDate}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                        {insp.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completed Inspections List */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Completed &amp; Stamped History ({officerInspections.completed.length})
                </span>
                <span className="text-emerald-700 font-bold text-[11px]">
                  Compliance: {selectedLmo.complianceRate}
                </span>
              </div>

              {officerInspections.completed.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">No completed inspections on record for current cycle.</p>
              ) : (
                <div className="space-y-2">
                  {officerInspections.completed.map((insp) => (
                    <div
                      key={insp.id}
                      className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono-code font-bold text-slate-900 mr-2">{insp.id}</span>
                        <span className="font-bold text-slate-800">{insp.instrumentName}</span>
                        <p className="text-[11px] text-slate-500">🏢 {insp.ownerName} • Seal: {insp.sealNumber}</p>
                      </div>
                      <span className="font-mono-code text-[11px] font-bold text-emerald-800">
                        {insp.certificateNumber || "CERTIFIED"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
