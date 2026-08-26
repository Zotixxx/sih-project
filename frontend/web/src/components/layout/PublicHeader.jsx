"use client";

import React from "react";
import Link from "next/link";
import RoleSwitcher from "../shared/RoleSwitcher";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded bg-slate-900 flex items-center justify-center text-white shadow-2xs group-hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-[22px]">balance</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                MetriX
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200">
                GOV.IN
              </span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Legal Metrology Digital Platform
            </p>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <Link href="/verify" className="hover:text-slate-900 transition-colors">
            Verify Certificate
          </Link>
          <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
            Business Portal
          </Link>
          <Link href="/admin" className="hover:text-slate-900 transition-colors">
            Govt Authority
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <RoleSwitcher />
          <Link
            href="/verify"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600">
              qr_code_scanner
            </span>
            Verify QR
          </Link>
          <Link
            href="/login"
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Portal Login
          </Link>
        </div>
      </div>
    </header>
  );
}
