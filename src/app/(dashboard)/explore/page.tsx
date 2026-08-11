"use client";

import React, { useState, useEffect, useCallback } from "react";
import { jobService } from "@/features/jobs/services/jobService";
import {
  IJob,
  JobFilterParams,
  CandidateProfileSummary,
} from "@/features/jobs/types/job.types";
import { JobCard } from "@/features/jobs/components/JobCard";
import { JobDetailPanel } from "@/features/jobs/components/JobDetailPanel";
import { JobApplyModal } from "@/features/jobs/components/JobApplyModal";
import { JobFilters } from "@/features/jobs/components/JobFilters";
import { ExploreHero } from "@/features/jobs/components/ExploreHero";
import {
  Sparkles,
  Globe,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Layers,
  CheckCircle2,
} from "lucide-react";

type TabMode = "recommendations" | "all" | "saved";

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<TabMode>("recommendations");
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [candidateProfile, setCandidateProfile] = useState<
    CandidateProfileSummary | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pagination & Filter state
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<JobFilterParams>({
    page: 1,
    limit: 12,
    sort: "recommended",
    workplaceType: "all",
    experienceLevel: "all",
    employmentType: "all",
  });

  // Selected Job for Split-View Details
  const [selectedJob, setSelectedJob] = useState<IJob | null>(null);

  // Apply Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [jobToApply, setJobToApply] = useState<IJob | null>(null);

  // Applied Jobs Tracking (localStorage)
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("resumebuildai_applied_jobs");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Saved Jobs in localStorage
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("resumebuildai_saved_jobs");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleSave = (jobId: string) => {
    setSavedJobIds((prev) => {
      const next = prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];
      if (typeof window !== "undefined") {
        localStorage.setItem("resumebuildai_saved_jobs", JSON.stringify(next));
      }
      return next;
    });
  };

  const handleApplicationSuccess = (jobId: string) => {
    setAppliedJobIds((prev) => {
      const next = prev.includes(jobId) ? prev : [...prev, jobId];
      if (typeof window !== "undefined") {
        localStorage.setItem("resumebuildai_applied_jobs", JSON.stringify(next));
      }
      return next;
    });
    showToast("Application submitted successfully! Our team will review your profile.");
  };

  // Fetch jobs based on current tab and filters
  const fetchJobs = useCallback(
    async (isCancelledCheck: () => boolean = () => false) => {
      setIsLoading(true);
      setError(null);

      try {
        if (activeTab === "recommendations") {
          const data = await jobService.getRecommendations(filters);
          if (!isCancelledCheck()) {
            const jobList = data?.jobs || (Array.isArray(data) ? data : []);
            setJobs(jobList);
            setTotal(data?.total ?? jobList.length);
            setTotalPages(data?.totalPages ?? 1);
            setCandidateProfile(data?.candidateProfile);
            // Default selected job to the first job if not selected
            if (jobList.length > 0) {
              setSelectedJob((prev) => prev || jobList[0]);
            }
          }
        } else if (activeTab === "all") {
          const data = await jobService.getJobs(filters);
          if (!isCancelledCheck()) {
            const jobList = data?.jobs || (Array.isArray(data) ? data : []);
            setJobs(jobList);
            setTotal(data?.total ?? jobList.length);
            setTotalPages(data?.totalPages ?? 1);
            if (jobList.length > 0) {
              setSelectedJob((prev) => prev || jobList[0]);
            }
          }
        } else if (activeTab === "saved") {
          const data = await jobService.getJobs({ limit: 100 });
          if (!isCancelledCheck()) {
            const jobList = data?.jobs || (Array.isArray(data) ? data : []);
            const filtered = jobList.filter((j: any) =>
              savedJobIds.includes(j._id),
            );
            setJobs(filtered);
            setTotal(filtered.length);
            setTotalPages(1);
            if (filtered.length > 0) {
              setSelectedJob((prev) => prev || filtered[0]);
            }
          }
        }
      } catch (err: any) {
        if (!isCancelledCheck()) {
          console.error("Failed to load jobs:", err);
          const errMsg =
            err?.error?.message ||
            err?.message ||
            (typeof err === "string"
              ? err
              : "Unable to connect to job recommendation service. Please check your backend connection.");
          setError(errMsg);
        }
      } finally {
        if (!isCancelledCheck()) {
          setIsLoading(false);
        }
      }
    },
    [activeTab, filters, activeTab === "saved" ? savedJobIds : null],
  );

  useEffect(() => {
    let isCancelled = false;
    fetchJobs(() => isCancelled);

    return () => {
      isCancelled = true;
    };
  }, [fetchJobs]);

  const handleSyncProfile = async () => {
    setIsSyncing(true);
    try {
      await jobService.syncProfile();
      await fetchJobs();
      showToast("Candidate profile & embeddings re-synced!");
    } catch (err: any) {
      console.warn("Sync profile warning:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sort: "recommended",
      workplaceType: "all",
      experienceLevel: "all",
      employmentType: "all",
      search: "",
      minScore: undefined,
    });
  };

  // Open apply modal for a specific job
  const handleOpenApplyModal = (job: IJob) => {
    setJobToApply(job);
    setIsApplyModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#5345ec] text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner with Candidate Profile Insights */}
      <ExploreHero
        candidateProfile={candidateProfile}
        onSyncProfile={handleSyncProfile}
        isSyncing={isSyncing}
      />

      {/* Tabs Bar & Quick Switcher */}
      <div className="flex items-center justify-between gap-4 border-b border-border/80 pb-3 flex-wrap">
        <div className="flex items-center gap-2 bg-surface-alt/70 p-1 rounded-2xl border border-border/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab("recommendations");
              setFilters((f) => ({ ...f, page: 1, sort: "recommended" }));
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "recommendations"
                ? "bg-card text-primary shadow-xs border border-border/80"
                : "text-ink-soft hover:text-ink hover:bg-card/50"
            }`}
          >
            <Sparkles className="w-4 h-4 text-primary-glow" />
            <span>AI Matches For You</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setFilters((f) => ({ ...f, page: 1, sort: "recent" }));
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-card text-primary shadow-xs border border-border/80"
                : "text-ink-soft hover:text-ink hover:bg-card/50"
            }`}
          >
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Browse All Roles</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("saved");
              setFilters((f) => ({ ...f, page: 1 }));
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "saved"
                ? "bg-card text-primary shadow-xs border border-border/80"
                : "text-ink-soft hover:text-ink hover:bg-card/50"
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>Saved Roles ({savedJobIds.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      {activeTab !== "saved" && (
        <JobFilters
          filters={filters}
          onChange={(newFilters) => setFilters(newFilters)}
          onReset={handleResetFilters}
          totalResults={total}
        />
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchJobs()}
            className="font-semibold underline hover:no-underline text-xs"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Split-Screen Master-Detail Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Skeleton Left List */}
          <div className="lg:col-span-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-card border border-border p-5 space-y-3 animate-pulse h-32"
              />
            ))}
          </div>

          {/* Skeleton Right Detail Panel */}
          <div className="lg:col-span-7 rounded-3xl bg-card border border-border p-8 h-[600px] animate-pulse" />
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Job Cards List */}
          <div className="lg:col-span-5 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto pr-1 scrollbar-thin">
            {jobs.map((job) => {
              const isSelected = (selectedJob?._id || jobs[0]?._id) === job._id;
              const isApplied = appliedJobIds.includes(job._id);
              const isSaved = savedJobIds.includes(job._id);

              return (
                <JobCard
                  key={job._id}
                  job={job}
                  isSelected={isSelected}
                  onSelect={(j) => setSelectedJob(j)}
                  isSaved={isSaved}
                  onToggleSave={handleToggleSave}
                  isApplied={isApplied}
                />
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
                <p className="text-xs text-ink-soft">
                  Page <span className="font-bold text-ink">{filters.page}</span> of{" "}
                  <span className="font-bold text-ink">{totalPages}</span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={(filters.page || 1) <= 1}
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        page: Math.max(1, (f.page || 1) - 1),
                      }))
                    }
                    className="p-1.5 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-semibold px-2.5 py-1 bg-surface-alt rounded-lg border border-border text-ink">
                    {filters.page}
                  </span>

                  <button
                    type="button"
                    disabled={(filters.page || 1) >= totalPages}
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        page: Math.min(totalPages, (f.page || 1) + 1),
                      }))
                    }
                    className="p-1.5 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Detail Panel */}
          <div className="lg:col-span-7 sticky top-4 max-h-[calc(100vh-140px)] flex flex-col">
            <JobDetailPanel
              job={selectedJob || jobs[0] || null}
              isSaved={savedJobIds.includes((selectedJob || jobs[0])?._id || "")}
              onToggleSave={handleToggleSave}
              onStartApplication={handleOpenApplyModal}
              isApplied={appliedJobIds.includes((selectedJob || jobs[0])?._id || "")}
            />
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-lg text-ink">No roles found</h3>
          <p className="text-sm text-ink-soft">
            {activeTab === "saved"
              ? "You have not saved any jobs yet. Browse recommendations and bookmark roles you want to apply for later."
              : "No jobs match your current search and filter criteria. Try adjusting filters or clearing search terms."}
          </p>
          {activeTab !== "saved" && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 bg-primary text-white font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-primary-deep transition shadow-xs"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Multi-Step Application Modal */}
      <JobApplyModal
        isOpen={isApplyModalOpen}
        job={jobToApply}
        allJobs={jobs}
        onClose={() => {
          setIsApplyModalOpen(false);
          setJobToApply(null);
        }}
        onSuccess={handleApplicationSuccess}
      />
    </div>
  );
}
