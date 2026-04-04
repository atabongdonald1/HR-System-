import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Scale,
  Globe,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const COMPLIANCE_CHECKS = [
  {
    id: 'c1',
    title: 'UAE Labor Law Article 65',
    description: 'Working hours compliance for Ramadan period.',
    status: 'Compliant',
    risk: 'Low',
    lastChecked: '2 hours ago'
  },
  {
    id: 'c2',
    title: 'WPS (Wage Protection System)',
    description: 'Salary transfer verification for March cycle.',
    status: 'Pending',
    risk: 'Medium',
    lastChecked: '1 day ago'
  },
  {
    id: 'c3',
    title: 'Visa Expiry Monitoring',
    description: '3 employees have visas expiring within 30 days.',
    status: 'Action Required',
    risk: 'High',
    lastChecked: 'Just now'
  }
];

export function Compliance() {
  const [showToast, setShowToast] = useState(false);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  return (
    <div id="compliance-view" className="space-y-8">
      <div id="compliance-header" className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Compliance & Risk Control</h2>
          <p className="text-slate-500">Automated monitoring of UAE labor laws and international standards.</p>
        </div>
        <div className="flex gap-3">
          <button 
            id="btn-audit-log" 
            onClick={triggerToast}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Audit Log
          </button>
          <button 
            id="btn-run-audit" 
            onClick={triggerToast}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Run Full Audit
          </button>
        </div>
      </div>

      <div id="compliance-stats" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Score */}
        <div id="compliance-score-card" className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">System Health</span>
            </div>
            <h3 className="text-4xl font-bold mb-2">94.2</h3>
            <p className="text-slate-400 text-sm">Overall Compliance Score</p>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">UAE Labor Law</span>
                <span className="text-emerald-400">98%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }} />
              </div>
              <div className="flex justify-between text-xs pt-2">
                <span className="text-slate-400">Internal Policies</span>
                <span className="text-blue-400">92%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">3</p>
              <p className="text-slate-500 text-sm">High Risk Flags</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">12</p>
              <p className="text-slate-500 text-sm">Policy Updates Pending</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">100%</p>
              <p className="text-slate-500 text-sm">WPS Compliance</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">45</p>
              <p className="text-slate-500 text-sm">Audits Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Active Compliance Monitoring</h3>
          <button className="text-blue-600 text-sm font-bold hover:underline">View All Checks</button>
        </div>
        <div className="divide-y divide-slate-50">
          {COMPLIANCE_CHECKS.map((check) => (
            <div key={check.id} className="px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  check.risk === 'High' ? "bg-rose-50 text-rose-600" : 
                  check.risk === 'Medium' ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {check.risk === 'High' ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{check.title}</h4>
                  <p className="text-slate-500 text-sm">{check.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                      check.status === 'Compliant' ? "bg-emerald-50 text-emerald-600" :
                      check.status === 'Pending' ? "bg-orange-50 text-orange-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {check.status}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-widest font-bold">
                      <Clock className="w-3 h-3" />
                      {check.lastChecked}
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-slate-300 group-hover:text-blue-600 transition-all">
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          ))}
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
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Action Initiated</p>
              <p className="text-slate-400 text-xs">NEXA-HR is processing your request.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
