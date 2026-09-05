"use client";

import React from "react";
import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";
import StatTicker from "@/components/shared/StatTicker";
import Badge from "@/components/ui/Badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* Top Public Navbar */}
      <PublicHeader />

      {/* Regulatory Notice Banner */}
      <StatTicker />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1 text-xs font-semibold text-slate-800 border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Legal Metrology Act, 2009 & General Rules 2011
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Digital Verification &amp; Certification for{" "}
                <span className="text-slate-700 underline decoration-slate-300 decoration-wavy">
                  Legal Metrology
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                MetriX digitizes the complete lifecycle of weighing and measuring instruments—from registration, scheduling, and geotagged field verification to tamper-proof cryptographic certificates and instant public QR validation.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    dashboard
                  </span>
                  Portal Login
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    lock
                  </span>
                  Authority Portal Login
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                    check_circle
                  </span>
                  Role-Based Access Control
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                    security
                  </span>
                  SHA-256 Checksums
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                    mobile_friendly
                  </span>
                  Offline-First Mobile Sync
                </div>
              </div>
            </div>

            {/* Right authenticated workflow panel */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white border-2 border-slate-900 rounded-xl p-6 shadow-xl relative transition-transform duration-300 hover:scale-[1.01]">
                <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">
                        balance
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Certificate of Verification
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Legal Metrology Act, 2009
                      </p>
                    </div>
                  </div>
                  <Badge status="IN_PROGRESS" customLabel="API workflow" />
                </div>

                <div className="min-h-[220px] flex flex-col items-center justify-center text-center gap-3">
                  <span className="material-symbols-outlined text-[48px] text-slate-300">rule_settings</span>
                  <h4 className="text-base font-bold text-slate-900">One controlled verification lifecycle</h4>
                  <p className="text-xs leading-relaxed text-slate-500 max-w-xs">
                    Businesses, Assistant Controllers, and LMOs work against the same Supabase-backed application, inspection, and certificate records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Core Pillars of MetriX */}
        <section className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Core Digital Architecture
              </h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Modernizing Weighing &amp; Measuring Verification End-to-End
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">
                    history_edu
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  1. Traceable Lifecycle
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every instrument maintains an immutable digital record of manufacture, capacity, calibration history, and inspection logs over years.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">
                    location_on
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  2. Geotagged Field Inspections
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Officers record error margins, physical seal photos, and automated GPS coordinates on-site with offline-first synchronization.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">
                    qr_code_scanner
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  3. Cryptographic QR Verification
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Consumers and authorities scan dynamic QR codes to verify validity in real-time against central server records with SHA-256 checks.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">
                    notification_important
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  4. Automated Expiry Tracking
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  30-day and 7-day proactive expiry notifications ensure businesses re-verify instruments on time, preventing commercial penalties.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stakeholder Portals Showcase */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Stakeholder Workflows
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tailored Portals for Every Role in the Ecosystem
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Business Owner Portal */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                    <span className="material-symbols-outlined text-[24px]">
                      storefront
                    </span>
                  </div>
                  <Badge status="ACTIVE" customLabel="Business" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  Business / Instrument Owner
                </h4>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                      check
                    </span>
                    Register instruments and manage asset fleet
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                      check
                    </span>
                    5-step online verification applications
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                      check
                    </span>
                    Download digital certificates &amp; track renewals
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="mt-6 w-full py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs text-center hover:bg-slate-800 transition-colors"
              >
                Access Business Portal
              </Link>
            </div>

            {/* Legal Metrology Officer (LMO) */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <span className="material-symbols-outlined text-[24px]">
                      engineering
                    </span>
                  </div>
                  <Badge status="VERIFIED" customLabel="Inspector" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  Legal Metrology Officer (LMO)
                </h4>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                      check
                    </span>
                    Assigned inspection itinerary &amp; territory queue
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                      check
                    </span>
                    Enforcement audit logs &amp; stamped certificates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                      check
                    </span>
                    Offline field execution via MetriX Android App
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="mt-6 w-full py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs text-center hover:bg-slate-800 transition-colors"
              >
                Open LMO Duty Portal
              </Link>
            </div>

            {/* Government Administrator */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                    <span className="material-symbols-outlined text-[24px]">
                      admin_panel_settings
                    </span>
                  </div>
                  <Badge status="PENDING" customLabel="Admin" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  Department Administration
                </h4>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                      check
                    </span>
                    Application queue review &amp; officer dispatch
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                      check
                    </span>
                    Calendar scheduling &amp; workload distribution
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                      check
                    </span>
                    District-level compliance analytics &amp; audit trails
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="mt-6 w-full py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs text-center hover:bg-slate-800 transition-colors"
              >
                Enter Admin Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-white text-slate-900 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">
                    balance
                  </span>
                </div>
                <span className="text-lg font-extrabold tracking-tight">
                  MetriX
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                A unified digital platform for the registration, verification, certification, and lifecycle management of weighing and measuring instruments under Legal Metrology regulations.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Portals
              </h5>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Business Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Instrument Management
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Apply for Verification
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Certificates Vault
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Governance &amp; Verification
              </h5>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Officer Scheduling &amp; Allocation
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Inspection Evidence &amp; Geotags
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Expiry Alert System
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Smart India Hackathon
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Developed for SIH 2026 under the Legal Metrology / Government Digital Public Services domain.
              </p>
              <div className="mt-3 inline-block px-2 py-1 rounded bg-slate-800 text-[10px] font-mono-code text-slate-300">
                Status: MVP v1.0 Production Prototype
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <p>© 2026 MetriX Platform — All rights reserved.</p>
            <p>Conforms to Legal Metrology Act, 2009 Standards.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
