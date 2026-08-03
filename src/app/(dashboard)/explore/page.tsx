"use client";

import {
  Bookmark,
  Briefcase,
  Building2,
  Clock,
  Compass,
  DollarSign,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  skills: string[];
  logoBg: string;
  logo: string;
};
const JOBS: Job[] = [
  {
    id: "j1",
    title: "Senior Product Designer",
    company: "Acme Corp",
    location: "Bangalore, India · Hybrid",
    salary: "₹32–45 LPA",
    type: "Full-time",
    posted: "2d ago",
    skills: ["Figma", "Product Strategy", "React"],
    logoBg: "bg-[oklch(0.6_0.2_285)]",
    logo: "AC",
  },
  {
    id: "j2",
    title: "Frontend Engineer, Growth",
    company: "Northwind Labs",
    location: "Remote · India",
    salary: "₹24–36 LPA",
    type: "Full-time",
    posted: "5h ago",
    skills: ["React", "TypeScript", "Node.js"],
    logoBg: "bg-[oklch(0.6_0.18_45)]",
    logo: "NL",
  },
  {
    id: "j3",
    title: "UX Researcher",
    company: "Lumen Health",
    location: "Mumbai, India · Onsite",
    salary: "₹18–26 LPA",
    type: "Full-time",
    posted: "1w ago",
    skills: ["Research", "Interviewing", "Figma"],
    logoBg: "bg-[oklch(0.6_0.15_160)]",
    logo: "LH",
  },
  {
    id: "j4",
    title: "Full-stack Engineer",
    company: "Kite Studios",
    location: "Remote · Global",
    salary: "$70k–$110k",
    type: "Contract",
    posted: "3d ago",
    skills: ["TypeScript", "SQL", "Node.js"],
    logoBg: "bg-[oklch(0.55_0.2_265)]",
    logo: "KS",
  },
  {
    id: "j5",
    title: "Design Engineer",
    company: "Vector",
    location: "Bangalore, India · Hybrid",
    salary: "₹28–40 LPA",
    type: "Full-time",
    posted: "1d ago",
    skills: ["React", "Figma", "Animation"],
    logoBg: "bg-[oklch(0.6_0.2_20)]",
    logo: "VC",
  },
  {
    id: "j6",
    title: "Product Manager, Platform",
    company: "Orbit AI",
    location: "Remote · India",
    salary: "₹38–55 LPA",
    type: "Full-time",
    posted: "4d ago",
    skills: ["Product Strategy", "SQL", "Analytics"],
    logoBg: "bg-[oklch(0.5_0.2_300)]",
    logo: "OA",
  },
];

