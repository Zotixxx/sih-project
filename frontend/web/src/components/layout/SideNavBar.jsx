"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMetrixStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function SideNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, userRole, district, notifications, applications, logout } = useMetrixStore();
  const basePath = currentUser?.id ? `/${currentUser.id}` : "";
  const scoped = (href) => `${basePath}${href}`;

  const unreadCount = (notifications || []).filter((n) => n.unread).length;
  const pendingReviewCount = (applications || []).filter(
    (a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW"
  ).length;
  const awaitingApprovalCount = (applications || []).filter(
    (application) => application.status === "AWAITING_APPROVAL"
  ).length;

  // 1. Assistant Controller Navigation (Section 58)
  const adminNav = [
    { label: "Dashboard", href: scoped("/dashboard"), icon: "dashboard" },
    {
      label: "Fresh Applications",
      href: scoped("/fresh-applications"),
      icon: "description",
      badgeCount: pendingReviewCount > 0 ? pendingReviewCount : null,
    },
    {
      label: "Verify",
      href: scoped("/verify"),
      icon: "approval",
      badgeCount: awaitingApprovalCount > 0 ? awaitingApprovalCount : null,
      highlightBadge: true,
    },
    { label: "LMOs", href: scoped("/lmos"), icon: "badge" },
    {
      label: "Notifications",
      href: scoped("/notifications"),
      icon: "notifications",
      badgeCount: unreadCount > 0 ? unreadCount : null,
    },
    { label: "Settings", href: scoped("/settings"), icon: "settings" },
  ];

  // 2. Business Navigation (Section 58)
  const businessNav = [
    { label: "Dashboard", href: scoped("/dashboard"), icon: "dashboard" },
    {
      label: "Applications",
      href: scoped("/applications"),
      icon: "description",
    },
    { label: "Certificates", href: scoped("/certificates"), icon: "verified" },
    { label: "Instruments", href: scoped("/instruments"), icon: "straighten" },
    {
      label: "Notifications",
      href: scoped("/notifications"),
      icon: "notifications",
      badgeCount: unreadCount > 0 ? unreadCount : null,
    },
    { label: "Settings", href: scoped("/settings"), icon: "settings" },
  ];

  // 3. LMO Navigation (Section 58)
  const lmoNav = [
    { label: "Dashboard", href: scoped("/dashboard"), icon: "dashboard" },
    { label: "Inspections", href: scoped("/inspections"), icon: "assignment_turned_in" },
    { label: "Verification Details", href: scoped("/verification-details"), icon: "fact_check" },
    {
      label: "Notifications",
      href: scoped("/notifications"),
      icon: "notifications",
      badgeCount: unreadCount > 0 ? unreadCount : null,
    },
    { label: "Settings", href: scoped("/settings"), icon: "settings" },
  ];

  const visibleItems =
    userRole === "lmo" ? lmoNav : userRole === "business" ? businessNav : adminNav;

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-slate-200 flex flex-col z-40 select-none">
      {/* Brand & District Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-200 shrink-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white shadow-2xs group-hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-[20px]">balance</span>
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              MetriX
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200 uppercase">
                {currentUser?.district_id || district?.name || "RJ"}
              </span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Legal Metrology Dept
            </p>
          </div>
        </Link>
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>
            {userRole === "business"
              ? "Merchant Portal"
              : userRole === "lmo"
              ? "Field Officer Portal"
              : "District Admin Menu"}
          </span>
          {userRole === "admin" && (
            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono-code font-bold">
              {district?.name || currentUser?.districtName || currentUser?.district_id || "District"}
            </span>
          )}
        </div>

        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (!item.href.endsWith("/dashboard") && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label + item.href}
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
                <span className="truncate">{item.label}</span>
              </div>

              {item.badgeCount && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                    item.highlightBadge
                      ? "bg-amber-500 text-white animate-pulse"
                      : isActive
                      ? "bg-slate-700 text-white"
                      : "bg-slate-200 text-slate-800"
                  )}
                >
                  {item.badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Quick Action Button */}
      <div className="p-3 border-t border-slate-200 shrink-0">
        {userRole === "admin" && (
          <Link
            href={scoped("/verify")}
            className="w-full bg-slate-900 text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
            Review Awaiting ({awaitingApprovalCount})
          </Link>
        )}

        {userRole === "business" && (
          <Link
            href={scoped("/applications/apply")}
            className="w-full bg-slate-900 text-white text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Apply for Verification
          </Link>
        )}

        {userRole === "lmo" && (
          <Link
            href={scoped("/inspections")}
            className="w-full bg-slate-900 text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            View Field Itinerary
          </Link>
        )}
      </div>

      {/* Bottom User Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase ${
                userRole === "business"
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : userRole === "lmo"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-purple-100 text-purple-800 border border-purple-200"
              }`}
            >
                {(currentUser?.name || currentUser?.displayName || "U")
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentUser?.businessName || currentUser?.name || currentUser?.displayName || "Signed-in user"}
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">
                {currentUser?.domainId || currentUser?.role || currentUser?.district_id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
