'use client';

import React from 'react';
import {
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Sparkles,
  Bookmark,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { IJob } from '../types/job.types';

interface JobCardProps {
  job: IJob;
  onSelect: (job: IJob) => void;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onSelect,
  isSaved = false,
  onToggleSave,
}) => {
  const match = job.matchScore || 70;

  // Visual match tone
  const matchTone =
    match >= 85
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
      : match >= 70
      ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60'
      : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800';

  const workplaceTone =
    job.workplaceType === 'remote'
      ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800'
      : job.workplaceType === 'hybrid'
      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800'
      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';

  // Format Salary
  const formatSalary = () => {
    if (!job.salary || (!job.salary.min && !job.salary.max)) return 'Competitive';
    const { min, max, currency, period } = job.salary;
    const periodLabel = period === 'yearly' ? '/yr' : period === 'monthly' ? '/mo' : '/hr';

    if (currency === 'INR') {
      const minLPA = (min / 100000).toFixed(min % 100000 === 0 ? 0 : 1);
      const maxLPA = (max / 100000).toFixed(max % 100000 === 0 ? 0 : 1);
      return `₹${minLPA}–${maxLPA} LPA`;
    }

    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : `${currency} `;
    const minK = min >= 1000 ? `${Math.round(min / 1000)}k` : min;
    const maxK = max >= 1000 ? `${Math.round(max / 1000)}k` : max;
    return `${symbol}${minK}–${maxK}${periodLabel}`;
  };

  // Company avatar fallback initials
  const initials = job.company.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const matchedSkills = job.matchedSkills || [];
  const missingSkills = job.missingSkills || [];

  return (
    <article className="group rounded-2xl bg-card border border-border/80 p-5 sm:p-6 shadow-sm hover:shadow-elegant transition-all duration-300 flex flex-col justify-between hover:border-primary/40 relative overflow-hidden">
      {/* Top Accent for high matches */}
      {match >= 90 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-primary to-primary-glow" />
      )}

      <div>
        {/* Header: Company & Title & Match Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-brand text-white font-bold text-sm grid place-items-center shrink-0 shadow-sm shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              {initials}
            </div>
            <div className="min-w-0">
              <h3
                onClick={() => onSelect(job)}
                className="font-bold text-base sm:text-lg text-ink hover:text-primary transition-colors cursor-pointer line-clamp-1"
                title={job.title}
              >
                {job.title}
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft flex items-center gap-1.5 mt-0.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-primary-glow shrink-0" />
                <span className="truncate">{job.company.name}</span>
                <span className="text-border">•</span>
                <span className="capitalize">{job.experienceLevel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border shadow-xs ${matchTone}`}
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              {match}% Match
            </span>
          </div>
        </div>

        {/* Quick Meta Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs text-ink-soft bg-surface-alt/70 p-3 rounded-xl border border-border/50">
          <div className="inline-flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-ink-soft/70 shrink-0" />
            <span className="truncate">
              {job.location.city ? `${job.location.city}, ${job.location.country}` : job.location.country}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 min-w-0 font-semibold text-ink">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{formatSalary()}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 min-w-0">
            <Briefcase className="w-3.5 h-3.5 text-ink-soft/70 shrink-0" />
            <span className="truncate capitalize">{job.employmentType}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 min-w-0">
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${workplaceTone}`}>
              {job.workplaceType}
            </span>
          </div>
        </div>

        {/* Match Reasons Highlight if present */}
        {job.matchReasons && job.matchReasons.length > 0 && (
          <div className="mt-3.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{job.matchReasons[0]}</span>
          </div>
        )}

        {/* Skills Alignment Tags */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 5).map((skill) => {
            const isMatched = matchedSkills.some((s) => s.toLowerCase() === skill.toLowerCase());
            return (
              <span
                key={skill}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg inline-flex items-center gap-1 border transition ${
                  isMatched
                    ? 'bg-primary/10 text-primary border-primary/25 font-semibold'
                    : 'bg-secondary text-ink-soft border-border'
                }`}
              >
                {isMatched && <CheckCircle2 className="w-2.5 h-2.5 text-primary shrink-0" />}
                {skill}
              </span>
            );
          })}
          {job.skills.length > 5 && (
            <span className="text-[11px] font-medium px-2 py-1 rounded-lg bg-surface-alt text-ink-soft border border-border">
              +{job.skills.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-5 flex items-center gap-2.5 pt-4 border-t border-border/70">
        <button
          type="button"
          onClick={() => onSelect(job)}
          className="flex-1 bg-gradient-brand text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm hover:shadow-glow transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-[0.98]"
        >
          <span>View Details & Apply</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(job._id);
            }}
            aria-label={isSaved ? 'Remove from saved' : 'Save job'}
            className={`w-10 h-10 grid place-items-center rounded-xl border transition-all duration-200 ${
              isSaved
                ? 'bg-primary/10 border-primary text-primary shadow-xs'
                : 'border-border text-ink-soft hover:bg-surface-alt hover:text-ink'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-primary' : ''}`} />
          </button>
        )}
      </div>
    </article>
  );
};
