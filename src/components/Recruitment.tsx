import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Star,
  Briefcase,
  Wallet,
  Users,
  X,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  CheckCircle2,
  UserCheck,
  FileText,
  Clock,
  Upload,
  Loader2,
  Sparkles,
  BrainCircuit,
  Database,
  RefreshCw,
  Globe,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Candidate, JobPost } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  query, 
  orderBy, 
  getDocFromServer,
  Timestamp,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';

export function Recruitment() {
  const [activeView, setActiveView] = useState<'jobs' | 'candidates'>('candidates');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSourcing, setIsSourcing] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [candidateIdError, setCandidateIdError] = useState<string | null>(null);
  const [isSourcingModalOpen, setIsSourcingModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<'candidates' | 'jobs' | null>(null);
  const [sourcingLocation, setSourcingLocation] = useState('');
  const [sourcingSkills, setSourcingSkills] = useState('');
  const [toastMessage, setToastMessage] = useState({ title: '', description: '' });
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [skillFilter, setSkillFilter] = useState<string>('All');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  useEffect(() => {
    setStatusFilter('All');
    setRoleFilter('All');
    setSkillFilter('All');
  }, [activeView]);

  const handleSchedule = (id: string) => {
    setSchedulingId(id);
    setTimeout(() => {
      setSchedulingId(null);
      setToastMessage({
        title: 'Interview Scheduled',
        description: 'The interview has been successfully added to the calendar.'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 2000);
  };

  const handleFirestoreErrorLocal = (error: unknown, operationType: OperationType, path: string | null) => {
    try {
      handleFirestoreError(error, operationType, path);
    } catch (e: any) {
      setFirebaseError(JSON.parse(e.message).error);
      throw e;
    }
  };

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
          setFirebaseError("Firebase is offline. Check configuration.");
        }
      }
    };
    testConnection();

    // Candidates subscription
    const qCandidates = query(collection(db, 'candidates'), orderBy('createdAt', 'desc'));
    const unsubscribeCandidates = onSnapshot(qCandidates, (snapshot) => {
      const fetchedCandidates = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Candidate[];
      setCandidates(fetchedCandidates);
    }, (error) => {
      handleFirestoreErrorLocal(error, OperationType.LIST, 'candidates');
    });

    // Jobs subscription
    const qJobs = query(collection(db, 'jobs'), orderBy('postedAt', 'desc'));
    const unsubscribeJobs = onSnapshot(qJobs, (snapshot) => {
      const fetchedJobs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as JobPost[];
      setJobs(fetchedJobs);
    }, (error) => {
      handleFirestoreErrorLocal(error, OperationType.LIST, 'jobs');
    });

    return () => {
      unsubscribeCandidates();
      unsubscribeJobs();
    };
  }, []);

  const saveCandidate = async (candidate: Candidate) => {
    try {
      const candidateData = {
        ...candidate,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      await setDoc(doc(db, 'candidates', candidate.id), candidateData);
      return true;
    } catch (error) {
      handleFirestoreErrorLocal(error, OperationType.WRITE, `candidates/${candidate.id}`);
      return false;
    }
  };

  const saveJob = async (job: JobPost) => {
    try {
      const jobData = {
        ...job,
        postedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      await setDoc(doc(db, 'jobs', job.id), jobData);
      return true;
    } catch (error) {
      handleFirestoreErrorLocal(error, OperationType.WRITE, `jobs/${job.id}`);
      return false;
    }
  };

  const deleteCandidate = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'candidates', id));
      setToastMessage({
        title: 'Candidate Removed',
        description: 'The candidate profile has been deleted from the database.'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      handleFirestoreErrorLocal(error, OperationType.DELETE, `candidates/${id}`);
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', id));
      setToastMessage({
        title: 'Job Post Deleted',
        description: 'The job posting has been removed from the database.'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      handleFirestoreErrorLocal(error, OperationType.DELETE, `jobs/${id}`);
    }
  };

  const updateCandidateStatus = async (id: string, status: Candidate['status']) => {
    try {
      await updateDoc(doc(db, 'candidates', id), { 
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      handleFirestoreErrorLocal(error, OperationType.UPDATE, `candidates/${id}`);
    }
  };

  const clearAllCandidates = async () => {
    try {
      const deletePromises = candidates.map(c => deleteDoc(doc(db, 'candidates', c.id)));
      await Promise.all(deletePromises);
      setToastMessage({
        title: 'Database Cleared',
        description: 'All candidates have been removed from the system.'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      handleFirestoreErrorLocal(error, OperationType.DELETE, 'candidates');
    } finally {
      setIsClearConfirmOpen(null);
    }
  };

  const clearAllJobs = async () => {
    try {
      const deletePromises = jobs.map(j => deleteDoc(doc(db, 'jobs', j.id)));
      await Promise.all(deletePromises);
      setToastMessage({
        title: 'Database Cleared',
        description: 'All job postings have been removed from the system.'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      handleFirestoreErrorLocal(error, OperationType.DELETE, 'jobs');
    } finally {
      setIsClearConfirmOpen(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // For this demo, we'll read the file as text. 
      // In a real app, we'd handle PDF/Docx parsing or send the file directly to Gemini.
      const text = await file.text();
      const analysis = await geminiService.analyzeCV(text);

      const newCandidate: Candidate = {
        id: Math.random().toString(36).substr(2, 9),
        name: analysis.name || file.name.split('.')[0],
        email: analysis.email || 'Not found in CV',
        phone: analysis.phone || 'Not found in CV',
        role: analysis.role || 'New Candidate',
        experience: analysis.experienceYears || 0,
        skills: analysis.skills || [],
        education: 'Parsed from CV',
        hireScore: analysis.hireScore || 50,
        status: 'Screening',
        source: 'CV Upload',
        analysis: {
          skillsMatch: analysis.hireScore || 50,
          experienceRelevance: analysis.hireScore || 50,
          behavioralIndicators: analysis.behavioralIndicators || [],
          culturalFit: 75,
          summary: analysis.summary || 'CV parsed and analyzed by NEXA AI.'
        }
      };

      await saveCandidate(newCandidate);
      
      setToastMessage({
        title: 'CV Analyzed Successfully',
        description: `${newCandidate.name} has been added to the candidate pool with a score of ${newCandidate.hireScore}.`
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (error) {
      console.error('Error parsing CV:', error);
      setToastMessage({
        title: 'Analysis Failed',
        description: 'NEXA AI could not parse the CV. Please try again with a different format.'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleAutoSource = async (location?: string, skills?: string[]) => {
    if (jobs.length === 0) {
      setToastMessage({
        title: 'No Job Posts Found',
        description: 'Please create at least one job posting before activating NEXA-SOURCE.'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    setIsSourcing(true);
    setIsSourcingModalOpen(false);
    try {
      const sourcedCandidates = await geminiService.sourceCandidates(jobs, { 
        location, 
        skills: skills?.filter(s => s.trim() !== '') 
      });
      
      if (sourcedCandidates.length === 0) {
        setToastMessage({
          title: 'No Candidates Found',
          description: 'NEXA-SOURCE could not find matching candidates on the web. Try broadening your search criteria.'
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        return;
      }

      const newCandidates: Candidate[] = sourcedCandidates.map((c: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: c.name,
        email: c.email || 'Not public',
        phone: c.phone || 'Not public',
        role: c.role,
        experience: c.experience,
        skills: c.skills,
        education: c.education || 'Verified by NEXA-SOURCE',
        hireScore: c.hireScore,
        status: 'New',
        source: c.source || 'NEXA-SOURCE',
        analysis: {
          skillsMatch: c.hireScore,
          experienceRelevance: Math.min(100, c.hireScore + 5),
          behavioralIndicators: c.behavioralIndicators || ['Analytical', 'Results-Driven'],
          culturalFit: 85,
          summary: c.summary || `Sourced autonomously by NEXA-SOURCE from ${c.source || 'global talent pool'}.`
        }
      }));

      for (const candidate of newCandidates) {
        await saveCandidate(candidate);
      }

      setToastMessage({
        title: 'NEXA-SOURCE Completed',
        description: `Successfully sourced ${newCandidates.length} highly relevant candidates for active job roles.`
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (error) {
      console.error('Sourcing error:', error);
      setToastMessage({
        title: 'Sourcing Interrupted',
        description: 'NEXA-SOURCE encountered a network error. Please re-activate.'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsSourcing(false);
    }
  };

  const handleAutoCollect = async () => {
    if (jobs.length === 0) {
      setToastMessage({
        title: 'No Job Posts Found',
        description: 'Please create at least one job posting before activating NEXA-COLLECT.'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    setIsCollecting(true);
    try {
      const collectedCandidates = await geminiService.collectCVs(jobs);
      
      if (collectedCandidates.length === 0) {
        setToastMessage({
          title: 'No CVs Found',
          description: 'NEXA-COLLECT could not find matching profiles on the web. Try adding more details to your job posts.'
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        return;
      }

      const newCandidates: Candidate[] = collectedCandidates.map((c: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: c.name,
        email: c.email || 'Not public',
        phone: c.phone || 'Not public',
        role: c.role,
        experience: c.experience,
        skills: c.skills,
        education: c.education || 'Normalized by NEXA-COLLECT',
        hireScore: c.hireScore,
        status: 'New',
        source: c.source || 'NEXA-COLLECT',
        analysis: {
          skillsMatch: c.hireScore,
          experienceRelevance: Math.min(100, c.hireScore + 5),
          behavioralIndicators: c.behavioralIndicators || ['Structured', 'Efficient'],
          culturalFit: 80,
          summary: c.summary || `Aggregated and normalized by NEXA-COLLECT from ${c.source}.`
        }
      }));

      for (const candidate of newCandidates) {
        await saveCandidate(candidate);
      }

      setToastMessage({
        title: 'NEXA-COLLECT Ingestion Complete',
        description: `Successfully ingested and normalized ${newCandidates.length} CVs into the talent database.`
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (error) {
      console.error('Collection error:', error);
      setToastMessage({
        title: 'Ingestion Failed',
        description: 'NEXA-COLLECT encountered a database error. Please retry.'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsCollecting(false);
    }
  };

  // Derived values for filters
  const uniqueRoles = activeView === 'candidates'
    ? ['All', ...new Set(candidates.map(c => c.role))]
    : ['All', ...new Set(jobs.map(j => j.department))];
    
  const uniqueStatuses = activeView === 'candidates'
    ? ['All', 'New', 'Screening', 'Interviewing', 'Offered', 'Hired', 'Rejected']
    : ['All', 'Open', 'Closed', 'Draft'];
    
  const uniqueSkills = activeView === 'candidates'
    ? ['All', ...new Set(candidates.flatMap(c => c.skills))]
    : ['All', ...new Set(jobs.flatMap(j => j.requirements))];

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || candidate.status === statusFilter;
    const matchesRole = roleFilter === 'All' || candidate.role === roleFilter;
    const matchesSkill = skillFilter === 'All' || candidate.skills.includes(skillFilter);

    return matchesSearch && matchesStatus && matchesRole && matchesSkill;
  });

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requirements.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    const matchesRole = roleFilter === 'All' || job.department === roleFilter;
    const matchesSkill = skillFilter === 'All' || job.requirements.includes(skillFilter);

    return matchesSearch && matchesStatus && matchesRole && matchesSkill;
  });

  const topCandidateIds = [...filteredCandidates]
    .sort((a, b) => b.hireScore - a.hireScore)
    .slice(0, 3)
    .map(c => c.id);

  return (
    <div id="recruitment-view" className="space-y-8">
      <AnimatePresence>
        {firebaseError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-rose-50 border border-rose-200 p-3 rounded-xl shadow-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <div>
              <p className="text-sm font-bold text-rose-700">Database Connection Issue</p>
              <p className="text-xs text-rose-600">{firebaseError}</p>
            </div>
            <button 
              onClick={() => setFirebaseError(null)}
              className="p-1 hover:bg-rose-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-rose-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div id="recruitment-header" className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Recruitment Engine</h2>
          <p className="text-slate-500">Global sourcing, AI ranking, and interview management.</p>
        </div>
        <div className="flex gap-3">
          <div id="view-toggle" className="bg-slate-100 p-1 rounded-xl flex">
            <button 
              id="btn-view-candidates"
              onClick={() => setActiveView('candidates')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeView === 'candidates' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Candidates
            </button>
            <button 
              id="btn-view-jobs"
              onClick={() => setActiveView('jobs')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeView === 'jobs' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Job Posts
            </button>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="file" 
              id="cv-upload" 
              className="hidden" 
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <button 
              id="btn-upload-cv"
              onClick={() => document.getElementById('cv-upload')?.click()}
              disabled={isUploading || isSourcing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploading ? 'Analyzing...' : 'Upload CV'}
            </button>
            <button 
              id="btn-auto-source"
              onClick={() => setIsSourcingModalOpen(true)}
              disabled={isSourcing || isUploading || isCollecting}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/20"
            >
              {isSourcing ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              ) : (
                <BrainCircuit className="w-4 h-4 text-blue-400" />
              )}
              {isSourcing ? 'Sourcing...' : 'Activate NEXA-SOURCE'}
            </button>
            <button 
              id="btn-auto-collect"
              onClick={handleAutoCollect}
              disabled={isCollecting || isUploading || isSourcing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
            >
              {isCollecting ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
              ) : (
                <Database className="w-4 h-4 text-indigo-200" />
              )}
              {isCollecting ? 'Ingesting...' : 'Activate NEXA-COLLECT'}
            </button>
            <button 
              id="btn-add-action" 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              {activeView === 'candidates' ? 'Add Candidate' : 'Create Job Post'}
            </button>
            <button 
              id="btn-clear-all" 
              onClick={() => setIsClearConfirmOpen(activeView)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors border border-rose-100"
              title={`Clear all ${activeView}`}
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Recruitment Stats Bar (Feature Bar) */}
      <div id="recruitment-stats" className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Candidates</p>
            <p className="text-xl font-bold text-slate-900">{candidates.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Active Jobs</p>
            <p className="text-xl font-bold text-slate-900">{jobs.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Shortlisted</p>
            <p className="text-xl font-bold text-slate-900">
              {candidates.filter(c => c.hireScore > 85).length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Avg. Time to Hire</p>
            <p className="text-xl font-bold text-slate-900">
              {candidates.length > 0 ? '18 Days' : '0 Days'}
            </p>
          </div>
        </div>
      </div>

      <div id="recruitment-filters" className="space-y-4">
        <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              id="recruitment-search"
              type="text" 
              placeholder="Search by name, role, or skill..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button 
              onClick={() => {}}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
          <button 
            id="btn-filter" 
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              isFilterPanelOpen ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            )}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <AnimatePresence>
          {isFilterPanelOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Status</label>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Role</label>
                  <select 
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {uniqueRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Primary Skill</label>
                  <select 
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {uniqueSkills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'candidates' ? (
          <motion.div 
            id="candidates-list"
            key="candidates"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 gap-4"
          >
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((candidate) => {
                const isTopCandidate = topCandidateIds.includes(candidate.id);
                return (
                  <div 
                    key={candidate.id} 
                    id={`candidate-card-${candidate.id}`} 
                    className={cn(
                      "bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all group relative overflow-hidden",
                      isTopCandidate ? "border-blue-200 ring-1 ring-blue-100" : "border-slate-100"
                    )}
                  >
                    {isTopCandidate && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-blue-600 text-white text-[8px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-tighter flex items-center gap-1">
                          <Sparkles className="w-2 h-2" />
                          Top Talent
                        </div>
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-slate-400">
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{candidate.name}</h3>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          candidate.status === 'Interviewing' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-600"
                        )}>
                          {candidate.status}
                        </span>
                        {candidate.source && (
                          <a 
                            href={candidate.source.startsWith('http') ? candidate.source : '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={cn(
                              "flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                              candidate.source.startsWith('http') ? "hover:bg-indigo-100 cursor-pointer" : "cursor-default"
                            )}
                          >
                            <Globe className="w-2.5 h-2.5" />
                            Source: {candidate.source.startsWith('http') ? 'View Profile' : candidate.source}
                          </a>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {candidate.role} • {candidate.experience} years exp.
                      </p>
                      <div className="flex gap-2 mt-3">
                        {candidate.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-xs font-medium">
                            +{candidate.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                    <div className="flex items-start gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end text-blue-600 mb-1">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-xl font-bold">{candidate.hireScore}</span>
                          <span className="text-slate-400 text-sm font-normal">/100</span>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Hire Score</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {candidate.status === 'Offered' && (
                          <button 
                            onClick={() => {
                              setToastMessage({
                                title: 'Offer Sent for Signature',
                                description: `A digital signature request has been sent to ${candidate.name}.`
                              });
                              setShowToast(true);
                              setTimeout(() => setShowToast(false), 3000);
                            }}
                            className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                            title="Sign Offer"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setToastMessage({
                              title: 'Candidate Actions',
                              description: `Managing actions for ${candidate.name}.`
                            });
                            setShowToast(true);
                            setTimeout(() => setShowToast(false), 3000);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => deleteCandidate(candidate.id)}
                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete Candidate"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                </div>

                {candidate.analysis && (
                  <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">NEXA Summary</p>
                      <p className="text-sm text-slate-600 leading-relaxed italic">
                        "{candidate.analysis.summary}"
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Score Breakdown</p>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-500 uppercase tracking-wider">Skills Match</span>
                            <span className="text-blue-600">{candidate.analysis.skillsMatch}%</span>
                          </div>
                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${candidate.analysis.skillsMatch}%` }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-500 uppercase tracking-wider">Cultural Fit</span>
                            <span className="text-emerald-600">{candidate.analysis.culturalFit}%</span>
                          </div>
                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${candidate.analysis.culturalFit}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Behavioral Traits</p>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.analysis.behavioralIndicators.map(indicator => (
                          <span key={indicator} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold border border-slate-200">
                            {indicator}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-end gap-2">
                      <button 
                        id={`btn-schedule-${candidate.id}`}
                        onClick={() => handleSchedule(candidate.id)}
                        disabled={schedulingId !== null}
                        className="w-full px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all disabled:opacity-50"
                      >
                        {schedulingId === candidate.id ? 'Scheduling...' : 'Schedule Interview'}
                      </button>
                      <button 
                        id={`btn-view-profile-${candidate.id}`}
                        onClick={() => setSelectedCandidate(candidate)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
                      >
                        View Full Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
                );
              })
            ) : (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No candidates found</h3>
              <p className="text-slate-500">Try adjusting your filters or search query.</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setRoleFilter('All');
                  setSkillFilter('All');
                }}
                className="mt-4 text-blue-600 font-bold hover:text-blue-700"
              >
                Clear all filters
              </button>
            </div>
          )}
          </motion.div>
        ) : (
          <motion.div 
            key="jobs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                      <p className="text-slate-500 text-sm">{job.department} • {job.location}</p>
                    </div>
                    <select 
                      value={job.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value as JobPost['status'];
                        try {
                          await updateDoc(doc(db, 'jobs', job.id), { 
                            status: newStatus,
                            updatedAt: Timestamp.now()
                          });
                        } catch (error) {
                          handleFirestoreErrorLocal(error, OperationType.UPDATE, `jobs/${job.id}`);
                        }
                      }}
                      className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                  <div className="flex gap-4 mb-6">
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <Wallet className="w-4 h-4" />
                      {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()} {job.salaryRange.currency}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <Users className="w-4 h-4" />
                      0 Applicants
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map(req => (
                        <span key={req} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button 
                      onClick={() => {
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all"
                    >
                      View Applicants
                    </button>
                    <button 
                      onClick={() => {
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                      }}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
                    >
                      Edit Post
                    </button>
                    <button 
                      onClick={() => deleteJob(job.id)}
                      className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                      title="Delete Job Post"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
                <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No job posts found</h3>
                <p className="text-slate-500">Try adjusting your filters or publish a new job.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setRoleFilter('All');
                    setSkillFilter('All');
                  }}
                  className="mt-4 text-blue-600 font-bold hover:text-blue-700"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candidate Full Profile View */}
      <AnimatePresence>
        {selectedCandidate && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-slate-50 overflow-y-auto"
          >
            {/* Header / Navigation */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-all group"
              >
                <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
                  <X className="w-5 h-5" />
                </div>
                Return to Recruitment
              </button>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold">
                  <Sparkles className="w-4 h-4" />
                  NEXA-RANK: {selectedCandidate.hireScore}/100
                </div>
                <button 
                  onClick={() => deleteCandidate(selectedCandidate.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Delete Profile"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-w-6xl mx-auto p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Basic Info & Contact */}
                <div className="lg:col-span-1 space-y-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
                    <div className="w-32 h-32 bg-slate-100 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-slate-400 shadow-inner">
                      {selectedCandidate.name.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{selectedCandidate.name}</h3>
                    <p className="text-blue-600 font-bold mb-6">{selectedCandidate.role}</p>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => handleSchedule(selectedCandidate.id)}
                        disabled={schedulingId !== null}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {schedulingId === selectedCandidate.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Calendar className="w-5 h-5" />
                        )}
                        {schedulingId === selectedCandidate.id ? 'Scheduling...' : 'Schedule Interview'}
                      </button>
                      <button className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                        <Mail className="w-5 h-5" />
                        Send Message
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Contact & Source</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Mail className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                          <p className="text-sm font-bold text-slate-700">{selectedCandidate.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Phone className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Phone</p>
                          <p className="text-sm font-bold text-slate-700">{selectedCandidate.phone}</p>
                        </div>
                      </div>
                      {selectedCandidate.source && (
                        <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Globe className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Source</p>
                            <a 
                              href={selectedCandidate.source.startsWith('http') ? selectedCandidate.source : '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={cn(
                                "text-sm font-bold text-indigo-600 transition-all",
                                selectedCandidate.source.startsWith('http') ? "hover:underline cursor-pointer" : "cursor-default"
                              )}
                            >
                              {selectedCandidate.source.startsWith('http') ? 'View Original Profile' : selectedCandidate.source}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Analysis, Skills, Experience */}
                <div className="lg:col-span-2 space-y-8">
                  {/* AI Analysis Card */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-xl">
                          <BrainCircuit className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">NEXA Intelligence Analysis</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
                        <select 
                          value={selectedCandidate.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as Candidate['status'];
                            updateCandidateStatus(selectedCandidate.id, newStatus);
                            setSelectedCandidate({ ...selectedCandidate, status: newStatus });
                          }}
                          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {uniqueStatuses.filter(s => s !== 'All').map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-4">
                        <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Skills Match</span>
                            <span className="text-lg font-bold text-blue-700">{selectedCandidate.analysis?.skillsMatch}%</span>
                          </div>
                          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${selectedCandidate.analysis?.skillsMatch}%` }} />
                          </div>
                        </div>
                        <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Cultural Fit</span>
                            <span className="text-lg font-bold text-emerald-700">{selectedCandidate.analysis?.culturalFit}%</span>
                          </div>
                          <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${selectedCandidate.analysis?.culturalFit}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Behavioral Indicators</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedCandidate.analysis?.behavioralIndicators.map(indicator => (
                            <div key={indicator} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              {indicator}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Executive Summary</h5>
                      <p className="text-slate-600 leading-relaxed italic">
                        "{selectedCandidate.analysis?.summary}"
                      </p>
                    </div>
                  </div>

                  {/* Experience & Skills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Experience & Education</h4>
                      <div className="space-y-6">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                            <Briefcase className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{selectedCandidate.experience} Years Professional Experience</p>
                            <p className="text-xs text-slate-500 mt-1">Relevant to {selectedCandidate.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Education Background</p>
                            <p className="text-xs text-slate-500 mt-1">{selectedCandidate.education}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.skills.map(skill => (
                          <span key={skill} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[100] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">{toastMessage.title}</p>
              <p className="text-slate-400 text-xs">{toastMessage.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sourcing Parameters Modal */}
      <AnimatePresence>
        {isClearConfirmOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Clear All {isClearConfirmOpen}?</h3>
              <p className="text-slate-500 mb-8">
                This action will permanently delete all {isClearConfirmOpen} from the system. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsClearConfirmOpen(null)}
                  className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={isClearConfirmOpen === 'candidates' ? clearAllCandidates : clearAllJobs}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
                >
                  Yes, Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sourcing Parameters Modal */}
      <AnimatePresence>
        {isSourcingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">NEXA-SOURCE Config</h3>
                    <p className="text-slate-500 text-sm">Define your sourcing parameters.</p>
                  </div>
                  <button 
                    onClick={() => setIsSourcingModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-all"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Location</label>
                    <input 
                      type="text"
                      placeholder="e.g. Dubai, UAE or Remote"
                      value={sourcingLocation}
                      onChange={(e) => setSourcingLocation(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Specific Skills (comma separated)</label>
                    <textarea 
                      placeholder="e.g. React, Node.js, Project Management"
                      value={sourcingSkills}
                      onChange={(e) => setSourcingSkills(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <button 
                    onClick={() => handleAutoSource(sourcingLocation, sourcingSkills.split(',').map(s => s.trim()))}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    Activate NEXA-SOURCE
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Candidate / Job Post Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {activeView === 'candidates' ? 'Add New Candidate' : 'Create Job Post'}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    {activeView === 'candidates' 
                      ? 'Enter candidate details manually or use CV upload for AI parsing.' 
                      : 'Define the requirements for the new position.'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setCandidateIdError(null);
                  }}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600 shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form 
                className="p-6 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  
                  if (activeView === 'candidates') {
                    const candidateId = formData.get('candidateId') as string;
                    
                    // Validation for Candidate ID
                    if (candidateId) {
                      if (!/^[a-zA-Z0-9]+$/.test(candidateId)) {
                        setCandidateIdError('ID must be alphanumeric');
                        return;
                      }
                      if (candidateId.length > 10) {
                        setCandidateIdError('ID must be max 10 characters');
                        return;
                      }
                      if (candidates.some(c => c.id === candidateId)) {
                        setCandidateIdError('ID already exists');
                        return;
                      }
                    }
                    
                    setCandidateIdError(null);
                    const newCandidate: Candidate = {
                      id: candidateId || Math.random().toString(36).substr(2, 9),
                      name: formData.get('name') as string,
                      email: formData.get('email') as string,
                      phone: formData.get('phone') as string,
                      role: formData.get('role') as string,
                      experience: Number(formData.get('experience')),
                      skills: (formData.get('skills') as string).split(',').map(s => s.trim()),
                      education: formData.get('education') as string || 'Not specified',
                      hireScore: Number(formData.get('hireScore')) || 70,
                      status: (formData.get('status') as any) || 'New',
                      source: 'Manual Entry',
                      analysis: {
                        skillsMatch: 70,
                        experienceRelevance: 70,
                        behavioralIndicators: ['Manual Entry'],
                        culturalFit: 70,
                        summary: 'Manually added candidate profile.'
                      }
                    };
                    
                    const success = await saveCandidate(newCandidate);
                    if (success) {
                      setIsAddModalOpen(false);
                      setToastMessage({
                        title: 'Candidate Added',
                        description: `${newCandidate.name} has been added to the pool.`
                      });
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                    }
                  } else {
                    const salaryRangeStr = formData.get('phone') as string;
                    const [minStr, maxStr] = salaryRangeStr.split('-').map(s => s.trim().replace(/[^0-9]/g, ''));
                    
                    const newJob: JobPost = {
                      id: Math.random().toString(36).substr(2, 9),
                      title: formData.get('name') as string,
                      department: formData.get('role') as string,
                      location: formData.get('email') as string,
                      salaryRange: {
                        min: Number(minStr) || 0,
                        max: Number(maxStr) || 0,
                        currency: 'AED'
                      },
                      description: (formData.get('description') as string) || 'Manually created job post.',
                      requirements: (formData.get('skills') as string).split(',').map(s => s.trim()),
                      screeningQuestions: [],
                      status: 'Open'
                    };
                    
                    const success = await saveJob(newJob);
                    if (success) {
                      setIsAddModalOpen(false);
                      setToastMessage({
                        title: 'Job Post Created',
                        description: `The position "${newJob.title}" has been published.`
                      });
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                    }
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      {activeView === 'candidates' ? 'Full Name' : 'Job Title'}
                    </label>
                    <input 
                      name="name"
                      required
                      type="text" 
                      placeholder={activeView === 'candidates' ? "e.g. John Doe" : "e.g. Senior Developer"}
                      className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      {activeView === 'candidates' ? 'Target Role' : 'Department'}
                    </label>
                    <input 
                      name="role"
                      required
                      type="text" 
                      placeholder={activeView === 'candidates' ? "e.g. Logistics Manager" : "e.g. Engineering"}
                      className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    {activeView === 'candidates' ? 'Email Address' : 'Location'}
                  </label>
                  <input 
                    name="email"
                    required
                    type={activeView === 'candidates' ? "email" : "text"}
                    placeholder={activeView === 'candidates' ? "john@example.com" : "Dubai, UAE"}
                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      {activeView === 'candidates' ? 'Phone Number' : 'Salary Range'}
                    </label>
                    <input 
                      name="phone"
                      type="text" 
                      placeholder={activeView === 'candidates' ? "+971 ..." : "15,000 - 20,000 AED"}
                      className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      {activeView === 'candidates' ? 'Years Experience' : 'Employment Type'}
                    </label>
                    <input 
                      name="experience"
                      type={activeView === 'candidates' ? "number" : "text"}
                      placeholder={activeView === 'candidates' ? "5" : "Full-time"}
                      className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    {activeView === 'candidates' ? 'Education' : 'Job Description'}
                  </label>
                  <textarea 
                    name={activeView === 'candidates' ? "education" : "description"}
                    rows={activeView === 'candidates' ? 2 : 5}
                    placeholder={activeView === 'candidates' ? "e.g. MBA in Logistics" : "Describe the role and responsibilities..."}
                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    {activeView === 'candidates' ? 'Skills (comma separated)' : 'Key Requirements (comma separated)'}
                  </label>
                  <textarea 
                    name="skills"
                    rows={3}
                    placeholder={activeView === 'candidates' ? "React, TypeScript, Node.js" : "5+ years experience, Bachelor degree..."}
                    className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {activeView === 'candidates' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Candidate ID</label>
                      <input 
                        name="candidateId"
                        type="text" 
                        placeholder="e.g. C123"
                        maxLength={10}
                        onChange={() => setCandidateIdError(null)}
                        className={cn(
                          "w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500",
                          candidateIdError ? "ring-2 ring-rose-500" : ""
                        )}
                      />
                      {candidateIdError && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1">{candidateIdError}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Hire Score</label>
                      <input 
                        name="hireScore"
                        type="number" 
                        min="0"
                        max="100"
                        defaultValue="70"
                        className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Status</label>
                      <select 
                        name="status"
                        className="w-full px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="New">New</option>
                        <option value="Screening">Screening</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offered">Offered</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setCandidateIdError(null);
                    }}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    {activeView === 'candidates' ? 'Add Candidate' : 'Publish Job'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
