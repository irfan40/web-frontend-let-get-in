"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export interface TrackedJob {
  _id: string;
}

export interface KanbanColumnConfig {
  id: "saved" | "applied" | "interviewing" | "offered" | "rejected";
  title: string;
  icon: LucideIcon;
  accentClass: string;
  iconWrapClass: string;
  emptyTitle: string;
  emptyDescription: string;
}

interface KanbanColumnProps {
  config: KanbanColumnConfig;
  jobs: TrackedJob[];
}

export function KanbanColumn({ config, jobs }: KanbanColumnProps) {
  const Icon = config.icon;

  return (
    <div className="flex flex-col w-[280px] sm:w-full shrink-0 bg-surface-alt/40 border border-border rounded-2xl overflow-hidden">
      <div className={`h-1 w-full ${config.accentClass}`} />

      <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.iconWrapClass}`} />
          <h3 className="text-sm font-bold text-ink">{config.title}</h3>
        </div>
        <span className="text-[11px] font-bold text-ink-soft bg-surface border border-border rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5">
          {jobs.length}
        </span>
      </div>

      <div className="flex-1 px-4 pb-4">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-2.5 py-8">
            <div className="w-11 h-11 rounded-2xl bg-surface border border-border flex items-center justify-center text-ink-soft/70">
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-ink">{config.emptyTitle}</p>
            <p className="text-[11px] text-ink-soft leading-relaxed max-w-[200px]">{config.emptyDescription}</p>
          </div>
        ) : (
          <div className="space-y-3">{/* JobCard[] renders here once real application data is connected */}</div>
        )}
      </div>
    </div>
  );
}
