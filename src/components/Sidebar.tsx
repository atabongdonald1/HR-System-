import React from 'react';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAction?: (message: string) => void;
  isAuthReady: boolean;
  onLogin?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
  { id: 'workforce', label: 'Workforce', icon: Users },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'payroll', label: 'Payroll', icon: Wallet },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { id: 'console', label: 'AI Console', icon: MessageSquare },
];

export function Sidebar({ activeTab, setActiveTab, onAction, isAuthReady, onLogin }: SidebarProps) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      onAction?.('Logged out successfully.');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
          N
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">NEXA-HR</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">HR Operating System</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              activeTab === item.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              activeTab === item.id ? "text-white" : "text-slate-500 group-hover:text-white"
            )} />
            <span className="font-medium">{item.label}</span>
            {activeTab === item.id && (
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
            activeTab === 'settings' 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        {isAuthReady ? (
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        ) : (
          <button 
            onClick={onLogin}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            <LogOut className="w-5 h-5 rotate-180" />
            <span className="font-medium">Login</span>
          </button>
        )}
      </div>
    </div>
  );
}
