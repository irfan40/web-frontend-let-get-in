"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RefreshCw, Sparkles, Zap } from "lucide-react";
import { recruiterService } from "@/features/recruiter/services/recruiterService";
import { BuyCreditsModal } from "@/features/recruiter/components/BuyCreditsModal";
import { AIWritingAssistant } from "@/features/aiWriting/components/AIWritingAssistant";
import { AISkillSuggestButton } from "@/features/aiWriting/components/AISkillSuggestButton";
import {
  CreditPack,
  EmploymentType,
  GeneratedJobContent,
  MatchVolumeOption,
  PipelineOptions,
  PipelineSection,
  PipelineSubOptionsCatalog,
  WorkplaceType,
} from "@/features/recruiter/types";

const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
];

const WORKPLACE_TYPES: { value: WorkplaceType; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const SECTION_META: Record<PipelineSection, { label: string; description: string }> = {
  resumeMatch: { label: "Resume Shortlisting", description: "Automatically rank applicants against this job" },
  assessment: { label: "Assessment", description: "Send an assessment to shortlisted candidates" },
  aiInterview: { label: "AI Interview", description: "Run an AI-driven candidate interview" },
};

export default function CreateJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("full-time");
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>("remote");
  const [salaryText, setSalaryText] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [description, setDescription] = useState("");
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [pendingGeneratedContent, setPendingGeneratedContent] = useState<GeneratedJobContent | null>(null);
  const [hasAiGeneratedContent, setHasAiGeneratedContent] = useState(false);

  const [sectionEnabled, setSectionEnabled] = useState<Record<PipelineSection, boolean>>({
    resumeMatch: true,
    assessment: false,
    aiInterview: false,
  });
  const [selectedSubOptions, setSelectedSubOptions] = useState<Record<PipelineSection, Set<string>>>({
    resumeMatch: new Set(),
    assessment: new Set(),
    aiInterview: new Set(),
  });

  const [matchVolume, setMatchVolume] = useState<string | null>(null);

  const [balance, setBalance] = useState<number | null>(null);
  const [subOptionsCatalog, setSubOptionsCatalog] = useState<PipelineSubOptionsCatalog | null>(null);
  const [subOptionCost, setSubOptionCost] = useState(10);
  const [matchVolumeOptions, setMatchVolumeOptions] = useState<MatchVolumeOption[]>([]);
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [loadingCredits, setLoadingCredits] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const loadCredits = () => {
    setLoadingCredits(true);
    recruiterService
      .getCredits()
      .then((res) => {
        setBalance(res.balance);
        setSubOptionsCatalog(res.pipelineSubOptions);
        setSubOptionCost(res.subOptionCost);
        setMatchVolumeOptions(res.matchVolumeOptions);
        setPacks(res.packs);
      })
      .catch(() => {})
      .finally(() => setLoadingCredits(false));
  };

  useEffect(() => {
    loadCredits();
  }, []);

  const applyGeneratedContent = (content: GeneratedJobContent) => {
    setDescription(content.description);
    if (content.skills.length > 0) {
      setSkillsText(content.skills.join(", "));
    }
    setHasAiGeneratedContent(true);
    setPendingGeneratedContent(null);
  };

  const handleGenerateContent = async () => {
    if (!title.trim()) return;
    setGenerationError(null);
    setIsGeneratingContent(true);
    try {
      const content = await recruiterService.generateJobContent({
        title: title.trim(),
        employmentType,
        workplaceType,
        location: location.trim() || undefined,
      });

      if (!content) {
        setGenerationError("AI generation is temporarily unavailable. You can still fill this in manually.");
        return;
      }

      const hasExistingContent = description.trim().length > 0 || skillsText.trim().length > 0;
      if (hasExistingContent) {
        // Never silently overwrite manually entered (or previously generated-and-edited) content.
        setPendingGeneratedContent(content);
      } else {
        applyGeneratedContent(content);
      }
    } catch (err: unknown) {
      setGenerationError((err as { message?: string })?.message || "AI generation is temporarily unavailable. You can still fill this in manually.");
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const toggleSection = (section: PipelineSection, enabled: boolean) => {
    setSectionEnabled((prev) => ({ ...prev, [section]: enabled }));
    if (!enabled) {
      // Disabling a section clears its selections — nothing from it should count toward credits.
      setSelectedSubOptions((prev) => ({ ...prev, [section]: new Set() }));
    }
  };

  const toggleSubOption = (section: PipelineSection, key: string) => {
    setSelectedSubOptions((prev) => {
      const next = new Set(prev[section]);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...prev, [section]: next };
    });
  };

  const summaryLines = useMemo(() => {
    const lines: { key: string; label: string; cost: number }[] = [];

    if (matchVolume) {
      const opt = matchVolumeOptions.find((o) => o.key === matchVolume);
      if (opt) lines.push({ key: `matchVolume:${opt.key}`, label: `Candidate Match ${opt.label}`, cost: opt.credits });
    }

    if (subOptionsCatalog) {
      (Object.keys(subOptionsCatalog) as PipelineSection[]).forEach((section) => {
        if (!sectionEnabled[section]) return;
        for (const opt of subOptionsCatalog[section]) {
          if (selectedSubOptions[section].has(opt.key)) {
            lines.push({ key: `${section}:${opt.key}`, label: opt.label, cost: subOptionCost });
          }
        }
      });
    }

    return lines;
  }, [matchVolume, matchVolumeOptions, subOptionsCatalog, sectionEnabled, selectedSubOptions, subOptionCost]);

  const totalCost = summaryLines.reduce((sum, l) => sum + l.cost, 0);
  const balanceAfterPublish = balance != null ? balance - totalCost : null;
  const hasInsufficientCredits = balance != null && totalCost > balance;

  const buildPipelineOptions = (): PipelineOptions => ({
    matchVolume,
    resumeMatch: sectionEnabled.resumeMatch,
    resumeMatchTypes: Array.from(selectedSubOptions.resumeMatch),
    assessment: sectionEnabled.assessment,
    assessmentTypes: Array.from(selectedSubOptions.assessment),
    aiInterview: sectionEnabled.aiInterview,
    aiInterviewTypes: Array.from(selectedSubOptions.aiInterview),
  });

  const validateCommonFields = () => {
    if (!title.trim()) {
      setLocalError("Job title is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setLocalError(null);
    if (!validateCommonFields()) return;

    if (hasInsufficientCredits) {
      setLocalError("Insufficient credits. Please buy more credits.");
      return;
    }

    setIsSubmitting(true);
    try {
      const job = await recruiterService.createJob({
        title: title.trim(),
        location: location.trim(),
        employmentType,
        workplaceType,
        salaryText: salaryText.trim(),
        skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
        description: description.trim(),
        pipelineOptions: buildPipelineOptions(),
      });
      router.push(`/recruiter/jobs/${job._id}`);
    } catch (err: unknown) {
      setLocalError((err as { message?: string })?.message || "Failed to create job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setLocalError(null);
    if (!validateCommonFields()) return;

    setIsSavingDraft(true);
    try {
      const job = await recruiterService.createJob({
        title: title.trim(),
        location: location.trim(),
        employmentType,
        workplaceType,
        salaryText: salaryText.trim(),
        skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
        description: description.trim(),
        saveAsDraft: true,
        pipelineOptions: buildPipelineOptions(),
      });
      router.push(`/recruiter/jobs/${job._id}`);
    } catch (err: unknown) {
      setLocalError((err as { message?: string })?.message || "Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Create a new job</h1>
          <p className="text-ink-soft mt-1 text-sm">Configure the hiring pipeline — pick only the steps you want for this role.</p>
        </div>

        <div className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-2.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-primary-glow" />
          </div>
          <div className="text-xs">
            <div className="text-ink-soft">Credit balance</div>
            <div className="font-bold text-ink">{loadingCredits ? "…" : `${balance ?? 0} credits`}</div>
          </div>
          <button
            type="button"
            onClick={() => setBuyModalOpen(true)}
            className="ml-2 text-xs font-semibold text-primary-glow border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition"
          >
            Buy credits
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Left column: job form + pipeline selection */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6 space-y-4">
            <Field label="Job title">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="input-base"
                required
              />
            </Field>

            <div className="flex items-center justify-between gap-3 flex-wrap -mt-1">
              <p className="text-xs text-ink-soft">
                {hasAiGeneratedContent
                  ? "Description and skills were AI-generated — review and edit before publishing."
                  : "Enter a job title, then let AI draft a description and skill suggestions."}
              </p>
              <button
                type="button"
                onClick={handleGenerateContent}
                disabled={!title.trim() || isGeneratingContent}
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-glow border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingContent ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> {hasAiGeneratedContent ? "Regenerate with AI" : "Generate with AI"}
                  </>
                )}
              </button>
            </div>

            {generationError && (
              <p className="text-xs text-ink-soft bg-surface-alt/60 border border-border rounded-lg px-3 py-2">
                {generationError}
              </p>
            )}

            {pendingGeneratedContent && (
              <div className="p-3 rounded-xl border border-primary/30 bg-primary/5">
                <p className="text-xs font-semibold text-ink mb-2">
                  Replace your current description and skills with AI-generated content?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => applyGeneratedContent(pendingGeneratedContent)}
                    className="text-xs font-semibold text-primary-foreground bg-gradient-brand px-3 py-1.5 rounded-lg"
                  >
                    Use AI content
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingGeneratedContent(null)}
                    className="text-xs font-semibold text-ink-soft hover:text-ink px-3 py-1.5 rounded-lg"
                  >
                    Keep mine
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Location">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India"
                  className="input-base"
                />
              </Field>
              <Field label="Salary">
                <input
                  type="text"
                  value={salaryText}
                  onChange={(e) => setSalaryText(e.target.value)}
                  placeholder="e.g. ₹18L – ₹25L / year"
                  className="input-base"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Employment type">
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                  className="input-base"
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Workplace type">
                <select
                  value={workplaceType}
                  onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
                  className="input-base"
                >
                  {WORKPLACE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm font-medium text-ink">Required skills (comma separated)</span>
                <AISkillSuggestButton
                  existingSkills={skillsText.split(",").map((s) => s.trim()).filter(Boolean)}
                  metadata={{ jobTitle: title }}
                  onAddSkill={(skill) =>
                    setSkillsText((prev) => (prev.trim() ? `${prev.trim()}, ${skill}` : skill))
                  }
                />
              </div>
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="e.g. React, TypeScript, Node.js"
                className="input-base"
              />
            </div>

            <label className="block">
              <span className="flex items-center gap-2 text-sm font-medium text-ink mb-1.5">
                Description
                {hasAiGeneratedContent && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-2.5 h-2.5" /> AI-generated
                  </span>
                )}
              </span>
              <textarea
                ref={descriptionRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Role responsibilities, requirements, and what makes this opportunity great"
                className="input-base min-h-[120px] resize-y"
              />
              {description.trim().length > 0 && (
                <div className="mt-2">
                  <AIWritingAssistant
                    value={description}
                    context="job-description"
                    metadata={{ jobTitle: title }}
                    textareaRef={descriptionRef}
                    onApply={setDescription}
                    label="AI Improve"
                  />
                </div>
              )}
            </label>
          </div>

          <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary-glow" />
              <h2 className="text-sm font-bold text-ink">Hiring Pipeline</h2>
            </div>

            <div className="space-y-3">
              <MatchVolumeSection
                options={matchVolumeOptions}
                selected={matchVolume}
                onSelect={setMatchVolume}
              />

              {(["resumeMatch", "assessment", "aiInterview"] as PipelineSection[]).map((section) => (
                <PipelineSectionCard
                  key={section}
                  section={section}
                  meta={SECTION_META[section]}
                  subOptions={subOptionsCatalog?.[section] || []}
                  subOptionCost={subOptionCost}
                  enabled={sectionEnabled[section]}
                  onToggleEnabled={(v) => toggleSection(section, v)}
                  selectedKeys={selectedSubOptions[section]}
                  onToggleSubOption={(key) => toggleSubOption(section, key)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right column: live credit summary */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <div className="bg-surface border border-border rounded-2xl shadow-elegant p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-primary-glow" />
              <h2 className="text-sm font-bold text-ink">Credit summary</h2>
            </div>

            {summaryLines.length === 0 ? (
              <p className="text-xs text-ink-soft px-1 py-2">
                No hiring pipeline steps selected yet — this job will be free to publish.
              </p>
            ) : (
              <div className="space-y-1.5 mb-4">
                {summaryLines.map((l) => (
                  <div
                    key={l.key}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm bg-primary/10 text-ink font-semibold"
                  >
                    <span>{l.label}</span>
                    <span className="text-primary-glow font-bold">{l.cost}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-ink">Total</span>
                <span className="font-extrabold text-ink">{totalCost} credits</span>
              </div>
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span>Balance after publish</span>
                <span className={hasInsufficientCredits ? "text-destructive font-semibold" : ""}>
                  {balanceAfterPublish != null ? `${balanceAfterPublish} credits` : "—"}
                </span>
              </div>
              {balance != null && balance > 0 && (
                <div className="h-1.5 rounded-full bg-surface-alt overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full transition-all ${hasInsufficientCredits ? "bg-destructive" : "bg-gradient-brand"}`}
                    style={{ width: `${Math.min(100, (totalCost / balance) * 100)}%` }}
                  />
                </div>
              )}
            </div>

            {hasInsufficientCredits && (
              <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 mt-4">
                Insufficient credits. Please buy more credits.
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isSavingDraft || loadingCredits || hasInsufficientCredits}
              className="w-full mt-4 bg-gradient-brand text-primary-foreground font-semibold px-6 py-3.5 rounded-xl shadow-elegant hover:shadow-glow transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>Publish job · {totalCost} credits</>
              )}
            </button>

            <button
              type="button"
              onClick={() => setBuyModalOpen(true)}
              className="w-full mt-2 text-xs font-semibold text-primary-glow hover:underline py-1.5"
            >
              Buy more credits
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting || isSavingDraft}
              className="w-full text-xs font-semibold text-ink-soft hover:text-ink py-1 disabled:opacity-60"
            >
              {isSavingDraft ? "Saving draft…" : "Save as draft"}
            </button>
          </div>

          <div className="bg-surface-alt/50 border border-border rounded-2xl p-4">
            <p className="text-[11px] text-ink-soft leading-relaxed">
              Credits are charged once per job when published. Draft jobs are never charged. You can change your
              selections any time before publishing — the summary always reflects your current picks.
            </p>
          </div>

          {localError && !hasInsufficientCredits && (
            <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
              {localError}
            </p>
          )}
        </div>
      </div>

      <BuyCreditsModal
        open={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        packs={packs}
        onPurchased={(newBalance) => setBalance(newBalance)}
      />
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

function MatchVolumeSection({
  options,
  selected,
  onSelect,
}: {
  options: MatchVolumeOption[];
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className={`rounded-xl border transition ${selected ? "border-primary/30 bg-primary/5" : "border-border bg-background"}`}>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-ink">Candidate Match Volume</span>
          {selected && (
            <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
              {options.find((o) => o.key === selected)?.credits} credits
            </span>
          )}
        </div>
        <p className="text-xs text-ink-soft mt-0.5">
          How many candidates should be matched against this job (choose one)
        </p>

        <div className="mt-3 space-y-1.5">
          {options.map((opt) => {
            const active = selected === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(opt.key)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border text-sm transition ${
                  active
                    ? "border-primary/40 bg-white shadow-sm font-semibold text-ink"
                    : "border-transparent text-ink-soft hover:bg-surface-alt/60"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      active ? "border-primary" : "border-border"
                    }`}
                  >
                    {active && <span className="w-2 h-2 rounded-full bg-gradient-brand" />}
                  </span>
                  {opt.label}
                </span>
                <span className={active ? "text-primary-glow font-bold" : "text-ink-soft/70"}>{opt.credits} credits</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PipelineSectionCard({
  meta,
  subOptions,
  subOptionCost,
  enabled,
  onToggleEnabled,
  selectedKeys,
  onToggleSubOption,
}: {
  section: PipelineSection;
  meta: { label: string; description: string };
  subOptions: { key: string; label: string }[];
  subOptionCost: number;
  enabled: boolean;
  onToggleEnabled: (v: boolean) => void;
  selectedKeys: Set<string>;
  onToggleSubOption: (key: string) => void;
}) {
  const selectedCount = selectedKeys.size;

  return (
    <div className={`rounded-xl border transition ${enabled ? "border-primary/30 bg-primary/5" : "border-border bg-background"}`}>
      <label className="flex items-start gap-3 p-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggleEnabled(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-primary"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-ink">{meta.label}</span>
            {enabled && selectedCount > 0 && (
              <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                {selectedCount * subOptionCost} credits
              </span>
            )}
          </div>
          <p className="text-xs text-ink-soft mt-0.5">{meta.description}</p>
        </div>
      </label>

      {enabled && (
        <div className="px-3 pb-3 pt-1 flex flex-wrap gap-2">
          {subOptions.map((opt) => {
            const active = selectedKeys.has(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onToggleSubOption(opt.key)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                  active
                    ? "bg-gradient-brand text-primary-foreground border-transparent shadow-sm"
                    : "bg-surface text-ink-soft border-border hover:text-ink hover:border-primary/30"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                    active ? "bg-white/20 border-white/40" : "border-border"
                  }`}
                >
                  {active && <Check className="w-2.5 h-2.5" />}
                </span>
                {opt.label}
                <span className={active ? "text-primary-foreground/80" : "text-ink-soft/70"}>· {subOptionCost}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
