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
} from 'lucide-react';
import { Loan, Circle, User as UserType } from '../types';

interface LoansTabProps {
  circle: Circle;
  currentUser: UserType;
  loans: Loan[];
  interestEarnedTotal: number;
  onRequestLoan: (data: {
    principal: number;
    interestRate: number;
    durationMonths: number;
    purpose: string;
  }) => void;
  onReviewLoan: (loanId: string, action: 'approve' | 'reject') => void;
  onRepayLoan: (data: {
    loanId: string;
    amount: number;
    principalAmount: number;
    interestAmount: number;
    paymentMethod: string;
  }) => void;
  onOpenRequestModal: () => void;
}

export const LoansTab: React.FC<LoansTabProps> = ({
  circle,
  currentUser,
  loans,
  interestEarnedTotal,
  onRequestLoan,
  onReviewLoan,
  onRepayLoan,
  onOpenRequestModal,
}) => {
  const [selectedRepayLoan, setSelectedRepayLoan] = useState<Loan | null>(null);
  const [repayAmount, setRepayAmount] = useState<number>(1000);
  const [repayMethod, setRepayMethod] = useState('UPI');

  const currency = circle.currencySymbol || '₹';
  const isAdmin = currentUser.role === 'circle_admin' || currentUser.role === 'super_admin';

  // My Loans
  const myLoans = loans.filter((l) => l.borrowerId === currentUser.id);
  const myActiveLoan = myLoans.find((l) => l.status === 'Active');

  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepayLoan) return;

    // Calculate principal vs interest ratio
    const principalShare = Math.round(Number(repayAmount) * 0.9);
    const interestShare = Number(repayAmount) - principalShare;

    onRepayLoan({
      loanId: selectedRepayLoan.id,
      amount: Number(repayAmount),
      principalAmount: principalShare,
      interestAmount: interestShare,
      paymentMethod: repayMethod,
    });

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

        <button
          id="loans-request-btn"
          onClick={onOpenRequestModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          Request Internal Loan
        </button>
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
              Next scheduled payment:{' '}
              <strong className="text-white font-mono">{currency}1,767</strong> due on{' '}
              <strong className="text-white">{myActiveLoan.dueDate}</strong>
            </div>

            <button
              onClick={() => {
                setSelectedRepayLoan(myActiveLoan);
                setRepayAmount(Math.min(myActiveLoan.remainingAmount, 1767));
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl transition shadow-md"
            >
              Make Installment Payment
            </button>
          </div>
        </div>
      )}

      {/* All Loans Directory / Admin Review */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-base font-['Space_Grotesk']">
          All Circle Loan Requests &amp; Records
        </h3>

        <div className="divide-y divide-slate-100">
          {loans.map((loan) => (
            <div key={loan.id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <img
                  src={loan.borrowerAvatar}
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
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">{loan.purpose}</p>
                  <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-3">
                    <span>Principal: {currency}{loan.principal.toLocaleString()}</span>
                    <span>Interest: {loan.interestRate}%/mo ({currency}{loan.totalInterest})</span>
                    <span>Duration: {loan.durationMonths} Months</span>
                    <span>Due: {loan.dueDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <div className="text-sm font-bold font-mono text-slate-900">
                    Remaining: {currency}{loan.remainingAmount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Paid: {currency}{loan.totalPaid.toLocaleString()} / {currency}{loan.totalRepayment.toLocaleString()}
                  </span>
                </div>

                {loan.status === 'Pending' && isAdmin && (
                  <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => onReviewLoan(loan.id, 'approve')}
                      className="min-h-[40px] px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition text-center"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onReviewLoan(loan.id, 'reject')}
                      className="min-h-[40px] px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition text-center"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {loan.status === 'Active' && (
                  <button
                    onClick={() => {
                      setSelectedRepayLoan(loan);
                      setRepayAmount(Math.min(loan.remainingAmount, 1000));
                    }}
                    className="w-full sm:w-auto min-h-[40px] px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition text-center"
                  >
                    Record Repayment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Repay Modal */}
      {selectedRepayLoan && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Loan Repayment</h3>
                <p className="text-xs text-slate-500">
                  Borrower: {selectedRepayLoan.borrowerName} • Remaining: {currency}
                  {selectedRepayLoan.remainingAmount}
                </p>
              </div>
              <button
                onClick={() => setSelectedRepayLoan(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRepaySubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Repayment Amount ({currency})
                </label>
                <input
                  type="number"
                  max={selectedRepayLoan.remainingAmount}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Payment Method</label>
                <select
                  value={repayMethod}
                  onChange={(e) => setRepayMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="Bank Transfer">Bank NEFT/IMPS</option>
                </select>
              </div>

              {/* Automatic Principal vs Interest Breakdown Notice */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1 text-xs text-emerald-900">
                <span className="font-bold block">Double-Entry Accounting Separation:</span>
                <p>
                  • Principal ({currency}{Math.round(repayAmount * 0.9)}) returns to Circle Fund.
                </p>
                <p>
                  • Interest ({currency}{repayAmount - Math.round(repayAmount * 0.9)}) added to Circle Interest Revenue pool.
                </p>
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  Confirm Repayment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
