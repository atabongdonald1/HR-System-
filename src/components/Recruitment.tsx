import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';
import { MOCK_CANDIDATES, MOCK_JOBS } from '../constants';
import { Candidate, JobPost } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';

export function Recruitment() {
  const [activeView, setActiveView] = useState<'jobs' | 'candidates'>('candidates');
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [jobs, setJobs] = useState<JobPost[]>(MOCK_JOBS);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSourcing, setIsSourcing] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', description: '' });
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [skillFilter, setSkillFilter] = useState<string>('All');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const handleSchedule = (candidateId: string) => {
    setSchedulingId(candidateId);
    // Simulate API call
    setTimeout(() => {
      setCandidates(prev => prev.map(c => 
        c.id === candidateId ? { ...c, status: 'Interviewing' } : c
      ));
      setSchedulingId(null);
      setToastMessage({
        title: 'Interview Scheduled',
        description: 'A calendar invite has been sent to the candidate.'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1500);
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
        email: `${analysis.name?.toLowerCase().replace(/\s/g, '.')}@example.com`,
        phone: '+971 50 000 0000',
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

      setCandidates(prev => [newCandidate, ...prev]);
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

  const handleAutoSource = async () => {
    setIsSourcing(true);
    try {
      const sourcedCandidates = await geminiService.sourceCandidates(jobs);
      
      const newCandidates: Candidate[] = sourcedCandidates.map((c: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: c.name,
        email: c.email,
        phone: c.phone || '+971 50 000 0000',
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

      setCandidates(prev => [...newCandidates, ...prev]);
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
    setIsCollecting(true);
    try {
      const collectedCandidates = await geminiService.collectCVs(jobs);
      
      const newCandidates: Candidate[] = collectedCandidates.map((c: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: c.name,
        email: c.email,
        phone: c.phone || '+971 50 000 0000',
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

      setCandidates(prev => [...newCandidates, ...prev]);
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
  const uniqueRoles = ['All', ...new Set(candidates.map(c => c.role))];
  const uniqueStatuses = ['All', 'New', 'Screening', 'Interviewing', 'Offered', 'Hired', 'Rejected'];
  const allSkills = candidates.flatMap(c => c.skills);
  const uniqueSkills = ['All', ...new Set(allSkills)];

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

  return (
    <div id="recruitment-view" className="space-y-8">
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
              onClick={handleAutoSource}
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
            <p className="text-xl font-bold text-slate-900">18 Days</p>
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
              filteredCandidates.map((candidate) => (
                <div key={candidate.id} id={`candidate-card-${candidate.id}`} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
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
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <Globe className="w-2.5 h-2.5" />
                            {candidate.source}
                          </span>
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
                  
                  <div className="flex items-start gap-8">
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end text-blue-600 mb-1">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xl font-bold">{candidate.hireScore}</span>
                        <span className="text-slate-400 text-sm font-normal">/100</span>
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Hire Score</p>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
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
            ))
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
            {jobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                    <p className="text-slate-500 text-sm">{job.department} • {job.location}</p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {job.status}
                  </span>
                </div>
                <div className="flex gap-4 mb-6">
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <Wallet className="w-4 h-4" />
                    {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()} {job.salaryRange.currency}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <Users className="w-4 h-4" />
                    12 Applicants
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Requirements</p>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map(req => (
                      <span key={req} className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs">
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
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candidate Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="relative h-32 bg-slate-900">
                <button 
                  onClick={() => setSelectedCandidate(null)}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-8 pb-8 -mt-12">
                <div className="flex items-end gap-6 mb-6">
                  <div className="w-24 h-24 bg-slate-100 rounded-3xl border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-slate-400">
                    {selectedCandidate.name.charAt(0)}
                  </div>
                  <div className="pb-2">
                    <h3 className="text-2xl font-bold text-slate-900">{selectedCandidate.name}</h3>
                    <p className="text-blue-600 font-medium">{selectedCandidate.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-4">Contact Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Mail className="w-4 h-4 text-blue-500" />
                          </div>
                          {selectedCandidate.email}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Phone className="w-4 h-4 text-blue-500" />
                          </div>
                          {selectedCandidate.phone}
                        </div>
                        {selectedCandidate.source && (
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              <Globe className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="font-medium text-indigo-600 uppercase tracking-wider text-[10px]">
                              Source: {selectedCandidate.source}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-4">Education</h4>
                      <div className="flex items-start gap-3 text-sm text-slate-600">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                          <GraduationCap className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="pt-1.5">{selectedCandidate.education}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.skills.map(skill => (
                          <span key={skill} className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">NEXA Score</h4>
                        <div className="flex items-center gap-1 text-blue-600">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-lg font-bold">{selectedCandidate.hireScore}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>SKILLS MATCH</span>
                            <span>{selectedCandidate.analysis?.skillsMatch}%</span>
                          </div>
                          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600" style={{ width: `${selectedCandidate.analysis?.skillsMatch}%` }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>CULTURAL FIT</span>
                            <span>{selectedCandidate.analysis?.culturalFit}%</span>
                          </div>
                          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600" style={{ width: `${selectedCandidate.analysis?.culturalFit}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <button 
                        id="btn-modal-schedule"
                        onClick={() => {
                          handleSchedule(selectedCandidate.id);
                          setSelectedCandidate(null);
                        }}
                        disabled={schedulingId !== null}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                      >
                        {schedulingId === selectedCandidate.id ? 'Scheduling...' : 'Schedule Interview'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
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
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600 shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form 
                className="p-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  
                  if (activeView === 'candidates') {
                    const newCandidate: Candidate = {
                      id: Math.random().toString(36).substr(2, 9),
                      name: formData.get('name') as string,
                      email: formData.get('email') as string,
                      phone: formData.get('phone') as string,
                      role: formData.get('role') as string,
                      experience: Number(formData.get('experience')),
                      skills: (formData.get('skills') as string).split(',').map(s => s.trim()),
                      education: formData.get('education') as string || 'Not specified',
                      hireScore: 70,
                      status: 'New',
                      source: 'Manual Entry',
                      analysis: {
                        skillsMatch: 70,
                        experienceRelevance: 70,
                        behavioralIndicators: ['Manual Entry'],
                        culturalFit: 70,
                        summary: 'Manually added candidate profile.'
                      }
                    };
                    setCandidates(prev => [newCandidate, ...prev]);
                    setToastMessage({
                      title: 'Candidate Added',
                      description: `${newCandidate.name} has been added to the pool.`
                    });
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
                      description: formData.get('education') as string || 'Manually created job post.',
                      requirements: (formData.get('skills') as string).split(',').map(s => s.trim()),
                      screeningQuestions: [],
                      status: 'Open'
                    };
                    setJobs(prev => [newJob, ...prev]);
                    setToastMessage({
                      title: 'Job Post Created',
                      description: `The position "${newJob.title}" has been published.`
                    });
                  }
                  
                  setIsAddModalOpen(false);
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 3000);
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
                    name="education"
                    rows={2}
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

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
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
