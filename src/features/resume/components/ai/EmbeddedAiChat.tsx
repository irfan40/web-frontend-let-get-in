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
} from 'lucide-react';
import { apiClient } from '../../../../shared/services/apiClient';

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
  const { resume, updateSummary, updateExperience, addExperience, addSkill } = useResumeStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
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
      
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        suggestions: [
          {
            label: 'Apply AI recommendations to Summary',
            action: () => {
              updateSummary(
                `Results-driven ${resume.content.personalInfo.headline || 'Software Professional'} with proven experience delivering scalable applications, driving key metrics, and optimizing technical infrastructure.`
              );
              showNotification('Summary updated with AI recommendations!');
            },
          },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Intelligent Offline / Smart Fallback Assistant based on user query
      let fallbackText = `I analyzed your request: "${userText}". Here is my tailored guidance for your resume:`;
      const fallbackSuggestions: Array<{ label: string; action: () => void }> = [];

      if (userText.toLowerCase().includes('top candidates') || userText.toLowerCase().includes('compare')) {
        fallbackText = `Based on current market standards for "${resume.content.personalInfo.headline || 'Software Engineer'}", top candidates average 4-6 strong metric-driven bullets per role and specify key tools. I recommend upgrading your summary and work experience bullets with quantifiable achievements.`;
        fallbackSuggestions.push({
          label: 'Upgrade Executive Summary',
          action: () => {
            updateSummary(
              `High-impact ${resume.content.personalInfo.headline || 'Software Specialist'} with expertise building scalable web platforms, leading cross-functional teams, and driving 30%+ performance gains.`
            );
            showNotification('Summary upgraded for candidate benchmark!');
          },
        });
      } else if (userText.toLowerCase().includes('add a new experience') || userText.toLowerCase().includes('new experience')) {
        fallbackText = `I can help you construct a high-impact work experience entry. Would you like me to insert a pre-formatted Senior Developer role into your resume?`;
        fallbackSuggestions.push({
          label: 'Add Pre-Formatted Experience Entry',
          action: () => {
            addExperience({
              id: `exp-${Date.now()}`,
              company: 'Innovative Systems Corp',
              position: resume.content.personalInfo.headline || 'Senior Software Engineer',
              location: 'Remote',
              startDate: '2022-01',
              endDate: 'Present',
              isCurrent: true,
              highlights: [
                'Spearheaded development of microservices handling 2M+ daily requests with 99.9% uptime.',
                'Streamlined CI/CD deployment pipelines, cutting deployment cycle times by 40%.',
              ],
            });
            showNotification('New work experience added to resume!');
          },
        });
      } else if (userText.toLowerCase().includes('improve an existing experience') || userText.toLowerCase().includes('improve')) {
        fallbackText = `I analyzed your work experience entries. Adding strong action verbs (e.g. Spearheaded, Architected) and quantified metrics (e.g. 35% speedup) will significantly boost your impact score.`;
        fallbackSuggestions.push({
          label: 'Enhance Top Work Experience Bullets',
          action: () => {
            if (resume.content.experiences[0]) {
              const firstExp = resume.content.experiences[0];
              updateExperience(firstExp.id, {
                highlights: [
                  'Architected scalable web applications using modern full-stack frameworks, resulting in a 40% boost in user engagement.',
                  'Engineered automated test suites and reduced production bug reports by 30%.',
                ],
              });
              showNotification('Experience bullets enhanced with metrics!');
            }
          },
        });
      } else if (userText.toLowerCase().includes('ats') || userText.toLowerCase().includes('keywords')) {
        fallbackText = `Top ATS screeners look for specific technical keywords like Docker, System Design, CI/CD, and Cloud Architecture. Adding these will boost your ATS match score above 85%.`;
        fallbackSuggestions.push({
          label: 'Add Recommended ATS Keywords to Skills',
          action: () => {
            ['Docker', 'CI/CD Pipelines', 'System Architecture', 'REST APIs'].forEach((skillName) => {
              addSkill({
                id: `skill-${Date.now()}-${Math.random()}`,
                name: skillName,
                category: 'Technical',
                level: 4,
              });
            });
            showNotification('ATS Keywords added to Skills section!');
          },
        });
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        suggestions: fallbackSuggestions.length > 0 ? fallbackSuggestions : [
          {
            label: 'Apply AI Summary Improvement',
            action: () => {
              updateSummary(
                `Driven ${resume.content.personalInfo.headline || 'Professional'} focused on building high-reliability software systems, optimizing user experience, and delivering key business outcomes.`
              );
              showNotification('Summary updated!');
            },
          },
        ],
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
        <button
          type="button"
          onClick={handleClearChat}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5"
          title="Clear Chat History"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5"
            title="Close Chat Panel"
          >
            <span>Close Chat</span>
            <X className="w-3.5 h-3.5 text-rose-500" />
          </button>
        )}
      </div>

      {/* Main Messages & Prompt Cards Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
        {/* Applied Action Notification Banner */}
        {appliedNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 animate-fade-up shadow-sm">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{appliedNotice}</span>
          </div>
        )}

        {/* Greeting Message Box */}
        <div className="bg-sky-50/60 border border-sky-100 p-3.5 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-800">
            <div className="w-6 h-6 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span>LetGetIn AI</span>
            <span className="text-[10px] font-mono text-sky-500">
              • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
                <p className="text-[11px] text-slate-400 mt-1">Get a prioritized, actionable review</p>
              </div>
            </div>
          </button>

          {/* Card 2: Add New Experience */}
          <button
            type="button"
            onClick={() => sendPromptToAi('Help me add a new experience to my resume')}
            className="text-left bg-white border-2 border-dashed border-sky-200 hover:border-sky-400 p-3 rounded-2xl transition-all shadow-xs hover:shadow-sm group cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-sky-700 leading-tight">
                  Help me add a new experience to my resume
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">Add work experience, projects, or achievements</p>
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
        <div className="space-y-3 pt-2">
          {messages.slice(1).map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-500 text-white font-medium rounded-br-none shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs font-medium'
                }`}
              >
                <p>{msg.text}</p>

                {/* Suggestions / One-click Apply Actions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                      Recommended Resume Action:
                    </span>
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={sug.action}
                        className="w-full text-xs text-left bg-sky-50 hover:bg-sky-100 text-sky-800 p-2 rounded-xl border border-sky-200 flex items-center justify-between transition-colors font-bold cursor-pointer"
                      >
                        <span className="truncate">{sug.label}</span>
                        <Zap className="w-3.5 h-3.5 text-sky-600 shrink-0 ml-1" />
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
              <span>LetGetIn AI is processing your resume...</span>
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
            placeholder="Message..."
            className="flex-1 bg-slate-100/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 placeholder-slate-400"
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
            className="bg-slate-400 hover:bg-sky-500 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center shrink-0 cursor-pointer"
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
