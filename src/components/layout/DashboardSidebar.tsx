"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/landing/Logo";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Plus,
  LogOut,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCreateNew?: () => void;
}

export function DashboardSidebar({ isOpen = false, onClose, onCreateNew }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Manage & view all resumes",
    },
    {
      name: "Resume Builder",
      href: "/builder",
      icon: FileText,
      description: "Build & optimize resumes",
    },
    {
      name: "AI Onboarding",
      href: "/demo",
      icon: Sparkles,
      description: "Smart career onboarding",
    },
  ];

  const displayName = user?.fullName || user?.username || "User Account";
  const email = user?.email || "";
  const firstLetter = (displayName || email || "U").charAt(0).toUpperCase();
  const avatarUrl = user?.avatarUrl || user?.avatar;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface border-r border-border w-64 lg:w-72 select-none shadow-sm">
      {/* Sidebar Header with Brand Logo */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo href="/" />
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
            Pro v2.0
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Workspace Navigation Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        <div>
          <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
            Workspace
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-brand text-primary-foreground shadow-glow font-bold"
                      : "text-ink-soft hover:text-ink hover:bg-surface-alt/70"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-primary-foreground" : "text-primary-glow"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{item.name}</div>
                    {!isActive && (
                      <div className="text-[10px] text-ink-soft/70 truncate group-hover:text-ink-soft transition">
                        {item.description}
                      </div>
                    )}
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Action Box */}
        <div className="p-4 rounded-2xl bg-gradient-dark border border-white/10 text-white space-y-3 relative overflow-hidden shadow-elegant">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(ellipse_at_top_right,_var(--primary-glow)_0%,_transparent_70%)] opacity-30 pointer-events-none" />
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-glow">
            <Sparkles className="w-3.5 h-3.5" /> AI Carrier Assistant
          </div>
          <p className="text-[11px] text-white/80 leading-relaxed">
            Create ATS-optimized resumes with real-time scoring.
          </p>
          {onCreateNew ? (
            <button
              onClick={() => {
                onClose?.();
                onCreateNew();
              }}
              className="w-full bg-gradient-brand text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-xl shadow-glow hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Resume</span>
            </button>
          ) : (
            <Link
              href="/builder"
              onClick={onClose}
              className="w-full bg-gradient-brand text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-xl shadow-glow hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Resume</span>
            </Link>
          )}
        </div>
      </div>

      {/* User Profile Mini Footer */}
      <div className="p-4 border-t border-border bg-surface-alt/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-border shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-brand text-primary-foreground font-bold text-xs flex items-center justify-center shadow-glow shrink-0">
                {firstLetter}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold text-ink truncate">{displayName}</div>
              <div className="text-[10px] text-ink-soft truncate">{email}</div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="text-ink-soft hover:text-destructive p-2 rounded-xl hover:bg-surface transition-colors shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block sticky top-0 h-screen shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
            onClick={onClose}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
