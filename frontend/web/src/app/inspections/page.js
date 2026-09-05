"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Badge from "@/components/ui/Badge";
import { useMetrixStore } from "@/lib/store";
import { portalPath } from "@/lib/routes";
import { formatDate } from "@/lib/utils";

export default function InspectionsPage() {
  const router = useRouter();
  const { inspections, currentUser, district } = useMetrixStore();
  const href = (path) => portalPath(currentUser, path);

  const [activeTab, setActiveTab] = useState("today"); // 'today' | 'history'
  const [search, setSearch] = useState("");
  const [historyLimit, setHistoryLimit] = useState(8);

  // Filter inspections for the active LMO or active district
  const lmoInspections = useMemo(() => {
    return inspections || [];
  }, [inspections]);

  // Today's inspections (assigned/scheduled or in progress)
  const todayInspections = useMemo(() => {
    return lmoInspections
      .filter(
        (i) =>
          i.status === "SCHEDULED" ||
          i.status === "ASSIGNED" ||
          i.status === "IN_PROGRESS" ||
          i.status === "UNDER_VERIFICATION"
      )
      .filter((i) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          i.id.toLowerCase().includes(q) ||
          i.ownerName?.toLowerCase().includes(q) ||
          i.instrumentName?.toLowerCase().includes(q) ||
          i.location?.toLowerCase().includes(q)
        );
      });
  }, [lmoInspections, search]);

  // Inspection history (submitted / approved / completed)
  const historyInspections = useMemo(() => {
    return lmoInspections
      .filter(
        (i) =>
          i.status === "SUBMITTED" ||
          i.status === "SUBMITTED_FOR_APPROVAL" ||
          i.status === "APPROVED" ||
          i.status === "COMPLETED" ||
          i.status === "REJECTED" ||
          i.status === "RETURNED"
      )
      .filter((i) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          i.id.toLowerCase().includes(q) ||
          i.ownerName?.toLowerCase().includes(q) ||
          i.instrumentName?.toLowerCase().includes(q) ||
          i.sealNumber?.toLowerCase().includes(q)
        );
      });
  }, [lmoInspections, search]);

  const pagedHistory = historyInspections.slice(0, historyLimit);
  const hasMoreHistory = historyLimit < historyInspections.length;

  const districtName = district?.name || currentUser?.districtName || "District";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Inspections"
          subtitle={`Field Inspection Queue • ${currentUser?.name || "Field Officer"} (${currentUser?.domainId || currentUser?.badge || "LMO"}) • ${districtName}`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Inspections" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Subtabs: Today vs History */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("today")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                  activeTab === "today"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                Today&apos;s Inspections
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  activeTab === "today" ? "bg-amber-400 text-slate-950 font-black" : "bg-slate-100 text-slate-700"
                }`}>
                  {todayInspections.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                  activeTab === "history"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">history</span>
                History
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  activeTab === "history" ? "bg-slate-800 text-white font-bold" : "bg-slate-100 text-slate-700"
                }`}>
                  {historyInspections.length}
                </span>
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search business, instrument, ID..."
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* TAB 1: Today's Inspections */}
          {activeTab === "today" && (
            <div className="space-y-4">
              {todayInspections.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs space-y-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
                  <span className="material-symbols-outlined text-[40px] text-slate-300 block">
                    event_available
                  </span>
                  <p className="font-bold text-slate-700 text-sm">No Pending Inspections for Today</p>
                  <p className="text-slate-500">You have no scheduled inspection duties pending right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todayInspections.map((insp) => (
                    <div
                      key={insp.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <span className="font-mono-code font-bold text-slate-900 text-sm block">
                              {insp.id}
                            </span>
                            <span className="text-xs text-slate-500">
                              App ID: <strong>{insp.applicationId}</strong>
                            </span>
                          </div>
                          <Badge status={insp.status} className="text-[10px]" />
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900">{insp.ownerName}</h3>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">{insp.instrumentName}</p>
                          <p className="text-[11px] text-slate-500 font-mono-code">S/N: {insp.serialNumber}</p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center gap-2 text-slate-700">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                            <span>{formatDate(insp.scheduledDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-700 truncate">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">pin_drop</span>
                            <span className="truncate">{insp.location || "Not recorded"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link
                          href={href(`/inspect/${insp.id}`)}
                          className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit_document</span>
                          Open Field Inspection
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: History (with Lazy Loading) */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                {historyInspections.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs space-y-3">
                    <span className="material-symbols-outlined text-[40px] text-slate-300 block">
                      history
                    </span>
                    <p className="font-bold text-slate-700 text-sm">No History Records</p>
                    <p className="text-slate-500">No completed inspections on record for this officer.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Inspection ID</th>
                          <th className="py-3 px-4">Business</th>
                          <th className="py-3 px-4">Instrument</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Seal Number</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {pagedHistory.map((insp) => (
                          <tr key={insp.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono-code font-bold text-slate-900">
                              {insp.id}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              {insp.ownerName}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-semibold text-slate-900 block">{insp.instrumentName}</span>
                              <span className="text-[11px] text-slate-500 font-mono-code">S/N: {insp.serialNumber}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {formatDate(insp.inspectionDate || insp.submissionDate || insp.scheduledDate)}
                            </td>
                            <td className="py-3.5 px-4 font-mono-code font-bold text-emerald-800">
                              {insp.sealNumber || "Not submitted"}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge status={insp.status} className="text-[10px]" />
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Link
                                href={href(`/inspect/${insp.id}`)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs inline-block"
                              >
                                View Data
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {hasMoreHistory && (
                  <div className="p-4 border-t border-slate-100 text-center bg-slate-50">
                    <button
                      onClick={() => setHistoryLimit((prev) => prev + 6)}
                      className="px-5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors shadow-2xs"
                    >
                      Load More History ({historyInspections.length - historyLimit} remaining)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
