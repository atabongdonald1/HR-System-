export type Role = 'CHRO' | 'Talent Acquisition' | 'Psychologist' | 'Data Scientist' | 'Compliance' | 'Architect';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  experience: number; // years
  skills: string[];
  education: string;
  cvUrl?: string;
  hireScore: number; // 0-100
  status: 'New' | 'Screening' | 'Interviewing' | 'Offered' | 'Hired' | 'Rejected';
  source?: string;
  analysis?: {
    skillsMatch: number;
    experienceRelevance: number;
    behavioralIndicators: string[];
    culturalFit: number;
    summary: string;
  };
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  salary: number;
  currency: string;
  performanceScore: number;
  burnoutRisk: number; // 0-100
  resignationProbability: number; // 0-100
  kpis: {
    name: string;
    value: number;
    target: number;
  }[];
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

export interface JobPost {
  id: string;
  title: string;
  department: string;
  location: string;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  screeningQuestions: string[];
  status: 'Open' | 'Closed' | 'Draft';
}

export interface HRAction {
  id: string;
  type: 'Hiring' | 'Onboarding' | 'Performance' | 'Promotion' | 'Termination' | 'Payroll';
  description: string;
  timestamp: string;
  status: 'Pending' | 'Completed' | 'Flagged';
  riskLevel: 'Low' | 'Medium' | 'High';
}
