"use client";

import React, { useState } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Modal from "@/components/ui/Modal";
import { useMetrixStore } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";

export default function NotificationsPage() {
  const {
    userRole,
    currentUser,
    notifications,
    lmos,
    issueNotice,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useMetrixStore();

  const [filter, setFilter] = useState("ALL");
  const [selectedNotif, setSelectedNotif] = useState(null);

  // Notice Creation Modal State (Assistant Controller)
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeTarget, setNoticeTarget] = useState("ALL"); // "ALL" or specific LMO id
  const [noticePriority, setNoticePriority] = useState("DIRECTIVE"); // URGENT, DIRECTIVE, CIRCULAR, ROUTINE
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [noticeRef, setNoticeRef] = useState("Legal Metrology Act, 2009 — Schedule VII Compliance");
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);
  const [noticeSuccessMsg, setNoticeSuccessMsg] = useState("");

  // Filter by user role and recipient
  const roleNotifs = notifications.filter((n) => {
    // If AC / Admin:
    if (userRole === "admin") {
      return (
        n.role === "admin" ||
        n.targetRole === "ASSISTANT_CONTROLLER" ||
        n.targetRole === "ADMIN" ||
        n.senderId === currentUser?.id ||
        (n.type === "OFFICIAL_DIRECTIVE" && n.senderId === currentUser?.id)
      );
    }
    // If LMO:
    if (userRole === "lmo") {
      if (n.role !== "lmo" && n.targetRole !== "LMO") return false;
      // If targeted to a specific LMO, only show if it matches this LMO
      if (n.targetUserId && n.targetUserId !== "ALL") {
        return (
          n.targetUserId.toLowerCase() === currentUser?.id?.toLowerCase() ||
          (currentUser?.badgeNumber &&
            n.targetUserId.toLowerCase() === currentUser.badgeNumber.toLowerCase()) ||
          (currentUser?.badge &&
            n.targetUserId.toLowerCase() === currentUser.badge.toLowerCase())
        );
      }
      return true;
    }
    // If Business:
    return !n.role || n.role === "business" || n.targetRole === "BUSINESS";
  });

  const filteredNotifications = roleNotifs.filter((n) => {
    if (filter === "ALL") return true;
    if (filter === "UNREAD") return n.unread;
    if (filter === "ASSIGNMENTS")
      return n.category === "INSPECTION_ASSIGNED" || n.category === "SCHEDULE_UPDATE";
    if (filter === "DIRECTIVES")
      return n.type === "OFFICIAL_DIRECTIVE" || n.category === "OFFICIAL_DIRECTIVE";
    if (filter === "ISSUED")
      return n.type === "OFFICIAL_DIRECTIVE" && n.senderId === currentUser?.id;
    if (filter === "EXPIRY") return n.category === "EXPIRY_WARNING";
    if (filter === "ALLOCATION") return n.category === "ALLOCATION_REQUIRED";
    return true;
  });

  const unreadRoleCount = roleNotifs.filter((n) => n.unread).length;

  const handleSelectNotif = (notif) => {
    markNotificationAsRead(notif.id);
    setSelectedNotif(notif);
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) {
      alert("Please provide both a notice title and instructions.");
      return;
    }

    setIsSubmittingNotice(true);
    try {
      await issueNotice({
        title: noticeTitle.trim(),
        message: noticeMessage.trim(),
        priority: noticePriority,
        targetLmoId: noticeTarget,
        statutoryRef: noticeRef.trim(),
      });

      setNoticeSuccessMsg("Official directive issued successfully to Legal Metrology Officers!");
      setNoticeTitle("");
      setNoticeMessage("");
      setTimeout(() => {
        setIsNoticeModalOpen(false);
        setNoticeSuccessMsg("");
      }, 1500);
    } catch (err) {
      alert("Failed to issue notice: " + err.message);
    } finally {
      setIsSubmittingNotice(false);
    }
  };

  const getCategoryIcon = (category, type) => {
    if (type === "OFFICIAL_DIRECTIVE" || category === "OFFICIAL_DIRECTIVE") {
      return "campaign";
    }
    switch (category) {
      case "INSPECTION_ASSIGNED":
        return "assignment_ind";
      case "SCHEDULE_UPDATE":
        return "event_available";
      case "POLICY_ADVISORY":
        return "policy";
      case "SYNC_COMPLETE":
        return "cloud_done";
      case "EXPIRY_WARNING":
        return "warning";
      case "CERTIFICATE_ISSUED":
        return "verified";
      case "ALLOCATION_REQUIRED":
        return "person_add";
      case "COMPLIANCE_MILESTONE":
        return "insights";
      default:
        return "notifications";
    }
  };

  const getCategoryColor = (category, type) => {
    if (type === "OFFICIAL_DIRECTIVE" || category === "OFFICIAL_DIRECTIVE") {
      return "bg-amber-100 text-amber-900 border-amber-300";
    }
    switch (category) {
      case "INSPECTION_ASSIGNED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SCHEDULE_UPDATE":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "POLICY_ADVISORY":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "SYNC_COMPLETE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "EXPIRY_WARNING":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "CERTIFICATE_ISSUED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const isAC = userRole === "admin";
  const isLMO = userRole === "lmo";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title={
            isLMO
              ? "LMO Duty Notices & Directives"
              : isAC
              ? "Department Notices & Directives"
              : "Business Compliance Alerts & Reminders"
          }
          subtitle={
            isLMO
              ? "Official departmental directives from the Assistant Controller and scheduled field verification assignments."
              : isAC
              ? "Issue binding notices to Legal Metrology Officers, review district allocations, and track officer acknowledgments."
              : "Critical instrument expiry warnings, inspection visit confirmations, and statutory compliance updates."
          }
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            {
              label: isLMO ? "Duty Notices" : isAC ? "Notices & Directives" : "Statutory Alerts",
            },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Top Actions & Filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {isLMO
                  ? "Official Field Notices & Directives"
                  : isAC
                  ? "Assistant Controller Directive Desk"
                  : "Merchant Compliance Notices"}
                <span className="px-2 py-0.5 rounded-full text-xs font-mono-code font-bold bg-slate-100 text-slate-700">
                  {roleNotifs.length} Total
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {unreadRoleCount} unread notices for active session
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setFilter("ALL")}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    filter === "ALL"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All ({roleNotifs.length})
                </button>

                <button
                  onClick={() => setFilter("UNREAD")}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    filter === "UNREAD"
                      ? "bg-white text-slate-900 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Unread ({unreadRoleCount})
                </button>

                {isLMO && (
                  <>
                    <button
                      onClick={() => setFilter("DIRECTIVES")}
                      className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                        filter === "DIRECTIVES"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px] text-amber-700">
                        campaign
                      </span>
                      Directives
                    </button>
                    <button
                      onClick={() => setFilter("ASSIGNMENTS")}
                      className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                        filter === "ASSIGNMENTS"
                          ? "bg-white text-slate-900 shadow-2xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Assignments
                    </button>
                  </>
                )}

                {isAC && (
                  <button
                    onClick={() => setFilter("ISSUED")}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                      filter === "ISSUED"
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px] text-emerald-700">
                      outgoing_mail
                    </span>
                    Issued Notices
                  </button>
                )}
              </div>

              {/* AC Action Button: Issue Notice to LMOs */}
              {isAC && (
                <button
                  onClick={() => setIsNoticeModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">campaign</span>
                  Issue Notice to LMOs
                </button>
              )}

              <button
                onClick={markAllNotificationsAsRead}
                className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Mark All Read
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500 space-y-2">
                <span className="material-symbols-outlined text-[36px] text-slate-300 block">
                  notifications_paused
                </span>
                <p className="font-bold text-slate-700 text-sm">No Notifications Found</p>
                <p>No notices matching the current filter criteria.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isDirective =
                  notif.type === "OFFICIAL_DIRECTIVE" || notif.category === "OFFICIAL_DIRECTIVE";

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleSelectNotif(notif)}
                    className={`bg-white border-2 rounded-xl p-5 shadow-2xs cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDirective
                        ? notif.unread
                          ? "border-amber-500 bg-amber-50/20"
                          : "border-amber-200 hover:border-amber-300"
                        : notif.unread
                        ? "border-slate-900 bg-slate-50/50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${getCategoryColor(
                          notif.category,
                          notif.type
                        )}`}
                      >
                        <span className="material-symbols-outlined text-[22px]">
                          {getCategoryIcon(notif.category, notif.type)}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                            {notif.title}
                          </h4>
                          {notif.unread && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                          )}

                          {isDirective && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-950 border border-amber-300 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">gavel</span>
                              Official Directive
                            </span>
                          )}

                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              notif.priority === "URGENT" || notif.priority === "HIGH"
                                ? "bg-rose-100 text-rose-800"
                                : notif.priority === "DIRECTIVE"
                                ? "bg-amber-100 text-amber-800"
                                : notif.priority === "CIRCULAR"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {notif.priority || "NORMAL"}
                          </span>
                        </div>

                        {/* Directive Metadata (Issuing officer & recipient) */}
                        {isDirective && (
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                            <span className="font-medium text-slate-800">
                              Issued by: <strong>{notif.senderName || "Assistant Controller"}</strong>
                            </span>
                            <span>•</span>
                            <span className="text-slate-600">
                              To:{" "}
                              <strong className="text-slate-900">
                                {notif.targetLmoName ||
                                  (notif.targetUserId === "ALL"
                                    ? "All District LMOs"
                                    : notif.targetUserId)}
                              </strong>
                            </span>
                          </div>
                        )}

                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl line-clamp-2">
                          {notif.message}
                        </p>

                        <span className="text-[10px] text-slate-400 block pt-0.5">
                          {formatDateTime(notif.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 self-start sm:self-auto flex items-center gap-2">
                      {isDirective ? (
                        <span className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 font-bold text-xs hover:bg-amber-100 transition-colors flex items-center gap-1">
                          View Directive →
                        </span>
                      ) : notif.actionUrl ? (
                        <Link
                          href={notif.actionUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                        >
                          {notif.actionText || "View Action"} →
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">View Details →</span>
                      )}
                    </div>
                  </div>
                );
              })
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
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-200 text-xs">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono-code">
                  {selectedNotif.id}
                </span>
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Title & Timing */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {(selectedNotif.type === "OFFICIAL_DIRECTIVE" ||
                    selectedNotif.category === "OFFICIAL_DIRECTIVE") && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-950 border border-amber-300">
                      Official Directive
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      selectedNotif.priority === "URGENT"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {selectedNotif.priority}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{selectedNotif.title}</h3>
                <p className="text-[11px] text-slate-400">
                  {formatDateTime(selectedNotif.timestamp)}
                </p>
              </div>

              {/* Directive Issuing Authority Card */}
              {(selectedNotif.type === "OFFICIAL_DIRECTIVE" ||
                selectedNotif.category === "OFFICIAL_DIRECTIVE") && (
                <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-amber-800 text-[22px] shrink-0 mt-0.5">
                      gavel
                    </span>
                    <div className="space-y-1">
                      <strong className="font-bold text-amber-950 block text-xs">
                        Issued by: {selectedNotif.senderName || "Assistant Controller"}
                      </strong>
                      <span className="text-[11px] text-amber-900 block">
                        {selectedNotif.senderDesignation ||
                          "Assistant Controller of Legal Metrology"}
                      </span>
                      <span className="text-[10px] text-amber-800 block">
                        {selectedNotif.senderOffice || "District Office of Legal Metrology"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-amber-800">Target Officer:</span>
                    <span className="font-bold text-amber-950">
                      {selectedNotif.targetLmoName ||
                        (selectedNotif.targetUserId === "ALL"
                          ? "All District LMOs"
                          : selectedNotif.targetUserId)}
                    </span>
                  </div>

                  {selectedNotif.statutoryRef && (
                    <div className="pt-1 flex items-center justify-between text-[10px] text-amber-700 font-mono-code">
                      <span>Statutory Ref:</span>
                      <span>{selectedNotif.statutoryRef}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Message Description */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-500 font-bold uppercase text-[10px] block">
                  Directive Instructions
                </span>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {selectedNotif.message}
                </p>
              </div>

              {/* Regulatory Notice */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-1 text-[11px] text-blue-950">
                <span className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  Official Legal Metrology Communication
                </span>
                <p className="leading-relaxed">
                  Directives issued through this platform carry statutory authority under the Legal
                  Metrology Act, 2009. Field officers are bound to execute duties in compliance
                  with these instructions.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-2">
              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="w-full py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs text-center hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Acknowledge &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assistant Controller Notice Creation Modal */}
      {isNoticeModalOpen && (
        <Modal
          isOpen={isNoticeModalOpen}
          onClose={() => {
            if (!isSubmittingNotice) setIsNoticeModalOpen(false);
          }}
          title="Issue Official Notice to Legal Metrology Officers"
          subtitle="Formulate and dispatch binding statutory directives to field officers across the district."
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(false)}
                disabled={isSubmittingNotice}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateNotice}
                disabled={isSubmittingNotice}
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                {isSubmittingNotice ? "Issuing Directive..." : "Issue Official Notice"}
              </button>
            </div>
          }
        >
          <form onSubmit={handleCreateNotice} className="space-y-5 text-xs">
            {noticeSuccessMsg && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg font-bold text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {noticeSuccessMsg}
              </div>
            )}

            {/* Issuing Authority Banner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                AC
              </div>
              <div>
                <span className="font-bold text-slate-900 block">
                  {currentUser?.name || "Assistant Controller"}
                </span>
                <span className="text-[11px] text-slate-500">
                  {currentUser?.designation || "Assistant Controller of Legal Metrology"} •{" "}
                  {currentUser?.districtName || currentUser?.district_id || "District"}
                </span>
              </div>
            </div>

            {/* Target Recipient Selection (Either 1 LMO or Everyone) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Target Recipient(s) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2.5 transition-all ${
                    noticeTarget === "ALL"
                      ? "border-slate-900 bg-slate-50/80 font-bold text-slate-900 ring-2 ring-slate-900/10"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="noticeTarget"
                    checked={noticeTarget === "ALL"}
                    onChange={() => setNoticeTarget("ALL")}
                    className="accent-slate-900"
                  />
                  <div>
                    <span className="block text-xs">All District LMOs (Broadcast)</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Every LMO in {currentUser?.district_id || "district"} receives notice
                    </span>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2.5 transition-all ${
                    noticeTarget !== "ALL"
                      ? "border-slate-900 bg-slate-50/80 font-bold text-slate-900 ring-2 ring-slate-900/10"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="noticeTarget"
                    checked={noticeTarget !== "ALL"}
                    onChange={() => {
                      if (lmos.length > 0) setNoticeTarget(lmos[0].id);
                    }}
                    className="accent-slate-900"
                  />
                  <div>
                    <span className="block text-xs">Specific Officer (1 LMO)</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Targeted directive to individual officer
                    </span>
                  </div>
                </label>
              </div>

              {/* If Specific LMO selected, show dropdown */}
              {noticeTarget !== "ALL" && (
                <div className="pt-2 space-y-1">
                  <label className="font-semibold text-slate-700 text-[11px]">
                    Select Legal Metrology Officer:
                  </label>
                  <select
                    value={noticeTarget}
                    onChange={(e) => setNoticeTarget(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  >
                    {lmos.map((officer) => (
                      <option key={officer.id} value={officer.id}>
                        {officer.name} ({officer.badgeNumber || officer.id}) — {officer.jurisdiction}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Notice Classification / Priority */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">Notice Classification</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: "URGENT", label: "Urgent Directive", color: "text-rose-700" },
                  { key: "DIRECTIVE", label: "Statutory Directive", color: "text-amber-700" },
                  { key: "CIRCULAR", label: "Circular", color: "text-blue-700" },
                  { key: "ROUTINE", label: "Routine Guidance", color: "text-slate-700" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => setNoticePriority(item.key)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                      noticePriority === item.key
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notice Subject / Title */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Subject / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="e.g. Special Verification Drive for Highway Weighbridges (NH-8)"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                required
              />
            </div>

            {/* Directive Instructions / Message */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Directive Instructions <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={noticeMessage}
                onChange={(e) => setNoticeMessage(e.target.value)}
                placeholder="Enter detailed directives, inspection targets, checklist instructions, and mandatory completion deadlines..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white leading-relaxed"
                required
              />
            </div>

            {/* Statutory Reference */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">Statutory Reference</label>
              <input
                type="text"
                value={noticeRef}
                onChange={(e) => setNoticeRef(e.target.value)}
                placeholder="e.g. Legal Metrology Act, 2009 — Schedule VII Compliance"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
