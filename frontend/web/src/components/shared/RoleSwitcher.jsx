"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMetrixStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function RoleSwitcher() {
  const { userRole, setUserRole } = useMetrixStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roles = [
    {
      id: "business",
      name: "Business / Owner",
      subtitle: "Apex Logistics Pvt Ltd",
      icon: "storefront",
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      id: "lmo",
      name: "Legal Metrology Officer",
      subtitle: "Inspector Rajesh Sharma (LMO-104)",
      icon: "verified_user",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "admin",
      name: "Department Admin",
      subtitle: "Directorate Legal Metrology HQ",
      icon: "admin_panel_settings",
      badgeColor: "bg-purple-100 text-purple-800",
    },
  ];

  const currentRole = roles.find((r) => r.id === userRole) || roles[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
        title="Switch Demo Role"
      >
        <span className="material-symbols-outlined text-[18px] text-slate-700">
          {currentRole.icon}
        </span>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[11px] font-bold text-slate-800 leading-tight">
            {currentRole.name}
          </span>
          <span className="text-[9px] text-slate-500 truncate max-w-[120px]">
            {currentRole.subtitle}
          </span>
        </div>
        <span className="material-symbols-outlined text-[16px] text-slate-400">
          arrow_drop_down
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-slate-100">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Demo Persona Switcher
            </p>
          </div>
          {roles.map((role) => {
            const isSelected = role.id === userRole;
            return (
              <button
                key={role.id}
                onClick={() => {
                  setUserRole(role.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors",
                  isSelected && "bg-slate-50 font-semibold"
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined text-[20px] mt-0.5",
                    isSelected ? "text-slate-900" : "text-slate-400"
                  )}
                >
                  {role.icon}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      {role.name}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">{role.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
