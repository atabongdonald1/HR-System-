import React from 'react';
import { 
  Search, 
  User, 
  Users, 
  Briefcase, 
  ChevronRight, 
  Filter,
  ArrowUpRight,
  Clock,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface SearchResultsProps {
  query: string;
  results: any[];
  onResultClick: (result: any) => void;
}

export function SearchResults({ query, results, onResultClick }: SearchResultsProps) {
  return (
    <div id="search-results-view" className="space-y-8 pb-12">
      <div id="search-results-header" className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Search Results</h2>
          <p className="text-slate-500">
            Showing {results.length} results for <span className="text-blue-600 font-bold">"{query}"</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {results.map((result, idx) => (
            <motion.div
              key={`${result.type}-${result.id || idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onResultClick(result)}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                  <result.icon className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          result.type === 'Candidate' ? "bg-blue-50 text-blue-600" :
                          result.type === 'Employee' ? "bg-emerald-50 text-emerald-600" :
                          "bg-indigo-50 text-indigo-600"
                        )}>
                          {result.type}
                        </span>
                        {result.status && (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• {result.status}</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {result.name || result.title}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium">
                        {result.role || result.department} {result.location ? `• ${result.location}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      {result.hireScore && (
                        <div className="flex items-center gap-1 text-emerald-600 font-bold">
                          <ArrowUpRight className="w-4 h-4" />
                          {result.hireScore}% Match
                        </div>
                      )}
                      {result.salary && (
                        <p className="text-slate-900 font-bold">{result.salary}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-4">
                    {result.skills && result.skills.slice(0, 3).map((skill: string) => (
                      <span key={skill} className="text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-lg">
                        {skill}
                      </span>
                    ))}
                    {result.experience && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {result.experience} Experience
                      </div>
                    )}
                  </div>
                </div>
                
                <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No results found</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto">
            We couldn't find anything matching "{query}". Try adjusting your filters or search scope.
          </p>
        </div>
      )}
    </div>
  );
}
