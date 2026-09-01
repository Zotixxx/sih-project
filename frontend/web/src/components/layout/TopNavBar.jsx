"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RoleSwitcher from "../shared/RoleSwitcher";
import { useMetrixStore } from "@/lib/store";

export default function TopNavBar({ title, subtitle, breadcrumbs }) {
  const router = useRouter();
  const { userRole, notifications, instruments, certificates } = useMetrixStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const unreadCount = notifications.filter(
    (n) => n.unread && (!n.role || n.role === userRole)
  ).length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/instruments?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-6 flex items-center justify-between">
      {/* Title & Breadcrumbs */}
      <div>
        {breadcrumbs && (
          <nav className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300">/</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-slate-800 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-slate-700">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
          {title || "Overview"}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      {/* Center/Right Search & Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search serial, certificate, ID..."
            className="w-64 lg:w-72 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all"
          />
        </form>

        {/* Notifications Icon Button */}
        <Link
          href="/notifications"
          className="relative w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">
            notifications
          </span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Persona Switcher */}
        <RoleSwitcher />
      </div>
    </header>
  );
}
