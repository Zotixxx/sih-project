"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Badge from "@/components/ui/Badge";
import { useMetrixStore } from "@/lib/store";
import { metrixApi } from "@/lib/api";
import { portalPath } from "@/lib/routes";
import { formatDate } from "@/lib/utils";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error || new Error("Could not read evidence file."));
    reader.readAsDataURL(file);
  });

const UNIT_FACTORS = {
  mg: 0.001,
  milligram: 0.001,
  milligrams: 0.001,
  g: 1,
  gm: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kgs: 1000,
  kilogram: 1000,
  kilograms: 1000,
  t: 1000000,
  ton: 1000000,
  tons: 1000000,
  tonne: 1000000,
  tonnes: 1000000,
};

const createMeasurementRow = (id = "measurement-1", values = {}) => ({
  id,
  testLoad: values.testLoad || "",
  indicatedWeight: values.indicatedWeight || values.observed || "",
  mpeLimit: values.mpeLimit || values.mpe || "",
});

const nextMeasurementId = () =>
  globalThis.crypto?.randomUUID?.() || `measurement-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const parseQuantity = (value) => {
  const match = String(value || "")
    .trim()
    .replace(/,/g, "")
    .match(/([-+]?\d*\.?\d+)\s*([a-zA-Z]*)/);
  if (!match) return null;

  const number = Number.parseFloat(match[1]);
  if (!Number.isFinite(number)) return null;

  const unit = match[2]?.toLowerCase() || "";
  return {
    value: number,
    unit,
    factor: unit ? UNIT_FACTORS[unit] : null,
  };
};

const toBaseValue = (quantity, fallbackFactor = 1) =>
  quantity ? quantity.value * (quantity.factor || fallbackFactor || 1) : null;

const formatMeasurementNumber = (value) => {
  const rounded = Math.round(value * 1000) / 1000;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
};

const evaluateMeasurementRow = (row) => {
  const hasAnyValue = row.testLoad || row.indicatedWeight || row.mpeLimit;
  if (!hasAnyValue) return { state: "empty", label: "Enter values" };

  const testQuantity = parseQuantity(row.testLoad);
  const indicatedQuantity = parseQuantity(row.indicatedWeight);
  const mpeQuantity = parseQuantity(row.mpeLimit);
  if (!testQuantity || !indicatedQuantity || !mpeQuantity) {
    return { state: "invalid", label: "Incomplete" };
  }

  const fallbackFactor = testQuantity.factor || indicatedQuantity.factor || mpeQuantity.factor || 1;
  const testBase = toBaseValue(testQuantity, fallbackFactor);
  const indicatedBase = toBaseValue(indicatedQuantity, fallbackFactor);
  const mpeBase = Math.abs(toBaseValue(mpeQuantity, fallbackFactor));
  const errorBase = indicatedBase - testBase;
  const displayFactor = testQuantity.factor || indicatedQuantity.factor || fallbackFactor;
  const displayUnit = testQuantity.unit || indicatedQuantity.unit || "";
  const error = `${formatMeasurementNumber(errorBase / displayFactor)}${displayUnit ? ` ${displayUnit}` : ""}`;
  const result = Math.abs(errorBase) <= mpeBase ? "PASS" : "FAIL";

  return {
    state: result,
    result,
    error,
    label: result === "PASS" ? "Within MPE" : "Exceeds MPE",
  };
};

export default function LmoFieldInspectionPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const inspectionId = decodeURIComponent(unwrappedParams.id);

  const { inspections, applications, currentUser, refreshData } = useMetrixStore();
  const href = (path) => portalPath(currentUser, path);

  // Find inspection
  const inspection = useMemo(() => {
    return (inspections || []).find(
      (i) =>
        i.id.toLowerCase() === inspectionId.toLowerCase() ||
        i.applicationId?.toLowerCase() === inspectionId.toLowerCase()
    );
  }, [inspections, inspectionId]);

  // Associated application
  const app = useMemo(() => {
    if (!inspection) return null;
    return (applications || []).find(
      (a) => a.id === inspection.applicationId || a.instrumentId === inspection.instrumentId
    );
  }, [applications, inspection]);

  // Inspection form states
  const [hasStarted, setHasStarted] = useState(
    inspection?.status === "IN_PROGRESS" || inspection?.status === "UNDER_VERIFICATION"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field measurements & checklist
  const [visualInspectionPassed, setVisualInspectionPassed] = useState(true);
  const [levelingZeroPassed, setLevelingZeroPassed] = useState(true);
  const [stampingPlaqueValid, setStampingPlaqueValid] = useState(true);

  // Measurements
  const [measurementRows, setMeasurementRows] = useState(() => {
    if (inspection?.measurements?.length) {
      return inspection.measurements.map((measurement, index) =>
        createMeasurementRow(`measurement-${index + 1}`, measurement)
      );
    }
    return [createMeasurementRow()];
  });
  const [evidenceDocs, setEvidenceDocs] = useState([]);

  const measurementRowsWithResults = useMemo(
    () =>
      measurementRows.map((row) => ({
        ...row,
        evaluation: evaluateMeasurementRow(row),
      })),
    [measurementRows]
  );

  const updateMeasurementRow = (id, patch) => {
    setMeasurementRows((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const addMeasurementRow = () => {
    setMeasurementRows((rows) => [...rows, createMeasurementRow(nextMeasurementId())]);
  };

  const removeMeasurementRow = (id) => {
    setMeasurementRows((rows) =>
      rows.length > 1 ? rows.filter((row) => row.id !== id) : rows
    );
  };

  const handleStartInspection = async () => {
    if (!inspection) return;
    try {
      await metrixApi.startInspection(inspection.id);
      setHasStarted(true);
      await refreshData();
    } catch (err) {
      alert("Error starting inspection: " + err.message);
    }
  };

  const handleEvidenceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await metrixApi.uploadDocument({
        bucket: "inspection-evidence",
        fileName: file.name,
        mimeType: file.type || "image/jpeg",
        base64: await fileToBase64(file),
      });
      setEvidenceDocs((prev) => [
        ...prev,
        {
          documentId: uploaded.data.documentId,
          fileName: uploaded.data.fileName,
        },
      ]);
    } catch (error) {
      alert("Error uploading evidence: " + error.message);
    }
  };

  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    if (!inspection) return;

    const preparedMeasurements = measurementRows.map((row) => {
      const evaluation = evaluateMeasurementRow(row);
      return {
        row,
        evaluation,
      };
    });

    if (preparedMeasurements.some(({ evaluation }) => !evaluation.result)) {
      alert("Enter numeric test load, indicated value, and MPE for every measurement.");
      return;
    }

    setIsSubmitting(true);
    try {
      await metrixApi.submitInspection(inspection.id, {
        evidenceDocumentIds: evidenceDocs.map((doc) => doc.documentId),
        measurements: preparedMeasurements.map(({ row, evaluation }) => ({
          testLoad: row.testLoad.trim(),
          indicatedWeight: row.indicatedWeight.trim(),
          error: evaluation.error,
          mpeLimit: row.mpeLimit.trim(),
          result: evaluation.result,
        })),
        checklist: {
          visualInspectionPassed,
          levelingZeroPassed,
          stampingPlaqueValid,
        },
      });

      await refreshData();
      alert("Field inspection submitted successfully! Application has moved to Awaiting Final Review.");
      router.push(href("/verification-details"));
    } catch (err) {
      alert("Error submitting inspection: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!inspection) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex">
        <SideNavBar />
        <div className="flex-1 ml-[260px] flex flex-col min-w-0">
          <TopNavBar
            title="Inspection Not Found"
            subtitle="The requested inspection assignment could not be found."
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Inspections", href: "/inspections" },
              { label: "Not Found" },
            ]}
          />
          <main className="p-12 max-w-lg mx-auto text-center space-y-4">
            <span className="material-symbols-outlined text-[48px] text-slate-400">
              search_off
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Inspection ID &quot;{inspectionId}&quot; Not Found
            </h3>
            <Link
              href={href("/inspections")}
              className="inline-block px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs"
            >
              ← Back to Inspections
            </Link>
          </main>
        </div>
      </div>
    );
  }

  const isAlreadySubmitted =
    inspection.status === "SUBMITTED" ||
    inspection.status === "SUBMITTED_FOR_APPROVAL" ||
    inspection.status === "APPROVED";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title={`Field Inspection: ${inspection.id}`}
          subtitle={`${app?.businessName || inspection.ownerName} • ${app?.instrumentName || inspection.instrumentName}`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Inspections", href: "/inspections" },
            { label: inspection.id },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-code font-extrabold text-slate-900 text-base">
                    {inspection.id}
                  </span>
                  <Badge status={inspection.status} className="text-xs" />
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  {app?.businessName || inspection.ownerName} — {app?.instrumentName || inspection.instrumentName}
                </h2>
                <p className="text-xs text-slate-500">
                  Scheduled: <strong>{formatDate(inspection.scheduledDate)}</strong>
                </p>
              </div>

              {!hasStarted && !isAlreadySubmitted && (
                <button
                  onClick={handleStartInspection}
                  className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[18px]">play_circle</span>
                  Start Field Inspection
                </button>
              )}
            </div>

            {/* Target Instrument Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Instrument Type</span>
                <span className="font-bold text-slate-900">{app?.instrumentName || inspection.instrumentName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Serial Number</span>
                <span className="font-mono-code font-bold text-slate-900">{app?.serialNumber || inspection.serialNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Capacity / Range</span>
                <span className="text-slate-800">{app?.capacity || inspection.capacity || "Not recorded"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Establishment Location</span>
                <span className="text-slate-800 truncate block">{app?.address || inspection.location}</span>
              </div>
            </div>
          </div>

          {/* Already Submitted Read-Only Banner */}
          {isAlreadySubmitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-950 text-xs">
              <span className="material-symbols-outlined text-[24px] text-emerald-700 shrink-0">
                task_alt
              </span>
              <div>
                <p className="font-bold">Field Inspection Submitted &amp; Locked</p>
                <p className="text-slate-600 mt-0.5">
                  This inspection has been completed and submitted for Assistant Controller final sanction. You can view it in <strong>Verification Details</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Inspection Entry Form */}
          {(hasStarted || isAlreadySubmitted) && (
            <form onSubmit={handleSubmitInspection} className="space-y-6 text-xs">
              {/* 1. Physical Checklist */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-700 text-[18px]">checklist</span>
                  1. Physical Verification Checklist
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visualInspectionPassed}
                      disabled={isAlreadySubmitted}
                      onChange={(e) => setVisualInspectionPassed(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Visual Plaque &amp; Manufacturer Markings</span>
                      <span className="text-[11px] text-slate-500">Verified manufacturer model approval plaque, serial number plate, and legibility.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={levelingZeroPassed}
                      disabled={isAlreadySubmitted}
                      onChange={(e) => setLevelingZeroPassed(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Zero-Setting &amp; Level Bubble Indicator</span>
                      <span className="text-[11px] text-slate-500">Verified spirit level bubble centering and automatic zero-tracking return.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stampingPlaqueValid}
                      disabled={isAlreadySubmitted}
                      onChange={(e) => setStampingPlaqueValid(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">Stamping Plaque &amp; Wire Holes Ready</span>
                      <span className="text-[11px] text-slate-500">Physical holes accessible for lead wire seal insertion without tampering.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 2. Load Testing Measurements */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-700 text-[18px]">straighten</span>
                    2. Load Verification Measurements
                  </h3>
                  {!isAlreadySubmitted && (
                    <button
                      type="button"
                      onClick={addMeasurementRow}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 inline-flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Add Value
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {measurementRowsWithResults.map((row, index) => {
                    const resultClass =
                      row.evaluation.state === "PASS"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : row.evaluation.state === "FAIL"
                        ? "bg-rose-50 border-rose-200 text-rose-900"
                        : row.evaluation.state === "invalid"
                        ? "bg-amber-50 border-amber-200 text-amber-900"
                        : "bg-slate-50 border-slate-200 text-slate-700";

                    return (
                      <div key={row.id} className="border border-slate-200 rounded-lg p-3 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono-code font-bold text-slate-800 text-[11px]">
                            Value {index + 1}
                          </span>
                          {!isAlreadySubmitted && measurementRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMeasurementRow(row.id)}
                              className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-rose-700 hover:bg-rose-50"
                              aria-label={`Remove value ${index + 1}`}
                            >
                              <span className="material-symbols-outlined text-[17px]">delete</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">Test Load</label>
                            <input
                              type="text"
                              value={row.testLoad}
                              disabled={isAlreadySubmitted}
                              onChange={(e) => updateMeasurementRow(row.id, { testLoad: e.target.value })}
                              placeholder="e.g. 500 kg"
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">Indicated Value</label>
                            <input
                              type="text"
                              value={row.indicatedWeight}
                              disabled={isAlreadySubmitted}
                              onChange={(e) => updateMeasurementRow(row.id, { indicatedWeight: e.target.value })}
                              placeholder="e.g. 502 kg"
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">Allowable MPE</label>
                            <input
                              type="text"
                              value={row.mpeLimit}
                              disabled={isAlreadySubmitted}
                              onChange={(e) => updateMeasurementRow(row.id, { mpeLimit: e.target.value })}
                              placeholder="e.g. 500 g"
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">Computed Result</label>
                            <div className={`min-h-[34px] rounded-lg border px-2 py-1.5 flex items-center justify-between gap-2 ${resultClass}`}>
                              <span className="font-bold text-[10px] uppercase">
                                {row.evaluation.result || row.evaluation.label}
                              </span>
                              {row.evaluation.error && (
                                <span className="font-mono-code text-[10px]">
                                  Error: {row.evaluation.error}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-700 text-[18px]">photo_camera</span>
                  3. Evidence Photos / Documents
                </h3>
                {!isAlreadySubmitted && (
                  <label className="cursor-pointer px-3 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    Upload Evidence
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={handleEvidenceUpload}
                    />
                  </label>
                )}
                {evidenceDocs.length === 0 ? (
                  <p className="text-xs text-slate-500">No evidence files attached.</p>
                ) : (
                  <div className="space-y-2">
                    {evidenceDocs.map((doc) => (
                      <div key={doc.documentId} className="p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
                        {doc.fileName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!isAlreadySubmitted && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Link
                    href={href("/inspections")}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    {isSubmitting ? "Submitting..." : "Submit Inspection to Assistant Controller"}
                  </button>
                </div>
              )}
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
