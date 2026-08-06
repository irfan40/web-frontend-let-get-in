import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Sparkles,
  FileCheck,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import {
  SectionType,
  VerificationDocument,
  VerificationService,
  VerificationStatus,
} from '../services/verificationService';
import { VerificationBadge } from './VerificationBadge';
import { DocumentViewerModal } from './DocumentViewerModal';

interface SectionVerificationBoxProps {
  section: SectionType;
  title: string;
  documents: VerificationDocument[];
  status: VerificationStatus;
  profileData?: Record<string, any>;
  onRefresh: () => void;
  onViewDoc?: (doc: VerificationDocument) => void;
}

const DOCUMENT_OPTIONS: Record<SectionType, Array<{ value: string; label: string }>> = {
  education: [
    { value: 'degree_certificate', label: 'Degree Certificate' },
    { value: 'marksheet', label: 'Marksheet' },
    { value: 'transcript', label: 'Transcript' },
  ],
  experience: [
    { value: 'experience_letter', label: 'Experience Letter' },
    { value: 'offer_letter', label: 'Offer Letter' },
    { value: 'relieving_letter', label: 'Relieving Letter' },
    { value: 'salary_slip', label: 'Salary Slip' },
    { value: 'appointment_letter', label: 'Appointment Letter' },
  ],
  contacts: [
    { value: 'government_id', label: 'Government ID' },
    { value: 'address_proof', label: 'Address Proof' },
  ],
  personal: [
    { value: 'passport', label: 'Passport' },
    { value: 'driving_license', label: 'Driving License' },
    { value: 'pan_card', label: 'PAN Card' },
  ],
  skills: [
    { value: 'certification_pdf', label: 'Certification PDF' },
    { value: 'course_completion', label: 'Course Certificate' },
  ],
};

