"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Zap,
  Sparkles,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Compass,
  Plus,
  Check,
  Trash2,
  ExternalLink,
  Clock,
  AlertCircle,
  FileCheck,
  TrendingUp,
  Eye,
  Loader2,
  HardDrive,
} from "lucide-react";
import {
  VerificationService,
  VerificationResponse,
  VerificationDocument,
  SectionType,
  VerificationStatus,
} from "@/features/profile/services/verificationService";
import {
  ProfileService,
  ProfileData,
  Track,
  Mode,
  EducationItem,
  ExperienceItem,
} from "@/features/profile/services/profileService";
import { VerificationBadge } from "@/features/profile/components/VerificationBadge";
import { SectionVerificationBox } from "@/features/profile/components/SectionVerificationBox";
import { DocumentViewerModal } from "@/features/profile/components/DocumentViewerModal";

export type { Track, Mode, EducationItem, ExperienceItem, ProfileData };

export type SectionId =
  | "overview"
  | "personal"
  | "contacts"
  | "education"
  | "experience"
  | "skills"
  | "generate";

const DEFAULT_PROFILE: ProfileData = {
  track: "experienced",
  mode: "manual",
  resumeName: null,
  contact: {
    fullName: "",
    phone: "",
    city: "",
    country: "India",
    linkedin: "",
    email: "",
    streetAddress: "",
    state: "",
    postalCode: "",
  },
  personal: {
    firstName: "",
    lastName: "",
    headline: "",
    dob: "",
    bio: "",
  },
  education: {
    institution: "",
    degree: "",
    startYear: "",
    endYear: "",
    certificateUrl: "",
  },
  educationsList: [],
  experience: {
    company: "",
    title: "",
    start: "",
    end: "",
    highlights: "",
  },
  experiencesList: [],
  skills: [],
  videoName: null,
};

/* --- Circular Progress Ring --- */
function ProgressRing({ percent, label }: { percent: number; label?: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex flex-col items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={radius}
          className="stroke-white/20"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          className="stroke-white transition-all duration-700 ease-out"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-xl font-extrabold text-white block">{percent}%</span>
        {label && <span className="text-[9px] uppercase tracking-wider text-white/80">{label}</span>}
      </div>
    </div>
  );
}

