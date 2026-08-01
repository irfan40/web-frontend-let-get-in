import React from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { Languages, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { ILanguage } from '../../types';

const PROFICIENCY_LEVELS: Array<ILanguage['proficiency']> = [
  'Native',
  'Fluent',
  'Proficient',
  'Intermediate',
  'Basic',
];

export const LanguagesForm: React.FC = () => {
  const { resume, addLanguage, updateLanguage, removeLanguage, reorderLanguages } = useResumeStore();
  const languages = resume.content.languages || [];

  const handleAdd = () => {
    const newLang: ILanguage = {
      id: `lang-${Date.now()}`,
      language: 'English',
      proficiency: 'Fluent',
    };
    addLanguage(newLang);
  };

  const moveLang = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= languages.length) return;
    const items = [...languages];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    if (reorderLanguages) reorderLanguages(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Languages</h3>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Language</span>
        </button>
      </div>

      {languages.length === 0 ? (
        <div className="text-center py-8 bg-slate-900/30 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
          No languages added yet. Click &quot;Add Language&quot; to specify your spoken/written languages.
        </div>
      ) : (
        languages.map((lang, idx) => (
          <div key={lang.id} className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/50">
                  #{idx + 1}
                </span>
                <span className="text-xs font-semibold text-white">{lang.language || 'Language'}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveLang(idx, 'up')}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                  title="Move Up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === languages.length - 1}
                  onClick={() => moveLang(idx, 'down')}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                  title="Move Down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeLanguage(lang.id)}
                  className="p-1 text-rose-400 hover:text-rose-300 ml-2"
                  title="Delete Language"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Language Name</label>
                <input
                  type="text"
                  value={lang.language}
                  onChange={(e) => updateLanguage(lang.id, { language: e.target.value })}
                  placeholder="e.g. English, Spanish, German"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Proficiency Level</label>
                <select
                  value={lang.proficiency}
                  onChange={(e) => updateLanguage(lang.id, { proficiency: e.target.value as ILanguage['proficiency'] })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                >
                  {PROFICIENCY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
