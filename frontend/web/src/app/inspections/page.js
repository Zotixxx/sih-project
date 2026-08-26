"use client";

import React, { useState } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Badge from "@/components/ui/Badge";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function InspectionsPage() {
  const { inspections } = useMetrixStore();
  const [filter, setFilter] = useState("ALL"); // 'ALL' | 'SCHEDULED' | 'COMPLETED'

  const filteredInspections = inspections.filter((insp) => {
    if (filter === "ALL") return true;
    return insp.status === filter;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Inspections &amp; Field History"
          subtitle="Audit logs, standard weight test measurements, and geotagged evidence recorded by Legal Metrology Officers."
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            { label: "Inspections" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Field Inspection Audit Log
              </h3>
              <p className="text-xs text-slate-500">
                Detailed measurement observations and statutory seals applied
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  filter === "ALL"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({inspections.length})
              </button>
              <button
                onClick={() => setFilter("SCHEDULED")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  filter === "SCHEDULED"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Scheduled ({inspections.filter((i) => i.status === "SCHEDULED").length})
              </button>
              <button
                onClick={() => setFilter("COMPLETED")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  filter === "COMPLETED"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Completed / Certified ({inspections.filter((i) => i.status === "COMPLETED").length})
              </button>
            </div>
          </div>

          {/* Inspection Cards Timeline */}
          <div className="space-y-6">
            {filteredInspections.map((insp) => (
              <div
                key={insp.id}
                className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">
                        assignment_turned_in
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-code font-bold text-xs text-slate-500">
                          {insp.id}
                        </span>
                        <Badge status={insp.status} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {insp.instrumentName}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Inspection Date
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatDate(insp.scheduledDate)} ({insp.scheduledTime})
                      </span>
                    </div>
                    {insp.status === "SCHEDULED" && (
                      <Link
                        href={`/lmo/inspect/${insp.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-2xs flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          tablet_mac
                        </span>
                        Open Tablet Form
                      </Link>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                  {/* Left (5 cols): Officer & Geotag Details */}
                  <div className="lg:col-span-5 space-y-4 border-r-0 lg:border-r border-slate-100 lg:pr-6">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        Assigned Metrology Officer
                      </span>
                      <p className="font-bold text-sm text-slate-900 mt-0.5">
                        {insp.officer}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {insp.officerRole}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-emerald-600">
                          pin_drop
                        </span>
                        Geotagged Location Evidence
                      </span>
                      <p className="font-semibold text-slate-800 text-xs">
                        {insp.location}
                      </p>
                      <p className="font-mono-code text-[11px] text-slate-500 font-bold">
                        GPS: {insp.gpsCoords}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        Officer Remarks &amp; Observations
                      </span>
                      <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 italic mt-1 leading-relaxed">
                        "{insp.remarks}"
                      </p>
                    </div>
                  </div>

                  {/* Right (7 cols): Checklist & Test Measurements */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Checklist */}
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2 block">
                        Statutory Checklist Items
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {insp.checklistItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 rounded border border-slate-200 bg-slate-50 flex items-center justify-between"
                          >
                            <span className="text-[11px] font-medium text-slate-700 truncate mr-2">
                              {item.label}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                item.passed
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {item.passed ? "✓ PASS" : "PENDING"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Test Load Measurements Table */}
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2 block">
                        Standard Weight Test Measurements
                      </span>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                            <tr>
                              <th className="py-2 px-3">Standard Test Load</th>
                              <th className="py-2 px-3">Observed Reading</th>
                              <th className="py-2 px-3">Max Permissible Error (MPE)</th>
                              <th className="py-2 px-3 text-right">Result</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {insp.measurements.map((m, idx) => (
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
                                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                                    {m.result}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
