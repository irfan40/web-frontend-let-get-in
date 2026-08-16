export type CurrentStatus =
  | 'employed_happy'
  | 'unemployed'
  | 'urgently_looking'
  | 'employed_switching'
  | 'employed_higher_opportunities';

export type EmploymentTypePref = 'all' | 'full-time' | 'part-time' | 'contract-freelance';
export type ContactChannel = 'email' | 'mobile' | 'inbox' | 'linkedin';
export type ContactTiming = 'morning' | 'noon' | 'evening' | 'night';
export type YesNo = 'yes' | 'no';

export interface YesNoDescribe {
  value: YesNo | null;
  description?: string;
}

export interface AiApplyPreferences {
  currentStatus?: CurrentStatus;
  desiredJobTitles: string[];
  resumeId?: string;
  resumePriority: number;
  coverLetterId?: string;
  coverLetterPriority?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  preferredCountry?: string;
  preferredState?: string;
  preferredLocation?: string;
  willingToRelocate?: YesNo;
  industries: string[];
  employmentType?: EmploymentTypePref;
  joiningDate?: string;
  hasDisabilityOrChronicCondition: YesNoDescribe;
  hasMedicalConditionNeedsAttention: YesNoDescribe;
  okWithShiftJobs?: YesNo;
  hasAllergies: YesNoDescribe;
  contactChannels: ContactChannel[];
  contactTiming?: ContactTiming;
  status?: 'draft' | 'active' | 'paused';
}

export interface AiApplySuggestions {
  resumeId?: string;
  resumeReason?: string;
  coverLetterId?: string;
  coverLetterReason?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  industries: string[];
  employmentType: EmploymentTypePref;
  joiningDate?: string;
  preferredCountry?: string;
  preferredState?: string;
  preferredLocation?: string;
  contactChannels: ContactChannel[];
}

export interface AiApplyResumeOption {
  id: string;
  title: string;
  headline?: string;
  templateId?: string;
  atsScore?: number;
  updatedAt?: string;
}

export interface AiApplyCoverLetterOption {
  id: string;
  title: string;
  content: string;
  updatedAt?: string;
}

export interface AiApplyAssistResponse {
  action: 'status_suggestion' | 'title_expansion';
  suggestedStatus?: CurrentStatus;
  statusReason?: string;
  suggestedTitles?: string[];
  aiUnavailable: boolean;
}

export interface ApplyForJobsResult {
  appliedCount: number;
  skippedDuplicates: number;
  jobs: Array<{ jobId: string; title: string; company?: string; matchScore: number }>;
}

function createEmptyYesNoDescribe(): YesNoDescribe {
  return { value: null, description: '' };
}

export function createInitialPreferences(): AiApplyPreferences {
  return {
    currentStatus: undefined,
    desiredJobTitles: [],
    resumeId: undefined,
    resumePriority: 1,
    coverLetterId: undefined,
    coverLetterPriority: 1,
    salaryMin: undefined,
    salaryMax: undefined,
    salaryCurrency: 'INR',
    preferredCountry: '',
    preferredState: '',
    preferredLocation: '',
    willingToRelocate: undefined,
    industries: [],
    employmentType: undefined,
    joiningDate: undefined,
    hasDisabilityOrChronicCondition: createEmptyYesNoDescribe(),
    hasMedicalConditionNeedsAttention: createEmptyYesNoDescribe(),
    okWithShiftJobs: undefined,
    hasAllergies: createEmptyYesNoDescribe(),
    contactChannels: [],
    contactTiming: undefined,
    status: 'draft',
  };
}
