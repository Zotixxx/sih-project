import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function getStatusTheme(status) {
  switch (status?.toUpperCase()) {
    case "VALID":
    case "VERIFIED":
    case "APPROVED":
    case "PASSED":
    case "COMPLETED":
    case "ACTIVE":
      return {
        bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        pill: "bg-emerald-100 text-emerald-800",
        dot: "bg-emerald-600",
        icon: "check_circle",
        border: "border-emerald-500",
      };
    case "EXPIRING_SOON":
    case "EXPIRING":
    case "SCHEDULED":
    case "UNDER_REVIEW":
    case "UNDER_VERIFICATION":
    case "PENDING":
    case "IN_PROGRESS":
      return {
        bg: "bg-amber-50 text-amber-800 border-amber-200",
        pill: "bg-amber-100 text-amber-800",
        dot: "bg-amber-500",
        icon: "schedule",
        border: "border-amber-500",
      };
    case "SUBMITTED":
    case "DRAFT":
      return {
        bg: "bg-slate-100 text-slate-800 border-slate-200",
        pill: "bg-slate-100 text-slate-700",
        dot: "bg-slate-400",
        icon: "description",
        border: "border-slate-400",
      };
    case "EXPIRED":
    case "REJECTED":
    case "FAILED":
    case "REVOKED":
    case "CANCELLED":
    default:
      return {
        bg: "bg-rose-50 text-rose-800 border-rose-200",
        pill: "bg-rose-100 text-rose-800",
        dot: "bg-rose-600",
        icon: "cancel",
        border: "border-rose-500",
      };
  }
}

// Generate simple deterministic SHA-like hash for demonstration
export function generateHash(input) {
  let hash = 0;
  const str = input + "METRIX-GOV-REGULATORY-SALT";
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `0x${hex}f98a24c7e112d8a49c6b32`;
}
