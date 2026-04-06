import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Users
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
  Radar,
  BarChart,
  Bar
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Employee } from '../types';

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Employee);
      setEmployees(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'employees');
    });
    return () => unsubscribe();
  }, []);

  const avgScore = employees.length > 0 
    ? (employees.reduce((acc, emp) => acc + emp.performanceScore, 0) / employees.length).toFixed(1)
    : "0";

  const topPerformers = employees.filter(e => e.performanceScore >= 90).length;

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
          value={`${avgScore}%`} 
          change="0" 
          trend="up" 
          icon={TrendingUp} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Top Performers" 
          value={topPerformers.toString()} 
          change="0" 
          trend="up" 
          icon={Award} 
          color="bg-emerald-600" 
        />
        <StatCard 
          title="Active Goals" 
          value={(employees.length * 2).toString()} 
          change="0" 
          trend="up" 
          icon={Target} 
          color="bg-indigo-600" 
        />
        <StatCard 
          title="Feedback Cycles" 
          value="1" 
          change="0" 
          trend="up" 
          icon={MessageSquare} 
          color="bg-slate-900" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-900">Performance Distribution</h3>
            <select className="bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-2 focus:ring-2 focus:ring-blue-500">
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Design</option>
              <option>Marketing</option>
            </select>
          </div>
          <div className="h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employees.map(e => ({ name: e.name.split(' ')[0], score: e.performanceScore }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top Performers</h3>
          <div className="space-y-6">
            {employees.sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5).map((emp) => (
              <div key={emp.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`} alt={emp.name} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{emp.name}</p>
                    <p className="text-xs text-slate-500">{emp.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{emp.performanceScore}%</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("w-3 h-3", i < Math.floor(emp.performanceScore / 20) ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
