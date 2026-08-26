"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import StepProgress from "@/components/ui/StepProgress";
import Badge from "@/components/ui/Badge";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

function ApplyFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedInstrumentId = searchParams.get("instrumentId") || "";

  const { instruments, submitApplication } = useMetrixStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(
    preselectedInstrumentId || (instruments[0]?.id ?? "")
  );

  const [verificationType, setVerificationType] = useState(
    "Periodic Statutory Re-Verification"
  );
  const [preferredDate, setPreferredDate] = useState("2026-09-05");
  const [preferredTime, setPreferredTime] = useState("Morning (10:00 AM - 01:00 PM)");
  const [inspectionLocation, setInspectionLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: "Manufacturer_Test_Report.pdf", size: "2.4 MB" },
    { name: "Previous_Verification_Certificate.pdf", size: "1.1 MB" },
  ]);

  const [declared, setDeclared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedInst = instruments.find((i) => i.id === selectedInstrumentId);

  useEffect(() => {
    if (selectedInst) {
      setInspectionLocation(selectedInst.location);
    }
  }, [selectedInst]);

  const steps = [
    { id: 1, label: "1. Select Instrument" },
    { id: 2, label: "2. Filing Details" },
    { id: 3, label: "3. Documents" },
    { id: 4, label: "4. Inspection Schedule" },
    { id: 5, label: "5. Review & Submit" },
  ];

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles([
        ...uploadedFiles,
        { name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB` },
      ]);
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!declared) {
      alert("Please check the statutory declaration checkbox before submitting.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      submitApplication({
        instrumentId: selectedInst?.id || "INST-2024-001",
        instrumentName: selectedInst?.name || "Weighing Instrument",
        serialNumber: selectedInst?.serialNumber || "SN-2024-99",
        applicationType: verificationType,
        location: inspectionLocation || selectedInst?.location,
        notes: notes,
        documents: uploadedFiles,
      });
      setIsSubmitting(false);
      router.push("/applications");
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Multi-Step Stepper Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-2xs">
        <StepProgress
          steps={steps}
          currentStep={currentStep}
          onStepClick={(s) => setCurrentStep(s)}
        />
      </div>

      {/* Step Forms */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs">
        {/* STEP 1: Instrument Selection */}
        {currentStep === 1 && (
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Step 1: Choose Regulated Instrument
              </h3>
              <p className="text-slate-500 mt-0.5">
                Select an instrument from your registered inventory to undergo statutory verification.
              </p>
            </div>

            <div className="space-y-3">
              {instruments.map((inst) => {
                const isSelected = inst.id === selectedInstrumentId;
                return (
                  <div
                    key={inst.id}
                    onClick={() => setSelectedInstrumentId(inst.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                      isSelected
                        ? "border-slate-900 bg-slate-50 shadow-2xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">
                          {inst.name}
                        </h4>
                        <Badge status={inst.verificationStatus} />
                      </div>
                      <p className="text-slate-600">
                        {inst.category} • Class: {inst.accuracyClass}
                      </p>
                      <p className="text-slate-500 font-mono-code">
                        S/N: <span className="font-bold text-slate-800">{inst.serialNumber}</span> • Max: {inst.maxCapacity}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        📍 {inst.location}
                      </p>
                    </div>

                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 shrink-0">
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Filing Details */}
        {currentStep === 2 && (
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Step 2: Verification Application Type &amp; Purpose
              </h3>
              <p className="text-slate-500 mt-0.5">
                Selected: <span className="font-bold text-slate-900">{selectedInst?.name}</span> (S/N: {selectedInst?.serialNumber})
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "Periodic Statutory Re-Verification",
                  title: "Periodic Statutory Re-Verification (Annual / Biennial)",
                  desc: "Mandatory statutory re-stamping for instruments currently in active commercial trade.",
                },
                {
                  id: "Initial Verification (New Instrument)",
                  title: "Initial Verification & First Stamping",
                  desc: "First statutory stamping before putting a newly manufactured/imported instrument into commercial use.",
                },
                {
                  id: "Post-Repair / Alteration Verification",
                  title: "Post-Repair / Maintenance Verification",
                  desc: "Required whenever broken seals or major mechanical/electronic calibration alterations occurred.",
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    verificationType === item.id
                      ? "border-slate-900 bg-slate-50 font-semibold shadow-2xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="vType"
                      checked={verificationType === item.id}
                      onChange={() => setVerificationType(item.id)}
                      className="mt-0.5 text-slate-900 focus:ring-slate-900"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="font-semibold text-slate-700">
                Inspection Site / Premises Address
              </label>
              <input
                type="text"
                value={inspectionLocation}
                onChange={(e) => setInspectionLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Document Uploads */}
        {currentStep === 3 && (
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Step 3: Upload Supporting Documents
              </h3>
              <p className="text-slate-500 mt-0.5">
                Attach manufacturer test certificates, purchase invoices, or previous stamping certificates.
              </p>
            </div>

            {/* Upload Zone */}
            <label className="border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50">
              <span className="material-symbols-outlined text-[36px] text-slate-400 mb-2">
                cloud_upload
              </span>
              <p className="font-bold text-slate-800 text-xs">
                Click to browse or drag and drop supporting PDFs/images
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                PDF, PNG, JPEG up to 10 MB per file
              </p>
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
              />
            </label>

            {/* Uploaded File List */}
            <div className="space-y-2">
              <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                Attached Files ({uploadedFiles.length})
              </p>
              {uploadedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">
                      description
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{file.name}</p>
                      <p className="text-[10px] text-slate-400">{file.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setUploadedFiles(
                        uploadedFiles.filter((_, i) => i !== idx)
                      )
                    }
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Preferred Schedule */}
        {currentStep === 4 && (
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Step 4: Inspector Preferred Schedule
              </h3>
              <p className="text-slate-500 mt-0.5">
                Propose convenient inspection dates for the assigned Legal Metrology Officer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Preferred Time Window
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                >
                  <option>Morning (10:00 AM - 01:00 PM)</option>
                  <option>Afternoon (02:00 PM - 05:00 PM)</option>
                  <option>Anytime during Working Hours</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Inspector Notes / Site Access Instructions
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Please enter via Logistics Gate 2. Standard weights loading crane available on site."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {currentStep === 5 && (
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Step 5: Review Filing Summary &amp; Statutory Declaration
              </h3>
              <p className="text-slate-500 mt-0.5">
                Verify all parameters before transmitting filing to the Legal Metrology Department.
              </p>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-500">Target Instrument</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {selectedInst?.name}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Serial Number</span>
                  <p className="font-mono-code font-bold text-slate-900 mt-0.5">
                    {selectedInst?.serialNumber}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-500">Application Type</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {verificationType}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Requested Date</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {formatDate(preferredDate)} ({preferredTime})
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-500">Inspection Address</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {inspectionLocation || selectedInst?.location}
                </p>
              </div>
            </div>

            {/* Fee & Statutory Declaration */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-900">
                  Standard Government Statutory Fee:
                </span>
                <span className="font-bold text-sm text-blue-950 font-mono-code">
                  ₹ 3,500.00
                </span>
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-blue-200">
                <input
                  type="checkbox"
                  checked={declared}
                  onChange={(e) => setDeclared(e.target.checked)}
                  className="mt-0.5 text-slate-900 focus:ring-slate-900 rounded"
                />
                <span className="text-[11px] text-blue-900 leading-relaxed font-medium">
                  I solemnly declare that the technical specifications provided are accurate and the instrument is maintained in operating condition as mandated by the Legal Metrology Act, 2009.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_back
              </span>
              Previous Step
            </button>
          ) : (
            <Link
              href="/applications"
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-2xs"
            >
              Next Step
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting || !declared}
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">
                send
              </span>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ApplyForVerificationPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Apply for Verification"
          subtitle="Submit formal verification or statutory re-verification application under Legal Metrology Rules."
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            { label: "Applications", href: "/applications" },
            { label: "New Filing" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
          <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading form...</div>}>
            <ApplyFormContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
