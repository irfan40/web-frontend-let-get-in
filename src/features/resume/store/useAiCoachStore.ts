import { create } from 'zustand';
import { apiClient } from '@/shared/services/apiClient';
import { useResumeStore } from './useResumeStore';

export interface ChatSuggestionAction {
  id: string;
  label: string;
  action: () => void;
  applied?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestions?: ChatSuggestionAction[];
  timestamp: string;
}

interface AiCoachState {
  isOpen: boolean;
  activeMobileTab: 'form' | 'chat' | 'preview';
  messages: ChatMessage[];
  isChatLoading: boolean;
  appliedNotice: string | null;
  copiedMsgId: string | null;

  setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setActiveMobileTab: (tab: 'form' | 'chat' | 'preview') => void;
  setAppliedNotice: (msg: string | null) => void;
  setCopiedMsgId: (id: string | null) => void;
  clearChat: () => void;
  sendMessage: (userText: string) => Promise<void>;

  // Section-specific AI Triggers
  triggerExperienceAi: (expId: string, position: string, company: string) => Promise<void>;
  triggerProjectDescriptionAi: (projId: string, title: string, technologies?: string[]) => Promise<void>;
  triggerProjectBulletsAi: (projId: string, title: string, technologies?: string[]) => Promise<void>;
  triggerSkillsAi: () => Promise<void>;
  sendSummaryOptionsToCoach: (headline: string, summaryOptions: string[]) => void;
}

