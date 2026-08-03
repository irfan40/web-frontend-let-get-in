"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useResumeStore } from "@/features/resume/store/useResumeStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useAutosave } from "@/features/resume/hooks/useAutosave";
import { EditorHeader } from "@/features/resume/components/common/EditorHeader";
import { SectionNav } from "@/features/resume/components/editor/SectionNav";
import { FormAtsHeader } from "@/features/resume/components/editor/FormAtsHeader";
import { ResumeFormContainer } from "@/features/resume/components/editor/ResumeFormContainer";
import { EmbeddedAiChat } from "@/features/resume/components/ai/EmbeddedAiChat";
import { LivePreviewCanvas } from "@/features/resume/components/preview/LivePreviewCanvas";
import { triggerPdfDownload } from "@/features/resume/utils/downloadPdf";
import { Loader2, FileText, MessageSquare, Eye } from "lucide-react";

function BuilderContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");
  const { loadResume } = useResumeStore();
  const { isAuthenticated } = useAuthStore();
  const [activeMobileTab, setActiveMobileTab] = useState<"form" | "chat" | "preview">("form");

  // Initialize Autosave Hook
  useAutosave();

  useEffect(() => {
    if (resumeId) {
      loadResume(resumeId, isAuthenticated);
    }
  }, [resumeId, isAuthenticated, loadResume]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Editor Header Toolbar (Styled matching /dashboard theme) */}
      <EditorHeader
        onToggleAi={() => setActiveMobileTab((prev) => (prev === "chat" ? "form" : "chat"))}
        isAiOpen={activeMobileTab === "chat"}
        onDownloadPdf={triggerPdfDownload}
      />

      {/* Mobile/Tablet Workspace Tab Selector (< lg screens) */}
      <div className="flex lg:hidden bg-surface border-b border-border p-1.5 gap-1.5 no-print select-none">
        <button
          onClick={() => setActiveMobileTab("form")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeMobileTab === "form"
              ? "bg-gradient-brand text-primary-foreground font-bold shadow-elegant"
              : "text-ink-soft hover:text-ink hover:bg-surface-alt"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Form Editor</span>
        </button>
        <button
          onClick={() => setActiveMobileTab("chat")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeMobileTab === "chat"
              ? "bg-gradient-brand text-primary-foreground font-bold shadow-elegant"
              : "text-ink-soft hover:text-ink hover:bg-surface-alt"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>AI Chat</span>
        </button>
        <button
          onClick={() => setActiveMobileTab("preview")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            activeMobileTab === "preview"
              ? "bg-gradient-brand text-primary-foreground font-bold shadow-elegant"
              : "text-ink-soft hover:text-ink hover:bg-surface-alt"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Resume Show</span>
        </button>
      </div>

      {/* Main 3-Part Workspace Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden bg-background">
        {/* PART 1: FORM SECTION (Horizontal Navigation & ATS Score on top of form) */}
        <section
          className={`lg:col-span-5 flex flex-col h-full overflow-hidden bg-surface/50 border border-border rounded-2xl p-4 shadow-sm ${
            activeMobileTab === "form" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* 1. ATS Section ON TOP of the form */}
          <FormAtsHeader />

          {/* 2. Horizontal Form Navigation Tabs */}
          <div className="mb-3">
            <SectionNav />
          </div>

          {/* 3. Active Form Fields Container */}
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
            <ResumeFormContainer />
          </div>
        </section>

        {/* PART 2: CHAT SECTION (Embedded AI Resume Advisor Workspace) */}
        <section
          className={`lg:col-span-3 flex flex-col h-full overflow-hidden ${
            activeMobileTab === "chat" ? "flex" : "hidden lg:flex"
          }`}
        >
          <EmbeddedAiChat />
        </section>

        {/* PART 3: RESUME SHOW SECTION (Live Interactive Canvas) */}
        <section
          className={`lg:col-span-4 flex flex-col h-full overflow-hidden bg-surface/30 border border-border rounded-2xl print:border-none print:p-0 shadow-sm relative ${
            activeMobileTab === "preview" ? "flex" : "hidden lg:flex"
          }`}
        >
          <LivePreviewCanvas />
        </section>
      </main>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-background flex flex-col items-center justify-center text-ink-soft gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-glow" />
          <p className="text-sm font-medium">Loading Builder Workspace...</p>
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
