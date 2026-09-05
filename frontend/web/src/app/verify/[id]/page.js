"use client";
import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import PublicHeader from "@/components/layout/PublicHeader";
import StatTicker from "@/components/shared/StatTicker";
import Badge from "@/components/ui/Badge";
import { metrixApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function CertificateVerificationResultPage({ params }) {
  const unwrappedParams = use(params);
  const certId = decodeURIComponent(unwrappedParams.id);

  const [apiCert, setApiCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadPublicCert() {
      try {
        const res = await metrixApi.getPublicCertificate(certId);
        if (isMounted && res?.data) {
          setApiCert(res.data);
        }
      } catch (err) {
        console.warn("Public verification request failed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPublicCert();
    return () => {
      isMounted = false;
    };
  }, [certId]);

  const certificate = apiCert;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      <div>
        <PublicHeader />
        <StatTicker />

        <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center space-y-3">
              <span className="material-symbols-outlined text-[40px] text-slate-400 animate-pulse">
                progress_activity
              </span>
              <h1 className="text-xl font-bold text-slate-900">Checking Certificate</h1>
              <p className="text-sm text-slate-500">Retrieving the live verification record.</p>
            </div>
          ) : certificate ? (
            /* FOUND CERTIFICATE */
            <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden">
              {/* Status Header Banner */}
              <div
                className={`p-6 sm:p-8 text-center border-b-2 border-slate-900 ${
                  certificate.status === "VALID"
                    ? "bg-emerald-600 text-white"
                    : certificate.status === "EXPIRING_SOON"
                    ? "bg-amber-500 text-slate-900"
                    : "bg-rose-600 text-white"
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-[36px] text-white">
                    {certificate.status === "VALID"
                      ? "verified"
                      : certificate.status === "EXPIRING_SOON"
                      ? "warning"
                      : "error"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  {certificate.status === "VALID"
                    ? "Official Certificate Verified"
                    : certificate.status === "EXPIRING_SOON"
                    ? "Certificate Expiring Soon"
                    : "Certificate Expired"}
                </h1>
                <p className="text-xs sm:text-sm font-medium mt-1 opacity-90">
                  Authoritative record retrieved from the Legal Metrology certificate registry.
                </p>
              </div>

              {/* Certificate Details */}
              <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
                {/* ID & Status */}
                <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
                  <div>
                    <span className="text-slate-500 text-xs">Certificate Number</span>
                    <p className="font-mono-code font-extrabold text-base text-slate-900 mt-0.5">
                      {certificate.certificateNumber}
                    </p>
                  </div>
                  <Badge status={certificate.status} className="text-xs px-3 py-1" />
                </div>

                {/* Instrument Specifications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 text-xs font-semibold">
                      Instrument Name
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {certificate.instrumentName}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs font-semibold">
                      Serial Number
                    </span>
                    <p className="font-mono-code font-bold text-slate-900 mt-0.5">
                      {certificate.serialNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs font-semibold">
                      Manufacturer / Model
                    </span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {certificate.manufacturer} ({certificate.model})
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs font-semibold">
                      Capacity
                    </span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {certificate.capacity}
                    </p>
                  </div>
                </div>

                {/* Ownership & Location */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registered Business:</span>
                    <span className="font-bold text-slate-900 text-right">
                      {certificate.ownerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operating Premises:</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {certificate.location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Official Seal Stamped:</span>
                    <span className="font-mono-code font-bold text-slate-900">
                      {certificate.sealNumber}
                    </span>
                  </div>
                </div>

                {/* Validity Period */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div>
                    <span className="text-emerald-800 text-xs font-semibold">
                      Verification Date
                    </span>
                    <p className="font-bold text-emerald-950 mt-0.5">
                      {formatDate(certificate.validFrom)}
                    </p>
                  </div>
                  <div>
                    <span className="text-emerald-800 text-xs font-semibold">
                      Valid Until
                    </span>
                    <p className="font-extrabold text-base text-emerald-950 mt-0.5">
                      {formatDate(certificate.validUntil)}
                    </p>
                  </div>
                </div>

                {/* Officer & Integrity Hash */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-slate-400 uppercase font-bold">
                      Issuing Authority
                    </span>
                    <p className="font-bold text-slate-900">
                      {certificate.verifyingOfficer || certificate.approvingOfficer}
                    </p>
                    <p className="text-xs text-slate-500">
                      {certificate.approvingOfficer ? `${certificate.approvingOfficer} • ` : ""}
                      {certificate.issuingAuthority}
                    </p>
                  </div>

                  <div className="p-2 bg-slate-50 rounded border border-slate-200 text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono-code font-bold block">
                      SHA-256 Checksum
                    </span>
                    <span className="font-mono-code text-xs text-slate-700 font-bold">
                      {certificate.securityHash}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/verify"
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  ← Verify Another Instrument
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Portal Login
                </Link>
              </div>
            </div>
          ) : (
            /* NOT FOUND STATE */
            <div className="bg-white rounded-2xl border-2 border-rose-300 shadow-xl p-8 sm:p-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[36px]">
                  warning
                </span>
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Certificate Record Not Found
                </h1>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  No verified statutory record was found matching ID{" "}
                  <span className="font-mono-code font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {certId}
                  </span>
                  . This instrument may be unverified, counterfeit, or misregistered.
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 max-w-md mx-auto text-left space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <span className="material-symbols-outlined text-[16px]">
                    info
                  </span>
                  Consumer Advisory:
                </p>
                <p className="text-[11px] leading-relaxed">
                  Under the Legal Metrology Act, 2009, transactions conducted using unverified or unstamped weights and measures are subject to regulatory penalties.
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <Link
                  href="/verify"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Verification Information
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 Directorate of Legal Metrology • Real-Time Public Verification Engine
      </footer>
    </div>
  );
}
