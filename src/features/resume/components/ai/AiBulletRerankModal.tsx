'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Minus, Plus, ArrowUpDown } from 'lucide-react';

interface AiBulletRerankModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string; // e.g. "Software Engineer at New Company" or "Project Title"
  currentCount: number;
  initialTargetCount?: number;
  onConfirm: (targetCount: number) => void;
}

export const AiBulletRerankModal: React.FC<AiBulletRerankModalProps> = ({
  isOpen,
  onClose,
  title,
  currentCount,
  initialTargetCount = 3,
  onConfirm,
}) => {
  const [targetCount, setTargetCount] = useState<number>(initialTargetCount);

  if (!isOpen) return null;

  const handleIncrement = () => {
    setTargetCount((prev) => Math.min(6, prev + 1));
  };

  const handleDecrement = () => {
    setTargetCount((prev) => Math.max(1, prev - 1));
  };

  const handleApply = () => {
    onConfirm(targetCount);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-elegant overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-border bg-surface-alt/40">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">
                  Rerank & Generate Bullet Points
                </h3>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                  Select how many bullet points you want to keep. AI will choose the most relevant, metric-driven achievements for <span className="font-semibold text-primary-glow">{title}</span>.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-ink-soft hover:text-ink hover:bg-surface-alt rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-ink mb-2.5">
                Number of bullet points to generate
              </label>

              {/* Stepper Control */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={targetCount <= 1}
                  className="w-10 h-10 rounded-xl bg-surface border border-border hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-ink font-bold text-base transition-colors cursor-pointer shadow-xs"
                  title="Decrease count"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="w-16 h-10 rounded-xl bg-surface-alt border border-border flex items-center justify-center text-base font-extrabold text-ink shadow-inner">
                  {targetCount}
                </div>

                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={targetCount >= 6}
                  className="w-10 h-10 rounded-xl bg-surface border border-border hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-ink font-bold text-base transition-colors cursor-pointer shadow-xs"
                  title="Increase count"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status Information Box */}
            <div className="p-3.5 bg-surface-alt/60 border border-border rounded-xl text-xs space-y-1">
              <div className="text-ink-soft">
                Current bullet points: <span className="font-semibold text-ink">{currentCount}</span>
              </div>
              <div className="text-primary-glow font-semibold">
                Will be generated & optimized: {targetCount} {targetCount === 1 ? 'bullet point' : 'bullet points'}.
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 p-4 border-t border-border bg-surface-alt/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink bg-surface hover:bg-surface-alt border border-border rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary-foreground bg-gradient-brand hover:shadow-glow rounded-xl shadow-elegant transition-all cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Rerank & Generate Bullet Points</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
