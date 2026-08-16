import { create } from 'zustand';
import { AuthService, UserProfile, ActiveSession } from '../services/authService';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean; // Alias for loading
  isInitialized: boolean;
  isNetworkError: boolean;
  error: string | null;
  sessions: ActiveSession[];

  login: (data: { email?: string; phone?: string; emailOrPhone?: string; password: string }) => Promise<UserProfile>;
  googleLogin: (credential: string) => Promise<UserProfile>;
  sendEmailOtp: (email: string) => Promise<{ cooldown: number }>;
  verifyEmailOtp: (data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    otp: string;
  }) => Promise<UserProfile>;

  sendOtp: (email: string) => Promise<{ cooldown: number }>;
  verifyOtp: (data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    otp: string;
  }) => Promise<UserProfile>;

  sendWhatsAppOtp: (data: { countryCode: string; phone: string }) => Promise<{ cooldown: number }>;
  verifyWhatsAppOtp: (data: {
    username: string;
    countryCode?: string;
    phone: string;
    password: string;
    confirmPassword: string;
    otp: string;
  }) => Promise<UserProfile>;

  emailSignup: (data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    otp: string;
  }) => Promise<UserProfile>;

  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  fetchSessions: () => Promise<ActiveSession[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  refresh: () => Promise<UserProfile | null>;
  fetchCurrentUser: (force?: boolean) => Promise<UserProfile | null>;
  checkAuth: (force?: boolean) => Promise<UserProfile | null>;
  retryAuth: () => Promise<UserProfile | null>;
  clearError: () => void;
}

let authCheckPromise: Promise<UserProfile | null> | null = null;
let silentRefreshTimer: NodeJS.Timeout | null = null;

