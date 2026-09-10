import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  CreditCard,
  Plus,
  ArrowRight,
  User,
  Sparkles,
  Download,
} from 'lucide-react';
import { ContributionRecord, Circle, CircleMember, User as UserType } from '../types';

interface SavingsTabProps {
  circle: Circle;
  currentUser: UserType;
  contributions: ContributionRecord[];
  members?: CircleMember[];
  onRecordPayment: (data: {
    recordId?: string;
    userId: string;
    date?: string;
    weekNumber?: number;
    amount: number;
    paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
    referenceNote: string;
    status: 'Paid' | 'Partially Paid' | 'Waived';
  }) => void;
  onOpenRecordModal: () => void;
}

export const SavingsTab: React.FC<SavingsTabProps> = ({
  circle,
  currentUser,
  contributions,
  members = [],
  onRecordPayment,
  onOpenRecordModal,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchMember, setSearchMember] = useState('');
  const [quickPayRecord, setQuickPayRecord] = useState<ContributionRecord | null>(null);
  const [payMethod, setPayMethod] = useState<'UPI' | 'Cash' | 'Bank Transfer'>('UPI');
  const [refNote, setRefNote] = useState('');

  const currency = circle.currencySymbol || '₹';
  const isAdmin = currentUser.role === 'circle_admin' || currentUser.role === 'super_admin';

  // Resolve member name reliably from members roster
  const resolveMemberName = (item: ContributionRecord) => {
    const found = members.find((m) => m.userId === item.userId || m.id === item.userId);
    if (found?.name && found.name !== 'Squad Member' && found.name !== 'Member') {
      return found.name;
    }
    if (item.userName && item.userName !== 'Squad Member' && item.userName !== 'Member') {
      return item.userName;
    }
    if (item.userId === currentUser.id && currentUser.name) return currentUser.name;
    try {
      const savedMembers = JSON.parse(localStorage.getItem('buddyfund_members') || '[]');
      const localFound = savedMembers.find((m: any) => m.userId === item.userId || m.id === item.userId);
      if (localFound?.name && localFound.name !== 'Squad Member' && localFound.name !== 'Member') {
        return localFound.name;
      }
    } catch {}
    return found?.name || item.userName || 'Member';
  };

  // Deduplicate records by circle + user + date so duplicate rows are never shown
  const deduplicated = React.useMemo(() => {
    const seen = new Set<string>();
    const result: ContributionRecord[] = [];
    for (const item of contributions) {
      const key = `${item.circleId}_${item.userId}_${item.dueDate || item.paidDate || item.weekLabel}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
    return result;
  }, [contributions]);

  // Distinct dates
  const availableDates = Array.from(
    new Set(deduplicated.map((c) => c.dueDate || c.paidDate || c.weekLabel).filter(Boolean))
  ).sort().reverse();

  // Filtered contributions
  const filtered = deduplicated.filter((item) => {
    const itemDate = item.dueDate || item.paidDate || item.weekLabel;
    if (selectedDate !== 'all' && itemDate !== selectedDate) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (
      searchMember &&
      !resolveMemberName(item).toLowerCase().includes(searchMember.toLowerCase())
    )
      return false;
    return true;
  });

  // Calculate totals
  const totalExpectedAll = deduplicated.reduce((sum, c) => sum + c.amount, 0);
  const totalCollectedAll = deduplicated.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalPendingAll = totalExpectedAll - totalCollectedAll;
  const collectionRate = totalExpectedAll > 0 ? Math.round((totalCollectedAll / totalExpectedAll) * 100) : 0;

  const handleQuickPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPayRecord) return;

    onRecordPayment({
      recordId: quickPayRecord.id,
      userId: quickPayRecord.userId,
      date: quickPayRecord.dueDate || new Date().toISOString().split('T')[0],
      weekNumber: quickPayRecord.weekNumber || 1,
      amount: quickPayRecord.amount,
      paymentMethod: payMethod,
      referenceNote: refNote || `Paid via ${payMethod} on ${new Date().toLocaleDateString()}`,
      status: 'Paid',
    });

    setQuickPayRecord(null);
    setRefNote('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Paid
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Late
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Partially Paid
          </span>
        );
      case 'Waived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Waived
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            Savings &amp; Contribution Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Every member contributes {currency}{circle.contributionAmount} {circle.contributionFrequency}. Transparent payment records.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              id="savings-record-modal-btn"
              onClick={onOpenRecordModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              Record Payment
            </button>
          </div>
        )}
      </div>

      {/* Progress metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Collected</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {currency}{totalCollectedAll.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{collectionRate}% of total schedule</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Pending Dues</span>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {currency}{totalPendingAll.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting member contributions</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Contribution Target</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {currency}{circle.contributionAmount}/member
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Due every {circle.contributionDay}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Overall Collection Rate</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {collectionRate}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${collectionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="savings-search-input"
            type="text"
            placeholder="Search member name..."
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Date Filter */}
          <select
            id="savings-date-filter"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:ring-emerald-500"
          >
            <option value="all">All Dates</option>
            {availableDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            id="savings-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Late">Late</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Waived">Waived</option>
          </select>
        </div>
      </div>

      {/* Mobile-First Status Filter Chips (Swipeable) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mt-2 sm:hidden scrollbar-none">
        {[
          { id: 'all', label: 'All Dues', count: contributions.length },
          { id: 'Pending', label: 'Pending', count: contributions.filter((c) => c.status === 'Pending').length },
          { id: 'Paid', label: 'Paid', count: contributions.filter((c) => c.status === 'Paid').length },
          { id: 'Late', label: 'Late', count: contributions.filter((c) => c.status === 'Late').length },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setSelectedStatus(chip.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              selectedStatus === chip.id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <span>{chip.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedStatus === chip.id ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-600'
            }`}>
              {chip.count}
            </span>
          </button>
        ))}
      </div>

      {/* Mobile Card View (Optimized for 100% Mobile Use) */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No savings records match your filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={`mob-${item.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                    {resolveMemberName(item).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{resolveMemberName(item)}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">{item.dueDate || item.paidDate || item.weekLabel}</span>
                  </div>
                </div>
                <div>{getStatusBadge(item.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Expected
                  </span>
                  <span className="font-bold text-slate-800 font-mono text-sm">
                    {currency}{item.amount}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Paid So Far
                  </span>
                  <span className={`font-bold font-mono text-sm ${item.paidAmount > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {currency}{item.paidAmount}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due: {item.dueDate}</span>
                </div>
                {item.paymentMethod && (
                  <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Via {item.paymentMethod}
                  </span>
                )}
              </div>

              {item.status !== 'Paid' ? (
                isAdmin ? (
                  <button
                    id={`mob-quick-record-${item.id}`}
                    onClick={() => setQuickPayRecord(item)}
                    className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    Record {currency}{item.amount} Payment
                  </button>
                ) : (
                  <div className="w-full py-2 bg-amber-50/70 border border-amber-200/80 rounded-xl text-center text-xs font-semibold text-amber-800 flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Pending Contribution
                  </div>
                )
              ) : (
                <div className="w-full py-2 bg-emerald-50/70 border border-emerald-100 rounded-xl text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {item.paidDate ? `Paid on ${item.paidDate}` : 'Contribution Completed'}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Contributions Table */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Contribution Date</th>
                <th className="py-3 px-4">Expected</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Method &amp; Ref</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No contribution records match current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{resolveMemberName(item)}</div>
                      <div className="text-[10px] text-slate-400">ID: {item.userId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.dueDate || item.paidDate || item.weekLabel}</span>
                      </div>
                      {item.paidDate && item.paidDate !== item.dueDate && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Paid: {item.paidDate}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      {currency}{item.amount}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700 font-mono">
                      {currency}{item.paidAmount}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4">
                      {item.paymentMethod ? (
                        <div>
                          <span className="font-medium text-slate-800">{item.paymentMethod}</span>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {item.referenceNote || 'Verified'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.status !== 'Paid' ? (
                        isAdmin ? (
                          <button
                            id={`quick-record-${item.id}`}
                            onClick={() => setQuickPayRecord(item)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition border border-emerald-200"
                          >
                            Record Payment
                          </button>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Pending
                          </span>
                        )
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.paidDate ? `Paid on ${item.paidDate}` : 'Completed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Record Bottom-Sheet Modal */}
      {quickPayRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden mb-1" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Savings Contribution</h3>
                <p className="text-xs text-slate-500">
                  {resolveMemberName(quickPayRecord)} • {quickPayRecord.dueDate || quickPayRecord.paidDate || quickPayRecord.weekLabel}
                </p>
              </div>
              <button
                onClick={() => setQuickPayRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickPaySubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  defaultValue={quickPayRecord.amount}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 bg-slate-50"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Cash', 'Bank Transfer'] as const).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPayMethod(method)}
                      className={`py-2 px-3 rounded-lg border text-center font-medium transition ${
                        payMethod === method
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Reference / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. GPay UPI Ref 928174 or Cash collected by Admin"
                  value={refNote}
                  onChange={(e) => setRefNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-800">
                <span className="font-semibold block mb-0.5">Double-Entry Ledger Synchronization:</span>
                This will automatically generate a verified Transaction entry and increase the Circle Common Fund by {currency}{quickPayRecord.amount}.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickPayRecord(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-quick-payment"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  Confirm &amp; Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
