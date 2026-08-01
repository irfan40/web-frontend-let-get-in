import React from 'react';
import Link from './NavLink';
import { Sparkles, ArrowRight, ShieldCheck, Zap, CheckCircle2, Award } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[250px] bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold shadow-lg shadow-indigo-500/10 mb-8 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>The Verified Professional Identity Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
          Stop Claiming Skills. <br />
          <span className="text-gradient-brand">Start Proving Them.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-lg sm:text-xl max-w-3xl mx-auto mt-6 leading-relaxed">
          Build ATS-optimized, executive-ready resumes backed by AI skill verification, real-time interview evaluations, and shareable proof of work cards.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/auth"
            className="w-full sm:w-auto bg-gradient-brand text-white font-bold text-base px-8 py-4 rounded-xl shadow-xl shadow-indigo-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2.5"
          >
            <span>Claim Your Profile — Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base px-7 py-4 rounded-xl backdrop-blur-md transition-all flex items-center justify-center"
          >
            Explore Features
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs md:text-sm text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>100% Verified Proofs</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Instant ATS Parsing</span>
          </div>
        </div>

        {/* Interactive Mockup Preview Card */}
        <div className="mt-14 relative max-w-4xl mx-auto rounded-2xl border border-white/15 bg-slate-900/70 backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-indigo-950/50">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-slate-500">letgetin.id/proof/rahul-khanna</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Award className="w-4 h-4" />
              <span>Verified Candidate</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-left">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-2">
              <div className="text-xs text-indigo-400 font-semibold uppercase">AI Match Score</div>
              <div className="text-3xl font-extrabold text-white">98.4%</div>
              <p className="text-xs text-slate-400">Validated against Stripe Data Science benchmarks</p>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-2">
              <div className="text-xs text-emerald-400 font-semibold uppercase">Time to Hire</div>
              <div className="text-3xl font-extrabold text-white">11 Days</div>
              <p className="text-xs text-slate-400">Accelerated by Pathfinder AI assessments</p>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 space-y-2">
              <div className="text-xs text-purple-400 font-semibold uppercase">Proof of Work</div>
              <div className="text-3xl font-extrabold text-white">12 Badges</div>
              <p className="text-xs text-slate-400">Cryptographically signed skill evaluations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
