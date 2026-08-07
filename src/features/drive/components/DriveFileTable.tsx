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
  Edit2,
} from "lucide-react";
import { DriveFile, DriveCategory } from "../services/driveService";

interface DriveFileTableProps {
  files: DriveFile[];
  onPreview: (file: DriveFile) => void;
  onDelete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onEdit: (file: DriveFile) => void;
}

export const DriveFileTable: React.FC<DriveFileTableProps> = ({
  files,
  onPreview,
  onDelete,
  onToggleStar,
  onEdit,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleCopy = (e: React.MouseEvent, file: DriveFile) => {
    e.stopPropagation();
    const url = file.cloudinary.secureUrl || file.cloudinary.url;
    navigator.clipboard.writeText(url);
    setCopiedId(file._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (e: React.MouseEvent, file: DriveFile) => {
    e.stopPropagation();
    const url = file.cloudinary.secureUrl || file.cloudinary.url;
    const link = document.createElement("a");
    link.href = url;
    link.download = file.originalName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-ink">
          <thead className="bg-surface-alt/60 border-b border-border text-[11px] font-bold uppercase tracking-wider text-ink-soft select-none">
            <tr>
              <th className="py-3 px-4 w-10 text-center">⭐</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Uploaded</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {files.map((file) => {
              const fileUrl = file.cloudinary.secureUrl || file.cloudinary.url;
              const isImage = file.category === "image" || file.mimeType.startsWith("image/");

              return (
                <tr
                  key={file._id}
                  onClick={() => onPreview(file)}
                  className="hover:bg-surface-alt/50 transition cursor-pointer group"
                >
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onToggleStar(file._id)}
                      className="text-ink-soft hover:text-amber-500 transition"
                    >
                      <Star
                        className={`w-4 h-4 mx-auto ${
                          file.starred ? "fill-amber-500 text-amber-500" : "opacity-40 group-hover:opacity-100"
                        }`}
                      />
                    </button>
                  </td>

                  <td className="py-3 px-4 font-semibold max-w-xs truncate">
                    <div className="flex items-center gap-2.5">
                      {isImage ? (
                        <img
                          src={fileUrl}
                          alt={file.originalName}
                          className="w-7 h-7 rounded-lg object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary-glow flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <span className="truncate group-hover:text-primary-glow transition" title={file.originalName}>
                        {file.originalName}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="capitalize px-2 py-0.5 rounded-md bg-secondary text-[11px] font-semibold border border-border">
                      {file.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-ink-soft font-mono text-[11px]">
                    {formatFileSize(file.size)}
                  </td>

                  <td className="py-3 px-4 text-ink-soft text-[11px]">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onPreview(file)}
                        className="p-1.5 hover:text-primary-glow hover:bg-surface rounded-lg transition"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDownload(e, file)}
                        className="p-1.5 hover:text-primary-glow hover:bg-surface rounded-lg transition"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleCopy(e, file)}
                        className="p-1.5 hover:text-primary-glow hover:bg-surface rounded-lg transition"
                        title="Copy Link"
                      >
                        {copiedId === file._id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(file)}
                        className="p-1.5 hover:text-ink hover:bg-surface rounded-lg transition"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(file._id)}
                        className="p-1.5 text-ink-soft hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
