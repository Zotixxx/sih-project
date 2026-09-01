"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Badge from "@/components/ui/Badge";
import QRCodeModal from "@/components/ui/QRCodeModal";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

function InstrumentsContent() {
  const searchParams = useSearchParams();
  const initialStatusFilter = searchParams.get("status") || "ALL";
  const initialSearch = searchParams.get("search") || "";

  const { instruments, certificates, currentUser, userRole } = useMetrixStore();
  const isBusiness = userRole === "business" || currentUser?.role === "BUSINESS";
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Business isolation: Only see own instruments
  const userInstruments = useMemo(() => {
    if (isBusiness) {
      return (instruments || []).filter(
        (inst) =>
          inst.businessId === currentUser?.id ||
          inst.business_id === currentUser?.id ||
          inst.ownerName?.toLowerCase().includes(currentUser?.name?.toLowerCase()) ||
          inst.businessName?.toLowerCase().includes(currentUser?.businessName?.toLowerCase())
      );
    }
    return instruments || [];
  }, [instruments, isBusiness, currentUser]);

  // Filter instruments
  const filteredInstruments = useMemo(() => {
    return userInstruments.filter((inst) => {
      const matchSearch =
        search === "" ||
        inst.name.toLowerCase().includes(search.toLowerCase()) ||
        inst.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
        inst.id.toLowerCase().includes(search.toLowerCase()) ||
        inst.manufacturer.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" || inst.verificationStatus === statusFilter;

      const matchCategory =
        categoryFilter === "ALL" || inst.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [userInstruments, search, statusFilter, categoryFilter]);

  const categories = [
    "ALL",
    "Non-Automatic Weighing Instrument",
    "Automatic / Heavy Weighbridge",
    "Precision Laboratory Balance",
    "Liquid Fuel Measuring Instrument",
    "Automatic Gravimetric Filling Instrument",
  ];

  const handleOpenCertificate = (certId) => {
    const cert = certificates.find((c) => c.id === certId);
    if (cert) {
      setSelectedCert(cert);
      setIsQrModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Actions & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              My Instruments
            </h3>
            <p className="text-xs text-slate-500">
              Showing {filteredInstruments.length} registered commercial units
            </p>
          </div>

          <Link
            href="/instruments/new"
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            + Add Instrument
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by serial, model, ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="VERIFIED">Verified / Valid</option>
              <option value="EXPIRING_SOON">Expiring Soon (30 Days)</option>
              <option value="EXPIRED">Expired (Re-verification Required)</option>
              <option value="UNDER_VERIFICATION">Under Inspection</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white truncate"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "ALL" ? "All Instrument Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Instruments Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Instrument ID</th>
                <th className="py-3 px-4">Instrument &amp; Category</th>
                <th className="py-3 px-4">Make / Model</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Capacity / Class</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInstruments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No instruments found matching the specified filters.
                  </td>
                </tr>
              ) : (
                filteredInstruments.map((inst) => (
                  <tr
                    key={inst.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono-code font-bold text-slate-900">
                      {inst.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{inst.name}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        {inst.category}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-slate-800">{inst.manufacturer}</p>
                      <p className="text-[10px] text-slate-500">{inst.model}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono-code text-slate-700">
                      {inst.serialNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {inst.maxCapacity}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {inst.accuracyClass}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={inst.verificationStatus} />
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {formatDate(inst.validUntil)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedInstrument(inst)}
                        className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] transition-colors"
                      >
                        Details
                      </button>
                      {inst.certificateId && (
                        <button
                          onClick={() => handleOpenCertificate(inst.certificateId)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold transition-colors"
                          title="View Verification QR Code"
                        >
                          <span className="material-symbols-outlined text-[14px] align-middle">
                            qr_code
                          </span>
                        </button>
                      )}
                      <Link
                        href={`/applications/apply?instrumentId=${inst.id}`}
                        className="px-2.5 py-1 rounded bg-slate-900 text-white font-semibold text-[11px] hover:bg-slate-800 transition-colors inline-block"
                      >
                        Apply for Verification
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instrument Detail Slide-Over Drawer */}
      {selectedInstrument && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs"
            onClick={() => setSelectedInstrument(null)}
          />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-code font-bold uppercase text-slate-500">
                  {selectedInstrument.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedInstrument.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInstrument(null)}
                className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Status Header */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-[11px]">Current Status</p>
                  <div className="mt-1">
                    <Badge status={selectedInstrument.verificationStatus} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[11px]">Valid Until</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {formatDate(selectedInstrument.validUntil)}
                  </p>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500">
                  Technical Specifications
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[11px]">Category</span>
                    <p className="font-semibold text-slate-900">
                      {selectedInstrument.category}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Accuracy Class</span>
                    <p className="font-semibold text-slate-900">
                      {selectedInstrument.accuracyClass}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Manufacturer</span>
                    <p className="font-semibold text-slate-900">
                      {selectedInstrument.manufacturer}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Model</span>
                    <p className="font-semibold text-slate-900">
                      {selectedInstrument.model}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Serial Number</span>
                    <p className="font-mono-code font-bold text-slate-900">
                      {selectedInstrument.serialNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Max Capacity</span>
                    <p className="font-semibold text-slate-900">
                      {selectedInstrument.maxCapacity}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Verification Interval (e)</span>
                    <p className="font-semibold text-slate-900">
                      {selectedInstrument.verificationScaleInterval || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Installation Location</span>
                    <p className="font-semibold text-slate-900 truncate">
                      {selectedInstrument.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase Bill & Documents (Section 8, 10) */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500">
                  Supporting Purchase Document
                </h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                      receipt_long
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        {selectedInstrument.purchaseBill?.fileName || "Purchase_Bill_OEM_Invoice.pdf"}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {selectedInstrument.purchaseBill?.fileSize || "1.2 MB"} • Source: Instrument
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Attached
                  </span>
                </div>
              </div>

              {/* Verification & Stamping Officer */}
              {selectedInstrument.certificateId && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500">
                    Latest Verification Stamp
                  </h4>
                  <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Certificate ID</span>
                      <span className="font-mono-code font-bold text-slate-900">
                        {selectedInstrument.certificateId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Stamping Officer</span>
                      <span className="font-semibold text-slate-900">
                        {selectedInstrument.stampingOfficer}
                      </span>
                    </div>
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleOpenCertificate(selectedInstrument.certificateId)}
                        className="flex-1 py-1.5 rounded bg-emerald-700 text-white font-bold text-[11px] hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          qr_code
                        </span>
                        View Certificate QR
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
              <Link
                href={`/applications/apply?instrumentId=${selectedInstrument.id}`}
                className="flex-1 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs text-center hover:bg-slate-800 transition-colors"
              >
                Apply for Verification
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {selectedCert && (
        <QRCodeModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          certificate={selectedCert}
        />
      )}
    </div>
  );
}

export default function InstrumentsPage() {
  const { userRole, setUserRole } = useMetrixStore();

  React.useEffect(() => {
    // Ensure business persona when visiting My Instruments
    if (userRole !== "business") {
      setUserRole("business");
    }
  }, [userRole, setUserRole]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="My Instruments"
          subtitle="Registered commercial weighing and measuring instruments belonging to your establishment."
          breadcrumbs={[{ label: "MetriX", href: "/dashboard" }, { label: "Instruments" }]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading instruments...</div>}>
            <InstrumentsContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
