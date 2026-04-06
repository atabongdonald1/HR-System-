import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Download,
  CreditCard,
  Banknote,
  PieChart as PieChartIcon,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar, 
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Employee } from '../types';

const PAYROLL_STATS: any[] = [];

export function Payroll({ isAuthReady }: { isAuthReady?: boolean }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isAuthReady || !auth.currentUser) return;

    const unsubscribe = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Employee);
      setEmployees(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'employees');
    });
    return () => unsubscribe();
  }, [isAuthReady]);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const totalPayroll = employees.reduce((acc, emp) => acc + emp.salary, 0);

  return (
    <div id="payroll-view" className="space-y-8">
      <div id="payroll-header" className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Payroll & Benefits</h2>
          <p className="text-slate-500">Automated salary calculations, WPS compliance, and benefits management.</p>
        </div>
        <div className="flex gap-3">
          <button 
            id="btn-manage-benefits" 
            onClick={triggerToast}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Manage Benefits
          </button>
          <button 
            id="btn-process-payroll" 
            onClick={triggerToast}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Process Payroll
          </button>
        </div>
      </div>

      <div id="payroll-stats-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payroll Summary */}
        <div id="payroll-summary-card" className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Banknote className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Monthly Summary</h3>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500 text-sm">Total Disbursement (Current)</p>
            <h4 className="text-3xl font-bold text-slate-900">AED {totalPayroll.toLocaleString()}</h4>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-2">
              <ArrowUpRight className="w-3 h-3" />
              0% from last month
            </div>
          </div>

          <div className="mt-8 h-[200px] w-full relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={PAYROLL_STATS}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {PAYROLL_STATS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 space-y-3">
            {PAYROLL_STATS.map((stat) => (
              <div key={stat.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                  <span className="text-slate-600">{stat.name}</span>
                </div>
                <span className="font-bold text-slate-900">AED {stat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WPS Status & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">Active</span>
              </div>
              <h4 className="text-lg font-bold text-emerald-900">WPS Compliance</h4>
              <p className="text-emerald-700 text-sm mt-1">Wage Protection System is fully synchronized with MOHRE.</p>
              <button 
                onClick={triggerToast}
                className="mt-4 text-emerald-800 text-sm font-bold flex items-center gap-2 hover:underline"
              >
                View SIF Files <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Next Cycle</span>
              </div>
              <h4 className="text-lg font-bold text-blue-900">Next Payroll</h4>
              <p className="text-blue-700 text-sm mt-1">Scheduled for disbursement in 24 days.</p>
              <button 
                onClick={triggerToast}
                className="mt-4 text-blue-800 text-sm font-bold flex items-center gap-2 hover:underline"
              >
                Review Adjustments <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Recent Payslips</h3>
              <button 
                onClick={triggerToast}
                className="text-blue-600 text-sm font-bold hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {employees.length > 0 ? (
                employees.slice(0, 3).map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{employee.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Current Period • {employee.salary.toLocaleString()} {employee.currency}</p>
                      </div>
                    </div>
                    <button 
                      onClick={triggerToast}
                      className="p-2 text-slate-400 group-hover:text-blue-600 transition-all"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl">
                  <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No recent payslips found.</p>
                </div>
              )}
            </div>
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
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Payroll Action</p>
              <p className="text-slate-400 text-xs">Request submitted to the finance module.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