const setupSilentRefresh = (refreshFn: () => void) => {
  if (typeof window === 'undefined') return;
  if (silentRefreshTimer) clearInterval(silentRefreshTimer);

  // Proactively refresh access token every 10 minutes while user is active
  silentRefreshTimer = setInterval(() => {
    if (document.visibilityState === 'visible') {
      refreshFn();
    }
  }, 10 * 60 * 1000);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  isLoading: true,
  isInitialized: false,
  isNetworkError: false,
  error: null,
  sessions: [],

  fetchCurrentUser: async (force: boolean = false) => {
    // If already checked and not forced, return cached user
    if (!force && get().isInitialized && !get().isNetworkError) {
      return get().user;
    }

    if (authCheckPromise) {
      return authCheckPromise;
    }

    set({ loading: true, isLoading: true, error: null });
    authCheckPromise = (async () => {
      try {
        const user = await AuthService.fetchCurrentUser();
        set({
          user,
          isAuthenticated: true,
          loading: false,
          isLoading: false,
          isInitialized: true,
          isNetworkError: false,
        });

        // Initialize background proactive silent refresh
        setupSilentRefresh(() => {
          get().refresh();
        });

        return user;
      } catch (err: any) {
        const isNetErr = err?.error?.code === 'NETWORK_ERROR' || err?.code === 'NETWORK_ERROR' || !err?.response;

        if (isNetErr) {
          // Do not destroy authenticated state on temporary network disconnection
          set({
            loading: false,
            isLoading: false,
            isInitialized: true,
            isNetworkError: true,
          });
          return get().user;
        }

        // Definitively unauthenticated (401 Unauthorized / no session)
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          isLoading: false,
          isInitialized: true,
          isNetworkError: false,
        });
        return null;
      } finally {
        authCheckPromise = null;
      }
    })();

    return authCheckPromise;
  },

  checkAuth: async (force: boolean = false) => {
    return get().fetchCurrentUser(force);
  },

  retryAuth: async () => {
    return get().fetchCurrentUser(true);
  },

  login: async (credentials) => {
    set({ loading: true, isLoading: true, error: null, isNetworkError: false });
    try {
      const user = await AuthService.login(credentials);
      set({
        user,
        isAuthenticated: true,
        loading: false,
        isLoading: false,
        isInitialized: true,
        isNetworkError: false,
      });

      setupSilentRefresh(() => {
        get().refresh();
      });

      return user;
    } catch (err: unknown) {
      const errorMsg =
        (err as { error?: { message?: string } })?.error?.message ||
        (err as { message?: string })?.message ||
        'Login failed';
      set({ error: errorMsg, loading: false, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  googleLogin: async (credential: string) => {
    set({ loading: true, isLoading: true, error: null, isNetworkError: false });
    try {
      const user = await AuthService.googleLogin(credential);
      set({
        user,
        isAuthenticated: true,
        loading: false,
        isLoading: false,
        isInitialized: true,
        isNetworkError: false,
      });

      setupSilentRefresh(() => {
        get().refresh();
      });

      return user;
    } catch (err: unknown) {
      const errorMsg =
        (err as { error?: { message?: string } })?.error?.message ||
        (err as { message?: string })?.message ||
        'Google authentication failed';
      set({ error: errorMsg, loading: false, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  sendEmailOtp: async (email: string) => {
    set({ error: null });
    try {
      return await AuthService.sendEmailOtp(email);
    } catch (err: unknown) {
      const errorMsg =
        (err as { error?: { message?: string } })?.error?.message ||
        (err as { message?: string })?.message ||
        'Failed to send Email OTP';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  verifyEmailOtp: async (data) => {
    set({ loading: true, isLoading: true, error: null, isNetworkError: false });
    try {
      const user = await AuthService.verifyEmailOtp(data);
      set({
        user,
        isAuthenticated: true,
        loading: false,
        isLoading: false,
        isInitialized: true,
        isNetworkError: false,
      });

      setupSilentRefresh(() => {
        get().refresh();
      });

      return user;
    } catch (err: unknown) {
      const errorMsg =
        (err as { error?: { message?: string } })?.error?.message ||
        (err as { message?: string })?.message ||
        'Email OTP verification failed';
      set({ error: errorMsg, loading: false, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  sendOtp: async (email: string) => {
    return get().sendEmailOtp(email);
  },

  verifyOtp: async (data) => {
    return get().verifyEmailOtp(data);
  },

  sendWhatsAppOtp: async (data) => {
    set({ error: null });
    try {
      return await AuthService.sendWhatsAppOtp(data);
    } catch (err: unknown) {
      const errorMsg =
        (err as { error?: { message?: string } })?.error?.message ||
        (err as { message?: string })?.message ||
        'Failed to send WhatsApp OTP';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  verifyWhatsAppOtp: async (data) => {
    set({ loading: true, isLoading: true, error: null, isNetworkError: false });
    try {
      const user = await AuthService.verifyWhatsAppOtp(data);
      set({
        user,
        isAuthenticated: true,
        loading: false,
        isLoading: false,
        isInitialized: true,
        isNetworkError: false,
      });

      setupSilentRefresh(() => {
        get().refresh();
      });

      return user;
    } catch (err: unknown) {
      const errorMsg =
        (err as { error?: { message?: string } })?.error?.message ||
        (err as { message?: string })?.message ||
        'WhatsApp OTP verification failed';
      set({ error: errorMsg, loading: false, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  emailSignup: async (data) => {
    return get().verifyEmailOtp(data);
  },

  refresh: async () => {
    try {
      const user = await AuthService.refresh();
      set({
        user,
        isAuthenticated: true,
        loading: false,
        isLoading: false,
        isInitialized: true,
        isNetworkError: false,
      });
      return user;
    } catch {
      return null;
    }
  },

  fetchSessions: async () => {
    try {
      const sessions = await AuthService.listSessions();
      set({ sessions });
      return sessions;
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      return [];
    }
  },

  revokeSession: async (sessionId: string) => {
    try {
      await AuthService.revokeSession(sessionId);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.sessionId !== sessionId),
      }));
    } catch (err) {
      console.error('Failed to revoke session:', err);
      throw err;
    }
  },

  logout: async () => {
    if (silentRefreshTimer) clearInterval(silentRefreshTimer);
    set({ loading: true, isLoading: true });
    try {
      await AuthService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        isLoading: false,
        isInitialized: true,
        isNetworkError: false,
        sessions: [],
      });
    }
  },

  logoutAll: async () => {
    if (silentRefreshTimer) clearInterval(silentRefreshTimer);
    set({ loading: true, isLoading: true });
    try {
      await AuthService.logoutAll();
    } catch (err) {
      console.error('Logout-all error:', err);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        isLoading: false,
        isInitialized: true,
        isNetworkError: false,
        sessions: [],
      });
    }
  },

  clearError: () => set({ error: null }),
}));
