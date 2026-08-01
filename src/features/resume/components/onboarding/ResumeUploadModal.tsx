'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, AlertCircle, Loader2, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ResumeImportService } from '../../services/ResumeImportService';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 15 * 1024 * 1024) {
        setError('File size exceeds 15MB limit.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setIsParsing(true);
    setError(null);

    try {
      if (inputMode === 'file') {
        if (!file) {
          setError('Please select a file to upload.');
          setIsParsing(false);
          return;
        }
        await ResumeImportService.importFromFile(file);
      } else {
        if (!pasteText.trim()) {
          setError('Please paste your resume text.');
          setIsParsing(false);
          return;
        }
        await ResumeImportService.importFromText(pasteText);
      }

      setIsParsing(false);
      onClose();
      router.push('/builder?id=guest-active-resume');
    } catch (err: any) {
      console.error('Resume Import Error:', err);
      setError(err.message || 'Failed to import resume. Please verify your file or text content.');
      setIsParsing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isParsing}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-full hover:bg-slate-800 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Upload & AI Extract Resume</h2>
              <p className="text-sm text-slate-400">Import your PDF, DOCX, or paste text to convert into resume schema</p>
            </div>
          </div>

          {/* Mode Selection Tabs */}
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 mb-6">
            <button
              onClick={() => { setInputMode('file'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                inputMode === 'file'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upload File (PDF / DOCX / TXT)
            </button>
            <button
              onClick={() => { setInputMode('text'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                inputMode === 'text'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paste Raw Text
            </button>
          </div>

          {/* Modal Body */}
          {inputMode === 'file' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragOver
                  ? 'border-blue-500 bg-blue-500/10'
                  : file
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <>
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200 text-sm">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <span className="text-xs text-blue-400 underline">Click to choose a different file</span>
                </>
              ) : (
                <>
                  <div className="p-3 bg-slate-800 text-slate-300 rounded-full">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200 text-sm">Drag & drop your resume file here</p>
                    <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX, and TXT up to 15MB</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste your existing resume content, work experiences, skills, and summary here..."
                rows={7}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-mono"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isParsing}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isParsing || (inputMode === 'file' && !file) || (inputMode === 'text' && !pasteText.trim())}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Extracting & Normalizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Parse & Convert Resume</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
