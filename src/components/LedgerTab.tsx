import React, { useState } from 'react';
import {
  BookOpenCheck,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Calendar,
  FileText,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { Transaction, Circle, TransactionType, User } from '../types';

interface LedgerTabProps {
  circle: Circle;
  currentUser: User;
  transactions: Transaction[];
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
  };
  onAddAdjustment: (data: { amount: number; reason: string; type: TransactionType }) => void;
}

export const LedgerTab: React.FC<LedgerTabProps> = ({
  circle,
  currentUser,
  transactions,
  wallet,
  onAddAdjustment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustType, setAdjustType] = useState<TransactionType>('ADJUSTMENT');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const currency = circle.currencySymbol || '₹';
  const isAdmin = currentUser.role === 'circle_admin' || currentUser.role === 'super_admin';

  // Filtered
  const filtered = transactions.filter((t) => {
    if (selectedType !== 'all' && t.type !== selectedType) return false;
    if (
      searchTerm &&
      !t.notes.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !t.reference.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(t.memberName && t.memberName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
      return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Type', 'Category', 'Member', 'Amount', 'Reference', 'Created By', 'Notes', 'Audit Info'];
    const rows = filtered.map((t) => [
      t.id,
      t.date,
      t.type,
      t.category || '',
      t.memberName || '',
      t.amount,
      t.reference,
      t.createdBy,
      `"${t.notes.replace(/"/g, '""')}"`,
      `"${t.auditInfo.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FriendsCircle_Ledger_${circle.id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustAmount || !adjustReason) return;
    onAddAdjustment({
      amount: Number(adjustAmount),
      reason: adjustReason,
      type: adjustType,
    });
    setShowAdjustModal(false);
    setAdjustAmount('');
    setAdjustReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            Virtual Accounting Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Immutable double-entry book. Balances are mathematically computed from transaction history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              id="ledger-add-adj-btn"
              onClick={() => setShowAdjustModal(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Audit Adjustment
            </button>
          )}
          <button
            id="ledger-export-csv-btn"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Double-Entry Ledger Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 block">
            Current Balance
          </span>
          <div className="text-xl font-bold text-emerald-900 mt-1 font-mono">
            {currency}{wallet.currentBalance.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700">Calculated Cash Pool</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Contributions
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            +{currency}{wallet.totalContributions.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Total member savings</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 block">
            Tour Expenses
          </span>
          <div className="text-xl font-bold text-rose-700 mt-1 font-mono">
            -{currency}{wallet.tourExpenses.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Advance resort &amp; bookings</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 block">
            Food Expenses
          </span>
          <div className="text-xl font-bold text-amber-700 mt-1 font-mono">
            -{currency}{wallet.foodExpenses.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Dinners &amp; squad snacks</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 block">
            Loans Disbursed
          </span>
          <div className="text-xl font-bold text-indigo-700 mt-1 font-mono">
            {currency}{wallet.loansGiven.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">
            Repaid: +{currency}{wallet.loansPrincipalRepaid.toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-600 block">
            Interest Earned
          </span>
          <div className="text-xl font-bold text-teal-700 mt-1 font-mono">
            +{currency}{wallet.interestEarned.toLocaleString()}
          </div>
          <span className="text-[10px] text-teal-600">Circle net revenue</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="ledger-search-input"
            type="text"
            placeholder="Search reference, member, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            id="ledger-type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:ring-emerald-500"
          >
            <option value="all">All Operations</option>
            <option value="CONTRIBUTION">Contributions</option>
            <option value="EXPENSE">Expenses</option>
            <option value="LOAN_DISBURSEMENT">Loan Disbursements</option>
            <option value="LOAN_PRINCIPAL_REPAYMENT">Loan Principal Repayments</option>
            <option value="INTEREST_PAYMENT">Interest Income</option>
            <option value="ADJUSTMENT">Adjustments</option>
          </select>
        </div>
      </div>

      {/* Mobile Transaction Feed (UPI-style Banking History) */}
      <div className="block md:hidden space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No transactions match the filter criteria.
          </div>
        ) : (
          filtered.map((tx) => {
            const isCredit =
              tx.type === 'CONTRIBUTION' ||
              tx.type === 'INTEREST_PAYMENT' ||
              tx.type === 'LOAN_PRINCIPAL_REPAYMENT' ||
              tx.type === 'OTHER_INCOME';

            const isExpanded = expandedTxId === tx.id;

            return (
              <div
                key={`mob-tx-${tx.id}`}
                onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm transition active:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs leading-snug">
                        {tx.memberName || tx.category || tx.type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <span>{tx.type.replace(/_/g, ' ')}</span>
                        <span>•</span>
                        <span>{new Date(tx.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-bold font-mono ${
                        isCredit ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {isExpanded ? 'Hide info ▲' : 'Details ▼'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2 animate-in fade-in duration-150">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Note / Description
                      </span>
                      <p className="text-slate-800 font-medium mt-0.5">{tx.notes}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Reference</span>
                        <span className="font-mono text-slate-700">{tx.reference}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Recorded By</span>
                        <span className="text-slate-700">{tx.createdBy}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="truncate max-w-[190px]">Hash: {tx.auditInfo}</span>
                      </div>
                      {tx.receiptUrl && (
                        <a
                          href={tx.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-emerald-600 font-semibold underline flex items-center gap-0.5"
                        >
                          <FileText className="w-3 h-3" /> Receipt
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Ledger Table */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Type &amp; Date</th>
                <th className="py-3 px-4">Description &amp; Notes</th>
                <th className="py-3 px-4">Member / Category</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Audit Verification</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transactions match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isCredit =
                    tx.type === 'CONTRIBUTION' ||
                    tx.type === 'INTEREST_PAYMENT' ||
                    tx.type === 'LOAN_PRINCIPAL_REPAYMENT' ||
                    tx.type === 'OTHER_INCOME';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1.5 rounded-lg ${
                              isCredit
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {isCredit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {tx.type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(tx.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-900">{tx.notes}</div>
                        {tx.receiptUrl && (
                          <a
                            href={tx.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            <FileText className="w-3 h-3" /> View Receipt Image
                          </a>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {tx.memberName || tx.category || 'Common Pool'}
                        </div>
                        <span className="text-[10px] text-slate-400">By: {tx.createdBy}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-slate-600">
                        {tx.reference}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-[11px] text-slate-600">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{tx.auditInfo}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                        <span className={isCredit ? 'text-emerald-700' : 'text-slate-900'}>
                          {isCredit ? '+' : '-'}{currency}{tx.amount.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Drag Handle Indicator */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden mb-1" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Audit Adjustment</h3>
                <p className="text-xs text-slate-500">
                  Creates an immutable adjustment entry with full audit attribution.
                </p>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Adjustment Type</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as TransactionType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="ADJUSTMENT">General Adjustment</option>
                  <option value="OTHER_INCOME">Other Income / Sponsorship</option>
                  <option value="REFUND">Vendor Refund</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Reason &amp; Reference</label>
                <textarea
                  rows={2}
                  placeholder="Explain why this adjustment is required..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="font-semibold block mb-0.5">Audit Trail Notice:</span>
                This adjustment will be logged permanently in the circle audit trail under your name ({currentUser.name}).
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-adjustment-btn"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
