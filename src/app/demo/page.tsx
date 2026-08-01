'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Upload, ArrowRight, Wand2, ShieldCheck, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '../../features/resume/store/useResumeStore';
import { ResumeUploadModal } from '../../features/resume/components/onboarding/ResumeUploadModal';

export default function DemoOnboardingPage() {
  const router = useRouter();
  const { resetToBlank } = useResumeStore();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleStartFromScratch = () => {
    resetToBlank();
    router.push('/builder');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Top Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div
          onClick={() => router.push('/')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            ResumeBuild.ai
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-full text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Career Suite v2.0
          </span>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="w-full max-w-5xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center z-10 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-400 mb-6 backdrop-blur-md shadow-sm"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Next-Generation Resume Onboarding</span>
        </motion.div>

        {/* Question Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-100 max-w-3xl leading-tight"
        >
          How would you like to start building your resume?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-base sm:text-lg text-slate-400 max-w-xl font-normal"
        >
          Select your workflow below. Our AI carrier engine will format, score, and optimize your resume in real time.
        </motion.p>

        {/* Two Interactive Workflows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-12 text-left">
          {/* Card 1: Start from Scratch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={handleStartFromScratch}
            className="group relative bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 sm:p-10 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all flex flex-col justify-between overflow-hidden"
          >
            {/* Top Glow on Hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                  Blank Canvas
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                Build Resume from Scratch
              </h3>

              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Start with a clean resume and let AI help you build every section step by step. Ideal for fresh graduates or creating a tailored new resume from ground up.
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-sm font-semibold text-slate-200 group-hover:text-blue-400">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                Start from Scratch
              </span>
              <div className="p-2 rounded-full bg-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Upload Existing Resume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            onClick={() => setIsUploadModalOpen(true)}
            className="group relative bg-gradient-to-b from-slate-900/90 to-slate-900/50 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-8 sm:p-10 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all flex flex-col justify-between overflow-hidden"
          >
            {/* Top Glow on Hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                  <Upload className="w-8 h-8" />
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                  AI Auto-Extract
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                Upload Existing Resume
              </h3>

              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Already have a resume? Upload a PDF or DOCX and we’ll automatically extract your information using AI, populating all sections instantly.
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-sm font-semibold text-slate-200 group-hover:text-indigo-400">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Upload Resume
              </span>
              <div className="p-2 rounded-full bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Security / Quality guarantee bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            256-bit Encrypted & Privacy Protected
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Powered by Google Gemini 1.5 Flash AI
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-600 z-10">
        © {new Date().getFullYear()} ResumeBuild.ai. Built for modern professionals.
      </footer>

      {/* Modal for Option 2 Upload */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
