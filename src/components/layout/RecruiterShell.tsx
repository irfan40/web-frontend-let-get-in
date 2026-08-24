"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/landing/Logo";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useRecruiterStore } from "@/features/recruiter/store/useRecruiterStore";
import {
  LogOut,
  X,
  LayoutGrid,
  PlusCircle,
  KanbanSquare,
  Search,
  Users,
  ListChecks,
  Mic,
  ClipboardCheck,
  GraduationCap,
  Hourglass,
  IdCard,
  Wallet,
  TrendingUp,
  Award,
  Building2,
  Rocket,
  Sparkles,
  Contact,
  Briefcase,
  CheckCircle2,
  CalendarDays,
  BarChart3,
  Gavel,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  ChevronRight,
  ShieldCheck,
  ArrowLeftRight,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  name: string;
  shortName: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  soon?: boolean;
}

const TOP_ITEMS: NavItem[] = [
  {
    name: "AI Hire",
    shortName: "AI Hire",
    href: "/recruiter/ai-hire",
    icon: Sparkles,
    description: "Autonomous AI sourcing & screening engine",
  },
  {
    name: "Profile",
    shortName: "Profile",
    href: "/recruiter/profile",
    icon: Contact,
    description: "Organization profile, team & settings",
  },
];

const HIRING_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    shortName: "Dashboard",
    href: "/recruiter/dashboard",
    icon: LayoutGrid,
    description: "Recruiter command center & key metrics",
  },
  {
    name: "Create Job",
    shortName: "Post Job",
    href: "/recruiter/jobs/create",
    icon: PlusCircle,
    description: "Create and publish new job postings",
  },
  {
    name: "Jobs",
    shortName: "Jobs",
    href: "/recruiter/jobs",
    icon: KanbanSquare,
    description: "Manage active and draft listings",
  },
  {
    name: "CV Search",
    shortName: "CV Search",
    href: "/recruiter/cv-search",
    icon: Search,
    description: "Search talent pool & resume database",
  },
  {
    name: "Candidates",
    shortName: "Talent",
    href: "/recruiter/candidates",
    icon: Users,
    description: "Candidate pipeline & talent evaluation",
  },
  {
    name: "Track Applicants",
    shortName: "Track",
    href: "/recruiter/track",
    icon: ListChecks,
    description: "Real-time applicant tracking & status",
  },
];

const WORKFORCE_ITEMS: NavItem[] = [
  {
    name: "Interviews",
    shortName: "Interviews",
    href: "/recruiter/interviews",
    icon: Mic,
    soon: true,
    description: "AI & live interview scheduling",
  },
  {
    name: "Final List",
    shortName: "Final List",
    href: "/recruiter/final-list",
    icon: ClipboardCheck,
    soon: true,
    description: "Offer stage & selection outcomes",
  },
  {
    name: "Training",
    shortName: "Training",
    href: "/recruiter/training",
    icon: GraduationCap,
    soon: true,
    description: "Onboarding & talent development",
  },
  {
    name: "Probation",
    shortName: "Probation",
    href: "/recruiter/probation",
    icon: Hourglass,
    soon: true,
    description: "Probation tracking & milestones",
  },
  {
    name: "Employee Details",
    shortName: "Employees",
    href: "/recruiter/employee-details",
    icon: IdCard,
    soon: true,
    description: "Workforce directory & profiles",
  },
  {
    name: "Payroll",
    shortName: "Payroll",
    href: "/recruiter/payroll",
    icon: Wallet,
    soon: true,
    description: "Salary structures & payroll records",
  },
  {
    name: "Performance",
    shortName: "Reviews",
    href: "/recruiter/performance",
    icon: TrendingUp,
    soon: true,
    description: "Performance appraisals & KPIs",
  },
  {
    name: "Promotions",
    shortName: "Promote",
    href: "/recruiter/promotions",
    icon: Award,
    soon: true,
    description: "Career tracks & promotion engine",
  },
];

