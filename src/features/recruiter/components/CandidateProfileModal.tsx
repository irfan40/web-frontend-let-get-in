"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
  Code,
  Award,
  Calendar,
  FileText,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Applicant } from "../types";

export interface CandidateProfileModalProps {
  isOpen: boolean;
  candidate: {
    _id?: string;
    fullName?: string;
    username?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    headline?: string;
    location?: string;
    skills?: string[];
    matchScore?: number;
    experiences?: any[];
    educations?: any[];
    projects?: any[];
    certificates?: any[];
    bio?: string;
    academicPercentage?: number;
  } | null;
  applicant?: Applicant | null;
  onClose: () => void;
  onViewResume?: () => void;
  onStatusChange?: (applicationId: string, newStatus: string) => void;
  isUpdatingStatus?: boolean;
}

const STATUS_OPTIONS = [
  "submitted",
  "reviewing",
  "shortlisted",
  "interviewing",
  "offered",
  "rejected",
];

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  isOpen,
  candidate,
  applicant,
  onClose,
  onViewResume,
  onStatusChange,
  isUpdatingStatus,
}) => {
  if (!isOpen || (!candidate && !applicant)) return null;

  const cand = applicant?.candidate || candidate;
  const resume = applicant?.resume;
  const content = resume?.content;
  const personal = content?.personalInfo;

  const displayName =
    personal?.fullName ||
    cand?.fullName ||
    cand?.username ||
    "Candidate";

  const email = personal?.email || cand?.email || "";
  const phone = personal?.phone || cand?.phone || "";
  const location = personal?.location || (candidate as any)?.location || "";
  const website = personal?.websiteUrl || "";
  const headline =
    personal?.headline || (candidate as any)?.headline || "Professional Candidate";
  const summary = content?.summary || (candidate as any)?.bio || "";
  const experiences = content?.experiences || (candidate as any)?.experiences || [];
  const educations = content?.educations || (candidate as any)?.educations || [];
  const skills = content?.skills || (candidate as any)?.skills || [];
  const projects = content?.projects || (candidate as any)?.projects || [];
  const certificates = content?.certificates || (candidate as any)?.certificates || [];
  const matchScore = applicant?.matchScore ?? (candidate as any)?.matchScore ?? 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="bg-card border border-border rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="p-5 sm:p-6 border-b border-border bg-surface-alt/70 flex items-center justify-between gap-4 flex-wrap shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              {cand?.avatarUrl ? (
                <img
                  src={cand.avatarUrl}
                  alt={displayName}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary-glow/40 shadow-sm shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-primary-foreground font-extrabold text-base flex items-center justify-center shadow-glow shrink-0">
                  <User className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-ink tracking-tight truncate">
                    {displayName}
                  </h2>
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                    {matchScore}% match
                  </span>
                </div>
                <p className="text-xs text-ink-soft truncate font-medium mt-0.5">
                  {headline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onViewResume && (
                <button
                  type="button"
                  onClick={onViewResume}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-primary text-white hover:bg-primary-dark px-3 py-2 rounded-xl transition shadow-sm cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Full Resume</span>
                </button>
              )}

              {applicant && onStatusChange && (
                <div className="flex items-center gap-1 bg-surface border border-border px-2 py-1.5 rounded-xl">
                  <span className="text-[10px] font-bold text-ink-soft uppercase hidden sm:inline">Status:</span>
                  <select
                    value={applicant.status}
                    disabled={isUpdatingStatus}
                    onChange={(e) => onStatusChange(applicant._id, e.target.value)}
                    className="text-xs font-bold bg-transparent text-ink capitalize cursor-pointer focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface border border-border transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Profile Details Content */}
          <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Contact Information Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-surface-alt/40 border border-border/70 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">Email</span>
                {email ? (
                  <a href={`mailto:${email}`} className="font-semibold text-ink hover:text-primary transition truncate flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-primary-glow shrink-0" />
                    <span className="truncate">{email}</span>
                  </a>
                ) : (
                  <span className="text-ink-soft font-medium">Not revealed</span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">Phone</span>
                {phone ? (
                  <a href={`tel:${phone}`} className="font-semibold text-ink hover:text-primary transition truncate flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-primary-glow shrink-0" />
                    <span>{phone}</span>
                  </a>
                ) : (
                  <span className="text-ink-soft font-medium">Not revealed</span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft block">Location</span>
                <span className="font-semibold text-ink flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-primary-glow shrink-0" />
                  <span>{location || "Remote / Global"}</span>
                </span>
              </div>
            </div>

            {/* About / Summary */}
            {summary && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink">
                  <Sparkles className="w-3.5 h-3.5 text-primary-glow" />
                  <span>About & Summary</span>
                </div>
                <p className="text-xs sm:text-sm text-ink-soft leading-relaxed bg-surface p-4 rounded-2xl border border-border">
                  {summary}
                </p>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink">
                  <Code className="w-3.5 h-3.5 text-primary-glow" />
                  <span>Core Skills</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s: any, idx: number) => {
                    const skillName = typeof s === "string" ? s : s?.name;
                    if (!skillName) return null;
                    return (
                      <span
                        key={idx}
                        className="text-xs font-semibold text-primary-glow bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl shadow-xs"
                      >
                        {skillName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Work Experiences */}
            {experiences.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink">
                  <Briefcase className="w-3.5 h-3.5 text-primary-glow" />
                  <span>Experience History</span>
                </div>
                <div className="space-y-3">
                  {experiences.map((exp: any, idx: number) => (
                    <div
                      key={exp.id || idx}
                      className="p-4 rounded-2xl bg-surface border border-border space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-ink">
                            {exp.position || "Position"}
                          </h4>
                          <p className="text-xs font-semibold text-primary-glow">
                            {exp.company || "Company"} {exp.location ? `· ${exp.location}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-ink-soft">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {exp.startDate || ""} – {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                          </span>
                        </div>
                      </div>
                      {exp.highlights && (
                        <p className="text-xs text-ink-soft pt-1 leading-relaxed">
                          {Array.isArray(exp.highlights) ? exp.highlights.join(" · ") : exp.highlights}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Educations */}
            {educations.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink">
                  <GraduationCap className="w-3.5 h-3.5 text-primary-glow" />
                  <span>Education</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {educations.map((edu: any, idx: number) => (
                    <div
                      key={edu.id || idx}
                      className="p-3.5 rounded-2xl bg-surface border border-border space-y-1"
                    >
                      <h4 className="text-xs sm:text-sm font-bold text-ink">
                        {edu.degree || edu.fieldOfStudy || "Degree"}
                      </h4>
                      <p className="text-xs font-semibold text-ink-soft">
                        {edu.institution || "Institution"}
                      </p>
                      <div className="text-[11px] text-ink-soft pt-0.5">
                        {edu.startDate || ""} {edu.endDate ? `– ${edu.endDate}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
