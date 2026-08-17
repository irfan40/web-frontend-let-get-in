export type ApplicationStatus =
  | 'submitted'
  | 'reviewing'
  | 'interviewing'
  | 'offered'
  | 'rejected'
  | 'failed';

export type ApplicationSource = 'ai_apply' | 'manual';

export interface ApplicationJobDetail {
  _id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
    website?: string;
  };
  location?: {
    city?: string;
    state?: string;
    country?: string;
    remote?: boolean;
  };
  salary?: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  experienceLevel?: string;
  minimumExperience?: number;
  maximumExperience?: number;
  employmentType?: string;
  workplaceType?: string;
  skills?: string[];
  responsibilities?: string[];
  requirements?: string[];
  preferredQualifications?: string[];
  educationRequirements?: string;
  benefits?: string[];
  applicationUrl?: string;
  description?: string;
  status?: string;
  publishedAt?: string;
}

export interface ApplicationItem {
  _id: string;
  job: ApplicationJobDetail | null;
  resume: { _id: string; title: string } | null;
  coverLetter: { _id: string; title: string } | null;
  source: ApplicationSource;
  status: ApplicationStatus;
  matchScore: number;
  notes: string;
  appliedAt: string;
  createdAt: string;
}

export interface ApplicationStats {
  total: number;
  submitted: number;
  reviewing: number;
  interviewing: number;
  offered: number;
  rejected: number;
  aiApplied: number;
  manualApplied: number;
  avgMatchScore: number;
  appliedThisWeek: number;
}

export interface ApplicationsResponse {
  applications: ApplicationItem[];
  stats: ApplicationStats;
  recentBatches: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
