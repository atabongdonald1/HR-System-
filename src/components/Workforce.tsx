import React, { useState, useEffect } from 'react';
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
  Users,
  Plus,
  X,
  ShieldAlert,
  Clock,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { Employee } from '../types';
import { Trash2 } from 'lucide-react';

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
  switch (sentiment) {
    case 'Positive': return <Smile className="w-5 h-5 text-emerald-500" />;
    case 'Neutral': return <Meh className="w-5 h-5 text-slate-400" />;
    case 'Negative': return <Frown className="w-5 h-5 text-rose-500" />;
    default: return null;
  }
};

export function Workforce({ isAuthReady }: { isAuthReady?: boolean }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: 'Workforce Intelligence', description: 'NEXA-HR is analyzing workforce data.' });

  // New Employee State
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    email: '',
    role: '',
    department: '',
    joinDate: new Date().toISOString().split('T')[0],
    salary: 5000,
    currency: 'AED',
    performanceScore: 80,
    burnoutRisk: 20,
    resignationProbability: 10,
    sentiment: 'Positive',
    visaExpiry: '',
    nextReviewDate: ''
  });

  useEffect(() => {
    if (!isAuthReady || !auth.currentUser) return;

    const q = query(collection(db, 'employees'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Employee[];
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

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const employeeData = {
        ...newEmployee,
        kpis: [
          { name: 'Efficiency', value: 85, target: 90 },
          { name: 'Quality', value: 92, target: 95 }
        ],
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'employees'), employeeData);
      setIsAddModalOpen(false);
      setNewEmployee({
        name: '',
        email: '',
        role: '',
        department: '',
        joinDate: new Date().toISOString().split('T')[0],
        salary: 5000,
        currency: 'AED',
        performanceScore: 80,
        burnoutRisk: 20,
        resignationProbability: 10,
        sentiment: 'Positive',
        visaExpiry: '',
        nextReviewDate: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'employees');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee profile?')) return;
    try {
      await deleteDoc(doc(db, 'employees', id));
      setToastMessage({ title: 'Employee Deleted', description: 'The employee profile has been removed.' });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `employees/${id}`);
    }
  };

  const filteredEmployees = employees.filter(employee => 
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
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Employee
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
                      <button className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all">
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
                    {employee.nextReviewDate && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Next Review: {new Date(employee.nextReviewDate).toLocaleDateString()}
                      </p>
                    )}
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
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={triggerToast}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Sign Contract"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      {employee.visaExpiry && (
                        <p className="text-[10px] text-rose-500 flex items-center gap-1 justify-end font-bold">
                          <ShieldAlert className="w-3 h-3" />
                          Visa: {new Date(employee.visaExpiry).toLocaleDateString()}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Resignation Prob.</p>
                      <p className="text-sm font-bold text-slate-900">{employee.resignationProbability}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="mt-6 pt-6 border-t border-slate-50 flex flex-wrap gap-6">
                {employee.kpis?.map((kpi) => (
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
            <p className="text-slate-500">Start by adding your first digital employee profile.</p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
            >
              Add Employee
            </button>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-bold text-slate-900">New Employee Profile</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleAddEmployee} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={newEmployee.name}
                      onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={newEmployee.email}
                      onChange={e => setNewEmployee({...newEmployee, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="john@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Job Role</label>
                    <input 
                      required
                      type="text" 
                      value={newEmployee.role}
                      onChange={e => setNewEmployee({...newEmployee, role: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="e.g. Senior Architect"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Department</label>
                    <select 
                      required
                      value={newEmployee.department}
                      onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Operations">Operations</option>
                      <option value="HR">HR</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Join Date</label>
                    <input 
                      required
                      type="date" 
                      value={newEmployee.joinDate}
                      onChange={e => setNewEmployee({...newEmployee, joinDate: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Visa Expiry (Compliance)</label>
                    <input 
                      type="date" 
                      value={newEmployee.visaExpiry}
                      onChange={e => setNewEmployee({...newEmployee, visaExpiry: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all border-l-4 border-rose-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Next Performance Review</label>
                    <input 
                      type="date" 
                      value={newEmployee.nextReviewDate}
                      onChange={e => setNewEmployee({...newEmployee, nextReviewDate: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all border-l-4 border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Burnout Risk (%)</label>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={newEmployee.burnoutRisk}
                      onChange={e => setNewEmployee({...newEmployee, burnoutRisk: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                  >
                    Create Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              <p className="font-bold text-sm">{toastMessage.title}</p>
              <p className="text-slate-400 text-xs">{toastMessage.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
