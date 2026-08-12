import React, { useState } from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { useAiCoachStore } from '../../store/useAiCoachStore';
import { Wrench, Plus, X, Sparkles, RefreshCw, Check, MessageSquare } from 'lucide-react';
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
  const { triggerSkillsAi } = useAiCoachStore();
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

    const filtered = suggested.filter((sk) => !existingSkillNames.has(sk.toLowerCase()));
    
    // Trigger in LetGetIn AI Coach
    triggerSkillsAi();

    setTimeout(() => {
      setAiSuggestions(filtered);
      setIsAiSuggesting(false);
    }, 500);
  };

  const handleAddAllAi = () => {
    aiSuggestions.forEach((sk) => handleAdd(sk));
    setAiSuggestions([]);
    setAddedMessage('Added AI recommended skills to your resume!');
    setTimeout(() => setAddedMessage(null), 3000);
  };

  return (
    <div className="space-y-5 bg-surface p-5 rounded-2xl border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-border gap-3">
        <div>
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary-glow" />
            Skills & Technical Proficiencies
          </h3>
          <p className="text-xs text-ink-soft mt-0.5">
            Targeting: <span className="text-primary-glow font-semibold">{headline}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAiSuggest}
            disabled={isAiSuggesting}
            className="flex items-center gap-1.5 text-xs text-primary-foreground bg-gradient-brand px-3.5 py-1.5 rounded-xl transition-all font-semibold shadow-elegant hover:shadow-glow disabled:opacity-50 cursor-pointer"
            title="Suggest skills and open LetGetIn AI Coach recommendations"
          >
            {isAiSuggesting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Suggest Skills with AI</span>
          </button>
        </div>
      </div>

      {/* Manual Skill Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="e.g. React, TypeScript, Docker, Node.js..."
          className="input-base text-xs flex-1"
        />
        <button
          type="button"
          onClick={() => handleAdd()}
          className="bg-gradient-brand text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-elegant flex items-center gap-1 shrink-0 cursor-pointer hover:shadow-glow"
        >
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {/* Added Confirmation Alert */}
      {addedMessage && (
        <div className="text-xs font-semibold text-success bg-success/10 border border-success/20 p-2.5 rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          {addedMessage}
        </div>
      )}

      {/* AI Skill Suggestions Drawer */}
      {aiSuggestions.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary-glow" />
              AI Recommendations for &quot;{headline}&quot;
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddAllAi}
                className="text-[11px] font-bold bg-gradient-brand text-primary-foreground px-2.5 py-1 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Add All ({aiSuggestions.length})
              </button>
              <button
                type="button"
                onClick={() => triggerSkillsAi()}
                className="text-[11px] font-semibold text-primary-glow hover:underline flex items-center gap-1 cursor-pointer"
                title="Chat with AI Coach about skills"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Coach Chat</span>
              </button>
            </div>
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
                className="bg-surface hover:bg-surface-alt text-ink border border-border text-xs px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors font-medium shadow-xs cursor-pointer"
              >
                <Plus className="w-3 h-3 text-primary-glow" />
                {sk}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Skill Badges */}
      <div>
        <div className="text-xs font-semibold text-ink-soft mb-2">
          Active Resume Skills ({skills.length}):
        </div>
        {skills.length === 0 ? (
          <div className="text-xs text-ink-soft italic py-2">
            No skills added yet. Use the input above or click &quot;Suggest Skills with AI&quot;.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="bg-surface text-ink border border-border text-xs px-3 py-1 rounded-full flex items-center gap-2 shadow-xs font-medium"
              >
                {skill.name}
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="text-ink-soft hover:text-destructive transition-colors cursor-pointer"
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
      <div className="pt-2 border-t border-border">
        <span className="text-xs font-semibold text-ink-soft block mb-2">Quick Tech Stack Presets:</span>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(ROLE_PRESETS).map((presetName) => (
            <button
              key={presetName}
              type="button"
              onClick={() => {
                ROLE_PRESETS[presetName].forEach((sk) => handleAdd(sk));
              }}
              className="text-xs bg-surface-alt hover:bg-surface border border-border text-ink px-2.5 py-1 rounded-xl transition-colors font-medium cursor-pointer"
            >
              + {presetName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
