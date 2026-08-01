import { create } from 'zustand';
import {
  IResume,
  IPersonalInfo,
  IExperience,
  IEducation,
  IProject,
  ISkill,
  ICertificate,
  ILanguage,
  ISocialLink,
  ITemplateSettings,
} from '../types';
import { INITIAL_RESUME_STATE, BLANK_RESUME_STATE } from '../constants/initialState';
import { ResumeNormalizationService } from '../services/ResumeNormalizationService';

import { StorageProviderFactory } from '../storage/factory';

export type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

interface ResumeStoreState {
  resume: IResume;
  isDirty: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  activeSection: string;
  
  // Section Navigation
  setActiveSection: (section: string) => void;

  // Form Field Actions
  updateTitle: (title: string) => void;
  updateTemplateId: (templateId: string) => void;
  updatePersonalInfo: (info: Partial<IPersonalInfo>) => void;
  updateSummary: (summary: string) => void;
  
  // Experience Actions
  addExperience: (experience: IExperience) => void;
  updateExperience: (id: string, experience: Partial<IExperience>) => void;
  removeExperience: (id: string) => void;
  reorderExperiences: (experiences: IExperience[]) => void;

  // Education Actions
  addEducation: (education: IEducation) => void;
  updateEducation: (id: string, education: Partial<IEducation>) => void;
  removeEducation: (id: string) => void;

  // Project Actions
  addProject: (project: IProject) => void;
  updateProject: (id: string, project: Partial<IProject>) => void;
  removeProject: (id: string) => void;
  reorderProjects: (projects: IProject[]) => void;

  // Skill Actions
  addSkill: (skill: ISkill) => void;
  updateSkill: (id: string, skill: Partial<ISkill>) => void;
  removeSkill: (id: string) => void;

  // Certificate Actions
  addCertificate: (certificate: ICertificate) => void;
  updateCertificate: (id: string, certificate: Partial<ICertificate>) => void;
  removeCertificate: (id: string) => void;
  reorderCertificates: (certificates: ICertificate[]) => void;

  // Language Actions
  addLanguage: (language: ILanguage) => void;
  updateLanguage: (id: string, language: Partial<ILanguage>) => void;
  removeLanguage: (id: string) => void;
  reorderLanguages: (languages: ILanguage[]) => void;

  // Social Link Actions
  addSocialLink: (socialLink: ISocialLink) => void;
  updateSocialLink: (id: string, socialLink: Partial<ISocialLink>) => void;
  removeSocialLink: (id: string) => void;

  // Settings Actions
  updateSettings: (settings: Partial<ITemplateSettings>) => void;

  // Full Replacement (e.g. AI Accept or Restore)
  setResume: (resume: IResume) => void;
  
  // Storage Synchronization & Persistence
  saveResume: (isAuthenticated: boolean) => Promise<void>;
  loadResume: (id: string, isAuthenticated: boolean) => Promise<void>;
  resetToDefault: () => void;
  resetToBlank: () => void;
}

