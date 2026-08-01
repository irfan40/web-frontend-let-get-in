import React from 'react';
import Link from 'next/link';
import { IResume } from '../../resume/types';
import { FileText, Edit, Trash2, Calendar, LayoutTemplate } from 'lucide-react';

interface ResumeCardProps {
  resume: IResume;
  onDelete: (id: string) => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onDelete }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 transition-all shadow-lg hover:shadow-xl flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <button
            onClick={() => onDelete(resume.id)}
            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Delete Resume"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
          {resume.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-1 mb-4">
          {resume.content.personalInfo.headline || 'Software Professional'}
        </p>

        <div className="space-y-1.5 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
            <span className="capitalize">{resume.templateId.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : 'Recently'}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-800/80">
        <Link
          href={`/builder?id=${resume.id}`}
          className="w-full bg-slate-800 hover:bg-indigo-600 text-white text-xs font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Open in Editor</span>
        </Link>
      </div>
    </div>
  );
};