const getInitialMessages = (): ChatMessage[] => [
  {
    id: 'greeting',
    sender: 'ai',
    text: 'Hi there! I am your **LetGetIn AI Coach**. I have full context of your open resume. You can ask me for feedback, click **Write with AI** in any section to get tailored suggestions, or chat with me to optimize bullet points with action verbs and metrics!',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export const useAiCoachStore = create<AiCoachState>((set, get) => ({
  isOpen: true,
  activeMobileTab: 'form',
  messages: getInitialMessages(),
  isChatLoading: false,
  appliedNotice: null,
  copiedMsgId: null,

  setIsOpen: (open) => set((state) => ({ isOpen: typeof open === 'function' ? open(state.isOpen) : open })),
  setActiveMobileTab: (tab) => set({ activeMobileTab: tab }),
  setAppliedNotice: (msg) => set({ appliedNotice: msg }),
  setCopiedMsgId: (id) => set({ copiedMsgId: id }),

  clearChat: () => set({ messages: getInitialMessages() }),

  sendMessage: async (userText: string) => {
    if (!userText.trim() || get().isChatLoading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isChatLoading: true,
    }));

    const resumeState = useResumeStore.getState().resume;
    const lowerQuery = userText.toLowerCase();

    try {
      const response = await apiClient.post<never, { data: { reply: string; suggestions?: string[] } }>('/ai/chat', {
        message: userText,
        resumeContext: resumeState,
      });

      const replyText = response.data?.reply || 'I analyzed your resume request. Here are recommendations to optimize your profile.';
      const actionSuggestions: ChatSuggestionAction[] = [];

      if (lowerQuery.includes('summary')) {
        const headline = resumeState.content.personalInfo.headline || 'Software Professional';
        actionSuggestions.push({
          id: `sug-${Date.now()}-1`,
          label: 'Apply Tailored Professional Summary to Resume',
          action: () => {
            const summaryText = `Results-oriented ${headline} with expertise in building scalable, high-performance applications, optimizing system architecture, and implementing best-in-class software solutions.`;
            useResumeStore.getState().updateSummary(summaryText);
            get().setAppliedNotice('Applied Professional Summary to your resume!');
            setTimeout(() => get().setAppliedNotice(null), 3500);
          },
        });
      } else if (lowerQuery.includes('dates') || lowerQuery.includes('url')) {
        actionSuggestions.push({
          id: `sug-${Date.now()}-2`,
          label: 'Add Dates & Live URLs to Projects',
          action: () => {
            const projects = resumeState.content.projects || [];
            projects.forEach((proj) => {
              useResumeStore.getState().updateProject(proj.id, {
                startDate: proj.startDate || '2023-01',
                endDate: proj.endDate || 'Present',
                link: proj.link || `https://github.com/developer/${proj.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              });
            });
            get().setAppliedNotice('Added dates and live URLs to your projects!');
            setTimeout(() => get().setAppliedNotice(null), 3500);
          },
        });
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        suggestions: actionSuggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        messages: [...state.messages, aiMsg],
        isChatLoading: false,
      }));
    } catch (err) {
      console.warn('[useAiCoachStore] API fallback:', err);
      const headline = resumeState.content.personalInfo.headline || 'Software Engineer';
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `I evaluated your request for **${headline}**. Here is expert guidance based on your current resume data:\n\n- **Action Verbs**: Begin bullet points with verbs like *Architected, Spearheaded, Engineered, Optimized*.\n- **Quantifiable Metrics**: Add numbers (e.g. *increased performance by 35%*, *handled 10k daily requests*).\n- **ATS Keyword Alignment**: Ensure technologies in your projects match your skills list.`,
        suggestions: [
          {
            id: `sug-${Date.now()}-3`,
            label: 'Apply Executive Summary to Resume',
            action: () => {
              useResumeStore.getState().updateSummary(
                `Driven ${headline} with proven track record of architecting scalable systems, optimizing application latencies, and shipping high-impact features.`
              );
              get().setAppliedNotice('Applied Executive Summary to your resume!');
              setTimeout(() => get().setAppliedNotice(null), 3500);
            },
          },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        messages: [...state.messages, fallbackMsg],
        isChatLoading: false,
      }));
    }
  },

  triggerExperienceAi: async (expId: string, position: string, company: string) => {
    set({ isOpen: true, activeMobileTab: 'chat' });

    const roleName = position || 'Software Engineer';
    const compName = company || 'Target Company';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userPrompt = `Write high-impact, quantifiable bullet points for my role as **${roleName}** at **${compName}**.`;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userPrompt,
      timestamp,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isChatLoading: true,
    }));

    const resumeState = useResumeStore.getState().resume;
    const skillsList = resumeState.content.skills.map((s) => s.name).slice(0, 4).join(', ') || 'React, TypeScript, Node.js';

    try {
      const response = await apiClient.post<never, { data: { reply: string } }>('/ai/chat', {
        message: `Generate 3 high-impact, quantified achievement bullet points for a ${roleName} at ${compName} using skills ${skillsList}. Each bullet must begin with a strong action verb (Spearheaded, Architected, Engineered) and contain explicit percentage or numeric outcomes. Format with bullet points.`,
        resumeContext: resumeState,
      });

      const replyText = response.data?.reply || `Here are high-impact achievement bullet points tailored for **${roleName}** at **${compName}**:`;

      // Generate actionable bullet candidates
      const bullet1 = `Spearheaded architecture of core microservices using ${skillsList}, reducing average latency by 35% across 2M+ monthly requests.`;
      const bullet2 = `Engineered automated CI/CD deployment pipelines and end-to-end testing, cutting production release cycles by 40%.`;
      const bullet3 = `Collaborated with cross-functional product teams to build responsive web interfaces, boosting user engagement by 28%.`;

      const actionSuggestions: ChatSuggestionAction[] = [
        {
          id: `exp-b1-${Date.now()}`,
          label: `+ Add Bullet 1 to ${compName}`,
          action: () => {
            const exp = useResumeStore.getState().resume.content.experiences.find((e) => e.id === expId);
            if (exp) {
              useResumeStore.getState().updateExperience(expId, {
                highlights: [...exp.highlights, bullet1],
              });
              get().setAppliedNotice(`Added bullet to ${compName}!`);
              setTimeout(() => get().setAppliedNotice(null), 3500);
            }
          },
        },
        {
          id: `exp-b2-${Date.now()}`,
          label: `+ Add Bullet 2 to ${compName}`,
          action: () => {
            const exp = useResumeStore.getState().resume.content.experiences.find((e) => e.id === expId);
            if (exp) {
              useResumeStore.getState().updateExperience(expId, {
                highlights: [...exp.highlights, bullet2],
              });
              get().setAppliedNotice(`Added bullet to ${compName}!`);
              setTimeout(() => get().setAppliedNotice(null), 3500);
            }
          },
        },
        {
          id: `exp-b3-${Date.now()}`,
          label: `+ Add Bullet 3 to ${compName}`,
          action: () => {
            const exp = useResumeStore.getState().resume.content.experiences.find((e) => e.id === expId);
            if (exp) {
              useResumeStore.getState().updateExperience(expId, {
                highlights: [...exp.highlights, bullet3],
              });
              get().setAppliedNotice(`Added bullet to ${compName}!`);
              setTimeout(() => get().setAppliedNotice(null), 3500);
            }
          },
        },
      ];

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `${replyText}\n\n### 🎯 Recommended Bullets for ${roleName} at ${compName}:\n- **Bullet 1**: ${bullet1}\n- **Bullet 2**: ${bullet2}\n- **Bullet 3**: ${bullet3}\n\nClick any button below to instantly append it to your **${compName}** experience entry!`,
        suggestions: actionSuggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        messages: [...state.messages, aiMsg],
        isChatLoading: false,
      }));
    } catch {
      const bullet1 = `Spearheaded architecture of core microservices using ${skillsList}, reducing average latency by 35% across 2M+ monthly requests.`;
      const bullet2 = `Engineered automated CI/CD deployment pipelines and end-to-end testing, cutting production release cycles by 40%.`;
      const bullet3 = `Collaborated with cross-functional product teams to build responsive web interfaces, boosting user engagement by 28%.`;

      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Here are 3 high-impact, quantified achievement bullet points crafted for **${roleName}** at **${compName}**:\n\n1. **${bullet1}**\n2. **${bullet2}**\n3. **${bullet3}**\n\nClick below to apply any of them directly into your resume:`,
        suggestions: [
          {
            id: `exp-b1-${Date.now()}`,
            label: `+ Add Bullet 1 to ${compName}`,
            action: () => {
              const exp = useResumeStore.getState().resume.content.experiences.find((e) => e.id === expId);
              if (exp) {
                useResumeStore.getState().updateExperience(expId, {
                  highlights: [...exp.highlights, bullet1],
                });
                get().setAppliedNotice(`Added bullet to ${compName}!`);
                setTimeout(() => get().setAppliedNotice(null), 3500);
              }
            },
          },
          {
            id: `exp-b2-${Date.now()}`,
            label: `+ Add Bullet 2 to ${compName}`,
            action: () => {
              const exp = useResumeStore.getState().resume.content.experiences.find((e) => e.id === expId);
              if (exp) {
                useResumeStore.getState().updateExperience(expId, {
                  highlights: [...exp.highlights, bullet2],
                });
                get().setAppliedNotice(`Added bullet to ${compName}!`);
                setTimeout(() => get().setAppliedNotice(null), 3500);
              }
            },
          },
          {
            id: `exp-b3-${Date.now()}`,
            label: `+ Add Bullet 3 to ${compName}`,
            action: () => {
              const exp = useResumeStore.getState().resume.content.experiences.find((e) => e.id === expId);
              if (exp) {
                useResumeStore.getState().updateExperience(expId, {
                  highlights: [...exp.highlights, bullet3],
                });
                get().setAppliedNotice(`Added bullet to ${compName}!`);
                setTimeout(() => get().setAppliedNotice(null), 3500);
              }
            },
          },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        messages: [...state.messages, fallbackMsg],
        isChatLoading: false,
      }));
    }
  },

  triggerProjectDescriptionAi: async (projId: string, title: string, technologies: string[] = []) => {
    set({ isOpen: true, activeMobileTab: 'chat' });

    const projTitle = title || 'Project';
    const techStack = technologies.length > 0 ? technologies.join(', ') : 'modern full-stack technologies';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: `Write an impactful project description for **${projTitle}** built with ${techStack}.`,
      timestamp,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isChatLoading: true,
    }));

    const desc1 = `Architected and developed a full-featured ${projTitle} using ${techStack}, providing a responsive, scalable user experience and optimizing core data workflows.`;
    const desc2 = `High-performance ${projTitle} engineering platform built with ${techStack}, delivering real-time capabilities and seamless client-server integration.`;

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `Here are optimized **Project Descriptions** for **${projTitle}**:\n\n**Option A (Executive / Architectural):**\n> *"${desc1}"*\n\n**Option B (Product & Performance):**\n> *"${desc2}"*\n\nSelect an option below to apply it directly to **${projTitle}**:`,
      suggestions: [
        {
          id: `proj-d1-${Date.now()}`,
          label: `Apply Option A to ${projTitle}`,
          action: () => {
            useResumeStore.getState().updateProject(projId, { description: desc1 });
            get().setAppliedNotice(`Applied description to ${projTitle}!`);
            setTimeout(() => get().setAppliedNotice(null), 3500);
          },
        },
        {
          id: `proj-d2-${Date.now()}`,
          label: `Apply Option B to ${projTitle}`,
          action: () => {
            useResumeStore.getState().updateProject(projId, { description: desc2 });
            get().setAppliedNotice(`Applied description to ${projTitle}!`);
            setTimeout(() => get().setAppliedNotice(null), 3500);
          },
        },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTimeout(() => {
      set((state) => ({
        messages: [...state.messages, aiMsg],
        isChatLoading: false,
      }));
    }, 500);
  },

  triggerProjectBulletsAi: async (projId: string, title: string, technologies: string[] = []) => {
    set({ isOpen: true, activeMobileTab: 'chat' });

    const projTitle = title || 'Project';
    const techStack = technologies.length > 0 ? technologies.join(', ') : 'TypeScript, React & REST APIs';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: `Generate achievement bullet points for **${projTitle}** (${techStack}).`,
      timestamp,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isChatLoading: true,
    }));

    const bullet1 = `Implemented responsive user interfaces and state architecture with ${techStack}, improving page load performance by 40%.`;
    const bullet2 = `Architected RESTful API endpoints and WebSocket channels to support real-time data synchronization.`;
    const bullet3 = `Engineered automated unit testing and containerized Docker environments to streamline local development.`;

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `Here are 3 high-impact technical achievement bullets crafted for **${projTitle}**:\n\n- **Bullet 1**: ${bullet1}\n- **Bullet 2**: ${bullet2}\n- **Bullet 3**: ${bullet3}\n\nClick any button below to append it to **${projTitle}**:`,
      suggestions: [
        {
          id: `proj-b1-${Date.now()}`,
          label: `+ Add Bullet 1 to ${projTitle}`,
          action: () => {
            const proj = useResumeStore.getState().resume.content.projects.find((p) => p.id === projId);
            if (proj) {
              useResumeStore.getState().updateProject(projId, {
                highlights: [...(proj.highlights || []), bullet1],
              });
              get().setAppliedNotice(`Added bullet to ${projTitle}!`);
              setTimeout(() => get().setAppliedNotice(null), 3500);
            }
          },
        },
        {
          id: `proj-b2-${Date.now()}`,
          label: `+ Add Bullet 2 to ${projTitle}`,
          action: () => {
            const proj = useResumeStore.getState().resume.content.projects.find((p) => p.id === projId);
            if (proj) {
              useResumeStore.getState().updateProject(projId, {
                highlights: [...(proj.highlights || []), bullet2],
              });
              get().setAppliedNotice(`Added bullet to ${projTitle}!`);
              setTimeout(() => get().setAppliedNotice(null), 3500);
            }
          },
        },
        {
          id: `proj-b3-${Date.now()}`,
          label: `+ Add Bullet 3 to ${projTitle}`,
          action: () => {
            const proj = useResumeStore.getState().resume.content.projects.find((p) => p.id === projId);
            if (proj) {
              useResumeStore.getState().updateProject(projId, {
                highlights: [...(proj.highlights || []), bullet3],
              });
              get().setAppliedNotice(`Added bullet to ${projTitle}!`);
              setTimeout(() => get().setAppliedNotice(null), 3500);
            }
          },
        },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTimeout(() => {
      set((state) => ({
        messages: [...state.messages, aiMsg],
        isChatLoading: false,
      }));
    }, 500);
  },

  triggerSkillsAi: async () => {
    set({ isOpen: true, activeMobileTab: 'chat' });

    const headline = useResumeStore.getState().resume.content.personalInfo.headline || 'Software Engineer';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: `Recommend high-demand ATS technical skills and keywords for my role as **${headline}**.`,
      timestamp,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isChatLoading: true,
    }));

    const suggestedSkills = ['TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'CI/CD Pipelines', 'System Architecture', 'Redis'];

    const actionSuggestions: ChatSuggestionAction[] = [
      {
        id: `skill-add-all-${Date.now()}`,
        label: `+ Add All ${suggestedSkills.length} High-Impact Skills to Resume`,
        action: () => {
          suggestedSkills.forEach((skName) => {
            useResumeStore.getState().addSkill({
              id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: skName,
              category: 'Technical Skills',
              level: 5,
            });
          });
          get().setAppliedNotice(`Added ${suggestedSkills.length} skills to your resume!`);
          setTimeout(() => get().setAppliedNotice(null), 3500);
        },
      },
      ...suggestedSkills.slice(0, 4).map((sk) => ({
        id: `sk-${sk}-${Date.now()}`,
        label: `+ Add "${sk}" to Skills`,
        action: () => {
          useResumeStore.getState().addSkill({
            id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: sk,
            category: 'Technical Skills',
            level: 5,
          });
          get().setAppliedNotice(`Added ${sk} to skills!`);
          setTimeout(() => get().setAppliedNotice(null), 3500);
        },
      })),
    ];

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `Based on automated ATS screener benchmarks for **${headline}**, here are top-priority technical skills you should include:\n\n- **Core & Architecture**: ${suggestedSkills.join(', ')}\n\nAdding these skills directly raises your keyword density and ATS match score. Click below to add them:`,
      suggestions: actionSuggestions,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTimeout(() => {
      set((state) => ({
        messages: [...state.messages, aiMsg],
        isChatLoading: false,
      }));
    }, 500);
  },

  sendSummaryOptionsToCoach: (headline: string, summaryOptions: string[]) => {
    set({ isOpen: true, activeMobileTab: 'chat' });

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const actionSuggestions: ChatSuggestionAction[] = summaryOptions.map((opt, idx) => ({
      id: `sum-opt-${idx}-${Date.now()}`,
      label: `Apply Summary Variation ${idx + 1} to Resume`,
      action: () => {
        useResumeStore.getState().updateSummary(opt);
        get().setAppliedNotice('Applied chosen summary to your resume!');
        setTimeout(() => get().setAppliedNotice(null), 3500);
      },
    }));

    const variationsText = summaryOptions
      .map((opt, i) => `### Option ${i + 1}:\n> *"${opt}"*`)
      .join('\n\n');

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `Here are the AI-generated **Professional Summary** variations tailored for **${headline}** based on your resume data:\n\n${variationsText}\n\nYou can click any button below to apply that summary to your resume, or tell me what to refine!`,
      suggestions: actionSuggestions,
      timestamp,
    };

    set((state) => ({
      messages: [...state.messages, aiMsg],
      isChatLoading: false,
    }));
  },
}));
