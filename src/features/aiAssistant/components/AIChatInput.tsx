'use client';

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface AIChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function AIChatInput({ onSend, disabled, placeholder }: AIChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2.5 border-t border-border bg-surface">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder={placeholder || 'Ask a question...'}
        className="flex-1 input-base text-xs px-3 py-2 bg-surface-alt/60 text-ink disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="p-2 rounded-xl bg-gradient-brand text-white shadow-elegant disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
        aria-label="Send message"
      >
        {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </form>
  );
}
