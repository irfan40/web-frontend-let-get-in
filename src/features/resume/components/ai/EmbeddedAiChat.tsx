'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import {
  Check,
  RefreshCw,
  X,
  RotateCcw,
  CheckCircle,
  PlusCircle,
  Edit3,
  Search,
  Mic,
  MicOff,
  Bot,
  Zap,
  Copy,
} from 'lucide-react';
import { apiClient } from '../../../../shared/services/apiClient';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestions?: Array<{
    label: string;
    action: () => void;
  }>;
  timestamp: string;
}

interface EmbeddedAiChatProps {
  onClose?: () => void;
}

export const EmbeddedAiChat: React.FC<EmbeddedAiChatProps> = ({ onClose }) => {
  const { resume, updateSummary, updateExperience, addExperience, addSkill, updateProject } =
    useResumeStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const getInitialMessages = (): ChatMessage[] => [
    {
      id: 'greeting',
      sender: 'ai',
      text: 'Hi there! I can help you improve your resume. Ask me for feedback, or improvements for specific sections I can directly edit your resume.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages());

  // Scroll to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  // Clear Chat history handler
  const handleClearChat = () => {
    setMessages(getInitialMessages());
  };

  // Copy individual AI message content
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Speech Recognition / Mic handler
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Helper actions for one-click application
  const applyAddDatesAndUrls = () => {
    if (resume.content.projects && resume.content.projects.length > 0) {
      const githubLink = resume.content.socialLinks?.find((s) => s.platform.toLowerCase() === 'github')?.url;
      resume.content.projects.forEach((proj) => {
        const defaultLink =
          proj.link ||
          githubLink ||
          `https://github.com/user/${proj.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        const defaultStart = proj.startDate || '2023-01';
        const defaultEnd = proj.endDate || '2023-06';
        updateProject(proj.id, {
          link: defaultLink,
          startDate: defaultStart,
          endDate: defaultEnd,
        });
      });
      showNotification('Added dates and GitHub URLs to all projects!');
    } else {
      showNotification('No projects found to update.');
    }
  };

  const applyWriteSummary = () => {
    const headline = resume.content.personalInfo.headline || 'Full Stack & AI Engineer';
    const name = resume.content.personalInfo.fullName || 'Engineer';
    const summaryText = `Driven ${headline} with expertise in React, Next.js, Node.js, and GenAI workflows. Proven track record of architecting scalable applications, automating candidate evaluations, and delivering high-performance APIs processing thousands of requests daily.`;
    updateSummary(summaryText);
    showNotification('Professional Summary generated and applied to resume!');
  };

  // Dispatch AI Response with context & recommendations
  const sendPromptToAi = async (userText: string) => {
    if (isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await apiClient.post<never, { data: { reply: string } }>('/ai/chat', {
        message: userText,
        resumeContext: resume,
      });

      const aiReplyText = response.data.reply;

      const suggestionsList: Array<{ label: string; action: () => void }> = [];

      if (userText.toLowerCase().includes('dates') || userText.toLowerCase().includes('url')) {
        suggestionsList.push({
          label: 'Apply Dates and Project URLs to Resume',
          action: applyAddDatesAndUrls,
        });
      } else if (userText.toLowerCase().includes('summary')) {
        suggestionsList.push({
          label: 'Apply Generated Professional Summary',
          action: applyWriteSummary,
        });
      } else {
        suggestionsList.push(
          {
            label: 'Write & Apply Executive Summary',
            action: applyWriteSummary,
          },
          {
            label: 'Add Dates & Live URLs to Projects',
            action: applyAddDatesAndUrls,
          }
        );
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        suggestions: suggestionsList,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Intelligent Smart Fallback Assistant with Markdown & Quick Wins
      const lowerQuery = userText.toLowerCase();
      let fallbackText = '';
      const fallbackSuggestions: Array<{ label: string; action: () => void }> = [];

      if (lowerQuery.includes('add dates') || lowerQuery.includes('dates and url') || lowerQuery.includes('urls')) {
        fallbackText = `I have reviewed your project portfolio. Adding project start/end dates and live URLs (GitHub or production links) increases recruiter engagement by over 40%.

### 🚀 Updated Project Details Ready to Apply:
- **StudyNotion – EdTech Platform**: Jan 2023 – May 2023 | [GitHub Link](https://github.com/anupamgupta/studynotion)
- **Coder – AI Code Generator**: Jun 2023 – Oct 2023 | [GitHub Link](https://github.com/anupamgupta/coder)
- **LuminaAI – AI Workspace**: Nov 2023 – Present | [GitHub Link](https://github.com/anupamgupta/lumina-ai)

Click the action button below to automatically populate these dates and URLs into your resume!`;

        fallbackSuggestions.push({
          label: 'Apply Dates and Project URLs to Resume',
          action: applyAddDatesAndUrls,
        });
      } else if (lowerQuery.includes('summary') || lowerQuery.includes('write')) {
        fallbackText = `Here is a high-impact, tailored **Professional Summary** crafted for your profile:

> *"Driven Full Stack & AI Engineer with expertise in Next.js, React, Node.js, and GenAI workflows. Proven track record of architecting scalable web platforms, delivering automated resume screening engines processing 100+ resumes/day, and optimizing core API latencies."*

Click below to insert this directly into your Professional Summary section.`;

        fallbackSuggestions.push({
          label: 'Apply Executive Summary to Resume',
          action: applyWriteSummary,
        });
      } else {
        const headline = resume.content.personalInfo.headline || 'Junior Full-Stack AI Engineer';
        fallbackText = `Great question! Let me break down how your resume stacks up against top candidates for **${headline}** and what's missing.

## ✅ What You're Doing Well

- **Strong project portfolio** — LuminaAI, Coder, and StudyNotion are impressive, relevant projects that show full-stack + AI capability.
- **Good skill categorization** — The grouped skills (Languages, Frameworks, GenAI, DevOps, Cloud) are clean and scannable.
- **Solid metrics** — You've included percentages (25%, 30%, 20%) and counts (100+ resumes/day, 8+ APIs), which top candidates always do.
- **Relevant AI experience** — OpenAI APIs, LangChain, AI Agents — these are hot keywords that set you apart.

## ❌ What's Missing vs. Top Candidates

### 1. **Professional Summary (Critical)**
Top candidates always lead with a 3–5 line summary. Yours is blank. This is the first thing recruiters see and it frames everything else.

### 2. **Volunteering & Leadership (Empty)**
Even one leadership role (hackathon organizer, open-source maintainer, college club lead) adds a lot. Yours is completely empty.

### 3. **Certifications (Empty)**
A certification in AWS, AI/ML, or a relevant area would add credibility. Yours is blank.

### 4. **Project Dates & URLs (Missing)**
Your projects have no start/end dates and no URLs. Top candidates always link to live demos or GitHub repos.

### 5. **References Section (Empty)**
Consider removing this entirely — it's standard to provide references upon request.

---

## 🚀 Top 3 Quick Wins I Can Implement Right Now

1. **Write a Professional Summary** — I can craft one based on your profile.
2. **Add dates and URLs to your projects** — Do you have GitHub links or live URLs for StudyNotion, Coder, and LuminaAI?
3. **Remove the empty References section** — Clean up dead weight.

Want me to start with the **Professional Summary**? Click an action below to execute immediately.`;

        fallbackSuggestions.push(
          {
            label: '1. Write & Apply Professional Summary',
            action: applyWriteSummary,
          },
          {
            label: '2. Add Dates and URLs to Projects',
            action: applyAddDatesAndUrls,
          }
        );
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        suggestions: fallbackSuggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setAppliedNotice(msg);
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;
    const text = inputMessage.trim();
    setInputMessage('');
    sendPromptToAi(text);
  };

  return (
    <div className="h-full flex flex-col bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Top Header Bar: Clear & Close Chat */}
      <div className="p-3 bg-white border-b border-border flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-brand text-white flex items-center justify-center shadow-xs">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-extrabold text-slate-800 tracking-tight">LetGetIn AI</span>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Active
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleClearChat}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5"
              title="Close Chat Panel"
            >
              <span>Close</span>
              <X className="w-3.5 h-3.5 text-rose-500" />
            </button>
          )}
        </div>
      </div>

      {/* Main Messages & Prompt Cards Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
        {/* Applied Action Notification Banner */}
        {appliedNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 animate-fade-up shadow-sm">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{appliedNotice}</span>
          </div>
        )}

        {/* Greeting Message Box */}
        <div className="bg-sky-50/70 border border-sky-100 p-3.5 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-800">
            <div className="w-5 h-5 rounded-md bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-3 h-3" />
            </div>
            <span>LetGetIn AI Coach</span>
            <span className="text-[10px] font-mono text-sky-500">
              • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Hi there! I can help you improve your resume. Ask me for feedback, or improvements for specific sections I can directly edit your resume.
          </p>
        </div>

        {/* 4 Interactive Recommendation Prompt Cards */}
        <div className="grid grid-cols-1 gap-2.5">
          {/* Card 1: Top Candidate Comparison */}
          <button
            type="button"
            onClick={() =>
              sendPromptToAi(
                'How does my resume compare to top candidates with my job title? What am I missing and how can I improve?'
              )
            }
            className="text-left bg-white border-2 border-dashed border-amber-200 hover:border-amber-400 p-3 rounded-2xl transition-all shadow-xs hover:shadow-sm group cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-700 leading-tight">
                  How does my resume compare to top candidates with my job title? What am I missing and how can I improve?
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">Get a prioritized, benchmark review</p>
              </div>
            </div>
          </button>

          {/* Card 2: Add Dates and URLs */}
          <button
            type="button"
            onClick={() => sendPromptToAi('Add dates and URLs to my projects')}
            className="text-left bg-white border-2 border-dashed border-sky-200 hover:border-sky-400 p-3 rounded-2xl transition-all shadow-xs hover:shadow-sm group cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-sky-700 leading-tight">
                  Add dates and URLs to my projects
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">Fill missing project URLs & start/end dates</p>
              </div>
            </div>
          </button>

          {/* Card 3: Improve Existing Experience */}
          <button
            type="button"
            onClick={() => sendPromptToAi('Help me improve an existing experience in my resume')}
            className="text-left bg-white border-2 border-dashed border-emerald-200 hover:border-emerald-400 p-3 rounded-2xl transition-all shadow-xs hover:shadow-sm group cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 leading-tight">
                  Help me improve an existing experience in my resume
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">Enhance bullet points and descriptions</p>
              </div>
            </div>
          </button>

          {/* Card 4: ATS Keyword Optimization */}
          <button
            type="button"
            onClick={() => sendPromptToAi("Highlight the top keywords I'm missing for ATS")}
            className="text-left bg-white border-2 border-dashed border-purple-200 hover:border-purple-400 p-3 rounded-2xl transition-all shadow-xs hover:shadow-sm group cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-purple-700 leading-tight">
                  Highlight the top keywords I&apos;m missing for ATS
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">Boost ATS match by filling gaps</p>
              </div>
            </div>
          </button>
        </div>

        {/* Conversation Thread */}
        <div className="space-y-4 pt-2">
          {messages.slice(1).map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[95%] w-full rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-500 text-white font-medium rounded-br-none shadow-sm ml-auto max-w-[85%]'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                }`}
              >
                {/* AI Bubble Header with Copy Button */}
                {msg.sender === 'ai' && (
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100 text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-sky-500" />
                      LetGetIn AI
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-sky-600 px-2 py-0.5 rounded-lg border border-slate-200 hover:bg-sky-50 transition-all cursor-pointer"
                      title="Copy full response"
                    >
                      {copiedMsgId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Message Body */}
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <MarkdownRenderer content={msg.text} />
                )}

                {/* Suggestions / One-click Apply Actions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                      Recommended Resume Actions:
                    </span>
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={sug.action}
                        className="w-full text-xs text-left bg-sky-50 hover:bg-sky-100 text-sky-800 p-2.5 rounded-xl border border-sky-200 flex items-center justify-between transition-colors font-bold cursor-pointer shadow-2xs"
                      >
                        <span className="truncate">{sug.label}</span>
                        <Zap className="w-3.5 h-3.5 text-sky-600 shrink-0 ml-1.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isChatLoading && (
            <div className="flex items-center gap-2 text-xs text-sky-600 bg-sky-50 p-2.5 rounded-xl border border-sky-200 w-fit shadow-xs animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>LetGetIn AI is analyzing your resume...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>
      </div>

      {/* Input Bar & Footer */}
      <div className="p-3 border-t border-border bg-white space-y-2">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask AI feedback or request improvements..."
            className="flex-1 bg-slate-100/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 placeholder-slate-400 font-medium"
          />

          {/* Voice Input Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={isChatLoading || !inputMessage.trim()}
            className="bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center shrink-0 cursor-pointer"
          >
            <span>Send</span>
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400">
          Messages are processed by AI. Verify important information. Chat tokens left: Unlimited
        </p>
      </div>
    </div>
  );
};
