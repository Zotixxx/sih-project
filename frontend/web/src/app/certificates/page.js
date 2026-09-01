"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Badge from "@/components/ui/Badge";
import QRCodeModal from "@/components/ui/QRCodeModal";
import CertificatePreviewModal from "@/components/certificates/CertificatePreviewModal";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { exportToCSV } from "@/lib/exportUtils";

export default function CertificatesPage() {
  const { certificates, userRole, currentUser, district } = useMetrixStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCertForQr, setSelectedCertForQr] = useState(null);
  const [viewingCert, setViewingCert] = useState(null);

  // Business Certificates: Filter to logged-in business
  const businessCertificates = useMemo(() => {
    return (certificates || [])
      .filter((cert) => {
        if (currentUser?.role === "BUSINESS") {
          return (
            cert.business_id === currentUser.id ||
            cert.businessId === currentUser.id ||
            cert.ownerName?.toLowerCase().includes(currentUser.name?.toLowerCase()) ||
            cert.ownerName?.toLowerCase().includes(currentUser.businessName?.toLowerCase())
          );
        }
        return true;
      })
      .filter((cert) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          cert.id?.toLowerCase().includes(q) ||
          cert.certificateNumber?.toLowerCase().includes(q) ||
          cert.instrumentName?.toLowerCase().includes(q) ||
          cert.serialNumber?.toLowerCase().includes(q) ||
          cert.verifyingOfficer?.toLowerCase().includes(q) ||
          cert.sealNumber?.toLowerCase().includes(q)
        );
      });
  }, [certificates, currentUser, searchQuery]);

  // Access guard for LMO
  if (userRole === "lmo") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex">
        <SideNavBar />
        <div className="flex-1 ml-[260px] flex flex-col min-w-0">
          <TopNavBar
            title="Certificates"
            subtitle="Access Restricted • Reserved for Registered Businesses and District Administration."
            breadcrumbs={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Certificates" },
            ]}
          />
          <main className="p-12 max-w-xl mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
              <span className="material-symbols-outlined text-[36px]">lock</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Certificates Unavailable for LMO Duty
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Field officers conduct physical inspections and record test measurements. Official certificates are issued to businesses upon Assistant Controller approval.
            </p>
            <div className="pt-2">
              <Link
                href="/inspections"
                className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors inline-block shadow-2xs"
              >
                Go to Assigned Inspections
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleExportCSV = () => {
    const data = businessCertificates.map((c) => ({
      "Certificate ID": c.certificateNumber || c.id,
      "Instrument": c.instrumentName,
      "Serial Number": c.serialNumber,
      "Business": c.ownerName,
      "Verification Date": c.verificationDate,
      "Valid Until": c.validUntil,
      "Status": c.status,
      "Seal Number": c.sealNumber,
    }));
    exportToCSV(`My_Certificates_${new Date().toISOString().split("T")[0]}.csv`, data);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Certificates"
          subtitle="Official Legal Metrology Verification Certificates issued for your weighing and measuring instruments."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Certificates" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Card with Search & Export */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                My Certificates
                <span className="px-2 py-0.5 rounded-full text-xs font-mono-code font-bold bg-emerald-100 text-emerald-900">
                  {businessCertificates.length} Certificates
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Statically stamped and digitally authenticated verification certificates.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Certificate ID, instrument..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                />
              </div>
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Export
              </button>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            {businessCertificates.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs space-y-3">
                <span className="material-symbols-outlined text-[40px] text-slate-300 block">
                  verified
                </span>
                <p className="font-bold text-slate-700 text-sm">No Certificates Found</p>
                <p className="text-slate-500">No verification certificates matching your filter were found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Certificate ID</th>
                      <th className="py-3 px-4">Instrument</th>
                      <th className="py-3 px-4">Verification Date</th>
                      <th className="py-3 px-4">Valid Until</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">QR Code</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {businessCertificates.map((cert) => (
                      <tr key={cert.id || cert.certificateNumber} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono-code font-bold text-slate-900">
                          {cert.certificateNumber || cert.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{cert.instrumentName}</span>
                          <span className="text-[11px] text-slate-500 font-mono-code">S/N: {cert.serialNumber}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(cert.verificationDate)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(cert.validUntil)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={cert.status} className="text-[10px]" />
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setSelectedCertForQr(cert)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                            title="View Public QR Code"
                          >
                            <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setViewingCert(cert)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[15px]">visibility</span>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* QR Code Modal */}
      {selectedCertForQr && (
        <QRCodeModal
          isOpen={Boolean(selectedCertForQr)}
          onClose={() => setSelectedCertForQr(null)}
          certificate={selectedCertForQr}
        />
      )}

      {/* Certificate Preview Modal */}
      {viewingCert && (
        <CertificatePreviewModal
          certificate={viewingCert}
          isOpen={Boolean(viewingCert)}
          onClose={() => setViewingCert(null)}
        />
      )}
    </div>
  );
}
