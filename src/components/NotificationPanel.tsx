import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Settings, 
  Check,
  Flame,
  ShieldAlert,
  Calendar,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Notification, NotificationPreferences } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  deleteDoc,
  setDoc,
  getDoc
} from 'firebase/firestore';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    performanceAlerts: true,
    complianceAlerts: true,
    burnoutAlerts: true,
    emailNotifications: false
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch Notifications
    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Notification[];
      setNotifications(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    // Fetch Preferences
    const prefDoc = doc(db, 'userPreferences', auth.currentUser.uid);
    getDoc(prefDoc).then(snap => {
      if (snap.exists()) {
        setPreferences(snap.data().notifications as NotificationPreferences);
      }
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notifications/${id}`);
    }
  };

  const updatePreferences = async (newPrefs: Partial<NotificationPreferences>) => {
    if (!auth.currentUser) return;
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    try {
      await setDoc(doc(db, 'userPreferences', auth.currentUser.uid), {
        notifications: updated
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `userPreferences/${auth.currentUser.uid}`);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'Burnout': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'Compliance': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'Performance': return <Calendar className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60]" 
            onClick={onClose} 
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                    {unreadCount} Unread Alerts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    showSettings ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-100"
                  )}
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {showSettings ? (
                <div className="p-6 space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Alert Preferences</h3>
                    <div className="space-y-4">
                      {[
                        { id: 'performanceAlerts', label: 'Performance Reviews', desc: 'Upcoming reviews and feedback cycles' },
                        { id: 'complianceAlerts', label: 'Compliance Deadlines', desc: 'Visa renewals and policy updates' },
                        { id: 'burnoutAlerts', label: 'Burnout Risk Alerts', desc: 'AI-detected high burnout probability' },
                        { id: 'emailNotifications', label: 'Email Notifications', desc: 'Receive a summary of alerts via email' },
                      ].map((pref) => (
                        <div key={pref.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{pref.label}</p>
                            <p className="text-xs text-slate-500">{pref.desc}</p>
                          </div>
                          <button
                            onClick={() => updatePreferences({ [pref.id]: !preferences[pref.id as keyof NotificationPreferences] })}
                            className={cn(
                              "w-12 h-6 rounded-full transition-all relative",
                              preferences[pref.id as keyof NotificationPreferences] ? "bg-blue-600" : "bg-slate-200"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                              preferences[pref.id as keyof NotificationPreferences] ? "right-1" : "left-1"
                            )} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-blue-600 shrink-0" />
                      <p className="text-xs text-blue-700 leading-relaxed">
                        NEXA-HR Intelligence uses these preferences to filter the proactive alerts generated by the core engine.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-6 transition-all hover:bg-slate-50 relative group",
                          !n.read && "bg-blue-50/30"
                        )}
                      >
                        {!n.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                        )}
                        <div className="flex gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                            n.priority === 'High' ? "bg-red-50" : "bg-white border border-slate-100"
                          )}>
                            {getIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-bold text-slate-900 truncate pr-4">{n.title}</h4>
                              <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed mb-3">
                              {n.message}
                            </p>
                            <div className="flex items-center gap-3">
                              {!n.read && (
                                <button 
                                  onClick={() => markAsRead(n.id)}
                                  className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700"
                                >
                                  Mark as Read
                                </button>
                              )}
                              <button 
                                onClick={() => deleteNotification(n.id)}
                                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-12 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-slate-200" />
                      </div>
                      <h3 className="text-slate-900 font-bold">All caught up!</h3>
                      <p className="text-slate-500 text-sm mt-1">
                        No new notifications from the NEXA-HR Intelligence core.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!showSettings && notifications.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button 
                  onClick={async () => {
                    for (const n of notifications) {
                      if (!n.read) await markAsRead(n.id);
                    }
                  }}
                  className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Mark All as Read
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
