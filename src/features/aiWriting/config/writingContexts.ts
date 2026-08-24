import { AIWritingAction, AIWritingContext } from '../types';

// UI-facing mirror of the backend's writingContexts.config.ts allowed-action lists.
// Keep this list in sync with the backend — it only controls which buttons are shown;
// the backend independently re-validates every action/context pair server-side.

export const ACTION_LABELS: Record<AIWritingAction, string> = {
  improve: 'Improve',
  rewrite: 'Rewrite',
  professional: 'Make Professional',
  expand: 'Expand',
  shorten: 'Shorten',
  grammar: 'Fix Grammar',
  simplify: 'Simplify',
  generate: 'Generate',
  custom: 'Custom Instruction',
  'ats-optimize': 'ATS Optimize',
  'quantify-impact': 'Quantify Impact',
  personalize: 'Personalize',
  'suggest-skills': 'Suggest Skills',
};

export const CONTEXT_ACTIONS: Record<AIWritingContext, AIWritingAction[]> = {
  'job-description': ['improve', 'rewrite', 'expand', 'shorten', 'professional', 'custom'],
  'company-about': ['improve', 'professional', 'expand', 'rewrite'],
  'startup-about': ['improve', 'professional', 'expand', 'rewrite'],
  'institution-about': ['improve', 'professional', 'expand', 'rewrite'],
  'resume-summary': ['improve', 'rewrite', 'ats-optimize', 'professional', 'shorten'],
  'resume-experience': ['improve', 'rewrite', 'quantify-impact', 'ats-optimize'],
  'resume-project': ['improve', 'rewrite', 'expand', 'shorten'],
  'cover-letter': ['generate', 'improve', 'personalize', 'professional', 'shorten'],
  skills: ['suggest-skills'],
};

export const CONTEXT_LABELS: Record<AIWritingContext, string> = {
  'job-description': 'Job Description',
  'company-about': 'About Company',
  'startup-about': 'About Startup',
  'institution-about': 'About Institution',
  'resume-summary': 'Resume Summary',
  'resume-experience': 'Resume Experience',
  'resume-project': 'Resume Project',
  'cover-letter': 'Cover Letter',
  skills: 'Skills',
};

export const MAX_TEXT_LENGTH = 6000;
export const MAX_INSTRUCTION_LENGTH = 300;
