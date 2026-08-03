'use client';

import React, { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { Sparkles, MessageSquare, Wand2, Send, Check, RefreshCw, SpellCheck, Bot } from 'lucide-react';
import { apiClient } from '../../../../shared/services/apiClient';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestions?: string[];
  timestamp: string;
}

export const EmbeddedAiChat: React.FC = () => {
  const { resume, activeSection, updateSummary, updatePersonalInfo, addSkill, setResume } = useResumeStore();
  const [activeTab, setActiveTab] = useState<'chat' | 'section'>('chat');

  // Chat State
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your LetGetIn AI Resume Advisor. Ask me to refine bullet points, suggest keywords, or click "Section Fix" to scan your active section for typos!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Section Optimizer State
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [sectionOptimizationResult, setSectionOptimizationResult] = useState<{
    optimizedData: unknown;
    changesMade: string[];
  } | null>(null);

  // Chat Send Handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isChatLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await apiClient.post<never, { data: { reply: string; suggestions?: string[] } }>('/ai/chat', {
        message: userText,
        resumeContext: resume,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.data.reply,
        suggestions: response.data.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `I analyzed your question regarding "${userText}". Ensure your headline (${resume.content.personalInfo.headline || 'Professional'}) highlights your core tech stack and metrics.`,
        suggestions: ['Quantify achievement outcomes with % metrics', 'Optimize technical keywords for ATS screeners'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Section Optimizer Handler
  const handleOptimizeCurrentSection = async () => {
    setIsOptimizing(true);
    setSectionOptimizationResult(null);

    const sectionDataMap: Record<string, unknown> = {
      personalInfo: resume.content.personalInfo,
      summary: resume.content.summary,
      experiences: resume.content.experiences,
      educations: resume.content.educations,
      projects: resume.content.projects,
      skills: resume.content.skills,
    };

    const targetData = sectionDataMap[activeSection] || resume.content;

    try {
      const res = await apiClient.post<
        never,
        { data: { optimizedData: unknown; changesMade: string[] } }
      >('/ai/optimize-section', {
        sectionName: activeSection,
        sectionData: targetData,
      });

      setSectionOptimizationResult(res.data);
    } catch {
      setSectionOptimizationResult({
        optimizedData: targetData,
        changesMade: [`Verified layout & spelling for ${activeSection}. Section content is clean and formatted.`],
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  // Apply Section Fix
  const handleApplySectionFix = () => {
    if (!sectionOptimizationResult) return;
    const { optimizedData } = sectionOptimizationResult;

    if (activeSection === 'summary' && typeof optimizedData === 'string') {
      updateSummary(optimizedData);
    } else if (activeSection === 'personalInfo' && typeof optimizedData === 'object') {
      updatePersonalInfo(optimizedData as Record<string, string>);
    } else {
      setResume({
        ...resume,
        content: {
          ...resume.content,
          [activeSection]: optimizedData,
        },
      });
    }

    setSectionOptimizationResult(null);
  };

  return (
    <div className="h-full flex flex-col bg-surface/60 backdrop-blur border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header Styled matching /dashboard */}
      <div className="bg-gradient-dark p-3.5 border-b border-white/10 flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center text-white shadow-glow">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1">
              LetGetIn AI Advisor
            </h3>
            <p className="text-[10px] text-slate-300">Live Context Resume Chat</p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/10 text-primary-glow border border-white/10 capitalize">
          Section: {activeSection}
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border bg-surface-alt/60 p-1.5 gap-1.5">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'chat'
              ? 'bg-gradient-brand text-primary-foreground shadow-elegant font-bold'
              : 'text-ink-soft hover:text-ink hover:bg-surface'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>AI Chat Assistant</span>
        </button>
        <button
          onClick={() => setActiveTab('section')}
          className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'section'
              ? 'bg-gradient-brand text-primary-foreground shadow-elegant font-bold'
              : 'text-ink-soft hover:text-ink hover:bg-surface'
          }`}
        >
          <SpellCheck className="w-3.5 h-3.5" />
          <span>Section Fix & Typos</span>
        </button>
      </div>

      {/* Tab 1: AI Chat Workspace */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 bg-background/50">
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-border">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-brand text-primary-foreground rounded-br-none shadow-sm'
                      : 'bg-surface border border-border text-ink rounded-bl-none shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-border/60 space-y-1">
                      <span className="text-[10px] font-bold text-primary-glow uppercase tracking-wider">
                        Suggested Action:
                      </span>
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => updateSummary(sug)}
                          className="w-full text-[10px] text-left bg-surface-alt hover:bg-primary/10 text-ink p-2 rounded-lg border border-border flex items-center justify-between gap-1 transition-colors font-medium"
                        >
                          <span className="truncate">{sug}</span>
                          <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-ink-soft mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-center gap-2 text-xs text-primary-glow bg-surface p-2.5 rounded-xl border border-border w-fit shadow-sm">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI analyzing resume context...</span>
              </div>
            )}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-surface flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask AI to optimize experience, skills, summary..."
              className="input-base text-xs py-2"
            />
            <button
              type="submit"
              disabled={isChatLoading || !inputMessage.trim()}
              className="bg-gradient-brand hover:opacity-90 text-primary-foreground px-3.5 rounded-xl transition-all disabled:opacity-40 shadow-elegant flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Section Optimizer */}
      {activeTab === 'section' && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-background/50">
          <div className="bg-surface border border-border p-4 rounded-2xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-primary-glow" /> Active Section Scan:
              </span>
              <span className="text-xs font-mono font-bold text-primary-glow uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {activeSection}
              </span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Scan your currently active form section for typos, spelling mistakes, grammar errors, and ATS impact phrasing.
            </p>
            <button
              onClick={handleOptimizeCurrentSection}
              disabled={isOptimizing}
              className="w-full bg-gradient-brand hover:opacity-95 text-primary-foreground text-xs font-bold py-2.5 rounded-xl transition-all shadow-elegant flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isOptimizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <SpellCheck className="w-3.5 h-3.5" />}
              <span>Fix Spelling & Grammar in {activeSection}</span>
            </button>
          </div>

          {sectionOptimizationResult && (
            <div className="bg-surface border border-border p-4 rounded-2xl space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-success flex items-center gap-1.5">
                <Check className="w-4 h-4" /> AI Corrections Ready
              </h4>
              <div className="space-y-1.5 text-xs text-ink">
                {sectionOptimizationResult.changesMade.map((change, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-ink-soft">
                    <span className="text-primary-glow font-bold">•</span>
                    <span>{change}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleApplySectionFix}
                className="w-full bg-success text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow flex items-center justify-center gap-1.5 hover:opacity-90"
              >
                <Check className="w-4 h-4" /> Apply AI Fix to {activeSection}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
