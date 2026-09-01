"use client";

import React, { useState } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import { useMetrixStore } from "@/lib/store";

export default function SettingsPage() {
  const { userRole, district, resetToDefault } = useMetrixStore();

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleResetData = () => {
    if (confirm("Reset MetriX prototype data to default Ajmer District initial state?")) {
      resetToDefault();
      alert("MetriX database reset to default Ajmer District seed state.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title={
            userRole === "admin"
              ? "Official Supervisory Profile & District Authority"
              : userRole === "lmo"
              ? "Legal Metrology Officer (LMO) Credentials"
              : "Business Establishment Profile"
          }
          subtitle={
            userRole === "admin"
              ? "Supervising Officer Profile • Office of the Assistant Controller, Ajmer District, Rajasthan"
              : userRole === "lmo"
              ? "Ajmer Field Officer Credentials & Duty Jurisdiction"
              : "Registered Commercial Merchant Information"
          }
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            {
              label:
                userRole === "admin"
                  ? "Official Profile"
                  : userRole === "lmo"
                  ? "Officer Credentials"
                  : "Establishment Profile",
            },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
          {savedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-emerald-600">
                check_circle
              </span>
              Configuration and profile updated successfully!
            </div>
          )}

          {/* =========================================================================
              DISTRICT ADMIN / ASSISTANT CONTROLLER PROFILE
             ========================================================================= */}
          {userRole === "admin" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs space-y-6 text-xs">
              <div className="border-b border-slate-200 pb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Assistant Controller Supervisory Profile
                  </h3>
                  <p className="text-slate-500 mt-0.5">
                    District Legal Metrology Administration &amp; Statutory Sanctioning Authority.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-900 font-bold text-[11px]">
                  District Admin (Ajmer)
                </span>
              </div>

              {/* Officer Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Officer Name</span>
                  <p className="font-bold text-slate-900 text-sm">Dr. R. K. Sharma</p>
                  <p className="text-slate-500 text-[11px]">Assistant Controller of Legal Metrology</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Badge / Authority ID</span>
                  <p className="font-mono-code font-bold text-slate-900 text-sm">AC-AJM-001</p>
                  <p className="text-emerald-700 text-[11px] font-bold">✓ Chief District Certificate Sanctioning Authority</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Official Email</span>
                  <p className="font-medium text-slate-800">ac.ajmer@metrix.gov.in</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Contact Phone</span>
                  <p className="font-medium text-slate-800">+91 94140 11001</p>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">District Headquarters Office Address</span>
                  <p className="font-medium text-slate-800">
                    Collectorate Compound, Kutchery Road, Ajmer, Rajasthan - 305001
                  </p>
                </div>
              </div>

              {/* Territorial Sub-Divisions */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500">
                  Supervised Ajmer District Sub-Divisions &amp; Zones
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { zone: "Ajmer City", lmo: "Rajesh Kumar (LMO-AJM-021)" },
                    { zone: "Kishangarh", lmo: "Priya Sharma (LMO-AJM-014)" },
                    { zone: "Beawar Hub", lmo: "Vikram Singh (LMO-AJM-033)" },
                    { zone: "Nasirabad", lmo: "Amit Meena (LMO-AJM-008)" },
                    { zone: "Pushkar Rural", lmo: "Sunita Rao (LMO-AJM-005)" },
                  ].map((z, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <p className="font-bold text-slate-900 text-xs">{z.zone}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{z.lmo}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance & Reset */}
              <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-slate-500 text-xs">District Compliance: </span>
                  <strong className="text-emerald-700 font-bold">98.4% (Target: 95.0%)</strong>
                </div>

                <button
                  type="button"
                  onClick={handleResetData}
                  className="px-4 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                >
                  Reset Prototype Data to Initial State
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              BUSINESS PROFILE SETUP & MANAGEMENT (Section 3, 4, 5)
             ========================================================================= */}
          {userRole === "business" && (
            <BusinessProfileSettings />
          )}

          {/* =========================================================================
              LMO PROFILE VIEW
             ========================================================================= */}
          {userRole === "lmo" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 text-xs">
              <h3 className="text-base font-bold text-slate-900">
                Rajesh Kumar (LMO) Profile
              </h3>
              <p className="text-slate-600">
                Designation: <strong>Legal Metrology Officer (Inspector)</strong> • District: <strong>Ajmer, Rajasthan</strong>
              </p>
              <p className="text-slate-500">
                Jurisdiction: Commercial Verification &amp; Inspection Division, Zone 1 (Ajmer City &amp; Kishangarh Hub).
              </p>
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleResetData}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Reset Prototype State
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function BusinessProfileSettings() {
  const { currentUser, businessProfile, updateBusinessProfile, resetToDefault } = useMetrixStore();

  const [formData, setFormData] = useState({
    businessName: businessProfile?.businessName || businessProfile?.name || currentUser?.name || "",
    businessType: businessProfile?.businessType || "Private Limited",
    gstin: businessProfile?.gstin || "08AAACB1234A1Z5",
    pan: businessProfile?.pan || "AAACB1234A",
    registrationNumber: businessProfile?.registrationNumber || "RJ-AJM-LM-2021-00892",
    ownerName: businessProfile?.ownerName || businessProfile?.contactPerson || "Ramesh Kumar Agarwal",
    phone: businessProfile?.phone || currentUser?.phone || "+91 98290 11223",
    email: businessProfile?.email || currentUser?.email || "ramesh@shreebalajitraders.com",
    address: businessProfile?.address || "Plot 12, Krishi Mandi Commercial Yard",
    city: businessProfile?.city || "Ajmer",
    district: businessProfile?.district || "Ajmer",
    state: businessProfile?.state || "Rajasthan",
    pincode: businessProfile?.pincode || "305001",
    turnover: businessProfile?.turnover || "₹ 4.8 Crore",
    natureOfBusiness: businessProfile?.natureOfBusiness || "Agricultural Trade, Grain Processing & Warehousing",
    businessCategory: businessProfile?.businessCategory || "Commercial Trading & Warehousing",
  });

  const [documents, setDocuments] = useState(
    businessProfile?.documents || [
      { id: "DOC-GST-01", name: "GST_Registration_Certificate.pdf", size: "1.2 MB", type: "GST Certificate" },
      { id: "DOC-REG-02", name: "Trade_License_Krishi_Mandi.pdf", size: "850 KB", type: "Trade License" },
    ]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Synchronize when businessProfile loads
  React.useEffect(() => {
    if (businessProfile) {
      setFormData((prev) => ({
        ...prev,
        businessName: businessProfile.businessName || businessProfile.name || prev.businessName,
        gstin: businessProfile.gstin || prev.gstin,
        pan: businessProfile.pan || prev.pan,
        registrationNumber: businessProfile.registrationNumber || prev.registrationNumber,
        ownerName: businessProfile.ownerName || businessProfile.contactPerson || prev.ownerName,
        phone: businessProfile.phone || prev.phone,
        email: businessProfile.email || prev.email,
        address: businessProfile.address || prev.address,
        city: businessProfile.city || prev.city,
        district: businessProfile.district || prev.district,
        state: businessProfile.state || prev.state,
        pincode: businessProfile.pincode || prev.pincode,
        turnover: businessProfile.turnover || prev.turnover,
        natureOfBusiness: businessProfile.natureOfBusiness || prev.natureOfBusiness,
      }));
      if (businessProfile.documents && businessProfile.documents.length > 0) {
        setDocuments(businessProfile.documents);
      }
    }
  }, [businessProfile]);

  // Completeness calculation
  const missingFields = [];
  if (!formData.businessName.trim()) missingFields.push("Business Name");
  if (!formData.gstin.trim()) missingFields.push("GST Number");
  if (!formData.address.trim()) missingFields.push("Address");
  if (!formData.phone.trim()) missingFields.push("Phone Number");
  const isComplete = missingFields.length === 0;

  const handleDocUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocuments((prev) => [
        ...prev,
        {
          id: `DOC-BIZ-${Date.now()}`,
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          type: "Supporting Document",
        },
      ]);
    }
  };

  const handleRemoveDoc = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateBusinessProfile({
        ...formData,
        name: formData.businessName,
        documents,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      alert("Error saving profile: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Completion Status Banner (Section 5) */}
      <div
        className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isComplete
            ? "bg-emerald-50 border-emerald-200 text-emerald-950"
            : "bg-amber-50 border-amber-200 text-amber-950"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={`material-symbols-outlined text-[28px] select-none ${
              isComplete ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {isComplete ? "verified" : "info"}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">
                Business Profile: {isComplete ? "Complete" : "Incomplete"}
              </h4>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  isComplete
                    ? "bg-emerald-200 text-emerald-900"
                    : "bg-amber-200 text-amber-900"
                }`}
              >
                {isComplete ? "Ready to Apply" : "Action Required"}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isComplete
                ? "Your business profile is verified and ready. You can add instruments and apply for verification."
                : `Please complete your business details before applying. Missing: ${missingFields.join(", ")}.`}
            </p>
          </div>
        </div>

        {isComplete && (
          <Link
            href="/instruments"
            className="shrink-0 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            Go to Instruments
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        )}
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Business profile saved successfully!
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs space-y-8 text-xs">
        {/* SECTION 1: BUSINESS INFORMATION */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Business Information
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Enter your commercial establishment information as registered with state authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-700">
                Business Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="e.g. Shree Balaji Traders & Cold Storage"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Business Type</label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              >
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="Private Limited">Private Limited Company</option>
                <option value="Public Limited">Public Limited Company</option>
                <option value="LLP">Limited Liability Partnership (LLP)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                GST Number (GSTIN) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                placeholder="e.g. 08AAACB1234A1Z5"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 uppercase font-mono-code focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">PAN Number</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                placeholder="e.g. AAACB1234A"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 uppercase font-mono-code focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Business Registration / Trade License</label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                placeholder="e.g. RJ-AJM-LM-2021-00892"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Owner / Applicant Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="e.g. Ramesh Kumar Agarwal"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Contact Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98290 11223"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-700">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="business@example.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: REGISTERED ADDRESS */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Registered Business Address
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Statutory headquarters or registered office address.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-700">
                Address Line <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Plot 12, Krishi Mandi Commercial Yard"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ajmer"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="Ajmer"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Rajasthan"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">PIN Code</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="305001"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: COMMERCIAL PROFILE */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Commercial Operations Profile
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Turnover and nature of trade conducted.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Annual Turnover</label>
              <input
                type="text"
                value={formData.turnover}
                onChange={(e) => setFormData({ ...formData, turnover: e.target.value })}
                placeholder="e.g. ₹ 4.8 Crore"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nature of Business</label>
              <input
                type="text"
                value={formData.natureOfBusiness}
                onChange={(e) => setFormData({ ...formData, natureOfBusiness: e.target.value })}
                placeholder="e.g. Agricultural Trade, Grain Processing & Warehousing"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: SUPPORTING DOCUMENTS */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Supporting Documents (Optional)
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Upload optional supporting establishment documents (GST certificate, trade license).
              </p>
            </div>
            <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              Upload Document
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg"
                onChange={handleDocUpload}
              />
            </label>
          </div>

          <div className="space-y-2">
            {documents.length === 0 ? (
              <p className="text-slate-400 italic text-xs py-2">No supporting documents uploaded yet.</p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-500 text-[20px]">
                      description
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{doc.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {doc.type || "Document"} • {doc.size}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="text-slate-400 hover:text-rose-600 text-xs font-semibold transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset data to default prototype state?")) {
                resetToDefault();
              }
            }}
            className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
          >
            Reset to Default
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-2"
          >
            {isSaving ? "Saving..." : "Save Profile"}
            <span className="material-symbols-outlined text-[16px]">save</span>
          </button>
        </div>
      </form>
    </div>
  );
}
