import React from 'react';
import {
  LayoutDashboard,
  PiggyBank,
  BookOpenCheck,
  Receipt,
  Palmtree,
  Coins,
  Users,
  Target,
  Vote,
  FileSpreadsheet,
  History,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  Smartphone,
  Download,
} from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userRole: Role;
  unreadCount: number;
  onOpenCreateCircle?: () => void;
  onOpenMobileAppModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  unreadCount,
  onOpenCreateCircle,
  onOpenMobileAppModal,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'savings', label: 'Weekly Savings', icon: PiggyBank },
    { id: 'ledger', label: 'Common Fund Ledger', icon: BookOpenCheck },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'tours', label: 'Tour Planning', icon: Palmtree },
    { id: 'loans', label: 'Internal Loans', icon: Coins },
    { id: 'members', label: 'Circle Members', icon: Users },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'voting', label: 'Decision Polls', icon: Vote },
    { id: 'reports', label: 'Reports & Statements', icon: FileSpreadsheet },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'profile', label: 'My Profile', icon: UserCheck },
  ];

  const hiddenForMembers = ['ledger', 'reports', 'audit'];
  const visibleNavItems = navItems.filter((item) => {
    if (userRole === 'member' && hiddenForMembers.includes(item.id)) {
      return false;
    }
    return true;
  });

  if (userRole === 'super_admin') {
    visibleNavItems.push({ id: 'superadmin', label: 'Super Admin Platform', icon: ShieldCheck });
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-16 h-[calc(100vh-4rem)] p-4 flex-shrink-0 overflow-y-auto">
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-cute">
          Ithanu_njangal Navigation
        </div>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.id === 'savings' && unreadCount > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  Due
                </span>
              )}
            </button>
          );
        })}
      </div>

      {userRole !== 'member' && onOpenCreateCircle && (
        <div className="pt-3">
          <button
            onClick={onOpenCreateCircle}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create New Circle</span>
          </button>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-slate-200 space-y-3">
        {/* Mobile App Download Card */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-3 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-emerald-800">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold font-cute">Mobile App</span>
            </div>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              APK &bull; PWA
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Download Android APK or add to home screen.
          </p>
          <div className="mt-2.5 flex gap-1.5">
            <button
              onClick={onOpenMobileAppModal}
              className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition active:scale-95"
            >
              <Download className="w-3 h-3" />
              <span>Get APK</span>
            </button>
            <a
              href="https://github.com/karthikeyan-133/buddyfund/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium flex items-center justify-center transition"
              title="GitHub Releases"
            >
              v1.0
            </a>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">Audit-Verified Pool</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            All group savings &amp; loans are transparently synchronized.
          </p>
        </div>
      </div>
    </aside>
  );
};
