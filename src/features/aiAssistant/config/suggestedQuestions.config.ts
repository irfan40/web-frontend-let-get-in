import { AssistantContextType, AssistantMode } from '../types';

export const SUGGESTED_QUESTIONS: Record<AssistantContextType, Record<AssistantMode, string[]>> = {
  explore: {
    instant: ['What are my strongest skills?', 'What can you help me with?'],
    expert: ['Give me a summary of my profile', 'What should I improve to match more jobs?'],
  },
  profile: {
    instant: ['What skills are listed on my profile?', 'What is my profile completeness?', 'Summarize my work experience'],
    expert: ['How can I optimize my profile for recruiter visibility?', 'Suggest improvements for my experience descriptions', 'What key skills or certifications am I missing?'],
  },
  resume: {
    instant: ['What are the strongest parts of my resume?', 'What skills are missing from my resume?'],
    expert: ['How can I make my resume more ATS-friendly?', 'Give me suggestions to improve this resume'],
  },
  drive: {
    instant: ['What documents do I have?', 'Find documents related to my experience'],
    expert: ['Summarize this document', 'Compare these documents'],
  },
};

export const CONTEXT_LABELS: Record<AssistantContextType, string> = {
  explore: 'Explore Assistant',
  profile: 'Profile Assistant',
  resume: 'Resume Assistant',
  drive: 'Drive Assistant',
};

export const CONTEXT_GREETINGS: Record<AssistantContextType, string> = {
  explore: "Hi! Ask me about your profile, skills, or the jobs you're exploring.",
  profile: "Hi! Ask me anything about your profile, career background, education, or skills.",
  resume: 'Hi! Ask me anything about your current resume or resumes workspace.',
  drive: 'Hi! Ask me about your uploaded files and documents.',
};
