"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { recruiterService } from "@/features/recruiter/services/recruiterService";
import { RecruiterJob } from "@/features/recruiter/types";

const STAGE_LABELS: Record<string, string> = {
  open: "Open",
  shortlisting: "Shortlisting",
  interview: "Interview",
  review: "Review",
  completed: "Completed",
};

export default function TrackApplicantsPage() {
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recruiterService
      .getMyJobs()
      .then(setJobs)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-ink-soft">
        <Loader2 className="w-6 h-6 animate-spin text-primary-glow" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Track Applicants</h1>
        <p className="text-ink-soft mt-1 text-sm">A list view of every job and its current pipeline stage.</p>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center text-ink-soft text-sm">
          No jobs yet.
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl shadow-elegant overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((job) => (
                <tr key={job._id} className="hover:bg-surface-alt/50 transition">
                  <td className="px-4 py-3">
                    <Link href={`/recruiter/jobs/${job._id}`} className="font-semibold text-ink hover:text-primary-glow">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{job.location?.country || "Remote"}</td>
                  <td className="px-4 py-3 text-ink-soft capitalize">{job.employmentType?.replace("-", " ")}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-semibold text-primary-glow bg-primary/10 px-2 py-1 rounded-full">
                      {STAGE_LABELS[job.recruiterStage || "open"]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
