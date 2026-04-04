import React from 'react';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
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
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const data = [
  { name: 'Jan', headcount: 120, hiring: 5 },
  { name: 'Feb', headcount: 125, hiring: 8 },
  { name: 'Mar', headcount: 132, hiring: 12 },
  { name: 'Apr', headcount: 145, hiring: 15 },
];

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

export function Dashboard() {
  return (
    <div id="dashboard-view" className="space-y-8">
      <div id="dashboard-header" className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Executive Overview</h2>
          <p className="text-slate-500">Real-time workforce intelligence and predictive analytics.</p>
        </div>
        <div className="flex gap-3">
          <button id="btn-export-report" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
            Export Report
          </button>
          <button id="btn-generate-insights" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            Generate Insights
          </button>
        </div>
      </div>

      <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          id="stat-headcount"
          title="Total Headcount" 
          value="145" 
          change="12.5" 
          trend="up" 
          icon={Users} 
          color="bg-blue-600" 
        />
        <StatCard 
          id="stat-hiring"
          title="Active Hiring" 
          value="15" 
          change="4.2" 
          trend="up" 
          icon={UserPlus} 
          color="bg-indigo-600" 
        />
        <StatCard 
          id="stat-performance"
          title="Avg. Performance" 
          value="88.4%" 
          change="2.1" 
          trend="up" 
          icon={TrendingUp} 
          color="bg-emerald-600" 
        />
        <StatCard 
          id="stat-burnout"
          title="Burnout Risk" 
          value="8.2%" 
          change="1.5" 
          trend="down" 
          icon={AlertCircle} 
          color="bg-orange-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div id="growth-chart-container" className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Growth & Hiring Velocity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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
            {[
              { name: 'Intelligence', count: 42, color: 'bg-blue-600' },
              { name: 'Hospitality', count: 35, color: 'bg-indigo-600' },
              { name: 'Logistics', count: 28, color: 'bg-emerald-600' },
              { name: 'Legal', count: 15, color: 'bg-orange-600' },
              { name: 'Others', count: 25, color: 'bg-slate-400' },
            ].map((dept) => (
              <div key={dept.name} id={`dept-${dept.name.toLowerCase()}`} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{dept.name}</span>
                  <span className="text-slate-500">{dept.count} members</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full", dept.color)} 
                    style={{ width: `${(dept.count / 145) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
