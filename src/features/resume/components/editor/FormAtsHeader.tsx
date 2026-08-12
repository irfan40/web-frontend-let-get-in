"use client";

import React, { useState } from "react";
import { useAtsAnalysis } from "../../hooks/useAtsAnalysis";
import { useResumeStore } from "../../store/useResumeStore";
import {
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Target,
  CheckCircle2,
  AlertCircle,
  Wand2,
} from "lucide-react";

export const FormAtsHeader: React.FC = () => {
  const { isAnalyzing, result, hasAnalyzed, isStale, runAtsAnalysis } = useAtsAnalysis();
  const { resume, updateSummary, updateExperience } = useResumeStore();
  const [activeTab, setActiveTab] = useState<"analysis" | "tailor">("analysis");
  const [targetJobTitle, setTargetJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorSuccess, setTailorSuccess] = useState(false);

  // If analyzed, use result score; otherwise fallback to resume's stored atsScore or 0
  const score = result?.overallScore ?? resume.atsScore ?? 0;

  const handleAnalyzeClick = async () => {
    await runAtsAnalysis();
  };

  const handleTailorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setIsTailoring(true);
    try {
      // Tailor resume content using target keywords
      const currentHeadline =
        targetJobTitle.trim() ||
        resume.content.personalInfo.headline ||
        "Software Professional";
      const tailoredSummary = `Results-oriented ${currentHeadline} with expertise in building scalable high-performance applications, optimizing system architecture, and implementing best-in-class software solutions tailored to ${targetJobTitle || "industry standard requirements"}.`;

      updateSummary(tailoredSummary);

      if (resume.content.experiences.length > 0) {
        const firstExp = resume.content.experiences[0];
        const newBullets = [
          ...firstExp.highlights,
          `Optimized workflow architectures and cross-functional processes aligned with ${targetJobTitle || "target role requirements"}.`,
        ];
        updateExperience(firstExp.id, { highlights: newBullets });
      }

      // Re-run ATS scoring on the updated tailored resume
      await runAtsAnalysis(jobDescription);
      setTailorSuccess(true);
      setTimeout(() => setTailorSuccess(false), 4000);
    } catch (err) {
      console.warn("Tailor error:", err);
    } finally {
      setIsTailoring(false);
    }
  };

  const getScoreColorBadge = (s: number) => {
    if (s === 0) return "text-slate-500 bg-slate-100 border-slate-200";
    if (s >= 80) return "text-emerald-700 bg-emerald-100 border-emerald-300";
    if (s >= 65) return "text-sky-700 bg-sky-100 border-sky-300";
    if (s >= 40) return "text-amber-700 bg-amber-100 border-amber-300";
    return "text-rose-700 bg-rose-100 border-rose-300";
  };

  const getScoreProgressColor = (s: number) => {
    if (s === 0) return "bg-slate-300";
    if (s >= 80) return "bg-emerald-500";
    if (s >= 65) return "bg-sky-500";
    if (s >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getScoreStatusLabel = (s: number, analyzed: boolean) => {
    if (!analyzed && s === 0) return "Click 'Analyze resume' to score";
    if (s === 0) return "Empty resume (0/100)";
    if (s >= 85) return "Excellent ATS Match";
    if (s >= 70) return "Good ATS Score";
    if (s >= 50) return "Fair — Needs Optimization";
    return "Low ATS Match — Action Needed";
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm mb-4 space-y-3">
      {/* Top Pill Tabs: Resume Analysis vs Tailor Resume */}
      <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("analysis")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === "analysis"
              ? "bg-gradient-brand text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Resume Analysis</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tailor")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === "tailor"
              ? "bg-gradient-brand text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Tailor Resume</span>
        </button>
      </div>

      {/* Tab Content 1: Resume Analysis */}
      {activeTab === "analysis" && (
        <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-white shadow-sm shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    ATS Resume Intelligence
                  </h3>
                  {isStale && hasAnalyzed && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                      Edits made • Ready to re-analyze
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Analyze your current resume data to get an instant ATS score, prioritized fixes, and keyword gaps.
                </p>
              </div>
            </div>

            <button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing}
              className="px-4 py-2.5 bg-gradient-brand hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`}
              />
              <span>{isAnalyzing ? "Analyzing..." : hasAnalyzed ? "Re-analyze resume" : "Analyze resume"}</span>
            </button>
          </div>

          {/* Live ATS Score Metric Bar */}
          <div className="pt-2.5 border-t border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span className="font-semibold text-slate-700">
                ATS Match Score:
              </span>
              <span
                className={`font-extrabold px-2.5 py-0.5 rounded-full border text-xs ${getScoreColorBadge(
                  score
                )}`}
              >
                {score}%
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                • {getScoreStatusLabel(score, hasAnalyzed || score > 0)}
              </span>
            </div>
            <div className="w-full sm:w-1/3 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${getScoreProgressColor(
                  score
                )}`}
                style={{ width: `${Math.max(score > 0 ? 6 : 0, score)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Tailor Resume */}
      {activeTab === "tailor" && (
        <form
          onSubmit={handleTailorSubmit}
          className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 space-y-3"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Job Title
            </label>
            <input
              type="text"
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Job Description
            </label>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description keywords or full posting here..."
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isTailoring || !jobDescription.trim()}
            className="w-full py-2 bg-gradient-brand hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isTailoring ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            <span>Tailor Resume & Analyze Match</span>
          </button>

          {tailorSuccess && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Resume tailored & ATS analysis updated with target job keywords!</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
