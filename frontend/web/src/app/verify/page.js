"use client";

import React from "react";
import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";
import StatTicker from "@/components/shared/StatTicker";

export default function PublicVerifyInfoPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      <div>
        <PublicHeader />
        <StatTicker />

        <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-10">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                qr_code_scanner
              </span>
              QR Verification Information
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How to Verify a Certificate
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Every commercial weighing and measuring instrument verified under the Legal Metrology Act, 2009 receives a dynamic, cryptographically signed QR code. Scanning this QR code is the only authorized method to verify statutory validity.
            </p>
          </div>

          {/* Core Explainer Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Steps to Verify Instrument Authenticity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Follow these three simple steps to confirm statutory verification in seconds.
              </p>
            </div>

            {/* 3 Step Visual Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Locate the Official QR Code
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Find the printed QR code on the official verification certificate (Form VIII) or the physical security seal plate affixed to the weighing instrument by the Legal Metrology Officer.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Scan with Your Smartphone
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Open your smartphone camera, Google Lens, or any standard QR code scanner. Point your device directly at the QR code. No special app or login is needed.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-sm">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  View Real-Time Record
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The scan immediately opens the secure official verification page (<code className="text-[11px] bg-slate-200 px-1 py-0.5 rounded font-mono-code">/verify/[id]</code>) showing live statutory status and technical parameters.
                </p>
              </div>
            </div>

            {/* What Information Is Verified */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Information Displayed Upon Scanning
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span aria-hidden="true" className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                    verified
                  </span>
                  <div>
                    <strong className="text-slate-900 block">Statutory Validity Status</strong>
                    <span className="text-slate-500">
                      Live indicator displaying VALID, EXPIRING SOON, or EXPIRED.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span aria-hidden="true" className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                    storefront
                  </span>
                  <div>
                    <strong className="text-slate-900 block">Commercial Establishment Details</strong>
                    <span className="text-slate-500">
                      Merchant name, registered trade location, and license reference.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span aria-hidden="true" className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                    straighten
                  </span>
                  <div>
                    <strong className="text-slate-900 block">Physical Instrument Identification</strong>
                    <span className="text-slate-500">
                      Serial number, manufacturer, model, capacity, and accuracy class.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span aria-hidden="true" className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0 mt-0.5">
                    badge
                  </span>
                  <div>
                    <strong className="text-slate-900 block">Officer Endorsement &amp; Cryptographic Seal</strong>
                    <span className="text-slate-500">
                      Stamping Legal Metrology Officer, verification date, and SHA-256 hash.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Why QR Scanning is Mandatory */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-950">
              <span aria-hidden="true" className="material-symbols-outlined text-amber-600 text-[22px] shrink-0 mt-0.5">
                security
              </span>
              <div className="space-y-1">
                <strong className="font-bold block">Why arbitrary search is not permitted</strong>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  To prevent unauthorized scraping and counterfeit replication of certificate numbers, public verification requires scanning the physical QR code. This ensures that only parties in actual physical proximity to the certified instrument or official certificate can inspect its regulatory record.
                </p>
              </div>
            </div>

          </div>
        </main>
      </div>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 Directorate of Legal Metrology • Legal Metrology Act, 2009
      </footer>
    </div>
  );
}
