"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMetrixStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { setUserRole } = useMetrixStore();
  const [activeTab, setActiveTab] = useState("business"); // 'business' | 'authority'
  const [email, setEmail] = useState("compliance@apexlogistics.in");
  const [password, setPassword] = useState("••••••••••••");
  const [officerBadge, setOfficerBadge] = useState("LMO-DEL-104");
  const [selectedAuthorityRole, setSelectedAuthorityRole] = useState("lmo"); // 'lmo' | 'admin'

  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (activeTab === "business") {
      setUserRole("business");
      if (isSignup || email.toLowerCase().includes("business@example.com")) {
        router.push("/settings");
      } else {
        router.push("/dashboard");
      }
    } else {
      setUserRole(selectedAuthorityRole);
      router.push("/dashboard");
    }
  };

  const handleQuickPersona = (role) => {
    setUserRole(role);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      {/* Top Simple Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">balance</span>
          </div>
          <div>
            <span className="text-base font-extrabold text-slate-900 tracking-tight">
              MetriX
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Legal Metrology System
            </span>
          </div>
        </Link>

        <Link
          href="/verify"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px] text-emerald-600">
            qr_code_scanner
          </span>
          Public Verification
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Top Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab("business");
                setEmail("compliance@apexlogistics.in");
              }}
              className={cn(
                "py-3.5 px-4 text-center transition-colors flex items-center justify-center gap-2",
                activeTab === "business"
                  ? "bg-white text-slate-900 border-b-2 border-slate-900"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <span className="material-symbols-outlined text-[18px]">
                storefront
              </span>
              Business Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("authority");
                setEmail("officer.rajesh@delhi.gov.in");
              }}
              className={cn(
                "py-3.5 px-4 text-center transition-colors flex items-center justify-center gap-2",
                activeTab === "authority"
                  ? "bg-white text-slate-900 border-b-2 border-slate-900"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <span className="material-symbols-outlined text-[18px]">
                admin_panel_settings
              </span>
              Authority / LMO
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {activeTab === "business"
                  ? "Business Login"
                  : "Government Authority Login"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === "business"
                  ? "Access your registered instruments, applications, and certificates."
                  : "Secure access for Legal Metrology Officers (LMO) and Administrators."}
              </p>
            </div>

            {/* Quick Demo Credentials Switcher */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                1-Click Demo Logins for Judges &amp; Reviewers:
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickPersona("business")}
                  className="p-2 bg-white border border-slate-200 rounded text-center hover:border-slate-400 hover:bg-slate-50 transition-all font-semibold text-slate-800"
                >
                  🏢 Business
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPersona("lmo")}
                  className="p-2 bg-white border border-slate-200 rounded text-center hover:border-slate-400 hover:bg-slate-50 transition-all font-semibold text-slate-800"
                >
                  👮 LMO Field
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPersona("admin")}
                  className="p-2 bg-white border border-slate-200 rounded text-center hover:border-slate-400 hover:bg-slate-50 transition-all font-semibold text-slate-800"
                >
                  🛠️ Admin
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              {activeTab === "authority" && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Authority Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded border cursor-pointer transition-all",
                        selectedAuthorityRole === "lmo"
                          ? "bg-slate-50 border-slate-900 font-bold"
                          : "border-slate-200 text-slate-600"
                      )}
                    >
                      <input
                        type="radio"
                        name="authRole"
                        checked={selectedAuthorityRole === "lmo"}
                        onChange={() => setSelectedAuthorityRole("lmo")}
                        className="text-slate-900 focus:ring-slate-900"
                      />
                      LMO Inspector
                    </label>
                    <label
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded border cursor-pointer transition-all",
                        selectedAuthorityRole === "admin"
                          ? "bg-slate-50 border-slate-900 font-bold"
                          : "border-slate-200 text-slate-600"
                      )}
                    >
                      <input
                        type="radio"
                        name="authRole"
                        checked={selectedAuthorityRole === "admin"}
                        onChange={() => setSelectedAuthorityRole("admin")}
                        className="text-slate-900 focus:ring-slate-900"
                      />
                      Department Admin
                    </label>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  {activeTab === "business"
                    ? "Official Email / Reg ID"
                    : "Govt Officer Email ID"}
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>

              {activeTab === "authority" && (
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Officer Badge / Department Code
                  </label>
                  <input
                    type="text"
                    value={officerBadge}
                    onChange={(e) => setOfficerBadge(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-xs font-mono-code focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">Password</label>
                  <a href="#" className="text-slate-500 hover:text-slate-900 text-[11px]">
                    Forgot?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-2xs flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSignup ? "person_add" : "login"}
                </span>
                {isSignup ? "Register & Setup Profile" : "Sign In to Platform"}
              </button>
            </form>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
            {activeTab === "business" ? (
              <p>
                {isSignup ? "Already registered? " : "New Business? "}
                <button
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
                  className="font-bold text-slate-900 hover:underline cursor-pointer"
                >
                  {isSignup ? "Sign In" : "Sign Up / Register Business"}
                </button>
              </p>
            ) : (
              <p>Official Legal Metrology Department Credentials Required.</p>
            )}
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200">
        © 2026 MetriX Platform • Legal Metrology Act, 2009
      </footer>
    </div>
  );
}
