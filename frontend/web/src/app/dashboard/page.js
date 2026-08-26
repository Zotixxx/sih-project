"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import MetricCard from "@/components/ui/MetricCard";
import Badge from "@/components/ui/Badge";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { userProfile, instruments, applications, certificates, inspections } =
    useMetrixStore();

  const totalInstruments = instruments.length;
  const verifiedInstruments = instruments.filter(
    (i) => i.verificationStatus === "VERIFIED"
  ).length;
  const expiringSoon = instruments.filter(
    (i) => i.verificationStatus === "EXPIRING_SOON"
  ).length;
  const expiredCount = instruments.filter(
    (i) => i.verificationStatus === "EXPIRED"
  ).length;

  const urgentInstruments = instruments.filter(
    (i) =>
      i.verificationStatus === "EXPIRING_SOON" ||
      i.verificationStatus === "EXPIRED"
  );

  const scheduledInspections = inspections.filter(
    (i) => i.status === "SCHEDULED"
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Side Navigation Bar */}
      <SideNavBar />

      {/* Main Content Area */}
      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Business Dashboard"
          subtitle="Overview of your regulated instruments, verification filings, and compliance status."
          breadcrumbs={[{ label: "MetriX" }, { label: "Dashboard" }]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Welcome Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Welcome, {userProfile.businessName}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active Trade
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Reg ID: <span className="font-mono-code font-bold text-slate-700">{userProfile.regNumber}</span> • {userProfile.district}, {userProfile.state}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/instruments/new"
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">
                  add
                </span>
                Add Instrument
              </Link>
              <Link
                href="/applications/apply"
                className="px-4 py-2 rounded-lg bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">
                  assignment_turned_in
                </span>
                Apply for Verification
              </Link>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Regulated Instruments"
              value={totalInstruments}
              subtitle="Registered in system"
              icon="straighten"
              onClick={() => router.push("/instruments")}
            />
            <MetricCard
              title="Active / Verified"
              value={verifiedInstruments}
              subtitle="Digitally certified"
              icon="verified"
              trend="+100% compliant"
              trendPositive={true}
              onClick={() => router.push("/instruments?status=VERIFIED")}
            />
            <MetricCard
              title="Expiring Soon"
              value={expiringSoon}
              subtitle="Within next 30 days"
              icon="schedule"
              trend="Action required"
              trendPositive={false}
              onClick={() => router.push("/instruments?status=EXPIRING_SOON")}
            />
            <MetricCard
              title="Expired Instruments"
              value={expiredCount}
              subtitle="Re-verification mandatory"
              icon="error"
              onClick={() => router.push("/instruments?status=EXPIRED")}
            />
          </div>

          {/* Verification Pipeline Tracker */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Verification Lifecycle Pipeline
                </h3>
                <p className="text-xs text-slate-500">
                  Live status breakdown across all active applications
                </p>
              </div>
              <Link
                href="/applications"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
              >
                View Applications ({applications.length}) →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Draft", count: 0, status: "DRAFT" },
                {
                  label: "Submitted",
                  count: applications.filter((a) => a.status === "SUBMITTED").length,
                  status: "SUBMITTED",
                },
                {
                  label: "Under Review",
                  count: applications.filter((a) => a.status === "UNDER_REVIEW").length,
                  status: "UNDER_REVIEW",
                },
                {
                  label: "Scheduled",
                  count: applications.filter((a) => a.status === "SCHEDULED").length,
                  status: "SCHEDULED",
                },
                {
                  label: "Under Inspection",
                  count: applications.filter((a) => a.status === "UNDER_VERIFICATION").length,
                  status: "UNDER_VERIFICATION",
                },
                {
                  label: "Verified / Passed",
                  count: applications.filter((a) => a.status === "PASSED").length,
                  status: "PASSED",
                },
              ].map((stage, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center"
                >
                  <p className="text-[11px] font-semibold text-slate-500 truncate">
                    {stage.label}
                  </p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {stage.count}
                  </p>
                  <div className="mt-1.5 flex justify-center">
                    <Badge status={stage.status} showDot={false} customLabel={stage.label} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Instruments Requiring Attention & Upcoming Inspections */}
            <div className="lg:col-span-7 space-y-6">
              {/* Urgent Attention Alert Box */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600 text-[20px]">
                      warning
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Instruments Requiring Statutory Attention
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {urgentInstruments.length} Items
                  </span>
                </div>

                {urgentInstruments.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    ✓ All registered instruments are currently valid and compliant.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {urgentInstruments.map((inst) => (
                      <div
                        key={inst.id}
                        className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">
                              {inst.name}
                            </h4>
                            <Badge status={inst.verificationStatus} />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            S/N: <span className="font-mono-code font-medium text-slate-700">{inst.serialNumber}</span> • Expiry:{" "}
                            <span className="font-semibold text-rose-700">
                              {formatDate(inst.validUntil)}
                            </span>
                          </p>
                        </div>

                        <Link
                          href={`/applications/apply?instrumentId=${inst.id}`}
                          className="px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0"
                        >
                          Re-Verify Now
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Scheduled Inspections */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-700 text-[20px]">
                      calendar_today
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Upcoming Scheduled Inspections
                    </h3>
                  </div>
                  <Link
                    href="/inspections"
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    View All →
                  </Link>
                </div>

                {scheduledInspections.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No inspections scheduled for today.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduledInspections.map((insp) => (
                      <div
                        key={insp.id}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              {insp.instrumentName}
                            </span>
                            <Badge status={insp.status} />
                          </div>
                          <p className="text-[11px] text-slate-600">
                            Officer: <span className="font-semibold text-slate-800">{insp.officer}</span> ({insp.officerRole})
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              pin_drop
                            </span>
                            {insp.location}
                          </p>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <p className="text-xs font-bold text-slate-900">
                            {formatDate(insp.scheduledDate)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {insp.scheduledTime}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (5 cols): Active Certificates & Audit Activity */}
            <div className="lg:col-span-5 space-y-6">
              {/* Quick Certificate Vault Preview */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                      verified
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Digital Certificates Vault
                    </h3>
                  </div>
                  <Link
                    href="/certificates"
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    View All ({certificates.length}) →
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {certificates.slice(0, 3).map((cert) => (
                    <div
                      key={cert.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {cert.instrumentName}
                        </p>
                        <p className="text-[10px] font-mono-code text-slate-500">
                          {cert.certificateNumber}
                        </p>
                      </div>
                      <Link
                        href={`/verify/${cert.id}`}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 shrink-0"
                      >
                        Verify QR
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent System Audit Activity */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-700 text-[20px]">
                      history
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Recent Activity &amp; Audit Log
                    </h3>
                  </div>
                </div>

                <div className="relative pl-5 space-y-4 border-l border-slate-200 text-xs">
                  <div className="relative">
                    <span className="absolute -left-[25px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100" />
                    <p className="font-bold text-slate-900">
                      Application APP-2026-00192 Assigned
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Scheduled for inspection on 28 Aug 2026 by LMO Rajesh Sharma.
                    </p>
                    <span className="text-[10px] text-slate-400">2 days ago</span>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[25px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-100" />
                    <p className="font-bold text-slate-900">
                      Certificate LM-DEL-2026-00445 Issued
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Automated Checkweigher passed verification and certified.
                    </p>
                    <span className="text-[10px] text-slate-400">6 days ago</span>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[25px] top-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white ring-2 ring-amber-100" />
                    <p className="font-bold text-slate-900">
                      Re-Verification Alert (30 Days)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Industrial Pitless Weighbridge certificate expiring soon.
                    </p>
                    <span className="text-[10px] text-slate-400">1 week ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
