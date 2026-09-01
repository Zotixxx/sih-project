"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function FreshApplicationsPage() {
  const router = useRouter();
  const {
    applications,
    lmos,
    currentUser,
    district,
    acceptApplication,
    rejectApplication,
    assignLmo,
  } = useMetrixStore();

  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectingApp, setRejectingApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [assigningApp, setAssigningApp] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [scheduledDate, setScheduledDate] = useState("2026-09-04");
  const [scheduledTime, setScheduledTime] = useState("11:30 AM");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fresh applications requiring initial review (SUBMITTED / UNDER_REVIEW)
  const freshApps = useMemo(() => {
    return (applications || [])
      .filter((a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW")
      .filter((a) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          a.id.toLowerCase().includes(q) ||
          a.businessName.toLowerCase().includes(q) ||
          a.instrumentName.toLowerCase().includes(q) ||
          a.serialNumber?.toLowerCase().includes(q)
        );
      });
  }, [applications, search]);

  // Handle Reject
  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingApp || !rejectionReason.trim()) return;
    setIsProcessing(true);
    try {
      await rejectApplication(rejectingApp.id, rejectionReason.trim());
      setRejectingApp(null);
      setRejectionReason("");
      setSelectedApp(null);
    } catch (err) {
      alert("Error rejecting application: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Accept & Assign LMO (Combined step)
  const handleConfirmAcceptAndAssign = async (e) => {
    e.preventDefault();
    if (!assigningApp) return;
    const districtLmos = (lmos || []).filter(
      (l) => !l.district_id || l.district_id === assigningApp.district_id
    );
    const officerId = selectedOfficer || districtLmos[0]?.officerId || districtLmos[0]?.id;
    if (!officerId) {
      alert("Please select a field LMO from this district.");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Accept application (moves to ACCEPTED, does NOT generate certificate)
      await acceptApplication(assigningApp.id);
      // 2. Assign LMO (moves to SCHEDULED, creates inspection)
      await assignLmo({
        applicationId: assigningApp.id,
        officerId,
        scheduledDate,
        scheduledTime,
      });
      setAssigningApp(null);
      setSelectedApp(null);
    } catch (err) {
      alert("Error accepting and assigning application: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const districtName = district?.name || currentUser?.districtName || "Ajmer";

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Fresh Applications"
          subtitle={`Review new verification filings for ${districtName} District • Accept & Assign LMO or Reject with reason.`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Fresh Applications" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Overview & Search Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                New Applications Needing Review
                <span className="px-2 py-0.5 rounded-full text-xs font-mono-code font-bold bg-amber-100 text-amber-900">
                  {freshApps.length} Pending
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Applications submitted by businesses in {districtName} requiring Assistant Controller scrutiny.
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
                placeholder="Search by ID, business, instrument..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            {freshApps.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs space-y-3">
                <span className="material-symbols-outlined text-[40px] text-slate-300 block">
                  task_alt
                </span>
                <p className="font-bold text-slate-700 text-sm">All Fresh Applications Reviewed</p>
                <p className="text-slate-500">There are no new applications waiting for initial review in this district.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Application ID</th>
                      <th className="py-3 px-4">Business</th>
                      <th className="py-3 px-4">Instrument</th>
                      <th className="py-3 px-4">Submitted Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {freshApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono-code font-bold text-slate-900">
                          {app.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{app.businessName}</span>
                          <span className="text-[11px] text-slate-500">{app.applicantName}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 block">{app.instrumentName}</span>
                          <span className="text-[11px] text-slate-500 font-mono-code">S/N: {app.serialNumber}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(app.submissionDate || app.applicationDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={app.status} className="text-[10px]" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                            >
                              Review Details
                            </button>
                            <button
                              onClick={() => {
                                setAssigningApp(app);
                                setSelectedOfficer("");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-2xs"
                            >
                              Accept &amp; Assign LMO
                            </button>
                            <button
                              onClick={() => setRejectingApp(app)}
                              className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors"
                              title="Reject Application"
                            >
                              Reject
                            </button>
                          </div>
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

      {/* Review Details Modal */}
      {selectedApp && (
        <Modal
          isOpen={Boolean(selectedApp)}
          onClose={() => setSelectedApp(null)}
          title={`Application Details: ${selectedApp.id}`}
          subtitle={`${selectedApp.businessName} • ${selectedApp.instrumentName}`}
          maxWidth="max-w-3xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingApp(selectedApp);
                    setSelectedApp(null);
                  }}
                  className="px-3 py-2 text-xs font-bold rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAssigningApp(selectedApp);
                    setSelectedApp(null);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  Accept &amp; Assign LMO
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
            {/* Applicant & Business */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Business Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedApp.businessName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant / Proprietor</span>
                <span className="font-semibold text-slate-800">{selectedApp.applicantName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Info</span>
                <span className="text-slate-700 block">{selectedApp.phone}</span>
                <span className="text-slate-500 text-[10px]">{selectedApp.email}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Establishment Address</span>
                <span className="text-slate-700">{selectedApp.address}, {selectedApp.district}, Rajasthan - {selectedApp.pincode}</span>
              </div>
            </div>

            {/* Instrument Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Instrument Type</span>
                <span className="font-bold text-slate-900">{selectedApp.instrumentName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Serial Number</span>
                <span className="font-mono-code font-bold text-slate-900">{selectedApp.serialNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Manufacturer</span>
                <span className="text-slate-700">{selectedApp.manufacturer || "Standard Certified"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Capacity / Class</span>
                <span className="text-slate-700">{selectedApp.capacity || "N/A"}</span>
              </div>
            </div>

            {/* Documents & Photos */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Uploaded Documents</span>
              <div className="flex flex-wrap gap-2">
                {(selectedApp.documents || []).map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 text-xs">
                    <span className="material-symbols-outlined text-[16px] text-blue-700">description</span>
                    <span className="font-semibold text-slate-800">{doc.name}</span>
                    <span className="text-[10px] text-slate-400">({doc.size})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Accept & Assign LMO Modal */}
      {assigningApp && (
        <Modal
          isOpen={Boolean(assigningApp)}
          onClose={() => setAssigningApp(null)}
          title="Accept Application &amp; Assign LMO"
          subtitle={`Application: ${assigningApp.id} • ${assigningApp.businessName}`}
          maxWidth="max-w-md"
          footer={
            <>
              <button
                type="button"
                onClick={() => setAssigningApp(null)}
                className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAcceptAndAssign}
                disabled={isProcessing}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Accept & Assign LMO"}
              </button>
            </>
          }
        >
          <form onSubmit={handleConfirmAcceptAndAssign} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-950 text-[11px] leading-relaxed">
              Accepting this application confirms initial scrutiny. The selected Field Officer will be dispatched to perform physical testing and stamping. <strong>No certificate is generated at this stage.</strong>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800">
                Select Field LMO ({assigningApp.district || districtName} District) *
              </label>
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white"
                required
              >
                <option value="">-- Choose Field Officer --</option>
                {(lmos || [])
                  .filter((lmo) => !lmo.district_id || lmo.district_id === assigningApp.district_id)
                  .map((lmo) => (
                    <option key={lmo.officerId || lmo.id} value={lmo.officerId || lmo.id}>
                      {lmo.name} ({lmo.officerId || lmo.badgeNumber || lmo.id}) — {lmo.jurisdiction}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Scheduled Date *</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Time Slot *</label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  <option>10:00 AM</option>
                  <option>11:30 AM</option>
                  <option>02:00 PM</option>
                  <option>04:00 PM</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Reject Application Modal */}
      {rejectingApp && (
        <Modal
          isOpen={Boolean(rejectingApp)}
          onClose={() => setRejectingApp(null)}
          title="Reject Application"
          subtitle={`Application: ${rejectingApp.id} • ${rejectingApp.businessName}`}
          maxWidth="max-w-md"
          footer={
            <>
              <button
                type="button"
                onClick={() => setRejectingApp(null)}
                className="px-4 py-2 text-xs font-semibold rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-rose-700 text-white hover:bg-rose-800 transition-colors shadow-2xs disabled:opacity-50"
              >
                {isProcessing ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </>
          }
        >
          <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Enter the reason why this application is being rejected. This note will be sent to the business applicant.
            </p>
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Rejection Reason *</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Incomplete proof of ownership or invalid test certificates attached..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-600"
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
