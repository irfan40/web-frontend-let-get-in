import { apiClient } from '../../../shared/services/apiClient';

export interface UserProfile {
  id?: string;
  _id?: string;
  username?: string;
  email?: string;
  phone?: string;
  fullName?: string;
  role: 'user' | 'admin';
  avatar?: string;
  avatarUrl?: string;
  provider?: 'email' | 'google' | 'local' | 'whatsapp';
  emailVerified?: boolean;
  isEmailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponseData {
  user: UserProfile;
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthApiResponse {
  success: boolean;
  message?: string;
  data: AuthResponseData;
}

export interface SendOtpApiResponse {
  success: boolean;
  message?: string;
  data: {
    cooldown: number;
  };
}

export class AuthService {
  static async sendEmailOtp(email: string): Promise<{ cooldown: number }> {
    const response = await apiClient.post<never, SendOtpApiResponse>('/auth/send-email-otp', { email });
    return response.data;
  }

  static async verifyEmailOtp(data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    otp: string;
  }): Promise<UserProfile> {
    const response = await apiClient.post<never, AuthApiResponse>('/auth/verify-email-otp', data);
    return response.data.user;
  }

  // Alias for backward compatibility
  static async sendOtp(email: string): Promise<{ cooldown: number }> {
    return this.sendEmailOtp(email);
  }

  static async verifyOtp(data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    otp: string;
  }): Promise<UserProfile> {
    return this.verifyEmailOtp(data);
  }

  static async sendWhatsAppOtp(data: { countryCode: string; phone: string }): Promise<{ cooldown: number }> {
    const response = await apiClient.post<never, SendOtpApiResponse>('/auth/send-whatsapp-otp', data);
    return response.data;
  }

  static async verifyWhatsAppOtp(data: {
    username: string;
    countryCode?: string;
    phone: string;
    password: string;
    confirmPassword: string;
    otp: string;
  }): Promise<UserProfile> {
    const response = await apiClient.post<never, AuthApiResponse>('/auth/verify-whatsapp-otp', data);
    return response.data.user;
  }

  static async emailSignup(data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    otp: string;
  }): Promise<UserProfile> {
    return this.verifyEmailOtp(data);
  }

  static async login(data: { email?: string; phone?: string; emailOrPhone?: string; password: string }): Promise<UserProfile> {
    const response = await apiClient.post<never, AuthApiResponse>('/auth/login', data);
    return response.data.user;
  }

  static async googleLogin(credential: string): Promise<UserProfile> {
    const response = await apiClient.post<never, AuthApiResponse>('/auth/google', { credential });
    return response.data.user;
  }

  static async refresh(): Promise<UserProfile> {
    const response = await apiClient.post<never, AuthApiResponse>('/auth/refresh');
    return response.data.user;
  }

  static async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  static async fetchCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<never, AuthApiResponse>('/auth/me');
    return response.data.user;
  }

  static async getMe(): Promise<UserProfile> {
    return this.fetchCurrentUser();
  }
}
