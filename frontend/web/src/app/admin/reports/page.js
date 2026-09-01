"use client";

import React from "react";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import VerificationTrendsChart from "@/components/charts/VerificationTrendsChart";
import CategoryDistributionChart from "@/components/charts/CategoryDistributionChart";
import DistrictComplianceChart from "@/components/charts/DistrictComplianceChart";
import { useMetrixStore } from "@/lib/store";
import { exportToCSV } from "@/lib/exportUtils";

export default function ReportsPage() {
  const { applications, certificates, inspections, district } = useMetrixStore();

  const totalApps = applications.length;
  const acceptedApps = applications.filter(
    (a) => a.status === "ACCEPTED" || a.status === "SCHEDULED" || a.status === "CERTIFIED"
  ).length;
  const rejectedApps = applications.filter((a) => a.status === "REJECTED").length;
  const validCerts = certificates.filter((c) => c.status === "VALID").length;

  const handleExportSummary = () => {
    const data = [
      { Metric: "District", Value: district?.name || "Ajmer" },
      { Metric: "Supervising Authority", Value: "Office of the Assistant Controller" },
      { Metric: "Total Filings", Value: totalApps },
      { Metric: "Accepted Filings", Value: acceptedApps },
      { Metric: "Rejected Filings", Value: rejectedApps },
      { Metric: "Valid Digital Certificates", Value: validCerts },
      { Metric: "District Compliance Rate", Value: "98.4%" },
    ];
    exportToCSV(`MetriX_District_Compliance_Summary_${district?.name || "Ajmer"}.csv`, data);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="District Legal Metrology Compliance Reports"
          subtitle={`Annual & Monthly Verification Intelligence • District: ${district?.name || "Ajmer"}, Rajasthan`}
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            { label: "Reports & Analytics" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Summary & Export */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Statutory Verification &amp; Stamping Analytics (2026-2027)
              </h3>
              <p className="text-xs text-slate-500">
                Data generated under the Standards of Weights &amp; Measures (Enforcement) Rules
              </p>
            </div>

            <button
              onClick={handleExportSummary}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-slate-800 transition-colors shadow-2xs shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export Official District Summary
            </button>
          </div>

          {/* Metric KPI Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Filings</span>
              <span className="font-mono-code font-black text-2xl text-slate-900 mt-1 block">{totalApps}</span>
              <span className="text-[10px] text-slate-500">Applications received</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Accepted / Processed</span>
              <span className="font-mono-code font-black text-2xl text-emerald-700 mt-1 block">{acceptedApps}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">{Math.round((acceptedApps / (totalApps || 1)) * 100)}% Acceptance Rate</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Certificates Sanctioned</span>
              <span className="font-mono-code font-black text-2xl text-blue-700 mt-1 block">{validCerts}</span>
              <span className="text-[10px] text-slate-500">Active digital credentials</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">District Compliance</span>
              <span className="font-mono-code font-black text-2xl text-slate-900 mt-1 block">98.4%</span>
              <span className="text-[10px] text-emerald-700 font-bold">Above 95.0% statutory target</span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Monthly Verification Trends vs Issued Certificates (Ajmer)
                </h4>
                <p className="text-xs text-slate-500">
                  Comparison between merchant filings and completed field verifications
                </p>
              </div>
              <VerificationTrendsChart />
            </div>

            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Category Distribution
                </h4>
                <p className="text-xs text-slate-500">
                  Fleet breakdown across Ajmer industries
                </p>
              </div>
              <CategoryDistributionChart />
            </div>

            <div className="lg:col-span-12 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Ajmer Sub-Division Territorial Compliance
                </h4>
                <p className="text-xs text-slate-500">
                  Compliance rate by zone (Ajmer City, Kishangarh, Beawar, Nasirabad, Pushkar)
                </p>
              </div>
              <DistrictComplianceChart />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
