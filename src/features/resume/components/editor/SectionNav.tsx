'use client';

import React from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { useAtsAnalysis } from '../../hooks/useAtsAnalysis';
import { User, FileText, Briefcase, GraduationCap, FolderGit2, Wrench, Award, Languages, Settings, ShieldCheck } from 'lucide-react';

export const SECTIONS = [
  { id: 'personalInfo', label: 'Personal Details', shortLabel: 'Personal', icon: User },
  { id: 'summary', label: 'Summary', shortLabel: 'Summary', icon: FileText },
  { id: 'experiences', label: 'Work Experience', shortLabel: 'Experience', icon: Briefcase },
  { id: 'educations', label: 'Education', shortLabel: 'Education', icon: GraduationCap },
  { id: 'projects', label: 'Projects', shortLabel: 'Projects', icon: FolderGit2 },
  { id: 'skills', label: 'Skills & Tech', shortLabel: 'Skills', icon: Wrench },
  { id: 'certificates', label: 'Certificates', shortLabel: 'Certificates', icon: Award },
  { id: 'languages', label: 'Languages', shortLabel: 'Languages', icon: Languages },
  { id: 'settings', label: 'Styling & Font', shortLabel: 'Settings', icon: Settings },
  { id: 'ats', label: 'ATS Score & Advisory', shortLabel: 'ATS Score', icon: ShieldCheck },
];

export const SectionNav: React.FC = () => {
  const { activeSection, setActiveSection } = useResumeStore();
  const { result } = useAtsAnalysis();

  const currentScore = result?.overallScore ?? 0;

  const getBadgeColor = (score: number) => {
    if (score >= 80) return 'text-success border-success/30 bg-success/10';
    if (score >= 65) return 'text-primary-glow border-primary/30 bg-primary/10';
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  };

  return (
    <div className="w-16 sm:w-48 bg-surface border-r border-border flex flex-col justify-between py-4 px-2.5 gap-1 select-none flex-shrink-0">
      <div className="flex flex-col gap-1">
        <div className="px-3 py-1.5 hidden sm:block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Form Sections</span>
        </div>

        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                isActive
                  ? 'bg-gradient-brand text-primary-foreground font-bold shadow-elegant shadow-primary-glow/20'
                  : 'text-ink-soft hover:text-ink hover:bg-surface-alt'
              }`}
              title={sec.label}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-ink-soft'}`} />
              <span className="hidden sm:inline truncate">{sec.shortLabel}</span>
              {sec.id === 'ats' && (
                <span className="hidden sm:inline-block ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary-glow font-bold">
                  {currentScore}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Down of Settings: Live Open Resume ATS Score Card */}
      <div className="mt-auto pt-3 border-t border-border">
        <button
          onClick={() => setActiveSection('ats')}
          className={`w-full border rounded-2xl p-3 text-left transition-all flex flex-col gap-1 ${getBadgeColor(currentScore)} hover:scale-[1.02] shadow-elegant`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">Open Resume ATS</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold">{currentScore}%</span>
            <span className="text-[9px] opacity-80">Live Score</span>
          </div>
        </button>
      </div>
    </div>
  );
};
