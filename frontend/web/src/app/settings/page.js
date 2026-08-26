"use client";

import React, { useState } from "react";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import { useMetrixStore } from "@/lib/store";

export default function SettingsPage() {
  const { userProfile, setUserProfile, resetToDefault } = useMetrixStore();

  const [formData, setFormData] = useState({ ...userProfile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm("Reset demo data to default initial state?")) {
      resetToDefault();
      setFormData({ ...userProfile });
      alert("State successfully reset to default sample data.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Organization Settings &amp; Profile"
          subtitle="Manage statutory business profile, registration credentials, and regulatory contact details."
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            { label: "Settings" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-4xl w-full mx-auto space-y-6">
          {savedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-emerald-600">
                check_circle
              </span>
              Organization profile and statutory contact details updated successfully!
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs">
            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Business Identification &amp; Legal Metrology Registration
                </h3>
                <p className="text-slate-500 mt-0.5">
                  Official establishment details registered with the Department of Legal Metrology.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Registered Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Trade Name / Branch Description
                  </label>
                  <input
                    type="text"
                    value={formData.tradeName}
                    onChange={(e) =>
                      setFormData({ ...formData, tradeName: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Legal Metrology Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.regNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, regNumber: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs font-mono-code font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    GSTIN Identification Number
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) =>
                      setFormData({ ...formData, gstin: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs font-mono-code text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-base font-bold text-slate-900">
                  Authorized Signee &amp; Primary Compliance Contact
                </h3>
                <p className="text-slate-500 mt-0.5">
                  Designated official responsible for statutory inspections and verification renewals.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPerson: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Official Email ID
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Mobile Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-base font-bold text-slate-900">
                  Principal Operating Address
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Street / Premises Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleResetData}
                  className="px-4 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                >
                  Reset Demo State to Initial Data
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-2xs flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    save
                  </span>
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
