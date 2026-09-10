import React, { useState, useEffect, useMemo } from 'react';
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
  Pencil,
  CreditCard,
  FileText,
} from 'lucide-react';
import { User, Circle, CircleMember, ContributionRecord, Loan, Tour } from '../types';
import { EditProfileModal } from './modals/EditProfileModal';
import { dbFetchContributions } from '../lib/supabase';

interface MemberProfileViewProps {
  currentUser: User;
  circle: Circle;
  contributions: ContributionRecord[];
  members?: CircleMember[];
  loans: Loan[];
  tours: Tour[];
  onUpdateProfile?: (updatedData: {
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
  }) => void;
}

// Helper to format dates cleanly without raw ISO timestamps
const formatDateDisplay = (dateStr?: string) => {
  if (!dateStr) return '';
  if (/[a-zA-Z]/.test(dateStr) && !dateStr.includes('T')) return dateStr;
  try {
    const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = clean.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
    }
  } catch {}
  return dateStr.replace('T00:00:00+00:00', '').replace('T00:00:00Z', '');
};

export const MemberProfileView: React.FC<MemberProfileViewProps> = ({
  currentUser,
  circle,
  contributions,
  members = [],
  loans,
  tours,
  onUpdateProfile,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [extraContributions, setExtraContributions] = useState<ContributionRecord[]>([]);
  const currency = circle.currencySymbol || '₹';

  // Real-time synchronization directly with Supabase on mount/circle change
  useEffect(() => {
    if (circle?.id) {
      dbFetchContributions(circle.id)
        .then((latest) => {
          if (latest && Array.isArray(latest) && latest.length > 0) {
            setExtraContributions(latest);
          }
        })
        .catch(() => {});
    }
  }, [circle?.id]);

  // Find the matching circle member roster entry for current user
  const myMember = useMemo(() => {
    return (
      members.find(
        (m) =>
          m.userId === currentUser.id ||
          m.id === currentUser.id ||
          (m.name && currentUser.name && m.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) ||
          (m.email && currentUser.email && m.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()) ||
          (m.phone && currentUser.phone && m.phone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, ''))
      ) || null
    );
  }, [members, currentUser]);

  // Combine and deduplicate incoming contributions with directly fetched database records
  const allContributions = useMemo(() => {
    const combined = [...contributions, ...extraContributions];
    const seen = new Set<string>();
    const res: ContributionRecord[] = [];
    for (const c of combined) {
      if (!c) continue;
      const key = c.id || `${c.circleId}_${c.userId}_${c.dueDate || c.paidDate || c.weekLabel}`;
      if (!seen.has(key)) {
        seen.add(key);
        res.push(c);
      }
    }
    return res;
  }, [contributions, extraContributions]);

  // Robust matching function that links contributions to user regardless of ID schema differences
  const isMyContribution = (c: ContributionRecord) => {
    // 1. Direct ID match
    if (c.userId === currentUser.id) return true;

    // 2. Direct Name match (case-insensitive)
    if (
      c.userName &&
      currentUser.name &&
      c.userName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()
    ) {
      return true;
    }

    // 3. Match via member record from roster
    if (myMember) {
      if (c.userId === myMember.userId || c.userId === myMember.id) return true;
      if (
        c.userName &&
        myMember.name &&
        c.userName.trim().toLowerCase() === myMember.name.trim().toLowerCase()
      ) {
        return true;
      }
    }

    // 4. Circle Admin aliases
    if (currentUser.role === 'circle_admin' || currentUser.role === 'super_admin') {
      if (c.userId === `admin-${circle.id}` || c.userId === `member-admin-${circle.id}`) {
        return true;
      }
      if (
        c.userId.startsWith('admin-') &&
        (c.userName === currentUser.name || c.userName === circle.adminName)
      ) {
        return true;
      }
      if (circle.created_by && circle.created_by === currentUser.name && c.userName === currentUser.name) {
        return true;
      }
    }

    return false;
  };

  // Filter and deduplicate user's contributions
  const myContributions = useMemo(() => {
    const seen = new Set<string>();
    const res: ContributionRecord[] = [];
    for (const c of allContributions) {
      if (!isMyContribution(c)) continue;
      const key = `${c.circleId}_${c.dueDate || c.paidDate || c.weekLabel}`;
      if (!seen.has(key)) {
        seen.add(key);
        res.push(c);
      }
    }
    // Sort newest first
    return res.sort((a, b) => {
      const dateA = a.paidDate || a.dueDate || '';
      const dateB = b.paidDate || b.dueDate || '';
      return dateB.localeCompare(dateA);
    });
  }, [allContributions, currentUser, myMember, circle.id]);

  // Total paid calculation with fallback to member directory total
  const totalPaid = useMemo(() => {
    const sum = myContributions.reduce(
      (acc, c) => acc + (c.paidAmount || (c.status === 'Paid' ? c.amount : 0)),
      0
    );
    if (sum > 0) return sum;
    return myMember?.totalContributed || 0;
  }, [myContributions, myMember]);

  // Total pending dues calculation
  const totalPending = useMemo(() => {
    const sum = myContributions.reduce(
      (acc, c) => (c.status === 'Pending' || c.status === 'Late' ? acc + c.amount : acc),
      0
    );
    if (sum > 0) return sum;
    return myMember?.pendingContribution || 0;
  }, [myContributions, myMember]);

  // User's loans matching
  const isMyLoan = (l: Loan) => {
    if (l.borrowerId === currentUser.id) return true;
    if (l.borrowerName && currentUser.name && l.borrowerName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) return true;
    if (myMember && (l.borrowerId === myMember.userId || l.borrowerId === myMember.id)) return true;
    if (currentUser.role === 'circle_admin' && (l.borrowerId === `admin-${circle.id}` || l.borrowerId === `member-admin-${circle.id}`)) return true;
    return false;
  };
  const myLoans = loans.filter(isMyLoan);

  // User's tours matching
  const isMyTour = (t: Tour) => {
    if (t.attendingMemberIds.includes(currentUser.id)) return true;
    if (myMember && (t.attendingMemberIds.includes(myMember.userId) || t.attendingMemberIds.includes(myMember.id))) return true;
    if (currentUser.role === 'circle_admin' && (t.attendingMemberIds.includes(`admin-${circle.id}`) || t.attendingMemberIds.includes(`member-admin-${circle.id}`))) return true;
    return false;
  };
  const myTours = tours.filter(isMyTour);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group flex-shrink-0">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            />
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow transition active:scale-95"
              title="Change profile details"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
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

        {/* Edit Profile Action Button */}
        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 font-semibold text-xs sm:text-sm rounded-xl transition shadow-xs active:scale-95 flex-shrink-0"
        >
          <Pencil className="w-3.5 h-3.5 text-emerald-600" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Edit Profile Modal Dialog */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={currentUser}
        onSave={(data) => {
          onUpdateProfile?.(data);
        }}
      />

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
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base font-['Space_Grotesk'] flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>My Contribution History</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {myContributions.length} record{myContributions.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {myContributions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No contribution records found for this member yet.
            </div>
          ) : (
            myContributions.map((rec) => {
              const displayDate = formatDateDisplay(rec.dueDate || rec.paidDate || rec.weekLabel);
              const paidDateFormatted = formatDateDisplay(rec.paidDate);
              const isPaid = rec.status === 'Paid';
              return (
                <div key={rec.id} className="py-3.5 flex items-center justify-between text-xs sm:text-sm hover:bg-slate-50/60 px-2 rounded-xl transition">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{displayDate}</span>
                      {rec.paymentMethod && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          {rec.paymentMethod}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      {rec.paidDate && (
                        <span>Paid on {paidDateFormatted}</span>
                      )}
                      {rec.referenceNote && (
                        <span>• Ref: {rec.referenceNote}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono text-slate-900 text-sm">
                      {currency}{(rec.paidAmount || rec.amount || 0).toLocaleString()}
                    </div>
                    <div className="mt-0.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
