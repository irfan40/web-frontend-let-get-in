'use client';

import React from 'react';
import { X, Trash2, Sparkles } from 'lucide-react';
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from '@/components/ui/message-scroller';
import { AIChatMessageItem } from './AIChatMessage';
import { AIChatInput } from './AIChatInput';
import { AIChatModeSelector } from './AIChatModeSelector';
import { SuggestedQuestions } from './SuggestedQuestions';
import { CONTEXT_LABELS, SUGGESTED_QUESTIONS } from '../config/suggestedQuestions.config';
import { useAIAssistantStore } from '../store/useAIAssistantStore';
import { AssistantContextType, AssistantContextPayload } from '../types';

interface AIChatPanelProps {
  context: AssistantContextType;
  contextPayload?: AssistantContextPayload;
  onClose: () => void;
}

export function AIChatPanel({ context, contextPayload, onClose }: AIChatPanelProps) {
  const { messages, isLoading, mode } = useAIAssistantStore((state) => state.byContext[context]);
  const setMode = useAIAssistantStore((state) => state.setMode);
  const clearConversation = useAIAssistantStore((state) => state.clearConversation);
  const sendMessage = useAIAssistantStore((state) => state.sendMessage);

  const handleSend = (text: string) => {
    sendMessage(context, text, contextPayload);
  };

  const suggestedStarterQuestions = SUGGESTED_QUESTIONS[context][mode];

  return (
    <div className="flex flex-col h-full w-full bg-surface border border-border rounded-2xl shadow-elegant overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-surface-alt/50 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-brand text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-ink truncate">{CONTEXT_LABELS[context]}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => clearConversation(context)}
            title="Clear conversation"
            className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="p-1.5 rounded-lg text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="px-3.5 py-2 border-b border-border/70 flex items-center justify-between gap-2 shrink-0">
        <span className="text-[11px] font-semibold text-ink-soft">Response mode</span>
        <AIChatModeSelector mode={mode} onChange={(m) => setMode(context, m)} disabled={isLoading} />
      </div>

      {/* Messages */}
      <MessageScrollerProvider>
        <MessageScroller className="flex-1 min-h-0">
          <MessageScrollerViewport>
            <MessageScrollerContent className="px-3.5 py-3">
              {messages.map((m) => (
                <MessageScrollerItem key={m.id}>
                  <AIChatMessageItem message={m} onSelectSuggestion={handleSend} disabled={isLoading} />
                </MessageScrollerItem>
              ))}
              {messages.length <= 1 && (
                <MessageScrollerItem>
                  <SuggestedQuestions questions={suggestedStarterQuestions} onSelect={handleSend} disabled={isLoading} />
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton direction="end" />
        </MessageScroller>
      </MessageScrollerProvider>

      {/* Input */}
      <AIChatInput onSend={handleSend} disabled={isLoading} placeholder={`Ask about your ${context}...`} />
    </div>
  );
}
