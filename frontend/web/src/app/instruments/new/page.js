"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import { useMetrixStore } from "@/lib/store";

export default function RegisterInstrumentPage() {
  const router = useRouter();
  const { addInstrument } = useMetrixStore();

  const [formData, setFormData] = useState({
    name: "",
    category: "Non-Automatic Weighing Instrument",
    accuracyClass: "Class III",
    manufacturer: "",
    model: "",
    serialNumber: "",
    maxCapacity: "",
    minCapacity: "",
    verificationScaleInterval: "",
    location: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      addInstrument(formData);
      setIsSubmitting(false);
      router.push("/instruments");
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Register New Instrument"
          subtitle="Enlist a new commercial weighing or measuring instrument under Legal Metrology jurisdiction."
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            { label: "Instruments", href: "/instruments" },
            { label: "Register New" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs">
            <div className="border-b border-slate-200 pb-4 mb-6">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Instrument Technical Declaration
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please enter exact manufacturer specifications and identification numbers as stamped on the physical rating plate.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* Category & Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Instrument Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  >
                    <option value="Non-Automatic Weighing Instrument">
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
                    onChange={(e) =>
                      setFormData({ ...formData, accuracyClass: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  >
                    <option value="Class I (Special Analytical)">
                      Class I (Special Analytical)
                    </option>
                    <option value="Class II (High Accuracy)">
                      Class II (High Accuracy)
                    </option>
                    <option value="Class III (Medium / Commercial)">
                      Class III (Medium / Commercial)
                    </option>
                    <option value="Class IV (Ordinary / Bulk)">
                      Class IV (Ordinary / Bulk)
                    </option>
                    <option value="Accuracy Class 0.5 (Flow & Fuel)">
                      Accuracy Class 0.5 (Flow & Fuel)
                    </option>
                  </select>
                </div>
              </div>

              {/* Instrument Name */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Instrument Common / Trade Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Retail Counter Price Computing Scale (Counter 05)"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  required
                />
              </div>

              {/* Manufacturer & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Manufacturer / OEM Make <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Essae-Teraoka Ltd. / Mettler Toledo"
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData({ ...formData, manufacturer: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Model Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DS-252 / XPR205DU"
                    value={formData.model}
                    onChange={(e) =>
                      setFormData({ ...formData, model: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Serial Number & Verification Interval */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Physical Serial Number (Stamped) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ES-2024-99120"
                    value={formData.serialNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, serialNumber: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs font-mono-code font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  />
                  <span className="text-[11px] text-slate-400">
                    Must match exact stamped plate on the instrument chassis.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Verification Scale Interval (e) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5 g / 0.1 mg / 10 kg"
                    value={formData.verificationScaleInterval}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        verificationScaleInterval: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Capacities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Maximum Capacity (Max) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 30 kg / 60,000 kg / 220 g"
                    value={formData.maxCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, maxCapacity: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Minimum Capacity (Min)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 100 g / 400 kg / 1 mg"
                    value={formData.minCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, minCapacity: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Physical Location */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Installation / Operating Premises Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Counter 05, Retail Hall A, Okhla Industrial Area, Delhi"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <Link
                  href="/instruments"
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    save
                  </span>
                  {isSubmitting ? "Registering..." : "Save Instrument"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
