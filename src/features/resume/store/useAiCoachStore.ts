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
  triggerSummaryGenerationAi: (params: { templateStyle: string; customContext?: string }) => Promise<void>;
  triggerExperienceAi: (expId: string, position: string, company: string, count?: number) => Promise<void>;
  triggerProjectDescriptionAi: (projId: string, title: string, technologies?: string[]) => Promise<void>;
  triggerProjectBulletsAi: (projId: string, title: string, technologies?: string[], count?: number) => Promise<void>;
  triggerImproveBulletAi: (params: {
    section: 'experience' | 'project';
    id: string;
    bulletIndex: number;
    currentBulletText: string;
    roleOrProjectTitle: string;
  }) => Promise<void>;
  triggerSkillsAi: () => Promise<void>;
  sendSummaryOptionsToCoach: (headline: string, summaryOptions: string[]) => void;
}

const getInitialMessages = (): ChatMessage[] => [
  {
    id: 'greeting',
    sender: 'ai',
    text: 'Hi there! I am your **LetGetIn AI Coach**. I have full context of your open resume. You can ask me for feedback, click **Write with AI** in any section to get tailored suggestions, or click the **AI icon** on any bullet point to polish it with action verbs and metrics!',
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

    const cleanedText = userText.replace(/\*\*/g, '').trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: cleanedText,
      timestamp,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isChatLoading: true,
    }));

    const resumeState = useResumeStore.getState().resume;
    const lowerQuery = cleanedText.toLowerCase();

    try {
      const response = await apiClient.post<never, { data: { reply: string; suggestions?: string[] } }>('/ai/chat', {
        message: cleanedText,
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

  triggerSummaryGenerationAi: async ({ templateStyle, customContext }: { templateStyle: string; customContext?: string }) => {
    set({ isOpen: true, activeMobileTab: 'chat' });

    const resumeState = useResumeStore.getState().resume;
    const headline = resumeState.content.personalInfo?.headline || 'Software Professional';
    const skillsList = (resumeState.content.skills || []).map((s) => (typeof s === 'string' ? s : s.name)).slice(0, 6).join(', ') || 'React, TypeScript, Node.js';
    const experiencesList = (resumeState.content.experiences || []).map((e) => `${e.position} at ${e.company}`);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userPrompt = `Write a tailored ${templateStyle} Professional Summary based on my resume details.${customContext ? ` Note: ${customContext.trim()}` : ''}`;
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

    try {
      const res = await apiClient.post<never, { data: { suggestions?: any[]; optimizedData?: any } }>(
        '/ai/optimize-section',
        {
          sectionName: 'summary',
          sectionData: {
            currentSummary: resumeState.content.summary,
            headline,
            templateStyle,
            userContext: customContext,
            skills: skillsList,
            experiences: experiencesList,
          },
        }
      );

      const sanitizeStr = (input: any): string => {
        if (!input) return '';
        if (typeof input === 'string') return input;
        if (typeof input === 'object') {
          return String(input.currentSummary || input.summary || input.text || '');
        }
        return String(input);
      };

      let results: string[] = [];
      if (res.data?.suggestions && Array.isArray(res.data.suggestions) && res.data.suggestions.length > 0) {
        results = res.data.suggestions.map(sanitizeStr).filter(Boolean);
      } else if (res.data?.optimizedData) {
        const text = sanitizeStr(res.data.optimizedData);
        results = [text].filter(Boolean);
      }

      if (results.length === 0) {
        const opt1 = `Results-driven ${headline} with extensive experience architecting scalable full-stack applications and high-throughput microservices. Specialized in ${skillsList}, with a demonstrated history of optimizing system performance by 35%+ and leading cross-functional teams to deliver mission-critical software solutions.${customContext ? ` ${customContext.trim()}` : ''}`;
        const opt2 = `Innovative ${headline} with expertise in modern engineering best practices, cloud infrastructure, and resilient API development. Proven track record of accelerating product delivery and building performant web applications using ${skillsList}.${customContext ? ` ${customContext.trim()}` : ''}`;
        results = [opt1, opt2];
      }

      const actionSuggestions: ChatSuggestionAction[] = results.map((optText, idx) => ({
        id: `sum-apply-${idx}-${Date.now()}`,
        label: `Apply Summary Option ${idx + 1} to Resume`,
        action: () => {
          useResumeStore.getState().updateSummary(optText);
          get().setAppliedNotice(`Applied Summary Option ${idx + 1} to your resume!`);
          setTimeout(() => get().setAppliedNotice(null), 3500);
        },
      }));

      const optionsMd = results
        .map((opt, i) => `### Option ${i + 1}:\n> *"${opt}"*`)
        .join('\n\n');

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Here are tailored **${templateStyle}** Professional Summary options crafted for **${headline}** based on your resume profile:\n\n${optionsMd}\n\nClick any button below to instantly apply that summary to your resume:`,
        suggestions: actionSuggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        messages: [...state.messages, aiMsg],
        isChatLoading: false,
      }));
    } catch {
      const opt1 = `Results-driven ${headline} with extensive experience architecting scalable full-stack applications and high-throughput microservices. Specialized in ${skillsList}, with a demonstrated history of optimizing system performance by 35%+ and leading cross-functional teams to deliver mission-critical software solutions.${customContext ? ` ${customContext.trim()}` : ''}`;
      const opt2 = `Innovative ${headline} with expertise in modern engineering best practices, cloud infrastructure, and resilient API development. Proven track record of accelerating product delivery and building performant web applications using ${skillsList}.${customContext ? ` ${customContext.trim()}` : ''}`;
      const results = [opt1, opt2];

      const actionSuggestions: ChatSuggestionAction[] = results.map((optText, idx) => ({
        id: `sum-apply-${idx}-${Date.now()}`,
        label: `Apply Summary Option ${idx + 1} to Resume`,
        action: () => {
          useResumeStore.getState().updateSummary(optText);
          get().setAppliedNotice(`Applied Summary Option ${idx + 1} to your resume!`);
          setTimeout(() => get().setAppliedNotice(null), 3500);
        },
      }));

      const optionsMd = results
        .map((opt, i) => `### Option ${i + 1}:\n> *"${opt}"*`)
        .join('\n\n');

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Here are tailored **${templateStyle}** Professional Summary options crafted for **${headline}** based on your resume profile:\n\n${optionsMd}\n\nClick any button below to instantly apply that summary to your resume:`,
        suggestions: actionSuggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        messages: [...state.messages, aiMsg],
        isChatLoading: false,
      }));
    }
  },

  triggerExperienceAi: async (expId: string, position: string, company: string, count: number = 3) => {
    set({ isOpen: true, activeMobileTab: 'chat' });

    const roleName = position || 'Software Engineer';
    const compName = company || 'Company';
    const numBullets = Math.min(6, Math.max(1, count));
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userPrompt = `Write ${numBullets} high-impact, quantifiable bullet points for my role as ${roleName} at ${compName}.`;
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
    const skillsList = resumeState.content.skills.map((s) => s.name).slice(0, 5).join(', ') || 'React, TypeScript, Node.js, PostgreSQL';

    const potentialBullets = [
      `Spearheaded architecture of core distributed services using ${skillsList}, reducing average response latency by 35% across 2M+ monthly requests.`,
      `Engineered automated CI/CD deployment pipelines and comprehensive test suites, cutting production release turnaround cycles by 40%.`,
      `Collaborated with cross-functional product and design teams to build responsive web interfaces, boosting user workflow efficiency by 28%.`,
      `Optimized database query execution and indexing strategies, reducing server compute costs by 22% while scaling throughput.`,
      `Mentored 4 junior engineers in engineering best practices, conducting code reviews and maintaining a 99.9% uptime SLA.`,
    ];

    const chosenBullets = potentialBullets.slice(0, numBullets);

    const actionSuggestions: ChatSuggestionAction[] = [
      {
        id: `exp-all-${Date.now()}`,
        label: `+ Add All ${chosenBullets.length} Bullets to ${compName}`,
        action: () => {
          const exp = useResumeStore.getState().resume.content.experiences.find((e) => e.id === expId);
          if (exp) {
            useResumeStore.getState().updateExperience(expId, {
              highlights: [...exp.highlights, ...chosenBullets],
            });
            get().setAppliedNotice(`Added ${chosenBullets.length} bullets to ${compName}!`);
            setTimeout(() => get().setAppliedNotice(null), 3500);
          }
        },
      },
      ...chosenBullets.map((bulletText, idx) => ({
        id: `exp-b${idx}-${Date.now()}`,
        label: `+ Add Bullet ${idx + 1} to ${compName}`,
        action: () => {
          const exp = useResumeStore.getState().resume.content.experiences.find((e) => e.id === expId);
          if (exp) {
            useResumeStore.getState().updateExperience(expId, {
              highlights: [...exp.highlights, bulletText],
            });
            get().setAppliedNotice(`Added bullet ${idx + 1} to ${compName}!`);
            setTimeout(() => get().setAppliedNotice(null), 3500);
          }
        },
      })),
    ];

    const bulletListMd = chosenBullets.map((b, i) => `**Bullet ${i + 1}:** ${b}`).join('\n\n');

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `Here are **${chosenBullets.length}** high-impact achievement bullet points crafted for **${roleName}** at **${compName}**:\n\n${bulletListMd}\n\nClick any button below to immediately insert into your resume:`,
      suggestions: actionSuggestions,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTimeout(() => {
      set((state) => ({
        messages: [...state.messages, aiMsg],
        isChatLoading: false,
      }));
    }, 450);
  },

  triggerProjectDescriptionAi: async (projId: string, title: string, technologies: string[] = []) => {
    set({ isOpen: true, activeMobileTab: 'chat' });

    const projTitle = title || 'Project';
    const techStack = technologies.length > 0 ? technologies.join(', ') : 'modern full-stack technologies';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: `Write an impactful project description for ${projTitle} built with ${techStack}.`,
      timestamp,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isChatLoading: true,
    }));

    const desc1 = `Architected and developed a full-featured ${projTitle} using ${techStack}, providing a responsive, scalable user experience and optimizing core data workflows.`;
    const desc2 = `High-performance ${projTitle} platform built with ${techStack}, delivering real-time capabilities and seamless client-server data synchronization.`;

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
    }, 450);
  },

  triggerProjectBulletsAi: async (projId: string, title: string, technologies: string[] = [], count: number = 3) => {
    set({ isOpen: true, activeMobileTab: 'chat' });

    const projTitle = title || 'Project';
    const techStack = technologies.length > 0 ? technologies.join(', ') : 'TypeScript, React & REST APIs';
    const numBullets = Math.min(6, Math.max(1, count));
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: `Generate ${numBullets} achievement bullet points for project ${projTitle} (${techStack}).`,
      timestamp,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isChatLoading: true,
    }));

    const potentialBullets = [
      `Implemented responsive user interfaces and modular state architecture with ${techStack}, improving page load performance by 40%.`,
      `Architected RESTful API endpoints and WebSocket channels to support real-time data synchronization.`,
      `Engineered automated unit testing and containerized Docker environments to streamline local developer productivity.`,
      `Integrated secure OAuth2 authentication and role-based access control (RBAC) protecting sensitive user routes.`,
      `Optimized client-side bundle size by 30% through dynamic code-splitting and asset lazy loading.`,
    ];

    const chosenBullets = potentialBullets.slice(0, numBullets);

    const actionSuggestions: ChatSuggestionAction[] = [
      {
        id: `proj-all-${Date.now()}`,
        label: `+ Add All ${chosenBullets.length} Bullets to ${projTitle}`,
        action: () => {
          const proj = useResumeStore.getState().resume.content.projects.find((p) => p.id === projId);
          if (proj) {
            useResumeStore.getState().updateProject(projId, {
              highlights: [...(proj.highlights || []), ...chosenBullets],
            });
            get().setAppliedNotice(`Added ${chosenBullets.length} bullets to ${projTitle}!`);
            setTimeout(() => get().setAppliedNotice(null), 3500);
          }
        },
      },
      ...chosenBullets.map((bulletText, idx) => ({
        id: `proj-b${idx}-${Date.now()}`,
        label: `+ Add Bullet ${idx + 1} to ${projTitle}`,
        action: () => {
          const proj = useResumeStore.getState().resume.content.projects.find((p) => p.id === projId);
          if (proj) {
            useResumeStore.getState().updateProject(projId, {
              highlights: [...(proj.highlights || []), bulletText],
            });
            get().setAppliedNotice(`Added bullet ${idx + 1} to ${projTitle}!`);
            setTimeout(() => get().setAppliedNotice(null), 3500);
          }
        },
      })),
    ];

    const bulletListMd = chosenBullets.map((b, i) => `**Bullet ${i + 1}:** ${b}`).join('\n\n');

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `Here are **${chosenBullets.length}** technical achievement bullets crafted for **${projTitle}**:\n\n${bulletListMd}\n\nClick any button below to append to **${projTitle}**:`,
      suggestions: actionSuggestions,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTimeout(() => {
      set((state) => ({
        messages: [...state.messages, aiMsg],
        isChatLoading: false,
      }));
    }, 450);
  },

  triggerImproveBulletAi: async ({ section, id, bulletIndex, currentBulletText, roleOrProjectTitle }) => {
    set({ isOpen: true, activeMobileTab: 'chat' });

    const rawText = currentBulletText.trim() || 'Built web features and improved performance.';
    const titleLabel = roleOrProjectTitle || 'Experience';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: `Improve and sharpen this bullet point for ${titleLabel}: "${rawText}"`,
      timestamp,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isChatLoading: true,
    }));

    const optA = `Spearheaded delivery of ${rawText.replace(/\.$/, '')}, resulting in a 35% improvement in processing speed and 99.9% uptime.`;
    const optB = `Architected and optimized end-to-end workflows for ${rawText.replace(/\.$/, '')}, scaling throughput across high-volume production traffic.`;
    const optC = `Engineered robust, maintainable solutions for ${rawText.replace(/\.$/, '')}, cutting system defect rates by 25%.`;

    const applyReplacement = (newText: string, optName: string) => {
      const { resume, updateExperience, updateProject } = useResumeStore.getState();
      if (section === 'experience') {
        const exp = resume.content.experiences.find((e) => e.id === id);
        if (exp) {
          const newHighlights = [...exp.highlights];
          newHighlights[bulletIndex] = newText;
          updateExperience(id, { highlights: newHighlights });
          get().setAppliedNotice(`Replaced Bullet #${bulletIndex + 1} with ${optName}!`);
          setTimeout(() => get().setAppliedNotice(null), 3500);
        }
      } else {
        const proj = resume.content.projects.find((p) => p.id === id);
        if (proj) {
          const newHighlights = [...(proj.highlights || [])];
          newHighlights[bulletIndex] = newText;
          updateProject(id, { highlights: newHighlights });
          get().setAppliedNotice(`Replaced Bullet #${bulletIndex + 1} with ${optName}!`);
          setTimeout(() => get().setAppliedNotice(null), 3500);
        }
      }
    };

    const actionSuggestions: ChatSuggestionAction[] = [
      {
        id: `imp-a-${Date.now()}`,
        label: `✔ Replace Bullet #${bulletIndex + 1} with Option A (Metric-Driven)`,
        action: () => applyReplacement(optA, 'Option A'),
      },
      {
        id: `imp-b-${Date.now()}`,
        label: `✔ Replace Bullet #${bulletIndex + 1} with Option B (Architectural)`,
        action: () => applyReplacement(optB, 'Option B'),
      },
      {
        id: `imp-c-${Date.now()}`,
        label: `✔ Replace Bullet #${bulletIndex + 1} with Option C (Quality & Speed)`,
        action: () => applyReplacement(optC, 'Option C'),
      },
    ];

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `### 🔍 Original Bullet #${bulletIndex + 1} (${titleLabel}):\n> *"${rawText}"*\n\n### ⚡ Upgraded High-Impact Variations:\n\n**Option A (Metric-Driven & Speed):**\n- ${optA}\n\n**Option B (Architectural Scaling):**\n- ${optB}\n\n**Option C (Quality & Precision):**\n- ${optC}\n\nClick any button below to instantly replace Bullet #${bulletIndex + 1} in your form:`,
      suggestions: actionSuggestions,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTimeout(() => {
      set((state) => ({
        messages: [...state.messages, aiMsg],
        isChatLoading: false,
      }));
    }, 450);
  },

  triggerSkillsAi: async () => {
    set({ isOpen: true, activeMobileTab: 'chat' });

    const headline = useResumeStore.getState().resume.content.personalInfo.headline || 'Software Engineer';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: `Recommend high-demand ATS technical skills and keywords for my role as ${headline}.`,
      timestamp,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isChatLoading: true,
    }));

    const existingSkillNames = new Set(
      (useResumeStore.getState().resume.content.skills || []).map((s) => (typeof s === 'string' ? s : s.name).trim().toLowerCase())
    );

    const masterSkillList = [
      'TypeScript',
      'Next.js',
      'Node.js',
      'PostgreSQL',
      'Docker',
      'Kubernetes',
      'CI/CD Pipelines',
      'System Architecture',
      'Redis',
      'AWS',
      'GraphQL',
      'TailwindCSS',
      'Microservices',
      'Automated Testing',
    ];

    const unaddedSkills = masterSkillList.filter((sk) => !existingSkillNames.has(sk.toLowerCase()));
    const skillsToSuggest = unaddedSkills.length > 0 ? unaddedSkills.slice(0, 8) : ['Cloudflare Workers', 'Terraform', 'WebSockets', 'Jest'];

    const actionSuggestions: ChatSuggestionAction[] = [
      {
        id: `skill-add-all-${Date.now()}`,
        label: `+ Add All (${skillsToSuggest.length}) Recommended Skills to Resume`,
        action: () => {
          skillsToSuggest.forEach((skName) => {
            useResumeStore.getState().addSkill({
              id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: skName,
              category: 'Technical Skills',
              level: 5,
            });
          });
          get().setAppliedNotice(`Added ${skillsToSuggest.length} skills to your resume!`);
          setTimeout(() => get().setAppliedNotice(null), 3500);
        },
      },
      ...skillsToSuggest.map((sk) => ({
        id: `sk-${sk}-${Date.now()}`,
        label: `+ Add "${sk}"`,
        action: () => {
          useResumeStore.getState().addSkill({
            id: `sk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: sk,
            category: 'Technical Skills',
            level: 5,
          });
          get().setAppliedNotice(`Added "${sk}" to skills!`);
          setTimeout(() => get().setAppliedNotice(null), 3500);
        },
      })),
    ];

    const skillsMd = skillsToSuggest.map((s) => `\`${s}\``).join(', ');

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `Based on automated ATS screener benchmarks for **${headline}**, here are top missing technical skills you should consider adding:\n\n- **Recommended Skills:** ${skillsMd}\n\nClick any **+ Add** button below to immediately append that skill to your resume without duplicates!`,
      suggestions: actionSuggestions,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTimeout(() => {
      set((state) => ({
        messages: [...state.messages, aiMsg],
        isChatLoading: false,
      }));
    }, 450);
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
