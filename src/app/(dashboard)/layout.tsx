"use client";

import React, { useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { UserDropdown } from '@/components/layout/UserDropdown';
import { Menu, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard Overview',
    '/builder': 'Resume Builder',
    '/demo': 'AI Carrier Onboarding',
  };

  const currentTitle = pageTitles[pathname] || 'Dashboard Workspace';

  return (
    <AuthGuard>
      <div className="min-h-screen flex bg-background text-foreground">
        {/* Left Sidebar */}
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar Header */}
          <header className="sticky top-0 z-20 h-16 border-b border-border glass px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-border text-ink-soft hover:text-ink hover:bg-surface-alt transition"
                aria-label="Open Sidebar Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base font-bold text-ink tracking-tight">{currentTitle}</h1>
                <p className="text-[11px] text-ink-soft hidden sm:block">
                  LetGetIn AI Career Workspace
                </p>
              </div>
            </div>

            {/* Top Right User Profile */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary-glow bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                <Sparkles className="w-3 h-3 text-primary-glow" /> Pro Career v2.0
              </span>
              <UserDropdown />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
