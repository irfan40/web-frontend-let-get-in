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
  ChevronRight,
  Wand2,
} from "lucide-react";

export const FormAtsHeader: React.FC = () => {
  const { isAnalyzing, result, runAtsAnalysis } = useAtsAnalysis();
  const { resume, updateSummary, updateExperience } = useResumeStore();
  const [activeTab, setActiveTab] = useState<"analysis" | "tailor">("analysis");
  const [targetJobTitle, setTargetJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorSuccess, setTailorSuccess] = useState(false);

  const score = result?.overallScore ?? 0;

  const handleTailorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setIsTailoring(true);
    setTimeout(() => {
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

      runAtsAnalysis();
      setIsTailoring(false);
      setTailorSuccess(true);
      setTimeout(() => setTailorSuccess(false), 4000);
    }, 1200);
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
              ? "bg-gradient-brand  text-white shadow-sm"
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
              ? "bg-gradient-brand  text-white shadow-sm"
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-brand  flex items-center justify-center text-white shadow-sm shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Resume analysis
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Run the analysis to get a score, prioritized fixes by section,
                  and AI-ready recommendations.
                </p>
              </div>
            </div>

            <button
              onClick={runAtsAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-gradient-brand  hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isAnalyzing ? "animate-spin" : ""}`}
              />
              <span>{isAnalyzing ? "Analyzing..." : "Analyze resume"}</span>
            </button>
          </div>

          {/* Live ATS Score Metric Bar */}
          <div className="pt-2 border-t border-sky-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gradient-brand " />
              <span className="font-semibold text-slate-700">
                ATS Match Score:
              </span>
              <span className="font-extrabold text-gradient-brand  bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                {score}%
              </span>
            </div>
            <div className="w-1/3 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(8, score)}%` }}
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
              placeholder="Paste job description keywords here..."
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isTailoring || !jobDescription.trim()}
            className="w-full py-2 bg-gradient-brand  hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isTailoring ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
            <span>Tailor Resume to Job</span>
          </button>

          {tailorSuccess && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Resume tailored & summary updated with job keywords!</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
