import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  Users
} from 'lucide-react';
import { MOCK_EMPLOYEES } from '../constants';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
  switch (sentiment) {
    case 'Positive': return <Smile className="w-5 h-5 text-emerald-500" />;
    case 'Neutral': return <Meh className="w-5 h-5 text-slate-400" />;
    case 'Negative': return <Frown className="w-5 h-5 text-rose-500" />;
    default: return null;
  }
};

export function Workforce() {
  const [showToast, setShowToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const filteredEmployees = MOCK_EMPLOYEES.filter(employee => 
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="workforce-view" className="space-y-8">
      <div id="workforce-header" className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Workforce Intelligence</h2>
          <p className="text-slate-500">Digital employee profiles, performance tracking, and sentiment analysis.</p>
        </div>
        <div className="flex gap-3">
          <button 
            id="btn-performance-reviews" 
            onClick={triggerToast}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Performance Reviews
          </button>
          <button 
            id="btn-predictive-analysis" 
            onClick={triggerToast}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Predictive Analysis
          </button>
        </div>
      </div>

      <div id="workforce-filters" className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            id="workforce-search"
            type="text" 
            placeholder="Search employees by name, role, or department..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <button 
          id="btn-workforce-filter" 
          onClick={triggerToast}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div id="employees-list" className="grid grid-cols-1 gap-6">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <motion.div 
              key={employee.id}
              id={`employee-card-${employee.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Profile Info */}
                <div className="flex gap-4 lg:w-1/3">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`} 
                      alt={employee.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{employee.name}</h3>
                    <p className="text-blue-600 text-sm font-medium">{employee.role}</p>
                    <p className="text-slate-500 text-xs mt-1">{employee.department} Department</p>
                    <div className="flex gap-3 mt-3">
                      <button 
                        onClick={triggerToast}
                        className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={triggerToast}
                        className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={triggerToast}
                        className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Performance</p>
                        <p className="text-2xl font-bold text-slate-900">{employee.performanceScore}%</p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${employee.performanceScore}%` }} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Burnout Risk</p>
                        <p className={cn(
                          "text-2xl font-bold",
                          employee.burnoutRisk > 40 ? "text-orange-500" : "text-slate-900"
                        )}>{employee.burnoutRisk}%</p>
                      </div>
                      {employee.burnoutRisk > 40 && <AlertTriangle className="w-5 h-5 text-orange-500 mb-1" />}
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn(
                        "h-full rounded-full",
                        employee.burnoutRisk > 40 ? "bg-orange-500" : "bg-blue-500"
                      )} style={{ width: `${employee.burnoutRisk}%` }} />
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Sentiment</p>
                        <div className="flex items-center gap-2 mt-1">
                          <SentimentIcon sentiment={employee.sentiment} />
                          <span className="text-sm font-bold text-slate-700">{employee.sentiment}</span>
                        </div>
                      </div>
                      <button 
                        onClick={triggerToast}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Resignation Prob.</p>
                      <p className="text-sm font-bold text-slate-900">{employee.resignationProbability}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="mt-6 pt-6 border-t border-slate-50 flex flex-wrap gap-6">
                {employee.kpis.map((kpi) => (
                  <div key={kpi.name} className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{kpi.name}</p>
                      <p className="text-xs font-bold text-slate-700">{kpi.value} / {kpi.target}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No employees found</h3>
            <p className="text-slate-500">Try adjusting your search query.</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 text-blue-600 font-bold hover:text-blue-700"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[100] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Workforce Intelligence</p>
              <p className="text-slate-400 text-xs">NEXA-HR is analyzing workforce data.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
