import React, { useState } from 'react';
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
} from 'lucide-react';
import { Tour, Circle, User as UserType } from '../types';

interface ToursTabProps {
  circle: Circle;
  currentUser: UserType;
  tours: Tour[];
  onOpenCreateModal: () => void;
}

export const ToursTab: React.FC<ToursTabProps> = ({
  circle,
  currentUser,
  tours,
  onOpenCreateModal,
}) => {
  const [selectedTourId, setSelectedTourId] = useState<string>(tours[0]?.id || '');
  const currency = circle.currencySymbol || '₹';

  const activeTour = tours.find((t) => t.id === selectedTourId) || tours[0];

  if (!activeTour) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
        <Palmtree className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Tours Planned Yet</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Start planning your next squad adventure with a shared budget and itinerary.
        </p>
        <button
          onClick={onOpenCreateModal}
          className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
        >
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
  const fundProgress = Math.min(100, Math.round((currentSaved / totalBudget) * 100));
  const spendProgress = Math.min(100, Math.round((actualSpent / totalBudget) * 100));

  return (
    <div className="space-y-6">
      {/* Header & Tour Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            Tour Planning &amp; Budget Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Transparent group vacation planner with itinerary, live budget progress, and member shares.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900 text-white">
        <img
          src={activeTour.bannerUrl}
          alt={activeTour.title}
          className="w-full h-56 sm:h-72 object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2 backdrop-blur">
              <Compass className="w-3.5 h-3.5" />
              <span>Status: {activeTour.status.toUpperCase()}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-['Space_Grotesk'] tracking-tight">
              {activeTour.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 mt-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {activeTour.destination}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                {activeTour.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                {activeTour.startDate} to {activeTour.endDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                {activeTour.attendingMemberIds.length} Friends Attending
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-right">
            <span className="text-[11px] text-emerald-200 uppercase font-bold tracking-wider block">
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
              All 10 members contribute ₹500 weekly. Surplus funds after return are redistributed or saved into the next trip fund automatically.
            </p>
          </div>
          <div className="mt-3 text-[11px] text-emerald-700 font-medium">
            Advance bookings confirmed by vote • Full receipt transparency
          </div>
        </div>
      </div>

      {/* Budget Breakdown by Category */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4 font-['Space_Grotesk']">
          Budget Category Allocations vs Actual Spending
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTour.budgetBreakdown.map((item) => {
            const pct = Math.min(100, Math.round((item.actualSpent / item.allocated) * 100));
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
        <h3 className="font-bold text-slate-900 text-base mb-4 font-['Space_Grotesk']">
          Day-by-Day Tour Itinerary
        </h3>

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
    </div>
  );
};
