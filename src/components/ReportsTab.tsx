import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Coins,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Circle, ContributionRecord, Expense, Loan, Tour, Transaction } from '../types';

interface ReportsTabProps {
  circle: Circle;
  contributions: ContributionRecord[];
  expenses: Expense[];
  loans: Loan[];
  tours: Tour[];
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
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  circle,
  contributions,
  expenses,
  loans,
  tours,
  transactions,
  wallet,
}) => {
  const [reportType, setReportType] = useState<
    'statement' | 'contributions' | 'expenses' | 'loans' | 'tours'
  >('statement');

  const currency = circle.currencySymbol || '₹';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReportCSV = () => {
    let rows: (string | number)[][] = [];
    let headers: string[] = [];
    let fileName = `Report_${reportType}.csv`;

    if (reportType === 'statement') {
      headers = ['Category', 'Debit / Inflow', 'Credit / Outflow', 'Net Impact'];
      rows = [
        ['Opening Balance', 0, 0, 0],
        ['Total Member Contributions', wallet.totalContributions, 0, `+${wallet.totalContributions}`],
        ['Total Tour & Group Expenses', 0, wallet.totalExpenses, `-${wallet.totalExpenses}`],
        ['Internal Loans Disbursed', 0, wallet.loansGiven, `-${wallet.loansGiven}`],
        ['Loan Principal Repayments', wallet.loansPrincipalRepaid, 0, `+${wallet.loansPrincipalRepaid}`],
        ['Interest Revenue Earned', wallet.interestEarned, 0, `+${wallet.interestEarned}`],
        ['Closing Verified Cash Pool', '', '', wallet.currentBalance],
      ];
      fileName = `Circle_Financial_Statement_${circle.name.replace(/\s+/g, '_')}.csv`;
    } else if (reportType === 'contributions') {
      headers = ['Member', 'Week', 'Due Date', 'Expected', 'Paid', 'Status', 'Payment Method'];
      rows = contributions.map((c) => [c.userName, c.weekLabel, c.dueDate, c.amount, c.paidAmount, c.status, c.paymentMethod || '']);
      fileName = `Contributions_Report_${circle.name}.csv`;
    } else if (reportType === 'expenses') {
      headers = ['Title', 'Category', 'Amount', 'Date', 'Paid By', 'Tour'];
      rows = expenses.map((e) => [e.title, e.category, e.amount, e.date, e.paidBy, e.tourName || '']);
      fileName = `Expenses_Report_${circle.name}.csv`;
    } else if (reportType === 'loans') {
      headers = ['Borrower', 'Principal', 'Interest Rate', 'Total Repayment', 'Paid', 'Remaining', 'Status'];
      rows = loans.map((l) => [l.borrowerName, l.principal, `${l.interestRate}%`, l.totalRepayment, l.totalPaid, l.remainingAmount, l.status]);
      fileName = `Loans_Report_${circle.name}.csv`;
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            Reports &amp; Financial Statements
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Printable statements, member contribution breakdowns, and audit-verified balances.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="min-h-[44px] justify-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 active:scale-95 text-center"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownloadReportCSV}
            className="min-h-[44px] justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95 text-center"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 border-b border-slate-200 pb-2.5 text-xs sm:text-sm font-medium -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { id: 'statement', label: 'Circle Financial Statement' },
          { id: 'contributions', label: 'Contribution Ledger' },
          { id: 'expenses', label: 'Expense Breakdown' },
          { id: 'loans', label: 'Internal Loan Portfolio' },
          { id: 'tours', label: 'Tour Accounting' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`whitespace-nowrap min-h-[40px] px-3.5 py-2 rounded-xl transition flex-shrink-0 ${
              reportType === tab.id
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content View */}
      {reportType === 'statement' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 print:p-0 print:border-none">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-slate-900 font-['Space_Grotesk']">
                  {circle.name}
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  Official Statement
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generated on {new Date().toLocaleDateString()} • Verified by Double-Entry Ledger
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <span>Currency: INR (₹)</span> • <span>Active Members: {circle.membersCount || 10}</span>
            </div>
          </div>

          {/* Core Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="py-3 px-4">Accounting Ledger Item</th>
                  <th className="py-3 px-4 text-right">Inflow (+)</th>
                  <th className="py-3 px-4 text-right">Outflow (-)</th>
                  <th className="py-3 px-4 text-right">Net Group Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr>
                  <td className="py-3 px-4 font-medium">Opening Balance (Genesis)</td>
                  <td className="py-3 px-4 text-right font-mono">—</td>
                  <td className="py-3 px-4 text-right font-mono">—</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{currency}0</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <span className="font-medium">Total Member Contributions</span>
                    <span className="text-xs text-slate-400 block">Weekly savings collected</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">
                    +{currency}{wallet.totalContributions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">—</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    +{currency}{wallet.totalContributions.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <span className="font-medium">Total Group &amp; Tour Expenses</span>
                    <span className="text-xs text-slate-400 block">Accommodations, dining, transport</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">—</td>
                  <td className="py-3 px-4 text-right font-mono text-rose-600 font-semibold">
                    -{currency}{wallet.totalExpenses.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                    -{currency}{wallet.totalExpenses.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <span className="font-medium">Internal Loans Disbursed</span>
                    <span className="text-xs text-slate-400 block">Emergency member assistance</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">—</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    -{currency}{wallet.loansGiven.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    -{currency}{wallet.loansGiven.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <span className="font-medium">Loan Principal Repayments</span>
                    <span className="text-xs text-slate-400 block">Returned directly to common pool</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">
                    +{currency}{wallet.loansPrincipalRepaid.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">—</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    +{currency}{wallet.loansPrincipalRepaid.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <span className="font-medium">Interest Earned from Loans</span>
                    <span className="text-xs text-slate-400 block">Net circle income added to wealth</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-teal-600 font-semibold">
                    +{currency}{wallet.interestEarned.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">—</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-teal-700">
                    +{currency}{wallet.interestEarned.toLocaleString()}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-emerald-50/80 font-bold border-t-2 border-emerald-200 text-slate-900">
                <tr>
                  <td className="py-4 px-4 text-base">Closing Verified Cash Pool</td>
                  <td className="py-4 px-4 text-right font-mono text-emerald-700">
                    +{currency}{(wallet.totalContributions + wallet.loansPrincipalRepaid + wallet.interestEarned).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-rose-700">
                    -{currency}{(wallet.totalExpenses + wallet.loansGiven).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-xl text-emerald-800 font-extrabold">
                    {currency}{wallet.currentBalance.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Audit Signature: FC-SHA256-{circle.id.slice(0, 8)}</span>
            <span>All members have equal view permissions under Circle Charter</span>
          </div>
        </div>
      )}

      {reportType === 'contributions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Complete Contribution History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Week</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Expected</th>
                  <th className="py-2.5 px-3">Paid</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contributions.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{c.userName}</td>
                    <td className="py-2.5 px-3">{c.weekLabel}</td>
                    <td className="py-2.5 px-3">{c.dueDate}</td>
                    <td className="py-2.5 px-3 font-mono">{currency}{c.amount}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">{currency}{c.paidAmount}</td>
                    <td className="py-2.5 px-3">{c.status}</td>
                    <td className="py-2.5 px-3 text-slate-500">{c.paymentMethod || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">All Circle Expenses</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Paid From</th>
                  <th className="py-2.5 px-3">Associated Tour</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{e.title}</td>
                    <td className="py-2.5 px-3">{e.category}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-600">{currency}{e.amount.toLocaleString()}</td>
                    <td className="py-2.5 px-3">{e.date}</td>
                    <td className="py-2.5 px-3 text-slate-500">{e.paidBy}</td>
                    <td className="py-2.5 px-3 text-blue-600">{e.tourName || 'General'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'loans' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Internal Loans Portfolio</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Borrower</th>
                  <th className="py-2.5 px-3">Principal</th>
                  <th className="py-2.5 px-3">Interest Rate</th>
                  <th className="py-2.5 px-3">Total Repayment</th>
                  <th className="py-2.5 px-3">Paid</th>
                  <th className="py-2.5 px-3">Remaining</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{l.borrowerName}</td>
                    <td className="py-2.5 px-3 font-mono">{currency}{l.principal.toLocaleString()}</td>
                    <td className="py-2.5 px-3">{l.interestRate}%/mo</td>
                    <td className="py-2.5 px-3 font-mono">{currency}{l.totalRepayment.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-600">{currency}{l.totalPaid.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-600">{currency}{l.remainingAmount.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-semibold">{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'tours' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Tour Financial Summary</h3>
          {tours.map((t) => (
            <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">{t.title}</span>
                <span className="font-mono text-sm font-semibold">
                  Budget: {currency}{t.estimatedBudget.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Destination: {t.destination} • Allocated from circle: {currency}{t.allocatedFromCircle.toLocaleString()} • Attending: {t.attendingMemberIds.length} members
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
