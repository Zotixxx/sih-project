"use client";

import React, { useEffect, useState } from "react";
import SideNavBar from "@/components/layout/SideNavBar";
import TopNavBar from "@/components/layout/TopNavBar";
import { metrixApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

const ROLES = ["BUSINESS", "LMO", "ASSISTANT_CONTROLLER", "SYSTEM_ADMIN"];
const emptyFilters = {
  search: "",
  actorRole: "",
  action: "",
  entityType: "",
  districtId: "",
  dateFrom: "",
  dateTo: "",
};

const formatDateTime = (value) => {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${formatDate(value)} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

export default function AuditLogsAdminPage() {
  const [districts, setDistricts] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = async (page = 1, overrideFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const res = await metrixApi.searchAdminAuditLogs({
        ...overrideFilters,
        page,
        limit: 25,
      });
      setLogs(res.data?.items || []);
      setMeta(res.data || null);
    } catch (err) {
      setError(err.message || "Audit logs could not be loaded.");
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
    let mounted = true;
    metrixApi
      .searchAdminAuditLogs({
        ...emptyFilters,
        page: 1,
        limit: 25,
      })
      .then((res) => {
        if (!mounted) return;
        setLogs(res.data?.items || []);
        setMeta(res.data || null);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Audit logs could not be loaded.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SideNavBar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        <TopNavBar
          title="Audit Logs"
          subtitle="Read-only system activity trail"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Audit Logs" },
          ]}
        />

        <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                loadLogs(1);
              }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs"
            >
              <div className="lg:col-span-4">
                <label className="font-semibold text-slate-700 block mb-1.5">Search</label>
                <input
                  value={filters.search}
                  onChange={(event) => updateFilter("search", event.target.value)}
                  placeholder="Action, entity type, entity ID"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1.5">Actor Role</label>
                <select
                  value={filters.actorRole}
                  onChange={(event) => updateFilter("actorRole", event.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-900"
                >
                  <option value="">Any</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-3">
                <label className="font-semibold text-slate-700 block mb-1.5">District</label>
                <select
                  value={filters.districtId}
                  onChange={(event) => updateFilter("districtId", event.target.value)}
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
              <div className="lg:col-span-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(event) => updateFilter("dateFrom", event.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(event) => updateFilter("dateTo", event.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>
              <div className="lg:col-span-4">
                <label className="font-semibold text-slate-700 block mb-1.5">Action</label>
                <input
                  value={filters.action}
                  onChange={(event) => updateFilter("action", event.target.value)}
                  placeholder="APPLICATION_SUBMITTED"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="lg:col-span-4">
                <label className="font-semibold text-slate-700 block mb-1.5">Entity Type</label>
                <input
                  value={filters.entityType}
                  onChange={(event) => updateFilter("entityType", event.target.value)}
                  placeholder="APPLICATION, CERTIFICATE, LMO"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
              <div className="lg:col-span-4 flex items-end gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-60 transition-colors"
                >
                  {loading ? "Loading..." : "Apply Filters"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilters(emptyFilters);
                    loadLogs(1, emptyFilters);
                  }}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Reset
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
              <h3 className="text-sm font-bold text-slate-900">Activity</h3>
              <span className="text-[11px] text-slate-500">
                {meta ? `${meta.total || 0} matching` : "Latest activity"}
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500">Loading audit activity...</div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">No audit activity found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Entity</th>
                      <th className="px-4 py-3">District</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono-code font-bold text-slate-900">{log.action}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-900 block">{log.actorRole}</span>
                          <span className="text-[11px] text-slate-500 font-mono-code break-all">{log.actorUserId}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-900 block">{log.entityType}</span>
                          <span className="text-[11px] text-slate-500 font-mono-code">{log.entityId}</span>
                        </td>
                        <td className="px-4 py-3">{log.districtId || "Global"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {meta && meta.total > meta.limit && (
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                disabled={loading || meta.page <= 1}
                onClick={() => loadLogs(meta.page - 1)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-slate-500">Page {meta.page}</span>
              <button
                type="button"
                disabled={loading || meta.page * meta.limit >= meta.total}
                onClick={() => loadLogs(meta.page + 1)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
