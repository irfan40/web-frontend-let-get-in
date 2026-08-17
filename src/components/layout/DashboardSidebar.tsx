"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/landing/Logo";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { StorageProviderFactory } from "@/features/resume/storage/factory";
import {
  Sparkles,
  LogOut,
  X,
  ChevronRight,
  ChevronDown,
  Compass,
  User,
  HardDrive,
  LayoutGrid,
  BrainCircuit,
  GraduationCap,
  BookOpenCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Network,
  Users,
  Store,
  Rocket,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

interface SubNavItem {
  name: string;
  shortName: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
}

interface NavItem {
  name: string;
  shortName: string;
  href: string;
  icon: LucideIcon;
  description: string;
  children?: SubNavItem[];
}

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCreateNew?: () => void;
}

export function DashboardSidebar({
  isOpen = false,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasResumes, setHasResumes] = useState<boolean | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {},
  );

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

  const navItems: NavItem[] = [
    {
      name: "AI Apply",
      shortName: "AI Apply",
      href: "/ai-apply",
      icon: Rocket,
      description: "Configure preferences and auto-apply to matching jobs",
    },
    // Show AI Onboarding only if user has 0 resumes (new user first time)
    ...(hasResumes === false
      ? [
          {
            name: "AI Onboarding",
            shortName: "Onboard",
            href: "/demo",
            icon: Sparkles,
            description: "Smart career onboarding suite",
          },
        ]
      : []),
    {
      name: "Explore Opportunities",
      shortName: "Explore",
      href: "/explore",
      icon: Compass,
      description: "Explore matched job opportunities",
    },
    {
      name: "My Jobs",
      shortName: "Jobs",
      href: "/resume",
      icon: Briefcase,
      description: "Jobs, resumes, cover letters & video profile",
    },
    {
      name: "My Profile",
      shortName: "Profile",
      href: "/profile",
      icon: User,
      description: "Manage your professional identity",
    },
    {
      name: "My Drive",
      shortName: "Drive",
      href: "/drive",
      icon: HardDrive,
      description: "Cloud resume & asset storage",
    },
    {
      name: "My Network",
      shortName: "Network",
      href: "/network",
      icon: Network,
      description: "Professional networking & connections",
    },
    {
      name: "My Hub",
      shortName: "Hub",
      href: "/myhub",
      icon: LayoutGrid,
      description: "Command center for all your activities",
    },
    {
      name: "My Team",
      shortName: "Team",
      href: "/team",
      icon: Users,
      description: "Collaborate with your team & colleagues",
    },
    {
      name: "Genius Test",
      shortName: "G-Test",
      href: "/geniustest",
      icon: BrainCircuit,
      description: "Adaptive AI skill assessments",
    },
    {
      name: "Skill Enhancement",
      shortName: "Skills",
      href: "/edupie",
      icon: BookOpenCheck,
      description: "AI learning paths & certifications",
    },
    {
      name: "App Market",
      shortName: "Market",
      href: "/market",
      icon: Store,
      description: "Discover & integrate third-party apps",
    },
  ];

  // Auto-expand menus that contain the currently active route
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) =>
            pathname === child.href || pathname.startsWith(child.href + "/"),
        );
        const isParentActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        if (isChildActive || isParentActive) {
          setExpandedMenus((prev) => ({ ...prev, [item.name]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const displayName = user?.fullName || user?.username || "User Account";
  const firstName = displayName.split(" ")[0] || "Account";
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
          isCollapsed
            ? "justify-center flex-col gap-2.5 py-4"
            : "justify-between"
        }`}
      >
        {isCollapsed ? (
          <>
            <Link
              href="/"
              className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-glow hover:scale-105 transition shrink-0"
              title="LetGetIn AI"
            >
              L
            </Link>
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-xl text-ink-soft hover:text-primary-glow hover:bg-surface-alt transition cursor-pointer"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4 text-primary-glow" />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <Logo href="/" />
            </div>

            <div className="flex items-center gap-1">
              {/* Open / Collapse Minimize Toggle Button for Desktop */}
              <button
                onClick={toggleCollapsed}
                className="hidden lg:flex p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                title="Minimize Sidebar (Icons with labels)"
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
          isCollapsed ? "p-2 space-y-2" : "p-3 space-y-5"
        } scrollbar-thin`}
      >
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
              Workspace
            </div>
          )}

          <nav className={isCollapsed ? "space-y-1.5" : "space-y-1"}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isDirectActive = pathname === item.href;
              const hasActiveChild =
                item.children?.some(
                  (child) =>
                    pathname === child.href ||
                    pathname.startsWith(child.href + "/"),
                ) ?? false;
              const isItemActive = isDirectActive || hasActiveChild;

              // ==========================================
              // MINI SIDEBAR VIEW (Collapsed with Labels Under Icons)
              // ==========================================
              if (isCollapsed) {
                return (
                  <div
                    key={item.name}
                    className="relative group flex justify-center w-full"
                  >
                    <Link
                      href={item.children ? item.children[0].href : item.href}
                      onClick={onClose}
                      className={`w-[68px] py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all group/item ${
                        isItemActive
                          ? "bg-gradient-brand text-primary-foreground shadow-glow font-bold"
                          : "text-ink-soft hover:text-ink hover:bg-surface-alt/70"
                      }`}
                      aria-label={item.name}
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-transform group-hover/item:scale-110 ${
                          isItemActive
                            ? "text-primary-foreground"
                            : "text-primary-glow"
                        }`}
                      />
                      {/* Name shown underneath the icon */}
                      <span
                        className={`text-[9.5px] font-semibold tracking-tight text-center truncate max-w-[62px] leading-none mt-1.5 ${
                          isItemActive
                            ? "text-primary-foreground"
                            : "text-ink-soft group-hover/item:text-ink"
                        }`}
                      >
                        {item.shortName}
                      </span>
                    </Link>

                    {/* Floating Flyout/Tooltip in Mini Mode */}
                    {item.children ? (
                      <div className="absolute left-full ml-3 top-0 w-52 p-2 bg-surface dark:bg-slate-900 border border-border dark:border-slate-800 rounded-2xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 animate-in fade-in duration-150">
                        <div className="px-2.5 py-1.5 border-b border-border/50 text-[10px] font-extrabold uppercase tracking-wider text-primary-glow flex items-center justify-between">
                          <span>{item.name}</span>
                          <span className="text-[9px] bg-primary/10 text-primary-glow px-1.5 py-0.2 rounded-md">
                            {item.children.length}
                          </span>
                        </div>
                        <div className="mt-1.5 space-y-1">
                          {item.children.map((child) => {
                            const isChildActive = pathname === child.href;
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={onClose}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                                  isChildActive
                                    ? "bg-gradient-brand text-primary-foreground shadow-glow font-bold"
                                    : "text-ink-soft hover:text-ink hover:bg-surface-alt"
                                }`}
                              >
                                <ChildIcon
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isChildActive
                                      ? "text-primary-foreground"
                                      : "text-primary-glow"
                                  }`}
                                />
                                <span className="truncate flex-1">
                                  {child.name}
                                </span>
                                {child.badge && !isChildActive && (
                                  <span className="text-[9px] font-bold text-primary-glow bg-primary/10 px-1.5 py-0.5 rounded-full">
                                    {child.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-800">
                        <div>{item.name}</div>
                        {item.description && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            {item.description}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              // ==========================================
              // FULL SIDEBAR VIEW (Expandable items)
              // ==========================================
              if (item.children) {
                const isExpanded = expandedMenus[item.name] ?? hasActiveChild;

                return (
                  <div key={item.name} className="space-y-1">
                    <div
                      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer select-none ${
                        isItemActive
                          ? "bg-surface-alt text-ink border border-primary/20 shadow-xs"
                          : "text-ink-soft hover:text-ink hover:bg-surface-alt/70"
                      }`}
                      onClick={() => toggleSubmenu(item.name)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isItemActive
                              ? "text-primary-glow"
                              : "text-ink-soft group-hover:text-primary-glow"
                          }`}
                        />
                        <div className="truncate font-semibold">
                          {item.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-ink-soft transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-primary-glow" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Submenu items */}
                    {isExpanded && (
                      <div className="pl-4 ml-3 border-l-2 border-primary/20 space-y-1 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.href;
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onClose}
                              className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                                isChildActive
                                  ? "bg-gradient-brand text-primary-foreground font-bold shadow-glow"
                                  : "text-ink-soft hover:text-ink hover:bg-surface-alt/80"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <ChildIcon
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isChildActive
                                      ? "text-primary-foreground"
                                      : "text-primary-glow"
                                  }`}
                                />
                                <span className="truncate">{child.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {child.badge && !isChildActive && (
                                  <span className="text-[9px] font-bold text-primary-glow bg-primary/10 px-1.5 py-0.5 rounded-full">
                                    {child.badge}
                                  </span>
                                )}
                                {isChildActive && (
                                  <ChevronRight className="w-3 h-3 opacity-90 shrink-0" />
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Standard Single Item
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isItemActive
                      ? "bg-gradient-brand text-primary-foreground shadow-glow font-bold"
                      : "text-ink-soft hover:text-ink hover:bg-surface-alt/70"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isItemActive
                        ? "text-primary-foreground"
                        : "text-primary-glow"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{item.name}</div>
                    {!isItemActive && (
                      <div className="text-[10px] text-ink-soft/70 truncate group-hover:text-ink-soft transition">
                        {item.description}
                      </div>
                    )}
                  </div>
                  {isItemActive && (
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
          isCollapsed ? "p-2 flex flex-col items-center gap-2" : "p-3.5"
        }`}
      >
        {isCollapsed ? (
          <div className="relative group flex flex-col items-center gap-1 w-full">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-9 h-9 rounded-2xl object-cover ring-1 ring-border shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-2xl bg-gradient-brand text-primary-foreground font-bold text-xs flex items-center justify-center shadow-glow shrink-0">
                {firstLetter}
              </div>
            )}
            <span className="text-[9.5px] font-semibold text-ink-soft text-center truncate max-w-[58px] leading-tight">
              {firstName}
            </span>

            <button
              onClick={() => logout()}
              className="text-ink-soft hover:text-destructive p-1.5 rounded-xl hover:bg-surface transition-colors shrink-0 cursor-pointer mt-0.5"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

            {/* Tooltip on profile when collapsed */}
            <div className="absolute left-full ml-3.5 bottom-0 px-3 py-2 bg-slate-900 text-white text-xs rounded-xl shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-800">
              <div className="font-bold">{displayName}</div>
              <div className="text-[10px] text-slate-400">{email}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-border shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-brand text-primary-foreground font-bold text-xs flex items-center justify-center shadow-glow shrink-0">
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
              className="text-ink-soft hover:text-destructive p-1.5 rounded-xl hover:bg-surface transition-colors shrink-0 cursor-pointer"
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
          isCollapsed ? "w-20" : "w-64 lg:w-60"
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
