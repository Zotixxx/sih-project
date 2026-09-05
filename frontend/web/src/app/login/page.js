"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMetrixStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { authenticate } = useMetrixStore();
  const [activeTab, setActiveTab] = useState("business");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const user = await authenticate({ email, password });
      const destination = user.role === "BUSINESS" && !user.address ? "settings" : "dashboard";
      router.push(`/${user.id}/${destination}`);
    } catch (error) {
      if (error.code === "PROFILE_REQUIRED" && activeTab === "business") {
        router.push("/register/business?complete=1");
        return;
      }
      setLoginError(error.message);
    }
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
                setEmail("");
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
                setEmail("");
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
                {activeTab === "business" ? "Business Login" : "Government Authority Login"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === "business"
                  ? "Access your registered instruments, applications, and certificates."
                  : "Secure access for Legal Metrology Officers (LMO) and Administrators."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>

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
                  login
                </span>
                Sign In to Platform
              </button>
              {activeTab === "business" && (
                <Link
                  href="/register/business"
                  className="w-full py-3 rounded-lg border border-slate-300 bg-white text-slate-800 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    person_add
                  </span>
                  New Business Registration
                </Link>
              )}
              {loginError && <p className="text-xs text-red-600" role="alert">{loginError}</p>}
            </form>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
            <p>Use an account provisioned in the local authority registry.</p>
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
