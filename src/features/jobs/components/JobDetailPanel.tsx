"use client";

import React, { useState } from "react";
import {
  Building2,
  MapPin,
  Briefcase,
  Clock,
  Bookmark,
  Share2,
  Check,
  CheckCircle2,
  Circle,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Maximize2,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { IJob } from "../types/job.types";

interface JobDetailPanelProps {
  job: IJob | null;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
  onStartApplication: (job: IJob) => void;
  isApplied?: boolean;
  onCloseMobile?: () => void;
}

export const JobDetailPanel: React.FC<JobDetailPanelProps> = ({
  job,
  isSaved = false,
  onToggleSave,
  onStartApplication,
  isApplied = false,
  onCloseMobile,
}) => {
  const [copied, setCopied] = useState(false);
  const [isApplicationAccordionOpen, setIsApplicationAccordionOpen] =
    useState(true);

  if (!job) {
    return (
      <div className="h-full min-h-[500px] rounded-3xl border border-dashed border-border bg-card/60 p-12 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center">
          <Briefcase className="w-7 h-7" />
        </div>
        <h3 className="font-extrabold text-base text-ink">
          Select a Role to View Details
        </h3>
        <p className="text-xs text-ink-soft max-w-xs">
          Click any role from the left list to view requirements, salary, team
          insights, and start your application.
        </p>
      </div>
    );
  }

  // Format Salary / Rate for right-side header
  const formatRate = () => {
    if (!job.salary || (!job.salary.min && !job.salary.max)) {
      return { main: "$50-$60", sub: "per hour" };
    }
    const { min, max, currency, period } = job.salary;
    const periodLabel =
      period === "yearly"
        ? "per year"
        : period === "monthly"
          ? "per month"
          : "per hour";
    const symbol = currency === "INR" ? "₹" : "$";

    if (currency === "INR") {
      const minLPA = (min / 100000).toFixed(0);
      const maxLPA = (max / 100000).toFixed(0);
      return { main: `₹${minLPA}–${maxLPA} LPA`, sub: "" };
    }

    const minK = min >= 1000 ? `${Math.round(min / 1000)}k` : min;
    const maxK = max >= 1000 ? `${Math.round(max / 1000)}k` : max;
    return { main: `${symbol}${minK}-$${maxK}`, sub: periodLabel };
  };

  const rate = formatRate();

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Avatar Initials for "X hired this month"
  const hiredAvatars = [
    { initial: "P", bg: "bg-purple-600" },
    { initial: "J", bg: "bg-indigo-600" },
    { initial: "D", bg: "bg-rose-500" },
  ];

  // Derive a dynamic hired count based on job id or salary
  const hiredCount = 1498;

  // Company avatar
  const companyInitial = (job.company.name || "M").charAt(0).toUpperCase();

  const stepsCompleted = isApplied ? 1 : 0;
  const progressPercent = isApplied ? 20 : 0;

  return (
    <div className="bg-card border border-border rounded-3xl flex flex-col h-full shadow-sm overflow-hidden relative">
      {/* Top Action Bar (Share, Bookmark, Close Mobile) */}
      <div className="p-4 sm:p-5 border-b border-border/70 flex items-center justify-between bg-surface-alt/20">
        <div className="flex items-center gap-2 text-ink-soft text-xs font-semibold">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
            <Sparkles className="w-3 h-3" /> Job ID:{" "}
            {job._id.slice(-6).toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
            title="Copy share link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(job._id)}
              className="p-2 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
              title={isSaved ? "Remove from bookmarks" : "Bookmark role"}
            >
              <Bookmark
                className={`w-4 h-4 ${isSaved ? "fill-primary text-primary" : ""}`}
              />
            </button>
          )}

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
            >
              Back
            </button>
          )}
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 scrollbar-thin">
        {/* Title & Large Rate Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight leading-tight">
              {job.title}
            </h1>

            {/* Meta Row */}
            <div className="flex items-center gap-3 flex-wrap text-xs sm:text-sm text-ink-soft font-medium">
              <span className="inline-flex items-center gap-1 text-ink">
                <Briefcase className="w-4 h-4 text-ink-soft" />
                <span className="capitalize">
                  {job.employmentType} contract
                </span>
              </span>

              <span>•</span>

              <span className="inline-flex items-center gap-1 text-ink">
                <MapPin className="w-4 h-4 text-ink-soft" />
                <span className="capitalize">{job.workplaceType}</span>
              </span>

              <span>•</span>

              {/* Hired this month */}
              {/* <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {hiredAvatars.map((av, i) => (
                    <div
                      key={i}
                      className={`inline-block h-5 w-5 rounded-full ring-2 ring-card ${av.bg} text-white font-bold text-[9px] flex items-center justify-center`}
                    >
                      {av.initial}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-ink-soft font-medium">
                  {hiredCount} hired this month
                </span>
              </div> */}
            </div>

            {/* Early Applicant Badge */}
            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-500/20">
                <Clock className="w-3.5 h-3.5" /> Early applicant
              </span>
            </div>
          </div>

          {/* Large Rate Block */}
          <div className="sm:text-right shrink-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              {rate.main}
            </div>
            {rate.sub && (
              <div className="text-xs font-semibold text-ink-soft mt-0.5">
                {rate.sub}
              </div>
            )}
          </div>
        </div>

        {/* Company Card */}
        <div className="p-4 rounded-2xl bg-surface-alt/50 border border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-brand text-white font-bold text-base grid place-items-center shrink-0 shadow-sm shadow-primary/20">
              {companyInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-ink-soft font-semibold">
                Posted by {job.company.name}
              </p>
              <a
                href={job.company.website || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-ink hover:text-primary transition flex items-center gap-1"
              >
                <span>
                  {job.company.website ||
                    `${job.company.name.toLowerCase().replace(/\s+/g, "")}.com`}
                </span>
                <ExternalLink className="w-3 h-3 text-ink-soft" />
              </a>
            </div>
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(job._id)}
              className="p-2 text-ink-soft hover:text-ink transition cursor-pointer"
              title="Bookmark role"
            >
              <Bookmark
                className={`w-5 h-5 ${isSaved ? "fill-primary text-primary" : ""}`}
              />
            </button>
          )}
        </div>

        {/* Application Progress Accordion */}
        <div className="rounded-2xl border border-border overflow-hidden bg-card">
          {/* Accordion Header */}
          <button
            type="button"
            onClick={() =>
              setIsApplicationAccordionOpen(!isApplicationAccordionOpen)
            }
            className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-surface-alt/40 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-sm sm:text-base text-ink">
                Application
              </h3>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isApplied
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-surface-alt text-ink-soft border border-border"
                }`}
              >
                {isApplied ? "In review" : "Not started"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-ink-soft">
                {stepsCompleted} of 5 steps completed ({progressPercent}%)
              </span>
              {isApplicationAccordionOpen ? (
                <ChevronUp className="w-4 h-4 text-ink-soft" />
              ) : (
                <ChevronDown className="w-4 h-4 text-ink-soft" />
              )}
            </div>
          </button>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-secondary">
            <div
              className="h-full bg-[#5345ec] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Accordion Body: 5 Application Steps */}
          {isApplicationAccordionOpen && (
            <div className="p-4 sm:p-5 space-y-4 border-t border-border/70 bg-surface-alt/10">
              {/* Step 1: Resume */}
              <div className="flex items-center justify-between gap-3 py-1">
                <div>
                  <p className="font-bold text-xs sm:text-sm text-ink">
                    Resume
                  </p>
                  <p className="text-[11px] text-ink-soft">
                    {isApplied ? "Resume profile attached" : "Not done"}
                  </p>
                </div>
                {isApplied ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-border shrink-0" />
                )}
              </div>

              {/* Step 2: Domain Expert Interview */}
              <div className="flex items-center justify-between gap-3 py-1 border-t border-border/50 pt-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs sm:text-sm text-ink">
                      Domain Expert Interview
                    </p>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-surface-alt text-ink-soft border border-border">
                      CORE
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-soft">Not done</p>
                </div>
                <Circle className="w-5 h-5 text-border shrink-0" />
              </div>

              {/* Step 3: Project Assessment */}
              <div className="flex items-center justify-between gap-3 py-1 border-t border-border/50 pt-3">
                <div>
                  <p className="font-bold text-xs sm:text-sm text-ink">
                    Project Assessment
                  </p>
                  <p className="text-[11px] text-ink-soft">Not done</p>
                </div>
                <Circle className="w-5 h-5 text-border shrink-0" />
              </div>

              {/* Step 4: Availability */}
              <div className="flex items-center justify-between gap-3 py-1 border-t border-border/50 pt-3">
                <div>
                  <p className="font-bold text-xs sm:text-sm text-ink">
                    Availability
                  </p>
                  <p className="text-[11px] text-ink-soft">Not done</p>
                </div>
                <Circle className="w-5 h-5 text-border shrink-0" />
              </div>

              {/* Step 5: Work Authorization */}
              <div className="flex items-center justify-between gap-3 py-1 border-t border-border/50 pt-3">
                <div>
                  <p className="font-bold text-xs sm:text-sm text-ink">
                    Work Authorization
                  </p>
                  <p className="text-[11px] text-ink-soft">Not done</p>
                </div>
                <Circle className="w-5 h-5 text-border shrink-0" />
              </div>

              {/* Note */}
              <div className="mt-4 p-3 rounded-xl bg-surface-alt/60 border border-border/60 flex items-start gap-2.5 text-xs text-ink-soft leading-relaxed">
                <Info className="w-4 h-4 text-primary-glow shrink-0 mt-0.5" />
                <span>
                  All application steps are reused whenever another role
                  requires the same step, so you never have to upload your
                  resume or take the same interview twice.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* About the Role */}
        <div className="space-y-3">
          <h3 className="font-bold text-base text-ink">About the Role</h3>
          <p className="text-xs sm:text-sm text-ink-soft leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Skills Alignment */}
        {job.skills && job.skills.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-base text-ink">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs font-semibold px-3 py-1 rounded-xl bg-surface-alt border border-border text-ink"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Key Responsibilities */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-base text-ink">
              Key Responsibilities
            </h3>
            <ul className="space-y-2">
              {job.responsibilities.map((resp, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-ink-soft leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5345ec] mt-2 shrink-0" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-base text-ink">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-ink-soft leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="p-4 sm:p-5 border-t border-border bg-card/95 backdrop-blur-xs sticky bottom-0 z-10">
        <button
          type="button"
          onClick={() => onStartApplication(job)}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 ${
            isApplied
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-[#5345ec] hover:bg-[#4335dc]"
          }`}
        >
          {isApplied ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Application Submitted (In Review)</span>
            </>
          ) : (
            <span>Start application</span>
          )}
        </button>
      </div>
    </div>
  );
};