export type Track = "fresher" | "experienced";
export type Mode = "resume" | "manual";
export type ProfileData = {
  track: Track | null;
  mode: Mode | null;
  resumeName: string | null;
  contact: {
    fullName: string;
    phone: string;
    city: string;
    country: string;
    linkedin: string;
  };
  education: {
    institution: string;
    degree: string;
    startYear: string;
    endYear: string;
  };
  experience: {
    company: string;
    title: string;
    start: string;
    end: string;
    highlights: string;
  };
  skills: string[];
  videoName: string | null;
};
function JobCard({ job }: { job: Job & { match: number } }) {
  const tone =
    job.match >= 85
      ? "bg-[oklch(0.95_0.08_160)] text-[oklch(0.4_0.15_160)] border-[oklch(0.85_0.1_160)]"
      : job.match >= 70
        ? "bg-[oklch(0.96_0.08_75)] text-[oklch(0.45_0.16_75)] border-[oklch(0.88_0.12_75)]"
        : "bg-secondary text-ink-soft border-border";

  return (
    <article className="rounded-2xl bg-white border border-border p-5 shadow-sm card-hover flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl ${job.logoBg} text-white grid place-items-center font-bold text-sm shrink-0`}
          >
            {job.logo}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-ink truncate">{job.title}</h3>
            <p className="text-sm text-ink-soft flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5" /> {job.company}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${tone}`}
        >
          <Sparkles className="w-3 h-3" /> {job.match}% match
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> {job.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5" /> {job.salary}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" /> {job.type}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> {job.posted}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.skills.map((s) => (
          <span
            key={s}
            className="text-[11px] font-semibold px-2 py-1 rounded-full bg-secondary text-ink"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 pt-4 border-t border-border">
        <button className="flex-1 bg-gradient-brand text-white font-semibold px-4 py-2 rounded-xl text-sm hover:shadow-glow transition">
          Apply now
        </button>
        <button
          aria-label="Save job"
          className="w-10 h-10 grid place-items-center rounded-xl border border-border text-ink-soft hover:bg-secondary transition"
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}
function matchScore(job: Job, profile: ProfileData) {
  const mine = profile.skills.map((s) => s.toLowerCase());
  if (mine.length === 0) return 55 + ((job.id.charCodeAt(1) * 7) % 40); // deterministic mock
  const hits = job.skills.filter((s) => mine.includes(s.toLowerCase())).length;
  return Math.min(98, 50 + Math.round((hits / job.skills.length) * 50));
}

function ExploreSection({ profile }: { profile: ProfileData }) {
  const JOBS: Job[] = [
    {
      id: "j1",
      title: "Senior Product Designer",
      company: "Acme Corp",
      location: "Bangalore, India · Hybrid",
      salary: "₹32–45 LPA",
      type: "Full-time",
      posted: "2d ago",
      skills: ["Figma", "Product Strategy", "React"],
      logoBg: "bg-[oklch(0.6_0.2_285)]",
      logo: "AC",
    },
    {
      id: "j2",
      title: "Frontend Engineer, Growth",
      company: "Northwind Labs",
      location: "Remote · India",
      salary: "₹24–36 LPA",
      type: "Full-time",
      posted: "5h ago",
      skills: ["React", "TypeScript", "Node.js"],
      logoBg: "bg-[oklch(0.6_0.18_45)]",
      logo: "NL",
    },
    {
      id: "j3",
      title: "UX Researcher",
      company: "Lumen Health",
      location: "Mumbai, India · Onsite",
      salary: "₹18–26 LPA",
      type: "Full-time",
      posted: "1w ago",
      skills: ["Research", "Interviewing", "Figma"],
      logoBg: "bg-[oklch(0.6_0.15_160)]",
      logo: "LH",
    },
    {
      id: "j4",
      title: "Full-stack Engineer",
      company: "Kite Studios",
      location: "Remote · Global",
      salary: "$70k–$110k",
      type: "Contract",
      posted: "3d ago",
      skills: ["TypeScript", "SQL", "Node.js"],
      logoBg: "bg-[oklch(0.55_0.2_265)]",
      logo: "KS",
    },
    {
      id: "j5",
      title: "Design Engineer",
      company: "Vector",
      location: "Bangalore, India · Hybrid",
      salary: "₹28–40 LPA",
      type: "Full-time",
      posted: "1d ago",
      skills: ["React", "Figma", "Animation"],
      logoBg: "bg-[oklch(0.6_0.2_20)]",
      logo: "VC",
    },
    {
      id: "j6",
      title: "Product Manager, Platform",
      company: "Orbit AI",
      location: "Remote · India",
      salary: "₹38–55 LPA",
      type: "Full-time",
      posted: "4d ago",
      skills: ["Product Strategy", "SQL", "Analytics"],
      logoBg: "bg-[oklch(0.5_0.2_300)]",
      logo: "OA",
    },
  ];
  const jobs = useMemo<(Job & { match: number })[]>(
    () =>
      JOBS.map((j) => ({ ...j, match: matchScore(j, profile) })).sort(
        (a, b) => b.match - a.match,
      ),
    [profile],
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-brand p-6 sm:p-8 text-white shadow-elegant">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs font-semibold bg-white/15 border border-white/25 px-3 py-1 rounded-full">
            <Compass className="w-3.5 h-3.5" /> Explore
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
            Jobs matched to your verified profile
          </h1>
          <p className="text-white/85 mt-1 max-w-xl">
            Ranked by how closely each role matches your skills and experience.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {[
          "All roles",
          "Remote",
          "Full-time",
          "Design",
          "Engineering",
          "Product",
        ].map((f, i) => (
          <button
            key={f}
            className={`text-sm font-semibold px-3.5 py-1.5 rounded-full border transition ${
              i === 0
                ? "bg-primary-deep text-white border-primary-deep"
                : "bg-white text-ink border-border hover:bg-secondary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {jobs.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </div>
    </div>
  );
}

const DEFAULT_PROFILE: ProfileData = {
  track: "experienced",
  mode: "resume",
  resumeName: null,
  contact: {
    fullName: "User",
    phone: "",
    city: "Bangalore",
    country: "India",
    linkedin: "",
  },
  education: {
    institution: "",
    degree: "",
    startYear: "",
    endYear: "",
  },
  experience: {
    company: "",
    title: "",
    start: "",
    end: "",
    highlights: "",
  },
  skills: ["React", "TypeScript", "Figma"],
  videoName: null,
};

export default function ExplorePage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <ExploreSection profile={DEFAULT_PROFILE} />
    </div>
  );
}