export const SectionVerificationBox: React.FC<SectionVerificationBoxProps> = ({
  section,
  title,
  documents,
  status,
  profileData,
  onRefresh,
  onViewDoc,
}) => {
  const [selectedDocType, setSelectedDocType] = useState<string>(
    DOCUMENT_OPTIONS[section]?.[0]?.value || 'other'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<VerificationDocument | null>(null);

  const handleOpenPreview = (doc: VerificationDocument) => {
    if (onViewDoc) {
      onViewDoc(doc);
    } else {
      setPreviewDoc(doc);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docOptions = DOCUMENT_OPTIONS[section] || [{ value: 'other', label: 'Document' }];

  // Check if any document in this section is currently pending processing
  const hasPendingDocs = documents.some((d) => d.verification.status === 'pending');

  // Automatic Polling Mechanism: Polls every 3 seconds while documents are pending
  useEffect(() => {
    if (!hasPendingDocs) return;

    const pollInterval = setInterval(() => {
      onRefresh();
    }, 3000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [hasPendingDocs, onRefresh]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (15MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds 15MB limit.');
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);

    try {
      await VerificationService.uploadDocument(file, section, selectedDocType, profileData);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(
        err?.error?.message || err?.message || 'Failed to upload document for verification.'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await VerificationService.deleteDocument(id);
      onRefresh();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <FileCheck className="w-5 h-5 text-primary-glow" />
          <h4 className="font-bold text-ink text-sm">{title} Verification</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-soft">
            {documents.length} {documents.length === 1 ? 'doc' : 'docs'}
          </span>
          <VerificationBadge status={status} size="sm" />
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upload Control Area */}
      <div className="bg-secondary/40 border border-dashed border-border rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Document Type Dropdown */}
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] font-semibold text-ink-soft mb-1">
              Document Type:
            </label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full input-base text-xs py-1.5 bg-surface"
              disabled={isUploading}
            >
              {docOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.docx"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />

          {/* Upload Action Button */}
          <div className="self-end sm:self-auto">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-brand text-white text-xs font-bold px-4 py-2 rounded-xl shadow-elegant hover:shadow-glow transition cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading File...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Document</span>
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-ink-soft">
          Supported Formats: PDF, PNG, JPG, WEBP, DOCX (Max 15MB). Fast upload with async background Gemini 2.5 Vision AI verification.
        </p>
      </div>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="space-y-3 pt-2">
          <h5 className="text-xs font-bold text-ink uppercase tracking-wider">
            Uploaded Documents ({documents.length})
          </h5>
          <div className="space-y-3">
            {documents.map((doc) => {
              const isPending = doc.verification.status === 'pending';
              const isVerified = doc.verification.status === 'verified';
              const isRejected = doc.verification.status === 'rejected';

              return (
                <div
                  key={doc._id}
                  className={`bg-surface border rounded-xl p-4 space-y-3 text-xs shadow-xs transition-all hover:border-primary-glow/40 ${
                    isPending
                      ? 'border-amber-500/40 bg-amber-500/5 ring-1 ring-amber-500/20'
                      : isVerified
                      ? 'border-emerald-500/30'
                      : isRejected
                      ? 'border-rose-500/30'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => handleOpenPreview(doc)}
                      className="flex items-center gap-3 min-w-0 cursor-pointer group"
                      title="Click to view document in modal"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition ${
                          isPending
                            ? 'bg-amber-500/10 text-amber-500'
                            : isVerified
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : isRejected
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-secondary text-primary-glow'
                        }`}
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-ink truncate group-hover:text-primary-glow transition">
                          {doc.cloudinary.originalName}
                        </p>
                        <p className="text-[10px] text-ink-soft mt-0.5">
                          {doc.documentType.replace(/_/g, ' ')} • {formatSize(doc.cloudinary.size)} •{' '}
                          {new Date(doc.cloudinary.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <VerificationBadge status={doc.verification.status} size="sm" />

                      {/* Modal Preview Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(doc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary hover:bg-primary/10 text-ink-soft hover:text-primary-glow text-xs font-semibold rounded-lg border border-border transition cursor-pointer"
                        title="View document modal"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      {/* External Direct Link */}
                      <a
                        href={doc.cloudinary.cloudinaryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-ink-soft hover:text-primary-glow rounded-lg hover:bg-secondary transition"
                        title="Open direct file link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(doc._id)}
                        disabled={deletingId === doc._id}
                        className="p-1.5 text-ink-soft hover:text-rose-500 rounded-lg hover:bg-rose-50 transition disabled:opacity-30 cursor-pointer"
                        title="Delete document"
                      >
                        {deletingId === doc._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* PENDING PROCESSING CARD */}
                  {isPending && (
                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-[11px] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                          Gemini 2.5 Flash Vision AI Processing...
                        </span>
                        <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-700 dark:text-amber-200 px-2 py-0.5 rounded-full">
                          Live Polling Active
                        </span>
                      </div>
                      <p className="text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
                        Extracting text & analyzing document authenticity in the background. Status will update automatically.
                      </p>
                      {/* Animated Shimmer Bar */}
                      <div className="h-1.5 w-full bg-amber-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full animate-pulse w-3/4" />
                      </div>
                    </div>
                  )}

                  {/* VERIFIED SUCCESS SUMMARY CARD */}
                  {isVerified && doc.ai && (
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Gemini AI Verification Summary
                        </span>
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                          Confidence: {doc.verification.confidence}%
                        </span>
                      </div>
                      <p className="text-ink-soft leading-relaxed">{doc.ai.summary}</p>
                    </div>
                  )}

                  {/* REJECTED SUMMARY CARD */}
                  {isRejected && (
                    <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          Gemini AI Verification Rejected
                        </span>
                        <span className="font-extrabold text-rose-700 dark:text-rose-300">
                          Confidence: {doc.verification.confidence}%
                        </span>
                      </div>
                      <p className="text-rose-900/80 dark:text-rose-200/80 leading-relaxed">
                        {doc.ai?.summary || doc.verification.reason || 'Document verification rejected.'}
                      </p>

                      {doc.ai?.issues && doc.ai.issues.length > 0 && (
                        <div className="pt-1 text-rose-700 dark:text-rose-300 font-medium space-y-1">
                          {doc.ai.issues.map((issue, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <span className="text-rose-500 font-bold">•</span>
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      <DocumentViewerModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
};
