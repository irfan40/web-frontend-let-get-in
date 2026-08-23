"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Building2, Loader2, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { institutionService } from "@/features/institution/services/institutionService";
import { AvailableRecruiter, ConnectedRecruiter } from "@/features/institution/types";

export default function InstitutionRecruitersPage() {
  const [recruiters, setRecruiters] = useState<ConnectedRecruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showPicker, setShowPicker] = useState(false);
  const [available, setAvailable] = useState<AvailableRecruiter[]>([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [pickerError, setPickerError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    institutionService
      .getConnectedRecruiters()
      .then(setRecruiters)
      .catch(() => setError("Unable to load recruiters. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadAvailable = useCallback((query?: string) => {
    setAvailableLoading(true);
    institutionService
      .getAvailableRecruiters(query)
      .then(setAvailable)
      .catch(() => setPickerError("Unable to load available recruiters."))
      .finally(() => setAvailableLoading(false));
  }, []);

  const openPicker = () => {
    setShowPicker(true);
    setPickerError(null);
    loadAvailable();
  };

  const handleConnect = async (recruiterOrgId: string) => {
    setConnectingId(recruiterOrgId);
    setPickerError(null);
    try {
      await institutionService.connectRecruiter(recruiterOrgId);
      setAvailable((prev) => prev.filter((r) => r.recruiterOrgId !== recruiterOrgId));
      load();
    } catch (err: unknown) {
      setPickerError((err as { message?: string })?.message || "Failed to connect.");
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async (linkId: string) => {
    if (!confirm("Remove this recruiter connection?")) return;
    try {
      await institutionService.disconnectRecruiter(linkId);
      setRecruiters((prev) => prev.filter((r) => r._id !== linkId));
    } catch {
      setError("Failed to remove connection. Please try again.");
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Recruiters</h1>
          <p className="text-ink-soft mt-1 text-sm">Manage your recruiter connections.</p>
        </div>
        <button
          onClick={openPicker}
          className="inline-flex items-center gap-2 text-xs font-semibold bg-gradient-brand text-primary-foreground px-4 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add Recruiter
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <button onClick={load} className="inline-flex items-center gap-1.5 font-semibold shrink-0 hover:underline">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl shadow-elegant overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary-glow" />
          </div>
        ) : recruiters.length === 0 ? (
          <div className="p-10 text-center">
            <Building2 className="w-8 h-8 text-ink-soft mx-auto mb-3" />
            <p className="text-sm text-ink-soft">No recruiter connections yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-soft border-b border-border">
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Industry</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recruiters.map((r) => (
                  <tr key={r._id}>
                    <td className="px-5 py-3 font-semibold text-ink">{r.company}</td>
                    <td className="px-5 py-3 text-ink-soft">{r.email || "—"}</td>
                    <td className="px-5 py-3 text-ink-soft">{r.industry || "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          r.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-ink-soft/10 text-ink-soft"
                        }`}
                      >
                        {r.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDisconnect(r._id)}
                        className="text-ink-soft hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/5 transition"
                        aria-label="Remove connection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface border border-border rounded-3xl shadow-2xl p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-ink text-base">Connect a Recruiter</h3>
              <button onClick={() => setShowPicker(false)} className="p-1.5 text-ink-soft hover:text-ink hover:bg-surface-alt rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-ink-soft">
              Showing companies and startups on LetGetIn with at least one active job posting.
            </p>
            <input
              className="input-base"
              placeholder="Search by company name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                loadAvailable(e.target.value);
              }}
            />
            {pickerError && <p className="text-sm text-destructive">{pickerError}</p>}
            <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-2">
              {availableLoading ? (
                <div className="p-6 flex justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-glow" />
                </div>
              ) : available.length === 0 ? (
                <p className="text-sm text-ink-soft text-center py-6">No matching organizations found.</p>
              ) : (
                available.map((org) => (
                  <div
                    key={org.recruiterOrgId}
                    className="flex items-center justify-between gap-3 border border-border rounded-xl px-3.5 py-3"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-ink text-sm truncate">{org.company}</div>
                      <div className="text-[11px] text-ink-soft capitalize">
                        {org.entity}
                        {org.industry ? ` · ${org.industry}` : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => handleConnect(org.recruiterOrgId)}
                      disabled={connectingId === org.recruiterOrgId}
                      className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-brand text-primary-foreground px-3.5 py-2 rounded-xl shadow-sm hover:shadow-glow transition disabled:opacity-60"
                    >
                      {connectingId === org.recruiterOrgId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Connect"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