/* --- TipCard --- */
function TipCard({
  icon: Icon,
  title,
  body,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-2 select-none transition-all ${
        onClick ? "cursor-pointer hover:border-primary-glow/50 hover:shadow-sm" : ""
      }`}
    >
      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-ink text-sm">{title}</h3>
      <p className="text-xs text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}

/* --- PreviewCard --- */
function PreviewCard({
  title,
  icon: Icon,
  filled,
  filledTitle,
  filledSubtitle,
  emptyText,
  cta,
  onCta,
  verifiedStatus,
}: {
  title: string;
  icon: React.ElementType;
  filled: boolean;
  filledTitle?: string;
  filledSubtitle?: string;
  emptyText: string;
  cta: string;
  onCta: () => void;
  verifiedStatus?: VerificationStatus;
}) {
  return (
    <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-ink text-sm">{title}</h3>
        </div>
        {verifiedStatus && <VerificationBadge status={verifiedStatus} size="sm" />}
      </div>

      {filled ? (
        <div className="space-y-1">
          <p className="font-bold text-ink text-sm">{filledTitle || "Title Specified"}</p>
          <p className="text-xs text-ink-soft">{filledSubtitle}</p>
        </div>
      ) : (
        <p className="text-xs text-ink-soft italic">{emptyText}</p>
      )}

      <button
        onClick={onCta}
        className="w-full text-xs font-semibold text-primary-glow hover:text-primary py-2 px-3 rounded-xl border border-primary/20 hover:bg-primary/5 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>{cta}</span>
      </button>
    </div>
  );
}

/* --- Section Layout Utilities --- */
function SectionHeader({
  title,
  subtitle,
  status,
}: {
  title: string;
  subtitle: string;
  status?: VerificationStatus;
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
      <div>
        <h2 className="text-xl font-extrabold text-ink tracking-tight">{title}</h2>
        <p className="text-xs text-ink-soft mt-0.5">{subtitle}</p>
      </div>
      {status && <VerificationBadge status={status} size="lg" />}
    </div>
  );
}

function Card({
  icon: Icon,
  iconColor = "text-primary-glow",
  title,
  verifiedStatus,
  children,
}: {
  icon: React.ElementType;
  iconColor?: string;
  title: string;
  verifiedStatus?: VerificationStatus;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-secondary flex items-center justify-center ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-ink text-sm">{title}</h3>
        </div>
        {verifiedStatus && <VerificationBadge status={verifiedStatus} size="sm" />}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-ink-soft">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-ink-soft/70">{hint}</p>}
    </div>
  );
}

function SaveBar({ onSave, isSaving }: { onSave?: () => void; isSaving?: boolean }) {
  return (
    <div className="pt-4 border-t border-border flex items-center justify-between">
      <span className="text-xs text-ink-soft">Changes are saved to your profile in database</span>
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="bg-gradient-brand text-white font-semibold px-5 py-2 rounded-xl text-xs shadow-elegant hover:shadow-glow transition cursor-pointer disabled:opacity-60 flex items-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Save changes</span>
          </>
        )}
      </button>
    </div>
  );
}

function EmptyList({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="p-8 rounded-2xl border border-dashed border-border text-center space-y-1 bg-surface/50">
      <p className="font-bold text-ink text-sm">{title}</p>
      <p className="text-xs text-ink-soft">{subtitle}</p>
    </div>
  );
}

/* --- OVERVIEW SECTION ENHANCED --- */
function Overview({
  profile,
  verificationData,
  onNavigate,
  onCompleteProfile,
  onViewDoc,
}: {
  profile: ProfileData;
  verificationData?: VerificationResponse | null;
  onNavigate: (s: SectionId) => void;
  onCompleteProfile: () => void;
  onViewDoc?: (doc: VerificationDocument) => void;
}) {
  const checks = useMemo(() => {
    const hasContact =
      !!profile.contact.fullName.trim() && !!profile.contact.phone.trim();
    const hasEducation =
      !!profile.education.institution.trim() || profile.educationsList.length > 0;
    const hasExperience =
      profile.track === "fresher"
        ? true
        : !!profile.experience.company.trim() || profile.experiencesList.length > 0;
    const hasSkills = profile.skills.length > 0;
    const hasVideo = !!profile.videoName;
    return [
      { key: "contact", label: "Contact details", done: hasContact, section: "contacts" as SectionId },
      { key: "education", label: "Education", done: hasEducation, section: "education" as SectionId },
      {
        key: "experience",
        label: profile.track === "fresher" ? "Experience (skipped)" : "Work experience",
        done: hasExperience,
        section: "experience" as SectionId,
      },
      { key: "skills", label: "Skills", done: hasSkills, section: "skills" as SectionId },
      { key: "video", label: "Intro video (optional)", done: hasVideo, section: "personal" as SectionId, optional: true },
    ];
  }, [profile]);

  const requiredChecks = checks.filter((c) => !("optional" in c && c.optional));
  const profilePercent = Math.round(
    (requiredChecks.filter((c) => c.done).length / requiredChecks.length) * 100
  );

  const verificationPercent = verificationData?.stats.verificationPercent ?? 0;
  const verifiedCount = verificationData?.stats.verifiedCount ?? 0;
  const pendingCount = verificationData?.stats.pendingCount ?? 0;
  const rejectedCount = verificationData?.stats.rejectedCount ?? 0;
  const totalDocs = verificationData?.stats.totalDocuments ?? 0;
  const timeline = verificationData?.timeline || [];

  const displayName =
    profile.contact.fullName.trim().split(" ")[0] ||
    profile.personal.firstName.trim() ||
    "there";

  const getSectionDocStatus = (sec: SectionType): VerificationStatus => {
    return verificationData?.sections?.[sec]?.status || "unsubmitted";
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Welcome + Progress Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-brand p-6 sm:p-8 text-white shadow-elegant">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid lg:grid-cols-[1fr_auto_auto] gap-6 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {displayName}!
              </h1>
              <span className="text-xs font-semibold bg-white/20 backdrop-blur px-3 py-1 rounded-full border border-white/25">
                {profile.track === "experienced"
                  ? "Experienced"
                  : profile.track === "fresher"
                  ? "Fresher"
                  : "Candidate"}
              </span>
            </div>
            <p className="text-white/85 max-w-xl text-sm">
              Profile Completion: <strong>{profilePercent}%</strong> • Identity Verification:{" "}
              <strong>{verificationPercent}%</strong> ({verifiedCount} of 5 sections verified)
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={onCompleteProfile}
                className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-4 py-2 rounded-full text-sm hover:shadow-glow transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-primary-glow" />
                {profilePercent === 100 ? "Review profile" : "Continue profile"}
              </button>
              <button
                onClick={() => onNavigate("generate")}
                className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white font-semibold px-4 py-2 rounded-full text-sm hover:bg-white/25 transition cursor-pointer"
              >
                <FileText className="w-4 h-4" /> Generate CV
              </button>
            </div>
          </div>

          {/* Progress Rings */}
          <div className="flex items-center gap-4 justify-self-center lg:justify-self-end">
            <ProgressRing percent={profilePercent} label="Profile" />
            <ProgressRing percent={verificationPercent} label="Verified" />
          </div>
        </div>
      </section>

      {/* Verification Status Summary Grid */}
      <section className="grid sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-ink">{verifiedCount} / 5</p>
            <p className="text-xs text-ink-soft">Verified Sections</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-ink">{pendingCount}</p>
            <p className="text-xs text-ink-soft">Pending Review</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-ink">{rejectedCount}</p>
            <p className="text-xs text-ink-soft">Rejected Documents</p>
          </div>
        </div>
        <Link
          href="/drive?category=profile"
          className="p-4 rounded-2xl bg-surface border border-border hover:border-primary-glow/50 shadow-xs flex items-center justify-between gap-3 group transition"
          title="View and manage all your documents in Cloud Drive"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary-glow flex items-center justify-center group-hover:scale-105 transition">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-ink">{totalDocs}</p>
              <p className="text-xs text-ink-soft">Total Documents</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-glow group-hover:underline">
            <HardDrive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Drive</span>
          </span>
        </Link>
      </section>

      {/* Profile Checklist & Verification Statuses */}
      <section className="rounded-2xl bg-surface border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-ink">Profile & Verification Checklist</h2>
            <p className="text-sm text-ink-soft">
              Complete profile sections and upload documents for AI verification.
            </p>
          </div>
          <span className="text-xs font-semibold text-ink-soft">
            {requiredChecks.filter((c) => c.done).length} of {requiredChecks.length} done
          </span>
        </div>
        <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-gradient-brand transition-all duration-500"
            style={{ width: `${profilePercent}%` }}
          />
        </div>
        <ul className="mt-5 divide-y divide-border">
          {checks.map((c) => {
            const secStatus = getSectionDocStatus(c.section as SectionType);
            return (
              <li key={c.key} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {c.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-border" />
                  )}
                  <span className={c.done ? "text-ink font-medium text-sm" : "text-ink-soft text-sm"}>
                    {c.label}
                  </span>
                  {"optional" in c && c.optional && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft/70 bg-secondary px-1.5 py-0.5 rounded">
                      Optional
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <VerificationBadge status={secStatus} size="sm" />
                  <button
                    onClick={() => onNavigate(c.section)}
                    className="text-sm font-semibold text-primary-glow hover:underline cursor-pointer"
                  >
                    {c.done ? "Edit & Verify" : "Add"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Verification Timeline Card */}
      {timeline.length > 0 && (
        <section className="rounded-2xl bg-surface border border-border p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-glow" /> Verification Timeline
          </h2>
          <div className="relative border-l border-border ml-3 space-y-4 pl-4">
            {timeline.map((item) => {
              const matchingDoc = verificationData?.documents?.find((d) => d._id === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => matchingDoc && onViewDoc?.(matchingDoc)}
                  className={`relative space-y-1 ${matchingDoc ? "cursor-pointer group hover:bg-secondary/40 p-2 rounded-xl transition" : ""}`}
                  title={matchingDoc ? "Click to view document in modal" : undefined}
                >
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary-glow" />
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-ink text-xs group-hover:text-primary-glow transition">
                      {item.documentType.replace(/_/g, " ").toUpperCase()} ({item.section})
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-ink-soft">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      <VerificationBadge status={item.status} size="sm" />
                      {matchingDoc && (
                        <span className="p-1 text-ink-soft group-hover:text-primary-glow">
                          <Eye className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-ink-soft">{item.originalName}</p>
                  {item.summary && (
                    <p className="text-[11px] text-ink bg-secondary/40 p-2 rounded-lg mt-1">
                      {item.summary}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Preview Cards */}
      <section className="grid md:grid-cols-2 gap-4">
        <PreviewCard
          title="Work Experience"
          icon={Briefcase}
          filled={!!profile.experience.company.trim() || profile.experiencesList.length > 0}
          filledTitle={profile.experience.title || profile.experiencesList[0]?.title}
          filledSubtitle={profile.experience.company || profile.experiencesList[0]?.company}
          emptyText={
            profile.track === "fresher"
              ? "You've marked yourself as a fresher"
              : "No work experience added yet"
          }
          cta={profile.track === "fresher" ? "Add an internship" : "Add your first role"}
          onCta={() => onNavigate("experience")}
          verifiedStatus={getSectionDocStatus("experience")}
        />
        <PreviewCard
          title="Education"
          icon={GraduationCap}
          filled={!!profile.education.institution.trim() || profile.educationsList.length > 0}
          filledTitle={profile.education.degree || profile.educationsList[0]?.degree}
          filledSubtitle={profile.education.institution || profile.educationsList[0]?.institution}
          emptyText="No education added yet"
          cta="Add your first degree"
          onCta={() => onNavigate("education")}
          verifiedStatus={getSectionDocStatus("education")}
        />
      </section>
    </div>
  );
}

/* --- PERSONAL DETAILS SECTION --- */
function PersonalSection({
  profile,
  verificationDocs,
  verificationStatus,
  onUpdate,
  onSave,
  isSaving,
  onRefreshVerifications,
  onViewDoc,
}: {
  profile: ProfileData;
  verificationDocs: VerificationDocument[];
  verificationStatus: VerificationStatus;
  onUpdate: (updater: (prev: ProfileData) => ProfileData) => void;
  onSave: (dataToSave?: ProfileData) => void;
  isSaving?: boolean;
  onRefreshVerifications: () => void;
  onViewDoc?: (doc: VerificationDocument) => void;
}) {
  const { personal, experience } = profile;

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionHeader
        title="Personal Details"
        subtitle="Your public profile and personal identity information."
        status={verificationStatus}
      />

      <Card icon={User} iconColor="text-primary-glow" title="Basic Info" verifiedStatus={verificationStatus}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="First name">
            <input
              type="text"
              className="input-base"
              value={personal.firstName}
              onChange={(e) =>
                onUpdate((prev) => ({
                  ...prev,
                  personal: { ...prev.personal, firstName: e.target.value },
                  contact: {
                    ...prev.contact,
                    fullName: `${e.target.value} ${prev.personal.lastName}`.trim(),
                  },
                }))
              }
              placeholder="First name"
            />
          </Field>
          <Field label="Last name">
            <input
              type="text"
              className="input-base"
              value={personal.lastName}
              onChange={(e) =>
                onUpdate((prev) => ({
                  ...prev,
                  personal: { ...prev.personal, lastName: e.target.value },
                  contact: {
                    ...prev.contact,
                    fullName: `${prev.personal.firstName} ${e.target.value}`.trim(),
                  },
                }))
              }
              placeholder="Last name"
            />
          </Field>
          <Field label="Headline" hint="One line describing your professional identity.">
            <input
              type="text"
              className="input-base"
              value={personal.headline || experience.title || ""}
              onChange={(e) =>
                onUpdate((prev) => ({
                  ...prev,
                  personal: { ...prev.personal, headline: e.target.value },
                  experience: { ...prev.experience, title: e.target.value },
                }))
              }
              placeholder="e.g. Senior Full-Stack Engineer"
            />
          </Field>
          <Field label="Date of birth">
            <input
              type="date"
              className="input-base"
              value={personal.dob || ""}
              onChange={(e) =>
                onUpdate((prev) => ({
                  ...prev,
                  personal: { ...prev.personal, dob: e.target.value },
                }))
              }
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Bio">
              <textarea
                rows={4}
                className="input-base"
                value={personal.bio || ""}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    personal: { ...prev.personal, bio: e.target.value },
                  }))
                }
                placeholder="Tell recruiters what makes you, you."
              />
            </Field>
          </div>
        </div>
        <SaveBar onSave={() => onSave(profile)} isSaving={isSaving} />
      </Card>

      {/* Verification Document Pipeline Upload Component */}
      <SectionVerificationBox
        section="personal"
        title="Personal Identity (Passport, Driving License, PAN)"
        documents={verificationDocs}
        status={verificationStatus}
        profileData={personal}
        onRefresh={onRefreshVerifications}
        onViewDoc={onViewDoc}
      />
    </div>
  );
}

/* --- CONTACT DETAILS SECTION --- */
function ContactsSection({
  profile,
  verificationDocs,
  verificationStatus,
  onUpdate,
  onSave,
  isSaving,
  onRefreshVerifications,
  onViewDoc,
}: {
  profile: ProfileData;
  verificationDocs: VerificationDocument[];
  verificationStatus: VerificationStatus;
  onUpdate: (updater: (prev: ProfileData) => ProfileData) => void;
  onSave: (dataToSave?: ProfileData) => void;
  isSaving?: boolean;
  onRefreshVerifications: () => void;
  onViewDoc?: (doc: VerificationDocument) => void;
}) {
  const { contact } = profile;
  const [otpSent, setOtpSent] = useState(false);

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionHeader
        title="Contact Details"
        subtitle="How recruiters and companies can reach you."
        status={verificationStatus}
      />

      <Card icon={Mail} iconColor="text-primary-glow" title="Email Address" verifiedStatus="verified">
        <Field label="Email" hint="Email is tied to your account. Change it from account settings.">
          <input
            className="input-base bg-secondary/60 cursor-not-allowed text-ink-soft"
            value={contact.email || ""}
            disabled
          />
        </Field>
      </Card>

      <Card
        icon={Phone}
        iconColor="text-[oklch(0.6_0.18_160)]"
        title="Phone Number"
        verifiedStatus={contact.phone ? "verified" : "unsubmitted"}
      >
        <Field label="Phone Number">
          <input
            className="input-base"
            value={contact.phone}
            onChange={(e) =>
              onUpdate((prev) => ({
                ...prev,
                contact: { ...prev.contact, phone: e.target.value },
              }))
            }
            placeholder="+91 98765 43210"
          />
        </Field>
        <div className="mt-4 flex items-center justify-between">
          {otpSent ? (
            <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> OTP sent to WhatsApp
            </span>
          ) : (
            <span className="text-xs text-ink-soft">Instant phone verification</span>
          )}
          <button
            type="button"
            onClick={() => {
              setOtpSent(true);
              setTimeout(() => setOtpSent(false), 4000);
            }}
            className="bg-gradient-brand text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:shadow-glow transition cursor-pointer"
          >
            Verify via WhatsApp OTP
          </button>
        </div>
      </Card>

      <Card
        icon={MapPin}
        iconColor="text-[oklch(0.6_0.22_25)]"
        title="Address & Links"
        verifiedStatus={verificationStatus}
      >
        <div className="grid gap-4">
          <Field label="Street Address">
            <input
              className="input-base"
              value={contact.streetAddress || ""}
              onChange={(e) =>
                onUpdate((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, streetAddress: e.target.value },
                }))
              }
              placeholder="Street Address / Flat No."
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="City">
              <input
                className="input-base"
                value={contact.city}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, city: e.target.value },
                  }))
                }
                placeholder="e.g. Bengaluru"
              />
            </Field>
            <Field label="State / Province">
              <input
                className="input-base"
                value={contact.state || ""}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, state: e.target.value },
                  }))
                }
                placeholder="e.g. Karnataka"
              />
            </Field>
            <Field label="Country">
              <input
                className="input-base"
                value={contact.country}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, country: e.target.value },
                  }))
                }
                placeholder="India"
              />
            </Field>
            <Field label="Postal Code">
              <input
                className="input-base"
                value={contact.postalCode || ""}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, postalCode: e.target.value },
                  }))
                }
                placeholder="560001"
              />
            </Field>
          </div>
          <Field label="LinkedIn / Portfolio">
            <input
              className="input-base"
              value={contact.linkedin}
              onChange={(e) =>
                onUpdate((prev) => ({
                  ...prev,
                  contact: { ...prev.contact, linkedin: e.target.value },
                }))
              }
              placeholder="https://linkedin.com/in/username"
            />
          </Field>
        </div>
        <SaveBar onSave={() => onSave(profile)} isSaving={isSaving} />
      </Card>

      {/* Verification Document Pipeline Upload Component */}
      <SectionVerificationBox
        section="contacts"
        title="Contact Proof (Government ID, Address Proof)"
        documents={verificationDocs}
        status={verificationStatus}
        profileData={contact}
        onRefresh={onRefreshVerifications}
        onViewDoc={onViewDoc}
      />
    </div>
  );
}

/* --- EDUCATION SECTION --- */
function EducationSection({
  profile,
  verificationDocs,
  verificationStatus,
  onUpdate,
  onSave,
  isSaving,
  onRefreshVerifications,
  onViewDoc,
}: {
  profile: ProfileData;
  verificationDocs: VerificationDocument[];
  verificationStatus: VerificationStatus;
  onUpdate: (updater: (prev: ProfileData) => ProfileData) => void;
  onSave: (dataToSave?: ProfileData) => void;
  isSaving?: boolean;
  onRefreshVerifications: () => void;
  onViewDoc?: (doc: VerificationDocument) => void;
}) {
  const list = profile.educationsList || [];
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");

  const handleAddDegree = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution.trim() || !degree.trim()) return;

    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: institution.trim(),
      degree: degree.trim(),
      startYear: startYear.trim() || "2020",
      endYear: endYear.trim() || "2024",
      certificateUrl: certificateUrl.trim(),
    };

    const updatedProfile: ProfileData = {
      ...profile,
      education: {
        institution: newItem.institution,
        degree: newItem.degree,
        startYear: newItem.startYear,
        endYear: newItem.endYear,
        certificateUrl: newItem.certificateUrl,
      },
      educationsList: [newItem, ...(profile.educationsList || [])],
    };

    onUpdate(() => updatedProfile);
    onSave(updatedProfile);

    setInstitution("");
    setDegree("");
    setStartYear("");
    setEndYear("");
    setCertificateUrl("");
  };

  const handleRemove = (id: string) => {
    const newList = (profile.educationsList || []).filter((item) => item.id !== id);
    const top = newList[0] || { institution: "", degree: "", startYear: "", endYear: "", certificateUrl: "" };
    const updatedProfile: ProfileData = {
      ...profile,
      education: top,
      educationsList: newList,
    };
    onUpdate(() => updatedProfile);
    onSave(updatedProfile);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionHeader
        title="Education"
        subtitle="Add every degree and certification — verified ones earn extra points."
        status={verificationStatus}
      />

      {/* Render list of added degrees */}
      {list.map((edu) => (
        <Card
          key={edu.id}
          icon={GraduationCap}
          iconColor="text-[oklch(0.55_0.22_285)]"
          title={edu.degree || "Your Degree"}
          verifiedStatus={verificationStatus}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-ink">{edu.institution}</p>
              <p className="text-sm text-ink-soft mt-1">
                {edu.startYear} — {edu.endYear || "Present"}
              </p>
              {edu.certificateUrl && (
                <a
                  href={edu.certificateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary-glow font-semibold mt-2 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Certificate
                </a>
              )}
            </div>
            <button
              onClick={() => handleRemove(edu.id)}
              className="text-ink-soft hover:text-rose-500 p-1 rounded transition cursor-pointer"
              title="Delete degree"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </Card>
      ))}

      {/* Add Degree Card */}
      <Card icon={GraduationCap} iconColor="text-[oklch(0.55_0.22_285)]" title="Add Degree">
        <form onSubmit={handleAddDegree} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Institution">
              <input
                className="input-base"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Stanford University"
                required
              />
            </Field>
            <Field label="Degree">
              <input
                className="input-base"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.S. in Computer Science"
                required
              />
            </Field>
            <Field label="Start year">
              <input
                className="input-base"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                placeholder="2020"
              />
            </Field>
            <Field label="End year">
              <input
                className="input-base"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                placeholder="2024"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field
                label="Certificate URL"
                hint="Upload a link to your official certificate for verification."
              >
                <input
                  className="input-base"
                  value={certificateUrl}
                  onChange={(e) => setCertificateUrl(e.target.value)}
                  placeholder="https://..."
                />
              </Field>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-gradient-brand text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:shadow-glow transition cursor-pointer disabled:opacity-60"
            >
              <Plus className="w-4 h-4" /> Add education
            </button>
          </div>
        </form>
        <SaveBar onSave={() => onSave(profile)} isSaving={isSaving} />
      </Card>

      {list.length === 0 && (
        <EmptyList
          title="No education added yet"
          subtitle="Once added, degrees will show up here with verification status."
        />
      )}

      {/* Verification Document Pipeline Upload Component */}
      <SectionVerificationBox
        section="education"
        title="Education Verification (Degree Certificate, Marksheet, Transcript)"
        documents={verificationDocs}
        status={verificationStatus}
        profileData={profile.education}
        onRefresh={onRefreshVerifications}
        onViewDoc={onViewDoc}
      />
    </div>
  );
}


/* --- WORK EXPERIENCE SECTION --- */
function ExperienceSection({
  profile,
  verificationDocs,
  verificationStatus,
  onUpdate,
  onSave,
  isSaving,
  onRefreshVerifications,
  onViewDoc,
}: {
  profile: ProfileData;
  verificationDocs: VerificationDocument[];
  verificationStatus: VerificationStatus;
  onUpdate: (updater: (prev: ProfileData) => ProfileData) => void;
  onSave: (dataToSave?: ProfileData) => void;
  isSaving?: boolean;
  onRefreshVerifications: () => void;
  onViewDoc?: (doc: VerificationDocument) => void;
}) {
  const list = profile.experiencesList || [];
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [highlights, setHighlights] = useState("");

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !title.trim()) return;

    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: company.trim(),
      title: title.trim(),
      start: start || "2022-01",
      end: end || "Present",
      highlights: highlights.trim(),
    };

    const updatedProfile: ProfileData = {
      ...profile,
      experience: {
        company: newItem.company,
        title: newItem.title,
        start: newItem.start,
        end: newItem.end,
        highlights: newItem.highlights,
      },
      experiencesList: [newItem, ...(profile.experiencesList || [])],
    };

    onUpdate(() => updatedProfile);
    onSave(updatedProfile);

    setCompany("");
    setTitle("");
    setStart("");
    setEnd("");
    setHighlights("");
  };

  const handleRemove = (id: string) => {
    const newList = (profile.experiencesList || []).filter((item) => item.id !== id);
    const top = newList[0] || { company: "", title: "", start: "", end: "", highlights: "" };
    const updatedProfile: ProfileData = {
      ...profile,
      experience: top,
      experiencesList: newList,
    };
    onUpdate(() => updatedProfile);
    onSave(updatedProfile);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionHeader
        title="Work Experience"
        subtitle="Every role you've held. Verified experiences unlock offers."
        status={verificationStatus}
      />

      {/* Render list of added experiences */}
      {list.map((exp) => (
        <Card
          key={exp.id}
          icon={Briefcase}
          iconColor="text-[oklch(0.65_0.18_45)]"
          title={exp.title || "Your Role"}
          verifiedStatus={verificationStatus}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-ink">{exp.company}</p>
              <p className="text-sm text-ink-soft mt-1">
                {exp.start || "—"} → {exp.end || "Present"}
              </p>
              {exp.highlights && <p className="text-sm text-ink mt-3 whitespace-pre-line">{exp.highlights}</p>}
            </div>
            <button
              onClick={() => handleRemove(exp.id)}
              className="text-ink-soft hover:text-rose-500 p-1 rounded transition cursor-pointer"
              title="Delete role"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </Card>
      ))}

      {/* Add Role Card */}
      <Card icon={Briefcase} iconColor="text-[oklch(0.65_0.18_45)]" title="Add Role">
        <form onSubmit={handleAddRole} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Company">
              <input
                className="input-base"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                required
              />
            </Field>
            <Field label="Job title">
              <input
                className="input-base"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </Field>
            <Field label="Start date">
              <input
                type="month"
                className="input-base"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </Field>
            <Field label="End date">
              <input
                type="month"
                className="input-base"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Highlights">
                <textarea
                  rows={4}
                  className="input-base"
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="Shipped features, led projects, improved performance..."
                />
              </Field>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-gradient-brand text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:shadow-glow transition cursor-pointer disabled:opacity-60"
            >
              <Plus className="w-4 h-4" /> Add role
            </button>
          </div>
        </form>
        <SaveBar onSave={() => onSave(profile)} isSaving={isSaving} />
      </Card>

      {list.length === 0 && (
        <EmptyList title="No work experience added yet" subtitle="Your roles will appear here." />
      )}

      {/* Verification Document Pipeline Upload Component */}
      <SectionVerificationBox
        section="experience"
        title="Experience Proof (Experience Letter, Offer Letter, Relieving Letter, Salary Slip)"
        documents={verificationDocs}
        status={verificationStatus}
        profileData={profile.experience}
        onRefresh={onRefreshVerifications}
        onViewDoc={onViewDoc}
      />
    </div>
  );
}


/* --- SKILLS SECTION --- */
function SkillsSection({
  profile,
  verificationDocs,
  verificationStatus,
  onUpdate,
  onSave,
  isSaving,
  onRefreshVerifications,
  onViewDoc,
}: {
  profile: ProfileData;
  verificationDocs: VerificationDocument[];
  verificationStatus: VerificationStatus;
  onUpdate: (updater: (prev: ProfileData) => ProfileData) => void;
  onSave: (dataToSave?: ProfileData) => void;
  isSaving?: boolean;
  onRefreshVerifications: () => void;
  onViewDoc?: (doc: VerificationDocument) => void;
}) {
  const [newSkill, setNewSkill] = useState("");
  const suggested = [
    "React",
    "TypeScript",
    "Node.js",
    "Next.js",
    "Python",
    "SQL",
    "Tailwind CSS",
    "Figma",
    "AWS",
    "Docker",
    "GraphQL",
    "System Design",
    "MongoDB",
    "PostgreSQL",
  ].filter((s) => !profile.skills.includes(s));

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed || profile.skills.includes(trimmed)) return;

    const updatedProfile: ProfileData = {
      ...profile,
      skills: [...profile.skills, trimmed],
    };
    onUpdate(() => updatedProfile);
    setNewSkill("");
    onSave(updatedProfile);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedProfile: ProfileData = {
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove),
    };
    onUpdate(() => updatedProfile);
    onSave(updatedProfile);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <SectionHeader
        title="Skills"
        subtitle="Add skills and upload certificates to earn verification badges."
        status={verificationStatus}
      />

      {profile.skills.length > 0 && (
        <Card
          icon={Zap}
          iconColor="text-[oklch(0.5_0.2_265)]"
          title="Your Skills"
          verifiedStatus={verificationStatus}
        >
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-2 text-sm px-3.5 py-1.5 rounded-full bg-gradient-brand text-white font-semibold shadow-xs"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s)}
                  className="hover:text-rose-200 transition cursor-pointer"
                  title={`Remove ${s}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          <SaveBar onSave={() => onSave(profile)} isSaving={isSaving} />
        </Card>
      )}

      <Card icon={Zap} iconColor="text-[oklch(0.5_0.2_265)]" title="Add a skill">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddSkill(newSkill);
          }}
          className="flex gap-3"
        >
          <input
            className="input-base flex-1"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="e.g. React, Node.js, Python"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-brand text-white font-semibold px-5 rounded-xl text-sm hover:shadow-glow transition cursor-pointer shrink-0 disabled:opacity-60"
          >
            Add
          </button>
        </form>

        {suggested.length > 0 && (
          <>
            <p className="text-xs font-semibold text-ink-soft mt-5 mb-2">SUGGESTED SKILLS</p>
            <div className="flex flex-wrap gap-2">
              {suggested.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddSkill(s)}
                  className="text-sm px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-ink hover:bg-secondary transition cursor-pointer font-medium"
                >
                  + {s}
                </button>
              ))}
            </div>
          </>
        )}
      </Card>

      {profile.skills.length === 0 && (
        <EmptyList
          title="No skills added yet"
          subtitle="Skills you add will show verification status here."
        />
      )}

      {/* Verification Document Pipeline Upload Component */}
      <SectionVerificationBox
        section="skills"
        title="Skill Verification (Certification PDFs, Course Certificates)"
        documents={verificationDocs}
        status={verificationStatus}
        profileData={{ skills: profile.skills }}
        onRefresh={onRefreshVerifications}
        onViewDoc={onViewDoc}
      />
    </div>
  );
}

