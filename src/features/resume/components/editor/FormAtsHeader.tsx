'use client';

import React from 'react';
import { useAtsAnalysis } from '../../hooks/useAtsAnalysis';
import { useResumeStore } from '../../store/useResumeStore';
import { ShieldCheck, RefreshCw, Sparkles, ChevronRight, Zap } from 'lucide-react';

export const FormAtsHeader: React.FC = () => {
  const { isAnalyzing, result, runAtsAnalysis } = useAtsAnalysis();
  const { setActiveSection } = useResumeStore();

  const score = result?.overallScore ?? 0;

  const getScoreBadge = (val: number) => {
    if (val >= 80) return { label: 'High ATS Pass Rate', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (val >= 65) return { label: 'Moderate ATS Score', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    return { label: 'Optimization Needed', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  };

  const badge = getScoreBadge(score);

  return (
    <div className="bg-gradient-dark rounded-2xl p-4 border border-white/10 text-white shadow-elegant relative overflow-hidden mb-3">
      {/* Background Subtle Radial Glow */}
      <div className="absolute top-0 right-0 w-2/3 h-full opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--primary-glow)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left Side: Score & Status */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-extrabold text-lg shadow-glow shrink-0 border border-white/10">
            {score}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary-glow" /> ATS Live Optimizer
              </h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-300/80 mt-0.5">
              Live score synced with your resume edits.
            </p>
          </div>
        </div>

        {/* Quick Breakdown Pills & Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={runAtsAnalysis}
            disabled={isAnalyzing}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10 transition-all flex items-center gap-1.5 disabled:opacity-50"
            title="Re-analyze ATS"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-primary-glow' : ''}`} />
            <span className="hidden xs:inline">Re-scan</span>
          </button>

          <button
            onClick={() => setActiveSection('ats')}
            className="px-3 py-1.5 rounded-xl bg-gradient-brand text-white text-xs font-semibold shadow-elegant hover:shadow-glow transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Full Advisory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 rounded-full h-1.5 mt-3 overflow-hidden">
        <div
          className="bg-gradient-brand h-full transition-all duration-500 rounded-full"
          style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
        />
      </div>
    </div>
  );
};
