"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, User, FileText } from "lucide-react";
import { recruiterService } from "@/features/recruiter/services/recruiterService";
import { AllApplicant, Applicant } from "@/features/recruiter/types";
import { ApplicantResumeModal } from "@/features/recruiter/components/ApplicantResumeModal";
import { CandidateProfileModal } from "@/features/recruiter/components/CandidateProfileModal";

export default function CandidatesPage() {
  const [applicants, setApplicants] = useState<AllApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicantForResume, setSelectedApplicantForResume] = useState<Applicant | null>(null);
  const [selectedApplicantForProfile, setSelectedApplicantForProfile] = useState<Applicant | null>(null);

  useEffect(() => {
    recruiterService
      .getAllApplicants()
      .then(setApplicants)
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Candidates</h1>
        <p className="text-ink-soft mt-1 text-sm">All applicants across every job you&apos;ve posted.</p>
      </div>

      {applicants.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-10 text-center text-ink-soft text-sm">
          No applicants yet.
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl shadow-elegant overflow-hidden">
          <div className="divide-y divide-border">
            {applicants.map((a) => {
              const fullApplicant: Applicant = {
                _id: a._id,
                candidate: a.candidate,
                resume: a.resume,
                status: a.status,
                matchScore: a.matchScore,
                assessmentScore: a.assessmentScore,
                aiScore: a.aiScore,
                notes: "",
                appliedAt: a.appliedAt,
              };

              return (
                <div
                  key={a._id}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-surface-alt/50 transition flex-wrap"
                >
                  <div
                    onClick={() => setSelectedApplicantForProfile(fullApplicant)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group"
                  >
                    {a.candidate?.avatarUrl ? (
                      <img
                        src={a.candidate.avatarUrl}
                        alt={a.candidate.fullName || ""}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-border group-hover:ring-primary transition shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-brand text-primary-foreground font-bold text-xs flex items-center justify-center shadow-glow group-hover:scale-105 transition shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-ink truncate group-hover:text-primary transition">
                        {a.candidate?.fullName || a.candidate?.username || "Candidate"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-ink-soft truncate mt-0.5">
                        <Link
                          href={`/recruiter/jobs/${a.jobId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary-glow hover:underline truncate font-medium"
                        >
                          {a.jobTitle}
                        </Link>
                        {a.resume?.title && (
                          <span>· {a.resume.title}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2.5 py-1 rounded-full">
                      {a.matchScore || 0}% match
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedApplicantForResume(fullApplicant)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Resume</span>
                    </button>

                    <span className="text-[11px] font-semibold text-ink-soft bg-surface-alt border border-border rounded-lg px-2.5 py-1 capitalize">
                      {a.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Candidate Profile Modal */}
      <CandidateProfileModal
        isOpen={!!selectedApplicantForProfile}
        applicant={selectedApplicantForProfile}
        candidate={selectedApplicantForProfile?.candidate || null}
        onClose={() => setSelectedApplicantForProfile(null)}
        onViewResume={() => {
          setSelectedApplicantForResume(selectedApplicantForProfile);
          setSelectedApplicantForProfile(null);
        }}
      />

      {/* Actual Applicant PDF Resume Modal */}
      <ApplicantResumeModal
        isOpen={!!selectedApplicantForResume}
        applicant={selectedApplicantForResume}
        onClose={() => setSelectedApplicantForResume(null)}
      />
    </div>
  );
}
