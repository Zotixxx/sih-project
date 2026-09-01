"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMetrixStore, DEFAULT_USERS } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function RoleSwitcher() {
  const { currentUser, switchUser } = useMetrixStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleIcon = (role) => {
    switch (role) {
      case "ASSISTANT_CONTROLLER":
        return "account_balance";
      case "LMO":
        return "verified_user";
      case "BUSINESS":
        return "storefront";
      case "SYSTEM_ADMIN":
        return "admin_panel_settings";
      default:
        return "person";
    }
  };

  const getRoleBadge = (role, districtId) => {
    switch (role) {
      case "ASSISTANT_CONTROLLER":
        return districtId === "AJM" ? "bg-purple-100 text-purple-900 border-purple-200" : "bg-indigo-100 text-indigo-900 border-indigo-200";
      case "LMO":
        return "bg-emerald-100 text-emerald-900 border-emerald-200";
      case "BUSINESS":
        return "bg-blue-100 text-blue-900 border-blue-200";
      case "SYSTEM_ADMIN":
        return "bg-amber-100 text-amber-900 border-amber-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors shadow-2xs group"
        title="Switch Official Persona & District Jurisdiction"
      >
        <span className="material-symbols-outlined text-[18px] text-slate-700 group-hover:text-blue-900">
          {getRoleIcon(currentUser?.role)}
        </span>
        <div className="hidden sm:flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-900 leading-tight">
              {currentUser?.name || "Official"}
            </span>
            <span
              className={cn(
                "text-[9px] px-1.5 py-0.2 rounded border font-mono-code font-bold",
                getRoleBadge(currentUser?.role, currentUser?.district_id)
              )}
            >
              {currentUser?.district_id || "ALL"}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 truncate max-w-[140px]">
            {currentUser?.subtitle || currentUser?.designation}
          </span>
        </div>
        <span className="material-symbols-outlined text-[16px] text-slate-400">
          arrow_drop_down
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Multi-District Persona Switcher
            </p>
            <span className="text-[9px] font-mono-code bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
              SIH 2026 Model
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50 py-1">
            {DEFAULT_USERS.map((user) => {
              const isSelected = user.id === currentUser?.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    switchUser(user);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors",
                    isSelected && "bg-blue-50/60 font-semibold"
                  )}
                >
                  <span
                    className={cn(
                      "material-symbols-outlined text-[20px] mt-0.5",
                      isSelected ? "text-blue-900" : "text-slate-400"
                    )}
                  >
                    {getRoleIcon(user.role)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {user.name}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded border font-mono-code font-bold uppercase shrink-0",
                          getRoleBadge(user.role, user.district_id)
                        )}
                      >
                        {user.district_id}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {user.subtitle}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono-code">
                      ID: {user.id}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-[16px] text-blue-900 shrink-0 mt-1">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
