"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Briefcase,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";
import { IJob } from "../types/job.types";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { applicationService } from "@/features/applications/services/applicationService";

interface JobApplyModalProps {
  isOpen: boolean;
  job: IJob | null;
  allJobs?: IJob[];
  onClose: () => void;
  onSuccess: (jobId: string, appliedJob?: IJob | null, createdApp?: any) => void;
}

export const JobApplyModal: React.FC<JobApplyModalProps> = ({
  isOpen,
  job,
  allJobs = [],
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();

  const [step, setStep] = useState<"form" | "recommendations">("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [noLinkedin, setNoLinkedin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-fill user details when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setErrorMsg(null);
      setFullName(user?.fullName || user?.username || "");
      setEmail(user?.email || "");
      setLinkedinUrl("");
      setNoLinkedin(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !job) return null;

  // Format Salary / Rate for header
  const formatRate = () => {
    if (!job.salary || (!job.salary.min && !job.salary.max))
      return "$50-$60 per hour";
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
      return `₹${minLPA}–${maxLPA} LPA`;
    }
    const minK = min >= 1000 ? `${Math.round(min / 1000)}k` : min;
    const maxK = max >= 1000 ? `${Math.round(max / 1000)}k` : max;
    return `${symbol}${minK}-$${maxK} ${periodLabel}`;
  };

  // Filter other recommended roles for Step 2
  const otherRoles = allJobs.filter((j) => j._id !== job._id).slice(0, 3);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Full legal name is required.");
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMsg("A valid email address is required.");
      return;
    }
    if (!noLinkedin && !linkedinUrl.trim()) {
      setErrorMsg(
        'Please enter your LinkedIn profile URL or check "I don\'t have a LinkedIn".',
      );
      return;
    }

    // Move to step 2 ("Before you apply")
    setStep("recommendations");
  };

  const handleFinalizeApplication = async (targetJobId?: string) => {
    const selectedJobId = targetJobId || job._id;
    const targetJobObj =
      allJobs.find((j) => j._id === selectedJobId) ||
      (selectedJobId === job._id ? job : null);

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let createdApp: any = null;

      // 1. Try to record application on backend API
      try {
        const applicantNotes = fullName
          ? `Direct Application • Candidate: ${fullName}${email ? ` (${email})` : ""}${
              linkedinUrl ? ` • LinkedIn: ${linkedinUrl}` : ""
            }`
          : "Direct Manual Application";

        createdApp = await applicationService.createApplication({
          jobId: selectedJobId,
          source: "manual",
          status: "submitted",
          matchScore: targetJobObj?.matchScore || 80,
          notes: applicantNotes,
        });
      } catch (apiErr) {
        console.warn("Backend application record warning (falling back to client cache):", apiErr);
      }

      // 2. Persist to localStorage for instant synchronization across all tabs and boards
      if (typeof window !== "undefined") {
        try {
          // A. Update applied job IDs list
          const savedStr = localStorage.getItem("resumebuildai_applied_jobs");
          const savedIds: string[] = savedStr ? JSON.parse(savedStr) : [];
          if (!savedIds.includes(selectedJobId)) {
            savedIds.push(selectedJobId);
            localStorage.setItem(
              "resumebuildai_applied_jobs",
              JSON.stringify(savedIds),
            );
          }

          // B. Update full applied records list
          const recordsStr = localStorage.getItem("resumebuildai_applied_records");
          const records: any[] = recordsStr ? JSON.parse(recordsStr) : [];
          const existingIdx = records.findIndex(
            (r: any) => (r.job?._id || r.jobId) === selectedJobId,
          );

          const recordItem = {
            _id: createdApp?._id || `local_app_${selectedJobId}_${Date.now()}`,
            jobId: selectedJobId,
            job: targetJobObj || createdApp?.job || job,
            source: "manual",
            status: "submitted",
            matchScore: targetJobObj?.matchScore || createdApp?.matchScore || 80,
            appliedAt: new Date().toISOString(),
            notes: fullName ? `Applicant: ${fullName}` : "",
            applicantDetails: {
              fullName,
              email,
              linkedinUrl: noLinkedin ? "" : linkedinUrl,
            },
          };

          if (existingIdx >= 0) {
            records[existingIdx] = recordItem;
          } else {
            records.unshift(recordItem);
          }
          localStorage.setItem(
            "resumebuildai_applied_records",
            JSON.stringify(records),
          );
        } catch (storageErr) {
          console.warn("LocalStorage save warning:", storageErr);
        }
      }

      onSuccess(selectedJobId, targetJobObj, createdApp);
      onClose();
    } catch (err: any) {
      console.error("Failed to finalize application:", err);
      onSuccess(selectedJobId, targetJobObj, null);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition z-10 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {step === "form" ? (
            /* STEP 1: INITIAL APPLICATION FORM */
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight pr-8">
                  {job.title}
                </h2>
                <p className="text-sm font-semibold text-ink-soft mt-1">
                  {formatRate()}
                </p>
              </div>

              <div className="border-t border-border/70" />

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                {/* Full legal name */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Full legal name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full input-base text-sm py-2.5 px-3.5 focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full input-base text-sm py-2.5 px-3.5 focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* LinkedIn URL */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    LinkedIn URL *
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/in/..."
                    disabled={noLinkedin}
                    className="w-full input-base text-sm py-2.5 px-3.5 disabled:opacity-50 disabled:bg-surface-alt focus:ring-2 focus:ring-primary/40"
                  />

                  {/* Checkbox: I don't have a LinkedIn */}
                  <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={noLinkedin}
                      onChange={(e) => {
                        setNoLinkedin(e.target.checked);
                        if (e.target.checked) setLinkedinUrl("");
                      }}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-xs text-ink-soft font-medium">
                      I don&apos;t have a LinkedIn
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-brand hover:bg-[#4335dc] text-white font-bold py-3 px-5 rounded-2xl transition-all shadow-md active:scale-[0.99] cursor-pointer text-sm"
                  >
                    Start application
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 2: BEFORE YOU APPLY (INTERSTITIAL) */
            <div className="p-6 sm:p-8 space-y-6 text-center">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                  Before you apply
                </h2>
                <p className="text-xs sm:text-sm text-ink-soft mt-1.5">
                  Here are other open roles you might want to consider.
                </p>
              </div>

              <div className="text-left space-y-3">
                <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">
                  Other roles hiring now:
                </p>

                <div className="border border-border rounded-2xl divide-y divide-border overflow-hidden bg-surface-alt/30">
                  {otherRoles.length > 0 ? (
                    otherRoles.map((role) => (
                      <div
                        key={role._id}
                        onClick={() => handleFinalizeApplication(role._id)}
                        className="p-4 flex items-center justify-between gap-3 hover:bg-surface-alt cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl border border-border bg-card grid place-items-center shrink-0 text-ink-soft group-hover:text-primary transition">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-ink truncate group-hover:text-primary transition">
                              {role.title}
                            </p>
                            <p className="text-[11px] text-ink-soft capitalize mt-0.5">
                              {role.employmentType}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-ink-soft/60 group-hover:text-primary group-hover:translate-x-1 transition shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-ink-soft text-center">
                      No other immediate roles found.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleFinalizeApplication()}
                  className="w-full py-3 px-4 rounded-2xl border border-border font-bold text-xs sm:text-sm text-ink hover:bg-surface-alt transition cursor-pointer"
                >
                  Keep browsing
                </button>

                <button
                  type="button"
                  onClick={() => handleFinalizeApplication()}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-2xl bg-[#5345ec] hover:bg-[#4335dc] font-bold text-xs sm:text-sm text-white shadow-md transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Continue to this role</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
