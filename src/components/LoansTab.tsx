import React, { useState } from 'react';
import {
  Coins,
  Percent,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  Users,
  Lock,
  Check,
  X,
} from 'lucide-react';
import { Loan, Circle, User as UserType, CircleMember, LoanApprovalVote } from '../types';
import { EditLoanModal } from './modals/EditLoanModal';

interface LoansTabProps {
  circle: Circle;
  currentUser: UserType;
  loans: Loan[];
  members?: CircleMember[];
  interestEarnedTotal: number;
  availableBalance?: number;
  onRequestLoan: (data: {
    principal: number;
    interestRate: number;
    durationMonths: number;
    purpose: string;
  }) => void;
  onReviewLoan: (loanId: string, action: 'approve' | 'reject') => void;
  onVoteLoan?: (loanId: string, decision: 'approve' | 'reject') => void;
  onDisburseLoan?: (loanId: string) => void;
  onUpdateLoan?: (updatedLoan: Loan) => void;
  onRepayLoan: (data: {
    loanId: string;
    amount: number;
    principalAmount: number;
    interestAmount: number;
    paymentMethod: string;
    isFullSettlement?: boolean;
  }) => void;
  onOpenRequestModal: () => void;
}

export const LoansTab: React.FC<LoansTabProps> = ({
  circle,
  currentUser,
  loans,
  members,
  interestEarnedTotal,
  availableBalance = 0,
  onRequestLoan,
  onReviewLoan,
  onVoteLoan,
  onDisburseLoan,
  onUpdateLoan,
  onRepayLoan,
  onOpenRequestModal,
}) => {
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [viewingApprovalLoan, setViewingApprovalLoan] = useState<Loan | null>(null);
  const [selectedRepayLoan, setSelectedRepayLoan] = useState<Loan | null>(null);
  const [repayMode, setRepayMode] = useState<'installment' | 'full_settlement'>('installment');
  const [installmentPeriods, setInstallmentPeriods] = useState<number>(1);
  const [customInstallmentAmount, setCustomInstallmentAmount] = useState<number>(50);
  const [isCustomInstallment, setIsCustomInstallment] = useState<boolean>(false);
  const [settlementPeriods, setSettlementPeriods] = useState<number>(1);
  const [customSettlementInterest, setCustomSettlementInterest] = useState<number>(50);
  const [isCustomSettlement, setIsCustomSettlement] = useState<boolean>(false);
  const [repayMethod, setRepayMethod] = useState('UPI');

  const currency = circle.currencySymbol || '₹';
  const isAdmin = currentUser.role === 'circle_admin' || currentUser.role === 'super_admin';

  // Consensus Computation for Loan Requests
  // Rule: 1 Circle Admin Approval + Minimum 50% Members (e.g. 9 members -> 4 required; 8 -> 4; 2 -> 1; 1 -> 1)
  const getLoanConsensus = (loan: Loan) => {
    const squadMembers = (members || []).filter((m) => m.role !== 'circle_admin');
    const totalSquadMembersCount = squadMembers.length;
    const requiredMemberApprovals =
      totalSquadMembersCount <= 1 ? Math.min(1, totalSquadMembersCount) : Math.floor(totalSquadMembersCount * 0.5);

    const approvals = loan.approvals || [];
    const hasAdminApproved = approvals.some(
      (a) => (a.userRole === 'circle_admin' || a.userRole === 'super_admin') && a.decision === 'approve'
    );
    const adminApprover = approvals.find(
      (a) => (a.userRole === 'circle_admin' || a.userRole === 'super_admin') && a.decision === 'approve'
    );

    const memberApprovals = approvals.filter(
      (a) => a.userRole !== 'circle_admin' && a.userRole !== 'super_admin' && a.decision === 'approve'
    );
    const memberRejections = approvals.filter(
      (a) => a.userRole !== 'circle_admin' && a.userRole !== 'super_admin' && a.decision === 'reject'
    );

    const memberApprovalsCount = memberApprovals.length;
    const isCriteriaMet = hasAdminApproved && memberApprovalsCount >= requiredMemberApprovals;
    const userVote = approvals.find((a) => a.userId === currentUser.id || (currentUser as any)?.userId === a.userId);

    return {
      squadMembers,
      totalSquadMembersCount,
      requiredMemberApprovals,
      hasAdminApproved,
      adminApprover,
      memberApprovals,
      memberRejections,
      memberApprovalsCount,
      isCriteriaMet,
      userVote,
      allApprovals: approvals,
    };
  };

  // My Loans
  const myLoans = loans.filter((l) => l.borrowerId === currentUser.id);
  const myActiveLoan = myLoans.find((l) => l.status === 'Active');

  const openRepayModal = (loan: Loan) => {
    setSelectedRepayLoan(loan);
    setRepayMode('installment');
    setInstallmentPeriods(1);
    setIsCustomInstallment(false);
    setSettlementPeriods(1);
    setIsCustomSettlement(false);
    const rate = loan.interestRate || 5;

    if (loan.repaymentMethod === 'weekly_emi') {
      const emi = loan.weeklyEmiAmount || Math.round(loan.totalRepayment / (loan.tenureWeeks || 4));
      setCustomInstallmentAmount(emi);
      setCustomSettlementInterest(0);
    } else {
      const pInterest = Math.round((loan.principal * rate) / 100);
      setCustomInstallmentAmount(pInterest);
      setCustomSettlementInterest(pInterest);
    }
  };

  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepayLoan) return;

    const rate = selectedRepayLoan.interestRate || 5;
    const isWeekly = selectedRepayLoan.repaymentMethod === 'weekly_emi';

    if (isWeekly) {
      const emi = selectedRepayLoan.weeklyEmiAmount || Math.round(selectedRepayLoan.totalRepayment / (selectedRepayLoan.tenureWeeks || 4));
      const totalWeeks = selectedRepayLoan.tenureWeeks || 4;
      const weeklyPrincipal = Math.round(selectedRepayLoan.principal / totalWeeks);

      if (repayMode === 'installment') {
        const weeksToPay = installmentPeriods;
        const totalPay = isCustomInstallment ? Number(customInstallmentAmount) : emi * weeksToPay;
        const principalPart = isCustomInstallment
          ? Math.round(totalPay * (selectedRepayLoan.principal / selectedRepayLoan.totalRepayment))
          : Math.min(weeklyPrincipal * weeksToPay, totalPay);
        const interestPart = Math.max(0, totalPay - principalPart);
        const isClosed = totalPay >= selectedRepayLoan.remainingAmount;

        onRepayLoan({
          loanId: selectedRepayLoan.id,
          amount: totalPay,
          principalAmount: principalPart,
          interestAmount: interestPart,
          paymentMethod: repayMethod,
          isFullSettlement: isClosed,
        });
      } else {
        // Full payoff of remaining balance
        const totalPay = selectedRepayLoan.remainingAmount;
        const pRemaining = Math.max(0, selectedRepayLoan.principal - selectedRepayLoan.principalPaid);
        const iRemaining = Math.max(0, totalPay - pRemaining);

        onRepayLoan({
          loanId: selectedRepayLoan.id,
          amount: totalPay,
          principalAmount: pRemaining,
          interestAmount: iRemaining,
          paymentMethod: repayMethod,
          isFullSettlement: true,
        });
      }
    } else {
      // 10-day cycle
      const principal = selectedRepayLoan.remainingAmount || selectedRepayLoan.principal;
      const periodicInterest = Math.round((selectedRepayLoan.principal * rate) / 100);

      if (repayMode === 'installment') {
        const interestPay = isCustomInstallment
          ? Number(customInstallmentAmount)
          : periodicInterest * installmentPeriods;

        onRepayLoan({
          loanId: selectedRepayLoan.id,
          amount: interestPay,
          principalAmount: 0,
          interestAmount: interestPay,
          paymentMethod: repayMethod,
          isFullSettlement: false,
        });
      } else {
        const interestPay = isCustomSettlement
          ? Number(customSettlementInterest)
          : periodicInterest * settlementPeriods;
        const totalPay = principal + interestPay;

        onRepayLoan({
          loanId: selectedRepayLoan.id,
          amount: totalPay,
          principalAmount: principal,
          interestAmount: interestPay,
          paymentMethod: repayMethod,
          isFullSettlement: true,
        });
      }
    }

    setSelectedRepayLoan(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            Internal Mutual Loan &amp; Interest Pool
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Private peer-assistance facility from circle common fund with transparent interest distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-400 block font-medium">Available Pool Fund</span>
            <span className={`text-sm font-bold font-mono ${availableBalance > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {currency}{availableBalance.toLocaleString()}
            </span>
          </div>
          <button
            id="loans-request-btn"
            onClick={onOpenRequestModal}
            className={`px-4 py-2 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm ${
              availableBalance > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                : 'bg-slate-700 hover:bg-slate-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Request Internal Loan</span>
            {availableBalance <= 0 && (
              <span className="text-[10px] bg-rose-500/30 text-rose-200 border border-rose-400/30 px-1.5 py-0.5 rounded font-medium ml-1">
                {currency}0 Available
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Compliance Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Private Accounting &amp; Compliance Notice:</span>
          <p className="text-amber-800 leading-relaxed">
            This module is an internal mutual assistance ledger among verified private friends. It is not an open public credit marketplace or commercial lending business. All interest collected remains in the common circle pool to offset shared trip and event expenses.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Active Borrowings</span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {currency}
            {loans
              .filter((l) => l.status === 'Active')
              .reduce((sum, l) => sum + l.remainingAmount, 0)
              .toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {loans.filter((l) => l.status === 'Active').length} active internal loan
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Interest Earned</span>
          <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">
            +{currency}{interestEarnedTotal.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-700 mt-0.5">Added to group common wealth</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Configured Rate</span>
          <div className="text-xl font-bold text-slate-900 mt-1">2% / month</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Fixed by circle consensus</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Repayment Discipline</span>
          <div className="text-xl font-bold text-teal-700 mt-1">100% On-Time</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Zero defaulted loans</p>
        </div>
      </div>

      {/* Pending Consensus Voting Alert Banner */}
      {loans.some((l) => l.status === 'Pending') && (
        <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 shadow">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base font-['Space_Grotesk'] flex items-center gap-2">
                <span>{loans.filter((l) => l.status === 'Pending').length} Loan Request Pending Squad Consensus</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold uppercase">
                  50% Rule Active
                </span>
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Every squad member &amp; Circle Admin must vote. 1 Circle Admin + minimum 50% member approvals required to provide loan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('loans-directory-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shrink-0 self-start sm:self-auto flex items-center gap-1.5"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cast Your Vote</span>
          </button>
        </div>
      )}

      {/* "My Loan" Card (Section 11) */}
      {myActiveLoan && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/30 text-indigo-300">
                <Coins className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-lg font-['Space_Grotesk']">My Active Internal Loan</h3>
                <p className="text-xs text-indigo-300">{myActiveLoan.purpose}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Repayment
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Principal Amount</span>
              <span className="text-lg font-bold font-mono">
                {currency}{myActiveLoan.principal.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Total Interest</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {currency}{myActiveLoan.totalInterest.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Total Paid</span>
              <span className="text-lg font-bold font-mono text-blue-400">
                {currency}{myActiveLoan.totalPaid.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Remaining Due</span>
              <span className="text-lg font-bold font-mono text-amber-400">
                {currency}{myActiveLoan.remainingAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/10">
            <div className="text-xs text-slate-300">
              {myActiveLoan.repaymentMethod === 'weekly_emi' ? (
                <>
                  <span className="text-indigo-300 font-semibold bg-indigo-900/50 px-2 py-0.5 rounded-md mr-2">Weekly EMI</span>
                  Weekly Due: <strong className="text-white font-mono">{currency}{myActiveLoan.weeklyEmiAmount || Math.round(myActiveLoan.totalRepayment / (myActiveLoan.tenureWeeks || 4))}</strong> • Due: <strong className="text-white">{myActiveLoan.dueDate}</strong>
                </>
              ) : (
                <>
                  <span className="text-emerald-300 font-semibold bg-emerald-900/50 px-2 py-0.5 rounded-md mr-2">10-Day Cycle</span>
                  Periodic Interest: <strong className="text-white font-mono">{currency}{Math.round((myActiveLoan.principal * (myActiveLoan.interestRate || 5)) / 100)}</strong> / 10 days • Due: <strong className="text-white">{myActiveLoan.dueDate}</strong>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => setEditingLoan(myActiveLoan)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                  title="Edit Loan Terms"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-300" />
                  <span>Edit Terms</span>
                </button>
              )}
              <button
                onClick={() => openRepayModal(myActiveLoan)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl transition shadow-md"
              >
                Make Repayment / Settle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Loans Directory / Admin Review */}
      <div id="loans-directory-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-base font-['Space_Grotesk']">
          All Circle Loan Requests &amp; Records
        </h3>

        <div className="divide-y divide-slate-100">
          {loans.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span className="font-semibold text-slate-700 block text-sm">No Internal Loan Requests</span>
              <span className="text-slate-400 text-xs mt-1 block">Members can request mutual loans from the common fund here.</span>
            </div>
          ) : (
            loans.map((loan) => {
              const consensus = getLoanConsensus(loan);
              const isPending = loan.status === 'Pending';
              const isBorrower = currentUser.id === loan.borrowerId;

              return (
                <div key={loan.id} className="py-4 space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={loan.borrowerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={loan.borrowerName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{loan.borrowerName}</h4>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              loan.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : loan.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : loan.status === 'Repaid'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {loan.status}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {loan.repaymentMethod === 'weekly_emi' ? 'Weekly EMI' : '10-Day Cycle'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">{loan.purpose}</p>
                        <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-3">
                          <span>Principal: {currency}{loan.principal.toLocaleString()}</span>
                          <span>Interest: {loan.interestRate}% ({currency}{loan.totalInterest})</span>
                          <span>
                            {loan.repaymentMethod === 'weekly_emi'
                              ? `Tenure: ${loan.tenureWeeks || 4} Weeks (EMI: ${currency}${loan.weeklyEmiAmount || Math.round(loan.totalRepayment / (loan.tenureWeeks || 4))}/wk)`
                              : `Tenure: ${loan.cycleDays || 10} Days (${currency}${Math.round((loan.principal * (loan.interestRate || 5)) / 100)} / 10d)`}
                          </span>
                          <span>Due: {loan.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    {!isPending ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <div className="text-sm font-bold font-mono text-slate-900">
                            Remaining: {currency}{loan.remainingAmount.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            Paid: {currency}{loan.totalPaid.toLocaleString()} / {currency}{loan.totalRepayment.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                          {isAdmin && (
                            <button
                              onClick={() => setEditingLoan(loan)}
                              className="min-h-[40px] px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                              title="Edit Loan Terms"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                              <span>Edit</span>
                            </button>
                          )}

                          {loan.status === 'Active' && (
                            <button
                              onClick={() => openRepayModal(loan)}
                              className="w-full sm:w-auto min-h-[40px] px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition text-center"
                            >
                              Record Repayment
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-bold font-mono text-amber-800">
                          Requested: {currency}{loan.principal.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          Requires 1 Admin + {consensus.requiredMemberApprovals} Members
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Consensus Voting & Decision Bar for Pending Loan */}
                  {isPending && (
                    <div className="w-full p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
                      {/* Consensus Metrics Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center flex-wrap gap-2">
                          {/* Admin Approval Status */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              consensus.hasAdminApproved
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100/80 text-amber-900 border-amber-300'
                            }`}
                          >
                            {consensus.hasAdminApproved ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                1 Admin Approved ({consensus.adminApprover?.userName || 'Admin'})
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                1 Circle Admin Approval Required
                              </>
                            )}
                          </span>

                          {/* Member Consensus Status */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              consensus.memberApprovalsCount >= consensus.requiredMemberApprovals
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100/80 text-amber-900 border-amber-300'
                            }`}
                          >
                            <Users className="w-3.5 h-3.5 text-amber-700" />
                            {consensus.memberApprovalsCount} / {consensus.requiredMemberApprovals} Members Approved (50% Required)
                          </span>
                        </div>

                        {/* View Voter Audit */}
                        <button
                          type="button"
                          onClick={() => setViewingApprovalLoan(loan)}
                          className="text-emerald-700 hover:text-emerald-800 font-semibold text-xs flex items-center gap-1 underline self-start sm:self-auto"
                        >
                          <Users className="w-3 h-3" />
                          View Voter Audit ({consensus.allApprovals.length})
                        </button>
                      </div>

                      {/* Progress Bar */}
                      {(() => {
                        const pct = consensus.requiredMemberApprovals > 0
                          ? Math.min(100, Math.round((consensus.memberApprovalsCount / consensus.requiredMemberApprovals) * 100))
                          : 100;
                        return (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                              <span>Member Consensus Progress</span>
                              <span>{pct}% of required threshold</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  consensus.isCriteriaMet ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}

                      {/* Action Controls & Disbursement */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-200/60">
                        {/* Member & Admin Voting Buttons */}
                        <div>
                          {isBorrower ? (
                            <span className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Your loan request is pending approval from squad members &amp; Circle Admin.
                            </span>
                          ) : (
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="text-xs font-bold text-slate-700">Cast Vote:</span>
                              <button
                                type="button"
                                onClick={() => onVoteLoan ? onVoteLoan(loan.id, 'approve') : onReviewLoan(loan.id, 'approve')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                                  consensus.userVote?.decision === 'approve'
                                    ? 'bg-emerald-600 text-white shadow'
                                    : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                {consensus.userVote?.decision === 'approve' ? 'You Accepted ✓' : 'Accept Request'}
                              </button>

                              <button
                                type="button"
                                onClick={() => onVoteLoan ? onVoteLoan(loan.id, 'reject') : onReviewLoan(loan.id, 'reject')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                                  consensus.userVote?.decision === 'reject'
                                    ? 'bg-rose-600 text-white shadow'
                                    : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                                }`}
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                                {consensus.userVote?.decision === 'reject' ? 'You Declined ✗' : 'Decline'}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Disbursement Control */}
                        <div className="flex items-center gap-2">
                          {consensus.isCriteriaMet ? (
                            isAdmin ? (
                              <button
                                type="button"
                                onClick={() => onDisburseLoan ? onDisburseLoan(loan.id) : onReviewLoan(loan.id, 'approve')}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 animate-pulse"
                              >
                                <Check className="w-4 h-4" />
                                Provide Loan ({currency}{loan.principal.toLocaleString()})
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Consensus Reached • Ready for Admin Disbursement
                              </span>
                            )
                          ) : (
                            <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium border border-slate-200 flex items-center gap-1">
                                <Lock className="w-3 h-3 text-slate-400" />
                                Disbursement Locked (Requires 1 Admin + {consensus.requiredMemberApprovals} Members)
                              </span>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => onReviewLoan(loan.id, 'reject')}
                                  className="px-2 py-1 text-rose-600 hover:text-rose-700 text-xs font-medium hover:underline"
                                >
                                  Decline Entirely
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Repay Modal */}
      {selectedRepayLoan && (() => {
        const isWeekly = selectedRepayLoan.repaymentMethod === 'weekly_emi';
        const rate = selectedRepayLoan.interestRate || 5;
        const principal = selectedRepayLoan.remainingAmount || selectedRepayLoan.principal;

        // Weekly EMI metrics
        const totalWeeks = selectedRepayLoan.tenureWeeks || 4;
        const weeklyEmi = selectedRepayLoan.weeklyEmiAmount || Math.round(selectedRepayLoan.totalRepayment / totalWeeks);
        const weeklyPrincipal = Math.round(selectedRepayLoan.principal / totalWeeks);
        const weeklyInterest = Math.max(0, weeklyEmi - weeklyPrincipal);

        // 10-day cycle metrics
        const periodicInterest = Math.round((selectedRepayLoan.principal * rate) / 100);

        // Computed dues
        const installmentDue = isWeekly
          ? (isCustomInstallment ? Number(customInstallmentAmount) : Math.min(principal, weeklyEmi * installmentPeriods))
          : (isCustomInstallment ? Number(customInstallmentAmount) : periodicInterest * installmentPeriods);

        const settlementInterestDue = isWeekly ? 0 : (isCustomSettlement ? Number(customSettlementInterest) : periodicInterest * settlementPeriods);
        const settlementTotalDue = isWeekly ? principal : (principal + settlementInterestDue);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg">Record Loan Repayment</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {isWeekly ? 'Weekly EMI' : '10-Day Cycle'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Borrower: <strong className="text-slate-800">{selectedRepayLoan.borrowerName}</strong> • Principal: <strong className="text-slate-800">{currency}{selectedRepayLoan.principal.toLocaleString()}</strong> • Balance: <strong className="text-amber-700">{currency}{principal.toLocaleString()}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRepayLoan(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Mode Selection Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setRepayMode('installment')}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition text-left sm:text-center ${
                    repayMode === 'installment'
                      ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-500/20'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="block font-bold">{isWeekly ? '1. Weekly EMI' : '1. Installment'}</span>
                  <span className="text-[11px] font-normal opacity-80 block">
                    {isWeekly ? `${currency}${weeklyEmi} / week` : 'Periodic Interest Only'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRepayMode('full_settlement')}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition text-left sm:text-center ${
                    repayMode === 'full_settlement'
                      ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-500/20'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="block font-bold">2. Full Settlement</span>
                  <span className="text-[11px] font-normal opacity-80 block">
                    {isWeekly ? `Clear Balance (${currency}${principal})` : 'Close with Interest'}
                  </span>
                </button>
              </div>

              <form onSubmit={handleRepaySubmit} className="space-y-4 text-xs sm:text-sm">
                {/* OPTION 1: Installment Mode */}
                {repayMode === 'installment' && (
                  <div className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 text-xs sm:text-sm">
                        {isWeekly ? 'Weekly EMI Payment' : 'Periodic Interest Payment'}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {isWeekly ? `${currency}${weeklyEmi} per week` : `${currency}${periodicInterest} per 10 days (${rate}%)`}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-slate-700 font-medium text-xs">
                          {isWeekly ? 'Number of Weeks to Repay' : 'Select Number of 10-Day Periods'}
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCustomInstallment(!isCustomInstallment)}
                          className="text-[11px] text-emerald-700 hover:underline font-semibold"
                        >
                          {isCustomInstallment ? 'Use Step Buttons' : 'Enter Custom ₹'}
                        </button>
                      </div>

                      {isCustomInstallment ? (
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            max={principal}
                            value={customInstallmentAmount}
                            onChange={(e) => setCustomInstallmentAmount(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                            placeholder="Enter amount"
                            required
                          />
                          <span className="absolute right-3 top-2 text-xs text-slate-400">₹ Amount</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4].map((p) => {
                            const stepAmt = isWeekly ? weeklyEmi * p : periodicInterest * p;
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setInstallmentPeriods(p)}
                                className={`py-2 px-1 text-center rounded-xl border font-mono transition ${
                                  installmentPeriods === p
                                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                                }`}
                              >
                                <div className="text-[10px] uppercase font-sans opacity-80">
                                  {p} {isWeekly ? (p === 1 ? 'Week' : 'Weeks') : (p === 1 ? 'Period' : 'Periods')}
                                </div>
                                <div className="text-xs sm:text-sm font-bold">{currency}{stepAmt}</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-white/80 border border-emerald-100 rounded-xl text-xs space-y-1 text-slate-700">
                      {isWeekly ? (
                        <>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Principal Returned to Fund:</span>
                            <span className="font-mono font-semibold">
                              {currency}{Math.round(installmentDue * (weeklyPrincipal / weeklyEmi))}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-emerald-800 font-semibold">
                            <span>Interest Added to Circle Pool:</span>
                            <span className="font-mono font-bold">
                              +{currency}{installmentDue - Math.round(installmentDue * (weeklyPrincipal / weeklyEmi))}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-900 font-bold pt-1 border-t border-slate-100">
                            <span>Total Payment Now:</span>
                            <span className="font-mono text-emerald-700 text-base">{currency}{installmentDue}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 pt-1">
                            • Remaining balance after payment: <strong className="text-slate-900 font-mono">{currency}{Math.max(0, principal - installmentDue).toLocaleString()}</strong>
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Principal Repayment:</span>
                            <span className="font-mono font-semibold">{currency}0</span>
                          </div>
                          <div className="flex justify-between items-center text-emerald-800 font-semibold">
                            <span>Interest Paid to Circle:</span>
                            <span className="font-mono font-bold">+{currency}{installmentDue}</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-900 font-bold pt-1 border-t border-slate-100">
                            <span>Total Due Now:</span>
                            <span className="font-mono text-emerald-700 text-base">{currency}{installmentDue}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 pt-1">
                            • Loan remains <strong className="text-emerald-700">Active</strong>. Principal balance stays at {currency}{principal.toLocaleString()}.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* OPTION 2: Full Settlement Mode */}
                {repayMode === 'full_settlement' && (
                  <div className="space-y-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200/80">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-950 text-xs sm:text-sm">
                        Full Settlement (Close Loan)
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        {isWeekly ? 'Pay Off Balance' : 'Principal + Elapsed Interest'}
                      </span>
                    </div>

                    {!isWeekly && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-slate-700 font-medium text-xs">
                            Elapsed 10-Day Periods for Interest ({currency}{periodicInterest}/cycle)
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsCustomSettlement(!isCustomSettlement)}
                            className="text-[11px] text-indigo-700 hover:underline font-semibold"
                          >
                            {isCustomSettlement ? 'Choose Periods' : 'Enter Custom Interest ₹'}
                          </button>
                        </div>

                        {isCustomSettlement ? (
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={customSettlementInterest}
                              onChange={(e) => setCustomSettlementInterest(Number(e.target.value))}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
                              placeholder="Enter accrued interest"
                              required
                            />
                            <span className="absolute right-3 top-2 text-xs text-slate-400">₹ Accrued Interest</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3, 4].map((p) => {
                              const tot = principal + periodicInterest * p;
                              return (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setSettlementPeriods(p)}
                                  className={`py-2 px-1 text-center rounded-xl border font-mono transition ${
                                    settlementPeriods === p
                                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-sm'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                                  }`}
                                >
                                  <div className="text-[10px] uppercase font-sans opacity-80">{p * 10} Days</div>
                                  <div className="text-xs sm:text-sm font-bold">{currency}{tot}</div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-3 bg-white/80 border border-indigo-100 rounded-xl text-xs space-y-1 text-slate-700">
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Principal Repayment:</span>
                        <span className="font-mono font-semibold">{currency}{principal.toLocaleString()}</span>
                      </div>
                      {!isWeekly && (
                        <div className="flex justify-between items-center text-indigo-800 font-semibold">
                          <span>Accrued Interest to Circle:</span>
                          <span className="font-mono font-bold">+{currency}{settlementInterestDue}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-slate-900 font-bold pt-1 border-t border-slate-100">
                        <span>Total Settlement Amount:</span>
                        <span className="font-mono text-indigo-700 text-base">{currency}{settlementTotalDue.toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 pt-1 font-semibold">
                        ✅ Loan will be completely settled and marked as REPAID.
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Payment Method</label>
                  <select
                    value={repayMethod}
                    onChange={(e) => setRepayMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 bg-white"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="Bank Transfer">Bank NEFT/IMPS</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedRepayLoan(null)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-white rounded-xl font-semibold shadow-sm transition ${
                      repayMode === 'installment'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {repayMode === 'installment'
                      ? `Confirm Installment (${currency}${installmentDue})`
                      : `Confirm Settlement (${currency}${settlementTotalDue})`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* Edit Loan Modal (Circle Admin Only) */}
      {editingLoan && (
        <EditLoanModal
          isOpen={!!editingLoan}
          onClose={() => setEditingLoan(null)}
          loan={editingLoan}
          circle={circle}
          availableBalance={availableBalance}
          onSave={(updated) => {
            if (onUpdateLoan) {
              onUpdateLoan(updated);
            }
            setEditingLoan(null);
          }}
        />
      )}

      {/* Loan Consensus Voting Audit Details Modal */}
      {viewingApprovalLoan && (() => {
        const targetLoan = loans.find((l) => l.id === viewingApprovalLoan.id) || viewingApprovalLoan;
        const consensus = getLoanConsensus(targetLoan);
        const approvals = targetLoan.approvals || [];
        const acceptedVoters = approvals.filter((a) => a.decision === 'approve');
        const rejectedVoters = approvals.filter((a) => a.decision === 'reject');

        const votedIds = approvals.map((a) => a.userId);
        const pendingMembers = (members || []).filter(
          (m) =>
            !votedIds.includes(m.userId) &&
            !votedIds.includes(m.id) &&
            m.userId !== targetLoan.borrowerId &&
            m.id !== targetLoan.borrowerId
        );

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
              
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Loan Consensus Audit
                  </span>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg mt-1 font-['Space_Grotesk'] leading-snug">
                    {targetLoan.borrowerName}'s Loan Request ({currency}{targetLoan.principal.toLocaleString()})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{targetLoan.purpose}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingApprovalLoan(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold shrink-0 ml-2"
                >
                  ✕
                </button>
              </div>

              {/* Consensus Rule Summary Card */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Consensus Rule Requirement:
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      consensus.isCriteriaMet
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {consensus.isCriteriaMet ? '✓ Criteria Satisfied' : '⏳ Pending Threshold'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="p-2 rounded-lg bg-white border border-indigo-100">
                    <span className="text-slate-500 block">1. Circle Admin Approval:</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                      {consensus.hasAdminApproved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Approved ({consensus.adminApprover?.userName})
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Awaiting Admin Vote
                        </>
                      )}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-indigo-100">
                    <span className="text-slate-500 block">2. Member Acceptance (50%):</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      {consensus.memberApprovalsCount} / {consensus.requiredMemberApprovals} Members Required
                    </span>
                  </div>
                </div>
              </div>

              {/* Voters List: Accepted */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Accepted Loan ({acceptedVoters.length})
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Approved to Disburse</span>
                </div>

                {acceptedVoters.length === 0 ? (
                  <p className="text-xs text-slate-400 italic pl-4">No votes in favor yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {acceptedVoters.map((v, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs ${
                          v.userId === currentUser.id
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                            : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                          {v.userName[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {v.userName} {v.userId === currentUser.id ? '(You)' : ''}
                          </p>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {v.userRole === 'circle_admin' ? 'Circle Admin' : 'Squad Member'}
                          </span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Voters List: Declined */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Declined Loan ({rejectedVoters.length})
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Against Disbursing</span>
                </div>

                {rejectedVoters.length === 0 ? (
                  <p className="text-xs text-slate-400 italic pl-4">No decline votes.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rejectedVoters.map((v, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs ${
                          v.userId === currentUser.id
                            ? 'bg-rose-50/70 border-rose-300 text-rose-950 font-medium'
                            : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-[10px]">
                          {v.userName[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {v.userName} {v.userId === currentUser.id ? '(You)' : ''}
                          </p>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {v.userRole === 'circle_admin' ? 'Circle Admin' : 'Squad Member'}
                          </span>
                        </div>
                        <X className="w-4 h-4 text-rose-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Awaiting Vote */}
              {pendingMembers.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Yet to Cast Vote ({pendingMembers.length})
                    </span>
                    <span className="text-[11px] text-amber-700">Awaiting Decision</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-1.5">
                    {pendingMembers.map((m) => (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-white border border-amber-200 text-slate-700 font-medium shadow-2xs"
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[9px] font-bold">
                          {m.name[0]?.toUpperCase()}
                        </span>
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewingApprovalLoan(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
