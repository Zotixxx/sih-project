"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import StepProgress from "@/components/ui/StepProgress";
import { metrixApi } from "@/lib/api";
import { portalPath } from "@/lib/routes";
import { useMetrixStore } from "@/lib/store";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error || new Error("Could not read file."));
    reader.readAsDataURL(file);
  });

function ApplyFormContent() {
  const searchParams = useSearchParams();
  const preselectedInstrumentId = searchParams.get("instrumentId") || "";
  const resumeDraft = searchParams.get("resumeDraft") === "true";

  const {
    instruments,
    currentUser,
    businessProfile,
    currentDraft,
    saveDraft,
    submitApplication,
    updateInstrument,
  } = useMetrixStore();
  const href = (path) => portalPath(currentUser, path);

  // Filter business's instruments
  const businessInstruments = useMemo(() => {
    return instruments || [];
  }, [instruments]);

  // Profile completeness check (Section 5, 72)
  const isProfileComplete = useMemo(() => {
    if (!businessProfile) return true; // optimistic during initial load
    return businessProfile.isComplete !== false;
  }, [businessProfile]);

  // Multi-step form state (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(
    preselectedInstrumentId || businessInstruments[0]?.id || ""
  );

  const [verificationType, setVerificationType] = useState("Re-verification");
  const [prevCertificateNo, setPrevCertificateNo] = useState("");
  const [applicationId, setApplicationId] = useState("");

  const [locationAddress, setLocationAddress] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationDistrict, setLocationDistrict] = useState("");
  const [locationDistrictId, setLocationDistrictId] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationPincode, setLocationPincode] = useState("");
  const [locationNotes, setLocationNotes] = useState("");

  const [noteForLmo, setNoteForLmo] = useState("");
  const [additionalDocs, setAdditionalDocs] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(true);

  // Submission & modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const states = useMemo(
    () => Array.from(new Set(districts.map((district) => district.state).filter(Boolean))).sort(),
    [districts]
  );
  const districtOptions = useMemo(
    () =>
      districts
        .filter((district) => !locationState || district.state === locationState)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [districts, locationState]
  );
  const selectedLocationDistrict = useMemo(
    () => districts.find((entry) => entry.id === locationDistrictId) || null,
    [districts, locationDistrictId]
  );
  const resolvedLocationDistrict = selectedLocationDistrict?.name || locationDistrict;
  const resolvedLocationState = selectedLocationDistrict?.state || locationState;

  useEffect(() => {
    let mounted = true;

    const loadDistricts = async () => {
      setDistrictsLoading(true);
      try {
        const response = await metrixApi.getPublicDistricts();
        if (!mounted) return;
        setDistricts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        if (mounted) setErrorMessage(error.message || "Could not load state and district list.");
      } finally {
        if (mounted) setDistrictsLoading(false);
      }
    };

    loadDistricts();
    return () => {
      mounted = false;
    };
  }, []);

  // Resume Draft if requested
  useEffect(() => {
    if (resumeDraft && currentDraft) {
      const restoreDraft = setTimeout(() => {
        if (currentDraft.step) setCurrentStep(currentDraft.step);
        if (currentDraft.instrumentId) setSelectedInstrumentId(currentDraft.instrumentId);
        if (currentDraft.verificationType) setVerificationType(currentDraft.verificationType);
        if (currentDraft.prevCertificateNo) setPrevCertificateNo(currentDraft.prevCertificateNo);
        if (currentDraft.applicationId) setApplicationId(currentDraft.applicationId);
        if (currentDraft.locationAddress) setLocationAddress(currentDraft.locationAddress);
        if (currentDraft.locationCity) setLocationCity(currentDraft.locationCity);
        if (currentDraft.locationDistrict) setLocationDistrict(currentDraft.locationDistrict);
        if (currentDraft.locationDistrictId) setLocationDistrictId(currentDraft.locationDistrictId);
        if (currentDraft.locationState) setLocationState(currentDraft.locationState);
        if (currentDraft.locationPincode) setLocationPincode(currentDraft.locationPincode);
        if (currentDraft.locationNotes) setLocationNotes(currentDraft.locationNotes);
        if (currentDraft.noteForLmo) setNoteForLmo(currentDraft.noteForLmo);
        if (currentDraft.additionalDocs) setAdditionalDocs(currentDraft.additionalDocs);
      }, 0);
      return () => clearTimeout(restoreDraft);
    }
  }, [resumeDraft, currentDraft]);

  // Selected Instrument
  const selectedInstrument = useMemo(() => {
    return (
      businessInstruments.find((i) => i.id === selectedInstrumentId) ||
      instruments.find((i) => i.id === selectedInstrumentId) ||
      businessInstruments[0] ||
      null
    );
  }, [businessInstruments, instruments, selectedInstrumentId]);

  // Auto-fill verification location from selected instrument if empty
  useEffect(() => {
    if (selectedInstrument && !locationAddress) {
      const fillLocation = setTimeout(() => {
        setLocationAddress(selectedInstrument.location || selectedInstrument.installationLocation || "");
        if (selectedInstrument.city) setLocationCity(selectedInstrument.city);
        if (selectedInstrument.district_id) setLocationDistrictId(selectedInstrument.district_id);
        if (selectedInstrument.district) setLocationDistrict(selectedInstrument.district);
        if (selectedInstrument.state) setLocationState(selectedInstrument.state);
        if (selectedInstrument.pincode) setLocationPincode(selectedInstrument.pincode);
      }, 0);
      return () => clearTimeout(fillLocation);
    }
  }, [selectedInstrument, locationAddress]);

  // Steps definition (Section 13)
  const steps = [
    { id: 1, label: "1. Instrument" },
    { id: 2, label: "2. Verification Type" },
    { id: 3, label: "3. Location & LMO Note" },
    { id: 4, label: "4. Documents" },
    { id: 5, label: "5. Review & Submit" },
  ];

  // Auto-save draft on step navigation (Section 36, 53)
  const handleSaveStepDraft = (nextStep) => {
    saveDraft({
      step: nextStep,
      instrumentId: selectedInstrumentId,
      instrumentName: selectedInstrument?.name,
      verificationType,
      prevCertificateNo,
      applicationId,
      locationAddress,
      locationCity,
      locationDistrict: resolvedLocationDistrict,
      locationDistrictId,
      locationState: resolvedLocationState,
      locationPincode,
      locationNotes,
      noteForLmo,
      additionalDocs,
    });
  };

  const handleNext = () => {
    setErrorMessage("");

    // Step 1 Validation
    if (currentStep === 1) {
      if (!selectedInstrument) {
        setErrorMessage("Please select an instrument before proceeding.");
        return;
      }
      if (!hasPurchaseBill) {
        setErrorMessage(
          "Please add the purchase bill to this instrument before applying for verification."
        );
        return;
      }
    }

    // Step 3 Validation
    if (currentStep === 3) {
      const missing = [
        ["address", locationAddress],
        ["city", locationCity],
        ["district", locationDistrictId],
        ["state", resolvedLocationState],
        ["PIN code", locationPincode],
      ].filter(([, value]) => !String(value || "").trim());
      if (missing.length) {
        setErrorMessage(`Please complete the verification location: ${missing.map(([label]) => label).join(", ")}.`);
        return;
      }
      if (!districts.find((district) => district.id === locationDistrictId)) {
        setErrorMessage("Please select a valid verification district from the list.");
        return;
      }
    }

    if (currentStep < 5) {
      const next = currentStep + 1;
      setCurrentStep(next);
      handleSaveStepDraft(next);
    }
  };

  const handleBack = () => {
    setErrorMessage("");
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      handleSaveStepDraft(prev);
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const uploaded = await metrixApi.uploadDocument({
          bucket: "business-documents",
          fileName: file.name,
          mimeType: file.type || "application/pdf",
          base64: await fileToBase64(file),
        });
        setAdditionalDocs((prev) => [
          ...prev,
          {
            documentId: uploaded.data.documentId,
            name: uploaded.data.fileName,
            size: `${(uploaded.data.fileSize / 1024 / 1024).toFixed(1)} MB`,
            type: uploaded.data.fileType,
          },
        ]);
      } catch (error) {
        setErrorMessage(error.message || "Could not upload document.");
      }
    }
  };

  const handleRemoveDoc = (index) => {
    setAdditionalDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLocationStateChange = (event) => {
    setLocationState(event.target.value);
    setLocationDistrict("");
    setLocationDistrictId("");
  };

  const handleLocationDistrictChange = (event) => {
    const districtId = event.target.value;
    const district = districts.find((entry) => entry.id === districtId);
    setLocationDistrictId(districtId);
    setLocationDistrict(district?.name || "");
    if (district?.state) setLocationState(district.state);
  };

  // Upload or update instrument's statutory purchase bill
  const handlePurchaseBillUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedInstrument) return;

    try {
      const billData = {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        fileType: file.type || "application/pdf",
        mimeType: file.type || "application/pdf",
        base64: await fileToBase64(file),
        uploadedDate: new Date().toISOString().split("T")[0],
        source: "INSTRUMENT",
      };
      await updateInstrument(selectedInstrument.id, {
        purchaseBill: billData,
      });
      setErrorMessage("");
    } catch (err) {
      console.error("Failed to attach purchase bill:", err);
      setErrorMessage("Failed to attach purchase bill. Please try again.");
    }
  };

  const hasPurchaseBill = Boolean(
    selectedInstrument?.purchaseBill &&
      (selectedInstrument.purchaseBill.fileName || selectedInstrument.purchaseBill.name)
  );

  // Submit Application
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const payload = {
        applicationId: applicationId.trim() || undefined,
        instrumentId: selectedInstrument.id,
        verificationType,
        verificationLocation: {
          address: locationAddress,
          city: locationCity,
          district: resolvedLocationDistrict,
          districtId: locationDistrictId,
          state: resolvedLocationState,
          pincode: locationPincode,
          notes: locationNotes,
        },
        noteForLmo,
        additionalDocuments: additionalDocs,
      };

      const res = await submitApplication(payload);
      setShowConfirmModal(false);
      setSubmissionResult(res);
    } catch (err) {
      setShowConfirmModal(false);
      setErrorMessage(err.message || "Submission failed. Please verify your details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // SUCCESS SCREEN (Section 31, 54)
  // =========================================================================
  if (submissionResult) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-2xs">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[36px]">check_circle</span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">
            Application Submitted Successfully
          </h3>
          <p className="text-xs text-slate-500">
            Your verification application has been filed and routed to the Office of the Assistant Controller.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 text-left max-w-md mx-auto">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500">Application ID</span>
            <span className="font-mono-code font-bold text-slate-900">{submissionResult.id}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500">Status</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[11px]">
              Submitted
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500">Instrument</span>
            <span className="font-semibold text-slate-800">{selectedInstrument?.name}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Jurisdiction</span>
            <span className="font-semibold text-slate-800">{submissionResult.district} District</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 max-w-md mx-auto">
          We will update you when your application is reviewed by the Assistant Controller and scheduled for physical verification by a Legal Metrology Officer.
        </p>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Link
            href={href(`/applications/${submissionResult.id}`)}
            className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs"
          >
            View Application
          </Link>
          <Link
            href={href("/applications")}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
          >
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PROFILE INCOMPLETE BLOCK (Section 5, 72)
  // =========================================================================
  if (!isProfileComplete) {
    return (
      <div className="bg-white border border-amber-200 rounded-xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-2xs">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[36px]">contact_mail</span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">
            Complete your business details
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Please complete your business profile before applying for verification. Legal Metrology statutory regulations require verified establishment and GST credentials.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href={href("/settings")}
            className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors shadow-2xs"
          >
            Go to Settings
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Stepper Indicator (Section 13) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-2xs">
        <StepProgress currentStep={currentStep} steps={steps} />
      </div>

      {/* Error Message Box */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-rose-600">error</span>
          {errorMessage}
        </div>
      )}

      {/* Main Step Form Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs space-y-6 text-xs">
        {/* =========================================================================
            STEP 1: INSTRUMENT SELECTION & LOCKED DETAILS (Section 14, 15)
           ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step 1 — Selected Instrument
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Verification applications are tied to registered instruments in your inventory.
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Application ID</label>
              <input
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="Optional, e.g. APP-TEST-001"
                className="w-full sm:w-80 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono-code text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            {/* If started from Applications, allow switching instrument */}
            {businessInstruments.length > 1 && (
              <div className="space-y-2">
                <label className="font-bold text-slate-700">Choose Instrument from Inventory</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {businessInstruments.map((inst) => (
                    <label
                      key={inst.id}
                      className={`p-3.5 rounded-lg border cursor-pointer flex items-start gap-3 transition-colors ${
                        selectedInstrumentId === inst.id
                          ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="instrumentSelect"
                        value={inst.id}
                        checked={selectedInstrumentId === inst.id}
                        onChange={() => setSelectedInstrumentId(inst.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{inst.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono-code mt-0.5">
                          SN: {inst.serialNumber}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Capacity: {inst.capacity} • {inst.location}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Read-Only Instrument Specifications (Section 14, 15) */}
            {selectedInstrument ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-700 text-[20px]">
                      straighten
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {selectedInstrument.name}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded">
                    {selectedInstrument.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Manufacturer</span>
                    <p className="font-semibold text-slate-800">{selectedInstrument.manufacturer || "Essae"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Model</span>
                    <p className="font-semibold text-slate-800">{selectedInstrument.model || "DS-415"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Serial Number</span>
                    <p className="font-mono-code font-bold text-slate-900">
                      {selectedInstrument.serialNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Capacity</span>
                    <p className="font-semibold text-slate-800">{selectedInstrument.capacity}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Accuracy Class</span>
                    <p className="font-semibold text-slate-800">
                      {selectedInstrument.accuracyClass || "Class III (Medium)"}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`text-[10px] uppercase font-bold ${
                        hasPurchaseBill ? "text-slate-400" : "text-rose-500"
                      }`}
                    >
                      Purchase Bill
                    </span>
                    {hasPurchaseBill ? (
                      <div className="mt-0.5 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <p className="text-emerald-700 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Attached
                          </p>
                          <label className="cursor-pointer text-[10px] text-slate-500 hover:text-slate-900 underline font-medium">
                            Replace
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.png,.jpg,.jpeg"
                              onChange={handlePurchaseBillUpload}
                            />
                          </label>
                        </div>
                        <p
                          className="text-[10px] text-slate-500 font-mono-code truncate max-w-[150px]"
                          title={selectedInstrument.purchaseBill?.fileName}
                        >
                          {selectedInstrument.purchaseBill?.fileName}
                        </p>
                      </div>
                    ) : (
                      <p className="text-rose-600 font-bold flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        Missing (Required)
                      </p>
                    )}
                  </div>
                </div>

                {/* Inline Action Banner if Purchase Bill is Missing */}
                {!hasPurchaseBill && (
                  <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-amber-600 text-[20px] mt-0.5">
                        warning
                      </span>
                      <div className="flex-1">
                        <h5 className="font-bold text-slate-900 text-xs">
                          Statutory Purchase Bill Required
                        </h5>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          Under Legal Metrology Section 8 &amp; 45 regulations, an official manufacturer or dealer purchase invoice is required to verify instrument origin before scheduling verification.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <label className="cursor-pointer px-3.5 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs">
                        <span className="material-symbols-outlined text-[16px]">upload_file</span>
                        Upload Purchase Bill
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handlePurchaseBillUpload}
                        />
                      </label>

                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Want to change instrument details?</span>
                  <Link
                    href={href("/instruments")}
                    className="text-slate-900 font-bold hover:underline flex items-center gap-1"
                  >
                    Edit Instrument
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
                <p className="text-slate-500">No instruments registered yet.</p>
                <Link
                  href={href("/instruments/new")}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs inline-block"
                >
                  + Add Instrument First
                </Link>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            STEP 2: VERIFICATION TYPE (Section 16)
           ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step 2 — Verification Type
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Choose the type of statutory verification you need for this instrument.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-5 rounded-xl border cursor-pointer flex flex-col justify-between space-y-3 transition-colors ${
                  verificationType === "First Time Verification"
                    ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">First Time Verification</h4>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                      For newly acquired instruments entering commercial trade. Requires verification before initial usage.
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="verificationType"
                    value="First Time Verification"
                    checked={verificationType === "First Time Verification"}
                    onChange={(e) => setVerificationType(e.target.value)}
                    className="mt-0.5"
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded self-start">
                  Initial Stamping
                </span>
              </label>

              <label
                className={`p-5 rounded-xl border cursor-pointer flex flex-col justify-between space-y-3 transition-colors ${
                  verificationType === "Re-verification"
                    ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Re-verification</h4>
                    <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                      Mandatory annual or periodic re-verification and re-stamping for instruments currently in commercial use.
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="verificationType"
                    value="Re-verification"
                    checked={verificationType === "Re-verification"}
                    onChange={(e) => setVerificationType(e.target.value)}
                    className="mt-0.5"
                  />
                </div>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded self-start">
                  Periodic Stamping
                </span>
              </label>
            </div>

            {verificationType === "Re-verification" && (
              <div className="space-y-2 pt-4 border-t border-slate-200">
                <label className="font-semibold text-slate-700">
                  Previous Certificate Number (Optional)
                </label>
                <input
                  type="text"
                  value={prevCertificateNo}
                  onChange={(e) => setPrevCertificateNo(e.target.value)}
                  placeholder="e.g. LM-AJM-2025-008912"
                  className="w-full sm:w-80 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono-code text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            STEP 3: VERIFICATION LOCATION & NOTE FOR LMO (Section 17, 18, 19)
           ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step 3 — Verification Location
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Where should the physical inspection take place? (May differ from registered office).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">
                  Inspection Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="e.g. Plot 88, Marble Industrial Area, Kishangarh"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">City</label>
                <input
                  type="text"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  placeholder="Verification city"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">State</label>
                <select
                  value={locationState}
                  onChange={handleLocationStateChange}
                  disabled={districtsLoading || states.length === 0}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">{districtsLoading ? "Loading states..." : "Select state"}</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">District</label>
                <select
                  value={locationDistrictId}
                  onChange={handleLocationDistrictChange}
                  disabled={districtsLoading || !locationState || districtOptions.length === 0}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">{locationState ? "Select district" : "Select state first"}</option>
                  {districtOptions.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">PIN Code</label>
                <input
                  type="text"
                  value={locationPincode}
                  onChange={(e) => setLocationPincode(e.target.value)}
                  placeholder="PIN code"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700">Location Notes (Optional)</label>
                <input
                  type="text"
                  value={locationNotes}
                  onChange={(e) => setLocationNotes(e.target.value)}
                  placeholder="e.g. Inside warehouse bay 2, near loading ramp"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
            </div>

            {/* Note for LMO (Section 19) */}
            <div className="space-y-2 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900">
                  Note for LMO (Optional)
                </label>
                <span className="text-[11px] text-slate-400">Visible to assigned field officer</span>
              </div>
              <textarea
                rows={3}
                value={noteForLmo}
                onChange={(e) => setNoteForLmo(e.target.value)}
                placeholder="e.g. Please call before visiting. The weighbridge is inside the rear gate. Contact person: Ramesh (+91 98290 11223)."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 4: DOCUMENTS (Section 20, 21, 22, 23)
           ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step 4 — Documents
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                The purchase bill is automatically attached from your instrument record. Additional documents are optional.
              </p>
            </div>

            {/* Automatic Purchase Bill Card (Section 20) */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-xs">Required Statutory Document</h4>
              {hasPurchaseBill ? (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[24px]">
                      receipt_long
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">
                          {selectedInstrument?.purchaseBill?.fileName || "Purchase_Bill_OEM_Invoice.pdf"}
                        </p>
                        <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 text-[9px] font-bold rounded">
                          ✓ Attached to Instrument
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Source: <strong>Instrument</strong> (Permanently linked • {selectedInstrument?.purchaseBill?.fileSize || "1.2 MB"})
                      </p>
                    </div>
                  </div>
                  <label className="cursor-pointer px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] flex items-center gap-1 shadow-2xs">
                    <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                    Replace
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handlePurchaseBillUpload}
                    />
                  </label>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-amber-600 text-[22px]">
                        warning
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          Missing Purchase Bill on Instrument
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Upload the official invoice or bill from manufacturer / authorized dealer.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-2xs">
                        <span className="material-symbols-outlined text-[16px]">upload_file</span>
                        Upload Bill
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handlePurchaseBillUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Additional Documents (Section 21) */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Additional Supporting Documents</h4>
                  <p className="text-slate-500 text-[10px]">Additional documents are optional.</p>
                </div>
                <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Document
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg"
                    onChange={handleDocUpload}
                  />
                </label>
              </div>

              {additionalDocs.length === 0 ? (
                <p className="text-slate-400 italic text-xs py-2">
                  No additional documents attached. You can proceed without any.
                </p>
              ) : (
                <div className="space-y-2">
                  {additionalDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-slate-500 text-[18px]">
                          description
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{doc.name}</p>
                          <p className="text-[10px] text-slate-500">{doc.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(idx)}
                        className="text-slate-400 hover:text-rose-600 text-xs font-semibold transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            STEP 5: REVIEW (Section 24, 25)
           ========================================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step 5 — Application Review
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Please verify all details before submitting. After submission, these details form an immutable statutory filing.
              </p>
            </div>

            {/* Summary Cards (Read-Only) */}
            <div className="space-y-4">
              {/* Business Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Business Information
                  </h4>
                  <Link href={href("/settings")} className="text-slate-500 hover:text-slate-900 text-[11px] font-semibold">
                    Edit in Settings
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Business Name</span>
                    <p className="font-semibold text-slate-800">
                      {businessProfile?.businessName || businessProfile?.name || currentUser?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">GSTIN</span>
                    <p className="font-mono-code font-semibold text-slate-800">
                      {businessProfile?.gstin || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Registered Office</span>
                    <p className="text-slate-700">{businessProfile?.address || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Instrument Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Instrument Details
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-slate-500 hover:text-slate-900 text-[11px] font-semibold"
                  >
                    Change
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Instrument</span>
                    <p className="font-bold text-slate-900">{selectedInstrument?.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Serial Number</span>
                    <p className="font-mono-code font-bold text-slate-900">
                      {selectedInstrument?.serialNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Capacity</span>
                    <p className="font-semibold text-slate-800">{selectedInstrument?.capacity}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Manufacturer</span>
                    <p className="text-slate-700">{selectedInstrument?.manufacturer}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Verification Type</span>
                    <p className="font-bold text-emerald-800">{verificationType}</p>
                  </div>
                </div>
              </div>

              {/* Location & LMO Note */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Verification Location &amp; Note
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-slate-500 hover:text-slate-900 text-[11px] font-semibold"
                  >
                    Edit
                  </button>
                </div>
                <div className="text-xs space-y-2">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Inspection Location</span>
                    <p className="font-semibold text-slate-800">
                      {locationAddress}, {locationCity}, {resolvedLocationDistrict}, {resolvedLocationState} - {locationPincode}
                    </p>
                  </div>
                  {noteForLmo && (
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Note for LMO</span>
                      <p className="text-slate-700 italic bg-white p-2.5 rounded border border-slate-200 mt-1">
                        &ldquo;{noteForLmo}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Summary */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Attached Documents
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-slate-500 hover:text-slate-900 text-[11px] font-semibold"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                    <span>Purchase Bill ({selectedInstrument?.purchaseBill?.fileName || "Purchase_Bill.pdf"})</span>
                    <span className="text-[10px] text-slate-400 font-normal">• Source: Instrument</span>
                  </div>
                  {additionalDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-700">
                      <span className="material-symbols-outlined text-[16px] text-blue-600">check</span>
                      <span>{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Actions (Back / Continue / Submit) */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-colors text-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back
            </button>
          ) : (
            <Link
              href={href("/applications")}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-colors text-xs"
            >
              Cancel
            </Link>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
            >
              Continue
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-2"
            >
              Submit Application
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog (Section 26) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Submit Application?</h3>
                <p className="text-slate-500 text-[11px]">Final statutory confirmation</p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Please check your details before submitting. After submission, your verification filing will be received by the district Assistant Controller for review and LMO assignment.
            </p>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold flex items-center gap-1.5"
              >
                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Apply for Verification"
          subtitle="Submit an instrument verification application to the Legal Metrology Department."
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            { label: "Applications", href: "/applications" },
            { label: "Apply" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-4xl w-full mx-auto">
          <Suspense
            fallback={
              <div className="p-8 text-center text-xs text-slate-500">
                Loading application form...
              </div>
            }
          >
            <ApplyFormContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
