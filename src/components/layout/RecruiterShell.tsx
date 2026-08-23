"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  soon?: boolean;
}

const TOP_ITEMS: NavItem[] = [
  { name: "AI Hire", href: "/recruiter/ai-hire", icon: Sparkles },
  { name: "Profile", href: "/recruiter/profile", icon: Contact },
];

const HIRING_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/recruiter/dashboard", icon: LayoutGrid },
  { name: "Create Job", href: "/recruiter/jobs/create", icon: PlusCircle },
  { name: "Jobs", href: "/recruiter/jobs", icon: KanbanSquare },
  { name: "CV Search", href: "/recruiter/cv-search", icon: Search },
  { name: "Candidates", href: "/recruiter/candidates", icon: Users },
  { name: "Track Applicants", href: "/recruiter/track", icon: ListChecks },
];

const WORKFORCE_ITEMS: NavItem[] = [
  { name: "Interviews", href: "/recruiter/interviews", icon: Mic, soon: true },
  { name: "Final List", href: "/recruiter/final-list", icon: ClipboardCheck, soon: true },
  { name: "Training", href: "/recruiter/training", icon: GraduationCap, soon: true },
  { name: "Probation", href: "/recruiter/probation", icon: Hourglass, soon: true },
  { name: "Employee Details", href: "/recruiter/employee-details", icon: IdCard, soon: true },
  { name: "Payroll", href: "/recruiter/payroll", icon: Wallet, soon: true },
  { name: "Performance", href: "/recruiter/performance", icon: TrendingUp, soon: true },
  { name: "Promotions", href: "/recruiter/promotions", icon: Award, soon: true },
];

const INSTITUTION_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/recruiter/dashboard", icon: LayoutGrid },
  { name: "Students", href: "/recruiter/institution/students", icon: Users },
  { name: "Recruiters", href: "/recruiter/institution/recruiters", icon: Building2 },
  { name: "Jobs", href: "/recruiter/institution/jobs", icon: Briefcase },
  { name: "Placements", href: "/recruiter/institution/placements", icon: CheckCircle2 },
  { name: "Pipeline", href: "/recruiter/institution/pipeline", icon: KanbanSquare },
  { name: "Calendar", href: "/recruiter/institution/calendar", icon: CalendarDays },
  { name: "Tasks", href: "/recruiter/institution/tasks", icon: ListChecks },
  { name: "Reports", href: "/recruiter/institution/reports", icon: BarChart3 },
  { name: "Training", href: "/recruiter/institution/training", icon: GraduationCap },
  { name: "Policy Engine", href: "/recruiter/institution/policy", icon: Gavel },
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

/**
 * Resolves which single nav item is "active" for a pathname, across the FULL combined item
 * list. Using each item's href in isolation (exact match OR prefix match) breaks when one
 * item's href is itself a path segment of another's (e.g. "/recruiter/jobs" vs
 * "/recruiter/jobs/create") — both would match a prefix check independently. Instead we pick
 * the single longest href that exactly matches or is a parent of the pathname, so a sibling
 * page like "/create" never lights up its shorter-prefix neighbor.
 */
function resolveActiveHref(pathname: string, allItems: NavItem[]): string | null {
  let best: string | null = null;
  for (const item of allItems) {
    const matches = pathname === item.href || pathname.startsWith(item.href + "/");
    if (matches && (!best || item.href.length > best.length)) {
      best = item.href;
    }
  }
  return best;
}

function NavSection({
  title,
  items,
  activeHref,
  onClose,
}: {
  title: string;
  items: NavItem[];
  activeHref: string | null;
  onClose?: () => void;
}) {
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
              <div className="flex-1 min-w-0 truncate">{item.name}</div>
              {item.soon && !isActive && (
                <span className="text-[9px] font-bold text-primary-glow bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function RecruiterShell({ isOpen = false, onClose }: RecruiterShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { orgProfile, loadOrgProfile } = useRecruiterStore();

  useEffect(() => {
    loadOrgProfile().catch(() => {});
  }, [loadOrgProfile]);

  const displayName = user?.fullName || user?.username || "Recruiter Account";
  const email = user?.email || "";
  const firstLetter = (displayName || email || "R").charAt(0).toUpperCase();
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const EntityIcon = orgProfile ? ENTITY_ICON[orgProfile.entity] || Building2 : Building2;
  const isInstitution = orgProfile?.entity === "institution";
  const activeHref = resolveActiveHref(pathname, [
    ...TOP_ITEMS,
    ...HIRING_ITEMS,
    ...WORKFORCE_ITEMS,
    ...INSTITUTION_ITEMS,
  ]);

  const sidebarContent = (
    <div className="flex flex-col h-full w-64 lg:w-60 bg-surface border-r border-border select-none shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Logo href="/recruiter/dashboard" />
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

      {/* Org identity strip */}
      <div className="px-4 py-3 border-b border-border bg-surface-alt/40 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center shadow-glow shrink-0">
          <EntityIcon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-ink truncate">
            {orgProfile?.name || "Set up your organization"}
          </div>
          <div className="text-[10px] text-ink-soft capitalize">
            {orgProfile?.entity || user?.entityType || "recruiter"}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin">
        <NavSection title="" items={TOP_ITEMS} activeHref={activeHref} onClose={onClose} />
        {isInstitution ? (
          <NavSection title="Placement Suite" items={INSTITUTION_ITEMS} activeHref={activeHref} onClose={onClose} />
        ) : (
          <>
            <NavSection title="Hiring" items={HIRING_ITEMS} activeHref={activeHref} onClose={onClose} />
            <NavSection title="Workforce" items={WORKFORCE_ITEMS} activeHref={activeHref} onClose={onClose} />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-surface-alt/40 p-3.5">
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
              <div className="text-xs font-bold text-ink truncate">{displayName}</div>
              <div className="text-[10px] text-ink-soft truncate">{email}</div>
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
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block sticky top-0 h-screen shrink-0 z-30 w-64 lg:w-60">
        {sidebarContent}
      </aside>

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
