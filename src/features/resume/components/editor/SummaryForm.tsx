import React, { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { FileText, Sparkles, Wand2 } from 'lucide-react';
import { AiSummaryModal } from '../ai/AiSummaryModal';

export const SummaryForm: React.FC = () => {
  const { resume, updateSummary } = useResumeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const headline = resume.content.personalInfo.headline || 'Software Professional';
  const summaryVal = resume.content.summary;
  const summaryText = typeof summaryVal === 'string'
    ? summaryVal
    : (summaryVal && typeof summaryVal === 'object' && 'currentSummary' in summaryVal)
    ? String((summaryVal as any).currentSummary || '')
    : (summaryVal && typeof summaryVal === 'object' && 'summary' in summaryVal)
    ? String((summaryVal as any).summary || '')
    : String(summaryVal || '');

  return (
    <div className="space-y-4 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Professional Summary
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Targeting Role: <span className="text-indigo-300 font-semibold">{headline}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 text-xs text-purple-200 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 hover:from-purple-800 hover:to-indigo-800 border border-purple-600/50 px-4 py-2 rounded-xl transition-all font-bold shadow-md hover:shadow-purple-900/20"
        >
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span>Write Summary with AI</span>
        </button>
      </div>

      <div>
        <textarea
          rows={6}
          value={summaryText}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder="Write a compelling 3-4 sentence summary of your experience, key skills, and engineering accomplishments..."
          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y"
        />
        <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-500">
          <span>Tip: Click &quot;Write Summary with AI&quot; to pick templates or generate tailored variations.</span>
          <span>{summaryText.length} characters</span>
        </div>
      </div>

      {/* AI Summary & Template Modal */}
      <AiSummaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
