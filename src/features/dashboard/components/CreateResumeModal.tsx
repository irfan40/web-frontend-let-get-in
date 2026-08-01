import React, { useState } from 'react';
import { X, Sparkles, LayoutTemplate } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '../../resume/store/useResumeStore';

interface CreateResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateResumeModal: React.FC<CreateResumeModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { updateTitle, updateTemplateId } = useResumeStore();
  const [title, setTitle] = useState('My Professional Resume');
  const [selectedTemplate, setSelectedTemplate] = useState('modern-sleek');

  if (!isOpen) return null;

  const templates = [
    { id: 'modern-sleek', name: 'Modern Sleek', category: 'Contemporary Accent', desc: 'Vibrant colors, dark mode accents' },
    { id: 'classic-ats', name: 'Classic ATS', category: 'High ATS Compatibility', desc: 'Traditional serif structure for scanners' },
    { id: 'minimal-clean', name: 'Minimal Clean', category: 'Clean & Spacious', desc: 'Minimalist whitespace design' },
    { id: 'executive-pro', name: 'Executive Pro', category: 'Two-Column Layout', desc: 'Sidebar contact and core skills' },
  ];

  const handleCreate = () => {
    updateTitle(title.trim() || 'My Professional Resume');
    updateTemplateId(selectedTemplate);
    onClose();
    router.push('/builder');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Create New Resume</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer Resume"
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Select Initial Template</label>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedTemplate === tpl.id
                    ? 'bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <LayoutTemplate className={`w-4 h-4 ${selectedTemplate === tpl.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold text-white">{tpl.name}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">{tpl.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-600/30 transition-all"
          >
            Launch Builder
          </button>
        </div>
      </div>
    </div>
  );
};
