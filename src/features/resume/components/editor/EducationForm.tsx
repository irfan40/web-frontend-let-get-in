import React from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { IEducation } from '../../types';
import { SectionAiButton } from './SectionAiButton';

export const EducationForm: React.FC = () => {
  const { resume, addEducation, updateEducation, removeEducation } = useResumeStore();
  const educations = resume.content.educations;

  const handleAdd = () => {
    const newEdu: IEducation = {
      id: `edu-${Date.now()}`,
      institution: 'University Name',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2019-08',
      endDate: '2023-05',
      isCurrent: false,
      gradeScore: '3.8 GPA',
    };
    addEducation(newEdu);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Education & Degrees</h3>
        </div>
        <div className="flex items-center gap-2">
          <SectionAiButton sectionName="educations" />
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Education</span>
          </button>
        </div>
      </div>

      {educations.map((edu) => (
        <div key={edu.id} className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-white">{edu.institution || 'University'}</span>
            <button onClick={() => removeEducation(edu.id)} className="text-rose-400 hover:text-rose-300">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Institution Name</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Degree</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Field of Study</label>
              <input
                type="text"
                value={edu.fieldOfStudy}
                onChange={(e) => updateEducation(edu.id, { fieldOfStudy: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Graduation Year / Dates</label>
              <input
                type="text"
                value={edu.endDate}
                onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 text-white"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
