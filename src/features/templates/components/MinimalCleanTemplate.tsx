import React from 'react';
import { TemplateProps } from '../registry';
import { useResumeStore } from '../../resume/store/useResumeStore';
import { EditableText } from './EditableText';

export const MinimalCleanTemplate: React.FC<TemplateProps> = ({ resume }) => {
  const { personalInfo, summary, experiences, educations, skills, projects, certificates, languages } = resume.content;
  const { primaryColor, fontFamily } = resume.settings;
  const { updatePersonalInfo, updateSummary, updateExperience, updateEducation, updateProject, updateSkill, updateCertificate, updateLanguage } = useResumeStore();

  return (
    <div
      className="w-full bg-white text-slate-900 p-8 shadow-sm flex flex-col justify-between font-sans leading-relaxed text-xs"
      style={{ fontFamily: fontFamily || 'Inter', minHeight: '297mm' }}
    >
      <div>
        {/* Minimal Clean Header */}
        <div className="mb-6 pb-4 border-b border-slate-200">
          <EditableText
            tagName="h1"
            value={personalInfo.fullName || 'Your Name'}
            onChange={(val) => updatePersonalInfo({ fullName: val })}
            className="text-3xl font-light tracking-tight text-slate-900"
          />
          <div className="mt-1">
            <EditableText
              tagName="p"
              value={personalInfo.headline || 'Headline'}
              onChange={(val) => updatePersonalInfo({ headline: val })}
              className="text-xs font-medium uppercase tracking-widest text-slate-500"
            />
          </div>

          <div className="flex flex-wrap gap-4 text-[10px] text-slate-400 mt-3 font-mono">
            <EditableText value={personalInfo.email || 'Email'} onChange={(val) => updatePersonalInfo({ email: val })} />
            <EditableText value={personalInfo.phone || 'Phone'} onChange={(val) => updatePersonalInfo({ phone: val })} />
            <EditableText value={personalInfo.location || 'Location'} onChange={(val) => updatePersonalInfo({ location: val })} />
          </div>
        </div>

        {/* Summary */}
        {summary !== undefined && (
          <div className="mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">01 / ABOUT</h2>
            <EditableText
              tagName="p"
              value={typeof summary === 'string' ? summary : String(summary || '') || 'Click to edit summary...'}
              onChange={(val) => updateSummary(val)}
              className="text-slate-700 leading-relaxed"
            />
          </div>
        )}

        {/* Experience */}
        {experiences && experiences.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">02 / EXPERIENCE</h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <EditableText
                      tagName="span"
                      value={exp.position}
                      onChange={(val) => updateExperience(exp.id, { position: val })}
                      className="font-bold text-slate-900 text-xs"
                    />
                    <span className="text-[10px] font-mono text-slate-400">
                      {exp.startDate} — {exp.endDate}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-600 mb-1" style={{ color: primaryColor }}>
                    <EditableText value={exp.company} onChange={(val) => updateExperience(exp.id, { company: val })} />
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                    {exp.highlights.map((h, i) => (
                      <li key={i}>
                        <EditableText
                          value={h}
                          onChange={(val) => {
                            const updated = [...exp.highlights];
                            updated[i] = val;
                            updateExperience(exp.id, { highlights: updated });
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">03 / PROJECTS</h2>
            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-2">
                      <EditableText
                        tagName="span"
                        value={proj.title}
                        onChange={(val) => updateProject(proj.id, { title: val })}
                        className="font-bold text-slate-900 text-xs"
                      />
                      {proj.subtitle && (
                        <span className="text-[11px] text-slate-500 font-normal">
                          (<EditableText value={proj.subtitle} onChange={(val) => updateProject(proj.id, { subtitle: val })} />)
                        </span>
                      )}
                    </div>
                    {(proj.startDate || proj.endDate) && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {proj.startDate} {proj.endDate ? `— ${proj.endDate}` : ''}
                      </span>
                    )}
                  </div>
                  {proj.link && (
                    <div className="text-[10px] font-mono text-slate-500 underline">
                      <EditableText value={proj.link} onChange={(val) => updateProject(proj.id, { link: val })} />
                    </div>
                  )}
                  {proj.description && (
                    <EditableText
                      tagName="p"
                      value={proj.description}
                      onChange={(val) => updateProject(proj.id, { description: val })}
                      className="text-[11px] text-slate-700 mt-1"
                    />
                  )}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      Stack: {proj.technologies.join(' · ')}
                    </div>
                  )}
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 mt-1">
                      {proj.highlights.map((h, i) => (
                        <li key={i}>
                          <EditableText
                            value={h}
                            onChange={(val) => {
                              const updated = [...(proj.highlights || [])];
                              updated[i] = val;
                              updateProject(proj.id, { highlights: updated });
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Skills */}
        <div className="grid grid-cols-2 gap-6">
          {educations && educations.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">04 / EDUCATION</h2>
              {educations.map((edu) => (
                <div key={edu.id} className="mb-2">
                  <EditableText
                    tagName="div"
                    value={edu.degree}
                    onChange={(val) => updateEducation(edu.id, { degree: val })}
                    className="font-bold text-slate-900"
                  />
                  <EditableText
                    tagName="div"
                    value={edu.institution}
                    onChange={(val) => updateEducation(edu.id, { institution: val })}
                    className="text-[11px] text-slate-600"
                  />
                </div>
              ))}
            </div>
          )}

          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">05 / SKILLS</h2>
              <div className="flex flex-wrap gap-1">
                {skills.map((s) => (
                  <span key={s.id} className="text-[10px] text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded">
                    <EditableText value={s.name} onChange={(val) => updateSkill(s.id, { name: val })} />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Certifications & Languages Grid */}
        {(certificates?.length > 0 || languages?.length > 0) && (
          <div className="grid grid-cols-2 gap-6 mt-6">
            {certificates && certificates.length > 0 && (
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">06 / CERTIFICATIONS</h2>
                <div className="space-y-2">
                  {certificates.map((cert) => (
                    <div key={cert.id}>
                      <EditableText
                        tagName="div"
                        value={cert.name}
                        onChange={(val) => updateCertificate(cert.id, { name: val })}
                        className="font-bold text-slate-900 text-xs"
                      />
                      <EditableText
                        tagName="div"
                        value={cert.issuer}
                        onChange={(val) => updateCertificate(cert.id, { issuer: val })}
                        className="text-[11px] text-slate-600"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {languages && languages.length > 0 && (
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">07 / LANGUAGES</h2>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {languages.map((lang) => (
                    <div key={lang.id} className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      <EditableText value={lang.language} onChange={(val) => updateLanguage(lang.id, { language: val })} /> (
                      <EditableText value={lang.proficiency} onChange={(val) => updateLanguage(lang.id, { proficiency: val as any })} />)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
