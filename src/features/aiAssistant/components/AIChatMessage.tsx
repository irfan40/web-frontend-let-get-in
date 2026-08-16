'use client';

import React from 'react';
import { Sparkles, User } from 'lucide-react';
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { MarkdownRenderer } from '@/shared/components/MarkdownRenderer';
import { SuggestedQuestions } from './SuggestedQuestions';
import { AssistantChatMessage } from '../types';

interface AIChatMessageProps {
  message: AssistantChatMessage;
  onSelectSuggestion: (text: string) => void;
  disabled?: boolean;
}

export function AIChatMessageItem({ message, onSelectSuggestion, disabled }: AIChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <Message align={isUser ? 'end' : 'start'}>
      <MessageAvatar className={isUser ? 'bg-primary/10 text-primary' : 'bg-gradient-brand text-white'}>
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </MessageAvatar>
      <MessageContent>
        <Bubble align={isUser ? 'end' : 'start'} variant={isUser ? 'default' : 'muted'}>
          <BubbleContent>
            {isUser ? <span className="text-sm">{message.text}</span> : <MarkdownRenderer content={message.text} />}
          </BubbleContent>
        </Bubble>
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <SuggestedQuestions questions={message.suggestions} onSelect={onSelectSuggestion} disabled={disabled} />
        )}
      </MessageContent>
    </Message>
  );
}
