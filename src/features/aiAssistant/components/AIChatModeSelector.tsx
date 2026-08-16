'use client';

import React from 'react';
import { Zap, BrainCircuit } from 'lucide-react';
import { AssistantMode } from '../types';

interface AIChatModeSelectorProps {
  mode: AssistantMode;
  onChange: (mode: AssistantMode) => void;
  disabled?: boolean;
}

export function AIChatModeSelector({ mode, onChange, disabled }: AIChatModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-surface-alt/80 rounded-xl border border-border">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('instant')}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
          mode === 'instant' ? 'bg-surface text-primary shadow-xs' : 'text-ink-soft hover:text-ink'
        }`}
      >
        <Zap className="w-3 h-3" />
        <span>Instant</span>
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('expert')}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
          mode === 'expert' ? 'bg-surface text-primary shadow-xs' : 'text-ink-soft hover:text-ink'
        }`}
      >
        <BrainCircuit className="w-3 h-3" />
        <span>Expert</span>
      </button>
    </div>
  );
}
