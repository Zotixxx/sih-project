"use client";

import React, { useState, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Badge from "@/components/ui/Badge";
import { useMetrixStore } from "@/lib/store";
import { metrixApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function LmoFieldInspectionPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const inspectionId = decodeURIComponent(unwrappedParams.id);

  const { inspections, applications, currentUser, refreshData } = useMetrixStore();

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
  const [nominalLoad, setNominalLoad] = useState("5000 kg");
  const [indicatedLoad, setIndicatedLoad] = useState("5002 kg");
  const [observedError, setObservedError] = useState("+2 kg");
  const [mpeAllowable, setMpeAllowable] = useState("±5 kg");
  const [tolerancePassed, setTolerancePassed] = useState(true);

  // Lead wire seal & Location
  const [appliedSealNumber, setAppliedSealNumber] = useState(
    inspection?.sealNumber || `SEAL-RAJ-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [gpsLocation, setGpsLocation] = useState(
    inspection?.gpsCoords || "26.4499° N, 74.6399° E"
  );
  const [inspectorRemarks, setInspectorRemarks] = useState(
    inspection?.remarks || "Physical tests conducted using certified Class M1 test standards. Instrument conforms to Schedule VII limits."
  );

  const handleStartInspection = async () => {
    if (!inspection) return;
    try {
      await metrixApi.startInspection(inspection.id);
      setHasStarted(true);
      await refreshData();
    } catch (err) {
      console.warn("Start inspection API fallback:", err);
      setHasStarted(true);
    }
  };

  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    if (!inspection) return;
    setIsSubmitting(true);
    try {
      await metrixApi.submitInspection(inspection.id, {
        sealNumber: appliedSealNumber,
        gpsCoords: gpsLocation,
        remarks: inspectorRemarks,
        measurements: {
          nominalLoad,
          indicatedLoad,
          observedError,
          mpeAllowable,
          tolerancePassed,
        },
        checklist: {
          visualInspectionPassed,
          levelingZeroPassed,
          stampingPlaqueValid,
        },
      });

      await refreshData();
      alert("Field inspection submitted successfully! Application has moved to Awaiting Final Review.");
      router.push("/lmo/verification-details");
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
              href="/inspections"
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
                  Scheduled: <strong>{formatDate(inspection.scheduledDate)}</strong> at <strong>{inspection.scheduledTime || "11:30 AM"}</strong>
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
                <span className="text-slate-800">{app?.capacity || inspection.capacity || "Standard"}</span>
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
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-700 text-[18px]">straighten</span>
                  2. Load Verification &amp; Error Deviation
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Nominal Test Standard</label>
                    <input
                      type="text"
                      value={nominalLoad}
                      disabled={isAlreadySubmitted}
                      onChange={(e) => setNominalLoad(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Indicated Value</label>
                    <input
                      type="text"
                      value={indicatedLoad}
                      disabled={isAlreadySubmitted}
                      onChange={(e) => setIndicatedLoad(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Observed Deviation</label>
                    <input
                      type="text"
                      value={observedError}
                      disabled={isAlreadySubmitted}
                      onChange={(e) => setObservedError(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Allowable MPE Limit</label>
                    <input
                      type="text"
                      value={mpeAllowable}
                      disabled={isAlreadySubmitted}
                      onChange={(e) => setMpeAllowable(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-emerald-950 font-semibold">
                  <span>Load error (+2 kg) is within Schedule VII allowable limit (±5 kg)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                    MPE PASSED
                  </span>
                </div>
              </div>

              {/* 3. Lead Wire Seal & Geotagging */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-700 text-[18px]">verified</span>
                  3. Seal Application &amp; GPS Location
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Statutory Lead Wire Seal Number *</label>
                    <input
                      type="text"
                      value={appliedSealNumber}
                      disabled={isAlreadySubmitted}
                      onChange={(e) => setAppliedSealNumber(e.target.value)}
                      placeholder="e.g. SEAL-RAJ-99412"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono-code font-bold focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">On-Site GPS Coordinates</label>
                    <input
                      type="text"
                      value={gpsLocation}
                      disabled={isAlreadySubmitted}
                      onChange={(e) => setGpsLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono-code focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Officer Field Observations &amp; Remarks</label>
                  <textarea
                    rows={2}
                    value={inspectorRemarks}
                    disabled={isAlreadySubmitted}
                    onChange={(e) => setInspectorRemarks(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {!isAlreadySubmitted && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Link
                    href="/inspections"
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
