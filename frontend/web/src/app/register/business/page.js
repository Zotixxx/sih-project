"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { metrixApi } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const initialForm = {
  email: "",
  password: "",
  businessName: "",
  ownerName: "",
  phone: "",
  gstin: "",
  pan: "",
  registrationNumber: "",
  natureOfBusiness: "",
  districtId: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function BusinessRegistrationPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [completeExisting, setCompleteExisting] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(true);

  const states = Array.from(new Set(districts.map((district) => district.state).filter(Boolean))).sort();
  const districtOptions = districts
    .filter((district) => !form.state || district.state === form.state)
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    let mounted = true;

    const loadDistricts = async () => {
      setDistrictsLoading(true);
      try {
        const response = await metrixApi.getPublicDistricts();
        if (!mounted) return;

        const rows = Array.isArray(response.data) ? response.data : [];
        setDistricts(rows);

        if (rows.length === 1) {
          setForm((current) => ({
            ...current,
            state: current.state || rows[0].state || "",
            districtId: current.districtId || rows[0].id,
          }));
        }
      } catch (loadError) {
        if (mounted) setError(loadError.message || "Could not load district list.");
      } finally {
        if (mounted) setDistrictsLoading(false);
      }
    };

    loadDistricts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const shouldComplete = new URLSearchParams(window.location.search).get("complete") === "1";
      if (!shouldComplete) return;

      const { data } = await getSupabaseBrowserClient().auth.getSession();
      if (!mounted) return;

      if (data.session?.user) {
        setCompleteExisting(true);
        setSignedInEmail(data.session.user.email || "");
        setForm((current) => ({ ...current, email: data.session.user.email || "" }));
      } else {
        setMessage("Sign in first, then complete the business profile.");
      }
    };

    loadSession();
    return () => {
      mounted = false;
    };
  }, []);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateState = (event) => {
    const selectedState = event.target.value;
    setForm((current) => ({
      ...current,
      state: selectedState,
      districtId: "",
    }));
  };

  const registerBusinessRecord = async (accessToken) => {
    const response = await metrixApi.registerBusinessProfile(
      {
        businessName: form.businessName,
        ownerName: form.ownerName,
        phone: form.phone,
        gstin: form.gstin,
        pan: form.pan,
        registrationNumber: form.registrationNumber,
        natureOfBusiness: form.natureOfBusiness,
        districtId: form.districtId,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
      accessToken
    );
    return response.data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      let session;

      if (completeExisting) {
        const { data } = await getSupabaseBrowserClient().auth.getSession();
        session = data.session;
        if (!session?.access_token) {
          throw new Error("Please sign in again before completing the business profile.");
        }
      } else {
        const { data, error: signUpError } = await getSupabaseBrowserClient().auth.signUp({
          email: form.email,
          password: form.password,
        });
        if (signUpError) throw signUpError;

        session = data.session;
        if (!session?.access_token) {
          setMessage("Account created. Confirm the email if Supabase requires confirmation, then sign in to complete the business profile.");
          return;
        }
      }

      const user = await registerBusinessRecord(session.access_token);
      router.push(`/${user.id}/settings`);
    } catch (submitError) {
      setError(submitError.message || "Business registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">balance</span>
            </div>
            <div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight">MetriX</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Business Registration
              </span>
            </div>
          </Link>
          <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-slate-900">
            Back to Login
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Register Business Profile</h1>
            <p className="text-xs text-slate-500 mt-1">
              This creates a Supabase Auth account and a MetriX BUSINESS profile. Government users are provisioned separately.
            </p>
          </div>

          {!completeExisting ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email" type="email" value={form.email} onChange={updateField("email")} required />
              <Field label="Password" type="password" value={form.password} onChange={updateField("password")} required minLength={6} />
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              Completing profile for signed-in account: <span className="font-bold">{signedInEmail || "current session"}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Business Name" value={form.businessName} onChange={updateField("businessName")} required />
            <Field label="Owner / Applicant Name" value={form.ownerName} onChange={updateField("ownerName")} required />
            <Field label="Phone" value={form.phone} onChange={updateField("phone")} required />
            <Field label="GSTIN" value={form.gstin} onChange={updateField("gstin")} />
            <Field label="PAN" value={form.pan} onChange={updateField("pan")} />
            <Field label="Registration Number" value={form.registrationNumber} onChange={updateField("registrationNumber")} />
            <Field label="Nature of Business" value={form.natureOfBusiness} onChange={updateField("natureOfBusiness")} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Address" value={form.address} onChange={updateField("address")} required className="sm:col-span-2" />
            <Field label="City" value={form.city} onChange={updateField("city")} required />
            <SelectField
              label="State"
              value={form.state}
              onChange={updateState}
              required
              disabled={districtsLoading || states.length === 0}
            >
              <option value="">{districtsLoading ? "Loading states..." : "Select state"}</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="District"
              value={form.districtId}
              onChange={updateField("districtId")}
              required
              disabled={districtsLoading || !form.state || districtOptions.length === 0}
            >
              <option value="">
                {form.state ? "Select district" : "Select state first"}
              </option>
              {districtOptions.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </SelectField>
            <Field label="PIN Code" value={form.pincode} onChange={updateField("pincode")} required />
          </div>

          {!districtsLoading && districts.length === 0 && (
            <p className="text-xs text-amber-700" role="status">
              No districts are configured in Supabase yet. Add rows to the districts table before creating business profiles.
            </p>
          )}
          {message && <p className="text-xs text-emerald-700" role="status">{message}</p>}
          {error && <p className="text-xs text-red-600" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={loading || districtsLoading || districts.length === 0}
            className="w-full sm:w-auto px-5 py-3 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              {loading ? "progress_activity" : "person_add"}
            </span>
            {loading ? "Registering..." : "Create Business Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({ label, className = "", ...props }) {
  return (
    <label className={`space-y-1.5 text-xs ${className}`}>
      <span className="font-semibold text-slate-700">{label}</span>
      <input
        {...props}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
      />
    </label>
  );
}

function SelectField({ label, className = "", children, ...props }) {
  return (
    <label className={`space-y-1.5 text-xs ${className}`}>
      <span className="font-semibold text-slate-700">{label}</span>
      <select
        {...props}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100 disabled:text-slate-500"
      >
        {children}
      </select>
    </label>
  );
}
