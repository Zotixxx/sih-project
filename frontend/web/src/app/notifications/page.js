"use client";

import React, { useState } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import { useMetrixStore } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } =
    useMetrixStore();

  const [filter, setFilter] = useState("ALL");
  const [selectedNotif, setSelectedNotif] = useState(null);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "ALL") return true;
    if (filter === "UNREAD") return n.unread;
    if (filter === "EXPIRY") return n.category === "EXPIRY_WARNING";
    return true;
  });

  const handleSelectNotif = (notif) => {
    markNotificationAsRead(notif.id);
    setSelectedNotif(notif);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Notification Center"
          subtitle="Critical regulatory alerts, inspection scheduling updates, and expiry reminders."
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            { label: "Notifications" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Header Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Alerts &amp; Statutory Reminders
              </h3>
              <p className="text-xs text-slate-500">
                {notifications.filter((n) => n.unread).length} unread notices
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setFilter("ALL")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    filter === "ALL"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("UNREAD")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    filter === "UNREAD"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilter("EXPIRY")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    filter === "EXPIRY"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Expiry Alerts
                </button>
              </div>

              <button
                onClick={markAllNotificationsAsRead}
                className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Mark All as Read
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500">
                No notifications in this category.
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleSelectNotif(notif)}
                  className={`bg-white border-2 rounded-xl p-5 shadow-2xs cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    notif.unread
                      ? "border-slate-900 bg-slate-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.category === "EXPIRY_WARNING"
                          ? "bg-amber-100 text-amber-800"
                          : notif.category === "CERTIFICATE_ISSUED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {notif.category === "EXPIRY_WARNING"
                          ? "warning"
                          : notif.category === "CERTIFICATE_ISSUED"
                          ? "verified"
                          : "schedule"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                          {notif.title}
                        </h4>
                        {notif.unread && (
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                        )}
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            notif.priority === "HIGH"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {notif.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 block pt-0.5">
                        {formatDateTime(notif.timestamp)}
                      </span>
                    </div>
                  </div>

                  {notif.actionUrl && (
                    <Link
                      href={notif.actionUrl}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shrink-0 self-start sm:self-auto"
                    >
                      {notif.actionText || "View Action"} →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Notification Detail Slide-Over */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs"
            onClick={() => setSelectedNotif(null)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-200 text-xs">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono-code">
                  {selectedNotif.id}
                </span>
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    close
                  </span>
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  {selectedNotif.title}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {formatDateTime(selectedNotif.timestamp)}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-500 font-bold uppercase text-[10px]">
                  Notice Description
                </span>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {selectedNotif.message}
                </p>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-1 text-[11px] text-blue-950">
                <span className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    gavel
                  </span>
                  Statutory Requirement
                </span>
                <p className="leading-relaxed">
                  Timely compliance with verification notifications ensures continued legal validity under Department of Consumer Affairs guidelines.
                </p>
              </div>
            </div>

            {selectedNotif.actionUrl && (
              <div className="pt-6 border-t border-slate-200">
                <Link
                  href={selectedNotif.actionUrl}
                  className="w-full py-3 rounded-lg bg-slate-900 text-white font-bold text-xs text-center block hover:bg-slate-800 transition-colors"
                >
                  {selectedNotif.actionText || "Proceed with Required Action"} →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
