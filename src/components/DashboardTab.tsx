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
  ArrowDownRight,
  Sparkles,
  PlusCircle,
  HelpCircle,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
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
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            id="dash-record-payment-btn"
            onClick={onOpenRecordPaymentModal}
            className="min-h-[44px] px-3 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 text-center"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Pay</span>
          </button>
          <button
            id="dash-add-expense-btn"
            onClick={onOpenAddExpenseModal}
            className="min-h-[44px] px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 backdrop-blur active:scale-95 text-center"
          >
            <Receipt className="w-4 h-4 shrink-0" />
            <span>Expense</span>
          </button>
          <button
            id="dash-request-loan-btn"
            onClick={onOpenRequestLoanModal}
            className="min-h-[44px] px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 backdrop-blur active:scale-95 text-center"
          >
            <Coins className="w-4 h-4 shrink-0" />
            <span>Loan</span>
          </button>
        </div>
      </div>

      {/* Instant 9 Questions Transparency Ribbon */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-emerald-700" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 font-mono">
            Circle At A Glance • Transparency Checks
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
            <span className="text-slate-500 block text-[11px]">1. Common Fund Available</span>
            <span className="font-bold text-slate-900 text-sm">
              {currency}{wallet.currentBalance.toLocaleString()}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
            <span className="text-slate-500 block text-[11px]">2. Paid This Week</span>
            <span className="font-bold text-emerald-700 text-sm">
              {currentWeekStats.paidCount} members ({currency}{currentWeekStats.paidCount * circle.contributionAmount})
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
            <span className="text-slate-500 block text-[11px]">3. Pending This Week</span>
            <span className="font-bold text-amber-700 text-sm">
              {currentWeekStats.pendingCount} pending ({currency}{currentWeekStats.pendingCount * circle.contributionAmount})
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
            <span className="text-slate-500 block text-[11px]">4. Next Upcoming Tour</span>
            <span className="font-bold text-slate-900 text-sm truncate block">
              {upcomingTour ? `${upcomingTour.title}` : 'No active tour'}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
            <span className="text-slate-500 block text-[11px]">5. Tour Fund Remaining</span>
            <span className="font-bold text-blue-700 text-sm">
              {upcomingTour
                ? `${currency}${(upcomingTour.estimatedBudget - (upcomingTour.allocatedFromCircle || 0)).toLocaleString()} needed`
                : 'N/A'}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
            <span className="text-slate-500 block text-[11px]">6. Total Expenses</span>
            <span className="font-bold text-rose-700 text-sm">
              {currency}{wallet.totalExpenses.toLocaleString()}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
            <span className="text-slate-500 block text-[11px]">7. Active Loans Given</span>
            <span className="font-bold text-indigo-700 text-sm">
              {wallet.activeLoanCount} loan ({currency}{wallet.activeLoanOutstanding.toLocaleString()})
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
            <span className="text-slate-500 block text-[11px]">8. Interest Earned</span>
            <span className="font-bold text-teal-700 text-sm">
              +{currency}{wallet.interestEarned.toLocaleString()}
            </span>
          </div>
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
              {currency}{upcomingTour ? upcomingTour.estimatedBudget.toLocaleString() : '60,000'}
            </div>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">
              {currency}{upcomingTour ? upcomingTour.allocatedFromCircle.toLocaleString() : '42,000'} funded (70%)
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

      {/* Visual Analytics Charts: Weekly Collection & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Weekly Collection Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Weekly Savings Progress</h3>
              <p className="text-xs text-slate-500">Target vs Actual Collections per week</p>
            </div>
            <button
              onClick={() => onNavigateTab('savings')}
              className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1"
            >
              Full Schedule <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(val: number) => [`${currency}${val}`, '']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="collected" name="Collected Amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Weekly Expected" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Expense Categories Donut */}
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
        </div>
      </div>

      {/* Featured Sections: Upcoming Tour & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tour Feature Box */}
        {upcomingTour && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
            <div className="relative h-32 w-full">
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

        {/* Live Transaction Ledger Stream */}
        <div className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm ${upcomingTour ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Recent Ledger Operations</h3>
              <p className="text-xs text-slate-500">Immutable double-entry transaction trail</p>
            </div>
            <button
              onClick={() => onNavigateTab('ledger')}
              className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1"
            >
              Full Ledger <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {recentTransactions.slice(0, 6).map((tx) => {
              const isCredit =
                tx.type === 'CONTRIBUTION' ||
                tx.type === 'INTEREST_PAYMENT' ||
                tx.type === 'LOAN_PRINCIPAL_REPAYMENT' ||
                tx.type === 'OTHER_INCOME';

              return (
                <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isCredit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 truncate">
                        {tx.notes}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {tx.type.replace(/_/g, ' ')} • {new Date(tx.date).toLocaleDateString()} • Ref: {tx.reference}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`font-bold font-mono text-xs ${
                        isCredit ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-sans">
                      {tx.createdBy}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
