"use client";

import React, { useEffect, useState } from "react";
import { useMetrixStore } from "@/lib/store";

export default function GlobalLoadingOverlay() {
  const { isHydrated } = useMetrixStore();
  const [activeRequests, setActiveRequests] = useState(0);

  useEffect(() => {
    const handleStart = () => setActiveRequests((count) => count + 1);
    const handleEnd = () => setActiveRequests((count) => Math.max(0, count - 1));

    window.addEventListener("metrix:request-start", handleStart);
    window.addEventListener("metrix:request-end", handleEnd);

    return () => {
      window.removeEventListener("metrix:request-start", handleStart);
      window.removeEventListener("metrix:request-end", handleEnd);
    };
  }, []);

  if (isHydrated && activeRequests <= 0) return null;

  return (
    <div
      className="fixed inset-x-0 top-4 z-[80] pointer-events-none flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-lg border border-slate-200 bg-white/95 px-4 py-2 shadow-lg flex items-center gap-3 text-xs font-bold text-slate-700">
        <span className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
        Loading...
      </div>
    </div>
  );
}
