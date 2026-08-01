import React from 'react';
import { useResumeStore } from '../../store/useResumeStore';
import { PersonalInfoForm } from './PersonalInfoForm';
import { SummaryForm } from './SummaryForm';
import { ExperienceForm } from './ExperienceForm';
import { EducationForm } from './EducationForm';
import { ProjectsForm } from './ProjectsForm';
import { SkillsForm } from './SkillsForm';
import { CertificatesForm } from './CertificatesForm';
import { LanguagesForm } from './LanguagesForm';
import { TemplateSettingsForm } from './TemplateSettingsForm';
import { AtsAnalysisPanel } from '../ats/AtsAnalysisPanel';

interface ResumeFormContainerProps {
  onAiImproveSummary?: () => void;
}

export const ResumeFormContainer: React.FC<ResumeFormContainerProps> = () => {
  const { activeSection } = useResumeStore();

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personalInfo':
        return <PersonalInfoForm />;
      case 'summary':
        return <SummaryForm />;
      case 'experiences':
        return <ExperienceForm />;
      case 'educations':
        return <EducationForm />;
      case 'projects':
        return <ProjectsForm />;
      case 'skills':
        return <SkillsForm />;
      case 'certificates':
        return <CertificatesForm />;
      case 'languages':
        return <LanguagesForm />;
      case 'settings':
        return <TemplateSettingsForm />;
      case 'ats':
        return <AtsAnalysisPanel isEmbedded={true} />;
      default:
        return <PersonalInfoForm />;
    }
  };

  return <div className="p-4 max-w-2xl mx-auto">{renderActiveSection()}</div>;
};
