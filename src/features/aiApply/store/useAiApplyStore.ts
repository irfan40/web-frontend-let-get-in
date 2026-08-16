import { create } from 'zustand';
import { MongoStorage } from '@/features/resume/storage/mongo';
import { ProfileService, ProfileData } from '@/features/profile/services/profileService';
import { aiApplyService } from '../services/aiApplyService';
import { coverLetterService } from '../services/coverLetterService';
import { STEPS, TOTAL_STEPS } from '../config/steps.config';
import {
  AiApplyPreferences,
  AiApplySuggestions,
  AiApplyResumeOption,
  AiApplyCoverLetterOption,
  ApplyForJobsResult,
  ContactChannel,
  createInitialPreferences,
} from '../types';
import { IResume } from '@/features/resume/types';

function mapIResumeToOption(r: IResume): AiApplyResumeOption {
  return {
    id: r.id,
    title: r.title,
    headline: r.content?.personalInfo?.headline,
    templateId: r.templateId,
    atsScore: r.atsScore,
    updatedAt: r.updatedAt,
  };
}

interface AiApplyStoreState {
  currentStep: number; // 0 = Introduction, 1..TOTAL_STEPS = wizard steps
  preferences: AiApplyPreferences;
  aiSuggestions: AiApplySuggestions | null;
  profile: ProfileData | null;
  resumes: AiApplyResumeOption[];
  coverLetters: AiApplyCoverLetterOption[];
  hydrated: boolean;
  isHydrating: boolean;
  isSaving: boolean;
  isApplying: boolean;
  applyResult: ApplyForJobsResult | null;
  error: string | null;

  hydrate: () => Promise<void>;
  setField: <K extends keyof AiApplyPreferences>(key: K, value: AiApplyPreferences[K]) => void;
  goToStep: (step: number) => void;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  addResume: (resume: AiApplyResumeOption) => void;
  addCoverLetter: (coverLetter: AiApplyCoverLetterOption) => void;
  submitApply: () => Promise<void>;
  reset: () => void;
}

export const useAiApplyStore = create<AiApplyStoreState>((set, get) => ({
  currentStep: 0,
  preferences: createInitialPreferences(),
  aiSuggestions: null,
  profile: null,
  resumes: [],
  coverLetters: [],
  hydrated: false,
  isHydrating: false,
  isSaving: false,
  isApplying: false,
  applyResult: null,
  error: null,

  hydrate: async () => {
    if (get().isHydrating) return;
    set({ isHydrating: true, error: null });

    try {
      const [preferencesResult, profile, resumes, coverLetters] = await Promise.all([
        aiApplyService.getPreferences(),
        ProfileService.getProfile(),
        new MongoStorage().list(),
        coverLetterService.list(),
      ]);

      const merged = createInitialPreferences();

      // 1. Saved AI Apply preferences win for every field they cover (resume-later case).
      if (preferencesResult.preferences) {
        Object.assign(merged, preferencesResult.preferences);
      }

      // 2. Profile passthrough only for fields still empty - never overrides a saved preference.
      if (!merged.preferredCountry) merged.preferredCountry = profile.contact?.country || '';
      if (!merged.preferredState) merged.preferredState = profile.contact?.state || '';
      if (!merged.preferredLocation) merged.preferredLocation = profile.contact?.city || '';
      if (merged.contactChannels.length === 0) {
        const channels: ContactChannel[] = [];
        if (profile.contact?.email) channels.push('email');
        if (profile.contact?.phone) channels.push('mobile');
        merged.contactChannels = channels;
      }

      set({
        preferences: merged,
        aiSuggestions: preferencesResult.aiSuggestions,
        profile,
        resumes: resumes.map(mapIResumeToOption),
        coverLetters,
        isHydrating: false,
        hydrated: true,
      });
    } catch (err) {
      console.warn('[useAiApplyStore] hydrate failed:', err);
      set({
        isHydrating: false,
        hydrated: true,
        error: 'We could not load your saved data. You can still fill the wizard manually.',
      });
    }
  },

  setField: (key, value) =>
    set((state) => ({ preferences: { ...state.preferences, [key]: value } })),

  goToStep: (step) => set({ currentStep: Math.max(0, Math.min(step, TOTAL_STEPS)) }),

  nextStep: async () => {
    const { currentStep, preferences } = get();

    if (currentStep >= 1 && currentStep <= TOTAL_STEPS) {
      const stepDef = STEPS[currentStep - 1];
      if (stepDef && !stepDef.isValid(preferences)) return;
    }

    set({ isSaving: true });
    try {
      await aiApplyService.savePreferences(preferences);
    } catch (err) {
      console.warn('[useAiApplyStore] autosave failed:', err);
    } finally {
      set({ isSaving: false });
    }

    set((state) => ({ currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS) }));
  },

  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),

  addResume: (resume) =>
    set((state) => ({
      resumes: [resume, ...state.resumes],
      preferences: { ...state.preferences, resumeId: resume.id },
    })),

  addCoverLetter: (coverLetter) =>
    set((state) => ({
      coverLetters: [coverLetter, ...state.coverLetters],
      preferences: { ...state.preferences, coverLetterId: coverLetter.id },
    })),

  submitApply: async () => {
    set({ isApplying: true, error: null });
    try {
      await aiApplyService.savePreferences(get().preferences);
      const result = await aiApplyService.applyForJobs();
      set({ applyResult: result, isApplying: false });
    } catch (err) {
      const apiError = err as { error?: { message?: string }; message?: string };
      set({
        isApplying: false,
        error: apiError?.error?.message || apiError?.message || 'Failed to apply for jobs. Please try again.',
      });
    }
  },

  reset: () =>
    set({
      currentStep: 0,
      preferences: createInitialPreferences(),
      aiSuggestions: null,
      hydrated: false,
      applyResult: null,
      error: null,
    }),
}));
