"use client";

import React, { useState } from "react";
import { Search, Heart, Send, CalendarClock, CheckCircle2, XCircle } from "lucide-react";
import { KanbanColumn, KanbanColumnConfig, TrackedJob } from "./KanbanColumn";

const JOB_STATUS_COLUMNS: KanbanColumnConfig[] = [
  {
    id: "saved",
    title: "Saved",
    icon: Heart,
    accentClass: "bg-indigo-500",
    iconWrapClass: "text-indigo-500",
    emptyTitle: "No saved jobs yet",
    emptyDescription: "Jobs you save will appear here.",
  },
  {
    id: "applied",
    title: "Applied",
    icon: Send,
    accentClass: "bg-cyan-500",
    iconWrapClass: "text-cyan-500",
    emptyTitle: "No applied jobs yet",
    emptyDescription: "Jobs you apply to will appear here.",
  },
  {
    id: "interviewing",
    title: "Interviewing",
    icon: CalendarClock,
    accentClass: "bg-blue-500",
    iconWrapClass: "text-blue-500",
    emptyTitle: "No interviews yet",
    emptyDescription: "Jobs with active interview processes will appear here.",
  },
  {
    id: "offered",
    title: "Offered",
    icon: CheckCircle2,
    accentClass: "bg-emerald-500",
    iconWrapClass: "text-emerald-500",
    emptyTitle: "No offers yet",
    emptyDescription: "Jobs where you receive an offer will appear here.",
  },
  {
    id: "rejected",
    title: "Rejected",
    icon: XCircle,
    accentClass: "bg-rose-500",
    iconWrapClass: "text-rose-500",
    emptyTitle: "No rejected jobs",
    emptyDescription: "Jobs that are no longer progressing will appear here.",
  },
];

export function JobsBoard() {
  // Placeholder state for each stage. Will be replaced by real application data fetched
  // from the backend once job/application tracking is implemented - not part of this phase.
  const [savedJobs] = useState<TrackedJob[]>([]);
  const [appliedJobs] = useState<TrackedJob[]>([]);
  const [interviewingJobs] = useState<TrackedJob[]>([]);
  const [offeredJobs] = useState<TrackedJob[]>([]);
  const [rejectedJobs] = useState<TrackedJob[]>([]);

  const jobsByColumn: Record<KanbanColumnConfig["id"], TrackedJob[]> = {
    saved: savedJobs,
    applied: appliedJobs,
    interviewing: interviewingJobs,
    offered: offeredJobs,
    rejected: rejectedJobs,
  };

  const totalJobs = Object.values(jobsByColumn).reduce((sum, jobs) => sum + jobs.length, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-ink">My Jobs</h1>
        <p className="text-xs text-ink-soft mt-1">
          Track your applications across each stage · {totalJobs} jobs
        </p>
      </div>

      {/* Search / Filter Bar (static UI only - no search/filter/sort logic yet) */}
      <div className="bg-surface border border-border rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-soft absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            disabled
            placeholder="Search jobs or companies"
            className="input-base pl-10 disabled:cursor-not-allowed disabled:opacity-70"
          />
        </div>

        <select
          disabled
          defaultValue="all"
          aria-label="Filter by company"
          className="text-xs font-medium px-3 py-2.5 rounded-xl border border-border bg-surface-alt/60 text-ink disabled:cursor-not-allowed disabled:opacity-70"
        >
          <option value="all">All companies</option>
        </select>

        <select
          disabled
          defaultValue="any"
          aria-label="Filter by date"
          className="text-xs font-medium px-3 py-2.5 rounded-xl border border-border bg-surface-alt/60 text-ink disabled:cursor-not-allowed disabled:opacity-70"
        >
          <option value="any">Any date</option>
        </select>

        <select
          disabled
          defaultValue="newest"
          aria-label="Sort jobs"
          className="text-xs font-medium px-3 py-2.5 rounded-xl border border-border bg-surface-alt/60 text-ink disabled:cursor-not-allowed disabled:opacity-70"
        >
          <option value="newest">Newest first</option>
        </select>

        <div className="text-xs text-ink-soft font-medium whitespace-nowrap px-1">
          {totalJobs} of {totalJobs}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-2 -mx-1 px-1 sm:overflow-visible">
        {JOB_STATUS_COLUMNS.map((column) => (
          <KanbanColumn key={column.id} config={column} jobs={jobsByColumn[column.id]} />
        ))}
      </div>
    </div>
  );
}
