"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Loader2, WifiOff, RefreshCw } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isInitialized, isNetworkError, checkAuth, retryAuth } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [isInitialized, checkAuth]);

  useEffect(() => {
    // Only redirect to /auth if we have completed initialization, not loading, definitely unauthenticated, and NOT a temporary network error
    if (isInitialized && !isLoading && !isAuthenticated && !isNetworkError) {
      router.replace("/auth");
    }
  }, [isInitialized, isLoading, isAuthenticated, isNetworkError, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-ink-soft">
        <Loader2 className="w-8 h-8 animate-spin text-primary-glow mb-4" />
        <p className="text-sm font-medium text-ink">Authenticating session...</p>
        <p className="text-xs text-ink-soft mt-1">Verifying your secure persistent identity</p>
      </div>
    );
  }

  // Graceful Network Error screen: Prevents ejecting authenticated users when their connection drops
  if (isNetworkError && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
          <WifiOff className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-ink">Connection Interrupted</h2>
        <p className="text-sm text-ink-soft max-w-sm mt-1 mb-6">
          Unable to reach the authentication server. Your session is preserved. Please check your internet connection.
        </p>
        <button
          type="button"
          onClick={() => retryAuth()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition shadow-lg shadow-primary/20"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
