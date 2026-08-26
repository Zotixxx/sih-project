"use client";

import React, { useState } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import MetricCard from "@/components/ui/MetricCard";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { applications, instruments, inspections, assignOfficerAndSchedule } =
    useMetrixStore();

  const [assigningApp, setAssigningApp] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState("Inspector Rajesh Sharma (LMO-104)");
  const [scheduledDate, setScheduledDate] = useState("2026-09-02");
  const [scheduledTime, setScheduledTime] = useState("11:00 AM");

  const pendingApplications = applications.filter(
    (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
  );

  const officers = [
    { name: "Inspector Rajesh Sharma (LMO-104)", zone: "South Delhi Zone", activeLoad: "4 inspections" },
    { name: "Officer P. K. Verma (LMO-102)", zone: "Central & West Delhi", activeLoad: "2 inspections" },
    { name: "Dr. Sunita Rao (GATC Lead)", zone: "Government Approved Test Lab", activeLoad: "1 calibration" },
    { name: "Officer Vikram Joshi (LMO-108)", zone: "North East Industrial Area", activeLoad: "3 inspections" },
  ];

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

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Government Administration Portal"
          subtitle="Jurisdiction oversight, officer workload balancing, and application scheduling."
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            { label: "Admin Administration" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Admin KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total District Instruments"
              value="248,910"
              subtitle="Registered in NCT Delhi"
              icon="balance"
            />
            <MetricCard
              title="Awaiting Assignment"
              value={pendingApplications.length}
              subtitle="Action required by Admin"
              icon="schedule"
              trend={pendingApplications.length > 0 ? "Pending queue" : "Clear"}
              trendPositive={pendingApplications.length === 0}
            />
            <MetricCard
              title="Active LMO Officers"
              value="24 Field Units"
              subtitle="On active inspection duty"
              icon="engineering"
            />
            <MetricCard
              title="Statutory Compliance"
              value="98.4%"
              subtitle="Timely verified instruments"
              icon="verified"
              trend="+0.6% this quarter"
              trendPositive={true}
            />
          </div>

          {/* Pending Applications Allocation Queue */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Officer Allocation &amp; Inspection Scheduling Queue
                </h3>
                <p className="text-xs text-slate-500">
                  Assign verified field inspectors to pending applications
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                {pendingApplications.length} Unallocated Filings
              </span>
            </div>

            {pendingApplications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                ✓ All submitted applications have been assigned to inspection officers.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
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
                        📍 {app.location} • Submitted: {formatDate(app.submissionDate)}
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

          {/* Officer Workload & District Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Officer Workload Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Officer Availability &amp; Current Field Workload
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {officers.map((off, idx) => (
                  <div
                    key={idx}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{off.name}</p>
                      <p className="text-[11px] text-slate-500">{off.zone}</p>
                    </div>
                    <span className="px-2 py-1 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                      {off.activeLoad}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links / Field Simulation */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                LMO Field Testing &amp; Tablet Sandbox
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Test the mobile field inspection experience used by Legal Metrology Officers to verify instruments on-site, record test load tolerances, and stamp official certificates.
              </p>
              <div className="pt-2">
                <Link
                  href="/lmo/inspect/INSP-2026-0044"
                  className="w-full py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    tablet_mac
                  </span>
                  Launch Field Inspector Tablet View →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Assignment Modal */}
      {assigningApp && (
        <Modal
          isOpen={Boolean(assigningApp)}
          onClose={() => setAssigningApp(null)}
          title="Schedule Inspection &amp; Allocate Officer"
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
                Select Legal Metrology Officer (LMO) / GATC Lead
              </label>
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                required
              >
                {officers.map((off, idx) => (
                  <option key={idx} value={off.name}>
                    {off.name} ({off.zone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Scheduled Inspection Date
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
                Target Premises:
              </span>
              {assigningApp.location}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
