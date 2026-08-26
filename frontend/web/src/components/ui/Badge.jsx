import React from "react";
import { getStatusTheme, cn } from "@/lib/utils";

export default function Badge({ status, className, showDot = true, customLabel }) {
  const theme = getStatusTheme(status);
  const label = customLabel || status?.replace(/_/g, " ") || "UNKNOWN";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border",
        theme.bg,
        className
      )}
    >
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full", theme.dot)} />}
      <span className="uppercase">{label}</span>
    </span>
  );
}
