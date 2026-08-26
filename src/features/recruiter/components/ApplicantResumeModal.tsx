"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Printer,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
  Languages,
  Code,
  FolderGit2,
  Calendar,
  ExternalLink,
  User,
  CheckCircle2,
} from "lucide-react";
import { Applicant } from "../types";

interface ApplicantResumeModalProps {
  isOpen: boolean;
  applicant: Applicant | null;
  onClose: () => void;
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

export const ApplicantResumeModal: React.FC<ApplicantResumeModalProps> = ({
  isOpen,
  applicant,
  onClose,
  onStatusChange,
  isUpdatingStatus,
}) => {
  if (!isOpen || !applicant) return null;

  const candidate = applicant.candidate;
  const resume = applicant.resume;
  const content = resume?.content;
  const personal = content?.personalInfo;

  const displayName =
    personal?.fullName ||
    candidate?.fullName ||
    candidate?.username ||
    "Candidate";
  const email = personal?.email || candidate?.email || "";
  const phone = personal?.phone || candidate?.phone || "";
  const location = personal?.location || "";
  const website = personal?.websiteUrl || "";
  const headline =
    personal?.headline || "Applicant Profile & Resume";
  const summary = content?.summary || "";
  const experiences = content?.experiences || [];
  const educations = content?.educations || [];
  const skills = content?.skills || [];
  const projects = content?.projects || [];
  const certificates = content?.certificates || [];
  const languagesList = content?.languages || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="bg-card border border-border rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-border bg-surface-alt/70 flex items-center justify-between gap-4 flex-wrap shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {candidate?.avatarUrl ? (
                <img
                  src={candidate.avatarUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-glow/40 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-brand text-primary-foreground font-extrabold text-sm flex items-center justify-center shadow-glow shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-ink truncate">
                    {displayName}
                  </h2>
                  <span className="text-[10px] font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full">
                    {applicant.matchScore || 0}% match
                  </span>
                </div>
                <p className="text-xs text-ink-soft truncate">
                  Applied: {new Date(applicant.appliedAt).toLocaleDateString()} · Resume: <span className="font-semibold text-ink">{resume?.title || "Submitted Resume"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Status Selector */}
              {onStatusChange && (
                <div className="flex items-center gap-1.5 bg-surface border border-border px-2 py-1 rounded-xl">
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

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface border border-border transition cursor-pointer"
                title="Print Resume"
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Close Button */}
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

          {/* Resume Body Canvas */}
          <div className="overflow-y-auto p-6 sm:p-10 space-y-8 bg-background">
            {/* Candidate Overview Card in Resume */}
            <div className="border-b border-border/80 pb-6 space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                    {displayName}
                  </h1>
                  <p className="text-sm sm:text-base font-semibold text-gradient-brand mt-0.5">
                    {headline}
                  </p>
                </div>
                {resume?.atsScore != null && resume.atsScore > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ATS Score: {resume.atsScore}/100</span>
                  </div>
                )}
              </div>

              {/* Contact Chips */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-ink-soft pt-1">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-1.5 hover:text-primary transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-primary-glow" />
                    <span>{email}</span>
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-1.5 hover:text-primary transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-primary-glow" />
                    <span>{phone}</span>
                  </a>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary-glow" />
                    <span>{location}</span>
                  </span>
                )}
                {website && (
                  <a
                    href={website.startsWith("http") ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{website.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Professional Summary */}
            {summary && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink">
                  <Sparkles className="w-3.5 h-3.5 text-primary-glow" />
                  <span>Professional Summary</span>
                </div>
                <p className="text-sm text-ink-soft leading-relaxed bg-surface-alt/40 p-4 rounded-2xl border border-border/50">
                  {summary}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {experiences.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink border-b border-border/60 pb-2">
                  <Briefcase className="w-3.5 h-3.5 text-primary-glow" />
                  <span>Work Experience</span>
                </div>
                <div className="space-y-4">
                  {experiences.map((exp, idx) => {
                    const highlights = Array.isArray(exp.highlights)
                      ? exp.highlights
                      : typeof exp.highlights === "string"
                        ? exp.highlights.split("\n").filter(Boolean)
                        : [];

                    return (
                      <div
                        key={exp.id || idx}
                        className="bg-surface-alt/30 border border-border/60 p-4 rounded-2xl space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h4 className="text-sm font-bold text-ink">
                              {exp.position || "Position"}
                            </h4>
                            <p className="text-xs font-semibold text-primary-glow">
                              {exp.company || "Company"} {exp.location ? `· ${exp.location}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-ink-soft font-medium">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {exp.startDate || ""} – {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                            </span>
                          </div>
                        </div>

                        {highlights.length > 0 && (
                          <ul className="space-y-1 text-xs text-ink-soft list-disc list-inside pt-1">
                            {highlights.map((h, hIdx) => (
                              <li key={hIdx} className="leading-relaxed">
                                {h}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Education */}
            {educations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink border-b border-border/60 pb-2">
                  <GraduationCap className="w-3.5 h-3.5 text-primary-glow" />
                  <span>Education</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {educations.map((edu, idx) => (
                    <div
                      key={edu.id || idx}
                      className="bg-surface-alt/30 border border-border/60 p-4 rounded-2xl space-y-1"
                    >
                      <h4 className="text-sm font-bold text-ink">
                        {edu.degree || edu.fieldOfStudy || "Degree"}
                      </h4>
                      <p className="text-xs font-semibold text-ink-soft">
                        {edu.institution || "Institution"}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-ink-soft pt-1">
                        <span>
                          {edu.startDate || ""} {edu.endDate ? `– ${edu.endDate}` : ""}
                        </span>
                        {edu.gradeScore && (
                          <span className="font-bold text-ink bg-surface-alt px-2 py-0.5 rounded-md border border-border">
                            {edu.gradeScore}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink border-b border-border/60 pb-2">
                  <Code className="w-3.5 h-3.5 text-primary-glow" />
                  <span>Skills & Competencies</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s, idx) => {
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

            {/* Projects */}
            {projects.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink border-b border-border/60 pb-2">
                  <FolderGit2 className="w-3.5 h-3.5 text-primary-glow" />
                  <span>Key Projects</span>
                </div>
                <div className="space-y-3">
                  {projects.map((proj, idx) => (
                    <div
                      key={proj.id || idx}
                      className="bg-surface-alt/30 border border-border/60 p-4 rounded-2xl space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-ink">
                              {proj.title}
                            </h4>
                            {proj.link && (
                              <a
                                href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-xs inline-flex items-center gap-0.5"
                              >
                                <span>Link</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                          {proj.subtitle && (
                            <p className="text-xs text-ink-soft font-medium">
                              {proj.subtitle}
                            </p>
                          )}
                        </div>
                        {(proj.startDate || proj.endDate) && (
                          <span className="text-[11px] text-ink-soft">
                            {proj.startDate || ""} {proj.endDate ? `– ${proj.endDate}` : ""}
                          </span>
                        )}
                      </div>

                      {proj.description && (
                        <p className="text-xs text-ink-soft leading-relaxed">
                          {proj.description}
                        </p>
                      )}

                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.technologies.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-bold text-ink-soft bg-surface border border-border px-2 py-0.5 rounded-md"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certificates.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink border-b border-border/60 pb-2">
                  <Award className="w-3.5 h-3.5 text-primary-glow" />
                  <span>Certifications</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {certificates.map((cert, idx) => (
                    <div
                      key={cert.id || idx}
                      className="bg-surface-alt/30 border border-border/60 p-3.5 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-ink">
                          {cert.name}
                        </h5>
                        <p className="text-[11px] text-ink-soft">
                          {cert.issuer} {cert.issueDate ? `· ${cert.issueDate}` : ""}
                        </p>
                      </div>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-surface border border-border text-primary hover:bg-surface-alt transition shrink-0"
                          title="View Certificate"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languagesList.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-ink border-b border-border/60 pb-2">
                  <Languages className="w-3.5 h-3.5 text-primary-glow" />
                  <span>Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {languagesList.map((lang, idx) => (
                    <span
                      key={lang.id || idx}
                      className="text-xs font-semibold bg-surface-alt/60 border border-border px-3 py-1.5 rounded-xl text-ink"
                    >
                      {lang.language} {lang.proficiency ? `(${lang.proficiency})` : ""}
                    </span>
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
