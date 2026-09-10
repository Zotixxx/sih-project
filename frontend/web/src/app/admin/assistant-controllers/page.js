"use client";

import React, { useEffect, useState } from "react";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import Modal from "@/components/ui/Modal";
import { metrixApi } from "@/lib/api";
import { useMetrixStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

const emptyCreateForm = {
  districtId: "",
  email: "",
  officerName: "",
  phone: "",
  designation: "Assistant Controller",
  jurisdiction: "",
  organization: "",
  temporaryPassword: "",
  status: "ACTIVE",
};

const statusClass = (status) =>
  status === "INACTIVE"
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";

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

export default function AssistantControllersAdminPage() {
  const { currentUser } = useMetrixStore();
  const [initialSearch] = useState(getInitialSearch);
  const [districts, setDistricts] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [districtId, setDistrictId] = useState("");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [loading, setLoading] = useState(Boolean(initialSearch));
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const runSearch = async (page = 1, overrideFilters = { search, districtId, status }) => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const res = await metrixApi.searchAdminAssistantControllers({
        ...overrideFilters,
        page,
        limit: 25,
      });
      setResults(res.data?.items || []);
      setMeta(res.data || null);
    } catch (err) {
      setError(err.message || "Assistant Controller search failed.");
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
      .searchAdminAssistantControllers({
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
        if (mounted) setError(err.message || "Assistant Controller search failed.");
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
      const res = await metrixApi.getAdminAssistantController(id);
      setSelected(res.data);
      setEditForm({
        officerName: res.data.officerName || "",
        phone: res.data.phone || "",
        designation: res.data.designation || "Assistant Controller",
        jurisdiction: res.data.jurisdiction || "",
        organization: res.data.organization || "",
        status: res.data.status || "ACTIVE",
      });
    } catch (err) {
      setError(err.message || "Assistant Controller details could not be loaded.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await metrixApi.createAdminAssistantController({
        districtId: createForm.districtId,
        email: createForm.email.trim(),
        officerName: createForm.officerName.trim(),
        phone: createForm.phone.trim(),
        designation: createForm.designation.trim(),
        temporaryPassword: createForm.temporaryPassword,
        status: createForm.status,
        jurisdiction: createForm.jurisdiction.trim() || undefined,
        organization: createForm.organization.trim() || undefined,
      });
      const created = res.data;
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      setSelected(created);
      setEditForm({
        officerName: created.officerName || "",
        phone: created.phone || "",
        designation: created.designation || "Assistant Controller",
        jurisdiction: created.jurisdiction || "",
        organization: created.organization || "",
        status: created.status || "ACTIVE",
      });
      setResults((prev) => [created, ...prev.filter((item) => item.uuid !== created.uuid)]);
      setNotice(`Assistant Controller account created for ${created.district?.name || created.districtId}.`);
    } catch (err) {
      setError(err.message || "Assistant Controller account could not be created.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await metrixApi.updateAdminAssistantController(selected.uuid, editForm);
      const updated = res.data;
      setSelected(updated);
      setEditForm({
        officerName: updated.officerName || "",
        phone: updated.phone || "",
        designation: updated.designation || "Assistant Controller",
        jurisdiction: updated.jurisdiction || "",
        organization: updated.organization || "",
        status: updated.status || "ACTIVE",
      });
      setResults((prev) => prev.map((item) => (item.uuid === updated.uuid ? updated : item)));
      setNotice("Assistant Controller officer details updated.");
    } catch (err) {
      setError(err.message || "Assistant Controller account could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Assistant Controllers"
          subtitle="District account provisioning and current officer assignment"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Assistant Controllers" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Assistant Controllers</h2>
                <p className="text-xs text-slate-500">
                  Signed in as {currentUser?.email || currentUser?.name || "System Admin"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setNotice("");
                  setCreateForm(emptyCreateForm);
                  setCreateOpen(true);
                }}
                className="px-4 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add_moderator</span>
                Create Assistant Controller
              </button>
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
                  placeholder="Name, district, email, AC identifier"
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
          {notice && (
            <div className="border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg px-4 py-3 text-xs font-semibold">
              {notice}
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
                Search for a district, officer, email, or AC identifier.
              </div>
            ) : loading ? (
              <div className="p-12 text-center text-xs text-slate-500">Searching Assistant Controllers...</div>
            ) : results.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">No Assistant Controllers found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">District</th>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3">Officer</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((ac) => (
                      <tr key={ac.uuid} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{ac.district?.name || ac.districtId}</span>
                          <span className="text-[11px] text-slate-500">{ac.district?.state || ac.districtId}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono-code font-bold text-slate-900 block">{ac.acId}</span>
                          <span className="text-[11px] text-slate-500">{ac.accountEmail}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{ac.officerName}</span>
                          <span className="text-[11px] text-slate-500">{ac.designation || "Assistant Controller"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusClass(ac.status)}`}>
                            {ac.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openDetails(ac.uuid)}
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
        isOpen={createOpen}
        onClose={() => {
          if (!saving) setCreateOpen(false);
        }}
        title="Create Assistant Controller"
        subtitle="Create one stable district account and assign the current officer"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1.5">District</label>
              <select
                value={createForm.districtId}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, districtId: event.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                required
              >
                <option value="">Select district</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}, {district.state}
                  </option>
                ))}
              </select>
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
              <label className="font-semibold text-slate-700 block mb-1.5">Current Officer</label>
              <input
                value={createForm.officerName}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, officerName: event.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                required
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
              <label className="font-semibold text-slate-700 block mb-1.5">Designation</label>
              <input
                value={createForm.designation}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, designation: event.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1.5">Organization</label>
              <input
                value={createForm.organization}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, organization: event.target.value }))}
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
              {saving ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => {
          if (!saving) setSelected(null);
        }}
        title={selected ? selected.officerName : "Assistant Controller"}
        subtitle={selected ? `${selected.acId} • ${selected.district?.name || selected.districtId}` : ""}
        maxWidth="max-w-3xl"
      >
        {selected && editForm && (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <DetailRow label="District" value={`${selected.district?.name || selected.districtId}${selected.district?.state ? `, ${selected.district.state}` : ""}`} />
              <DetailRow label="Account Email" value={selected.accountEmail} />
              <DetailRow label="Auth User UUID" value={selected.authUserId} mono />
              <DetailRow label="Account Identifier" value={selected.acId} mono />
              <DetailRow label="Created" value={formatDate(selected.createdAt)} />
              <DetailRow label="Updated" value={formatDate(selected.updatedAt)} />
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Current Officer</label>
                  <input
                    value={editForm.officerName}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, officerName: event.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Phone</label>
                  <input
                    value={editForm.phone}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Designation</label>
                  <input
                    value={editForm.designation}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, designation: event.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Jurisdiction</label>
                  <input
                    value={editForm.jurisdiction}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, jurisdiction: event.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Organization</label>
                  <input
                    value={editForm.organization}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, organization: event.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
