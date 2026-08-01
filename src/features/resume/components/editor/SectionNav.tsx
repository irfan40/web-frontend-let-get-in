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
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 65) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  };

  return (
    <div className="w-16 sm:w-48 bg-slate-900 border-r border-slate-800 flex flex-col justify-between py-3 px-2 gap-1 select-none flex-shrink-0">
      <div className="flex flex-col gap-1">
        <div className="px-3 py-1.5 hidden sm:block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Form Sections</span>
        </div>

        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
              title={sec.label}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="hidden sm:inline truncate">{sec.shortLabel}</span>
              {sec.id === 'ats' && (
                <span className="hidden sm:inline-block ml-auto text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                  {currentScore}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Down of Settings: Live Open Resume ATS Score Card */}
      <div className="mt-auto pt-3 border-t border-slate-800/80">
        <button
          onClick={() => setActiveSection('ats')}
          className={`w-full border rounded-xl p-2.5 text-left transition-all flex flex-col gap-1 ${getBadgeColor(currentScore)} hover:scale-[1.02] shadow-md`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Open Resume ATS</span>
            <ShieldCheck className="w-3.5 h-3.5" />
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
