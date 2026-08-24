export type EntityType = "company" | "institution" | "startup";

export interface OrgFormMeta {
  entity: EntityType;
  label: string;
  regLabel: string;
  typeLabel: string;
  typeOptions: string[];
  sizeLabel: string;
  sizeOptions: string[];
  valuationLabel: string;
  leaderLabel: string;
  urlPlaceholder: string;
}

export type EmploymentType = "full-time" | "part-time" | "contract" | "internship" | "freelance";
export type WorkplaceType = "remote" | "hybrid" | "onsite";
export type RecruiterJobStage = "open" | "shortlisting" | "interview" | "review" | "completed";

export type PipelineSection = "resumeMatch" | "assessment" | "aiInterview";

export interface PipelineOptions {
  matchVolume: string | null;
  resumeMatch: boolean;
  resumeMatchTypes: string[];
  assessment: boolean;
  assessmentTypes: string[];
  aiInterview: boolean;
  aiInterviewTypes: string[];
}

export interface PipelineSubOption {
  key: string;
  label: string;
}

export interface PipelineSubOptionsCatalog {
  resumeMatch: PipelineSubOption[];
  assessment: PipelineSubOption[];
  aiInterview: PipelineSubOption[];
}

export interface MatchVolumeOption {
  key: string;
  label: string;
  credits: number;
}

export interface RecruiterJob {
  _id: string;
  title: string;
  company: { name: string; logo?: string; website?: string };
  description: string;
  skills: string[];
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  location: { city?: string; state?: string; country: string; remote: boolean };
  salaryText?: string;
  status: string;
  recruiterStage?: RecruiterJobStage;
  pipelineOptions?: PipelineOptions;
  creditsCost?: number;
  applicantCount?: number;
  eligibilityMinPercent?: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedJobContent {
  description: string;
  skills: string[];
}

export interface CreateJobInput {
  title: string;
  companyName?: string;
  location?: string;
  employmentType?: EmploymentType;
  workplaceType?: WorkplaceType;
  salaryText?: string;
  skills?: string[];
  description?: string;
  eligibilityMinPercent?: number;
  deadline?: string;
  saveAsDraft?: boolean;
  pipelineOptions?: PipelineOptions;
}


export interface Applicant {
  _id: string;
  candidate: {
    _id?: string;
    fullName?: string;
    username?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    avatar?: string;
  } | null;
  resume: { _id?: string; title?: string } | null;
  status: string;
  matchScore: number;
  assessmentScore?: number;
  aiScore?: number;
  notes: string;
  appliedAt: string;
}

export interface CreditPack {
  id: string;
  credits: number;
  price: number;
  best?: boolean;
}

export interface SourcedCandidate {
  candidateUserId: string;
  name: string;
  headline?: string;
  location?: string;
  skills?: string[];
  yearsOfExperience?: number;
  matchScore: number;
  email?: string;
  phone?: string;
  contactRevealed: boolean;
}

export interface AllApplicant {
  _id: string;
  jobId: string;
  jobTitle: string;
  candidate: {
    _id?: string;
    fullName?: string;
    username?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    avatar?: string;
  } | null;
  resume: { _id?: string; title?: string } | null;
  status: string;
  matchScore: number;
  assessmentScore?: number;
  aiScore?: number;
  appliedAt: string;
}

export interface RecruiterOverview {
  kpis: {
    openRoles: number;
    openRolesContext?: string;
    activeCandidates: number;
    avgTimeToFillDays: number | null;
    aiMatchRate: number | null;
    credits: number;
  };
  recentActivity: {
    jobId: string;
    title: string;
    applicantCount: number;
    stage: string;
    updatedAt: string;
  }[];
  topMatches: {
    candidateName: string;
    headline?: string;
    yearsOfExperience?: number;
    jobTitle: string;
    matchScore: number;
  }[];
  funnel: { stage: string; label: string; count: number }[];
  aiInsights: { kind: "suggestion" | "success" | "warning"; text: string }[];
  funnelInsights: { kind: "success" | "warning"; text: string }[];
}

export interface OrgProfile {
  _id?: string;
  ownerUserId?: string;
  entity: EntityType;
  name: string;
  address?: string;
  orgType?: string;
  employees?: string;
  valuation?: string;
  ceoName?: string;
  ceoEmail?: string;
  phone?: string;
  industry?: string;
  founded?: string;
  website?: string;
  registrationId?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OrgAutofillFields = Partial<
  Pick<
    OrgProfile,
    | "name"
    | "address"
    | "orgType"
    | "employees"
    | "valuation"
    | "ceoName"
    | "ceoEmail"
    | "founded"
    | "registrationId"
    | "bio"
  >
>;
