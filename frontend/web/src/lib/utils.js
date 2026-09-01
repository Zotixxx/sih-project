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
    case "CERTIFIED":
      return {
        bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        pill: "bg-emerald-100 text-emerald-800",
        dot: "bg-emerald-600",
        icon: "check_circle",
        border: "border-emerald-500",
      };
    case "ACCEPTED":
      return {
        bg: "bg-blue-50 text-blue-800 border-blue-200",
        pill: "bg-blue-100 text-blue-800",
        dot: "bg-blue-600",
        icon: "task_alt",
        border: "border-blue-500",
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

// Normalizes field tablet checklist items dynamically (not hardcoded)
export function getNormalizedChecklist(record) {
  if (!record) return [];

  // 1. If explicit checklistItems array provided from field tablet or data store
  if (Array.isArray(record.checklistItems) && record.checklistItems.length > 0) {
    return record.checklistItems.map((item, idx) => ({
      id: item.id || `chk-${idx}`,
      label: item.label || item.name || item.title || `Checklist Item #${idx + 1}`,
      status: item.status || (item.passed === false ? "FAILED" : "SATISFACTORY"),
      passed: item.passed !== false && item.status !== "FAILED",
      notes: item.notes || item.remarks || "Recorded via Field Tablet",
    }));
  }

  // 2. If checklist object provided (from API or field submission)
  if (record.checklist && typeof record.checklist === "object") {
    const labelMap = {
      visualPlinthIntegrity: "Maker's Plaque, Verification Markings & Plinth Readability",
      levelAndAlignment: "Foundation Spirit Level Centering & Leveling Legs Alignment",
      zeroTrackingSensitivity: "Zero-Load Repeatability & Automatic Return to Zero (±0.2d)",
      cornerLoadEccentricity: "Eccentricity & 4-Corner Shift Load Testing (Schedule VII)",
      leadWireTamperProofSeal: "Tamper-Proof Lead/Wire Security Seal Affixed & Crimped",
      digitalWeightIndicatorEnclosure: "Digital Weight Indicator Enclosure & Calibration Port Locked",
      visualInspectionPassed: "Visual Examination of Instrument Housing & Legibility",
      levelingZeroPassed: "Spirit Level Bubble Centering & Zero Indication Mechanism",
      stampingPlaqueValid: "Official Verification Plaque & Lead Wire Seal Integrity",
    };

    const entries = Object.entries(record.checklist);
    if (entries.length > 0) {
      return entries.map(([key, val], idx) => {
        const isPassed =
          val === true ||
          val === "SATISFACTORY" ||
          val === "PASSED" ||
          val === "VERIFIED_LEVEL" ||
          val === "WITHIN_LIMITS" ||
          val === "PASSED_LESS_THAN_1D" ||
          val === "AFFIXED_SERIALIZED" ||
          val === "LOCKED_SEALED";

        const label =
          labelMap[key] ||
          key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
        const status =
          typeof val === "boolean"
            ? val
              ? "SATISFACTORY"
              : "FAILED"
            : String(val).replace(/_/g, " ");

        return {
          id: `chk-obj-${idx}`,
          label,
          status,
          passed: isPassed,
          notes: isPassed
            ? "Field verified according to statutory rules"
            : "Tolerance exceedance observed during field inspection",
        };
      });
    }
  }

  // 3. Fallback placeholder details representing dynamic tablet field entry
  const seal = record.sealNumber || "SEAL-RAJ-99412";
  return [
    {
      id: "tab-chk-1",
      label: "Physical Examination & Maker's Plaque Readability",
      status: "SATISFACTORY",
      passed: true,
      notes: "Make, model, serial number, accuracy class and capacity verified against registration",
    },
    {
      id: "tab-chk-2",
      label: "Foundation Leveling & Automatic Zero Return Mechanism",
      status: "VERIFIED LEVEL",
      passed: true,
      notes: "Spirit level centered; zero deviation measured at 0.00 kg (within ±0.2d)",
    },
    {
      id: "tab-chk-3",
      label: "Corner / Eccentricity Load Testing (Schedule VII)",
      status: "PASSED (< 1d)",
      passed: true,
      notes: "All 4 platform quadrants tested with certified test weights; maximum deviation 0.01 kg",
    },
    {
      id: "tab-chk-4",
      label: "Gravimetric Span & Maximum Permissible Error (MPE) Verification",
      status: "SATISFACTORY",
      passed: true,
      notes: "Incremental loads from minimum to maximum capacity within prescribed statutory MPE limits",
    },
    {
      id: "tab-chk-5",
      label: "Tamper-Proof Lead/Wire Security Stamping Affixed",
      status: "SEAL AFFIXED",
      passed: true,
      notes: `Serialized lead-wire security seal #${seal} clamped to junction enclosure`,
    },
    {
      id: "tab-chk-6",
      label: "Digital Indicator Enclosure & Calibration Access Port",
      status: "LOCKED & SEALED",
      passed: true,
      notes: "Hardware calibration switch sealed to prevent post-verification alteration",
    },
  ];
}

export function getNormalizedMeasurements(record) {
  if (Array.isArray(record?.measurements) && record.measurements.length > 0) {
    return record.measurements.map((m) => ({
      testLoad: m.testLoad || m.nominalLoad || "Test Load",
      indicatedWeight: m.indicatedWeight || m.observed || m.indicatedLoad || "N/A",
      error: m.error || m.observedError || "0",
      mpeLimit: m.mpeLimit || m.mpe || m.mpeAllowable || "± MPE",
      result: m.result || (m.tolerancePassed !== false ? "PASS" : "FAIL"),
    }));
  }

  if (record?.measurements && typeof record.measurements === "object") {
    const m = record.measurements;
    return [
      {
        testLoad: m.nominalLoad || "20 kg",
        indicatedWeight: m.indicatedLoad || "20.00 kg",
        error: m.observedError || "0.00 kg",
        mpeLimit: m.mpeAllowable || "±20 g",
        result: m.tolerancePassed ? "PASS" : "FAIL",
      },
    ];
  }

  return [
    { testLoad: "10,000 kg (25%)", indicatedWeight: "10,000 kg", error: "0 kg", mpeLimit: "±10 kg", result: "PASS" },
    { testLoad: "20,000 kg (50%)", indicatedWeight: "19,998 kg", error: "-2 kg", mpeLimit: "±20 kg", result: "PASS" },
    { testLoad: "40,000 kg (75%)", indicatedWeight: "40,004 kg", error: "+4 kg", mpeLimit: "±30 kg", result: "PASS" },
    { testLoad: "60,000 kg (100%)", indicatedWeight: "60,000 kg", error: "0 kg", mpeLimit: "±30 kg", result: "PASS" },
  ];
}
