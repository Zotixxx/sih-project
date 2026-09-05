"use client";

import React, { useState } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import { metrixApi } from "@/lib/api";
import { portalPath } from "@/lib/routes";
import { useMetrixStore } from "@/lib/store";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error || new Error("Could not read document."));
    reader.readAsDataURL(file);
  });

export default function SettingsPage() {
  const { userRole, district, currentUser, lmos } = useMetrixStore();

  const districtName = district?.name || currentUser?.districtName || currentUser?.district_id || "District";

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
              ? `Supervising Officer Profile • Office of the Assistant Controller, ${districtName}`
              : userRole === "lmo"
              ? `${districtName} Field Officer Credentials & Duty Jurisdiction`
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
                  District Admin
                </span>
              </div>

              {/* Officer Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Officer Name</span>
                  <p className="font-bold text-slate-900 text-sm">{currentUser?.name || currentUser?.displayName || "Assistant Controller"}</p>
                  <p className="text-slate-500 text-[11px]">{currentUser?.designation || "Assistant Controller of Legal Metrology"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Badge / Authority ID</span>
                  <p className="font-mono-code font-bold text-slate-900 text-sm">{currentUser?.domainId || currentUser?.ac_id || currentUser?.id}</p>
                  <p className="text-emerald-700 text-[11px] font-bold">District certificate sanctioning authority</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Official Email</span>
                  <p className="font-medium text-slate-800">{currentUser?.email || "Not recorded"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Contact Phone</span>
                  <p className="font-medium text-slate-800">{currentUser?.phone || "Not recorded"}</p>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">District Headquarters Office Address</span>
                  <p className="font-medium text-slate-800">
                    {district?.controllerOffice || `Office of the Assistant Controller, ${districtName}`}
                  </p>
                </div>
              </div>

              {/* Territorial Sub-Divisions */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500">
                  Supervised LMOs
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {(lmos || []).map((z, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <p className="font-bold text-slate-900 text-xs">{z.jurisdiction || "Jurisdiction"}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{z.name} ({z.domainId || z.lmo_id})</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-slate-500 text-xs">District Compliance: </span>
                  <strong className="text-slate-500 font-bold">Not available</strong>
                </div>

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
                {currentUser?.name || currentUser?.displayName || "LMO"} Profile
              </h3>
              <p className="text-slate-600">
                Designation: <strong>{currentUser?.designation || "Legal Metrology Officer"}</strong> • District: <strong>{districtName}</strong>
              </p>
              <p className="text-slate-500">
                Jurisdiction: {currentUser?.jurisdiction || "Not recorded"}.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function BusinessProfileSettings() {
  const { currentUser, businessProfile, updateBusinessProfile } = useMetrixStore();
  const href = (path) => portalPath(currentUser, path);

  const [formData, setFormData] = useState({
    businessName: businessProfile?.businessName || businessProfile?.name || currentUser?.name || "",
    businessType: businessProfile?.businessType || "",
    gstin: businessProfile?.gstin || "",
    pan: businessProfile?.pan || "",
    registrationNumber: businessProfile?.registrationNumber || "",
    ownerName: businessProfile?.ownerName || businessProfile?.contactPerson || "",
    phone: businessProfile?.phone || currentUser?.phone || "",
    email: businessProfile?.email || currentUser?.email || "",
    address: businessProfile?.address || "",
    city: businessProfile?.city || "",
    district: businessProfile?.district || businessProfile?.district_id || "",
    state: businessProfile?.state || "",
    pincode: businessProfile?.pincode || "",
    turnover: businessProfile?.turnover || "",
    natureOfBusiness: businessProfile?.natureOfBusiness || "",
    businessCategory: businessProfile?.businessCategory || "",
  });

  const [documents, setDocuments] = useState(businessProfile?.documents || []);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Synchronize when businessProfile loads
  React.useEffect(() => {
    if (businessProfile) {
      const syncProfile = setTimeout(() => setFormData((prev) => ({
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
        district: businessProfile.district_id || businessProfile.district || prev.district,
        state: businessProfile.state || prev.state,
        pincode: businessProfile.pincode || prev.pincode,
        turnover: businessProfile.turnover || prev.turnover,
        natureOfBusiness: businessProfile.natureOfBusiness || prev.natureOfBusiness,
      })), 0);
      if (businessProfile.documents && businessProfile.documents.length > 0) {
        const syncDocuments = setTimeout(() => setDocuments(businessProfile.documents), 0);
        return () => {
          clearTimeout(syncProfile);
          clearTimeout(syncDocuments);
        };
      }
      return () => clearTimeout(syncProfile);
    }
  }, [businessProfile]);

  // Completeness calculation
  const missingFields = [];
  if (!formData.businessName.trim()) missingFields.push("Business Name");
  if (!formData.gstin.trim()) missingFields.push("GST Number");
  if (!formData.ownerName.trim()) missingFields.push("Applicant / Owner Name");
  if (!formData.email.trim()) missingFields.push("Email");
  if (!formData.address.trim()) missingFields.push("Address");
  if (!formData.city.trim()) missingFields.push("City");
  if (!formData.district.trim()) missingFields.push("District");
  if (!formData.state.trim()) missingFields.push("State");
  if (!formData.pincode.trim()) missingFields.push("PIN Code");
  if (!formData.phone.trim()) missingFields.push("Phone Number");
  const isComplete = missingFields.length === 0;

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
        setDocuments((prev) => [
          ...prev,
          {
            id: uploaded.data.documentId,
            documentId: uploaded.data.documentId,
            name: uploaded.data.fileName,
            size: `${(uploaded.data.fileSize / 1024 / 1024).toFixed(1)} MB`,
            type: uploaded.data.fileType,
          },
        ]);
      } catch (error) {
        alert("Error uploading document: " + error.message);
      }
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
            href={href("/instruments")}
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
                placeholder="e.g. 00AAAAA0000A0Z0"
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
                placeholder="Assigned by department"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">District</label>
              <input
                type="text"
                value={formData.district}
                readOnly
                placeholder="Assigned by department"
                className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">PIN Code</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="PIN code"
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
        <div className="pt-6 border-t border-slate-200 flex items-center justify-end">
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
