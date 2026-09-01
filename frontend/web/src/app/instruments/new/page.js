"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import { useMetrixStore } from "@/lib/store";

export default function RegisterInstrumentPage() {
  const router = useRouter();
  const { addInstrument, currentUser, businessProfile } = useMetrixStore();

  const [formData, setFormData] = useState({
    name: "",
    type: "Non-Automatic Weighing Instrument (NAWI)",
    category: "Non-Automatic Weighing Instrument",
    manufacturer: "",
    model: "",
    serialNumber: "",
    capacity: "",
    accuracyClass: "Class III (Medium)",
    yearOfManufacture: "2024",
    purchaseDate: new Date().toISOString().split("T")[0],
    location: businessProfile?.address || "Plot 12, Krishi Mandi Commercial Yard, Ajmer",
    city: businessProfile?.city || "Ajmer",
    district: businessProfile?.district || "Ajmer",
    state: businessProfile?.state || "Rajasthan",
    purpose: "Commercial Trade & Packaging",
  });

  // Purchase Bill State (Section 8)
  const [purchaseBill, setPurchaseBill] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPurchaseBill({
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        fileType: file.type || "application/pdf",
        uploadedDate: new Date().toISOString().split("T")[0],
      });
      setErrorMessage("");
    }
  };

  const handleRemoveBill = () => {
    setPurchaseBill(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Verify Purchase Bill (Section 8, 45, 74)
    if (!purchaseBill) {
      setErrorMessage("Please add the purchase bill to this instrument before applying for verification.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addInstrument({
        ...formData,
        purchaseBill,
      });
      router.push("/instruments");
    } catch (err) {
      setErrorMessage(err.message || "Failed to register instrument.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Add Instrument"
          subtitle="Enlist a commercial weighing or measuring instrument under Legal Metrology registry."
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            { label: "Instruments", href: "/instruments" },
            { label: "Add Instrument" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Instrument Details &amp; Purchase Bill
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your instrument specifications and attach its manufacturer purchase invoice.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-rose-600">error</span>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* SECTION 1: INSTRUMENT TECHNICAL SPECIFICATIONS */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500">
                  1. Instrument Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-semibold text-slate-700">
                      Instrument Name / Description <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. 60T Electronic Weighbridge or Platform Scale"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">
                      Instrument Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                      required
                    >
                      <option value="Non-Automatic Weighing Instrument (NAWI)">
                        Non-Automatic Weighing Instrument (NAWI)
                      </option>
                      <option value="Automatic / Heavy Weighbridge">
                        Automatic / Heavy Weighbridge
                      </option>
                      <option value="Precision Laboratory Balance">
                        Precision Laboratory Balance
                      </option>
                      <option value="Liquid Fuel Measuring Instrument">
                        Liquid Fuel Measuring Instrument / Dispenser
                      </option>
                      <option value="Automatic Gravimetric Filling Instrument">
                        Automatic Gravimetric Filling Instrument
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">
                      Accuracy Class <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.accuracyClass}
                      onChange={(e) => setFormData({ ...formData, accuracyClass: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    >
                      <option value="Class I (Special Analytical)">Class I (Special Analytical)</option>
                      <option value="Class II (High Accuracy)">Class II (High Accuracy)</option>
                      <option value="Class III (Medium Accuracy)">Class III (Medium / Commercial)</option>
                      <option value="Class IV (Ordinary / Bulk)">Class IV (Ordinary Bulk)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">
                      Manufacturer <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      placeholder="e.g. ABC Machines or Essae-Teraoka Ltd"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g. WM-60T or DS-415"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">
                      Serial Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      placeholder="e.g. WB-60T-AJM-0042"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-mono-code text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">
                      Max Capacity <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="e.g. 60 Ton or 500 kg"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">Year of Manufacture</label>
                    <input
                      type="text"
                      value={formData.yearOfManufacture}
                      onChange={(e) => setFormData({ ...formData, yearOfManufacture: e.target.value })}
                      placeholder="2024"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">Purchase Date</label>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PHYSICAL LOCATION */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500">
                  2. Current Location &amp; Purpose
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-semibold text-slate-700">
                      Current Location Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Industrial Area, Kishangarh, Ajmer"
                      required
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">District</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-semibold text-slate-700">Purpose / Commercial Use</label>
                    <input
                      type="text"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      placeholder="e.g. Weighing of grain trucks and commercial goods"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: PURCHASE BILL UPLOAD (Section 8) */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500">
                      3. Purchase Bill <span className="text-rose-500">*</span>
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Upload the official purchase bill/invoice from the manufacturer or authorized dealer.
                      This bill will be permanently attached to the instrument and automatically reused during verifications.
                    </p>
                  </div>
                </div>

                {!purchaseBill ? (
                  <label className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group">
                    <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-slate-600 mb-2 transition-colors">
                      <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                    </div>
                    <span className="font-bold text-slate-900 text-xs">Upload Purchase Bill</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">PDF, PNG, JPG up to 10MB</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                    />
                  </label>
                ) : (
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-[26px]">
                        task_alt
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{purchaseBill.fileName}</p>
                        <p className="text-[10px] text-slate-500">
                          {purchaseBill.fileType} • {purchaseBill.fileSize} • Uploaded today
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 font-semibold text-[11px] hover:bg-slate-50 transition-colors">
                        Replace
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveBill}
                        className="px-2.5 py-1 rounded bg-white border border-rose-200 text-rose-700 font-semibold text-[11px] hover:bg-rose-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <Link
                  href="/instruments"
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-colors text-xs"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-2"
                >
                  {isSubmitting ? "Saving..." : "Save Instrument"}
                  <span className="material-symbols-outlined text-[16px]">save</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
