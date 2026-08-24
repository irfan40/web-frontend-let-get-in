import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Check, RefreshCw, PlusSquare, AlertTriangle } from 'lucide-react';
import { AIWritingAction } from '../types';
import { ACTION_LABELS, MAX_INSTRUCTION_LENGTH } from '../config/writingContexts';
import { diffWords } from '../utils/simpleDiff';

interface AIWritingPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  contextLabel: string;
  action: AIWritingAction;
  originalText: string;
  onGenerate: (instruction?: string, onChunk?: (partial: string) => void) => Promise<string>;
  onReplace: (result: string) => void;
  onInsert: (result: string) => void;
}

type ViewState = 'input' | 'loading' | 'result' | 'error';

const needsInstruction = (action: AIWritingAction) => action === 'custom' || action === 'generate';

export const AIWritingPreview: React.FC<AIWritingPreviewProps> = ({
  isOpen,
  onClose,
  contextLabel,
  action,
  originalText,
  onGenerate,
  onReplace,
  onInsert,
}) => {
  const [view, setView] = useState<ViewState>('input');
  const [instruction, setInstruction] = useState('');
  const [result, setResult] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setInstruction('');
    setResult('');
    setErrorMessage('');
    if (needsInstruction(action)) {
      setView('input');
    } else {
      setView('loading');
      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, action]);

  if (!isOpen) return null;

  const run = async (withInstruction?: string) => {
    setView('loading');
    setResult('');
    setErrorMessage('');
    try {
      const text = await onGenerate(withInstruction, (partial) => setResult(partial));
      setResult(text);
      setView('result');
    } catch (err: any) {
      const message =
        err?.error?.message || err?.message || "AI couldn't generate a suggestion right now. Please try again.";
      setErrorMessage(message);
      setView('error');
    }
  };

  const handleSubmitInstruction = () => {
    if (!instruction.trim()) return;
    run(instruction.trim());
  };

  const diff = view === 'result' ? diffWords(originalText, result) : [];
  const isGenerateAction = action === 'generate';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-elegant overflow-hidden max-h-[85vh] flex flex-col"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-primary-glow">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-ink">{ACTION_LABELS[action]}</h2>
                <p className="text-[11px] text-ink-soft">{contextLabel}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-ink-soft hover:text-ink hover:bg-surface-alt rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 py-4 overflow-y-auto space-y-4">
            {view === 'input' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ink">
                  {isGenerateAction ? 'Describe what you want to create' : 'Custom instruction'}
                </label>
                <textarea
                  autoFocus
                  rows={3}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value.slice(0, MAX_INSTRUCTION_LENGTH))}
                  placeholder={
                    isGenerateAction
                      ? 'e.g. A cover letter for a Senior Angular Developer role at a fintech startup'
                      : 'e.g. Make this suitable for a senior Angular developer role'
                  }
                  className="input-base text-xs leading-relaxed resize-y"
                />
                <div className="text-right text-[10px] text-ink-soft">
                  {instruction.length}/{MAX_INSTRUCTION_LENGTH}
                </div>
              </div>
            )}

            {view === 'loading' &&
              (result ? (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-primary-glow mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Suggestion
                  </div>
                  <div className="text-xs text-ink bg-primary/5 border border-primary/20 rounded-lg p-3 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {result}
                    <span className="inline-block w-1.5 h-3.5 bg-primary-glow/70 ml-0.5 align-middle animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-ink-soft">
                  <RefreshCw className="w-5 h-5 animate-spin text-primary-glow" />
                  <span className="text-xs font-medium">Generating...</span>
                </div>
              ))}

            {view === 'error' && (
              <div className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2.5 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {view === 'result' && (
              <div className="space-y-3">
                {!isGenerateAction && originalText && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft mb-1">
                      Original
                    </div>
                    <div className="text-xs text-ink-soft bg-surface-alt border border-border rounded-lg p-3 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {originalText}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-primary-glow mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Suggestion
                  </div>
                  <div className="text-xs text-ink bg-primary/5 border border-primary/20 rounded-lg p-3 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {!isGenerateAction && originalText
                      ? diff.map((op, idx) =>
                          op.type === 'remove' ? null : (
                            <span
                              key={idx}
                              className={op.type === 'add' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-sm' : ''}
                            >
                              {op.value}
                            </span>
                          )
                        )
                      : result}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border shrink-0">
            {view === 'input' && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!instruction.trim()}
                  onClick={handleSubmitInstruction}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-brand text-primary-foreground text-xs font-semibold rounded-xl shadow-elegant hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate</span>
                </button>
              </>
            )}

            {view === 'error' && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => run(needsInstruction(action) ? instruction.trim() : undefined)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-brand text-primary-foreground text-xs font-semibold rounded-xl shadow-elegant hover:shadow-glow transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </>
            )}

            {view === 'result' && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => run(needsInstruction(action) ? instruction.trim() : undefined)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-alt hover:bg-surface border border-border text-ink text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
                {!isGenerateAction && originalText && (
                  <button
                    type="button"
                    onClick={() => {
                      onInsert(result);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-surface-alt hover:bg-surface border border-border text-ink text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <PlusSquare className="w-3.5 h-3.5" />
                    <span>Insert</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onReplace(result);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-brand text-primary-foreground text-xs font-semibold rounded-xl shadow-elegant hover:shadow-glow transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isGenerateAction || !originalText ? 'Use This' : 'Replace'}</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
