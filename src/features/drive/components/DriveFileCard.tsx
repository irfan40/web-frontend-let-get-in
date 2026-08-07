import React, { useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  FileArchive,
  File,
  Download,
  Star,
  Trash2,
  Eye,
  Copy,
  Check,
  MoreVertical,
  Edit2,
  ExternalLink,
} from "lucide-react";
import { DriveFile, DriveCategory } from "../services/driveService";
import { downloadDriveFile } from "../utils/downloadHelper";

interface DriveFileCardProps {
  file: DriveFile;
  onPreview: (file: DriveFile) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onEdit: (file: DriveFile) => void;
}

export const DriveFileCard: React.FC<DriveFileCardProps> = ({
  file,
  onPreview,
  onDelete,
  onToggleStar,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isImage = file.category === "image" || file.mimeType.startsWith("image/");
  const fileUrl = file.cloudinary.secureUrl || file.cloudinary.url;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadDriveFile(fileUrl, file.originalName);
  };

  const categoryBadgeColors: Record<DriveCategory, string> = {
    pdf: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    image: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    document: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    archive: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    audio: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    video: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    other: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };

  const getCategoryIcon = (cat: DriveCategory) => {
    switch (cat) {
      case "pdf":
        return <FileText className="w-6 h-6 text-rose-500" />;
      case "image":
        return <ImageIcon className="w-6 h-6 text-sky-500" />;
      case "document":
        return <FileText className="w-6 h-6 text-emerald-500" />;
      case "archive":
        return <FileArchive className="w-6 h-6 text-amber-500" />;
      default:
        return <File className="w-6 h-6 text-primary-glow" />;
    }
  };

  return (
    <div
      onClick={() => onPreview(file)}
      className="group relative bg-surface border border-border hover:border-primary-glow/50 rounded-2xl p-4 transition-all duration-200 shadow-xs hover:shadow-glow flex flex-col justify-between cursor-pointer space-y-3"
    >
      {/* Top Bar: Icon / Thumbnail & Star Toggle */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {isImage ? (
            <div className="w-12 h-12 rounded-xl border border-border overflow-hidden bg-secondary shrink-0 relative group-hover:scale-105 transition">
              <img
                src={fileUrl}
                alt={file.originalName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-secondary/70 border border-border flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              {getCategoryIcon(file.category)}
            </div>
          )}

          <div className="min-w-0">
            <h4 className="font-bold text-ink text-xs truncate group-hover:text-primary-glow transition" title={file.originalName}>
              {file.originalName}
            </h4>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-wider ${
                categoryBadgeColors[file.category]
              }`}
            >
              {file.category}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(file._id);
          }}
          className={`p-1.5 rounded-lg border transition ${
            file.starred
              ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
              : "text-ink-soft opacity-40 group-hover:opacity-100 hover:text-amber-500 hover:bg-surface border-transparent"
          }`}
          title={file.starred ? "Unstar file" : "Star file"}
        >
          <Star className={`w-4 h-4 ${file.starred ? "fill-amber-500 text-amber-500" : ""}`} />
        </button>
      </div>

      {/* Meta Specs */}
      <div className="text-[11px] text-ink-soft flex items-center justify-between pt-1">
        <span>{formatFileSize(file.size)}</span>
        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Description / Tags if present */}
      {file.description && (
        <p className="text-[11px] text-ink-soft/80 line-clamp-1 italic">
          "{file.description}"
        </p>
      )}

      {/* Action Buttons Bar */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-ink-soft">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(file);
            }}
            className="p-1.5 hover:text-primary-glow hover:bg-surface-alt rounded-lg transition"
            title="Preview file"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 hover:text-primary-glow hover:bg-surface-alt rounded-lg transition"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="p-1.5 hover:text-primary-glow hover:bg-surface-alt rounded-lg transition"
            title="Copy link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(file);
            }}
            className="p-1.5 hover:text-ink hover:bg-surface-alt rounded-lg transition"
            title="Edit details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file._id);
          }}
          className="p-1.5 text-ink-soft hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
          title="Delete file"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
