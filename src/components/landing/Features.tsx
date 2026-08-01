import React from 'react';
import SectionHeader from './SectionHeader';
import { Cpu, ShieldCheck, FileCheck, Target, Sparkles, Users } from 'lucide-react';

export function Features() {
  const features = [
    {
      icon: Cpu,
      title: 'AI Pathfinder Engine',
      description:
        'Analyzes candidate skills with adaptive deep-learning models to deliver candidates that actually match company culture.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Proof of Work',
      description:
        'Cryptographically signed credentials and verified project evaluations replace unverifiable PDF claims.',
    },
    {
      icon: FileCheck,
      title: 'Instant ATS Optimization',
      description:
        'Generates pixel-perfect, vector PDF resumes guaranteed to achieve 98%+ parsing rates on modern applicant tracking systems.',
    },
    {
      icon: Target,
      title: 'AI Mock Interviews',
      description:
        'Practice role-specific technical and behavioral interviews with instant feedback and percentile scoring.',
    },
    {
      icon: Sparkles,
      title: 'Gemini-Powered Rewriting',
      description:
        'Refines work experience bullet points using STAR methodology and quantifiable metrics for maximum impact.',
    },
    {
      icon: Users,
      title: 'Talent Community',
      description:
        'Connect with global mentors, open-source collaborators, and top hiring managers verified on LetGetIn.',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 px-4 sm:px-6 bg-slate-950/60 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="Platform Capabilities"
          description="Everything you need to showcase your true potential and land top-tier roles."
        >
          Built for <span className="text-gradient-brand">Modern Talent & Teams</span>
        </SectionHeader>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-surface rounded-2xl p-6 sm:p-8 border border-white/10 card-hover space-y-4"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-ink">{f.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
