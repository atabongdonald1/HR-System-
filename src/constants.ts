import { Candidate, Employee, JobPost, HRAction } from './types';

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Ahmed',
    email: 'sarah.ahmed@example.com',
    phone: '+971 50 123 4567',
    role: 'Housekeeping Supervisor',
    experience: 8,
    skills: ['Team Management', 'Inventory Control', 'Quality Assurance', 'Hospitality'],
    education: 'Bachelor in Hospitality Management',
    hireScore: 92,
    status: 'Interviewing',
    source: 'LinkedIn',
    analysis: {
      skillsMatch: 95,
      experienceRelevance: 90,
      behavioralIndicators: ['Leadership', 'Attention to Detail'],
      culturalFit: 88,
      summary: 'Highly experienced in UAE hospitality sector. Strong leadership skills and deep understanding of local standards.'
    }
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+44 7700 900000',
    role: 'Logistics Manager',
    experience: 5,
    skills: ['Supply Chain', 'Fleet Management', 'Route Optimization'],
    education: 'MBA in Logistics',
    hireScore: 78,
    status: 'Screening',
    source: 'Indeed',
    analysis: {
      skillsMatch: 80,
      experienceRelevance: 75,
      behavioralIndicators: ['Problem Solving'],
      culturalFit: 80,
      summary: 'Solid background in international logistics. Needs more UAE-specific regulatory knowledge.'
    }
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena.r@example.com',
    phone: '+34 600 000 000',
    role: 'Front Office Manager',
    experience: 12,
    skills: ['Customer Relations', 'Opera PMS', 'Revenue Management'],
    education: 'Bachelor in Tourism',
    hireScore: 95,
    status: 'Offered',
    source: 'Bayt',
    analysis: {
      skillsMatch: 98,
      experienceRelevance: 95,
      behavioralIndicators: ['Strategic Thinking', 'Empathy'],
      culturalFit: 92,
      summary: 'Exceptional candidate with deep luxury hospitality experience.'
    }
  },
  {
    id: '4',
    name: 'Ahmed Hassan',
    email: 'ahmed.h@example.com',
    phone: '+20 100 000 0000',
    role: 'Maintenance Engineer',
    experience: 4,
    skills: ['HVAC', 'Electrical Systems', 'Preventive Maintenance'],
    education: 'B.Sc. Mechanical Engineering',
    hireScore: 82,
    status: 'New',
    source: 'GulfTalent',
    analysis: {
      skillsMatch: 85,
      experienceRelevance: 80,
      behavioralIndicators: ['Technical Proficiency'],
      culturalFit: 85,
      summary: 'Strong technical skills, good potential for growth.'
    }
  },
  {
    id: '5',
    name: 'Yuki Tanaka',
    email: 'yuki.t@example.com',
    phone: '+81 90 0000 0000',
    role: 'Executive Chef',
    experience: 15,
    skills: ['Menu Engineering', 'Food Safety', 'Team Leadership'],
    education: 'Culinary Arts Degree',
    hireScore: 88,
    status: 'Hired',
    source: 'Direct Application',
    analysis: {
      skillsMatch: 90,
      experienceRelevance: 92,
      behavioralIndicators: ['Creativity', 'Discipline'],
      culturalFit: 85,
      summary: 'World-class chef with experience in Michelin-starred restaurants.'
    }
  }
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    name: 'Michael Chen',
    email: 'm.chen@nexa-hr.ai',
    role: 'Senior Data Scientist',
    department: 'Intelligence',
    joinDate: '2024-01-15',
    salary: 35000,
    currency: 'AED',
    performanceScore: 94,
    burnoutRisk: 15,
    resignationProbability: 5,
    kpis: [
      { name: 'Model Accuracy', value: 98, target: 95 },
      { name: 'Project Delivery', value: 100, target: 90 }
    ],
    sentiment: 'Positive'
  },
  {
    id: 'e2',
    name: 'Fatima Al-Mansoori',
    email: 'f.mansoori@nexa-hr.ai',
    role: 'HR Compliance Officer',
    department: 'Legal',
    joinDate: '2023-06-10',
    salary: 28000,
    currency: 'AED',
    performanceScore: 88,
    burnoutRisk: 45,
    resignationProbability: 12,
    kpis: [
      { name: 'Audit Compliance', value: 100, target: 100 },
      { name: 'Policy Updates', value: 85, target: 90 }
    ],
    sentiment: 'Neutral'
  }
];

export const MOCK_JOBS: JobPost[] = [
  {
    id: 'j1',
    title: 'Housekeeping Supervisor',
    department: 'Hospitality',
    location: 'Dubai, UAE',
    salaryRange: { min: 8000, max: 12000, currency: 'AED' },
    description: 'Oversee daily housekeeping operations for a 5-star luxury hotel...',
    requirements: ['5+ years in hospitality', 'UAE experience preferred', 'Fluent English'],
    screeningQuestions: ['How do you handle staff conflicts?', 'What is your experience with chemical safety?'],
    status: 'Open'
  }
];

export const MOCK_ACTIONS: HRAction[] = [
  {
    id: 'a1',
    type: 'Hiring',
    description: 'Shortlisted 5 candidates for Housekeeping Supervisor role.',
    timestamp: new Date().toISOString(),
    status: 'Completed',
    riskLevel: 'Low'
  },
  {
    id: 'a2',
    type: 'Payroll',
    description: 'March payroll calculation completed for 150 employees.',
    timestamp: new Date().toISOString(),
    status: 'Pending',
    riskLevel: 'Medium'
  }
];