const INSTITUTION_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    shortName: "Dashboard",
    href: "/recruiter/dashboard",
    icon: LayoutGrid,
    description: "Campus recruitment & placement metrics",
  },
  {
    name: "Students",
    shortName: "Students",
    href: "/recruiter/institution/students",
    icon: Users,
    description: "Student directory & verified resumes",
  },
  {
    name: "Recruiters",
    shortName: "Recruiters",
    href: "/recruiter/institution/recruiters",
    icon: Building2,
    description: "Partner corporate relations",
  },
  {
    name: "Jobs",
    shortName: "Jobs",
    href: "/recruiter/institution/jobs",
    icon: Briefcase,
    description: "Campus drive job postings",
  },
  {
    name: "Placements",
    shortName: "Placements",
    href: "/recruiter/institution/placements",
    icon: CheckCircle2,
    description: "Placed students & offer letter tracking",
  },
  {
    name: "Pipeline",
    shortName: "Pipeline",
    href: "/recruiter/institution/pipeline",
    icon: KanbanSquare,
    description: "Campus drive hiring pipeline",
  },
  {
    name: "Calendar",
    shortName: "Calendar",
    href: "/recruiter/institution/calendar",
    icon: CalendarDays,
    description: "Placement season schedule & dates",
  },
  {
    name: "Tasks",
    shortName: "Tasks",
    href: "/recruiter/institution/tasks",
    icon: ListChecks,
    description: "Placement officer & student tasks",
  },
  {
    name: "Reports",
    shortName: "Reports",
    href: "/recruiter/institution/reports",
    icon: BarChart3,
    description: "Analytics & accreditation reports",
  },
  {
    name: "Training",
    shortName: "Training",
    href: "/recruiter/institution/training",
    icon: GraduationCap,
    description: "Placement readiness & mock tests",
  },
  {
    name: "Policy Engine",
    shortName: "Policies",
    href: "/recruiter/institution/policy",
    icon: Gavel,
    description: "Eligibility criteria & placement rules",
  },
];

const ENTITY_ICON: Record<string, LucideIcon> = {
  company: Building2,
  institution: GraduationCap,
  startup: Rocket,
};

interface RecruiterShellProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function resolveActiveHref(
  pathname: string,
  allItems: NavItem[],
): string | null {
  let best: string | null = null;
  for (const item of allItems) {
    const matches =
      pathname === item.href || pathname.startsWith(item.href + "/");
    if (matches && (!best || item.href.length > best.length)) {
      best = item.href;
    }
  }
  return best;
}

