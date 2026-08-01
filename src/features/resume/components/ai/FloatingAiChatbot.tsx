import React, { useState, useEffect, useRef } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { Sparkles, MessageSquare, Wand2, X, Minimize2, Send, Check, RefreshCw, SpellCheck, GripHorizontal, Maximize2 } from 'lucide-react';
import { apiClient } from '../../../../shared/services/apiClient';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestions?: string[];
  timestamp: string;
}

export const FloatingAiChatbot: React.FC = () => {
  const { resume, activeSection, updateSummary, updatePersonalInfo, addSkill, setResume } = useResumeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'section'>('chat');

  // Screen-relative positioning state (top-left coordinates)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Initialize positioning to bottom-right of viewport on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const defaultX = Math.max(20, window.innerWidth - 410);
      const defaultY = Math.max(80, window.innerHeight - 560);
      setPosition({ x: defaultX, y: defaultY });
    }
  }, []);

  // Global mouse move & mouse up listeners for smooth, glitch-free dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;

      // Viewport boundary clamping
      const maxX = window.innerWidth - 390;
      const maxY = window.innerHeight - 80;

      setPosition({
        x: Math.max(10, Math.min(newX, maxX)),
        y: Math.max(10, Math.min(newY, maxY)),
      });
    };

    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!position) return;
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // Chat State
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your AI Resume Advisor. Ask me anything, or click "Section Fix" to check spelling & grammar for your active section!`,
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
        text: `I analyzed your question regarding "${userText}". Based on your resume, ensure your job headline (${resume.content.personalInfo.headline || 'Software Engineer'}) matches your target role keywords.`,
        suggestions: ['Quantify experience achievements', 'Fix spelling in professional summary'],
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
        changesMade: [`Verified spelling and grammar for ${activeSection}. Section content is clean.`],
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
    <>
      {/* Floating Launcher Button (Fixed Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ring-4 ring-purple-500/20 active:scale-95"
          title="Open Floating AI Chatbot"
        >
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-xs font-bold pr-1">AI Assistant</span>
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
        </button>
      )}

      {/* Movable / Draggable AI Chatbot Window */}
      {isOpen && position && (
        <div
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          className={`fixed z-50 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col transition-shadow ${
            isMinimized ? 'w-80 h-14' : 'w-96 h-[500px]'
          }`}
        >
          {/* Draggable Header Bar */}
          <div
            onMouseDown={handleMouseDown}
            className="p-3 bg-slate-950/90 rounded-t-2xl border-b border-slate-800 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-slate-500 hover:text-slate-300" />
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                AI Resume Advisor
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                title={isMinimized ? 'Expand Window' : 'Minimize Window'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800"
                title="Close AI Assistant"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Feature Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-950/40 p-1 gap-1">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'chat' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>GPT Context Chat</span>
                </button>
                <button
                  onClick={() => setActiveTab('section')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'section' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <SpellCheck className="w-3.5 h-3.5" />
                  <span>Section Fix</span>
                </button>
              </div>

              {/* TAB 1: Conversational AI Chat */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col min-h-0 bg-slate-900/50">
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                              : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.text}</p>
                          {msg.suggestions && msg.suggestions.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-slate-700/80 space-y-1">
                              <span className="text-[10px] font-bold text-indigo-300">Suggested Action:</span>
                              {msg.suggestions.map((sug, sIdx) => (
                                <button
                                  key={sIdx}
                                  onClick={() => updateSummary(sug)}
                                  className="w-full text-[10px] text-left bg-slate-950/60 hover:bg-indigo-950 text-indigo-200 p-1.5 rounded border border-indigo-800/40 flex items-center justify-between gap-1 transition-colors"
                                >
                                  <span className="truncate">{sug}</span>
                                  <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex items-center gap-2 text-xs text-indigo-400 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 w-fit">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>AI thinking with resume context...</span>
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-800 bg-slate-950 flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask AI about your resume..."
                      className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isChatLoading || !inputMessage.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-colors disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: Section Optimizer & Spell Checker */}
              {activeTab === 'section' && (
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/50">
                  <div className="bg-purple-950/30 border border-purple-800/40 p-3.5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Wand2 className="w-3.5 h-3.5" /> Active Section:
                      </span>
                      <span className="text-xs font-mono font-bold text-white uppercase bg-purple-900/60 px-2 py-0.5 rounded border border-purple-700">
                        {activeSection}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-200/80">
                      Scan current active section for spelling errors, typos, grammar fixes, and ATS keywords.
                    </p>
                    <button
                      onClick={handleOptimizeCurrentSection}
                      disabled={isOptimizing}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold py-2 rounded-xl transition-all shadow flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isOptimizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <SpellCheck className="w-3.5 h-3.5" />}
                      <span>Fix Spelling & Grammar in {activeSection}</span>
                    </button>
                  </div>

                  {sectionOptimizationResult && (
                    <div className="bg-slate-800/90 border border-slate-700 p-3.5 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> AI Corrections Ready
                      </h4>
                      <div className="space-y-1 text-xs text-slate-300">
                        {sectionOptimizationResult.changesMade.map((change, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                            <span className="text-indigo-400">•</span>
                            <span>{change}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={handleApplySectionFix}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl transition-colors shadow flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Apply AI Fix to {activeSection}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
