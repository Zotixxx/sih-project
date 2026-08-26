import React from "react";
import { cn } from "@/lib/utils";

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive,
  highlightColor = "primary",
  onClick,
}) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white border border-slate-200 rounded-lg p-5 transition-all duration-200 shadow-sm relative overflow-hidden",
        isClickable && "cursor-pointer hover:border-slate-400 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center font-medium px-1.5 py-0.5 rounded",
                trendPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              )}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
