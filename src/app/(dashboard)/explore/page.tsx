"use client";

import React, { useState, useEffect, useCallback } from "react";
import { jobService } from "@/features/jobs/services/jobService";
import {
  IJob,
  JobFilterParams,
  CandidateProfileSummary,
} from "@/features/jobs/types/job.types";
import { JobCard } from "@/features/jobs/components/JobCard";
import { JobFilters } from "@/features/jobs/components/JobFilters";
import { JobDetailsModal } from "@/features/jobs/components/JobDetailsModal";
import { ExploreHero } from "@/features/jobs/components/ExploreHero";
import {
  Sparkles,
  Globe,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Layers,
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

  // Selected Job for Modal
  const [selectedJob, setSelectedJob] = useState<IJob | null>(null);

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
          }
        } else if (activeTab === "all") {
          const data = await jobService.getJobs(filters);
          if (!isCancelledCheck()) {
            const jobList = data?.jobs || (Array.isArray(data) ? data : []);
            setJobs(jobList);
            setTotal(data?.total ?? jobList.length);
            setTotalPages(data?.totalPages ?? 1);
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
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
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
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

      {/* Main Jobs Listing Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-card border border-border p-6 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-alt" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-surface-alt rounded-md w-3/4" />
                  <div className="h-3 bg-surface-alt rounded-md w-1/2" />
                </div>
              </div>
              <div className="h-16 bg-surface-alt rounded-xl" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-surface-alt rounded-md" />
                <div className="h-6 w-20 bg-surface-alt rounded-md" />
              </div>
              <div className="h-10 bg-surface-alt rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onSelect={(j) => setSelectedJob(j)}
              isSaved={savedJobIds.includes(job._id)}
              onToggleSave={handleToggleSave}
            />
          ))}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-5">
          <p className="text-xs text-ink-soft">
            Page <span className="font-bold text-ink">{filters.page}</span> of{" "}
            <span className="font-bold text-ink">{totalPages}</span> ({total}{" "}
            total roles)
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
              className="p-2 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold px-3 py-1.5 bg-surface-alt rounded-lg border border-border text-ink">
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
              className="p-2 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Job Details Modal Drawer */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}
