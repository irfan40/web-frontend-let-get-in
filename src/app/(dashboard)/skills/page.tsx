"use client";

import React from "react";
import { BookOpenCheck, BrainCircuit, GraduationCap, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SkillEnhancementPage() {
  const modules = [
    {
      title: "Edupie Learning Suite",
      description: "Personalized AI learning paths and targeted course recommendations to bridge critical skill gaps.",
      icon: BookOpenCheck,
      href: "/edupie",
      badge: "AI Powered",
      cta: "Explore Courses",
    },
    {
      title: "Genius Test AI",
      description: "Adaptive AI-driven technical and domain assessments to objectively validate your practical expertise.",
      icon: BrainCircuit,
      href: "/geniustest",
      badge: "Assessment",
      cta: "Start Assessment",
    },
    {
      title: "Certification Exams",
      description: "Proctored skill certification exams to earn industry-verified badges for your LetGetIn profile.",
      icon: GraduationCap,
      href: "/exams",
      badge: "Certifications",
      cta: "View Exams",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-glow text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Skill Enhancement Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
          Accelerate Your Professional Growth
        </h1>
        <p className="text-sm text-ink-soft max-w-2xl">
          Upgrade your skill set with AI learning paths, take adaptive talent assessments, and earn verified certifications.
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.title}
              className="glass p-6 rounded-3xl border border-border/80 hover:border-primary/40 transition-all hover:shadow-glow flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-glow group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-glow bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                    {mod.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-base font-bold text-ink group-hover:text-primary-glow transition-colors">
                    {mod.title}
                  </h2>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </div>

              <Link
                href={mod.href}
                className="mt-6 flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-alt hover:bg-gradient-brand hover:text-primary-foreground text-ink text-xs font-semibold transition-all group-hover:shadow-md"
              >
                <span>{mod.cta}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
