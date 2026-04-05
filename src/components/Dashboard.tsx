import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Employee, Candidate } from '../types';

const StatCard = ({ id, title, value, change, trend, icon: Icon, color }: any) => (
  <motion.div 
    id={id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
        trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
      )}>
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {change}%
      </div>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </motion.div>
);

interface DashboardProps {
  onGenerateInsights?: () => void;
}

export function Dashboard({ onGenerateInsights }: DashboardProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setIsAuthReady(!!user);
    });

    if (auth.currentUser) {
      // Employees
      const unsubEmployees = onSnapshot(collection(db, 'employees'), (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Employee);
        setEmployees(fetched);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'employees');
      });

      // Candidates
      const unsubCandidates = onSnapshot(collection(db, 'candidates'), (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Candidate);
        setCandidates(fetched);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'candidates');
      });

      return () => {
        unsubEmployees();
        unsubCandidates();
      };
    }

    return () => unsubscribeAuth();
  }, [isAuthReady]);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleGenerateInsights = () => {
    if (onGenerateInsights) {
      onGenerateInsights();
    } else {
      triggerToast();
    }
  };

  // Derived Data
  const averagePerformance = employees.length > 0 
    ? (employees.reduce((acc, emp) => acc + emp.performanceScore, 0) / employees.length).toFixed(1)
    : "0.0";

  const averageBurnoutRisk = employees.length > 0
    ? (employees.reduce((acc, emp) => acc + emp.burnoutRisk, 0) / employees.length).toFixed(1)
    : "0.0";

  const deptCounts = employees.reduce((acc: any, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {});

  const departments = Object.entries(deptCounts).map(([name, count]) => ({
    name,
    count: count as number,
    color: name === 'Engineering' ? 'bg-blue-500' : 
           name === 'Design' ? 'bg-indigo-500' : 
           name === 'Marketing' ? 'bg-emerald-500' : 'bg-slate-500'
  })).filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Chart Data (Mocking growth based on join dates)
  const chartData = employees.reduce((acc: any[], emp) => {
    const month = new Date(emp.joinDate).toLocaleString('default', { month: 'short' });
    const existing = acc.find(d => d.name === month);
    if (existing) {
      existing.headcount += 1;
    } else {
      acc.push({ name: month, headcount: 1 });
    }
    return acc;
  }, []).sort((a, b) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(a.name) - months.indexOf(b.name);
  });

  if (!isAuthReady) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome to NEXA-HR</h2>
        <p className="text-slate-500 max-w-sm mb-8">
          Please sign in to view your executive overview and access real-time workforce intelligence.
        </p>
      </div>
    );
  }

  return (
    <div id="dashboard-view" className="space-y-8">
      <div id="dashboard-header" className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Executive Overview</h2>
          <p className="text-slate-500">Real-time workforce intelligence and predictive analytics.</p>
        </div>
        <div className="flex gap-3">
          <button 
            id="btn-export-report" 
            onClick={triggerToast}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Export Report
          </button>
          <button 
            id="btn-generate-insights" 
            onClick={handleGenerateInsights}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Generate Insights
          </button>
        </div>
      </div>

      <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          id="stat-headcount"
          title="Total Headcount" 
          value={employees.length.toString()} 
          change="0" 
          trend="up" 
          icon={Users} 
          color="bg-blue-600" 
        />
        <StatCard 
          id="stat-hiring"
          title="Active Hiring" 
          value={candidates.filter(c => c.status === 'Interviewing').length.toString()} 
          change="0" 
          trend="up" 
          icon={UserPlus} 
          color="bg-indigo-600" 
        />
        <StatCard 
          id="stat-performance"
          title="Avg. Performance" 
          value={`${averagePerformance}%`} 
          change="0" 
          trend="up" 
          icon={TrendingUp} 
          color="bg-emerald-600" 
        />
        <StatCard 
          id="stat-burnout"
          title="Burnout Risk" 
          value={`${averageBurnoutRisk}%`} 
          change="0" 
          trend="down" 
          icon={AlertCircle} 
          color="bg-orange-600" 
        />
      </div>

      <div id="dashboard-filters" className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            id="dashboard-search"
            type="text" 
            placeholder="Search departments or metrics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <button 
          id="btn-dashboard-filter" 
          onClick={triggerToast}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div id="growth-chart-container" className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Growth & Hiring Velocity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="headcount" stroke="#2563eb" fillOpacity={1} fill="url(#colorHeadcount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div id="dept-dist-container" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Department Distribution</h3>
          <div className="space-y-6">
            {departments.length > 0 ? (
              departments.map((dept) => (
                <div key={dept.name} id={`dept-${dept.name.toLowerCase()}`} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{dept.name}</span>
                    <span className="text-slate-500">{dept.count} members</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", dept.color)} 
                      style={{ width: `${(dept.count / employees.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">No departments found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
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
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Executive Intelligence</p>
              <p className="text-slate-400 text-xs">NEXA-HR is processing your request.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
