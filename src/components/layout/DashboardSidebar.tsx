"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/landing/Logo";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { StorageProviderFactory } from "@/features/resume/storage/factory";
import {
  FileText,
  Sparkles,
  LogOut,
  X,
  ChevronRight,
  Compass,
  User,
  HardDrive,
  LayoutGrid,
  BrainCircuit,
  GraduationCap,
  BookOpenCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCreateNew?: () => void;
}

export function DashboardSidebar({
  isOpen = false,
  onClose,
  onCreateNew,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasResumes, setHasResumes] = useState<boolean | null>(null);

  // Load collapsed preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dashboard_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // ignore SSR/localStorage errors
    }
  }, []);

  // Check if user has resumes (to conditionally show /demo for new users only)
  useEffect(() => {
    let isMounted = true;
    const checkResumes = async () => {
      try {
        const provider = StorageProviderFactory.getProvider();
        const list = await provider.list();
        if (isMounted) {
          setHasResumes(Array.isArray(list) && list.length > 0);
        }
      } catch {
        if (isMounted) setHasResumes(false);
      }
    };
    checkResumes();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dashboard_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const navItems = [
    // Show AI Onboarding only if user has 0 resumes (new user first time)
    ...(hasResumes === false
      ? [
          {
            name: "AI Onboarding",
            href: "/demo",
            icon: Sparkles,
            description: "Smart career onboarding suite",
          },
        ]
      : []),
    {
      name: "Explore Opportunities",
      href: "/explore",
      icon: Compass,
      description: "Explore matched job opportunities",
    },
    {
      name: "My Resumes",
      href: "/dashboard",
      icon: FileText,
      description: "Manage & view all resumes",
    },
    {
      name: "My Profile",
      href: "/profile",
      icon: User,
      description: "Manage your professional identity",
    },
    {
      name: "My Drive",
      href: "/drive",
      icon: HardDrive,
      description: "Cloud resume & asset storage",
    },
    {
      name: "My Hub",
      href: "/myhub",
      icon: LayoutGrid,
      description: "Central application hub",
    },
    {
      name: "Genius Test",
      href: "/geniustest",
      icon: BrainCircuit,
      description: "Adaptive AI skill assessments",
    },
    {
      name: "Exams",
      href: "/exams",
      icon: GraduationCap,
      description: "Proctored certification exams",
    },
    {
      name: "Edupie",
      href: "/edupie",
      icon: BookOpenCheck,
      description: "Learning paths & course recommendations",
    },
  ];

  const displayName = user?.fullName || user?.username || "User Account";
  const email = user?.email || "";
  const firstLetter = (displayName || email || "U").charAt(0).toUpperCase();
  const avatarUrl = user?.avatarUrl || user?.avatar;

  const sidebarContent = (
    <div
      className={`flex flex-col h-full bg-surface border-r border-border select-none shadow-sm transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64 lg:w-60"
      }`}
    >
      {/* Sidebar Header with Brand Logo & Open/Minimize Toggle Button */}
      <div
        className={`p-4 border-b border-border flex items-center ${
          isCollapsed ? "justify-center flex-col gap-3 py-4" : "justify-between"
        }`}
      >
        {isCollapsed ? (
          <>
            <Link
              href="/"
              className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-glow hover:scale-105 transition"
              title="LetGetIn AI"
            >
              L
            </Link>
            <button
              onClick={toggleCollapsed}
              className="p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <PanelLeftOpen className="w-5 h-5 text-primary-glow" />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <Logo href="/" />
              {/* <span className="hidden xl:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary-glow bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 shrink-0">
                Pro v2.0
              </span> */}
            </div>

            <div className="flex items-center gap-1">
              {/* Open / Collapse Minimize Toggle Button for Desktop */}
              <button
                onClick={toggleCollapsed}
                className="hidden lg:flex p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                title="Minimize Sidebar (Icons only)"
                aria-label="Minimize Sidebar"
              >
                <PanelLeftClose className="w-5 h-5 text-ink-soft hover:text-primary-glow" />
              </button>

              {/* Close Drawer Button for Mobile */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="lg:hidden p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                  aria-label="Close Sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Main Workspace Navigation Section */}
      <div
        className={`flex-1 overflow-y-auto ${
          isCollapsed ? "p-2 space-y-3" : "p-4 space-y-6"
        } scrollbar-thin`}
      >
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
              Workspace
            </div>
          )}
          <nav className={isCollapsed ? "space-y-2" : "space-y-1.5"}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              if (isCollapsed) {
                return (
                  <div
                    key={item.href}
                    className="relative group flex justify-center"
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-gradient-brand text-primary-foreground shadow-glow font-bold"
                          : "text-ink-soft hover:text-ink hover:bg-surface-alt/70"
                      }`}
                      aria-label={item.name}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive
                            ? "text-primary-foreground"
                            : "text-primary-glow"
                        }`}
                      />
                    </Link>

                    {/* Floating Tooltip when collapsed */}
                    <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-800">
                      {item.name}
                    </div>
                  </div>
                );
              }

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
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Profile Mini Footer */}
      <div
        className={`border-t border-border bg-surface-alt/40 ${
          isCollapsed ? "p-3 flex flex-col items-center gap-3" : "p-4"
        }`}
      >
        {isCollapsed ? (
          <div className="relative group flex flex-col items-center gap-2">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-10 h-10 rounded-2xl object-cover ring-1 ring-border shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-brand text-primary-foreground font-bold text-xs flex items-center justify-center shadow-glow shrink-0">
                {firstLetter}
              </div>
            )}

            <button
              onClick={() => logout()}
              className="text-ink-soft hover:text-destructive p-2 rounded-xl hover:bg-surface transition-colors shrink-0 cursor-pointer"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Tooltip on profile when collapsed */}
            <div className="absolute left-full ml-3.5 bottom-0 px-3 py-2 bg-slate-900 text-white text-xs rounded-xl shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-800">
              <div className="font-bold">{displayName}</div>
              <div className="text-[10px] text-slate-400">{email}</div>
            </div>
          </div>
        ) : (
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
                <div className="text-xs font-bold text-ink truncate">
                  {displayName}
                </div>
                <div className="text-[10px] text-ink-soft truncate">
                  {email}
                </div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="text-ink-soft hover:text-destructive p-2 rounded-xl hover:bg-surface transition-colors shrink-0 cursor-pointer"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:block sticky top-0 h-screen shrink-0 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64 lg:w-72"
        }`}
      >
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
