"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/layout/PublicHeader";
import StatTicker from "@/components/shared/StatTicker";
import { initialCertificates } from "@/lib/mockData";

export default function PublicVerifyLookupPage() {
  const router = useRouter();
  const [certInput, setCertInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (certInput.trim()) {
      router.push(`/verify/${encodeURIComponent(certInput.trim())}`);
    }
  };

  const sampleCertList = [
    { id: "LM-DEL-2026-00114", label: "Valid Class I Micro-Balance (Valid)", status: "VALID" },
    { id: "LM-DEL-2025-00892", label: "Weighbridge (Expiring Soon)", status: "EXPIRING" },
    { id: "LM-DEL-2025-00109", label: "Platform Scale (Expired)", status: "EXPIRED" },
    { id: "INVALID-999", label: "Counterfeit / Unknown ID (Not Found)", status: "NOT_FOUND" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      <div>
        <PublicHeader />
        <StatTicker />

        <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">
                verified_user
              </span>
              Official Public Verification Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Legal Metrology Certificate Verification
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              Scan the QR code printed on the physical certificate or enter the unique Certificate ID below to verify authenticity directly against the central regulatory database.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Certificate Identifier / Stamped Reference
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[24px]">
                    qr_code_scanner
                  </span>
                  <input
                    type="text"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="e.g. LM-DEL-2026-00114 or LM/DL/2026/00114/PREC"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-4 py-3.5 text-sm sm:text-base font-mono-code font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">
                  search_check
                </span>
                Verify Certificate Record
              </button>
            </form>

            {/* Quick One-Click Samples for Judges & Reviewers */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Quick Demo Lookups:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sampleCertList.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => router.push(`/verify/${sample.id}`)}
                    className="p-3 text-left rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all flex items-center justify-between text-xs font-semibold text-slate-800"
                  >
                    <div>
                      <span className="font-mono-code font-bold block text-slate-900">
                        {sample.id}
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {sample.label}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">
                      arrow_forward
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Security & Authenticity Explainer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                  security
                </span>
                Tamper-Resistant
              </div>
              <p className="text-[11px] text-slate-500">
                Data is fetched strictly from authoritative government servers, not from client-generated strings.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                  gavel
                </span>
                Statutory Compliance
              </div>
              <p className="text-[11px] text-slate-500">
                Guarantees instruments are within Maximum Permissible Error tolerances under Act 2009.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                  history
                </span>
                Lifetime Traceability
              </div>
              <p className="text-[11px] text-slate-500">
                Complete historical record of all past verification inspections and calibration events.
              </p>
            </div>
          </div>
        </main>
      </div>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 Directorate of Legal Metrology • Public Verification Infrastructure
      </footer>
    </div>
  );
}
