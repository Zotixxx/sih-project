"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function ApplicationsPage() {
  const { applications } = useMetrixStore();
  const [search, setSearch] = useState("");
  const [activeStatusTab, setActiveStatusTab] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState(null);

  const statusTabs = [
    { id: "ALL", label: "All Filings" },
    { id: "SUBMITTED", label: "Submitted" },
    { id: "UNDER_REVIEW", label: "Under Review" },
    { id: "SCHEDULED", label: "Scheduled" },
    { id: "UNDER_VERIFICATION", label: "In Inspection" },
    { id: "PASSED", label: "Certified / Passed" },
  ];

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        search === "" ||
        app.id.toLowerCase().includes(search.toLowerCase()) ||
        app.instrumentName.toLowerCase().includes(search.toLowerCase()) ||
        app.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
        app.assignedOfficer.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        activeStatusTab === "ALL" || app.status === activeStatusTab;

      return matchSearch && matchStatus;
    });
  }, [applications, search, activeStatusTab]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Applications Queue"
          subtitle="Real-time monitoring and lifecycle management for all Legal Metrology verification applications."
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            { label: "Applications" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Actions & Filter Tabs */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Verification Applications Management
                </h3>
                <p className="text-xs text-slate-500">
                  {filteredApps.length} active filings in queue
                </p>
              </div>

              <Link
                href="/applications/apply"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Verification Filing
              </Link>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveStatusTab(tab.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      activeStatusTab === tab.id
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search application ID, serial..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Instrument &amp; Serial</th>
                    <th className="py-3 px-4">Filing Type</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4">Assigned Officer</th>
                    <th className="py-3 px-4">Scheduled Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No verification applications found.
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono-code font-bold text-slate-900">
                          {app.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">
                            {app.instrumentName}
                          </p>
                          <p className="text-[10px] font-mono-code text-slate-500">
                            S/N: {app.serialNumber}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {app.applicationType}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(app.submissionDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">
                            {app.assignedOfficer}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {app.scheduledDate === "Pending Assignment" ? (
                            <span className="text-slate-400 italic">
                              Pending Allocation
                            </span>
                          ) : (
                            <div>
                              <span className="font-semibold text-slate-900">
                                {formatDate(app.scheduledDate)}
                              </span>
                              <span className="block text-[10px] text-slate-500">
                                {app.scheduledTime}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={app.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] transition-colors"
                          >
                            View Filing
                          </button>
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

      {/* Application Details Modal */}
      {selectedApp && (
        <Modal
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title={`Application Filing: ${selectedApp.id}`}
          subtitle={`Target: ${selectedApp.instrumentName} (S/N: ${selectedApp.serialNumber})`}
          maxWidth="max-w-2xl"
          footer={
            <button
              onClick={() => setSelectedApp(null)}
              className="px-4 py-2 rounded border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Status Highlight */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500">Application Status</p>
                <div className="mt-1">
                  <Badge status={selectedApp.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-500">Govt Fee Paid</p>
                <p className="font-mono-code font-bold text-slate-900 mt-0.5">
                  {selectedApp.feePaid || "₹ 3,500.00"}
                </p>
              </div>
            </div>

            {/* Schedule & Officer */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-white border border-slate-200">
              <div>
                <span className="text-slate-400 text-[11px]">Assigned Officer</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {selectedApp.assignedOfficer}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Inspection Date &amp; Time</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {selectedApp.scheduledDate} {selectedApp.scheduledTime !== "-" && `(${selectedApp.scheduledTime})`}
                </p>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-100">
                <span className="text-slate-400 text-[11px]">Inspection Location</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedApp.location}
                </p>
              </div>
            </div>

            {/* Attached Documents */}
            {selectedApp.documents && selectedApp.documents.length > 0 && (
              <div className="space-y-2">
                <p className="font-bold uppercase text-slate-500 text-[10px] tracking-wider">
                  Submitted Documents ({selectedApp.documents.length})
                </p>
                <div className="space-y-1.5">
                  {selectedApp.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded border border-slate-200 bg-slate-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-500 text-[18px]">
                          picture_as_pdf
                        </span>
                        <span className="font-semibold text-slate-800">
                          {doc.name}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[10px]">
                        {doc.size}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
