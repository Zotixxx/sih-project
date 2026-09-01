"use client";

import React from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import Modal from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

export default function CertificatePreviewModal({ certificate, isOpen, onClose }) {
  if (!certificate) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const verificationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${certificate.id || certificate.certificateNumber}`
      : `http://localhost:3000/verify/${certificate.id || certificate.certificateNumber}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Government Verification Certificate"
      subtitle={`Legal Metrology Act, 2009 • Sanction ID: ${certificate.certificateNumber || certificate.id}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Link
            href={`/verify/${certificate.id || certificate.certificateNumber}`}
            target="_blank"
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            Open Verification Link
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print Official Certificate
            </button>
          </div>
        </div>
      }
    >
      {/* Official Government Printable Certificate Slab */}
      <div
        id="printable-certificate"
        className="border-4 border-double border-slate-900 p-6 sm:p-8 bg-white rounded-lg relative overflow-hidden"
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <span className="material-symbols-outlined text-[280px]">
            balance
          </span>
        </div>

        {/* Header Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
            GOVERNMENT OF RAJASTHAN
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase mt-0.5">
            Directorate of Legal Metrology
          </h2>
          <p className="text-xs font-semibold text-slate-700 mt-1">
            Certificate of Verification &amp; Stamping under Legal Metrology Act, 2009
          </p>
          <div className="mt-2 inline-block px-3 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-mono-code font-bold text-slate-900">
            CERTIFICATE NUMBER: {certificate.officialNumber || certificate.certificateNumber || certificate.id}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
          <div className="space-y-2 p-4 bg-slate-50 rounded border border-slate-200">
            <p className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              1. Instrument Description
            </p>
            <p>
              <span className="text-slate-500">Name:</span>{" "}
              <strong className="text-slate-900">{certificate.instrumentName}</strong>
            </p>
            <p>
              <span className="text-slate-500">Maker &amp; Model:</span>{" "}
              <strong className="text-slate-900">{certificate.manufacturer} ({certificate.model || "Standard"})</strong>
            </p>
            <p>
              <span className="text-slate-500">Serial Number:</span>{" "}
              <strong className="font-mono-code text-slate-900">{certificate.serialNumber}</strong>
            </p>
            <p>
              <span className="text-slate-500">Capacity &amp; Interval:</span>{" "}
              <strong className="text-slate-900">{certificate.capacity}</strong>
            </p>
          </div>

          <div className="space-y-2 p-4 bg-slate-50 rounded border border-slate-200">
            <p className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              2. Registered Premises &amp; Seal
            </p>
            <p>
              <span className="text-slate-500">Registered Business:</span>{" "}
              <strong className="text-slate-900">{certificate.ownerName}</strong>
            </p>
            <p>
              <span className="text-slate-500">Premises:</span>{" "}
              <strong className="text-slate-900">{certificate.businessAddress || "Ajmer, Rajasthan"}</strong>
            </p>
            <p>
              <span className="text-slate-500">Statutory Seal Number:</span>{" "}
              <strong className="font-mono-code text-emerald-900">{certificate.sealNumber}</strong>
            </p>
            <p>
              <span className="text-slate-500">Issuing Authority:</span>{" "}
              <strong className="text-slate-900">{certificate.issuingAuthority || "Directorate of Legal Metrology, Rajasthan"}</strong>
            </p>
          </div>
        </div>

        {/* Statutory Validity Declaration */}
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded text-xs space-y-1 mb-6">
          <p className="font-bold text-emerald-950">
            Statutory Stamping &amp; Validity Sanction:
          </p>
          <p className="text-emerald-900 leading-relaxed text-[11px]">
            This certifies that the weighing/measuring instrument described above has been physically verified against working standards and sealed in compliance with Schedule VII of the Legal Metrology (General) Rules.
          </p>
          <div className="flex flex-wrap items-center justify-between pt-2 text-xs font-bold text-emerald-950">
            <span>Verified Date: {formatDate(certificate.validFrom || certificate.verificationDate)}</span>
            <span className="text-emerald-900 font-mono-code text-sm">
              VALID UNTIL: {formatDate(certificate.validUntil)}
            </span>
          </div>
        </div>

        {/* Footer QR & Authority Signature */}
        <div className="pt-4 border-t-2 border-slate-900 flex items-end justify-between">
          {/* QR Code */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white border border-slate-900 rounded">
              <QRCodeSVG
                value={verificationUrl}
                size={72}
                level="H"
              />
            </div>
            <div className="text-[10px] text-slate-500">
              <p className="font-bold uppercase text-slate-800">
                Scan for Public Verification
              </p>
              <p className="font-mono-code text-[9px]">
                Hash: {certificate.securityHash?.slice(0, 18)}...
              </p>
            </div>
          </div>

          {/* Officers Signatures */}
          <div className="text-right">
            <div className="font-mono-code text-[10px] text-slate-400 italic mb-1">
              [DIGITALLY SANCTIONED &amp; SEALED]
            </div>
            <p className="font-bold text-xs text-slate-900">
              {certificate.approvingOfficer || "Dr. R. K. Sharma (Assistant Controller)"}
            </p>
            <p className="text-[10px] text-slate-600">
              Verifying LMO: {certificate.verifyingOfficer}
            </p>
            <p className="text-[10px] font-semibold text-slate-500">
              Ajmer District, Government of Rajasthan
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
