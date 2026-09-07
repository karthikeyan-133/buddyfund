import React, { useState } from 'react';
import {
  Users,
  Bell,
  CheckCircle2,
  ChevronDown,
  Plus,
  Shield,
  UserCheck,
  LogOut,
  Sparkles,
  ExternalLink,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { User, Circle, AppNotification } from '../types';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  circles: Circle[];
  currentCircle: Circle | null;
  notifications: AppNotification[];
  onSelectCircle: (circleId: string) => void;
  onSwitchUser: (userId: string) => void;
  onOpenCreateCircle: () => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  circles,
  currentCircle,
  notifications,
  onSelectCircle,
  onSwitchUser,
  onOpenCreateCircle,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onNavigateTab,
  onOpenLoginModal,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCircleMenu, setShowCircleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-slate-200 shadow-sm w-full">
      {/* Mobile View Top Bar (< sm) */}
      <div className="sm:hidden px-3 pt-2.5 pb-2 flex flex-col gap-2">
        {/* Row 1: Brand (Left) + Notifications & Profile (Right) - No overlapping */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo + Title Stack */}
          <button
            id="header-brand-btn-mobile"
            onClick={() => onNavigateTab('dashboard')}
            className="flex items-center gap-2 text-left group focus:outline-none flex-shrink-0"
            title="BuddyFund Home"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-xs flex-shrink-0">
              <span className="font-bold text-base font-mono tracking-tighter">₹</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-base leading-none tracking-tight font-['Space_Grotesk']">
                BuddyFund
              </span>
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider mt-0.5 leading-none">
                Group Savings
              </span>
            </div>
          </button>

          {/* Right Mobile Controls: Notification Bell + Profile Switcher */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Notification Bell */}
            <button
              id="notification-bell-btn-mobile"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-1.5 text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition min-w-[36px] min-h-[36px] flex items-center justify-center active:scale-95 shadow-xs"
              aria-label="Notifications"
              title={`${unreadNotifs.length} unread notification${unreadNotifs.length === 1 ? '' : 's'}`}
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1 min-w-[17px] h-[17px] bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                  {unreadNotifs.length > 9 ? '9+' : unreadNotifs.length}
                </span>
              )}
            </button>

            {/* User Profile Button with Name and Role */}
            <button
              id="persona-switcher-btn-mobile"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 transition active:scale-95 shadow-xs"
              title={`Signed in as ${currentUser.name}`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover ring-1.5 ring-emerald-500"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-1.5 ring-white" />
              </div>
              <div className="text-left leading-tight min-w-0">
                <div className="font-semibold text-slate-900 text-[11px] truncate max-w-[68px]">
                  {currentUser.name}
                </div>
                <div className="text-[8px] text-emerald-700 font-bold uppercase tracking-wider truncate">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* Row 2: Circle Selector & Subtitle */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <button
            id="circle-selector-btn-mobile"
            onClick={() => setShowCircleMenu(!showCircleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-colors min-w-0 flex-1 max-w-[230px]"
          >
            <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{currentCircle ? currentCircle.name : 'Select Circle'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap pl-1 flex-shrink-0">
            Savings &amp; Tour Ledger
          </span>
        </div>
      </div>

      {/* Desktop Navigation Header (sm and up) */}
      <div className="hidden sm:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 items-center justify-between gap-4">
        {/* Left: Brand & Circle Selector */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            id="header-brand-btn"
            onClick={() => onNavigateTab('dashboard')}
            className="flex items-center gap-1.5 sm:gap-2.5 text-left group focus:outline-none flex-shrink-0"
            title="BuddyFund Home"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <span className="font-bold text-base sm:text-lg font-mono tracking-tighter">₹</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base sm:text-xl leading-tight tracking-tight font-['Space_Grotesk']">
                  BuddyFund
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-100 text-emerald-800 rounded">
                  Group Savings
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none mt-0.5">Savings &amp; Tour Ledger</p>
            </div>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* Circle Selector Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              id="circle-selector-btn"
              onClick={() => setShowCircleMenu(!showCircleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition-colors"
              title={currentCircle ? currentCircle.name : 'Select Circle'}
            >
              <Users className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="max-w-[180px] truncate font-semibold">
                {currentCircle ? currentCircle.name : 'Select Circle'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            </div>
        </div>

        {/* Right: Notifications & User Profile Photo */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Notifications Bell with Unread Badge */}
          <div className="relative">
            <button
              id="notification-bell-btn"
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 sm:p-2.5 text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95 shadow-sm"
              aria-label="Notifications"
              title={`${unreadNotifs.length} unread notification${unreadNotifs.length === 1 ? '' : 's'}`}
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[19px] h-[19px] bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-sm animate-pulse">
                  {unreadNotifs.length > 9 ? '9+' : unreadNotifs.length}
                </span>
              )}
            </button>
          </div>

          {/* User Profile Photo & Quick Persona Switcher */}
          <div className="relative">
            <button
              id="persona-switcher-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700 transition active:scale-95 shadow-sm"
              title={`Signed in as ${currentUser.name} (${currentUser.role.replace('_', ' ')}) — Click to view profile or switch demo user`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500 shadow-sm"
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"
                  title="Online"
                />
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-900 leading-none truncate max-w-[110px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-emerald-700 font-bold uppercase mt-0.5 tracking-wider">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Global Dropdowns positioned for both Mobile and Desktop */}

      {/* Circle Selector Dropdown Overlay */}
      {showCircleMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] sm:backdrop-blur-none"
            onClick={() => setShowCircleMenu(false)}
          />
          <div className="fixed sm:absolute left-3 right-3 sm:left-44 sm:right-auto top-[95px] sm:top-14 sm:w-64 bg-white rounded-2xl sm:rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Your Circles
            </div>
            {circles.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelectCircle(c.id);
                  setShowCircleMenu(false);
                }}
                className={`w-full px-3 py-2.5 text-left text-sm flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                  currentCircle?.id === c.id ? 'bg-emerald-50/70 font-semibold text-emerald-900' : 'text-slate-700'
                }`}
              >
                <div className="truncate">
                  <div className="truncate font-medium">{c.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {c.currencySymbol}
                    {c.contributionAmount}/{c.contributionFrequency}
                  </div>
                </div>
                {currentCircle?.id === c.id && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
              </button>
            ))}
            <div className="border-t border-slate-100 my-1 pt-1">
              <button
                id="header-create-circle-btn"
                onClick={() => {
                  setShowCircleMenu(false);
                  onOpenCreateCircle();
                }}
                className="w-full px-3 py-2.5 text-left text-sm text-emerald-700 font-semibold flex items-center gap-2 hover:bg-emerald-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Circle
              </button>
            </div>
          </div>
        </>
      )}

      {/* Notifications Dropdown Overlay */}
      {showNotifMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] sm:backdrop-blur-none"
            onClick={() => setShowNotifMenu(false)}
          />
          <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-28 top-[52px] sm:top-14 sm:w-80 md:w-96 bg-white rounded-2xl sm:rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                {unreadNotifs.length > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-rose-100 text-rose-800 rounded-full font-bold">
                    {unreadNotifs.length} new
                  </span>
                )}
              </div>
              {unreadNotifs.length > 0 && (
                <button
                  onClick={onMarkAllNotificationsRead}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No notifications yet</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      onMarkNotificationRead(n.id);
                      if (n.linkToTab) {
                        onNavigateTab(n.linkToTab);
                        setShowNotifMenu(false);
                      }
                    }}
                    className={`p-3.5 text-left hover:bg-slate-50 cursor-pointer transition ${
                      !n.isRead ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(n.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* User Persona Switcher Dropdown Overlay */}
      {showUserMenu && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] sm:backdrop-blur-none"
            onClick={() => setShowUserMenu(false)}
          />
          <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-4 top-[52px] sm:top-14 sm:w-80 bg-white rounded-2xl sm:rounded-xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Current Active User Profile Card */}
            <div className="px-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500"
                />
                <div className="flex-1 truncate">
                  <div className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</div>
                  <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-[9px] rounded-full font-bold uppercase ${
                      currentUser.role === 'super_admin'
                        ? 'bg-purple-100 text-purple-800'
                        : currentUser.role === 'circle_admin'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigateTab('profile');
                }}
                className="mt-3 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5" />
                View Full Financial Profile
              </button>
            </div>

            <div className="px-3 pt-2 pb-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Quick Demo Switcher
              </p>
            </div>

            <div className="max-h-56 overflow-y-auto px-1 py-0.5">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSwitchUser(u.id);
                    setShowUserMenu(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-slate-50 text-left transition ${
                    currentUser.id === u.id ? 'bg-emerald-50/70 font-semibold text-emerald-950' : ''
                  }`}
                >
                  <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 truncate">
                    <div className="text-xs font-semibold text-slate-900 truncate">{u.name}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span
                        className={`px-1.5 py-0.2 text-[9px] rounded font-semibold uppercase ${
                          u.role === 'super_admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'circle_admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  {currentUser.id === u.id && <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 mt-2 pt-2 px-3">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenLoginModal();
                }}
                className="w-full py-1.5 px-3 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-center font-medium transition"
              >
                Authenticate with Phone OTP / Password
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
