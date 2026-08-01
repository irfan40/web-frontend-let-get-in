import React from 'react';
import SectionHeader from './SectionHeader';
import { Code, Layout, Database, Brain, HeartHandshake } from 'lucide-react';

export function Dimensions() {
  const dimensions = [
    {
      icon: Code,
      title: 'Technical Execution',
      score: '96%',
      tags: ['System Design', 'Algorithms', 'TypeScript', 'Clean Code'],
    },
    {
      icon: Layout,
      title: 'UI/UX Craftsmanship',
      score: '92%',
      tags: ['Design Systems', 'Micro-interactions', 'Accessibility', 'Figma'],
    },
    {
      icon: Database,
      title: 'Architecture & Data',
      score: '94%',
      tags: ['PostgreSQL', 'Redis', 'Distributed Systems', 'API Design'],
    },
    {
      icon: Brain,
      title: 'Problem Solving',
      score: '98%',
      tags: ['Debugging', 'Performance Tuning', 'Tradeoff Analysis'],
    },
    {
      icon: HeartHandshake,
      title: 'Leadership & Culture',
      score: '95%',
      tags: ['Mentorship', 'Cross-functional Comms', 'Agile Leadership'],
    },
  ];

  return (
    <section id="dimensions" className="py-20 md:py-28 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="Skill Identity"
          description="Multidimensional skill profiles validated through live AI challenges rather than self-reported text."
        >
          5 Dimensions of <span className="text-gradient-brand">Verified Competency</span>
        </SectionHeader>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {dimensions.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.title}
                className="bg-surface rounded-2xl p-5 border border-white/10 card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                      {d.score}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-ink mb-3">{d.title}</h3>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {d.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Dimensions;
