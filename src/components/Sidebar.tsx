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
} from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userRole: Role;
  unreadCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  unreadCount,
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

  if (userRole === 'super_admin') {
    navItems.push({ id: 'superadmin', label: 'Super Admin Platform', icon: ShieldCheck });
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-16 h-[calc(100vh-4rem)] p-4 flex-shrink-0 overflow-y-auto">
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          BuddyFund Navigation
        </div>
        {navItems.map((item) => {
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

      <div className="mt-auto pt-4 border-t border-slate-200">
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