export function RecruiterShell({
  isOpen = false,
  onClose,
}: RecruiterShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { orgProfile, loadOrgProfile } = useRecruiterStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load collapsed preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recruiter_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  // Click outside to close profile popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    loadOrgProfile().catch(() => {});
  }, [loadOrgProfile]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("recruiter_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    if (onClose) onClose();
    await logout();
    router.push("/auth");
  };

  const displayName = user?.fullName || user?.username || "Recruiter Account";
  const firstName = displayName.split(" ")[0] || "Recruiter";
  const email = user?.email || "";
  const firstLetter = (displayName || email || "R").charAt(0).toUpperCase();
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const EntityIcon = orgProfile
    ? ENTITY_ICON[orgProfile.entity] || Building2
    : Building2;
  const isInstitution = orgProfile?.entity === "institution";

  const allItems = [
    ...TOP_ITEMS,
    ...(isInstitution
      ? INSTITUTION_ITEMS
      : [...HIRING_ITEMS, ...WORKFORCE_ITEMS]),
  ];
  const activeHref = resolveActiveHref(pathname, allItems);

  // Renders a navigation group in full or mini mode
  const renderNavGroup = (title: string, items: NavItem[]) => {
    if (isCollapsed) {
      return (
        <div className="space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === activeHref;
            return (
              <div
                key={item.href}
                className="relative group flex justify-center w-full"
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`w-[68px] py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all group/item ${
                    isActive
                      ? "bg-gradient-brand text-primary-foreground shadow-glow font-bold"
                      : "text-ink-soft hover:text-ink hover:bg-surface-alt/70"
                  }`}
                  aria-label={item.name}
                >
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform group-hover/item:scale-110 ${
                        isActive
                          ? "text-primary-foreground"
                          : "text-primary-glow"
                      }`}
                    />
                    {item.soon && !isActive && (
                      <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <span
                    className={`text-[9.5px] font-semibold tracking-tight text-center truncate max-w-[62px] leading-none mt-1.5 ${
                      isActive
                        ? "text-primary-foreground"
                        : "text-ink-soft group-hover/item:text-ink"
                    }`}
                  >
                    {item.shortName}
                  </span>
                </Link>

                {/* Floating Tooltip / Flyout in Mini Mode */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
                  <div className="flex items-center gap-2">
                    <span>{item.name}</span>
                    {item.soon && (
                      <span className="text-[9px] font-bold text-primary-glow bg-primary/20 px-1.5 py-0.5 rounded-full">
                        Soon
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <div className="text-[10px] text-slate-300 font-normal mt-0.5 max-w-[200px] whitespace-normal">
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Full Expanded View
    return (
      <div>
        {title && (
          <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">
            {title}
          </div>
        )}
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
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
                  {!isActive && item.description && (
                    <div className="text-[10px] text-ink-soft/70 truncate group-hover:text-ink-soft transition">
                      {item.description}
                    </div>
                  )}
                </div>
                {item.soon && !isActive && (
                  <span className="text-[9px] font-bold text-primary-glow bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">
                    Soon
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    );
  };

  const sidebarContent = (
    <div
      className={`flex flex-col h-full bg-surface border-r border-border select-none shadow-sm transition-all duration-300 ease-in-out relative ${
        isCollapsed ? "w-20" : "w-64 lg:w-60"
      }`}
    >
      {/* Sidebar Header with Brand Logo & Minimize Toggle Button */}
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
              href="/recruiter/dashboard"
              className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center text-primary-foreground font-extrabold text-base shadow-glow hover:scale-105 transition shrink-0"
              title="LetGetIn Recruiter"
            >
              L
            </Link>
            <button
              type="button"
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
              <Logo href="/recruiter/dashboard" />
            </div>

            <div className="flex items-center gap-1">
              {/* Minimize Sidebar Button for Desktop */}
              <button
                type="button"
                onClick={toggleCollapsed}
                className="hidden lg:flex p-2 rounded-xl text-ink-soft hover:text-ink hover:bg-surface-alt transition cursor-pointer"
                title="Minimize Sidebar"
                aria-label="Minimize Sidebar"
              >
                <PanelLeftClose className="w-5 h-5 text-ink-soft hover:text-primary-glow" />
              </button>

              {/* Close Drawer Button for Mobile */}
              {onClose && (
                <button
                  type="button"
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

      {/* Organization Identity Card */}
      {isCollapsed ? (
        <div className="p-2 border-b border-border flex justify-center">
          <div className="relative group">
            <Link
              href="/recruiter/profile"
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-glow hover:scale-105 transition shrink-0"
            >
              <EntityIcon className="w-4 h-4" />
            </Link>
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
              <div className="font-bold">
                {orgProfile?.name || "Organization Profile"}
              </div>
              <div className="text-[10px] text-slate-300 capitalize">
                {orgProfile?.entity || user?.entityType || "Recruiter"}{" "}
                Workspace
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Link
          href="/recruiter/profile"
          onClick={onClose}
          className="mx-3 my-2.5 px-3 py-2.5 rounded-2xl border border-border/80 bg-surface-alt/50 hover:bg-surface-alt transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-glow shrink-0 group-hover:scale-105 transition-transform">
              <EntityIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-ink truncate group-hover:text-primary-glow transition-colors">
                {orgProfile?.name || "Setup Organization"}
              </div>
              <div className="text-[10px] text-ink-soft capitalize flex items-center gap-1">
                <span>
                  {orgProfile?.entity || user?.entityType || "Recruiter"}
                </span>
                <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
                <span className="text-emerald-500 font-medium">Pro</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-ink-soft group-hover:text-primary-glow group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      )}

      {/* Main Navigation Scroll Area */}
      <div
        className={`flex-1 overflow-y-auto ${
          isCollapsed ? "p-2 space-y-3" : "p-3 space-y-5"
        } scrollbar-thin`}
      >
        {renderNavGroup("", TOP_ITEMS)}
        {isInstitution ? (
          renderNavGroup("Placement Suite", INSTITUTION_ITEMS)
        ) : (
          <>
            {renderNavGroup("Hiring Suite", HIRING_ITEMS)}
            {renderNavGroup("Workforce", WORKFORCE_ITEMS)}
          </>
        )}
      </div>

      {/* User Profile SaaS Footer Trigger & Popover Box */}
      <div
        ref={profileRef}
        className={`border-t border-border bg-surface-alt/40 relative ${
          isCollapsed ? "p-2 flex flex-col items-center" : "p-2.5"
        }`}
      >
        {/* Profile Card Trigger Button */}
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1 w-full">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="relative p-0.5 rounded-2xl hover:ring-2 hover:ring-primary-glow/50 transition-all cursor-pointer group"
              aria-label="Open User Profile Menu"
            >
              {avatarUrl ? (
                <div className="w-10 h-10 rounded-2xl overflow-hidden ring-1 ring-border shadow-sm shrink-0">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-brand text-primary-foreground font-extrabold text-sm flex items-center justify-center shadow-glow shrink-0 group-hover:scale-105 transition-transform">
                  {firstLetter}
                </div>
              )}
              {/* Online Indicator */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
            </button>
            <span className="text-[9.5px] font-semibold text-ink-soft text-center truncate max-w-[58px] leading-tight">
              {firstName}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-surface-alt transition-all group/profile cursor-pointer border border-transparent hover:border-border/60 text-left"
            aria-label="Open User Profile Menu"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-border shadow-xs">
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-brand text-primary-foreground font-extrabold text-xs flex items-center justify-center shadow-glow group-hover/profile:scale-105 transition-transform">
                    {firstLetter}
                  </div>
                )}
                {/* Online Indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-ink truncate group-hover/profile:text-primary-glow transition-colors">
                  {displayName}
                </div>
                <div className="text-[10px] text-ink-soft truncate">
                  {email}
                </div>
              </div>
            </div>
            <ChevronsUpDown
              className={`w-4 h-4 text-ink-soft transition-transform duration-200 shrink-0 ${
                isProfileOpen
                  ? "rotate-180 text-primary-glow"
                  : "group-hover/profile:text-ink"
              }`}
            />
          </button>
        )}

        {/* ======================================================== */}
        {/* SAAS USER PROFILE MODAL / POPOVER BOX                    */}
        {/* ======================================================== */}
        {isProfileOpen && (
          <div
            className={`absolute z-50 bg-surface border border-border rounded-3xl shadow-2xl p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-150 ${
              isCollapsed
                ? "left-[calc(100%+12px)] bottom-2 w-72"
                : "bottom-[calc(100%+8px)] left-2 right-2 w-[calc(100%-16px)] sm:w-72"
            }`}
          >
            {/* User Identity Header */}
            <div className="flex items-start gap-3 pb-3 border-b border-border">
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-primary-glow/30 shadow-md">
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-brand text-primary-foreground font-extrabold text-base flex items-center justify-center shadow-glow">
                    {firstLetter}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-surface" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-extrabold text-ink truncate">
                  {displayName}
                </h4>
                <p className="text-[11px] text-ink-soft truncate">{email}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-primary-glow bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-2.5 h-2.5 text-primary-glow" />
                    {isInstitution ? "Institution" : "Recruiter Pro"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Organization Snapshot */}
            <div className="bg-surface-alt/70 border border-border/80 rounded-2xl p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-brand text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                  <EntityIcon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-ink truncate">
                    {orgProfile?.name || "Organization Hub"}
                  </div>
                  <div className="text-[9.5px] text-ink-soft capitalize">
                    {orgProfile?.entity || user?.entityType || "Recruiter"}{" "}
                    Workspace
                  </div>
                </div>
              </div>
              <Link
                href="/recruiter/profile"
                onClick={() => {
                  setIsProfileOpen(false);
                  if (onClose) onClose();
                }}
                className="text-[10px] font-bold text-primary-glow hover:underline shrink-0 px-2 py-1 bg-primary/10 rounded-lg"
              >
                Settings
              </Link>
            </div>

            {/* Quick SaaS Menu Actions */}
            <div className="space-y-1 pt-1">
              <Link
                href="/recruiter/profile"
                onClick={() => {
                  setIsProfileOpen(false);
                  if (onClose) onClose();
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-ink hover:text-primary-glow hover:bg-surface-alt transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-primary-glow" />
                  <span>Account & Company Profile</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-ink-soft opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/recruiter/ai-hire"
                onClick={() => {
                  setIsProfileOpen(false);
                  if (onClose) onClose();
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-ink hover:text-primary-glow hover:bg-surface-alt transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-primary-glow" />
                  <span>AI Hire Suite</span>
                </div>
                <span className="text-[9px] font-bold text-primary-glow bg-primary/10 px-1.5 py-0.5 rounded-full">
                  AI
                </span>
              </Link>
            </div>

            {/* Divider */}
            <div className="border-t border-border pt-1" />

            {/* Logout Action */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 border border-destructive/20 hover:border-destructive/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Sign Out</span>
              </div>
              <span className="text-[10px] text-destructive/70 font-semibold bg-destructive/10 px-1.5 py-0.5 rounded-md">
                Log Out
              </span>
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

      {/* Mobile Sidebar Drawer */}
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
