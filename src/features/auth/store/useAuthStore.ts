import { create } from 'zustand';
import { AuthService, UserProfile } from '../services/authService';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  checkAuth: () => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<UserProfile>;
  register: (data: { email: string; password: string; fullName: string }) => Promise<UserProfile>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.login(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err: unknown) {
      const errorMsg = (err as { error?: { message?: string } })?.error?.message || 'Login failed';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.register(data);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err: unknown) {
      const errorMsg = (err as { error?: { message?: string } })?.error?.message || 'Registration failed';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AuthService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
