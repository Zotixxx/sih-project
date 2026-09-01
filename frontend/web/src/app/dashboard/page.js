"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import MetricCard from "@/components/ui/MetricCard";
import Badge from "@/components/ui/Badge";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const {
    currentUser,
    userRole,
    district,
    dashboardStats,
    instruments,
    applications,
    inspections,
    certificates,
    lmos,
    notifications,
  } = useMetrixStore();

  const districtName = district?.name || currentUser?.districtName || "Ajmer";
  const officerName = currentUser?.name || "Official";
  const officerId = currentUser?.badge || currentUser?.id || "OFFICER";

  // ==========================================
  // 1. BUSINESS DASHBOARD (Section 4)
  // ==========================================
  if (userRole === "business" || currentUser?.role === "BUSINESS") {
    const myApps = (applications || []).filter((a) => {
      return (
        a.businessId === currentUser.id ||
        a.business_id === currentUser.id ||
        a.businessName?.toLowerCase().includes(currentUser.name?.toLowerCase()) ||
        a.businessName?.toLowerCase().includes(currentUser.businessName?.toLowerCase())
      );
    });

    const myCerts = (certificates || []).filter((c) => {
      return (
        c.businessId === currentUser.id ||
        c.business_id === currentUser.id ||
        c.ownerName?.toLowerCase().includes(currentUser.name?.toLowerCase()) ||
        c.ownerName?.toLowerCase().includes(currentUser.businessName?.toLowerCase())
      );
    });

    const myInstruments = (instruments || []).filter((i) => {
      return (
        i.businessId === currentUser.id ||
        i.business_id === currentUser.id ||
        i.ownerName?.toLowerCase().includes(currentUser.name?.toLowerCase()) ||
        i.ownerName?.toLowerCase().includes(currentUser.businessName?.toLowerCase())
      );
    });

    const inProgressApps = myApps.filter(
      (a) => a.status !== "CERTIFIED" && a.status !== "REJECTED"
    );
    const approvedApps = myApps.filter((a) => a.status === "CERTIFIED");

    return (
      <div className="min-h-screen bg-[#f8fafc] flex">
        <SideNavBar />

        <div className="flex-1 ml-[260px] flex flex-col min-w-0">
          <TopNavBar
            title="Dashboard"
            subtitle={`${currentUser.businessName || currentUser.name} • Registered Commercial Establishment`}
            breadcrumbs={[
              { label: "Dashboard" },
            ]}
          />

          <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* Welcome Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined text-[28px]">storefront</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Merchant Portal
                    </span>
                    <span className="text-slate-400 text-xs font-mono-code">{currentUser.id}</span>
                  </div>
                  <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                    {currentUser.businessName || currentUser.name}
                  </h1>
                  <p className="text-xs text-slate-300">
                    Proprietor: <strong className="text-white">{currentUser.name}</strong> • District: <strong className="text-white">{districtName}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/applications"
                  className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-colors shadow-2xs"
                >
                  View My Applications ({myApps.length})
                </Link>
                <Link
                  href="/instruments"
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
                >
                  + Add Instrument
                </Link>
              </div>
            </div>

            {/* 3 Clickable Summary Metrics (Total Applications, Instruments, Certificates) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div
                onClick={() => router.push("/applications")}
                className="cursor-pointer group focus:outline-none"
              >
                <MetricCard
                  title="Total Applications"
                  value={myApps.length}
                  icon="description"
                  subtitle="Click to view all applications →"
                  onClick={() => router.push("/applications")}
                />
              </div>
              <div
                onClick={() => router.push("/instruments")}
                className="cursor-pointer group focus:outline-none"
              >
                <MetricCard
                  title="Instruments"
                  value={myInstruments.length}
                  icon="straighten"
                  subtitle="Click to view instruments →"
                  onClick={() => router.push("/instruments")}
                />
              </div>
              <div
                onClick={() => router.push("/certificates")}
                className="cursor-pointer group focus:outline-none"
              >
                <MetricCard
                  title="Certificates"
                  value={myCerts.length}
                  icon="workspace_premium"
                  subtitle="Click to view certificates →"
                  onClick={() => router.push("/certificates")}
                />
              </div>
            </div>

            {/* Applications in Progress */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-700 text-[18px]">timeline</span>
                    Applications in Progress
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track status and verification progress of your filings
                  </p>
                </div>
                <Link href="/applications" className="text-xs text-blue-700 hover:underline font-bold">
                  View All ({myApps.length}) →
                </Link>
              </div>

              {myApps.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                  No verification applications filed yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {myApps.slice(0, 5).map((app) => (
                    <div key={app.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-code font-bold text-slate-900">{app.id}</span>
                          <Badge status={app.status} className="text-[10px]" />
                        </div>
                        <p className="font-bold text-slate-800 mt-0.5">{app.instrumentName}</p>
                        <p className="text-[11px] text-slate-500 font-mono-code">S/N: {app.serialNumber} • Submitted: {formatDate(app.applicationDate || app.submissionDate)}</p>
                      </div>
                      <Link
                        href={`/applications/${app.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs shrink-0"
                      >
                        Track Status →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. LMO WORK DASHBOARD (Section 6)
  // ==========================================
  if (userRole === "lmo" || currentUser?.role === "LMO") {
    const myInspections = (inspections || []).filter((i) => {
      return (
        i.officerId === currentUser.id ||
        i.officerId === currentUser.badge ||
        i.officer?.toLowerCase().includes(currentUser.name?.toLowerCase()) ||
        !i.officerId
      );
    });

    const pendingToday = myInspections.filter(
      (i) => i.status === "SCHEDULED" || i.status === "ASSIGNED" || i.status === "IN_PROGRESS"
    );
    const completedInspections = myInspections.filter(
      (i) => i.status === "SUBMITTED" || i.status === "SUBMITTED_FOR_APPROVAL" || i.status === "APPROVED" || i.status === "COMPLETED"
    );

    return (
      <div className="min-h-screen bg-[#f8fafc] flex">
        <SideNavBar />

        <div className="flex-1 ml-[260px] flex flex-col min-w-0">
          <TopNavBar
            title="Dashboard"
            subtitle={`Good Day, ${officerName} • ${officerId} • ${districtName} District`}
            breadcrumbs={[
              { label: "Dashboard" },
            ]}
          />

          <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* Simple Work Greeting Banner (Section 6) */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined text-[28px]">verified_user</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Field Duty Officer
                  </span>
                  <h1 className="text-xl font-black text-white tracking-tight mt-1">
                    Good Morning, {officerName}
                  </h1>
                  <p className="text-xs text-slate-300">
                    Officer ID: <strong className="text-white font-mono-code">{officerId}</strong> • Jurisdiction: <strong className="text-white">{districtName} District</strong>
                  </p>
                </div>
              </div>

              <Link
                href="/inspections"
                className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-2xs self-start sm:self-auto"
              >
                Go to Today&apos;s Duty Queue →
              </Link>
            </div>

            {/* 3 Simple LMO Work Metrics (Section 6) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Today&apos;s Total Assigned
                </span>
                <span className="font-mono-code font-black text-slate-900 text-3xl mt-1 block">
                  {myInspections.length}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">Assigned verification sites</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                  Pending Field Inspections
                </span>
                <span className="font-mono-code font-black text-amber-700 text-3xl mt-1 block">
                  {pendingToday.length}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">Ready for on-site testing</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                  Completed Inspections
                </span>
                <span className="font-mono-code font-black text-emerald-700 text-3xl mt-1 block">
                  {completedInspections.length}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">Submitted for approval</span>
              </div>
            </div>

            {/* Today's Priority Inspections List */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-700 text-[20px]">assignment_late</span>
                  Today&apos;s Inspections Needing Action
                </h3>
                <Link href="/inspections" className="text-xs text-blue-700 hover:underline font-bold">
                  View All Inspections →
                </Link>
              </div>

              {pendingToday.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-500 bg-slate-50 rounded-xl space-y-2">
                  <span className="material-symbols-outlined text-[36px] text-emerald-600 block">task_alt</span>
                  <p className="font-bold text-slate-800 text-sm">All Current Field Duties Completed</p>
                  <p className="text-slate-500">You have no pending inspections waiting in your queue today.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {pendingToday.map((insp) => (
                    <div key={insp.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-code font-bold text-slate-900">{insp.id}</span>
                          <span className="text-[11px] text-slate-500 font-semibold">{insp.location}</span>
                        </div>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">{insp.ownerName}</p>
                        <p className="text-slate-600 text-[11px]">{insp.instrumentName} • S/N: {insp.serialNumber}</p>
                      </div>
                      <Link
                        href={`/lmo/inspect/${insp.id}`}
                        className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors self-start sm:self-auto shadow-2xs"
                      >
                        Start Inspection →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. ASSISTANT CONTROLLER DASHBOARD (Section 12)
  // ==========================================
  const freshCount =
    dashboardStats?.counts?.newApplications ??
    (applications || []).filter(
      (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
    ).length;

  const inProgressCount =
    dashboardStats?.counts?.scheduledVerifications ??
    (applications || []).filter(
      (a) => a.status === "ACCEPTED" || a.status === "SCHEDULED"
    ).length;

  const awaitingFinalCount =
    dashboardStats?.counts?.awaitingFinalApproval ??
    (applications || []).filter(
      (a) => a.status === "AWAITING_APPROVAL"
    ).length;

  const completedCount =
    dashboardStats?.counts?.completedVerifications ??
    (certificates || []).filter(
      (c) => c.status === "VALID"
    ).length;

  const activeLmoCount =
    dashboardStats?.counts?.activeLmos ?? (lmos || []).length;

  const freshApps = (applications || []).filter(
    (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
  );

  const awaitingApps = (applications || []).filter(
    (a) => a.status === "AWAITING_APPROVAL"
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Dashboard"
          subtitle={`Assistant Controller: ${officerName} (${officerId}) • District: ${districtName}, Rajasthan`}
          breadcrumbs={[
            { label: "Dashboard" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Authority Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-[28px]">account_balance</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    District Authority
                  </span>
                  <span className="text-slate-400 text-xs font-mono-code">{officerId}</span>
                </div>
                <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
                  Office of the Assistant Controller of Legal Metrology
                </h1>
                <p className="text-xs text-slate-300">
                  Supervising Officer: <strong className="text-white">{officerName}</strong> • Jurisdiction: <strong className="text-white">{districtName} District</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/fresh-applications"
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-2xs"
              >
                Fresh Applications ({freshCount})
              </Link>
              <Link
                href="/admin/verify"
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                Verify ({awaitingFinalCount})
              </Link>
            </div>
          </div>

          {/* District 5 Key Metrics (Section 12) */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Fresh Applications"
              value={freshCount}
              icon="inbox"
              subtitle="Requires initial review"
            />
            <MetricCard
              title="In Progress"
              value={inProgressCount}
              icon="schedule"
              subtitle="LMO assigned & field testing"
            />
            <MetricCard
              title="Waiting Final Review"
              value={awaitingFinalCount}
              icon="approval"
              subtitle="LMO inspection submitted"
            />
            <MetricCard
              title="Completed Verifications"
              value={completedCount}
              icon="verified"
              subtitle="Certificates sanctioned"
            />
            <MetricCard
              title="Active LMOs"
              value={activeLmoCount}
              icon="engineering"
              subtitle={`Officers in ${districtName}`}
            />
          </div>

          {/* Quick Work Queues */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Fresh Applications Queue */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">inbox</span>
                  Fresh Applications Needing Review
                </h3>
                <Link href="/admin/fresh-applications" className="text-xs text-blue-700 hover:underline font-bold">
                  View All ({freshCount}) →
                </Link>
              </div>

              {freshApps.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                  ✓ No fresh applications waiting for review in {districtName}.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {freshApps.slice(0, 3).map((app) => (
                    <div key={app.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-code font-bold text-slate-900">{app.id}</span>
                          <Badge status={app.status} className="text-[10px]" />
                        </div>
                        <p className="font-bold text-slate-900 mt-0.5">{app.businessName}</p>
                        <p className="text-slate-500 text-[11px]">{app.instrumentName} • S/N: {app.serialNumber}</p>
                      </div>
                      <Link
                        href="/admin/fresh-applications"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0"
                      >
                        Review →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Waiting for Final Sanction Queue */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px]">approval</span>
                  Waiting for Final Approval
                </h3>
                <Link href="/admin/verify" className="text-xs text-blue-700 hover:underline font-bold">
                  View All ({awaitingFinalCount}) →
                </Link>
              </div>

              {awaitingApps.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                  ✓ All submitted field inspections have been sanctioned.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {awaitingApps.slice(0, 3).map((app) => (
                    <div key={app.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-code font-bold text-slate-900">{app.id}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                            Inspection Complete
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 mt-0.5">{app.businessName}</p>
                        <p className="text-slate-500 text-[11px]">{app.instrumentName} • LMO: {app.assignedLmoName}</p>
                      </div>
                      <Link
                        href="/admin/verify"
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0"
                      >
                        Sanction →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
