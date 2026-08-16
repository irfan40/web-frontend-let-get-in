import { apiClient } from '@/shared/services/apiClient';
import { AiApplyPreferences, AiApplySuggestions, ApplyForJobsResult } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const aiApplyService = {
  async getPreferences(): Promise<{ preferences: AiApplyPreferences | null; aiSuggestions: AiApplySuggestions }> {
    const res = await apiClient.get<never, ApiResponse<{ preferences: AiApplyPreferences | null; aiSuggestions: AiApplySuggestions }>>(
      '/ai-apply/preferences'
    );
    return res.data;
  },

  async savePreferences(data: Partial<AiApplyPreferences>): Promise<AiApplyPreferences> {
    const res = await apiClient.put<never, ApiResponse<{ preferences: AiApplyPreferences }>>(
      '/ai-apply/preferences',
      data
    );
    return res.data.preferences;
  },

  async applyForJobs(): Promise<ApplyForJobsResult> {
    const res = await apiClient.post<never, ApiResponse<ApplyForJobsResult>>('/ai-apply/apply', {});
    return res.data;
  },
};
