"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Badge from "@/components/ui/Badge";
import QRCodeModal from "@/components/ui/QRCodeModal";
import Modal from "@/components/ui/Modal";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function CertificatesVaultPage() {
  const { certificates } = useMetrixStore();
  const [search, setSearch] = useState("");
  const [selectedCertForQr, setSelectedCertForQr] = useState(null);
  const [viewingCert, setViewingCert] = useState(null);

  const filteredCerts = useMemo(() => {
    return certificates.filter((cert) => {
      return (
        search === "" ||
        cert.id.toLowerCase().includes(search.toLowerCase()) ||
        cert.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
        cert.instrumentName.toLowerCase().includes(search.toLowerCase()) ||
        cert.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
        cert.officerName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [certificates, search]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Certificates Vault"
          subtitle="Centrally verified, cryptographically signed digital certificates issued under Legal Metrology Regulations."
          breadcrumbs={[
            { label: "MetriX", href: "/dashboard" },
            { label: "Certificates" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header & Search Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Authoritative Certificates Vault
              </h3>
              <p className="text-xs text-slate-500">
                {filteredCerts.length} active digital certificates on file
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search certificate ID, serial, make..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCerts.map((cert) => (
              <div
                key={cert.id}
                className="bg-white border-2 border-slate-200 hover:border-slate-400 rounded-xl p-5 shadow-2xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <span className="text-[10px] font-mono-code font-bold uppercase text-slate-500">
                        {cert.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {cert.instrumentName}
                      </h4>
                    </div>
                    <Badge status={cert.status} />
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Certificate No:</span>
                      <span className="font-mono-code font-semibold text-slate-800">
                        {cert.certificateNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Serial Number:</span>
                      <span className="font-mono-code font-bold text-slate-900">
                        {cert.serialNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Capacity / Make:</span>
                      <span className="font-semibold text-slate-800">
                        {cert.manufacturer}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Verified Date:</span>
                      <span className="text-slate-800">
                        {formatDate(cert.validFrom)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Valid Until:</span>
                      <span className="font-bold text-emerald-800">
                        {formatDate(cert.validUntil)}
                      </span>
                    </div>
                  </div>

                  {/* Mini SHA Hash */}
                  <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-100 text-[10px]">
                    <span className="text-slate-400 block font-bold">
                      SHA-256 INTEGRITY HASH
                    </span>
                    <span className="font-mono-code text-slate-600 truncate block">
                      {cert.securityHash}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setViewingCert(cert)}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      visibility
                    </span>
                    View &amp; Print PDF
                  </button>
                  <button
                    onClick={() => setSelectedCertForQr(cert)}
                    className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-colors"
                    title="Open Verifiable QR Code"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      qr_code
                    </span>
                  </button>
                  <Link
                    href={`/verify/${cert.id}`}
                    className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-emerald-700 transition-colors"
                    title="Test Public Verification URL"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      open_in_new
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* High-Trust Printable Certificate Modal */}
      {viewingCert && (
        <Modal
          isOpen={Boolean(viewingCert)}
          onClose={() => setViewingCert(null)}
          title="Official Government Verification Certificate"
          subtitle={`Act 2009 • Stamped Reference: ${viewingCert.certificateNumber}`}
          maxWidth="max-w-3xl"
          footer={
            <>
              <button
                onClick={() => setViewingCert(null)}
                className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 text-xs font-bold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">
                  print
                </span>
                Print Official Certificate
              </button>
            </>
          }
        >
          {/* Official Printable Certificate Slab */}
          <div
            id="printable-certificate"
            className="border-4 border-double border-slate-900 p-6 sm:p-8 bg-white rounded-lg relative overflow-hidden"
          >
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <span className="material-symbols-outlined text-[300px]">
                balance
              </span>
            </div>

            {/* Header Stamp */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
                GOVERNMENT OF NCT OF DELHI
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase mt-0.5">
                Directorate of Legal Metrology
              </h2>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                Certificate of Verification &amp; Stamping under Legal Metrology Act, 2009
              </p>
              <div className="mt-2 inline-block px-3 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-mono-code font-bold text-slate-900">
                CERTIFICATE ID: {viewingCert.certificateNumber}
              </div>
            </div>

            {/* Content Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
              <div className="space-y-2 p-4 bg-slate-50 rounded border border-slate-200">
                <p className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                  1. Instrument Details
                </p>
                <p>
                  <span className="text-slate-500">Name / Description:</span>{" "}
                  <strong className="text-slate-900">{viewingCert.instrumentName}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Manufacturer &amp; Model:</span>{" "}
                  <strong className="text-slate-900">{viewingCert.manufacturer} ({viewingCert.model})</strong>
                </p>
                <p>
                  <span className="text-slate-500">Serial Number:</span>{" "}
                  <strong className="font-mono-code text-slate-900">{viewingCert.serialNumber}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Maximum Capacity:</span>{" "}
                  <strong className="text-slate-900">{viewingCert.capacity}</strong>
                </p>
              </div>

              <div className="space-y-2 p-4 bg-slate-50 rounded border border-slate-200">
                <p className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                  2. Owner &amp; Operating Location
                </p>
                <p>
                  <span className="text-slate-500">Registered Owner:</span>{" "}
                  <strong className="text-slate-900">{viewingCert.ownerName}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Location of Use:</span>{" "}
                  <strong className="text-slate-900">{viewingCert.location}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Statutory Seal Reference:</span>{" "}
                  <strong className="font-mono-code text-slate-900">{viewingCert.sealNumber}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Standards Used:</span>{" "}
                  <strong className="text-slate-900">{viewingCert.verificationStandardsUsed}</strong>
                </p>
              </div>
            </div>

            {/* Validity Declaration */}
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded text-xs space-y-1 mb-6">
              <p className="font-bold text-emerald-950">
                Statutory Validity Certification:
              </p>
              <p className="text-emerald-900 leading-relaxed">
                This certifies that the weighing/measuring instrument described above has been thoroughly inspected and verified against the applicable tolerances under the Legal Metrology (General) Rules, 2011.
              </p>
              <div className="flex flex-wrap items-center justify-between pt-2 text-xs font-bold text-emerald-950">
                <span>Verified On: {formatDate(viewingCert.validFrom)}</span>
                <span className="text-emerald-800 underline">
                  VALID UNTIL: {formatDate(viewingCert.validUntil)}
                </span>
              </div>
            </div>

            {/* Footer QR & Authority Signature */}
            <div className="pt-4 border-t-2 border-slate-900 flex items-end justify-between">
              {/* QR Code */}
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white border border-slate-900 rounded">
                  <QRCodeSVG
                    value={
                      typeof window !== "undefined"
                        ? `${window.location.origin}/verify/${viewingCert.id}`
                        : `https://metrix.gov.in/verify/${viewingCert.id}`
                    }
                    size={72}
                    level="H"
                  />
                </div>
                <div className="text-[10px] text-slate-500">
                  <p className="font-bold uppercase text-slate-800">
                    Scan to Verify Online
                  </p>
                  <p className="font-mono-code text-[9px]">
                    Hash: {viewingCert.securityHash?.slice(0, 16)}...
                  </p>
                </div>
              </div>

              {/* Officer Signature */}
              <div className="text-right">
                <div className="font-mono-code text-[11px] text-slate-400 italic mb-1">
                  [DIGITALLY SIGNED &amp; SEALED]
                </div>
                <p className="font-bold text-sm text-slate-900">
                  {viewingCert.officerName}
                </p>
                <p className="text-[10px] text-slate-600">
                  {viewingCert.officerDesignation}
                </p>
                <p className="text-[10px] font-semibold text-slate-500">
                  {viewingCert.issuingAuthority}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* QR Modal */}
      {selectedCertForQr && (
        <QRCodeModal
          isOpen={Boolean(selectedCertForQr)}
          onClose={() => setSelectedCertForQr(null)}
          certificate={selectedCertForQr}
        />
      )}
    </div>
  );
}
