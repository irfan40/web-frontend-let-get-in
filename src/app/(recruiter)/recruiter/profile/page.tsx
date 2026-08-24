"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, Loader2, Pencil } from "lucide-react";
import { useRecruiterStore } from "@/features/recruiter/store/useRecruiterStore";
import { EntityType, OrgProfile } from "@/features/recruiter/types";
import { AIWritingAssistant } from "@/features/aiWriting/components/AIWritingAssistant";
import { AIWritingContext } from "@/features/aiWriting/types";

const ENTITY_TO_AI_CONTEXT: Record<EntityType, AIWritingContext> = {
  company: "company-about",
  startup: "startup-about",
  institution: "institution-about",
};

export default function RecruiterProfilePage() {
  const { orgProfile, orgFormMeta, loadOrgProfile, loadOrgFormMeta, saveOrgProfile } = useRecruiterStore();

  const [loaded, setLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<OrgProfile>>({});
  const bioRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadOrgProfile().finally(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (orgProfile?.entity) {
      loadOrgFormMeta(orgProfile.entity).catch(() => {});
    }
  }, [orgProfile?.entity, loadOrgFormMeta]);

  const meta = orgProfile?.entity ? orgFormMeta[orgProfile.entity] : undefined;
  const entityLabel = meta?.label || "Organization";

  const startEditing = () => {
    setLocalError(null);
    setSuccessMessage(null);
    setForm({
      name: orgProfile?.name || "",
      industry: orgProfile?.industry || "",
      orgType: orgProfile?.orgType || "",
      website: orgProfile?.website || "",
      ceoEmail: orgProfile?.ceoEmail || "",
      phone: orgProfile?.phone || "",
      address: orgProfile?.address || "",
      bio: orgProfile?.bio || "",
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setLocalError(null);
  };

  const updateField = (key: keyof OrgProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!orgProfile) return;
    setLocalError(null);

    if (!form.name?.trim()) {
      setLocalError(`${entityLabel} name is required.`);
      return;
    }
    if (form.ceoEmail?.trim() && !/^\S+@\S+\.\S+$/.test(form.ceoEmail.trim())) {
      setLocalError("Enter a valid contact email address.");
      return;
    }

    setIsSaving(true);
    try {
      await saveOrgProfile({
        entity: orgProfile.entity,
        name: form.name!.trim(),
        industry: (form.industry || "").trim(),
        orgType: form.orgType || "",
        employees: orgProfile.employees || "",
        valuation: orgProfile.valuation || "",
        ceoName: orgProfile.ceoName || "",
        ceoEmail: (form.ceoEmail || "").trim(),
        phone: (form.phone || "").trim(),
        founded: orgProfile.founded || "",
        website: (form.website || "").trim(),
        registrationId: orgProfile.registrationId || "",
        bio: (form.bio || "").trim(),
      });
      setSuccessMessage("Profile updated successfully.");
      setIsEditing(false);
    } catch (err: unknown) {
      setLocalError((err as { message?: string })?.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-ink-soft">
        <Loader2 className="w-6 h-6 animate-spin text-primary-glow" />
      </div>
    );
  }

  if (!orgProfile) {
    return (
      <div className="p-6 sm:p-10 max-w-2xl mx-auto text-center">
        <div className="bg-surface border border-border rounded-2xl shadow-elegant p-10">
          <Building2 className="w-10 h-10 text-primary-glow mx-auto mb-4" />
          <h1 className="text-lg font-bold text-ink">Complete your organization setup</h1>
          <p className="text-sm text-ink-soft mt-1.5">
            Set up your organization profile before viewing it here.
          </p>
          <Link
            href="/recruiter/setup"
            className="inline-flex items-center gap-2 mt-6 text-xs font-semibold bg-gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition-all"
          >
            Set up organization
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          {entityLabel} Profile
        </h1>
        <p className="text-ink-soft mt-1 text-sm">
          {isEditing
            ? `Update your ${entityLabel.toLowerCase()}'s details below.`
            : `View and manage your ${entityLabel.toLowerCase()}'s information.`}
        </p>
      </div>

      {successMessage && !isEditing && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mb-5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMessage}
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6 sm:p-8">
        {!isEditing ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <ViewField label={`${entityLabel} Name`} value={orgProfile.name} />
              <ViewField label="Industry" value={orgProfile.industry} />
              <ViewField label={meta?.typeLabel || "Type"} value={orgProfile.orgType} />
              <ViewField label="Website" value={orgProfile.website} />
              <ViewField label="Email" value={orgProfile.ceoEmail} />
              <ViewField label="Phone" value={orgProfile.phone} />
              <ViewField label="Address" value={orgProfile.address} className="sm:col-span-2" />
              <ViewField label={`About ${entityLabel}`} value={orgProfile.bio} className="sm:col-span-2" />
            </div>

            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-2 mt-8 text-xs font-semibold bg-gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit {entityLabel} Profile
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <Field label={`${entityLabel} Name`}>
              <input
                type="text"
                value={form.name || ""}
                onChange={(e) => updateField("name", e.target.value)}
                className="input-base"
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Industry">
                <input
                  type="text"
                  value={form.industry || ""}
                  onChange={(e) => updateField("industry", e.target.value)}
                  placeholder="e.g. Technology"
                  className="input-base"
                />
              </Field>
              <Field label={meta?.typeLabel || "Type"}>
                {meta?.typeOptions?.length ? (
                  <select
                    value={form.orgType || ""}
                    onChange={(e) => updateField("orgType", e.target.value)}
                    className="input-base"
                  >
                    <option value="">Select...</option>
                    {meta.typeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.orgType || ""}
                    onChange={(e) => updateField("orgType", e.target.value)}
                    className="input-base"
                  />
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Website">
                <input
                  type="text"
                  value={form.website || ""}
                  onChange={(e) => updateField("website", e.target.value)}
                  placeholder="https://example.com"
                  className="input-base"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.ceoEmail || ""}
                  onChange={(e) => updateField("ceoEmail", e.target.value)}
                  placeholder="contact@example.com"
                  className="input-base"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone">
                <input
                  type="tel"
                  value={form.phone || ""}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="input-base"
                />
              </Field>
              <Field label="Address">
                <input
                  type="text"
                  value={form.address || ""}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="input-base"
                />
              </Field>
            </div>

            <Field label={`About ${entityLabel}`}>
              <textarea
                ref={bioRef}
                value={form.bio || ""}
                onChange={(e) => updateField("bio", e.target.value)}
                placeholder={`A short description of your ${entityLabel.toLowerCase()}`}
                className="input-base min-h-[100px] resize-y"
              />
              {(form.bio || "").trim().length > 0 && orgProfile?.entity && (
                <div className="mt-2">
                  <AIWritingAssistant
                    value={form.bio || ""}
                    context={ENTITY_TO_AI_CONTEXT[orgProfile.entity]}
                    metadata={{ companyName: form.name || "", industry: form.industry || "" }}
                    textareaRef={bioRef}
                    onApply={(next) => updateField("bio", next)}
                    label="AI Improve"
                  />
                </div>
              )}
            </Field>

            {localError && (
              <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                {localError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 text-xs font-semibold bg-gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition-all disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
                className="text-xs font-semibold text-ink-soft hover:text-ink px-4 py-2.5 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ViewField({ label, value, className }: { label: string; value?: string; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft mb-1">{label}</div>
      <div className="text-sm text-ink">{value?.trim() ? value : <span className="text-ink-soft italic">Not set</span>}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>
      {children}
    </label>
  );
}
