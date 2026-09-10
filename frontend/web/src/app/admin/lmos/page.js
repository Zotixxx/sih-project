"use client";

import React, { useEffect, useMemo, useState } from "react";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Modal from "@/components/ui/Modal";
import { metrixApi } from "@/lib/api";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

const statusClass = (status) =>
  status === "INACTIVE"
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

const emptyCreateLmoForm = {
  officerName: "",
  email: "",
  temporaryPassword: "",
  phone: "",
  badgeNumber: "",
  designation: "Legal Metrology Officer",
  jurisdiction: "",
};

const DetailRow = ({ label, value, mono = false }) => (
  <div className="space-y-1">
    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{label}</span>
    <p className={`text-xs font-semibold text-slate-900 ${mono ? "font-mono-code break-all" : ""}`}>
      {value || "Not recorded"}
    </p>
  </div>
);

const getInitialSearch = () => {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("search") || "";
};

export default function LmosManagementPage() {
  const { currentUser } = useMetrixStore();
  if (currentUser?.role === "SYSTEM_ADMIN") return <SystemAdminLmoDirectory />;
  return <AssistantControllerLmoDirectory />;
}

function SystemAdminLmoDirectory() {
  const { currentUser } = useMetrixStore();
  const [initialSearch] = useState(getInitialSearch);
  const [districts, setDistricts] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [districtId, setDistrictId] = useState("");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(Boolean(initialSearch));
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const runSearch = async (page = 1, overrideFilters = { search, districtId, status }) => {
    setLoading(true);
    setError("");
    try {
      const res = await metrixApi.searchAdminLmos({
        ...overrideFilters,
        page,
        limit: 25,
      });
      setResults(res.data?.items || []);
      setMeta(res.data || null);
    } catch (err) {
      setError(err.message || "LMO search failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    metrixApi
      .getPublicDistricts()
      .then((res) => {
        if (mounted) setDistricts(res.data || []);
      })
      .catch(() => {
        if (mounted) setError("District list could not be loaded.");
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!initialSearch) return undefined;
    let mounted = true;
    metrixApi
      .searchAdminLmos({
        search: initialSearch,
        districtId: "",
        status: "",
        page: 1,
        limit: 25,
      })
      .then((res) => {
        if (!mounted) return;
        setResults(res.data?.items || []);
        setMeta(res.data || null);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "LMO search failed.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [initialSearch]);

  const openDetails = async (id) => {
    setDetailLoading(true);
    setError("");
    try {
      const res = await metrixApi.getAdminLmo(id);
      setSelected(res.data);
    } catch (err) {
      setError(err.message || "LMO details could not be loaded.");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="LMOs"
          subtitle="Search field officers by name, identifier, or district"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "LMOs" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">LMO Directory</h2>
              <p className="text-xs text-slate-500">
                Signed in as {currentUser?.email || currentUser?.name || "System Admin"}
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                runSearch(1);
              }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs"
            >
              <div className="lg:col-span-5">
                <label className="font-semibold text-slate-700 block mb-1.5">Search</label>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, LMO identifier, badge, email"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="lg:col-span-3">
                <label className="font-semibold text-slate-700 block mb-1.5">District</label>
                <select
                  value={districtId}
                  onChange={(event) => setDistrictId(event.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  <option value="">Any district</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}, {district.state}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  <option value="">Any</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="lg:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-60 transition-colors"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </form>
          </div>

          {error && (
            <div className="border border-rose-200 bg-rose-50 text-rose-700 rounded-lg px-4 py-3 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Search Results</h3>
              {meta && (
                <span className="text-[11px] text-slate-500">
                  {meta.total === null ? `${results.length} shown` : `${meta.total || 0} matching`}
                </span>
              )}
            </div>

            {!meta ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Search by LMO name, identifier, badge, email, or district.
              </div>
            ) : loading ? (
              <div className="p-12 text-center text-xs text-slate-500">Searching LMOs...</div>
            ) : results.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">No LMOs found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Officer</th>
                      <th className="px-4 py-3">District</th>
                      <th className="px-4 py-3">Assigned AC</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((lmo) => (
                      <tr key={lmo.uuid} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{lmo.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono-code">
                            {lmo.lmoId} • {lmo.badgeNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{lmo.district?.name || lmo.districtId}</span>
                          <span className="text-[11px] text-slate-500">{lmo.district?.state || lmo.districtId}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-900 block">
                            {lmo.assignedAssistantController?.officerName || "Not assigned"}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {lmo.assignedAssistantController?.accountEmail || ""}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusClass(lmo.status)}`}>
                            {lmo.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openDetails(lmo.uuid)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors"
                          >
                            {detailLoading ? "Loading..." : "View"}
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

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? selected.name : "LMO"}
        subtitle={selected ? `${selected.lmoId} • ${selected.district?.name || selected.districtId}` : ""}
        maxWidth="max-w-3xl"
      >
        {selected && (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <DetailRow label="Name" value={selected.name} />
              <DetailRow label="LMO ID" value={selected.lmoId} mono />
              <DetailRow label="Badge" value={selected.badgeNumber} mono />
              <DetailRow label="District" value={`${selected.district?.name || selected.districtId}${selected.district?.state ? `, ${selected.district.state}` : ""}`} />
              <DetailRow label="Designation" value={selected.designation} />
              <DetailRow label="Status" value={selected.status} />
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="Phone" value={selected.phone} />
              <DetailRow label="Jurisdiction" value={selected.jurisdiction} />
              <DetailRow label="Auth User UUID" value={selected.authUserId} mono />
              <DetailRow label="Created" value={formatDate(selected.createdAt)} />
              <DetailRow label="Updated" value={formatDate(selected.updatedAt)} />
            </div>

            <div className="border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailRow label="Assigned Assistant Controller" value={selected.assignedAssistantController?.officerName} />
              <DetailRow label="AC Account" value={selected.assignedAssistantController?.accountEmail} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AssistantControllerLmoDirectory() {
  const { lmos, currentUser, district, createLmo } = useMetrixStore();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateLmoForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const districtLabel = district?.name || currentUser?.districtName || currentUser?.district_id || "District";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (lmos || []).filter((lmo) => {
      if (!q) return true;
      return [lmo.name, lmo.officerName, lmo.lmoId, lmo.lmo_id, lmo.officerId, lmo.jurisdiction, lmo.email, lmo.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [lmos, search]);

  const openCreate = () => {
    setError("");
    setNotice("");
    setCreateForm(emptyCreateLmoForm);
    setCreateOpen(true);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const created = await createLmo({
        officerName: createForm.officerName.trim(),
        email: createForm.email.trim(),
        temporaryPassword: createForm.temporaryPassword,
        phone: createForm.phone.trim(),
        badgeNumber: createForm.badgeNumber.trim() || undefined,
        designation: createForm.designation.trim() || "Legal Metrology Officer",
        jurisdiction: createForm.jurisdiction.trim() || undefined,
      });
      if (!created) throw new Error("The server did not return the created LMO account.");
      setCreateOpen(false);
      setCreateForm(emptyCreateLmoForm);
      setSelected(created);
      setNotice(`LMO account created for ${created?.name || created?.officerName || "the officer"}.`);
    } catch (err) {
      setError(err.message || "LMO account could not be created.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="LMOs"
          subtitle={`District field officers • ${districtLabel}`}
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "LMOs" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">District Officers</h2>
              <p className="text-xs text-slate-500">{filtered.length} matching officers in {districtLabel}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={openCreate}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[17px]">person_add</span>
                Create LMO
              </button>
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search LMO"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="border border-rose-200 bg-rose-50 text-rose-700 rounded-lg px-4 py-3 text-xs font-semibold">
              {error}
            </div>
          )}

          {notice && (
            <div className="border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg px-4 py-3 text-xs font-semibold">
              {notice}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-500 shadow-2xs">
              No LMOs found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((lmo) => (
                <div key={lmo.uuid || lmo.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {(lmo.name || "LMO").split(" ").map((part) => part[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{lmo.name || lmo.officerName}</h4>
                        <span className="text-[10px] font-mono-code font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {lmo.officerId || lmo.lmoId || lmo.lmo_id}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass(lmo.status)}`}>
                      {lmo.status || "ACTIVE"}
                    </span>
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-600">
                    <p className="font-semibold text-slate-800">{lmo.designation || "Legal Metrology Officer"}</p>
                    <p className="text-[11px] text-slate-500">Jurisdiction: {lmo.jurisdiction || districtLabel}</p>
                    <p className="text-[11px]">{lmo.phone || "Phone not recorded"}</p>
                    <p className="text-[11px] truncate">{lmo.email || "Email not recorded"}</p>
                  </div>
                  <button
                    onClick={() => setSelected(lmo)}
                    className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    View Officer Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Modal
        isOpen={createOpen}
        onClose={() => {
          if (!saving) setCreateOpen(false);
        }}
        title="Create LMO"
        subtitle={districtLabel}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">Officer Name</label>
              <input
                value={createForm.officerName}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, officerName: event.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">Account Email</label>
              <input
                type="email"
                value={createForm.email}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">Temporary Password</label>
              <input
                type="password"
                value={createForm.temporaryPassword}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, temporaryPassword: event.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">Phone</label>
              <input
                value={createForm.phone}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">Badge Number</label>
              <input
                value={createForm.badgeNumber}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, badgeNumber: event.target.value }))}
                placeholder="Optional"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">Designation</label>
              <input
                value={createForm.designation}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, designation: event.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1.5">Jurisdiction</label>
              <input
                value={createForm.jurisdiction}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, jurisdiction: event.target.value }))}
                placeholder="Optional"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create LMO"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? selected.name || selected.officerName : "LMO"}
        subtitle={selected ? selected.officerId || selected.lmoId || selected.lmo_id : ""}
        maxWidth="max-w-2xl"
      >
        {selected && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 border border-slate-200 rounded-xl p-4">
            <DetailRow label="Officer Name" value={selected.name || selected.officerName} />
            <DetailRow label="LMO ID" value={selected.officerId || selected.lmoId || selected.lmo_id} mono />
            <DetailRow label="Designation" value={selected.designation} />
            <DetailRow label="District" value={selected.district?.name || selected.district_id || districtLabel} />
            <DetailRow label="Email" value={selected.email} />
            <DetailRow label="Phone" value={selected.phone} />
            <DetailRow label="Jurisdiction" value={selected.jurisdiction} />
            <DetailRow label="Status" value={selected.status || "ACTIVE"} />
          </div>
        )}
      </Modal>
    </div>
  );
}