export const useResumeStore = create<ResumeStoreState>((set, get) => ({
  resume: INITIAL_RESUME_STATE,
  isDirty: false,
  saveStatus: 'idle',
  lastSavedAt: null,
  activeSection: 'personalInfo',

  setActiveSection: (section) => set({ activeSection: section }),

  updateTitle: (title) =>
    set((state) => ({
      resume: { ...state.resume, title },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  updateTemplateId: (templateId) =>
    set((state) => ({
      resume: { ...state.resume, templateId },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  updatePersonalInfo: (info) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          personalInfo: { ...state.resume.content.personalInfo, ...info },
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  updateSummary: (summary) =>
    set((state) => {
      const summaryText = ResumeNormalizationService.cleanWhitespace(summary);
      return {
        resume: {
          ...state.resume,
          content: { ...state.resume.content, summary: summaryText },
        },
        isDirty: true,
        saveStatus: 'unsaved',
      };
    }),

  addExperience: (experience) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          experiences: [...state.resume.content.experiences, experience],
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  updateExperience: (id, experience) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          experiences: state.resume.content.experiences.map((exp) =>
            exp.id === id ? { ...exp, ...experience } : exp
          ),
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  removeExperience: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          experiences: state.resume.content.experiences.filter((exp) => exp.id !== id),
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  reorderExperiences: (experiences) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: { ...state.resume.content, experiences },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  addEducation: (education) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          educations: [...state.resume.content.educations, education],
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  updateEducation: (id, education) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          educations: state.resume.content.educations.map((edu) =>
            edu.id === id ? { ...edu, ...education } : edu
          ),
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  removeEducation: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          educations: state.resume.content.educations.filter((edu) => edu.id !== id),
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  addProject: (project) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          projects: [...state.resume.content.projects, project],
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  updateProject: (id, project) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          projects: state.resume.content.projects.map((proj) =>
            proj.id === id ? { ...proj, ...project } : proj
          ),
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  removeProject: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          projects: state.resume.content.projects.filter((proj) => proj.id !== id),
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  reorderProjects: (projects) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          projects,
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  addSkill: (skill) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          skills: [...state.resume.content.skills, skill],
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  updateSkill: (id, skill) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          skills: state.resume.content.skills.map((s) => (s.id === id ? { ...s, ...skill } : s)),
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  removeSkill: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          skills: state.resume.content.skills.filter((s) => s.id !== id),
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  addCertificate: (certificate) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          certificates: [...state.resume.content.certificates, certificate],
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  updateCertificate: (id, certificate) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          certificates: state.resume.content.certificates.map((c) =>
            c.id === id ? { ...c, ...certificate } : c
          ),
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  removeCertificate: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          certificates: state.resume.content.certificates.filter((c) => c.id !== id),
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  reorderCertificates: (certificates) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          certificates,
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  addLanguage: (language) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          languages: [...state.resume.content.languages, language],
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  updateLanguage: (id, language) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          languages: state.resume.content.languages.map((l) =>
            l.id === id ? { ...l, ...language } : l
          ),
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  removeLanguage: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          languages: state.resume.content.languages.filter((l) => l.id !== id),
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  reorderLanguages: (languages) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          languages,
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  addSocialLink: (socialLink) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          socialLinks: [...state.resume.content.socialLinks, socialLink],
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  updateSocialLink: (id, socialLink) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          socialLinks: state.resume.content.socialLinks.map((s) =>
            s.id === id ? { ...s, ...socialLink } : s
          ),
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  removeSocialLink: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        content: {
          ...state.resume.content,
          socialLinks: state.resume.content.socialLinks.filter((s) => s.id !== id),
        },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  updateSettings: (settings) =>
    set((state) => ({
      resume: {
        ...state.resume,
        settings: { ...state.resume.settings, ...settings },
      },
      isDirty: true,
      saveStatus: 'unsaved',
    })),

  setResume: (resume) => {
    const normalizedContent = ResumeNormalizationService.normalize(resume.content);
    const cleanedResume = { ...resume, content: normalizedContent };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('guest_active_resume', JSON.stringify(cleanedResume));
      } catch (e) {}
    }
    set({
      resume: cleanedResume,
      isDirty: false,
      saveStatus: 'saved',
    });
  },

  saveResume: async (isAuthenticated) => {
    const { resume } = get();
    set({ saveStatus: 'saving' });
    try {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('guest_active_resume', JSON.stringify(resume));
        } catch (e) {}
      }
      const provider = StorageProviderFactory.getProvider(isAuthenticated);
      const savedResume = await provider.save(resume);
      set({
        resume: savedResume,
        isDirty: false,
        saveStatus: 'saved',
        lastSavedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (error) {
      console.error('Failed to save resume:', error);
      set({ saveStatus: 'error' });
    }
  },

  loadResume: async (id, isAuthenticated) => {
    set({ saveStatus: 'saving' });
    try {
      const provider = StorageProviderFactory.getProvider(isAuthenticated);
      let loaded = await provider.load(id);

      if (!loaded && typeof window !== 'undefined') {
        const cached = localStorage.getItem('guest_active_resume');
        if (cached) {
          try {
            loaded = JSON.parse(cached);
          } catch (e) {}
        }
      }

      if (loaded) {
        const normalizedContent = ResumeNormalizationService.normalize(loaded.content);
        set({
          resume: { ...loaded, content: normalizedContent },
          isDirty: false,
          saveStatus: 'saved',
        });
      } else {
        set({ saveStatus: 'idle' });
      }
    } catch (error) {
      console.error('Failed to load resume:', error);
      set({ saveStatus: 'error' });
    }
  },

  resetToDefault: () =>
    set({
      resume: INITIAL_RESUME_STATE,
      isDirty: false,
      saveStatus: 'idle',
      lastSavedAt: null,
    }),

  resetToBlank: () =>
    set({
      resume: BLANK_RESUME_STATE,
      isDirty: false,
      saveStatus: 'idle',
      lastSavedAt: null,
    }),
}));

