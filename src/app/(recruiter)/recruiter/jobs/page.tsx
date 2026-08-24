"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, FileText, Loader2, MapPin, PlusCircle, RefreshCw, Sparkles, Users } from "lucide-react";
import { recruiterService } from "@/features/recruiter/services/recruiterService";
import { RecruiterJob, RecruiterJobStage } from "@/features/recruiter/types";

const STAGES: {
  value: RecruiterJobStage;
  label: string;
  badgeClass: string;
}[] = [
  { value: "open", label: "Open", badgeClass: "bg-primary/10 text-primary-glow" },
  { value: "shortlisting", label: "Shortlisting", badgeClass: "bg-amber-500/10 text-amber-600" },
  { value: "interview", label: "Interview", badgeClass: "bg-purple-500/10 text-purple-600" },
  { value: "review", label: "Review", badgeClass: "bg-rose-500/10 text-rose-600" },
  { value: "completed", label: "Completed", badgeClass: "bg-emerald-500/10 text-emerald-600" },
];

export default function KanbanJobsPage() {
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [dragJobId, setDragJobId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<RecruiterJobStage | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  const loadJobs = useCallback(() => {
    setLoading(true);
    setError(null);
    recruiterService
      .getMyJobs()
      .then(setJobs)
      .catch(() => setError("Unable to load jobs."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const moveJobToStage = async (jobId: string, stage: RecruiterJobStage) => {
    const job = jobs.find((j) => j._id === jobId);
    if (!job || (job.recruiterStage || "open") === stage) return;

    const previousStage = job.recruiterStage || "open";
    setMoveError(null);
    // Optimistic update — the board reflects the move immediately.
    setJobs((prev) => prev.map((j) => (j._id === jobId ? { ...j, recruiterStage: stage } : j)));
    setUpdatingId(jobId);
    try {
      const updated = await recruiterService.updateJobStage(jobId, stage);
      setJobs((prev) => prev.map((j) => (j._id === jobId ? updated : j)));
    } catch (err: unknown) {
      // Revert on failure.
      setJobs((prev) => prev.map((j) => (j._id === jobId ? { ...j, recruiterStage: previousStage } : j)));
      setMoveError((err as { message?: string })?.message || "Failed to update job status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, stage: RecruiterJobStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const jobId = e.dataTransfer.getData("text/plain") || dragJobId;
    if (jobId) moveJobToStage(jobId, stage);
    setDragJobId(null);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-ink-soft gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary-glow" />
        <p className="text-sm font-medium">Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-3 px-6">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="text-sm text-ink-soft">{error}</p>
        <button
          onClick={loadJobs}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-glow border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="flex items-start justify-between mb-2 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Jobs board</h1>
          <p className="text-ink-soft mt-1 text-sm">Drag a card between columns to update its status.</p>
        </div>
        <Link
          href="/recruiter/jobs/create"
          className="inline-flex items-center gap-2 text-xs font-semibold bg-gradient-brand text-primary-foreground px-4 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          New job
        </Link>
      </div>

      {moveError && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2 mb-4 inline-block">
          {moveError}
        </p>
      )}

      {jobs.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center mt-6">
          <h2 className="text-base font-bold text-ink">No jobs yet</h2>
          <p className="text-sm text-ink-soft mt-1.5 max-w-sm mx-auto">
            Create your first job to start your hiring pipeline.
          </p>
          <Link
            href="/recruiter/jobs/create"
            className="inline-flex items-center gap-2 mt-5 text-xs font-semibold bg-gradient-brand text-primary-foreground px-5 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Create new job
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageJobs = jobs.filter((j) => (j.recruiterStage || "open") === stage.value);
            const isDropTarget = dragOverStage === stage.value;
            return (
              <div
                key={stage.value}
                className="w-[260px] shrink-0"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStage(stage.value);
                }}
                onDragLeave={() => setDragOverStage((s) => (s === stage.value ? null : s))}
                onDrop={(e) => handleDrop(e, stage.value)}
              >
                <div className="flex items-center gap-2 px-1 mb-2.5">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stage.badgeClass}`}>{stage.label}</span>
                  <span className="text-[10px] font-bold text-ink-soft">{stageJobs.length}</span>
                </div>
                <div
                  className={`space-y-3 min-h-[120px] rounded-2xl p-1.5 transition ${
                    isDropTarget ? "bg-primary/5 ring-2 ring-primary/30" : ""
                  }`}
                >
                  {stageJobs.length === 0 ? (
                    <div className="border border-dashed border-border rounded-2xl p-4 text-center text-[11px] text-ink-soft">
                      No jobs in this stage
                    </div>
                  ) : (
                    stageJobs.map((job) => (
                      <JobCard
                        key={job._id}
                        job={job}
                        isDragging={dragJobId === job._id}
                        isUpdating={updatingId === job._id}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", job._id);
                          e.dataTransfer.effectAllowed = "move";
                          setDragJobId(job._id);
                        }}
                        onDragEnd={() => {
                          setDragJobId(null);
                          setDragOverStage(null);
                        }}
                        onStageSelect={(s) => moveJobToStage(job._id, s)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function JobCard({
  job,
  isDragging,
  isUpdating,
  onDragStart,
  onDragEnd,
  onStageSelect,
}: {
  job: RecruiterJob;
  isDragging: boolean;
  isUpdating: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onStageSelect: (stage: RecruiterJobStage) => void;
}) {
  const pipeline = job.pipelineOptions;
  const hasAnyPipeline = !!(pipeline && (pipeline.resumeMatch || pipeline.assessment || pipeline.aiInterview));

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-surface border border-border rounded-2xl p-4 shadow-sm hover:shadow-elegant transition cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      } ${isUpdating ? "opacity-70 pointer-events-none" : ""}`}
    >
      <Link href={`/recruiter/jobs/${job._id}`} className="block">
        <h3 className="text-sm font-bold text-ink truncate">{job.title}</h3>
        <div className="flex items-center gap-3 text-[11px] text-ink-soft mt-1.5">
          <span className="flex items-center gap-1 min-w-0">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{job.location?.city ? `${job.location.city}` : job.location?.country || "Remote"}</span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Users className="w-3 h-3" />
            {job.applicantCount ?? 0}
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-1.5 flex-wrap mt-3">
        {hasAnyPipeline ? (
          <>
            {pipeline?.resumeMatch && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-glow bg-primary/10 px-2 py-1 rounded-full">
                <FileText className="w-2.5 h-2.5" /> Resume
              </span>
            )}
            {pipeline?.assessment && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-glow bg-primary/10 px-2 py-1 rounded-full">
                <AlertCircle className="w-2.5 h-2.5" /> Assessment
              </span>
            )}
            {pipeline?.aiInterview && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-glow bg-primary/10 px-2 py-1 rounded-full">
                <Sparkles className="w-2.5 h-2.5" /> AI Interview
              </span>
            )}
          </>
        ) : (
          <span className="text-[10px] text-ink-soft">No automated screening configured</span>
        )}
      </div>

      <div className="flex items-center justify-end mt-3 pt-2 border-t border-border/60">
        <select
          value={job.recruiterStage || "open"}
          disabled={isUpdating}
          onChange={(e) => onStageSelect(e.target.value as RecruiterJobStage)}
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] font-semibold bg-surface-alt border border-border rounded-lg px-1.5 py-1 disabled:opacity-50"
        >
          {STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
