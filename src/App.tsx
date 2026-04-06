/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Recruitment } from './components/Recruitment';
import { Workforce } from './components/Workforce';
import { Compliance } from './components/Compliance';
import { Payroll } from './components/Payroll';
import { Performance } from './components/Performance';
import { SearchResults } from './components/SearchResults';
import { AIConsole } from './components/AIConsole';
import { Settings } from './components/Settings';
import { NotificationPanel } from './components/NotificationPanel';
import { 
  Bell, 
  Search, 
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Calendar,
  User,
  Users,
  Briefcase,
  BrainCircuit,
  LogOut,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from './lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Employee } from './types';
import { notificationService } from './services/notificationService';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [searchScope, setSearchScope] = useState('All');
  const [dateRange, setDateRange] = useState('Anytime');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isFixLoginModalOpen, setIsFixLoginModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [globalToast, setGlobalToast] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

  const triggerGlobalToast = (message: string) => {
    setGlobalToast({ show: true, message });
    setTimeout(() => setGlobalToast({ show: false, message: '' }), 3000);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsAuthReady(!!user);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Fetch Employees for proactive alerts and search
    const unsubEmployees = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Employee);
      setEmployees(fetched);
    });

    // Fetch Candidates for search
    const unsubCandidates = onSnapshot(collection(db, 'candidates'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setCandidates(fetched);
    });

    // Fetch Jobs for search
    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setJobs(fetched);
    });

    // Fetch Unread Notifications count
    const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const unreadCount = snapshot.docs.filter(d => !d.data().read).length;
      setUnreadNotifications(unreadCount);
    });

    return () => {
      unsubEmployees();
      unsubCandidates();
      unsubJobs();
      unsubNotifications();
    };
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      const timer = setTimeout(() => {
        notificationService.generateProactiveAlerts(employees);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [employees.length]);

  const getSearchResults = (limit?: number) => {
    if (!searchQuery.trim()) return [];
    
    const queryStr = searchQuery.toLowerCase();
    const results: any[] = [];

    if (searchScope === 'All' || searchScope === 'Candidates') {
      candidates.forEach(c => {
        if (c.name?.toLowerCase().includes(queryStr) || c.role?.toLowerCase().includes(queryStr)) {
          results.push({ ...c, type: 'Candidate', icon: User });
        }
      });
    }

    if (searchScope === 'All' || searchScope === 'Employees') {
      employees.forEach(e => {
        if (e.name?.toLowerCase().includes(queryStr) || e.role?.toLowerCase().includes(queryStr) || e.department?.toLowerCase().includes(queryStr)) {
          results.push({ ...e, type: 'Employee', icon: Users });
        }
      });
    }

    if (searchScope === 'All' || searchScope === 'Jobs') {
      jobs.forEach(j => {
        if (j.title?.toLowerCase().includes(queryStr) || j.department?.toLowerCase().includes(queryStr)) {
          results.push({ ...j, type: 'Job Post', icon: Briefcase });
        }
      });
    }

    return limit ? results.slice(0, limit) : results;
  };

  const searchResults = getSearchResults(5);
  const fullSearchResults = getSearchResults();

  const handleSearchTrigger = () => {
    if (searchQuery.trim()) {
      setLastSearchQuery(searchQuery);
      setActiveTab('search-results');
      setIsSearchExpanded(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onGenerateInsights={() => setActiveTab('console')} />;
      case 'recruitment':
        return <Recruitment />;
      case 'workforce':
        return <Workforce />;
      case 'performance':
        return <Performance />;
      case 'compliance':
        return <Compliance />;
      case 'payroll':
        return <Payroll />;
      case 'search-results':
        return (
          <SearchResults 
            query={lastSearchQuery} 
            results={fullSearchResults} 
            onResultClick={(result) => {
              if (result.type === 'Candidate' || result.type === 'Job Post') {
                setActiveTab('recruitment');
              } else if (result.type === 'Employee') {
                setActiveTab('workforce');
              }
            }}
          />
        );
      case 'console':
        return <AIConsole />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Module Under Optimization</h3>
            <p className="max-w-xs text-center mt-2">
              NEXA-HR is currently calibrating this module for your specific organizational structure.
            </p>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        );
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorCode = error.code || "unknown";
      
      if (errorCode === 'auth/unauthorized-domain') {
        setIsFixLoginModalOpen(true);
      } else if (errorCode === 'auth/popup-blocked') {
        triggerGlobalToast("Login popup was blocked. Please enable popups for this site.");
      } else {
        triggerGlobalToast(`Authentication failed (${errorCode}). Please check your Firebase configuration.`);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      triggerGlobalToast("Signed out successfully.");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 relative">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onAction={(msg) => triggerGlobalToast(msg)}
        isAuthReady={isAuthReady}
        onLogin={handleLogin}
      />
      
      <main id="main-content" className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header id="app-header" className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <span>NEXA-HR</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 capitalize">{activeTab}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div id="global-search-container" className="flex items-center gap-3">
              <div className="relative group">
                <div className={cn(
                  "flex items-center bg-slate-100 rounded-xl border border-transparent focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all overflow-hidden",
                  isSearchExpanded ? "w-[500px]" : "w-80"
                )}>
                  {/* Scope Selector */}
                  <div className="relative border-r border-slate-200">
                    <select 
                      id="search-scope-select"
                      value={searchScope}
                      onChange={(e) => setSearchScope(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer uppercase tracking-wider"
                    >
                      <option value="All">All</option>
                      <option value="Candidates">Candidates</option>
                      <option value="Employees">Employees</option>
                      <option value="Jobs">Jobs</option>
                      <option value="Compliance">Compliance</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Search Input */}
                  <div className="flex-1 relative flex items-center">
                    <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                    <input 
                      id="global-search"
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchExpanded(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearchTrigger();
                        }
                      }}
                      placeholder={`Search ${searchScope === 'All' ? 'everything' : searchScope.toLowerCase()}...`} 
                      className="w-full pl-10 pr-4 py-2 bg-transparent border-none text-sm focus:ring-0"
                    />
                  </div>

                  {/* Date Range Selector */}
                  <div className="relative border-l border-slate-200">
                    <select 
                      id="search-date-select"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 cursor-pointer uppercase tracking-wider"
                    >
                      <option value="Anytime">Anytime</option>
                      <option value="Today">Today</option>
                      <option value="Week">Last 7d</option>
                      <option value="Month">Last 30d</option>
                    </select>
                    <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Search Results Preview */}
                <AnimatePresence>
                  {searchQuery && isSearchExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Search Results in {searchScope} ({dateRange})
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                          {searchResults.length} Matches Found
                        </span>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {searchResults.length > 0 ? (
                          searchResults.map((result, idx) => (
                            <div 
                              key={`${result.type}-${result.id || idx}`}
                              onClick={() => {
                                if (result.type === 'Candidate' || result.type === 'Job Post') {
                                  setActiveTab('recruitment');
                                } else if (result.type === 'Employee') {
                                  setActiveTab('workforce');
                                }
                                setIsSearchExpanded(false);
                                setSearchQuery('');
                              }}
                              className="p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 flex items-center gap-3"
                            >
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                <result.icon className="w-4 h-4 text-slate-500" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{result.name || result.title}</p>
                                <p className="text-xs text-slate-500">{result.type} • {result.role || result.department}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-sm text-slate-500">No results found for "{searchQuery}"</p>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-slate-50 text-center">
                        <button 
                          onClick={handleSearchTrigger}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                        >
                          View All Results
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button 
                id="btn-global-search-trigger"
                onClick={handleSearchTrigger}
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center shrink-0"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
              {!isAuthReady ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsFixLoginModalOpen(true)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest px-2 py-1 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    Fix Login Access
                  </button>
                  <button 
                    onClick={handleLogin}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleSignOut}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
              <button 
                id="btn-notifications" 
                onClick={() => setIsNotificationPanelOpen(true)}
                className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
              <button 
                id="btn-help" 
                onClick={() => triggerGlobalToast('NEXA-HR Help Center is coming soon.')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <div 
                id="user-profile-summary" 
                onClick={() => isAuthReady ? setActiveTab('settings') : handleLogin()}
                className="flex items-center gap-3 ml-2 cursor-pointer hover:opacity-80 transition-opacity group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {isAuthReady ? (auth.currentUser?.displayName || 'Donald Atabong') : 'Guest User'}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    {isAuthReady ? 'System Admin' : 'Public Access'}
                  </p>
                </div>
                <div id="user-avatar" className="w-10 h-10 bg-slate-200 rounded-xl border-2 border-white shadow-sm overflow-hidden group-hover:border-blue-100 transition-all flex items-center justify-center">
                  {isAuthReady ? (
                    <img 
                      src={auth.currentUser?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Donald"} 
                      alt="User" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div id="scrollable-content" className="flex-1 overflow-y-auto p-8">
          <div id="content-wrapper" className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Floating AI Agent Bubble */}
      <motion.button
        id="floating-ai-bubble"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setActiveTab('console')}
        className="fixed bottom-8 right-8 w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl shadow-slate-900/40 z-50 group border-4 border-blue-500/20"
      >
        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping group-hover:hidden" />
        <BrainCircuit className="w-8 h-8 text-blue-400" />
        <div className="absolute -top-12 right-0 bg-white text-slate-900 px-4 py-2 rounded-2xl shadow-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-slate-100">
          Activate NEXA-HR Core
        </div>
      </motion.button>

      <NotificationPanel 
        isOpen={isNotificationPanelOpen} 
        onClose={() => setIsNotificationPanelOpen(false)} 
      />

      {/* Fix Login Access Modal */}
      <AnimatePresence>
        {isFixLoginModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Fix Login Access</h3>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Firebase blocks logins from unauthorized domains. To allow other users to sign in, you must add this domain to your Firebase Console.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Domain to Authorize</p>
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono text-blue-600 font-bold">{window.location.hostname}</code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.hostname);
                        triggerGlobalToast("Domain copied to clipboard.");
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <a 
                  href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-all group"
                >
                  <div>
                    <p className="text-sm font-bold text-blue-900">Firebase Console</p>
                    <p className="text-[10px] text-blue-700">Open Auth Settings</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              <button 
                onClick={() => setIsFixLoginModalOpen(false)}
                className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Toast */}
      <AnimatePresence>
        {globalToast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-28 right-8 z-[100] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">System Message</p>
              <p className="text-slate-400 text-xs">{globalToast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
