import React, { useState } from 'react';
import { Target, Plus, Sparkles, TrendingUp, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { Goal, Circle, User as UserType } from '../types';

interface GoalsTabProps {
  circle: Circle;
  currentUser: UserType;
  goals: Goal[];
  onAddGoal: (data: { title: string; targetAmount: number; targetDate: string; category: string }) => void;
  onAllocateFund: (goalId: string, amount: number) => void;
  onDeleteGoal?: (goalId: string) => void;
}

export const GoalsTab: React.FC<GoalsTabProps> = ({
  circle,
  currentUser,
  goals,
  onAddGoal,
  onAllocateFund,
  onDeleteGoal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCategory, setNewCategory] = useState('Travel');

  const [allocatingGoal, setAllocatingGoal] = useState<Goal | null>(null);
  const [allocateAmount, setAllocateAmount] = useState('');

  const currency = circle.currencySymbol || '₹';
  const isAdmin = currentUser.role === 'circle_admin' || currentUser.role === 'super_admin';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return;
    onAddGoal({
      title: newTitle,
      targetAmount: Number(newTarget),
      targetDate: newDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      category: newCategory,
    });
    setShowAddModal(false);
    setNewTitle('');
    setNewTarget('');
  };

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingGoal || !allocateAmount) return;
    onAllocateFund(allocatingGoal.id, Number(allocateAmount));
    setAllocatingGoal(null);
    setAllocateAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            Circle Savings Goals &amp; Targets
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Earmark common group funds for upcoming trips, festivals, and emergency buffers.
          </p>
        </div>

        {isAdmin && (
          <button
            id="goals-add-btn"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            Create New Goal
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs shadow-sm">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <span className="font-semibold text-slate-700 block text-sm">No Savings Goals Created Yet</span>
            <span className="text-slate-400 text-xs mt-1 block">Set targets for tours, celebrations, or emergency reserves.</span>
          </div>
        ) : (
          goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {goal.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 font-mono">
                      {pct}% Complete
                    </span>
                    {isAdmin && onDeleteGoal && (
                      <button
                        type="button"
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mt-3 font-['Space_Grotesk']">
                  {goal.title}
                </h3>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-500">Collected</span>
                    <span className="font-mono text-slate-900">
                      {currency}{goal.currentAmount.toLocaleString()} / {currency}
                      {goal.targetAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Target: {goal.targetDate}
                    </span>
                    <span>Remaining: {currency}{remaining.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {pct >= 100 ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Goal Reached!
                    </span>
                  ) : (
                    `Targeting ${currency}${Math.round(goal.targetAmount / 10)}/member`
                  )}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => setAllocatingGoal(goal)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition"
                  >
                    Allocate Fund
                  </button>
                )}
              </div>
            </div>
          );
        }))}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Create New Savings Target</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Goa Trip 2027 or New Year Bash"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Target Amount ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 60000"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="Travel">Travel / Tour</option>
                  <option value="Event">Event / Festival</option>
                  <option value="Emergency">Emergency Buffer</option>
                  <option value="Purchase">Group Purchase</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Target Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Fund Modal */}
      {allocatingGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Allocate Funds to Goal</h3>
                <p className="text-xs text-slate-500">{allocatingGoal.title}</p>
              </div>
              <button
                onClick={() => setAllocatingGoal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAllocateSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Allocation Amount ({currency})
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={allocateAmount}
                  onChange={(e) => setAllocateAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800">
                Transfers common pool balance to this designated goal target.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAllocatingGoal(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
