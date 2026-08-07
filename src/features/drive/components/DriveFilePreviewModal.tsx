import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  Calendar,
  HardDrive,
  Star,
  FileCheck,
} from "lucide-react";
import { DriveFile } from "../services/driveService";

interface DriveFilePreviewModalProps {
  file: DriveFile | null;
  onClose: () => void;
  onStarToggle?: (id: string) => void;
}

export const DriveFilePreviewModal: React.FC<DriveFilePreviewModalProps> = ({
  file,
  onClose,
  onStarToggle,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [imageError, setImageError] = useState<boolean>(false);
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state whenever target file changes
  useEffect(() => {
    setZoomLevel(100);
    setImageError(false);
    setIframeError(false);
  }, [file]);

  // Handle ESC key press & body scroll locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (file) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [file, onClose]);

  if (!file || !mounted) return null;

  const mimeType = file.mimeType || "";
  const rawUrl = file.cloudinary.secureUrl || file.cloudinary.url || "";
  const fileName = file.originalName || "";

  // Clean raw Cloudinary URLs for inline delivery
  const cleanUrl =
    rawUrl.includes("cloudinary.com") && rawUrl.includes("/raw/upload/")
      ? rawUrl.replace("/raw/upload/", "/image/upload/fl_inline/")
      : rawUrl;

  const isImage =
    file.category === "image" ||
    mimeType.startsWith("image/") ||
    /\.(png|jpg|jpeg|webp|gif|heic|svg)$/i.test(fileName);

  const isPdf =
    file.category === "pdf" ||
    mimeType === "application/pdf" ||
    /\.pdf$/i.test(fileName) ||
    cleanUrl.includes(".pdf");

  const isDocx = /\.(docx|doc|pptx|ppt|xlsx|xls)$/i.test(fileName);

  // Cloudinary PDF Page 1 PNG Snapshot (works even for raw Cloudinary PDFs!)
  const pdfPngPreviewUrl =
    (isPdf || isDocx) && cleanUrl.includes("cloudinary.com")
      ? cleanUrl
          .replace(/\/raw\/upload\//, "/image/upload/")
          .replace(/\.pdf$/i, ".png")
          .replace("/upload/", "/upload/f_png,pg_1,w_1200/")
      : null;

  // Google Docs Embedded Viewer URL for office docs or PDFs
  const googleDocsViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(cleanUrl)}&embedded=true`;

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleZoomReset = () => setZoomLevel(100);

  // Effective image source for canvas rendering
  const displayImageUrl = isImage
    ? cleanUrl
    : isPdf && pdfPngPreviewUrl && !imageError
      ? pdfPngPreviewUrl
      : null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = cleanUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-5xl h-[92vh] bg-surface border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in zoom-in-95">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-surface/90 backdrop-blur border-b border-border flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary-glow flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-ink text-base truncate max-w-md" title={fileName}>
                {fileName}
              </h3>
              <p className="text-xs text-ink-soft flex items-center gap-3 mt-0.5 flex-wrap">
                <span className="capitalize font-semibold">{file.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-ink-soft/70" />
                  {formatFileSize(file.size)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-ink-soft/70" />
                  {new Date(file.createdAt).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            {displayImageUrl && (
              <div className="hidden sm:flex items-center gap-1 bg-secondary/60 border border-border p-1 rounded-xl mr-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 50}
                  className="p-1.5 text-ink-soft hover:text-ink rounded-lg hover:bg-secondary transition disabled:opacity-30 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-ink px-1.5">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 250}
                  className="p-1.5 text-ink-soft hover:text-ink rounded-lg hover:bg-secondary transition disabled:opacity-30 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomReset}
                  className="p-1.5 text-ink-soft hover:text-ink rounded-lg hover:bg-secondary transition cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {onStarToggle && (
              <button
                type="button"
                onClick={() => onStarToggle(file._id)}
                className={`p-2 rounded-xl border border-border transition ${
                  file.starred
                    ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
                    : "text-ink-soft hover:text-amber-500 hover:bg-secondary"
                }`}
                title={file.starred ? "Unstar file" : "Star file"}
              >
                <Star className={`w-4 h-4 ${file.starred ? "fill-amber-500" : ""}`} />
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 bg-gradient-brand text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-elegant hover:shadow-glow transition cursor-pointer"
              title="Download File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <a
              href={cleanUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-ink-soft hover:text-ink rounded-xl border border-border hover:bg-secondary transition cursor-pointer"
              title="Open Original Link"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-ink-soft hover:text-rose-500 rounded-xl border border-border hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Body (Document Display Canvas) */}
        <div className="flex-1 relative flex items-center justify-center p-4 overflow-auto min-h-0 bg-slate-900/10 dark:bg-slate-950/60">
          {displayImageUrl ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
              <img
                src={displayImageUrl}
                alt={fileName}
                onError={() => setImageError(true)}
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "center center",
                }}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-xl transition-transform duration-200"
              />
            </div>
          ) : isPdf && !iframeError ? (
            <iframe
              src={`${cleanUrl}#toolbar=1`}
              title={fileName}
              onError={() => setIframeError(true)}
              className="w-full h-full rounded-2xl border border-border bg-white shadow-inner"
            />
          ) : isDocx && !iframeError ? (
            <iframe
              src={googleDocsViewerUrl}
              title={fileName}
              onError={() => setIframeError(true)}
              className="w-full h-full rounded-2xl border border-border bg-white shadow-inner"
            />
          ) : (
            <div className="p-8 text-center space-y-4 max-w-md bg-surface border border-border rounded-3xl shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary-glow mx-auto flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-ink text-base">{fileName}</h4>
                <p className="text-xs text-ink-soft">
                  Document is ready. Click below to view or download original file.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <a
                  href={cleanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-brand text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" /> Open Original Document
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
