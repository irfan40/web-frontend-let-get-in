'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AIChatPanel } from './AIChatPanel';
import { useAIAssistantStore } from '../store/useAIAssistantStore';
import { AssistantContextType, AssistantContextPayload } from '../types';

interface AIChatProps {
  context: AssistantContextType;
  contextPayload?: AssistantContextPayload;
}

export function AIChat({ context, contextPayload }: AIChatProps) {
  const isOpen = useAIAssistantStore((state) => state.byContext[context].isOpen);
  const setOpen = useAIAssistantStore((state) => state.setOpen);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="ai-chat-panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="fixed bottom-24 right-6 z-40 w-[min(24rem,calc(100vw-3rem))] h-[min(32rem,calc(100vh-8rem))]"
          >
            <AIChatPanel context={context} contextPayload={contextPayload} onClose={() => setOpen(context, false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setOpen(context, true)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-gradient-brand text-white shadow-elegant hover:shadow-glow transition-all flex items-center justify-center cursor-pointer"
          title="Open AI Assistant"
        >
          <Sparkles className="w-5 h-5" />
        </motion.button>
      )}
    </>
  );
}
