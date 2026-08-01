'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Sparkles, Wand2, ShieldCheck } from 'lucide-react';
import { AtsAnalysisResult } from '../../hooks/useAtsAnalysis';

interface AtsScoreMeterProps {
  result: AtsAnalysisResult | null;
  isAnalyzing: boolean;
  onImproveAction: (actionType: 'summary' | 'experience' | 'skills' | 'projects' | 'metrics' | 'keywords') => void;
}

export const AtsScoreMeter: React.FC<AtsScoreMeterProps> = ({
  result,
  isAnalyzing,
  onImproveAction,
}) => {
  if (!result) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 65) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Great Job! Your resume is above average.';
    if (score >= 65) return 'Good Progress! Ready for recruiter review.';
    return 'Action Needed! Optimize key sections for ATS screeners.';
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Main ATS Score Card */}
      <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Overall ATS Compliance Score
            </span>
            <p className="text-xs text-slate-400 mt-1">{getScoreLabel(result.overallScore)}</p>
          </div>

          {/* Radial / Boxed Score */}
          <div className={`flex flex-col items-center justify-center px-5 py-3 border rounded-2xl ${getScoreColor(result.overallScore)}`}>
            <span className="text-3xl font-extrabold tracking-tight">{result.overallScore}</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase">/ 100</span>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2.5 mt-4 overflow-hidden border border-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${result.overallScore}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              result.overallScore >= 80
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : result.overallScore >= 65
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                : 'bg-gradient-to-r from-amber-500 to-orange-500'
            }`}
          />
        </div>

        {/* Sub Score Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800/80 text-center">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">Completeness</span>
            <span className="text-base font-bold text-slate-200">{result.completenessScore}%</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">Readability</span>
            <span className="text-base font-bold text-slate-200">{result.readabilityScore}%</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">Keywords</span>
            <span className="text-base font-bold text-slate-200">{result.keywordScore}%</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">Formatting</span>
            <span className="text-base font-bold text-slate-200">{result.formattingScore}%</span>
          </div>
        </div>
      </div>

      {/* AI Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-3">
            <CheckCircle2 className="w-4 h-4" />
            Strengths ({result.strengths.length})
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {result.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✔</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Needs Improvement */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Needs Improvement ({result.weaknesses.length})
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {result.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">⚠</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Recommendations with "Improve with AI" Buttons */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-4">
          <Wand2 className="w-4 h-4 text-blue-400" />
          Recommended Actions & 1-Click AI Improvements
        </h4>

        <div className="space-y-3">
          {result.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-950/70 border border-slate-800 hover:border-blue-500/30 rounded-xl gap-3 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-200 font-medium leading-relaxed">{rec.text}</span>
              </div>
              <button
                onClick={() => onImproveAction(rec.actionType)}
                className="self-end sm:self-center flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shrink-0"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Improve with AI</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
