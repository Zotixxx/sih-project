"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Badge from "@/components/ui/Badge";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function LmoFieldInspectionPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const inspId = decodeURIComponent(unwrappedParams.id);

  const { inspections, completeInspectionAndIssueCertificate } = useMetrixStore();

  const inspection =
    inspections.find((i) => i.id === inspId) || inspections[0];

  const [checklist, setChecklist] = useState(
    inspection?.checklistItems || [
      { id: "c1", label: "Physical Examination & Plaque Readability", passed: true },
      { id: "c2", label: "Zero-Load Repeatability & Return to Zero", passed: true },
      { id: "c3", label: "Corner / Eccentricity Load Testing", passed: true },
      { id: "c4", label: "Maximum Permissible Error (MPE) Verification", passed: true },
      { id: "c5", label: "Tamper-Proof Lead/Wire Security Stamping", passed: true },
    ]
  );

  const [measurements, setMeasurements] = useState(
    inspection?.measurements || [
      { testLoad: "10,000 kg", observed: "10,002 kg", mpe: "± 10 kg", result: "PASS" },
      { testLoad: "30,000 kg", observed: "29,995 kg", mpe: "± 15 kg", result: "PASS" },
      { testLoad: "60,000 kg", observed: "60,010 kg", mpe: "± 20 kg", result: "PASS" },
    ]
  );

  const [remarks, setRemarks] = useState(
    inspection?.remarks ||
      "Instrument verified in accordance with Legal Metrology General Rules 2011 Schedule VII. Errors within permissible tolerances. Lead wire security seal affixed."
  );

  const [simulatedPhotos, setSimulatedPhotos] = useState([
    { name: "Rating_Plate_Serial_Photo.jpg", time: "Just now" },
    { name: "Lead_Wire_Security_Seal.jpg", time: "Just now" },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleChecklist = (id) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, passed: !item.passed } : item
      )
    );
  };

  const handleCompletePass = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      completeInspectionAndIssueCertificate(
        inspection.id,
        "PASS",
        remarks,
        measurements
      );
      setIsSubmitting(false);
      router.push("/certificates");
    }, 600);
  };

  const handleMarkFail = () => {
    if (confirm("Mark this instrument verification as FAILED?")) {
      completeInspectionAndIssueCertificate(
        inspection.id,
        "FAIL",
        remarks,
        measurements
      );
      router.push("/inspections");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="LMO Field Verification Tablet Form"
          subtitle="On-site statutory measurement entry, GPS geotagging, and digital stamping."
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            { label: "Inspections", href: "/inspections" },
            { label: `Field Form: ${inspection?.id || "Active"}` },
          ]}
        />

        <main className="p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Target Instrument Header Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                  <span className="material-symbols-outlined text-[24px]">
                    tablet_mac
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-slate-400">
                      {inspection?.id}
                    </span>
                    <Badge status={inspection?.status} />
                  </div>
                  <h2 className="text-lg font-bold tracking-tight mt-0.5">
                    {inspection?.instrumentName}
                  </h2>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-300">
                <p>Officer: <strong className="text-white">{inspection?.officer}</strong></p>
                <p className="text-[11px] text-slate-400">{inspection?.officerRole}</p>
              </div>
            </div>

            {/* Geotag & Location info */}
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">
                  Field Premises Location
                </span>
                <span className="font-semibold text-white">
                  {inspection?.location}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-emerald-400">
                    gps_fixed
                  </span>
                  GPS Geotag Confirmation
                </span>
                <span className="font-mono-code font-bold text-emerald-300">
                  {inspection?.gpsCoords} (Verified on-site)
                </span>
              </div>
            </div>
          </div>

          {/* Inspection Section 1: Checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Statutory Inspection Checklist
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Verify each mandatory physical and calibration requirement. Tap to toggle status.
              </p>
            </div>

            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    item.passed
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                        item.passed ? "bg-emerald-600" : "bg-slate-300"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        check
                      </span>
                    </span>
                    <span className="font-semibold text-slate-900">
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={`font-bold text-[10px] px-2 py-0.5 rounded uppercase ${
                      item.passed
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.passed ? "VERIFIED (PASS)" : "FAIL / INCOMPLETE"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Inspection Section 2: Standard Load Measurements */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Standard Weight Test Measurements
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Observed test loads compared against official Maximum Permissible Errors (MPE).
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="py-2.5 px-3.5">Standard Test Load</th>
                    <th className="py-2.5 px-3.5">Observed Reading (kg / g)</th>
                    <th className="py-2.5 px-3.5">Max Error Tolerance</th>
                    <th className="py-2.5 px-3.5 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {measurements.map((m, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="py-3 px-3.5 font-bold text-slate-900">
                        {m.testLoad}
                      </td>
                      <td className="py-3 px-3.5 font-mono-code font-bold text-slate-800">
                        {m.observed}
                      </td>
                      <td className="py-3 px-3.5 font-mono-code text-slate-600">
                        {m.mpe}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          ✓ {m.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inspection Section 3: Photo Evidence & Tamper Seals */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Photographic Evidence &amp; Physical Lead Seal Stamping
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                High-resolution geotagged photographs of the stamped seal and serial rating plate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {simulatedPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-500 text-[24px]">
                      photo_camera
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{photo.name}</p>
                      <p className="text-[10px] text-slate-400">Captured {photo.time}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    ✓ Geotagged
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Inspection Section 4: Officer Remarks */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              4. Officer Remarks &amp; Statutory Certification Statement
            </h3>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          {/* Action Submission Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleMarkFail}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors"
            >
              Reject / Fail Verification
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCompletePass}
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-emerald-700 text-white font-extrabold text-xs sm:text-sm hover:bg-emerald-800 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">
                verified
              </span>
              {isSubmitting
                ? "Generating Certificate..."
                : "Approve Verification & Issue Digital Certificate"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
