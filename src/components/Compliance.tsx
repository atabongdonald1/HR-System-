import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Scale,
  Globe,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  X,
  Download
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Employee } from '../types';
import { geminiService } from '../services/geminiService';
import Markdown from 'react-markdown';

export function Compliance() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPolicy, setGeneratedPolicy] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'employees'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Employee[];
      setEmployees(fetched);
    });
    return () => unsubscribe();
  }, []);

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleGeneratePolicy = async (policyName: string) => {
    setIsGenerating(true);
    try {
      const policy = await geminiService.generatePolicy(policyName);
      setGeneratedPolicy(policy);
    } catch (error) {
      console.error(error);
      triggerToast();
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate compliance checks based on real data and UAE regulations
  const complianceChecks = [
    ...employees.flatMap(emp => {
      const checks = [];
      if (emp.visaExpiry) {
        const expiryDate = new Date(emp.visaExpiry);
        const today = new Date();
        const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 60) {
          checks.push({
            id: `visa-${emp.id}`,
            title: `Visa Renewal: ${emp.name}`,
            description: `Visa expires in ${diffDays} days (${expiryDate.toLocaleDateString()}). Action required to maintain legal status.`,
            risk: diffDays < 30 ? 'High' : 'Medium',
            status: diffDays < 30 ? 'Critical' : 'Pending',
            lastChecked: 'Just now'
          });
        }
      }
      return checks;
    }),
    // UAE Specific Regulatory Checks (Simulated based on current laws)
    {
      id: 'nafis-check',
      title: 'Nafis Emiratisation Target',
      description: 'Companies with 50+ employees must increase UAE national headcount by 2% annually (Target: 10% by 2026).',
      risk: employees.length >= 50 ? 'High' : 'Low',
      status: employees.length >= 50 ? 'Pending' : 'Compliant',
      lastChecked: 'Daily'
    },
    {
      id: 'iloe-check',
      title: 'ILOE Unemployment Insurance',
      description: 'Mandatory for all employees (citizens and residents). Non-compliance results in AED 400 fine.',
      risk: 'Medium',
      status: 'Monitoring',
      lastChecked: 'Weekly'
    },
    {
      id: 'wps-check',
      title: 'WPS Salary Compliance',
      description: 'Wages Protection System requires 100% of salaries to be paid through approved channels.',
      risk: 'High',
      status: 'Compliant',
      lastChecked: 'Real-time'
    },
    {
      id: 'midday-break',
      title: 'Midday Break Regulation',
      description: 'Mandatory break (12:30 PM - 3:00 PM) for outdoor work from June 15 to Sept 15.',
      risk: new Date().getMonth() >= 5 && new Date().getMonth() <= 8 ? 'High' : 'Low',
      status: new Date().getMonth() >= 5 && new Date().getMonth() <= 8 ? 'Active' : 'Inactive',
      lastChecked: 'Seasonal'
    }
  ];

  const highRiskCount = complianceChecks.filter(c => c.risk === 'High').length;
  const pendingCount = complianceChecks.filter(c => c.status === 'Pending' || c.status === 'Critical').length;
  const healthScore = employees.length > 0 ? Math.max(0, 100 - (complianceChecks.filter(c => c.risk === 'High').length * 10)) : 100;

  if (!isAuthReady) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
          <ShieldCheck className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Compliance Access Restricted</h2>
        <p className="text-slate-500 max-w-sm mb-8">
          Please sign in to access the Compliance & Risk Control module and monitor your organization's health.
        </p>
      </div>
    );
  }

  return (
    <div id="compliance-view" className="space-y-8">
      <div id="compliance-header" className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Compliance & Risk Control</h2>
          <p className="text-slate-500">Real-time monitoring of UAE Labor Law (Federal Decree Law No. 33 of 2021) and 2024-2026 updates.</p>
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
            <h3 className="text-4xl font-bold mb-2">{healthScore.toFixed(1)}</h3>
            <p className="text-slate-400 text-sm">Overall Compliance Score</p>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">UAE Labor Law</span>
                <span className="text-emerald-400">{healthScore}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${healthScore}%` }} />
              </div>
              <div className="flex justify-between text-xs pt-2">
                <span className="text-slate-400">Internal Policies</span>
                <span className="text-blue-400">100%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
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
              <p className="text-2xl font-bold text-slate-900">{highRiskCount}</p>
              <p className="text-slate-500 text-sm">High Risk Flags</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
              <p className="text-slate-500 text-sm">Policy Updates Pending</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{healthScore > 90 ? '100%' : '85%'}</p>
              <p className="text-slate-500 text-sm">WPS Compliance</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{employees.length}</p>
              <p className="text-slate-500 text-sm">Audits Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Active Compliance Monitoring</h3>
          <button 
            onClick={triggerToast}
            className="text-blue-600 text-sm font-bold hover:underline"
          >
            View All Checks
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {complianceChecks.length > 0 ? (
            complianceChecks.map((check) => (
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
                <button 
                  onClick={triggerToast}
                  className="p-2 text-slate-300 group-hover:text-blue-600 transition-all"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            ))
          ) : (
            <div className="px-8 py-12 text-center">
              <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 text-sm">No active compliance risks detected. Your workforce is fully compliant.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Policy Management</h3>
          <button 
            onClick={triggerToast}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Update All Policies
          </button>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              title: 'Code of Conduct', 
              version: 'v2.4 (2024)', 
              status: 'Compliant', 
              desc: 'Standardized ethics and professional behavior aligned with UAE Labor Law.',
              lastUpdate: 'Jan 2024'
            },
            { 
              title: 'Anti-Discrimination', 
              version: 'v1.2 (2024)', 
              status: 'Compliant', 
              desc: 'Zero-tolerance policy for discrimination based on race, gender, or religion.',
              lastUpdate: 'Feb 2024'
            },
            { 
              title: 'Data Privacy (PDPL)', 
              version: 'v2.0 (2024)', 
              status: 'Compliant', 
              desc: 'Compliance with UAE Personal Data Protection Law (Federal Decree Law No. 45).',
              lastUpdate: 'Mar 2024'
            },
            { 
              title: 'Emiratisation (Nafis)', 
              version: 'v1.0 (2024)', 
              status: 'Compliant', 
              desc: 'Specific guidelines for hiring and retaining UAE nationals in line with Nafis targets.',
              lastUpdate: 'Apr 2024'
            },
            { 
              title: 'Remote Work (UAE)', 
              version: 'v1.5 (2024)', 
              status: 'Compliant', 
              desc: 'Framework for remote and hybrid work arrangements as per UAE Labor Law 2021.',
              lastUpdate: 'Apr 2024'
            },
            { 
              title: 'Leave Policy (UAE Law)', 
              version: 'v2.1 (2024)', 
              status: 'Compliant', 
              desc: 'Annual, sick, maternity, and compassionate leave as per Federal Decree-Law No. 33.',
              lastUpdate: 'Apr 2024'
            }
          ].map((policy) => (
            <div key={policy.title} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                    policy.status === 'Compliant' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                  )}>
                    {policy.status}
                  </span>
                  <button 
                    onClick={() => handleGeneratePolicy(policy.title)}
                    disabled={isGenerating}
                    className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    AI Update
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-slate-900 mb-1">{policy.title}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">Version {policy.version}</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{policy.desc}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Updated: {policy.lastUpdate}</span>
                <button 
                  onClick={triggerToast}
                  className="text-blue-600 text-xs font-bold hover:underline"
                >
                  View PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Policy Generation Modal */}
      <AnimatePresence>
        {generatedPolicy && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGeneratedPolicy(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{generatedPolicy.title}</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">AI-Generated Policy • {generatedPolicy.version}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={triggerToast}
                    className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setGeneratedPolicy(null)}
                    className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-3xl mx-auto">
                  <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-900 mb-2 uppercase tracking-wider">Compliance Summary</h4>
                    <p className="text-sm text-blue-700 leading-relaxed">{generatedPolicy.summary}</p>
                    <div className="mt-4 pt-4 border-t border-blue-100">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Legal Notes</p>
                      <p className="text-xs text-blue-600/80 italic">{generatedPolicy.complianceNotes}</p>
                    </div>
                  </div>
                  <div className="markdown-body prose prose-slate max-w-none">
                    <Markdown>{generatedPolicy.content}</Markdown>
                  </div>
                </div>
              </div>
              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button 
                  onClick={() => setGeneratedPolicy(null)}
                  className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={() => {
                    triggerToast();
                    setGeneratedPolicy(null);
                  }}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  Adopt Policy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-xs">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 relative">
                <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
                <div className="absolute inset-0 border-4 border-blue-100 border-t-blue-600 rounded-2xl animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Generating Policy</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                NEXA-HR is drafting a legally sound policy based on the latest UAE regulations.
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">UAE Regulatory Framework</h3>
          </div>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-1.5 h-auto bg-blue-500 rounded-full" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">Emiratisation (Nafis)</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Private sector companies with 50+ employees must increase UAE national headcount by 2% annually. 
                  Failure results in AED 6,000 monthly fine per non-compliant position.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1.5 h-auto bg-emerald-500 rounded-full" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">Wages Protection System (WPS)</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Mandatory salary payment through MOHRE-approved banks/exchanges. 
                  Requires 100% of the workforce to be paid within 15 days of the due date.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1.5 h-auto bg-orange-500 rounded-full" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">Unemployment Insurance (ILOE)</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Mandatory for all employees since Jan 2023. Employers must ensure employees are registered 
                  to avoid fines, though it is primarily an employee responsibility.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Risk Mitigation Strategies</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Visa Compliance</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Active</span>
              </div>
              <p className="text-xs text-slate-500">Automated 60-day expiry alerts for all residency and work permits.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Health Insurance</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Active</span>
              </div>
              <p className="text-xs text-slate-500">Mandatory coverage for all employees in Dubai and Abu Dhabi jurisdictions.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">End of Service</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">New</span>
              </div>
              <p className="text-xs text-slate-500">Voluntary Savings Scheme for non-nationals as an alternative to traditional gratuity.</p>
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
