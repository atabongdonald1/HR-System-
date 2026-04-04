/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Recruitment } from './components/Recruitment';
import { Workforce } from './components/Workforce';
import { Compliance } from './components/Compliance';
import { Payroll } from './components/Payroll';
import { AIConsole } from './components/AIConsole';
import { 
  Bell, 
  Search, 
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Calendar,
  Filter,
  User,
  Users,
  Briefcase
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_CANDIDATES, MOCK_EMPLOYEES, MOCK_JOBS } from './constants';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchScope, setSearchScope] = useState('All');
  const [dateRange, setDateRange] = useState('Anytime');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    if (searchScope === 'All' || searchScope === 'Candidates') {
      MOCK_CANDIDATES.forEach(c => {
        if (c.name.toLowerCase().includes(query) || c.role.toLowerCase().includes(query)) {
          results.push({ ...c, type: 'Candidate', icon: User });
        }
      });
    }

    if (searchScope === 'All' || searchScope === 'Employees') {
      MOCK_EMPLOYEES.forEach(e => {
        if (e.name.toLowerCase().includes(query) || e.role.toLowerCase().includes(query) || e.department.toLowerCase().includes(query)) {
          results.push({ ...e, type: 'Employee', icon: Users });
        }
      });
    }

    if (searchScope === 'All' || searchScope === 'Jobs') {
      MOCK_JOBS.forEach(j => {
        if (j.title.toLowerCase().includes(query) || j.department.toLowerCase().includes(query)) {
          results.push({ ...j, type: 'Job Post', icon: Briefcase });
        }
      });
    }

    return results.slice(0, 5); // Limit to 5 results
  };

  const searchResults = getSearchResults();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'recruitment':
        return <Recruitment />;
      case 'workforce':
        return <Workforce />;
      case 'compliance':
        return <Compliance />;
      case 'payroll':
        return <Payroll />;
      case 'console':
        return <AIConsole />;
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

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main id="main-content" className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header id="app-header" className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <span>NEXA-HR</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 capitalize">{activeTab}</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div id="global-search-container" className="flex items-center gap-2">
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
                      onBlur={() => !searchQuery && setIsSearchExpanded(false)}
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
                          onClick={() => {
                            setIsSearchExpanded(false);
                            setSearchQuery('');
                            alert('Full search results view is being optimized.');
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest"
                        >
                          View All Results
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
              <button 
                id="btn-notifications" 
                onClick={() => alert('You have 3 new notifications from NEXA-HR Intelligence.')}
                className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <button 
                id="btn-help" 
                onClick={() => alert('NEXA-HR Help Center is coming soon.')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <div id="user-profile-summary" className="flex items-center gap-3 ml-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900">Donald Atabong</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">System Admin</p>
                </div>
                <div id="user-avatar" className="w-10 h-10 bg-slate-200 rounded-xl border-2 border-white shadow-sm overflow-hidden">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Donald" 
                    alt="User" 
                    className="w-full h-full object-cover"
                  />
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
    </div>
  );
}

