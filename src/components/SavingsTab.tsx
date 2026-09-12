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
  XCircle,
  Check,
  X,
  Send,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ContributionRecord, Circle, CircleMember, User as UserType } from '../types';
import { MemberPaySavingsModal } from './modals/MemberPaySavingsModal';

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
  onMemberSubmitPayment?: (data: {
    recordId: string;
    userId: string;
    amount: number;
    paymentMethod: 'UPI' | 'Cash' | 'Bank Transfer';
    referenceNote: string;
    date: string;
  }) => void;
  onAdminConfirmPayment?: (record: ContributionRecord) => void;
  onAdminRejectPayment?: (record: ContributionRecord, reason?: string) => void;
}

export const SavingsTab: React.FC<SavingsTabProps> = ({
  circle,
  currentUser,
  contributions,
  members = [],
  onRecordPayment,
  onOpenRecordModal,
  onMemberSubmitPayment,
  onAdminConfirmPayment,
  onAdminRejectPayment,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchMember, setSearchMember] = useState('');
  
  // Admin direct record modal
  const [quickPayRecord, setQuickPayRecord] = useState<ContributionRecord | null>(null);
  const [payMethod, setPayMethod] = useState<'UPI' | 'Cash' | 'Bank Transfer'>('UPI');
  const [refNote, setRefNote] = useState('');

  // Member pay modal
  const [memberPayRecord, setMemberPayRecord] = useState<ContributionRecord | null>(null);

  // Admin reject confirmation modal
  const [rejectModalRecord, setRejectModalRecord] = useState<ContributionRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const currency = circle.currencySymbol || '₹';
  const isAdmin = currentUser.role === 'circle_admin' || currentUser.role === 'super_admin';
  const adminMember = members.find((m) => m.role === 'circle_admin');

  // Resolve current active cycle due date from circle configuration
  const currentDueDate = React.useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = days.indexOf(circle.contributionDay || 'Sunday');
    const now = new Date();
    const currentDayIndex = now.getDay();
    let diff = (targetDayIndex - currentDayIndex + 7) % 7;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
    return targetDate.toISOString().split('T')[0];
  }, [circle.contributionDay]);

  const formattedCurrentDueDate = React.useMemo(() => {
    try {
      return new Date(currentDueDate + 'T00:00:00').toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return currentDueDate;
    }
  }, [currentDueDate]);

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

  // Synthesize scheduled weekly savings dues for all circle members so every member has an active due row
  const allContributionsWithSchedule = React.useMemo(() => {
    const list: ContributionRecord[] = [...contributions];

    for (const m of members) {
      const uId = m.userId || m.id;
      // Check if user has an existing record for the current week / cycle
      const hasRecord = list.some(
        (c) =>
          c.circleId === circle.id &&
          (c.userId === uId || c.userId === m.id) &&
          (c.dueDate === currentDueDate || c.weekLabel === formattedCurrentDueDate)
      );

      if (!hasRecord) {
        list.push({
          id: `sched-${circle.id}-${uId}-${currentDueDate}`,
          circleId: circle.id,
          userId: uId,
          userName: m.name,
          weekNumber: 1,
          weekLabel: formattedCurrentDueDate,
          dueDate: currentDueDate,
          amount: circle.contributionAmount || 500,
          paidAmount: 0,
          status: 'Pending',
        });
      }
    }
    return list;
  }, [contributions, members, circle.id, circle.contributionAmount, currentDueDate, formattedCurrentDueDate]);

  // Deduplicate records by circle + user + date so duplicate rows are never shown
  const deduplicated = React.useMemo(() => {
    const seen = new Set<string>();
    const result: ContributionRecord[] = [];
    for (const item of allContributionsWithSchedule) {
      const key = `${item.circleId}_${item.userId}_${item.dueDate || item.paidDate || item.weekLabel}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
    return result;
  }, [allContributionsWithSchedule]);

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
  const totalCollectedAll = deduplicated.reduce((sum, c) => sum + (c.paidAmount || (c.status === 'Paid' ? c.amount : 0)), 0);
  const totalPendingAll = totalExpectedAll - totalCollectedAll;
  const collectionRate = totalExpectedAll > 0 ? Math.round((totalCollectedAll / totalExpectedAll) * 100) : 0;

  // Pending Confirmations waiting for Admin verification
  const pendingConfirmations = React.useMemo(
    () => deduplicated.filter((c) => c.status === 'Pending Confirmation'),
    [deduplicated]
  );

  // Current user's active pending due
  const myPendingRecord = React.useMemo(() => {
    const myIds = [currentUser.id, (currentUser as any)?.userId].filter(Boolean);
    return deduplicated.find(
      (c) => myIds.includes(c.userId) && c.status !== 'Paid'
    );
  }, [deduplicated, currentUser]);

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

  const handleConfirmReceived = (record: ContributionRecord) => {
    if (onAdminConfirmPayment) {
      onAdminConfirmPayment(record);
    } else {
      onRecordPayment({
        recordId: record.id,
        userId: record.userId,
        date: record.dueDate || new Date().toISOString().split('T')[0],
        weekNumber: record.weekNumber || 1,
        amount: record.amount,
        paymentMethod: (record.paymentMethod as any) || 'UPI',
        referenceNote: record.referenceNote || 'Verified by Admin',
        status: 'Paid',
      });
    }
  };

  const handleRejectClaim = () => {
    if (!rejectModalRecord) return;
    if (onAdminRejectPayment) {
      onAdminRejectPayment(rejectModalRecord, rejectReason || 'Payment not received in admin account');
    }
    setRejectModalRecord(null);
    setRejectReason('');
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
      case 'Pending Confirmation':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            Awaiting Confirmation
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
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

      {/* ADMIN ONLY: Pending Payment Confirmations Verification Banner */}
      {isAdmin && pendingConfirmations.length > 0 && (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-amber-200 text-amber-900 rounded-xl">
                <Clock className="w-5 h-5 text-amber-800" />
              </span>
              <div>
                <h3 className="font-bold text-amber-950 text-sm sm:text-base flex items-center gap-2">
                  <span>Pending Payment Confirmations</span>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-xs font-bold rounded-full">
                    {pendingConfirmations.length} awaiting review
                  </span>
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Members claimed they paid their weekly savings. Verify your UPI / bank account and confirm if payment is received.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingConfirmations.map((item) => (
              <div
                key={`confirm-card-${item.id}`}
                className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-sm shrink-0">
                      {resolveMemberName(item).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{resolveMemberName(item)}</h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Due: {item.dueDate || item.weekLabel}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold font-mono text-emerald-700">
                      {currency}{item.amount}
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-md">
                      Claimed via {item.paymentMethod || 'UPI'}
                    </span>
                  </div>
                </div>

                {item.referenceNote && (
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Transaction Reference / Note
                    </span>
                    <span className="font-mono font-medium text-slate-800 break-all">
                      {item.referenceNote}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    id={`admin-confirm-get-${item.id}`}
                    onClick={() => handleConfirmReceived(item)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                  >
                    <Check className="w-4 h-4" />
                    <span>Payment Received (Get)</span>
                  </button>
                  <button
                    id={`admin-reject-btn-${item.id}`}
                    onClick={() => setRejectModalRecord(item)}
                    className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition border border-rose-200"
                  >
                    <span>Not Received</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEMBER ONLY: Payment Status Banner */}
      {!isAdmin && myPendingRecord && (
        <div className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          myPendingRecord.status === 'Pending Confirmation'
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-start sm:items-center gap-3">
            <span className={`p-2.5 rounded-xl shrink-0 ${
              myPendingRecord.status === 'Pending Confirmation'
                ? 'bg-amber-200 text-amber-900'
                : 'bg-emerald-200 text-emerald-900'
            }`}>
              <CreditCard className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-bold text-sm sm:text-base">
                {myPendingRecord.status === 'Pending Confirmation'
                  ? 'Payment Submitted • Waiting for Circle Admin Confirmation'
                  : `Weekly Savings Due: ${currency}${myPendingRecord.amount}`}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {myPendingRecord.status === 'Pending Confirmation'
                  ? `You submitted ₹${myPendingRecord.amount} via ${myPendingRecord.paymentMethod || 'UPI'} (${myPendingRecord.referenceNote || 'Details sent'}). Admin will confirm once verified.`
                  : `Due date: ${myPendingRecord.dueDate || myPendingRecord.weekLabel}. Pay online or via cash and submit details for admin approval.`}
              </p>
            </div>
          </div>

          {myPendingRecord.status === 'Pending' ? (
            <button
              onClick={() => setMemberPayRecord(myPendingRecord)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shrink-0 active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay {currency}{myPendingRecord.amount} Now</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-amber-300 rounded-xl text-xs font-bold text-amber-800 shrink-0">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              Pending Admin Verification
            </span>
          )}
        </div>
      )}

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
            <option value="Pending Confirmation">Pending Confirmation</option>
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
          { id: 'all', label: 'All Dues', count: deduplicated.length },
          { id: 'Pending Confirmation', label: 'Under Review', count: pendingConfirmations.length },
          { id: 'Pending', label: 'Pending', count: deduplicated.filter((c) => c.status === 'Pending').length },
          { id: 'Paid', label: 'Paid', count: deduplicated.filter((c) => c.status === 'Paid').length },
          { id: 'Late', label: 'Late', count: deduplicated.filter((c) => c.status === 'Late').length },
        ]
          .filter((chip) => chip.id === 'all' || chip.count > 0 || chip.id === 'Pending' || chip.id === 'Paid')
          .map((chip) => (
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
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedStatus === chip.id ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-600'
                }`}
              >
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
          filtered.map((item) => {
            const isCurrentUserRow = item.userId === currentUser.id || item.userId === (currentUser as any)?.userId;
            return (
              <div
                key={`mob-${item.id}`}
                className={`bg-white rounded-2xl border p-4 shadow-sm space-y-3 transition ${
                  item.status === 'Pending Confirmation' ? 'border-amber-300 ring-1 ring-amber-300/50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                      {resolveMemberName(item).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{resolveMemberName(item)}</h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.dueDate || item.paidDate || item.weekLabel}
                      </span>
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
                    <span
                      className={`font-bold font-mono text-sm ${
                        item.paidAmount > 0 ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {currency}{item.paidAmount || (item.status === 'Paid' ? item.amount : 0)}
                    </span>
                  </div>
                </div>

                {item.referenceNote && (
                  <div className="p-2 bg-slate-50/80 rounded-lg text-xs text-slate-600 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium block">Reference / Note</span>
                    <span className="font-mono text-slate-800">{item.referenceNote}</span>
                  </div>
                )}

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

                {/* Actions: Admin Confirmation or Member Pay */}
                {item.status === 'Pending Confirmation' ? (
                  isAdmin ? (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        id={`mob-admin-confirm-${item.id}`}
                        onClick={() => handleConfirmReceived(item)}
                        className="flex-1 min-h-[42px] py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                      >
                        <Check className="w-4 h-4" />
                        <span>Payment Received (Get)</span>
                      </button>
                      <button
                        id={`mob-admin-reject-${item.id}`}
                        onClick={() => setRejectModalRecord(item)}
                        className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs transition border border-rose-200"
                      >
                        Not Received
                      </button>
                    </div>
                  ) : (
                    <div className="w-full py-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-center text-xs font-semibold text-amber-800 flex items-center justify-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                      Payment Submitted • Awaiting Admin Confirmation
                    </div>
                  )
                ) : item.status !== 'Paid' ? (
                  isAdmin ? (
                    <button
                      id={`mob-quick-record-${item.id}`}
                      onClick={() => setQuickPayRecord(item)}
                      className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4" />
                      Record {currency}{item.amount} Payment
                    </button>
                  ) : isCurrentUserRow ? (
                    <button
                      id={`mob-member-pay-${item.id}`}
                      onClick={() => setMemberPayRecord(item)}
                      className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.98]"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay {currency}{item.amount} Weekly Savings
                    </button>
                  ) : (
                    <div className="w-full py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs font-medium text-slate-600 flex items-center justify-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
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
            );
          })
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
                filtered.map((item) => {
                  const isCurrentUserRow = item.userId === currentUser.id || item.userId === (currentUser as any)?.userId;
                  return (
                    <tr
                      key={item.id}
                      className={`transition ${
                        item.status === 'Pending Confirmation' ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50/60'
                      }`}
                    >
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
                          <div className="text-[10px] text-slate-400 mt-0.5">Paid: {item.paidDate}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                        {currency}{item.amount}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700 font-mono">
                        {currency}{item.paidAmount || (item.status === 'Paid' ? item.amount : 0)}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                      <td className="py-3 px-4">
                        {item.paymentMethod ? (
                          <div>
                            <span className="font-medium text-slate-800">{item.paymentMethod}</span>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {item.referenceNote || 'Verified'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.status === 'Pending Confirmation' ? (
                          isAdmin ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                id={`desk-admin-confirm-${item.id}`}
                                onClick={() => handleConfirmReceived(item)}
                                className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Get</span>
                              </button>
                              <button
                                id={`desk-admin-reject-${item.id}`}
                                onClick={() => setRejectModalRecord(item)}
                                className="px-2 py-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition border border-rose-200"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-800 font-semibold bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 animate-spin" />
                              Under Review
                            </span>
                          )
                        ) : item.status !== 'Paid' ? (
                          isAdmin ? (
                            <button
                              id={`quick-record-${item.id}`}
                              onClick={() => setQuickPayRecord(item)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition border border-emerald-200"
                            >
                              Record Payment
                            </button>
                          ) : isCurrentUserRow ? (
                            <button
                              id={`desk-member-pay-${item.id}`}
                              onClick={() => setMemberPayRecord(item)}
                              className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs flex items-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay {currency}{item.amount}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Pending
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {item.paidDate ? `Paid on ${item.paidDate}` : 'Completed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MEMBER: Pay Savings Contribution Modal */}
      {memberPayRecord && (
        <MemberPaySavingsModal
          isOpen={!!memberPayRecord}
          onClose={() => setMemberPayRecord(null)}
          circle={circle}
          record={memberPayRecord}
          currentUser={currentUser}
          adminMember={adminMember}
          onSubmitPayment={(data) => {
            if (onMemberSubmitPayment) {
              onMemberSubmitPayment(data);
            } else {
              onRecordPayment({
                recordId: data.recordId,
                userId: data.userId,
                date: data.date,
                weekNumber: 1,
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                referenceNote: data.referenceNote,
                status: 'Paid',
              });
            }
          }}
        />
      )}

      {/* ADMIN: Decline / Not Received Prompt Modal */}
      {rejectModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-slate-900 text-base">Decline Payment Claim?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Mark payment of <strong className="text-slate-900 font-mono">{currency}{rejectModalRecord.amount}</strong> from <strong className="text-slate-900">{resolveMemberName(rejectModalRecord)}</strong> as <strong className="text-rose-700">Not Received</strong>? The record will remain <strong>Pending</strong> and the circle fund will NOT be updated.
            </p>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-xs">
                Reason for Member (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. UTR not found in bank statement"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalRecord(null)}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectClaim}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Mark as Not Received
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN ONLY: Quick Direct Record Bottom-Sheet Modal */}
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
