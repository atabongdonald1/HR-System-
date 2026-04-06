import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  Sun, 
  Database, 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: 'Settings Updated', description: 'Your preferences have been saved successfully.' });
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [settings, setSettings] = useState({
    profile: {
      name: 'Donald Atabong',
      email: 'atabongdonald1@gmail.com',
      role: 'System Administrator',
      timezone: 'UTC+4 (Dubai)',
      language: 'English (US)'
    },
    notifications: {
      emailAlerts: true,
      pushNotifications: true,
      performanceReports: true,
      complianceAlerts: true
    },
    appearance: {
      theme: 'light',
      compactMode: false,
      animations: true
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'userPreferences', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'userPreferences', auth.currentUser.uid), settings);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSystemReset = async () => {
    setIsResetting(true);
    try {
      const collectionsToClear = ['candidates', 'jobs', 'employees', 'notifications'];
      const { getDocs, collection, deleteDoc, doc } = await import('firebase/firestore');
      
      for (const collName of collectionsToClear) {
        const snapshot = await getDocs(collection(db, collName));
        const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, collName, d.id)));
        await Promise.all(deletePromises);
      }

      setToastMessage({
        title: 'System Reset Complete',
        description: 'All organizational data has been cleared from NEXA-HR.'
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setIsResetConfirmOpen(false);
    } catch (error) {
      console.error("Error resetting system:", error);
      setToastMessage({
        title: 'Reset Failed',
        description: 'An error occurred while clearing the database.'
      });
      setShowToast(true);
    } finally {
      setIsResetting(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Database },
  ];

  return (
    <div id="settings-view" className="space-y-8">
      <div id="settings-header" className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Settings</h2>
          <p className="text-slate-500">Manage your account preferences and system configurations.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                activeSection === section.id 
                  ? "bg-white text-blue-600 shadow-sm border border-slate-100" 
                  : "text-slate-500 hover:bg-white/50 hover:text-slate-900"
              )}
            >
              <section.icon className="w-5 h-5" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeSection === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Profile Information</h3>
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative">
                        <div className="w-24 h-24 bg-slate-100 rounded-3xl border-4 border-white shadow-lg overflow-hidden">
                          <img 
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Donald" 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-md border border-slate-100 text-blue-600 hover:text-blue-700 transition-colors">
                          <Globe className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{settings.profile.name}</h4>
                        <p className="text-slate-500 text-sm">{settings.profile.role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Full Name</label>
                        <input 
                          type="text" 
                          value={settings.profile.name}
                          onChange={e => setSettings({...settings, profile: {...settings.profile, name: e.target.value}})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="email" 
                            readOnly
                            value={settings.profile.email}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-400 cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Timezone</label>
                        <select 
                          value={settings.profile.timezone}
                          onChange={e => setSettings({...settings, profile: {...settings.profile, timezone: e.target.value}})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          <option>UTC+4 (Dubai)</option>
                          <option>UTC+0 (London)</option>
                          <option>UTC-5 (New York)</option>
                          <option>UTC+8 (Singapore)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Language</label>
                        <select 
                          value={settings.profile.language}
                          onChange={e => setSettings({...settings, profile: {...settings.profile, language: e.target.value}})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          <option>English (US)</option>
                          <option>Arabic (UAE)</option>
                          <option>French (FR)</option>
                          <option>Spanish (ES)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Notification Preferences</h3>
                    <div className="space-y-4">
                      {[
                        { id: 'emailAlerts', label: 'Email Alerts', desc: 'Receive critical system alerts via email.' },
                        { id: 'pushNotifications', label: 'Push Notifications', desc: 'Real-time browser notifications for urgent tasks.' },
                        { id: 'performanceReports', label: 'Performance Reports', desc: 'Weekly AI-generated workforce performance summaries.' },
                        { id: 'complianceAlerts', label: 'Compliance Alerts', desc: 'Notifications for visa expiries and legal updates.' },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                            <p className="text-slate-500 text-xs">{item.desc}</p>
                          </div>
                          <button 
                            onClick={() => setSettings({
                              ...settings, 
                              notifications: {
                                ...settings.notifications, 
                                [item.id as keyof typeof settings.notifications]: !settings.notifications[item.id as keyof typeof settings.notifications]
                              }
                            })}
                            className={cn(
                              "w-12 h-6 rounded-full transition-all relative",
                              settings.notifications[item.id as keyof typeof settings.notifications] ? "bg-blue-600" : "bg-slate-300"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                              settings.notifications[item.id as keyof typeof settings.notifications] ? "left-7" : "left-1"
                            )} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Security Settings</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Current Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••"
                            className="w-full pl-11 pr-12 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-blue-900">Two-Factor Authentication</p>
                          <p className="text-xs text-blue-700 mt-1">Add an extra layer of security to your account by enabling 2FA.</p>
                          <button className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all">
                            Enable 2FA
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'system' && (
                <motion.div
                  key="system"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-6">System Configuration</h3>
                    <div className="space-y-4">
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Database className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">Data Synchronization</p>
                            <p className="text-xs text-slate-500">Last synced: Today at 10:45 AM</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all">
                          Sync Now
                        </button>
                      </div>
                      <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Shield className="w-6 h-6 text-rose-600" />
                          </div>
                          <div>
                            <p className="font-bold text-rose-900">Danger Zone</p>
                            <p className="text-xs text-rose-700">Irreversible system actions.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsResetConfirmOpen(true)}
                          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all"
                        >
                          Reset System
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm System Reset</h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                This action is <span className="font-bold text-rose-600">irreversible</span>. All candidates, jobs, employees, and notifications will be permanently deleted from the NEXA-HR database.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSystemReset}
                  disabled={isResetting}
                  className="flex-1 px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isResetting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Reset All Data
                </button>
              </div>
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
            className="fixed bottom-8 right-8 z-[110] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              toastMessage.title.includes('Failed') ? "bg-rose-500" : "bg-emerald-500"
            )}>
              {toastMessage.title.includes('Failed') ? <AlertCircle className="w-5 h-5 text-white" /> : <CheckCircle2 className="w-5 h-5 text-white" />}
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
