import React from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { Briefcase, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { IExperience } from '../../types';
import { SectionAiButton } from './SectionAiButton';

export const ExperienceForm: React.FC = () => {
  const { resume, addExperience, updateExperience, removeExperience, reorderExperiences } = useResumeStore();
  const experiences = resume.content.experiences;

  const handleAdd = () => {
    const newExp: IExperience = {
      id: `exp-${Date.now()}`,
      company: 'New Company',
      position: 'Software Engineer',
      location: 'Remote',
      startDate: '2023-01',
      endDate: 'Present',
      isCurrent: true,
      highlights: ['Achieved measurable result X by building system Y.'],
    };
    addExperience(newExp);
  };

  const handleHighlightChange = (expId: string, index: number, value: string) => {
    const exp = experiences.find((e) => e.id === expId);
    if (!exp) return;
    const newHighlights = [...exp.highlights];
    newHighlights[index] = value;
    updateExperience(expId, { highlights: newHighlights });
  };

  const addHighlight = (expId: string) => {
    const exp = experiences.find((e) => e.id === expId);
    if (!exp) return;
    updateExperience(expId, { highlights: [...exp.highlights, 'New key accomplishment...'] });
  };

  const removeHighlight = (expId: string, index: number) => {
    const exp = experiences.find((e) => e.id === expId);
    if (!exp) return;
    updateExperience(expId, { highlights: exp.highlights.filter((_, i) => i !== index) });
  };

  const moveExperience = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;
    const items = [...experiences];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    reorderExperiences(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Work Experience</h3>
        </div>
        <div className="flex items-center gap-2">
          <SectionAiButton sectionName="experiences" />
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Position</span>
          </button>
        </div>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-8 bg-slate-900/30 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
          No work experiences added yet. Click &quot;Add Position&quot; to begin.
        </div>
      ) : (
        experiences.map((exp, idx) => (
          <div key={exp.id} className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/50">
                  #{idx + 1}
                </span>
                <span className="text-xs font-semibold text-white">{exp.company || 'Company'}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => moveExperience(idx, 'up')}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  disabled={idx === experiences.length - 1}
                  onClick={() => moveExperience(idx, 'down')}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="p-1 text-rose-400 hover:text-rose-300 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Position / Job Title</label>
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Start Date</label>
                <input
                  type="text"
                  value={exp.startDate}
                  onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                  placeholder="YYYY-MM"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">End Date</label>
                <input
                  type="text"
                  value={exp.endDate}
                  onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                  placeholder="YYYY-MM or Present"
                  disabled={exp.isCurrent}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white disabled:opacity-50"
                />
              </div>
            </div>

            {/* Highlights Bullet Points */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Key Achievements & Bullet Points</span>
                <button
                  type="button"
                  onClick={() => addHighlight(exp.id)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Bullet
                </button>
              </div>

              {exp.highlights.map((bullet, hIdx) => (
                <div key={hIdx} className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">•</span>
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => handleHighlightChange(exp.id, hIdx, e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeHighlight(exp.id, hIdx)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
