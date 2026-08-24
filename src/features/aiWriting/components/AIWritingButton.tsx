import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIWritingButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  iconOnly?: boolean;
  title?: string;
}

export const AIWritingButton: React.FC<AIWritingButtonProps> = ({
  onClick,
  disabled,
  label = 'AI Write',
  className = '',
  iconOnly = false,
  title,
}) => {
  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title || label}
        className={`p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary-glow border border-primary/20 transition-all cursor-pointer shrink-0 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <Sparkles className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary-glow border border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-lg px-2.5 py-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs ${className}`}
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
};
