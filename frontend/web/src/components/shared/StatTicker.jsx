"use client";

import React from "react";

export default function StatTicker() {
  const tickerItems = [
    { label: "LEGAL METROLOGY ACT 2009", value: "Active Statutory Compliance", icon: "gavel" },
    { label: "VERIFIED INSTRUMENTS", value: "248,910 Total Regulated", icon: "verified" },
    { label: "CRYPTOGRAPHIC SEALING", value: "SHA-256 Tamper Evident", icon: "security" },
    { label: "OFFICERS IN FIELD", value: "1,420 Active LMOs / GATCs", icon: "engineering" },
    { label: "PUBLIC QR LOOKUPS", value: "99.98% Verification Uptime", icon: "qr_code_scanner" },
  ];

  return (
    <div className="w-full bg-[#131b2e] text-white py-2 border-y border-slate-800 text-xs overflow-hidden select-none">
      <div className="ticker-wrap flex items-center">
        <div className="ticker">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div key={idx} className="ticker__item flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">
                {item.icon}
              </span>
              <span className="font-semibold text-slate-300 tracking-wider text-[11px]">
                {item.label}:
              </span>
              <span className="font-mono-code text-white font-medium">
                {item.value}
              </span>
              <span className="text-slate-600 ml-4">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
