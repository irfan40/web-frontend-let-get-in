import React from 'react';

export interface SectionHeaderProps {
  eyebrow?: string;
  children: React.ReactNode;
  description?: string;
  desc?: string;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  children,
  description,
  desc,
  className = '',
}: SectionHeaderProps) {
  const subtitle = description || desc;
  return (
    <div className={`text-center max-w-3xl mx-auto mb-12 md:mb-16 ${className}`}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <span>{eyebrow}</span>
        </div>
      )}
      <h2 className="text-3xl md:text-5xl font-extrabold text-ink tracking-tight leading-tight">
        {children}
      </h2>
      {subtitle && (
        <p className="text-ink-soft text-base md:text-lg mt-4 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