/* --- MAIN PROFILE PAGE WITH FULL IDENTITY VERIFICATION SYSTEM --- */
export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "unsaved" | "saving" | "saved" | "error">("idle");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<VerificationDocument | null>(null);

  // References for debounced auto-save & concurrency safety
  const initialLoadedRef = React.useRef(false);
  const lastSavedJsonRef = React.useRef<string>("");
  const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Verification state from backend
  const [verificationData, setVerificationData] = useState<VerificationResponse | null>(null);

  // Fetch verification documents & statuses from backend
  const fetchVerifications = useCallback(async () => {
    try {
      const data = await VerificationService.getVerifications();
      setVerificationData(data);
    } catch (err) {
      console.warn("Failed to fetch verification status from server:", err);
    }
  }, []);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  // Global polling for pending documents across all sections
  useEffect(() => {
    const hasPending = (verificationData?.documents || []).some(
      (doc) => doc.verification.status === "pending"
    );
    if (!hasPending) return;

    const interval = setInterval(() => {
      fetchVerifications();
    }, 3000);

    return () => clearInterval(interval);
  }, [verificationData, fetchVerifications]);

  // Profile data state persisted in local state & pre-populated from user store & loaded from DB
  const [profile, setProfile] = useState<ProfileData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("user_profile_data");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_PROFILE;
  });

  const profileRef = React.useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Fetch profile from database on initial load
  const fetchProfile = useCallback(async () => {
    try {
      const dbProfile = await ProfileService.getProfile();
      if (dbProfile) {
        setProfile((prev) => {
          const merged: ProfileData = {
            ...prev,
            ...dbProfile,
            personal: { ...prev.personal, ...(dbProfile.personal || {}) },
            contact: { ...prev.contact, ...(dbProfile.contact || {}) },
            education: { ...prev.education, ...(dbProfile.education || {}) },
            educationsList: dbProfile.educationsList || prev.educationsList || [],
            experience: { ...prev.experience, ...(dbProfile.experience || {}) },
            experiencesList: dbProfile.experiencesList || prev.experiencesList || [],
            skills: dbProfile.skills || prev.skills || [],
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("user_profile_data", JSON.stringify(merged));
          }
          lastSavedJsonRef.current = JSON.stringify(merged);
          return merged;
        });
      }
    } catch (err) {
      console.warn("Failed to load profile from database:", err);
    } finally {
      initialLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Sync logged in user name/email if present
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          fullName: prev.contact.fullName || user.fullName || user.username || "",
          email: user.email || prev.contact.email || "",
        },
        personal: {
          ...prev.personal,
          firstName: prev.personal.firstName || (user.fullName ? user.fullName.split(" ")[0] : ""),
          lastName: prev.personal.lastName || (user.fullName ? user.fullName.split(" ").slice(1).join(" ") : ""),
        },
      }));
    }
  }, [user]);

  // Handle Save to DB with deduplication and state tracking
  const handleSave = useCallback(async (dataToSave?: ProfileData) => {
    // Clear any pending debounce timer when explicit or auto-save triggers
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    const target = dataToSave || profileRef.current;
    const targetJson = JSON.stringify(target);

    // Skip redundant network request if already identical to what is in database
    if (targetJson === lastSavedJsonRef.current && lastSavedJsonRef.current !== "") {
      setSaveStatus("idle");
      return;
    }

    setIsSaving(true);
    setSaveStatus("saving");
    setSaveError(null);

    if (typeof window !== "undefined") {
      localStorage.setItem("user_profile_data", targetJson);
    }

    try {
      const updated = await ProfileService.updateProfile(target);
      if (updated) {
        setProfile((prev) => ({
          ...prev,
          ...updated,
        }));
        lastSavedJsonRef.current = JSON.stringify({ ...target, ...updated });
      } else {
        lastSavedJsonRef.current = targetJson;
      }
      setSaveStatus("saved");
      setSaveNotice("Profile changes saved to database successfully!");
      setTimeout(() => {
        setSaveNotice(null);
        setSaveStatus((curr) => (curr === "saved" ? "idle" : curr));
      }, 3500);
    } catch (err: any) {
      console.error("Failed to save profile to database:", err);
      setSaveStatus("error");
      setSaveError(err?.message || "Failed to save profile to database.");
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Frontend Debounced Auto-Save: Coalesces rapid keystrokes/updates into a single request
  useEffect(() => {
    if (!initialLoadedRef.current) return;

    const currentStr = JSON.stringify(profile);
    if (currentStr === lastSavedJsonRef.current) {
      return;
    }

    setSaveStatus("unsaved");

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [profile, handleSave]);

  const handleNavigate = (sec: SectionId) => {
    if (sec === "generate") {
      router.push("/builder");
    } else {
      setActiveSection(sec);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const PROFILE_SECTIONS = [
    { id: "overview" as SectionId, label: "Overview", icon: Compass },
    { id: "personal" as SectionId, label: "Personal Details", icon: User },
    { id: "contacts" as SectionId, label: "Contact Details", icon: Mail },
    { id: "experience" as SectionId, label: "Work Experience", icon: Briefcase },
    { id: "education" as SectionId, label: "Education", icon: GraduationCap },
    { id: "skills" as SectionId, label: "Skills", icon: Zap },
  ];

  const getSectionDocs = (sec: SectionType): VerificationDocument[] => {
    return (verificationData?.documents || []).filter((d) => d.section === sec);
  };

  const getSectionStatus = (sec: SectionType): VerificationStatus => {
    return verificationData?.sections?.[sec]?.status || "unsubmitted";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Save Notification Alerts */}
      {saveNotice && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-elegant flex items-center gap-2 animate-fade-up">
          <Check className="w-4 h-4" />
          <span>{saveNotice}</span>
        </div>
      )}
      {saveError && (
        <div className="fixed top-20 right-6 z-50 bg-rose-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-elegant flex items-center gap-2 animate-fade-up">
          <AlertCircle className="w-4 h-4" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Top Header Navigation Tabs with Live Auto-Save Status */}
      <div className="bg-surface border border-border rounded-2xl p-2 shadow-xs flex items-center justify-between gap-3 overflow-x-auto no-scrollbar select-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {PROFILE_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            const secStatus = sec.id !== "overview" && sec.id !== "generate" ? getSectionStatus(sec.id as SectionType) : undefined;
            return (
              <button
                key={sec.id}
                onClick={() => handleNavigate(sec.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-brand text-white shadow-elegant"
                    : "text-ink-soft hover:text-ink hover:bg-secondary/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-primary-glow"}`} />
                <span>{sec.label}</span>
                {secStatus && secStatus !== "unsubmitted" && (
                  <span className={`w-2 h-2 rounded-full ${secStatus === "verified" ? "bg-emerald-400" : secStatus === "pending" ? "bg-amber-400" : "bg-rose-400"}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Live Auto-Save Indicator */}
        <div className="hidden sm:flex items-center pr-3 shrink-0">
          {saveStatus === "saving" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500 font-medium animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved to cloud</span>
            </span>
          )}
          {saveStatus === "unsaved" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Unsaved changes</span>
            </span>
          )}
          {saveStatus === "error" && (
            <span className="inline-flex items-center gap-1.5 text-xs text-rose-500 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Save error</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Section Render Area */}
      <div>
        {activeSection === "overview" && (
          <Overview
            profile={profile}
            verificationData={verificationData}
            onNavigate={handleNavigate}
            onCompleteProfile={() => handleNavigate("contacts")}
            onViewDoc={(doc) => setPreviewDoc(doc)}
          />
        )}

        {activeSection === "personal" && (
          <PersonalSection
            profile={profile}
            verificationDocs={getSectionDocs("personal")}
            verificationStatus={getSectionStatus("personal")}
            onUpdate={setProfile}
            onSave={handleSave}
            isSaving={isSaving}
            onRefreshVerifications={fetchVerifications}
          />
        )}

        {activeSection === "contacts" && (
          <ContactsSection
            profile={profile}
            verificationDocs={getSectionDocs("contacts")}
            verificationStatus={getSectionStatus("contacts")}
            onUpdate={setProfile}
            onSave={handleSave}
            isSaving={isSaving}
            onRefreshVerifications={fetchVerifications}
          />
        )}

        {activeSection === "education" && (
          <EducationSection
            profile={profile}
            verificationDocs={getSectionDocs("education")}
            verificationStatus={getSectionStatus("education")}
            onUpdate={setProfile}
            onSave={handleSave}
            isSaving={isSaving}
            onRefreshVerifications={fetchVerifications}
          />
        )}

        {activeSection === "experience" && (
          <ExperienceSection
            profile={profile}
            verificationDocs={getSectionDocs("experience")}
            verificationStatus={getSectionStatus("experience")}
            onUpdate={setProfile}
            onSave={handleSave}
            isSaving={isSaving}
            onRefreshVerifications={fetchVerifications}
          />
        )}

        {activeSection === "skills" && (
          <SkillsSection
            profile={profile}
            verificationDocs={getSectionDocs("skills")}
            verificationStatus={getSectionStatus("skills")}
            onUpdate={setProfile}
            onSave={handleSave}
            isSaving={isSaving}
            onRefreshVerifications={fetchVerifications}
          />
        )}
      </div>

      {/* Global Document Viewer Modal */}
      <DocumentViewerModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
}
