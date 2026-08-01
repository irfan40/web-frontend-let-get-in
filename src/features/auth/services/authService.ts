import { apiClient } from '../../../shared/services/apiClient';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  provider?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: UserProfile;
  };
  message?: string;
}

export class AuthService {
  static async register(data: { email: string; password: string; fullName: string }): Promise<UserProfile> {
    const response = await apiClient.post<never, AuthResponse>('/auth/register', data);
    return response.data.user;
  }

  static async login(data: { email: string; password: string }): Promise<UserProfile> {
    const response = await apiClient.post<never, AuthResponse>('/auth/login', data);
    return response.data.user;
  }

  static async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  static async getMe(): Promise<UserProfile> {
    const response = await apiClient.get<never, AuthResponse>('/auth/me');
    return response.data.user;
  }
}
