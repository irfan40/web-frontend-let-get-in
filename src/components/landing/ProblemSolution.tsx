import React from 'react';
import SectionHeader from './SectionHeader';
import { XCircle, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export function ProblemSolution() {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        <SectionHeader eyebrow="The Paradigm Shift">
          Why Old CVs Fail & <span className="text-gradient-brand">LetGetIn Succeeds</span>
        </SectionHeader>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Old Way */}
          <div className="bg-slate-900/40 border border-rose-500/20 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Traditional CV Hiring</h3>
                <p className="text-xs text-rose-300">Self-reported, static & unverified</p>
              </div>
            </div>

            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>Resumes get blackholed by arbitrary keyword filters in ATS scanners.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>No proof of real-world skills — candidates exaggerate, recruiters doubt.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>Hiring takes 45+ days with multi-stage repetitive interviews.</span>
              </li>
            </ul>
          </div>

          {/* New Way */}
          <div className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">The LetGetIn Platform</h3>
                <p className="text-xs text-indigo-300">AI-verified, instant proof of work</p>
              </div>
            </div>

            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Interactive proof cards showing AI interview evaluation & live metrics.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Pathfinder AI matches candidates directly with verified company tech stacks.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span>60% reduction in time-to-hire with hiring in as little as 11 days.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProblemSolution;
