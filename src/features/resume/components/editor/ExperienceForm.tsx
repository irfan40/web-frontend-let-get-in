import React from "react";
import { useResumeStore } from "../../store/useResumeStore";
import { useAiCoachStore } from "../../store/useAiCoachStore";
import { Briefcase, Plus, Trash2, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { IExperience } from "../../types";

export const ExperienceForm: React.FC = () => {
  const {
    resume,
    addExperience,
    updateExperience,
    removeExperience,
    reorderExperiences,
  } = useResumeStore();
  const { triggerExperienceAi } = useAiCoachStore();
  const experiences = resume.content.experiences;

  const handleAdd = () => {
    const newExp: IExperience = {
      id: `exp-${Date.now()}`,
      company: "New Company",
      position: "Software Engineer",
      location: "Remote",
      startDate: "2023-01",
      endDate: "Present",
      isCurrent: true,
      highlights: ["Achieved measurable result X by building system Y."],
    };
    addExperience(newExp);
  };

  const handleHighlightChange = (
    expId: string,
    index: number,
    value: string,
  ) => {
    const exp = experiences.find((e) => e.id === expId);
    if (!exp) return;
    const newHighlights = [...exp.highlights];
    newHighlights[index] = value;
    updateExperience(expId, { highlights: newHighlights });
  };

  const addHighlight = (expId: string) => {
    const exp = experiences.find((e) => e.id === expId);
    if (!exp) return;
    updateExperience(expId, {
      highlights: [...exp.highlights, "New key accomplishment..."],
    });
  };

  const removeHighlight = (expId: string, index: number) => {
    const exp = experiences.find((e) => e.id === expId);
    if (!exp) return;
    updateExperience(expId, {
      highlights: exp.highlights.filter((_, i) => i !== index),
    });
  };

  const moveExperience = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;
    const items = [...experiences];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    reorderExperiences(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-surface p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary-glow" />
          <h3 className="text-sm font-bold text-ink">Work Experience</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-brand text-primary-foreground px-3 py-1.5 rounded-xl shadow-elegant transition-all hover:shadow-glow cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Position</span>
          </button>
        </div>
      </div>

      {experiences.length === 0 ? (
        <div className="text-center py-8 bg-surface/50 rounded-2xl border border-dashed border-border text-ink-soft text-xs">
          No work experiences added yet. Click &quot;Add Position&quot; to
          begin.
        </div>
      ) : (
        experiences.map((exp, idx) => (
          <div
            key={exp.id}
            className="bg-surface p-5 rounded-2xl border border-border space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary-glow bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                  #{idx + 1}
                </span>
                <span className="text-xs font-semibold text-ink">
                  {exp.company || "Company"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => moveExperience(idx, "up")}
                  className="p-1 text-ink-soft hover:text-ink disabled:opacity-30 cursor-pointer"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  disabled={idx === experiences.length - 1}
                  onClick={() => moveExperience(idx, "down")}
                  className="p-1 text-ink-soft hover:text-ink disabled:opacity-30 cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="p-1 text-destructive hover:opacity-80 ml-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-ink-soft font-semibold mb-1">
                  Position / Job Title
                </label>
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) =>
                    updateExperience(exp.id, { position: e.target.value })
                  }
                  className="input-base text-xs"
                />
              </div>

              <div>
                <label className="block text-ink-soft font-semibold mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) =>
                    updateExperience(exp.id, { company: e.target.value })
                  }
                  className="input-base text-xs"
                />
              </div>

              <div>
                <label className="block text-ink-soft font-semibold mb-1">
                  Start Date
                </label>
                <input
                  type="text"
                  value={exp.startDate}
                  onChange={(e) =>
                    updateExperience(exp.id, { startDate: e.target.value })
                  }
                  placeholder="YYYY-MM"
                  className="input-base text-xs"
                />
              </div>

              <div>
                <label className="block text-ink-soft font-semibold mb-1">
                  End Date
                </label>
                <input
                  type="text"
                  value={exp.endDate}
                  onChange={(e) =>
                    updateExperience(exp.id, { endDate: e.target.value })
                  }
                  placeholder="YYYY-MM or Present"
                  disabled={exp.isCurrent}
                  className="input-base text-xs disabled:opacity-50"
                />
              </div>
            </div>

            {/* Highlights Bullet Points */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink">
                  Key Achievements & Bullet Points
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => triggerExperienceAi(exp.id, exp.position, exp.company)}
                    className="text-xs text-primary-glow hover:text-primary font-semibold flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg border border-primary/25 transition-all cursor-pointer shadow-xs"
                    title="Write and generate achievement bullet points with LetGetIn AI Coach"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary-glow" />
                    <span>Write with AI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addHighlight(exp.id)}
                    className="text-xs text-primary-glow hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bullet</span>
                  </button>
                </div>
              </div>

              {exp.highlights.map((bullet, hIdx) => (
                <div key={hIdx} className="flex items-center gap-2">
                  <span className="text-ink-soft text-xs">•</span>
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) =>
                      handleHighlightChange(exp.id, hIdx, e.target.value)
                    }
                    className="flex-1 input-base text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeHighlight(exp.id, hIdx)}
                    className="text-ink-soft hover:text-destructive p-1 cursor-pointer"
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
