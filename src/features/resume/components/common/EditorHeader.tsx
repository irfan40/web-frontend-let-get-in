import React, { useState } from "react";
import { useResumeStore } from "../../store/useResumeStore";
import { useAuthStore } from "../../../auth/store/useAuthStore";
import { Logo } from "@/components/landing/Logo";
import { UserDropdown } from "@/components/layout/UserDropdown";
import {
  Check,
  Cloud,
  RefreshCw,
  AlertCircle,
  Download,
  Sparkles,
  LayoutTemplate,
  User,
} from "lucide-react";
import Link from "next/link";
import { TemplateModal } from "@/features/templates/components/TemplateModal";

interface EditorHeaderProps {
  onToggleAi: () => void;
  isAiOpen: boolean;
  onDownloadPdf: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onToggleAi,
  isAiOpen,
  onDownloadPdf,
}) => {
  const { resume, updateTitle, saveStatus, lastSavedAt, isDirty } =
    useResumeStore();
  const { isAuthenticated } = useAuthStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(resume.title);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      updateTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <>
      <header className="glass border-b border-white/20 text-ink px-6 h-16 flex items-center justify-between sticky top-0 z-30 shadow-elegant no-print">
        {/* Left: Brand & Document Title */}
        <div className="flex items-center gap-4">
          {/* <Logo /> */}
          <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              autoFocus
              className="input-base text-xs px-3 py-1 font-semibold max-w-[200px]"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-ink hover:text-primary-glow text-sm font-semibold hover:bg-surface-alt px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
              title="Click to rename"
            >
              {resume.title}
            </button>
          )}

          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-ink-soft bg-surface-alt px-3 py-1 rounded-full border border-border">
            {saveStatus === "saving" && (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="text-amber-400 font-semibold">Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="w-3.5 h-3.5 text-success" />
                <span className="text-success font-semibold">
                  Saved {lastSavedAt ? `at ${lastSavedAt}` : ""}
                </span>
              </>
            )}
            {saveStatus === "unsaved" && isDirty && (
              <>
                <Cloud className="w-3.5 h-3.5 text-primary-glow" />
                <span>Unsaved changes</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                <span className="text-destructive font-semibold">
                  Save failed
                </span>
              </>
            )}
            {saveStatus === "idle" && (
              <>
                <Cloud className="w-3.5 h-3.5 text-ink-soft" />
                <span>
                  {isAuthenticated ? "Cloud Synced" : "Offline Draft"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-3">
          {/* Template Selector Modal Trigger */}
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold bg-surface-alt hover:bg-surface text-ink px-3.5 py-2 rounded-xl border border-border transition-all shadow-xs hover:border-primary-glow"
            title="Choose Resume Template Layout"
          >
            <LayoutTemplate className="w-4 h-4 text-primary-glow" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={onToggleAi}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-elegant ${
              isAiOpen
                ? "bg-gradient-brand text-primary-foreground ring-2 ring-primary-glow/50"
                : "bg-surface-alt hover:bg-surface text-primary-glow border border-primary/20"
            }`}
          >
            <Sparkles className="w-4 h-4 text-primary-glow" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={onDownloadPdf}
            className="flex items-center gap-2 text-xs font-semibold bg-gradient-brand text-primary-foreground px-4 py-2 rounded-xl shadow-elegant hover:shadow-glow transition-all hover:scale-[1.02] active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          {/* User Account Dropdown / Login */}

          {/* {isAuthenticated ? (
            <UserDropdown />
          ) : (
            <Link
              href="/auth"
              className="text-xs font-semibold text-ink bg-surface-alt hover:bg-surface px-4 py-2 rounded-xl border border-border transition-colors flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )} */}
        </div>
      </header>

      {/* Template Selection Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
      />
    </>
  );
};
