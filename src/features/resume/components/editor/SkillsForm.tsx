import React, { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { Wrench, Plus, X, Sparkles, RefreshCw, Check } from 'lucide-react';
import { ISkill } from '../../types';

const ROLE_PRESETS: Record<string, string[]> = {
  'Full Stack': ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'REST APIs', 'Docker', 'GraphQL', 'Git'],
  'Frontend': ['React 19', 'Next.js', 'TypeScript', 'TailwindCSS', 'Redux / Zustand', 'HTML5 & CSS3', 'Web Vitals', 'Jest', 'Webpack'],
  'Backend': ['Node.js', 'Express', 'Python', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Microservices', 'AWS', 'REST & gRPC'],
  'DevOps': ['Docker', 'Kubernetes', 'AWS', 'CI/CD Pipelines', 'Terraform', 'Linux', 'Nginx', 'Monitoring / Grafana', 'GitOps'],
  'Mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS & Android', 'REST APIs', 'App Store Deployment'],
};

export const SkillsForm: React.FC = () => {
  const { resume, addSkill, removeSkill } = useResumeStore();
  const skills = resume.content.skills;
  const headline = resume.content.personalInfo.headline || 'Software Engineer';
  const [skillInput, setSkillInput] = useState('');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const existingSkillNames = new Set(skills.map((s) => s.name.toLowerCase()));

  const handleAdd = (nameToAdd?: string) => {
    const val = (nameToAdd || skillInput).trim();
    if (!val || existingSkillNames.has(val.toLowerCase())) return;
    const newSkill: ISkill = {
      id: `skill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: val,
      category: 'Technical Skills',
      level: 5,
    };
    addSkill(newSkill);
    if (!nameToAdd) setSkillInput('');
  };

  const handleAiSuggest = async () => {
    setIsAiSuggesting(true);
    setAiSuggestions([]);

    // Match skills based on current open resume headline and experience
    const lowerHeadline = headline.toLowerCase();
    let suggested: string[] = [];

    if (lowerHeadline.includes('front') || lowerHeadline.includes('ui') || lowerHeadline.includes('web')) {
      suggested = ROLE_PRESETS['Frontend'];
    } else if (lowerHeadline.includes('back') || lowerHeadline.includes('api') || lowerHeadline.includes('server')) {
      suggested = ROLE_PRESETS['Backend'];
    } else if (lowerHeadline.includes('devops') || lowerHeadline.includes('cloud') || lowerHeadline.includes('infra')) {
      suggested = ROLE_PRESETS['DevOps'];
    } else if (lowerHeadline.includes('mobile') || lowerHeadline.includes('ios') || lowerHeadline.includes('android')) {
      suggested = ROLE_PRESETS['Mobile'];
    } else {
      suggested = ROLE_PRESETS['Full Stack'];
    }

    // Filter out skills user already has
    const filtered = suggested.filter((sk) => !existingSkillNames.has(sk.toLowerCase()));
    setTimeout(() => {
      setAiSuggestions(filtered);
      setIsAiSuggesting(false);
    }, 600);
  };

  const handleAddAllAi = () => {
    aiSuggestions.forEach((sk) => handleAdd(sk));
    setAiSuggestions([]);
    setAddedMessage('Added AI recommended skills to your resume!');
    setTimeout(() => setAddedMessage(null), 3000);
  };

  return (
    <div className="space-y-5 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-indigo-400" />
            Skills & Technical Proficiencies
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Targeting: <span className="text-indigo-300 font-semibold">{headline}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleAiSuggest}
          disabled={isAiSuggesting}
          className="flex items-center gap-1.5 text-xs text-purple-300 bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 px-3 py-1.5 rounded-lg transition-all font-semibold shadow-sm disabled:opacity-50"
          title="Suggest skills based on current resume headline"
        >
          {isAiSuggesting ? (
            <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          )}
          <span>Suggest Skills with AI</span>
        </button>
      </div>

      {/* Manual Skill Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="e.g. React, TypeScript, Docker, Node.js..."
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => handleAdd()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {/* Added Confirmation Alert */}
      {addedMessage && (
        <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 p-2.5 rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          {addedMessage}
        </div>
      )}

      {/* AI Skill Suggestions Drawer */}
      {aiSuggestions.length > 0 && (
        <div className="bg-purple-950/40 border border-purple-800/60 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              AI Skill Recommendations for &quot;{headline}&quot;
            </span>
            <button
              type="button"
              onClick={handleAddAllAi}
              className="text-[11px] font-bold bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded transition-colors"
            >
              Add All ({aiSuggestions.length})
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiSuggestions.map((sk) => (
              <button
                key={sk}
                type="button"
                onClick={() => {
                  handleAdd(sk);
                  setAiSuggestions((prev) => prev.filter((s) => s !== sk));
                }}
                className="bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/50 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3 text-purple-300" />
                {sk}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Skill Badges */}
      <div>
        <div className="text-xs font-semibold text-slate-400 mb-2">
          Active Resume Skills ({skills.length}):
        </div>
        {skills.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-2">
            No skills added yet. Use the input above or click &quot;Suggest Skills with AI&quot;.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="bg-slate-800 text-indigo-200 border border-indigo-500/30 text-xs px-3 py-1.5 rounded-full flex items-center gap-2"
              >
                {skill.name}
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                  title="Remove skill"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Role Presets */}
      <div className="pt-2 border-t border-slate-800/60">
        <span className="text-[11px] font-semibold text-slate-400 block mb-2">Quick Tech Stack Presets:</span>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(ROLE_PRESETS).map((presetName) => (
            <button
              key={presetName}
              type="button"
              onClick={() => {
                ROLE_PRESETS[presetName].forEach((sk) => handleAdd(sk));
              }}
              className="text-[11px] bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg transition-colors"
            >
              + {presetName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
