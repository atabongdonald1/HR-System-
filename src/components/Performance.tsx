import React, { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  Award, 
  MessageSquare, 
  Star, 
  ChevronRight, 
  Search,
  Filter,
  Download,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const performanceData: any[] = [];

const skillData: any[] = [];

const reviews: any[] = [];

const StatCard = ({ title, value, change, trend, icon: Icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={cn(
        "text-xs font-bold px-2 py-1 rounded-full",
        trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      )}>
        {trend === 'up' ? '+' : '-'}{change}%
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </motion.div>
);

export function Performance() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div id="performance-view" className="space-y-8 pb-12">
      <div id="performance-header" className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Performance Intelligence</h2>
          <p className="text-slate-500">Monitor organizational growth and individual excellence.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Export Analytics
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            <Plus className="w-4 h-4" />
            New Review Cycle
          </button>
        </div>
      </div>

      <div id="performance-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Avg. Performance Score" 
          value="0%" 
          change="0" 
          trend="up" 
          icon={TrendingUp} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Goals Completed" 
          value="0" 
          change="0" 
          trend="up" 
          icon={Target} 
          color="bg-indigo-600" 
        />
        <StatCard 
          title="Top Performers" 
          value="0" 
          change="0" 
          trend="up" 
          icon={ Award} 
          color="bg-emerald-600" 
        />
        <StatCard 
          title="Feedback Velocity" 
          value="0/day" 
          change="0" 
          trend="down" 
          icon={MessageSquare} 
          color="bg-orange-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-slate-900">Performance Trends</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg">6 Months</button>
                <button className="px-3 py-1 text-xs font-bold text-slate-400 hover:bg-slate-50 rounded-lg">1 Year</button>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={4} dot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Active Review Cycles</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Filter reviews..."
                  className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Last Review</th>
                    <th className="px-6 py-4">Performance Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={review.image} alt="" className="w-10 h-10 rounded-xl bg-slate-100" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">{review.employee}</p>
                            <p className="text-xs text-slate-500">{review.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {review.lastReview}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                className={cn(
                                  "w-3 h-3",
                                  s <= Math.floor(review.score) ? "text-amber-400 fill-amber-400" : "text-slate-200"
                                )} 
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-slate-700">{review.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          review.status === 'Completed' ? "bg-emerald-50 text-emerald-600" :
                          review.status === 'In Progress' ? "bg-blue-50 text-blue-600" :
                          "bg-slate-100 text-slate-500"
                        )}>
                          {review.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Organizational Skills</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar
                    name="Skills"
                    dataKey="A"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.2}
                    strokeWidth={3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-900/20 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">AI Insights</span>
              </div>
              <h4 className="text-lg font-bold mb-2">Performance Optimization</h4>
              <p className="text-slate-400 text-sm mb-6">
                Based on recent feedback velocity, the Engineering team is showing a 15% increase in cross-functional collaboration.
              </p>
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-sm transition-all">
                View Detailed Analysis
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Achievements</h3>
            <div className="space-y-4">
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">No recent achievements recorded.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
