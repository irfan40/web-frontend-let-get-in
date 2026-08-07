import React from "react";
import { HardDrive, AlertTriangle, FileText, Image as ImageIcon, FileArchive, File, CheckCircle2 } from "lucide-react";
import { StorageStats, DriveCategory } from "../services/driveService";

interface StorageQuotaBarProps {
  stats: StorageStats | null;
  onUploadClick: () => void;
}

export const StorageQuotaBar: React.FC<StorageQuotaBarProps> = ({ stats, onUploadClick }) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0.0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 0.1) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const totalLimitMb = 50; // 50 MB
  const usedBytes = stats?.usedBytes || 0;
  const usedMb = usedBytes / (1024 * 1024);
  const remainingMb = Math.max(0, totalLimitMb - usedMb);
  const percentage = stats?.usedPercentage ?? Number(((usedMb / totalLimitMb) * 100).toFixed(1));

  const isWarning = percentage >= 80 && percentage < 95;
  const isDanger = percentage >= 95;

  const categoryIcons: Record<DriveCategory, React.ElementType> = {
    pdf: FileText,
    image: ImageIcon,
    document: FileText,
    archive: FileArchive,
    audio: File,
    video: File,
    other: File,
  };

  const categoryColors: Record<DriveCategory, string> = {
    pdf: "bg-rose-500 text-rose-500 border-rose-500/30",
    image: "bg-sky-500 text-sky-500 border-sky-500/30",
    document: "bg-emerald-500 text-emerald-500 border-emerald-500/30",
    archive: "bg-amber-500 text-amber-500 border-amber-500/30",
    audio: "bg-purple-500 text-purple-500 border-purple-500/30",
    video: "bg-violet-500 text-violet-500 border-violet-500/30",
    other: "bg-slate-500 text-slate-500 border-slate-500/30",
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary-glow flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-ink text-base">Cloud Drive Storage</h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary-glow border border-primary/20">
                50 MB Free Limit
              </span>
            </div>
            <p className="text-xs text-ink-soft">
              {stats?.fileCount ?? 0} {stats?.fileCount === 1 ? "file" : "files"} stored • {remainingMb.toFixed(1)} MB available
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onUploadClick}
          disabled={isDanger}
          className="inline-flex items-center justify-center gap-2 bg-gradient-brand text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HardDrive className="w-4 h-4" />
          <span>Upload Files</span>
        </button>
      </div>

      {/* Progress Bar Container */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-ink">
            {formatBytes(usedBytes)} <span className="text-ink-soft font-normal">of 50.0 MB used</span>
          </span>
          <span
            className={`font-bold ${
              isDanger ? "text-rose-500" : isWarning ? "text-amber-500" : "text-emerald-500"
            }`}
          >
            {percentage}%
          </span>
        </div>

        {/* Outer bar */}
        <div className="h-3 w-full bg-secondary/80 rounded-full overflow-hidden p-0.5 border border-border">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isDanger
                ? "bg-gradient-to-r from-rose-500 to-red-600"
                : isWarning
                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                : "bg-gradient-brand"
            }`}
            style={{ width: `${Math.min(100, Math.max(2, percentage))}%` }}
          />
        </div>
      </div>

      {/* Storage Limit Warning Alerts */}
      {isDanger && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>
            <strong>Storage Limit Full!</strong> You have reached your 50 MB limit. Delete existing files to free up space for new uploads.
          </span>
        </div>
      )}

      {isWarning && !isDanger && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>
            <strong>Running Low on Storage:</strong> You have used {percentage}% of your 50 MB limit ({remainingMb.toFixed(1)} MB left).
          </span>
        </div>
      )}

      {/* Category Breakdown Pills */}
      {stats?.categoryBreakdown && (
        <div className="pt-2 border-t border-border flex items-center gap-2 flex-wrap text-[11px]">
          <span className="font-semibold text-ink-soft text-[10px] uppercase tracking-wider">Breakdown:</span>
          {(Object.keys(stats.categoryBreakdown) as DriveCategory[]).map((cat) => {
            const bytes = stats.categoryBreakdown[cat] || 0;
            if (bytes === 0) return null;
            const Icon = categoryIcons[cat];
            const badgeClass = categoryColors[cat];
            return (
              <span
                key={cat}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium bg-surface ${badgeClass}`}
              >
                <Icon className="w-3 h-3" />
                <span className="capitalize font-bold">{cat}:</span>
                <span>{formatBytes(bytes)}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
