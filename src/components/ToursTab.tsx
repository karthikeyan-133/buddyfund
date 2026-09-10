import React, { useState, useEffect } from 'react';
import {
  Palmtree,
  Calendar,
  Users,
  Plus,
  Compass,
  MapPin,
  Clock,
  CheckCircle2,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Pencil,
  Trash2,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { Tour, Circle, CircleMember, User as UserType } from '../types';
import { EditTourModal } from './modals/EditTourModal';
import { DeleteTourModal } from './modals/DeleteTourModal';

interface ToursTabProps {
  circle: Circle;
  currentUser: UserType;
  tours: Tour[];
  members?: CircleMember[];
  onOpenCreateModal: () => void;
  onEditTour?: (updatedTour: Tour) => void;
  onDeleteTour?: (tourId: string) => void;
}

export const ToursTab: React.FC<ToursTabProps> = ({
  circle,
  currentUser,
  tours,
  members = [],
  onOpenCreateModal,
  onEditTour,
  onDeleteTour,
}) => {
  const [selectedTourId, setSelectedTourId] = useState<string>(tours[0]?.id || '');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Sync selected tour if tours change
  useEffect(() => {
    if (tours.length > 0 && !tours.some((t) => t.id === selectedTourId)) {
      setSelectedTourId(tours[0].id);
    }
  }, [tours, selectedTourId]);

  const currency = circle.currencySymbol || '₹';
  const isAdmin = currentUser.role === 'circle_admin' || currentUser.role === 'super_admin';

  const activeTour = tours.find((t) => t.id === selectedTourId) || tours[0];

  if (!activeTour) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs animate-in fade-in duration-200">
        <Palmtree className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 font-['Space_Grotesk']">No Tours Planned Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Start planning your next squad adventure with a shared budget and itinerary.
        </p>
        <button
          onClick={onOpenCreateModal}
          className="mt-4 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5 mx-auto"
        >
          <Plus className="w-4 h-4" />
          Create Tour Proposal
        </button>
      </div>
    );
  }

  // Budget calculations
  const totalBudget = activeTour.estimatedBudget;
  const currentSaved = activeTour.allocatedFromCircle;
  const remainingSavingsNeeded = Math.max(0, totalBudget - currentSaved);
  const actualSpent = activeTour.budgetBreakdown.reduce((sum, b) => sum + b.actualSpent, 0);
  const remainingBudgetLeft = Math.max(0, totalBudget - actualSpent);
  const perMemberCost = Math.round(totalBudget / (activeTour.attendingMemberIds.length || 1));
  const fundProgress = Math.min(100, Math.round((currentSaved / (totalBudget || 1)) * 100));
  const spendProgress = Math.min(100, Math.round((actualSpent / (totalBudget || 1)) * 100));

  // Member attendance check
  const isCurrentUserAttending =
    activeTour.attendingMemberIds.includes(currentUser.id) ||
    members.some((m) => (m.userId === currentUser.id || m.id === currentUser.id) && activeTour.attendingMemberIds.includes(m.userId));

  const handleToggleAttendance = () => {
    if (!onEditTour) return;
    const myId = currentUser.id;
    const nextIds = isCurrentUserAttending
      ? activeTour.attendingMemberIds.filter((id) => id !== myId)
      : [...activeTour.attendingMemberIds, myId];
    onEditTour({
      ...activeTour,
      attendingMemberIds: nextIds,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Tour Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            Tour Planning &amp; Budget Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Transparent group vacation planner with itinerary, live budget progress, and member shares.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {tours.length > 1 && (
            <select
              value={selectedTourId}
              onChange={(e) => setSelectedTourId(e.target.value)}
              className="flex-1 sm:flex-initial min-h-[44px] text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 font-medium"
            >
              {tours.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          )}

          {/* Admin Controls: Edit & Delete Tour */}
          {isAdmin && (
            <>
              <button
                type="button"
                id="tour-edit-btn"
                onClick={() => setIsEditModalOpen(true)}
                className="min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs active:scale-95"
                title="Edit tour destination, dates, budget breakdown, and itinerary"
              >
                <Pencil className="w-4 h-4 text-emerald-600" />
                <span>Edit Tour</span>
              </button>
              <button
                type="button"
                id="tour-delete-btn"
                onClick={() => setIsDeleteModalOpen(true)}
                className="min-h-[44px] px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs active:scale-95"
                title="Delete this tour"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete</span>
              </button>
            </>
          )}

          {/* Plan New Tour Button */}
          <button
            id="tours-create-proposal-btn"
            onClick={onOpenCreateModal}
            className="flex-1 sm:flex-initial min-h-[44px] justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Plan New Tour
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 text-white min-h-[380px] sm:min-h-[320px] flex flex-col justify-between">
        {/* Background Image & Gradient Overlays */}
        <img
          src={activeTour.bannerUrl}
          alt={activeTour.title}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/40" />

        {/* Top Row: Status Badge and Action Buttons (In regular flow, prevents mobile overlap) */}
        <div className="relative z-10 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-xs">
            <Compass className="w-3.5 h-3.5" />
            <span className="capitalize">Status: {activeTour.status}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Member Join/Leave Attendance Toggle */}
            <button
              type="button"
              onClick={handleToggleAttendance}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
                isCurrentUserAttending
                  ? 'bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-400/50'
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
              }`}
            >
              {isCurrentUserAttending ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Attending</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5 text-slate-200" />
                  <span>Join Tour</span>
                </>
              )}
            </button>

            {/* Admin Edit / Delete Badges */}
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="min-h-[36px] px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  title="Edit Tour"
                >
                  <Pencil className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="min-h-[36px] px-3 py-1.5 bg-rose-500/30 hover:bg-rose-500/50 backdrop-blur-md text-white border border-rose-300/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  title="Delete Tour"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom Row: Title, Metadata Chips, and Cost Card */}
        <div className="relative z-10 p-4 sm:p-6 pt-2 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-['Space_Grotesk'] tracking-tight text-white drop-shadow-sm">
              {activeTour.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-slate-200">
              <span className="flex items-center gap-1.5 bg-black/35 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{activeTour.destination}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/35 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{activeTour.duration}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/35 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{activeTour.startDate} to {activeTour.endDate}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/35 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10">
                <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{activeTour.attendingMemberIds.length} Friends Attending</span>
              </span>
            </div>
          </div>

          <div className="bg-slate-950/70 sm:bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-left sm:text-right shrink-0 w-full sm:w-auto">
            <span className="text-[11px] text-emerald-300 uppercase font-bold tracking-wider block">
              Estimated Cost / Member
            </span>
            <div className="text-2xl font-bold font-mono text-white">
              {currency}{perMemberCost.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-300">
              Total: {currency}{totalBudget.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tour Financial Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Savings Goal Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Circle Savings Funded
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {fundProgress}% Funded
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {currency}{currentSaved.toLocaleString()}
            <span className="text-xs text-slate-400 font-sans font-normal ml-1">
              / {currency}{totalBudget.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${fundProgress}%` }} />
          </div>
          <p className="text-xs text-slate-500">
            Remaining required from weekly contributions:{' '}
            <strong className="text-slate-800 font-mono">{currency}{remainingSavingsNeeded.toLocaleString()}</strong>
          </p>
        </div>

        {/* Actual Spend Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Actual Expenses Disbursed
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {spendProgress}% Spent
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {currency}{actualSpent.toLocaleString()}
            <span className="text-xs text-slate-400 font-sans font-normal ml-1">
              / {currency}{totalBudget.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${spendProgress}%` }} />
          </div>
          <p className="text-xs text-slate-500">
            Unspent Tour Balance:{' '}
            <strong className="text-slate-800 font-mono">{currency}{remainingBudgetLeft.toLocaleString()}</strong>
          </p>
        </div>

        {/* Quick Tour Policy */}
        <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Shared Fund Rule
            </span>
            <p className="text-xs text-emerald-900 mt-2 leading-relaxed">
              All members contribute {circle.currencySymbol}{circle.contributionAmount} {circle.contributionFrequency}. Surplus funds after return are redistributed or saved into the next trip fund automatically.
            </p>
          </div>
          <div className="mt-3 text-[11px] text-emerald-700 font-medium">
            Advance bookings confirmed by vote • Full receipt transparency
          </div>
        </div>
      </div>

      {/* Attending Squad Friends Showcase */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base font-['Space_Grotesk'] flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span>Squad Friends Attending ({activeTour.attendingMemberIds.length})</span>
          </h3>
          <button
            type="button"
            onClick={handleToggleAttendance}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline transition"
          >
            {isCurrentUserAttending ? 'Leave this trip' : '+ Join this trip'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
          {members
            .filter((m) => activeTour.attendingMemberIds.includes(m.userId) || activeTour.attendingMemberIds.includes(m.id))
            .map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/60"
              >
                <img
                  src={m.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`}
                  alt={m.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900 text-xs truncate">{m.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{m.role.replace('_', ' ')}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Budget Breakdown by Category */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-base font-['Space_Grotesk']">
            Budget Category Allocations vs Actual Spending
          </h3>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
            >
              <Pencil className="w-3 h-3" />
              Adjust Category Budgets
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTour.budgetBreakdown.map((item) => {
            const pct = Math.min(100, Math.round((item.actualSpent / (item.allocated || 1)) * 100));
            return (
              <div key={item.category} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{item.category}</span>
                  <span className="font-mono text-slate-900">
                    {currency}{item.actualSpent.toLocaleString()} / {currency}{item.allocated.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                  <span>{pct}% spent</span>
                  <span>Left: {currency}{(item.allocated - item.actualSpent).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Itinerary Timeline */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-base font-['Space_Grotesk']">
            Day-by-Day Tour Itinerary
          </h3>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
            >
              <Pencil className="w-3 h-3" />
              Edit Itinerary Schedule
            </button>
          )}
        </div>

        <div className="space-y-4">
          {activeTour.itinerary.map((day) => (
            <div key={day.day} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-sm font-mono">
                D{day.day}
              </div>
              <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <h4 className="font-semibold text-slate-900 text-sm">{day.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{day.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tour Notes */}
      {activeTour.notes && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Trip Guidelines &amp; Notes
          </span>
          <p className="text-xs text-slate-700 leading-relaxed">{activeTour.notes}</p>
        </div>
      )}

      {/* Modals for Edit and Delete */}
      <EditTourModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tour={activeTour}
        circle={circle}
        members={members}
        onSave={(updated) => {
          onEditTour?.(updated);
        }}
      />

      <DeleteTourModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        tour={activeTour}
        circle={circle}
        onConfirmDelete={(tourId) => {
          onDeleteTour?.(tourId);
        }}
      />
    </div>
  );
};

