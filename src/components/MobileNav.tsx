import React from 'react';
import {
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Grid,
} from 'lucide-react';
import { User } from '../types';

interface MobileNavProps {
  activeTab: string;
  currentUser?: User;
  unreadCount?: number;
  onSelectTab: (tab: string) => void;
  onOpenMoreMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  currentUser,
  unreadCount = 0,
  onSelectTab,
  onOpenMoreMenu,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
  ];

  const isMoreTabActive = ![
    'dashboard',
    'savings',
    'expenses',
    'profile',
  ].includes(activeTab);

  const isProfileActive = activeTab === 'profile';

  return (
    <nav
      id="mobile-bottom-nav"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mob-nav-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 min-h-[48px] py-1 px-1 flex flex-col items-center justify-center rounded-xl transition-all duration-150 relative ${
                isActive
                  ? 'text-emerald-700 font-bold scale-[1.03]'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-full" />
              )}
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* More Modules Drawer Button */}
        <button
          id="mob-nav-more"
          onClick={onOpenMoreMenu}
          className={`flex-1 min-h-[48px] py-1 px-1 flex flex-col items-center justify-center rounded-xl transition-all duration-150 relative ${
            isMoreTabActive
              ? 'text-emerald-700 font-bold scale-[1.03]'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          {isMoreTabActive && (
            <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-full" />
          )}
          <div
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
              isMoreTabActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'
            }`}
          >
            <Grid className={`w-5 h-5 ${isMoreTabActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
            {isMoreTabActive ? activeTab.slice(0, 6) : 'More'}
          </span>
        </button>

        {/* User Profile Tab with Profile Photo */}
        <button
          id="mob-nav-profile"
          onClick={() => onSelectTab('profile')}
          className={`flex-1 min-h-[48px] py-1 px-1 flex flex-col items-center justify-center rounded-xl transition-all duration-150 relative ${
            isProfileActive
              ? 'text-emerald-700 font-bold scale-[1.03]'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          {isProfileActive && (
            <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-full" />
          )}
          <div className="relative w-7 h-7 flex items-center justify-center">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className={`w-6 h-6 rounded-full object-cover transition-all ${
                  isProfileActive
                    ? 'ring-2 ring-emerald-600 shadow-sm'
                    : 'ring-1 ring-slate-300'
                }`}
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                P
              </div>
            )}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full ring-1 ring-white" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};

