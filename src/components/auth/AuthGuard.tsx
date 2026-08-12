"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isInitialized, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [isInitialized, checkAuth]);

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [isInitialized, isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-ink-soft">
        <Loader2 className="w-8 h-8 animate-spin text-primary-glow mb-4" />
        <p className="text-sm font-medium">Authenticating session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
