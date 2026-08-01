import React, { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { useAuthStore } from '../../../auth/store/useAuthStore';
import { Check, Cloud, RefreshCw, AlertCircle, Download, Sparkles, LayoutTemplate, User } from 'lucide-react';
import Link from 'next/link';

interface EditorHeaderProps {
  onToggleAi: () => void;
  isAiOpen: boolean;
  onDownloadPdf: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ onToggleAi, isAiOpen, onDownloadPdf }) => {
  const { resume, updateTitle, updateTemplateId, saveStatus, lastSavedAt, isDirty } = useResumeStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(resume.title);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      updateTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const templates = [
    { id: 'modern-sleek', name: 'Modern Sleek' },
    { id: 'classic-ats', name: 'Classic ATS' },
    { id: 'minimal-clean', name: 'Minimal Clean' },
    { id: 'executive-pro', name: 'Executive Pro' },
  ];

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-md no-print">
      {/* Left: Brand & Document Title */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-indigo-400 hover:text-indigo-300 transition-colors">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-lg">
            RB
          </span>
          <span className="hidden sm:inline">ResumeBuild</span>
        </Link>
        <div className="h-5 w-px bg-slate-700 mx-1 hidden sm:block" />

        {isEditingTitle ? (
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            autoFocus
            className="bg-slate-800 border border-indigo-500 text-white text-sm px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="text-slate-200 hover:text-white text-sm font-medium hover:bg-slate-800 px-2.5 py-1 rounded transition-colors flex items-center gap-1.5"
            title="Click to rename"
          >
            {resume.title}
          </button>
        )}

        {/* Save Status Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50">
          {saveStatus === 'saving' && (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-amber-400 font-medium">Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Saved {lastSavedAt ? `at ${lastSavedAt}` : ''}</span>
            </>
          )}
          {saveStatus === 'unsaved' && isDirty && (
            <>
              <Cloud className="w-3.5 h-3.5 text-indigo-400" />
              <span>Unsaved changes</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-400 font-medium">Save failed</span>
            </>
          )}
          {saveStatus === 'idle' && (
            <>
              <Cloud className="w-3.5 h-3.5 text-slate-400" />
              <span>{isAuthenticated ? 'Cloud Synced' : 'Offline Draft'}</span>
            </>
          )}
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-3">
        {/* Template Selector */}
        <div className="relative hidden md:flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5">
          <LayoutTemplate className="w-4 h-4 text-indigo-400" />
          <select
            value={resume.templateId}
            onChange={(e) => updateTemplateId(e.target.value)}
            className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer font-medium"
          >
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id} className="bg-slate-800 text-white">
                {tpl.name}
              </option>
            ))}
          </select>
        </div>

        {/* AI Assistant Button */}
        <button
          onClick={onToggleAi}
          className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-sm ${
            isAiOpen
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white ring-2 ring-purple-400/50'
              : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-indigo-500/30'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Download PDF Button */}
        <button
          onClick={onDownloadPdf}
          className="flex items-center gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-600/30 active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>

        {/* User Account / Login */}
        {isAuthenticated ? (
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-indigo-300">
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
        ) : (
          <Link
            href="/auth"
            className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
};
