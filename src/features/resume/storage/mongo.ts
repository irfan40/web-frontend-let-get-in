import { IStorageProvider } from './types';
import { IResume } from '../types';
import { apiClient } from '../../../shared/services/apiClient';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class MongoStorage implements IStorageProvider {
  async save(resume: IResume): Promise<IResume> {
    if (resume.id && !resume.id.startsWith('guest-')) {
      // Patch existing resume
      const response = await apiClient.patch<never, ApiResponse<{ resume: IResume }>>(
        `/resumes/${resume.id}`,
        {
          title: resume.title,
          templateId: resume.templateId,
          content: resume.content,
          settings: resume.settings,
        }
      );
      return response.data.resume;
    } else {
      // Create new MongoDB resume
      const response = await apiClient.post<never, ApiResponse<{ resume: IResume }>>('/resumes', {
        title: resume.title,
        templateId: resume.templateId,
        content: resume.content,
        settings: resume.settings,
      });
      return response.data.resume;
    }
  }

  async load(id: string): Promise<IResume | null> {
    try {
      const response = await apiClient.get<never, ApiResponse<{ resume: IResume }>>(`/resumes/${id}`);
      return response.data.resume;
    } catch {
      return null;
    }
  }

  async list(): Promise<IResume[]> {
    const response = await apiClient.get<never, ApiResponse<{ resumes: IResume[] }>>('/resumes');
    return response.data.resumes;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/resumes/${id}`);
  }

  async migrateGuestResume(guestResume: IResume): Promise<IResume> {
    const response = await apiClient.post<never, ApiResponse<{ resume: IResume }>>(
      '/resumes/migrate-guest',
      { guestResume }
    );
    return response.data.resume;
  }
}
