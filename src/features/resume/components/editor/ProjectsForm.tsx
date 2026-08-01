import React from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { FolderGit2, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { IProject } from '../../types';
import { SectionAiButton } from './SectionAiButton';

export const ProjectsForm: React.FC = () => {
  const { resume, addProject, updateProject, removeProject, reorderProjects } = useResumeStore();
  const projects = resume.content.projects;

  const handleAdd = () => {
    const newProj: IProject = {
      id: `proj-${Date.now()}`,
      title: 'New Project Title',
      subtitle: 'Short project overview',
      link: 'https://github.com/example/project',
      startDate: '2023-01',
      endDate: 'Present',
      description: 'Built an interactive web application that streamlines user workflows.',
      highlights: ['Implemented core features resulting in a 40% performance boost.'],
      technologies: ['React', 'TypeScript', 'Node.js'],
    };
    addProject(newProj);
  };

  const handleHighlightChange = (projId: string, index: number, value: string) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;
    const newHighlights = [...(proj.highlights || [])];
    newHighlights[index] = value;
    updateProject(projId, { highlights: newHighlights });
  };

  const addHighlight = (projId: string) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;
    updateProject(projId, { highlights: [...(proj.highlights || []), 'New key accomplishment or feature...'] });
  };

  const removeHighlight = (projId: string, index: number) => {
    const proj = projects.find((p) => p.id === projId);
    if (!proj) return;
    updateProject(projId, { highlights: (proj.highlights || []).filter((_, i) => i !== index) });
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;
    const items = [...projects];
    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);
    reorderProjects(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Projects</h3>
        </div>
        <div className="flex items-center gap-2">
          <SectionAiButton sectionName="projects" />
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8 bg-slate-900/30 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
          No projects added yet. Click &quot;Add Project&quot; to showcase your portfolio.
        </div>
      ) : (
        projects.map((proj, idx) => (
          <div key={proj.id} className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/50">
                  #{idx + 1}
                </span>
                <span className="text-xs font-semibold text-white">{proj.title || 'Project'}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveProject(idx, 'up')}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                  title="Move Up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === projects.length - 1}
                  onClick={() => moveProject(idx, 'down')}
                  className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                  title="Move Down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeProject(proj.id)}
                  className="p-1 text-rose-400 hover:text-rose-300 ml-2"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Project Title</label>
                <input
                  type="text"
                  value={proj.title}
                  onChange={(e) => updateProject(proj.id, { title: e.target.value })}
                  placeholder="e.g. E-Commerce Platform"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Subtitle / Subheadline</label>
                <input
                  type="text"
                  value={proj.subtitle || ''}
                  onChange={(e) => updateProject(proj.id, { subtitle: e.target.value })}
                  placeholder="e.g. Full Stack Web Application"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Live Demo / Repository Link</label>
                <input
                  type="text"
                  value={proj.link || ''}
                  onChange={(e) => updateProject(proj.id, { link: e.target.value })}
                  placeholder="https://github.com/username/project"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Technologies / Tech Stack</label>
                <input
                  type="text"
                  value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies || ''}
                  onChange={(e) =>
                    updateProject(proj.id, {
                      technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  placeholder="React, Next.js, Node.js, MongoDB"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Start Date</label>
                <input
                  type="text"
                  value={proj.startDate || ''}
                  onChange={(e) => updateProject(proj.id, { startDate: e.target.value })}
                  placeholder="2023-01"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">End Date</label>
                <input
                  type="text"
                  value={proj.endDate || ''}
                  onChange={(e) => updateProject(proj.id, { endDate: e.target.value })}
                  placeholder="Present or 2023-06"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-slate-400 mb-1 text-xs font-medium">Project Description</label>
              <textarea
                rows={2}
                value={proj.description || ''}
                onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                placeholder="Brief summary of what this project does and the problem it solves..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-white resize-y"
              />
            </div>

            {/* Highlights Bullet Points */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Key Features & Achievements</span>
                <button
                  type="button"
                  onClick={() => addHighlight(proj.id)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Bullet
                </button>
              </div>

              {(proj.highlights || []).map((bullet, hIdx) => (
                <div key={hIdx} className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">•</span>
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => handleHighlightChange(proj.id, hIdx, e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeHighlight(proj.id, hIdx)}
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
