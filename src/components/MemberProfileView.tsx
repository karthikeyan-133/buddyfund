import React from 'react';
import {
  User as UserIcon,
  Phone,
  Mail,
  Calendar,
  Wallet,
  Coins,
  Palmtree,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { User, Circle, ContributionRecord, Loan, Tour } from '../types';

interface MemberProfileViewProps {
  currentUser: User;
  circle: Circle;
  contributions: ContributionRecord[];
  loans: Loan[];
  tours: Tour[];
}

export const MemberProfileView: React.FC<MemberProfileViewProps> = ({
  currentUser,
  circle,
  contributions,
  loans,
  tours,
}) => {
  const currency = circle.currencySymbol || '₹';

  const myContributions = contributions.filter((c) => c.userId === currentUser.id);
  const totalPaid = myContributions.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalPending = myContributions.reduce(
    (sum, c) => (c.status === 'Pending' || c.status === 'Late' ? sum + c.amount : sum),
    0
  );

  const myLoans = loans.filter((l) => l.borrowerId === currentUser.id);
  const myTours = tours.filter((t) => t.attendingMemberIds.includes(currentUser.id));

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
                {currentUser.name}
              </h2>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase ${
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
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {currentUser.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {currentUser.phone}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Member of {circle.name}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-right w-full sm:w-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
            Circle Trust Standing
          </span>
          <span className="text-lg font-bold text-emerald-900 flex items-center justify-end gap-1 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Reliable
          </span>
        </div>
      </div>

      {/* Financial Snapshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">My Total Contributed</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
            {currency}{totalPaid.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Directly added to common pool</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Pending Dues</span>
          <div className={`text-2xl font-bold mt-1 font-mono ${totalPending > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
            {currency}{totalPending.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Upcoming weekly contributions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Active Borrowings</span>
          <div className="text-2xl font-bold text-indigo-700 mt-1 font-mono">
            {currency}
            {myLoans
              .filter((l) => l.status === 'Active')
              .reduce((sum, l) => sum + l.remainingAmount, 0)
              .toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Internal peer loan pool</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Tours Confirmed</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {myTours.length} trips
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Attending squad tours</p>
        </div>
      </div>

      {/* My Savings Records */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base font-['Space_Grotesk']">
          My Weekly Contribution History
        </h3>

        <div className="divide-y divide-slate-100">
          {myContributions.map((rec) => (
            <div key={rec.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
              <div>
                <span className="font-semibold text-slate-900">{rec.weekLabel}</span>
                <div className="text-[11px] text-slate-400">Due: {rec.dueDate}</div>
              </div>
              <div className="text-right">
                <span className="font-bold font-mono text-slate-900">
                  {currency}{rec.amount}
                </span>
                <div className="text-[11px] text-slate-500">
                  Status:{' '}
                  <span
                    className={
                      rec.status === 'Paid'
                        ? 'text-emerald-600 font-semibold'
                        : 'text-amber-600 font-semibold'
                    }
                  >
                    {rec.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
