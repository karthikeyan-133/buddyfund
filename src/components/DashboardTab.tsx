import React from 'react';
import {
  Wallet,
  TrendingUp,
  Users,
  Palmtree,
  Receipt,
  Coins,
  Percent,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  PlusCircle,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Circle, User, Transaction, Tour, Loan, Goal } from '../types';

interface DashboardTabProps {
  circle: Circle;
  currentUser: User;
  wallet: {
    currentBalance: number;
    totalContributions: number;
    totalExpenses: number;
    tourExpenses: number;
    foodExpenses: number;
    loansGiven: number;
    loansPrincipalRepaid: number;
    interestEarned: number;
    activeLoanOutstanding: number;
    activeLoanCount: number;
  };
  membersCount: number;
  currentWeekStats: {
    weekLabel: string;
    paidCount: number;
    pendingCount: number;
    totalExpected: number;
  };
  upcomingTour: Tour | null;
  recentTransactions: Transaction[];
  activeLoans: Loan[];
  goals: Goal[];
  weeklyChartData: { name: string; collected: number; target: number }[];
  expenseChartData: { name: string; value: number }[];
  onNavigateTab: (tab: string) => void;
  onOpenRecordPaymentModal: () => void;
  onOpenAddExpenseModal: () => void;
  onOpenRequestLoanModal: () => void;
  onOpenTourProposalModal: () => void;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

export const DashboardTab: React.FC<DashboardTabProps> = ({
  circle,
  currentUser,
  wallet,
  membersCount,
  currentWeekStats,
  upcomingTour,
  recentTransactions,
  activeLoans,
  goals,
  weeklyChartData,
  expenseChartData,
  onNavigateTab,
  onOpenRecordPaymentModal,
  onOpenAddExpenseModal,
  onOpenRequestLoanModal,
  onOpenTourProposalModal,
}) => {
  const currency = circle.currencySymbol || '₹';
  const isAdmin = currentUser.role === 'circle_admin' || currentUser.role === 'super_admin';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Group Ledger • {circle.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-['Space_Grotesk']">
            {currency}
            {wallet.currentBalance.toLocaleString()}
            <span className="text-sm font-normal text-emerald-300 ml-2 font-sans">
              available common pool
            </span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            {circle.contributionFrequency === 'weekly' ? 'Weekly' : 'Monthly'} savings of {currency}
            {circle.contributionAmount} per member. Automated double-entry ledger calculated live.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Pay Button - Accessible to Both Admin & Members */}
          <button
            id="dash-record-payment-btn"
            onClick={onOpenRecordPaymentModal}
            className="group relative flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-950 font-extrabold rounded-2xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_6px_20px_-4px_rgba(16,185,129,0.45)] hover:shadow-[0_8px_24px_-4px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 border-t border-emerald-200/60"
          >
            <span className="w-6 h-6 rounded-xl bg-slate-950/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <PlusCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </span>
            <span className="tracking-tight">Pay</span>
          </button>

          {isAdmin && (
            /* Expense Button - Frosted Rose Glass Pill */
            <button
              id="dash-add-expense-btn"
              onClick={onOpenAddExpenseModal}
              className="group relative flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-md border border-white/15 hover:border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              <span className="w-6 h-6 rounded-xl bg-rose-500/25 border border-rose-400/30 flex items-center justify-center text-rose-300 group-hover:scale-110 group-hover:bg-rose-500/35 transition-all duration-200">
                <Receipt className="w-3.5 h-3.5 stroke-[2.2]" />
              </span>
              <span className="tracking-tight">Expense</span>
            </button>
          )}

          {/* Request Loan Button - Frosted Amber Glass Pill */}
          <button
            id="dash-request-loan-btn"
            onClick={onOpenRequestLoanModal}
            className="group relative flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-md border border-white/15 hover:border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            <span className="w-6 h-6 rounded-xl bg-amber-400/25 border border-amber-300/30 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-400/35 transition-all duration-200">
              <Coins className="w-3.5 h-3.5 stroke-[2.2]" />
            </span>
            <span className="tracking-tight">Request Loan</span>
          </button>
        </div>
      </div>

      {/* Ithanu_njangal Modules - Aesthetic Quick Access Grid */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-cute flex items-center gap-2" style={{ fontFamily: "'Comfortaa', 'Fredoka', 'Quicksand', cursive, sans-serif" }}>
              <span>⚡ Ithanu_njangal Modules</span>
              <span className="text-[10px] font-semibold font-sans px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                Quick Access
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-aesthetic">Instant access to your circle activities &amp; squad tools</p>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3.5">
          {[
            {
              id: 'savings',
              label: 'Savings',
              subtext: 'Weekly Pot',
              icon: (
                <svg className="w-12 h-11 sm:w-14 sm:h-12" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="40" cy="58" rx="26" ry="7" fill="#10b981" fillOpacity="0.2" />
                  <path d="M40 20C27 20 18 29 18 40C18 51 28 55 40 55C52 55 62 51 62 40C62 29 53 20 40 20Z" fill="url(#piggy-grad)" />
                  <path d="M22 28C20 22 23 16 27 18C31 20 29 25 27 28" fill="#059669" />
                  <path d="M58 28C60 22 57 16 53 18C49 20 51 25 53 28" fill="#059669" />
                  <ellipse cx="40" cy="42" rx="9" ry="6" fill="#6ee7b7" />
                  <circle cx="37" cy="42" r="1.5" fill="#047857" />
                  <circle cx="43" cy="42" r="1.5" fill="#047857" />
                  <circle cx="32" cy="34" r="2" fill="#064e3b" />
                  <circle cx="48" cy="34" r="2" fill="#064e3b" />
                  <rect x="34" y="21" width="12" height="2.5" rx="1.2" fill="#047857" />
                  <circle cx="40" cy="13" r="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="40" y="16.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#78350f" fontFamily="sans-serif">₹</text>
                  <defs>
                    <linearGradient id="piggy-grad" x1="18" y1="20" x2="62" y2="55" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#34d399" />
                      <stop offset="1" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
              ),
            },
            {
              id: 'expenses',
              label: 'Expenses',
              subtext: 'Group Bills',
              icon: (
                <svg className="w-12 h-11 sm:w-14 sm:h-12" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="40" cy="58" rx="26" ry="7" fill="#f59e0b" fillOpacity="0.2" />
                  <path d="M22 28L30 18H44L52 28L49 54H25L22 28Z" fill="url(#food-bag-grad)" />
                  <path d="M30 18L37 14L44 18L37 22L30 18Z" fill="#fef08a" />
                  <circle cx="37" cy="36" r="6" fill="#ef4444" />
                  <circle cx="37" cy="36" r="3" fill="#ffffff" />
                  <path d="M50 36L53 54H63L65 36H50Z" fill="#38bdf8" />
                  <ellipse cx="57.5" cy="36" rx="7.5" ry="3" fill="#0284c7" />
                  <line x1="57.5" y1="36" x2="62" y2="24" stroke="#e0f2fe" strokeWidth="2.5" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="food-bag-grad" x1="22" y1="18" x2="52" y2="54" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#fbbf24" />
                      <stop offset="1" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                </svg>
              ),
            },
            {
              id: 'tours',
              label: 'Tours',
              subtext: 'Vacations',
              icon: (
                <svg className="w-12 h-11 sm:w-14 sm:h-12" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="40" cy="58" rx="28" ry="7" fill="#0284c7" fillOpacity="0.2" />
                  <path d="M18 42L28 32H50L62 40L64 47L60 52H22L18 47V42Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <path d="M30 32L36 24H48L54 32H30Z" fill="#38bdf8" fillOpacity="0.8" />
                  <rect x="34" y="21" width="20" height="4" rx="2" fill="#10b981" />
                  <circle cx="28" cy="52" r="5" fill="#1e293b" />
                  <circle cx="28" cy="52" r="2" fill="#94a3b8" />
                  <circle cx="54" cy="52" r="5" fill="#1e293b" />
                  <circle cx="54" cy="52" r="2" fill="#94a3b8" />
                  <circle cx="19" cy="45" r="2" fill="#fbbf24" />
                </svg>
              ),
            },
            {
              id: 'loans',
              label: 'Loans',
              subtext: 'Peer Credit',
              icon: (
                <svg className="w-12 h-11 sm:w-14 sm:h-12" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="40" cy="58" rx="26" ry="7" fill="#8b5cf6" fillOpacity="0.2" />
                  <path d="M22 36L44 22L58 31L36 45L22 36Z" fill="#0f172a" />
                  <path d="M24 36L44 23.5L56 31L36 43.5L24 36Z" fill="#f8fafc" />
                  <path d="M34 29L44 23L50 27L40 33L34 29Z" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="2 2" fill="#eff6ff" />
                  <rect x="38" y="34" width="8" height="3" rx="1" fill="#f59e0b" />
                  <circle cx="48" cy="20" r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" />
                  <text x="48" y="23" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#78350f" fontFamily="sans-serif">₹</text>
                  <circle cx="58" cy="18" r="1.5" fill="#10b981" />
                </svg>
              ),
            },
            {
              id: 'members',
              label: 'Squad',
              subtext: 'Directory',
              icon: (
                <svg className="w-12 h-11 sm:w-14 sm:h-12" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="40" cy="58" rx="26" ry="7" fill="#f59e0b" fillOpacity="0.2" />
                  <path d="M40 24L58 33V49L40 58L22 49V33L40 24Z" fill="url(#box-side-grad)" />
                  <path d="M40 24L58 33L40 42L22 33L40 24Z" fill="#fde047" />
                  <path d="M22 33L40 42V58L22 49V33Z" fill="#d97706" />
                  <path d="M40 42L58 33V49L40 58V42Z" fill="#b45309" />
                  <path d="M36 26L44 30L44 40L36 36Z" fill="#fef08a" opacity="0.8" />
                  <path d="M31 42L31 46M31 42L29 44M31 42L33 44" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="box-side-grad" x1="22" y1="24" x2="58" y2="58" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#f59e0b" />
                      <stop offset="1" stopColor="#b45309" />
                    </linearGradient>
                  </defs>
                </svg>
              ),
            },
            {
              id: 'goals',
              label: 'Goals',
              subtext: 'Targets',
              icon: (
                <svg className="w-12 h-11 sm:w-14 sm:h-12" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="40" cy="58" rx="26" ry="7" fill="#10b981" fillOpacity="0.2" />
                  <path d="M24 36L28 54H52L56 36H24Z" fill="#10b981" />
                  <path d="M21 34H59V38H21V34Z" fill="#047857" rx="1" />
                  <rect x="30" y="40" width="3" height="11" rx="1" fill="#ecfdf5" />
                  <rect x="38.5" y="40" width="3" height="11" rx="1" fill="#ecfdf5" />
                  <rect x="47" y="40" width="3" height="11" rx="1" fill="#ecfdf5" />
                  <path d="M28 34L37 20H43L52 34" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <circle cx="40" cy="28" r="3" fill="#fbbf24" />
                </svg>
              ),
            },
            {
              id: 'voting',
              label: 'Polls',
              subtext: 'Consensus',
              icon: (
                <svg className="w-12 h-11 sm:w-14 sm:h-12" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="40" cy="58" rx="28" ry="7" fill="#059669" fillOpacity="0.2" />
                  <path d="M24 48L32 46L44 48L52 42L56 46L48 52H28L24 48Z" fill="#f97316" />
                  <line x1="48" y1="46" x2="42" y2="28" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="39" y1="28" x2="45" y2="28" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="26" cy="50" r="5.5" fill="#1e293b" />
                  <circle cx="26" cy="50" r="2" fill="#cbd5e1" />
                  <circle cx="54" cy="50" r="5.5" fill="#1e293b" />
                  <circle cx="54" cy="50" r="2" fill="#cbd5e1" />
                  <circle cx="40" cy="22" r="5" fill="#10b981" />
                  <path d="M38 22L40 24L43 20" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
            },
            {
              id: isAdmin ? 'ledger' : 'profile',
              label: isAdmin ? 'Ledger' : 'More',
              subtext: isAdmin ? 'Audit Trail' : 'My Passbook',
              icon: (
                <svg className="w-12 h-11 sm:w-14 sm:h-12" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="40" cy="58" rx="24" ry="6" fill="#059669" fillOpacity="0.2" />
                  <rect x="25" y="22" width="12" height="12" rx="3.5" fill="#0f766e" />
                  <rect x="43" y="22" width="12" height="12" rx="3.5" fill="#0284c7" />
                  <rect x="25" y="40" width="12" height="12" rx="3.5" fill="#115e59" />
                  <g transform="translate(49, 46) rotate(45)">
                    <rect x="-6" y="-6" width="12" height="12" rx="3.5" fill="#10b981" />
                  </g>
                </svg>
              ),
            },
          ].map((mod) => (
            <button
              key={mod.id}
              id={`dash-module-${mod.id}`}
              onClick={() => onNavigateTab(mod.id)}
              className="bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-emerald-300 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 flex flex-col items-center justify-between text-center transition-all duration-200 hover:-translate-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_-8px_rgba(16,185,129,0.18)] group active:scale-95"
            >
              <div className="w-full flex items-center justify-center pt-1 group-hover:scale-110 transition-transform duration-200">
                {mod.icon}
              </div>
              <div className="mt-1.5 sm:mt-2 w-full">
                <div className="font-bold text-slate-800 text-xs sm:text-sm tracking-tight group-hover:text-emerald-700 transition-colors">
                  {mod.label}
                </div>
                <div className="text-[10px] text-slate-400 font-medium hidden sm:block truncate">
                  {mod.subtext}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Top 7 Core Financial Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Current Balance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">💰 Current Fund</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {currency}{wallet.currentBalance.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> Live verified balance
            </p>
          </div>
        </div>

        {/* Card 2: Total Saved */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">📈 Total Saved</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {currency}{wallet.totalContributions.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Across all member weeks</p>
          </div>
        </div>

        {/* Card 3: Tour Budget */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">🎯 Tour Budget</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Palmtree className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {currency}{upcomingTour ? upcomingTour.estimatedBudget.toLocaleString() : '0'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {upcomingTour ? (
                <span className="text-amber-700">
                  {currency}{upcomingTour.allocatedFromCircle.toLocaleString()} funded (
                  {upcomingTour.estimatedBudget > 0
                    ? Math.round((upcomingTour.allocatedFromCircle / upcomingTour.estimatedBudget) * 100)
                    : 0}
                  %)
                </span>
              ) : (
                'No active tour planned'
              )}
            </p>
          </div>
        </div>

        {/* Card 4: Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">💸 Total Expenses</span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {currency}{wallet.totalExpenses.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tour: {currency}{wallet.tourExpenses.toLocaleString()} • Food: {currency}{wallet.foodExpenses.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Card 5: Active Loans */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">🏦 Active Loans</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {currency}{wallet.activeLoanOutstanding.toLocaleString()}
            </div>
            <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
              {wallet.activeLoanCount} active internal loan
            </p>
          </div>
        </div>

        {/* Card 6: Interest Earned */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">📊 Interest Earned</span>
            <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Percent className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold text-emerald-700">
              +{currency}{wallet.interestEarned.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              Added to group common wealth
            </p>
          </div>
        </div>

        {/* Card 7: Circle Squad */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">👥 Group Members</span>
            <span className="p-2 bg-slate-100 text-slate-700 rounded-xl">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {membersCount} friends
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Target: {currency}{circle.contributionAmount * membersCount} weekly collection
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('members')}
              className="text-xs text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-0.5"
            >
              View directory <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Sections: Upcoming Tour & Expense Categories */}
      <div className={`grid grid-cols-1 ${upcomingTour ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
        {/* Tour Feature Box */}
        {upcomingTour && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
            <div className="relative h-36 w-full">
              <img
                src={upcomingTour.bannerUrl}
                alt={upcomingTour.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="text-[10px] font-semibold tracking-wider uppercase text-emerald-300">
                  Featured Tour Proposal
                </div>
                <h4 className="font-bold text-base leading-tight font-['Space_Grotesk']">
                  {upcomingTour.title}
                </h4>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Destination: {upcomingTour.destination}</span>
                  <span className="font-semibold text-slate-900">{upcomingTour.duration}</span>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Savings Allocation</span>
                    <span className="font-semibold text-slate-900">
                      {currency}{upcomingTour.allocatedFromCircle.toLocaleString()} / {currency}
                      {upcomingTour.estimatedBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((upcomingTour.allocatedFromCircle / upcomingTour.estimatedBudget) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                    <span>{Math.round((upcomingTour.allocatedFromCircle / upcomingTour.estimatedBudget) * 100)}% Funded</span>
                    <span className="font-medium text-emerald-700">
                      Estimated {currency}{Math.round(upcomingTour.estimatedBudget / upcomingTour.attendingMemberIds.length)}/member
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">{upcomingTour.attendingMemberIds.length} friends attending</span>
                <button
                  id="dash-view-tour-btn"
                  onClick={() => onNavigateTab('tours')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition"
                >
                  Tour Itinerary &amp; Budget
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expense Categories Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Expense Categories</h3>
              <p className="text-xs text-slate-500">Where the money went</p>
            </div>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs text-emerald-600 font-medium hover:underline"
            >
              Expenses
            </button>
          </div>

          {expenseChartData.length > 0 ? (
            <>
              <div className="h-56 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {expenseChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`${currency}${val}`, 'Amount']}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                {expenseChartData.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-slate-600 truncate">{cat.name}:</span>
                    <span className="font-semibold text-slate-900">{currency}{cat.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-center p-4 text-slate-400">
              <Receipt className="w-8 h-8 text-slate-300 mb-2" />
              <span className="text-xs font-semibold text-slate-700">No expenses recorded yet</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Circle common pool is 100% intact</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
