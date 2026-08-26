"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMetrixStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function SideNavBar() {
  const pathname = usePathname();
  const { userRole, notifications } = useMetrixStore();

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Base navigation links
  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "dashboard",
      roles: ["business", "lmo", "admin"],
    },
    {
      label: "Instruments",
      href: "/instruments",
      icon: "straighten",
      roles: ["business", "admin"],
    },
    {
      label: "Applications",
      href: "/applications",
      icon: "description",
      roles: ["business", "admin", "lmo"],
    },
    {
      label: "Inspections",
      href: "/inspections",
      icon: "assignment_turned_in",
      roles: ["business", "lmo", "admin"],
    },
    {
      label: "Certificates Vault",
      href: "/certificates",
      icon: "verified",
      roles: ["business", "admin", "lmo"],
    },
    {
      label: "Admin Scheduling",
      href: "/admin",
      icon: "calendar_month",
      roles: ["admin"],
      badge: "Govt",
    },
    {
      label: "LMO Field Tablet",
      href: "/lmo/inspect/INSP-2026-0044",
      icon: "tablet_mac",
      roles: ["lmo"],
      badge: "Field",
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: "notifications",
      roles: ["business", "lmo", "admin"],
      badgeCount: unreadCount > 0 ? unreadCount : null,
    },
    {
      label: "Settings & Profile",
      href: "/settings",
      icon: "settings",
      roles: ["business", "admin"],
    },
  ];

  // Filter items visible to current role
  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-slate-200 flex flex-col z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white shadow-2xs group-hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-[20px]">balance</span>
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              MetriX
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200">
                GOV
              </span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Legal Metrology
            </p>
          </div>
        </Link>
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group",
                isActive
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "material-symbols-outlined text-[20px] transition-transform group-hover:scale-105",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                    isActive
                      ? "bg-slate-800 text-slate-200"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {item.badge}
                </span>
              )}

              {item.badgeCount && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    isActive
                      ? "bg-emerald-400 text-slate-900"
                      : "bg-rose-500 text-white"
                  )}
                >
                  {item.badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick Action Button in Sidebar */}
      <div className="p-3 border-t border-slate-200 shrink-0">
        <Link
          href="/applications/apply"
          className="w-full bg-slate-900 text-white text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Apply for Verification
        </Link>
      </div>

      {/* Bottom User Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 uppercase">
              {userRole === "business" ? "AP" : userRole === "lmo" ? "RS" : "AD"}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">
                {userRole === "business"
                  ? "Apex Logistics"
                  : userRole === "lmo"
                  ? "Insp. R. Sharma"
                  : "HQ Administrator"}
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">
                {userRole}
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            title="Logout / Switch Account"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
