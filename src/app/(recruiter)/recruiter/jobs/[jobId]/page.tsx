"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, MapPin, Search, User, FileText } from "lucide-react";
import { recruiterService } from "@/features/recruiter/services/recruiterService";
import { Applicant, RecruiterJob } from "@/features/recruiter/types";
import { ApplicantResumeModal } from "@/features/recruiter/components/ApplicantResumeModal";

const STATUS_OPTIONS = ["submitted", "reviewing", "shortlisted", "interviewing", "offered", "rejected"];

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;

  const [job, setJob] = useState<RecruiterJob | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedApplicantForResume, setSelectedApplicantForResume] = useState<Applicant | null>(null);

  useEffect(() => {
    if (!jobId) return;
    Promise.all([recruiterService.getMyJobById(jobId), recruiterService.getApplicantsForJob(jobId)])
      .then(([jobData, applicantsData]) => {
        setJob(jobData);
        setApplicants(applicantsData);
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusChange = async (applicationId: string, status: string) => {
    setUpdatingId(applicationId);
    try {
      const updated = await recruiterService.updateApplicantStatus(applicationId, status);
      setApplicants((prev) => prev.map((a) => (a._id === applicationId ? { ...a, ...updated } : a)));
      if (selectedApplicantForResume?._id === applicationId) {
        setSelectedApplicantForResume((prev) => (prev ? { ...prev, ...updated, status } : null));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-ink-soft">
        <Loader2 className="w-6 h-6 animate-spin text-primary-glow" />
      </div>
    );
  }

  if (!job) {
    return <div className="p-10 text-center text-ink-soft text-sm">Job not found.</div>;
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto">
      <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-ink tracking-tight">{job.title}</h1>
            <div className="flex items-center gap-1.5 text-sm text-ink-soft mt-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {job.location?.country || "Remote"}
              {job.salaryText && <span className="ml-2">· {job.salaryText}</span>}
            </div>
          </div>
          <Link
            href={`/recruiter/cv-search?jobId=${job._id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold bg-surface-alt border border-border text-ink px-4 py-2.5 rounded-xl hover:bg-surface transition"
          >
            <Search className="w-4 h-4 text-primary-glow" />
            Source Candidates
          </Link>
        </div>
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {job.skills.map((s) => (
              <span
                key={s}
                className="text-[10px] font-semibold text-primary-glow bg-primary/10 px-2 py-1 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-2xl shadow-elegant p-6">
        <h2 className="text-sm font-bold text-ink mb-4">Applicants ({applicants.length})</h2>

        {applicants.length === 0 ? (
          <p className="text-sm text-ink-soft text-center py-8">
            No applicants yet. Share the job or source candidates to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {applicants.map((a) => (
              <div
                key={a._id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border hover:bg-surface-alt/50 transition flex-wrap"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {a.candidate?.avatarUrl ? (
                    <img
                      src={a.candidate.avatarUrl}
                      alt={a.candidate.fullName || ""}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-border shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-brand text-primary-foreground font-bold text-xs flex items-center justify-center shadow-glow shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-ink truncate">
                      {a.candidate?.fullName || a.candidate?.username || "Candidate"}
                    </div>
                    <div className="text-xs text-ink-soft truncate flex items-center gap-1.5 mt-0.5">
                      <span className="font-medium text-ink">{a.resume?.title || "Applied Resume"}</span>
                      {a.candidate?.email && <span>· {a.candidate.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2.5 py-1 rounded-full">
                    {a.matchScore || 0}% match
                  </span>

                  {/* View Resume Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedApplicantForResume(a)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Resume</span>
                  </button>

                  <select
                    value={a.status}
                    disabled={updatingId === a._id}
                    onChange={(e) => handleStatusChange(a._id, e.target.value)}
                    className="text-xs font-semibold bg-surface-alt border border-border rounded-xl px-2.5 py-1.5 capitalize disabled:opacity-50 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applicant Resume Modal */}
      <ApplicantResumeModal
        isOpen={!!selectedApplicantForResume}
        applicant={selectedApplicantForResume}
        onClose={() => setSelectedApplicantForResume(null)}
        onStatusChange={handleStatusChange}
        isUpdatingStatus={updatingId === selectedApplicantForResume?._id}
      />
    </div>
  );
}
