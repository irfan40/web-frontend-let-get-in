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
    <div className="bg-surface border border-border hover:border-primary-glow/60 rounded-3xl p-6 transition-all card-hover shadow-elegant flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold shadow-glow group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <button
            onClick={() => onDelete(resume.id)}
            className="text-ink-soft hover:text-destructive p-2 rounded-xl hover:bg-surface-alt transition-colors"
            title="Delete Resume"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base font-bold text-ink mb-1 group-hover:text-primary-glow transition-colors">
          {resume.title}
        </h3>
        <p className="text-xs text-ink-soft line-clamp-1 mb-5">
          {resume.content.personalInfo.headline || 'Software Professional'}
        </p>

        <div className="space-y-2 text-xs text-ink-soft font-medium">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-primary-glow" />
            <span className="capitalize">{resume.templateId.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-ink-soft" />
            <span>Updated {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : 'Recently'}</span>
          </div>
        </div>
      </div>

      <div className="pt-5 mt-5 border-t border-border">
        <Link
          href={`/builder?id=${resume.id}`}
          className="w-full bg-gradient-brand text-primary-foreground text-xs font-semibold py-2.5 rounded-xl shadow-elegant hover:shadow-glow transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
        >
          <Edit className="w-4 h-4" />
          <span>Open in Editor</span>
        </Link>
      </div>
    </div>
  );
};
