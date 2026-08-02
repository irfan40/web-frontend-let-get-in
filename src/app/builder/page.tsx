"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useResumeStore } from "../../features/resume/store/useResumeStore";
import { useAuthStore } from "../../features/auth/store/useAuthStore";
import { useAutosave } from "../../features/resume/hooks/useAutosave";
import { EditorHeader } from "../../features/resume/components/common/EditorHeader";
import { SectionNav } from "../../features/resume/components/editor/SectionNav";
import { ResumeFormContainer } from "../../features/resume/components/editor/ResumeFormContainer";
import { LivePreviewCanvas } from "../../features/resume/components/preview/LivePreviewCanvas";
import { FloatingAiChatbot } from "../../features/resume/components/ai/FloatingAiChatbot";
import { triggerPdfDownload } from "../../features/resume/utils/downloadPdf";
import { AuthGuard } from "@/components/auth/AuthGuard";

function BuilderContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");
  const { loadResume } = useResumeStore();
  const { isAuthenticated } = useAuthStore();
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Initialize Autosave Hook
  useAutosave();

  useEffect(() => {
    if (resumeId) {
      loadResume(resumeId, isAuthenticated);
    }
  }, [resumeId, isAuthenticated, loadResume]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden relative">
      {/* Editor Header Toolbar */}
      <EditorHeader
        onToggleAi={() => setIsAiOpen((prev) => !prev)}
        isAiOpen={isAiOpen}
        onDownloadPdf={triggerPdfDownload}
      />

      {/* Main Workspace (Clean Split View) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Form Editor Workspace with Vertical Section Navigation */}
        <div className="w-full lg:w-1/2 flex border-r border-border bg-surface/40 overflow-hidden no-print">
          {/* Vertical Section Nav Sidebar */}
          <SectionNav />

          {/* Active Section Form Fields */}
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-border">
            <ResumeFormContainer onAiImproveSummary={() => setIsAiOpen(true)} />
          </div>
        </div>

        {/* Right Side: Live Resume Preview Canvas */}
        <div className="hidden lg:flex print:flex flex-1 bg-background relative overflow-hidden print-area">
          <LivePreviewCanvas />
        </div>
      </div>

      {/* Floating Draggable AI Chatbot & Section Spellchecker */}
      <div className="no-print">
        <FloatingAiChatbot />
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen bg-background flex items-center justify-center text-ink-soft">
            Loading Builder...
          </div>
        }
      >
        <BuilderContent />
      </Suspense>
    </AuthGuard>
  );
}
