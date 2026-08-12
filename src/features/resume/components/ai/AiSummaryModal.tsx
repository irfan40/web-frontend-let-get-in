'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, X, Briefcase, Code, TrendingUp, Shuffle } from 'lucide-react';
import { useResumeStore } from '../../store/useResumeStore';
import { useAiCoachStore } from '../../store/useAiCoachStore';

export interface SUMMARY_TEMPLATE_ITEM {
  id: string;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  buildText: (headline: string, topSkills: string, extraContext: string) => string;
}

export const SUMMARY_TEMPLATES: SUMMARY_TEMPLATE_ITEM[] = [
  {
    id: 'executive',
    title: 'Executive & Leader',
    badge: 'Senior & Lead Roles',
    icon: Briefcase,
    description: 'Emphasizes strategic leadership, system architecture scaling, and cross-functional engineering management.',
    buildText: (headline, topSkills, extraContext) =>
      `Results-driven ${headline || 'Engineering Professional'} with proven experience building scalable high-performance systems and leading cross-functional teams. Specialized in ${topSkills || 'modern software architecture'}, with a track record of driving technical excellence. ${extraContext ? extraContext.trim() : ''}`,
  },
  {
    id: 'technical',
    title: 'Technical Specialist',
    badge: 'Specialized & Hands-on',
    icon: Code,
    description: 'Focuses on deep technical stack expertise, robust API development, latency optimization, and code quality.',
    buildText: (headline, topSkills, extraContext) =>
      `Detail-oriented ${headline || 'Software Engineer'} specializing in ${topSkills || 'full stack architecture and web services'}. Proven track record of optimizing application latency, building resilient APIs, and engineering clean, maintainable codebases. ${extraContext ? extraContext.trim() : ''}`,
  },
  {
    id: 'impact',
    title: 'Growth & Impact',
    badge: 'Metrics & Performance',
    icon: TrendingUp,
    description: 'Highlights percentage metrics, performance optimizations, rapid product delivery, and business growth.',
    buildText: (headline, topSkills, extraContext) =>
      `Innovative ${headline || 'Developer'} focused on delivering high-impact digital products. Demonstrated success in optimizing system performance by 35%+, streamlining user workflows, and leveraging ${topSkills || 'modern engineering best practices'}. ${extraContext ? extraContext.trim() : ''}`,
  },
  {
    id: 'versatile',
    title: 'Career Switcher & Versatile',
    badge: 'Adaptable & Agile',
    icon: Shuffle,
    description: 'Emphasizes rapid learning agility, cross-domain problem solving, and versatile technical execution.',
    buildText: (headline, topSkills, extraContext) =>
      `Versatile ${headline || 'Tech Professional'} with strong expertise in software development, problem-solving, and cross-functional execution. Passionate about utilizing ${topSkills || 'modern tech stacks'} to deliver elegant, user-centric software solutions. ${extraContext ? extraContext.trim() : ''}`,
  },
];

interface AiSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiSummaryModal: React.FC<AiSummaryModalProps> = ({ isOpen, onClose }) => {
  const { resume, updateSummary } = useResumeStore();
  const { triggerSummaryGenerationAi, setAppliedNotice } = useAiCoachStore();

  const rawHeadline = resume.content.personalInfo?.headline;
  const headline = typeof rawHeadline === 'string'
    ? rawHeadline
    : (rawHeadline && typeof rawHeadline === 'object' && 'headline' in rawHeadline)
    ? String((rawHeadline as any).headline)
    : 'Software Professional';

  const skillsList = (resume.content.skills || [])
    .map((s) => (typeof s === 'string' ? s : s?.name || ''))
    .filter(Boolean)
    .slice(0, 6)
    .join(', ');

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('executive');
  const [customContext, setCustomContext] = useState<string>('');

  if (!isOpen) return null;

  const selectedTemplate = SUMMARY_TEMPLATES.find((t) => t.id === selectedTemplateId) || SUMMARY_TEMPLATES[0];

  const handleWriteWithAiAndSendToCoach = () => {
    // Dispatch AI generation directly inside LetGetIn AI Coach chat
    triggerSummaryGenerationAi({
      templateStyle: selectedTemplate.title,
      customContext,
    });
    // Immediately close modal
    onClose();
  };

  const handleUseTemplateDirectly = () => {
    const text = selectedTemplate.buildText(headline, skillsList, customContext);
    updateSummary(text);
    setAppliedNotice('Applied template summary to your resume!');
    setTimeout(() => setAppliedNotice(null), 3500);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-elegant overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border bg-surface-alt/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-xs shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                  AI Summary Generator & Template Assistant
                </h2>
                <p className="text-xs text-ink-soft mt-0.5">
                  Targeting Role: <span className="text-primary-glow font-semibold">{headline}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-ink-soft hover:text-ink hover:bg-surface-alt rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-border">
            {/* Step 1: Select Template Style */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-2.5 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-primary-glow" />
                Step 1: Choose a Summary Template Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUMMARY_TEMPLATES.map((tmpl) => {
                  const IconComp = tmpl.icon;
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all relative space-y-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-primary/10 border-primary-glow shadow-sm ring-1 ring-primary-glow'
                          : 'bg-surface border-border hover:border-primary-glow/40 hover:bg-surface-alt'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                          <IconComp className={`w-4 h-4 ${isSelected ? 'text-primary-glow' : 'text-ink-soft'}`} />
                          {tmpl.title}
                        </span>
                        <span className="text-[10px] font-semibold bg-surface-alt text-ink-soft border border-border px-1.5 py-0.5 rounded">
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-soft leading-normal">
                        {tmpl.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Custom Context / Prompt */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5 flex items-center justify-between">
                <span>Step 2: Add Custom Context or User Instructions (Optional)</span>
                <span className="text-[10px] text-ink-soft font-normal">e.g. Target job, years of exp, key achievement</span>
              </label>
              <textarea
                rows={3}
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                placeholder={`e.g. 5+ years building scalable cloud applications with React & Node.js, optimized throughput by 40%, targeting Senior Full Stack roles...`}
                className="input-base text-xs leading-relaxed resize-y"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleUseTemplateDirectly}
                className="w-full sm:w-auto text-xs font-semibold text-ink hover:text-primary-glow bg-surface-alt hover:bg-surface border border-border px-4 py-2.5 rounded-xl transition-colors text-center cursor-pointer"
              >
                Use Template Directly
              </button>

              <button
                type="button"
                onClick={handleWriteWithAiAndSendToCoach}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-brand text-primary-foreground text-xs font-bold rounded-xl transition-all shadow-elegant hover:shadow-glow cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Write Summary & Send to Coach</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
