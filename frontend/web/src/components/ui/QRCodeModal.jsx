"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Modal from "./Modal";
import Badge from "./Badge";
import { formatDate } from "@/lib/utils";

export default function QRCodeModal({ isOpen, onClose, certificate }) {
  const [copied, setCopied] = useState(false);

  if (!certificate) return null;

  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${certificate.id}`
    : `https://metrix.gov.in/verify/${certificate.id}`;

  const copyVerificationLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Digital Certificate Verification QR"
      subtitle={`Certificate Ref: ${certificate.certificateNumber || certificate.id}`}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={copyVerificationLink}
            className="px-4 py-2 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? "check" : "content_copy"}
            </span>
            {copied ? "Link Copied!" : "Copy Verification URL"}
          </button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        {/* QR Code Container with High Precision Border */}
        <div className="p-4 bg-white rounded-xl border-2 border-slate-900 shadow-sm relative mb-4">
          <QRCodeSVG
            value={verifyUrl}
            size={200}
            level="H"
            includeMargin={false}
            imageSettings={{
              src: "/globe.svg",
              x: undefined,
              y: undefined,
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
          <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] uppercase font-mono-code font-bold tracking-widest text-slate-500">
            MetriX Secure Stamp
          </div>
        </div>

        {/* Certificate Metadata */}
        <div className="w-full bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Status</span>
            <Badge status={certificate.status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Instrument</span>
            <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">
              {certificate.instrumentName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Serial Number</span>
            <span className="font-mono-code font-bold text-slate-900">
              {certificate.serialNumber}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Valid Until</span>
            <span className="font-semibold text-slate-900">
              {formatDate(certificate.validUntil)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200">
            <span className="text-slate-500">SHA-256 Hash</span>
            <span className="font-mono-code text-[11px] text-slate-600 truncate max-w-[170px]">
              {certificate.securityHash}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-3">
          Consumers and enforcement officers can scan this QR code with any mobile camera to view the verified authoritative government record.
        </p>
      </div>
    </Modal>
  );
}
