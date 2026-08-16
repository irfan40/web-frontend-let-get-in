export type AssistantContextType = 'explore' | 'resume' | 'drive';
export type AssistantMode = 'instant' | 'expert';

export interface AssistantContextPayload {
  resumeId?: string;
  activeResumeContext?: Record<string, unknown>;
  selectedJobId?: string;
  driveFileId?: string;
}

export interface AssistantChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestions?: string[];
  relevant?: boolean;
  timestamp: string;
}

export interface AssistantResponseData {
  relevant: boolean;
  reply: string;
  suggestions: string[];
  mode: AssistantMode;
  intent: string;
}
