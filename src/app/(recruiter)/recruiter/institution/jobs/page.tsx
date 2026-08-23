"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Loader2, RefreshCw } from "lucide-react";
import { institutionService } from "@/features/institution/services/institutionService";
import { InstitutionJob } from "@/features/institution/types";

export default function InstitutionJobsPage() {
  const [jobs, setJobs] = useState<InstitutionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasConnections, setHasConnections] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([institutionService.getJobs(), institutionService.getConnectedRecruiters()])
      .then(([jobsRes, recruitersRes]) => {
        setJobs(jobsRes);
        setHasConnections(recruitersRes.some((r) => r.status === "active"));
      })
      .catch(() => setError("Unable to load jobs. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">Jobs</h1>
        <p className="text-ink-soft mt-1 text-sm">Open jobs from your connected recruiters.</p>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 bg-destructive/5 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <button onClick={load} className="inline-flex items-center gap-1.5 font-semibold shrink-0 hover:underline">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-10 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary-glow" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl shadow-elegant p-10 text-center">
          <Briefcase className="w-8 h-8 text-ink-soft mx-auto mb-3" />
          {!hasConnections ? (
            <>
              <p className="text-sm text-ink-soft">No recruiter connections yet.</p>
              <Link href="/recruiter/institution/recruiters" className="text-sm font-semibold text-primary-glow hover:underline mt-1.5 inline-block">
                Connect a recruiter to see their jobs
              </Link>
            </>
          ) : (
            <p className="text-sm text-ink-soft">No jobs available yet.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-surface border border-border rounded-2xl shadow-elegant p-5 space-y-3">
              <div>
                <h3 className="font-bold text-ink text-sm">{job.title}</h3>
                <p className="text-xs text-ink-soft mt-0.5">{job.company.name}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="bg-surface-alt text-ink-soft px-2 py-1 rounded-full capitalize">{job.employmentType}</span>
                <span className="bg-surface-alt text-ink-soft px-2 py-1 rounded-full capitalize">{job.workplaceType}</span>
              </div>
              {job.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {job.skills.slice(0, 5).map((skill) => (
                    <span key={skill} className="text-[10px] bg-primary/5 text-primary-glow px-2 py-0.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-ink-soft line-clamp-2">{job.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
