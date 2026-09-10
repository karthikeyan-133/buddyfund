import React, { useState, useEffect } from 'react';
import { Coins, AlertCircle, Calendar, Clock, CheckCircle2, Wallet } from 'lucide-react';
import { Circle, LoanRepaymentMethod } from '../../types';

interface RequestLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  circle: Circle;
  availableBalance?: number;
  onRequest: (data: {
    principal: number;
    interestRate: number;
    durationMonths: number;
    purpose: string;
    repaymentMethod: LoanRepaymentMethod;
    cycleDays?: number;
    tenureWeeks?: number;
    weeklyEmiAmount?: number;
  }) => void;
}

export const RequestLoanModal: React.FC<RequestLoanModalProps> = ({
  isOpen,
  onClose,
  circle,
  availableBalance = 0,
  onRequest,
}) => {
  const [repaymentMethod, setRepaymentMethod] = useState<LoanRepaymentMethod>('ten_day_cycle');
  const [principal, setPrincipal] = useState<number>(() =>
    availableBalance > 0 ? Math.min(1000, availableBalance) : 0
  );
  const [interestRate, setInterestRate] = useState<number>(5); // 5% standard fixed
  const [isManualInterest, setIsManualInterest] = useState<boolean>(false);
  const [purpose, setPurpose] = useState<string>('');

  // Method 1: 10-Day Cycle state
  const [tenDayCycles, setTenDayCycles] = useState<number>(1); // 1 = 10d, 2 = 20d, 3 = 30d, 4 = 40d
  const [isManualDays, setIsManualDays] = useState<boolean>(false);
  const [customDays, setCustomDays] = useState<number>(10);

  // Method 2: Weekly EMI state
  const [tenureWeeks, setTenureWeeks] = useState<number>(4); // 4, 8, 12 weeks
  const [isManualWeeks, setIsManualWeeks] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPrincipal(availableBalance > 0 ? Math.min(1000, availableBalance) : 0);
    }
  }, [isOpen, availableBalance]);

  if (!isOpen) return null;

  const currency = circle.currencySymbol || '₹';
  const isNoBalance = availableBalance <= 0;
  const isExceedingBalance = principal > availableBalance;

  // Method 1 Calculations (10-Day Cycle)
  const activeDays = isManualDays ? Math.max(1, Number(customDays)) : tenDayCycles * 10;
  const activeCycles = Math.max(1, Math.ceil(activeDays / 10));
  const periodicInterest = Math.round((principal * interestRate) / 100);
  const totalInterest10Day = periodicInterest * activeCycles;
  const totalRepayment10Day = principal + totalInterest10Day;

  // Method 2 Calculations (Weekly EMI)
  const activeWeeks = Math.max(1, Number(tenureWeeks));
  const totalInterestWeekly = Math.round(((principal * interestRate) / 100) * (activeWeeks / 4));
  const totalRepaymentWeekly = principal + totalInterestWeekly;
  const weeklyEmiAmount = Math.round(totalRepaymentWeekly / activeWeeks);
  const weeklyPrincipalPart = Math.round(principal / activeWeeks);
  const weeklyInterestPart = Math.max(0, weeklyEmiAmount - weeklyPrincipalPart);

  // Unified submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNoBalance) return;
    if (!principal || !purpose) return;
    if (isExceedingBalance) return;

    if (repaymentMethod === 'ten_day_cycle') {
      const approxMonths = Math.max(1, Math.ceil(activeDays / 30));
      onRequest({
        principal: Number(principal),
        interestRate: Number(interestRate),
        durationMonths: approxMonths,
        purpose,
        repaymentMethod: 'ten_day_cycle',
        cycleDays: activeDays,
        weeklyEmiAmount: 0,
      });
    } else {
      const approxMonths = Math.max(1, Math.ceil(activeWeeks / 4));
      onRequest({
        principal: Number(principal),
        interestRate: Number(interestRate),
        durationMonths: approxMonths,
        purpose,
        repaymentMethod: 'weekly_emi',
        tenureWeeks: activeWeeks,
        weeklyEmiAmount,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Request Internal Peer Loan</h3>
              <p className="text-xs text-slate-500">Mutual assistance from {circle.name} pool</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* AVAILABLE CIRCLE BALANCE CARD */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
            isNoBalance
              ? 'bg-rose-50/80 border-rose-200 text-rose-950'
              : isExceedingBalance
              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                isNoBalance
                  ? 'bg-rose-100 text-rose-700'
                  : isExceedingBalance
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block">
                Available Circle Fund Balance
              </span>
              <span
                className={`text-base font-bold font-mono ${
                  isNoBalance ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {currency}{availableBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {availableBalance > 0 ? (
            <button
              type="button"
              onClick={() => setPrincipal(availableBalance)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200/80 px-2.5 py-1 rounded-lg transition"
            >
              Borrow Max ({currency}{availableBalance.toLocaleString()})
            </button>
          ) : (
            <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
              No Balance Available
            </span>
          )}
        </div>

        {/* WARNING WHEN ZERO OR NEGATIVE BALANCE */}
        {isNoBalance && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-rose-950 mb-0.5">
                No Balance Available in Circle Fund
              </strong>
              The circle's current verified balance is <strong>{currency}0</strong>. Mutual peer loans are funded directly from active member savings in the cash pool. Loans can only be requested when there is available fund balance.
            </div>
          </div>
        )}

        {/* 2-METHOD SELECTION TABS */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Choose Repayment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={isNoBalance}
              onClick={() => setRepaymentMethod('ten_day_cycle')}
              className={`p-3 text-left rounded-2xl border transition relative ${
                repaymentMethod === 'ten_day_cycle'
                  ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              } ${isNoBalance ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  10-Days Repayment
                </span>
                {repaymentMethod === 'ten_day_cycle' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Pay <strong>5% interest every 10 days</strong> ({currency}{periodicInterest}) to renew, or close anytime with full principal + interest.
              </p>
            </button>

            <button
              type="button"
              disabled={isNoBalance}
              onClick={() => setRepaymentMethod('weekly_emi')}
              className={`p-3 text-left rounded-2xl border transition relative ${
                repaymentMethod === 'weekly_emi'
                  ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              } ${isNoBalance ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Weekly EMI Model
                </span>
                {repaymentMethod === 'weekly_emi' && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Equal weekly installments (principal + interest) aligned with circle contribution weeks.
              </p>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Reason / Purpose</label>
            <input
              type="text"
              placeholder="e.g. Medical emergency, laptop repair, security deposit"
              value={purpose}
              disabled={isNoBalance}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-medium">Principal ({currency})</label>
                {availableBalance > 0 && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    Max: {currency}{availableBalance.toLocaleString()}
                  </span>
                )}
              </div>
              <input
                type="number"
                min={isNoBalance ? 0 : 50}
                max={availableBalance > 0 ? availableBalance : 0}
                step={50}
                disabled={isNoBalance}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-xl font-mono font-bold outline-none text-slate-900 ${
                  isExceedingBalance
                    ? 'border-rose-400 bg-rose-50/50 text-rose-900 ring-2 ring-rose-500/20'
                    : isNoBalance
                    ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                }`}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-medium">Interest Rate</label>
                <button
                  type="button"
                  disabled={isNoBalance}
                  onClick={() => setIsManualInterest(!isManualInterest)}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  {isManualInterest ? 'Use Presets' : 'Custom %'}
                </button>
              </div>
              {isManualInterest ? (
                <div className="relative">
                  <input
                    type="number"
                    min={0.1}
                    max={100}
                    step={0.5}
                    disabled={isNoBalance}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold disabled:bg-slate-100"
                    placeholder="e.g. 5"
                    required
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
                </div>
              ) : (
                <select
                  value={interestRate}
                  disabled={isNoBalance}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 bg-white font-mono font-bold disabled:bg-slate-100"
                >
                  <option value={5}>5% (Fixed Standard)</option>
                  <option value={2}>2% (Low Internal)</option>
                  <option value={3}>3% (Moderate)</option>
                  <option value={10}>10% (Short High)</option>
                </select>
              )}
            </div>

            {/* DURATION / TENURE SELECTOR */}
            <div>
              {repaymentMethod === 'ten_day_cycle' ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-medium">10-Day Cycles</label>
                    <button
                      type="button"
                      disabled={isNoBalance}
                      onClick={() => setIsManualDays(!isManualDays)}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      {isManualDays ? 'Cycles' : 'Days'}
                    </button>
                  </div>
                  {isManualDays ? (
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={180}
                        disabled={isNoBalance}
                        value={customDays}
                        onChange={(e) => setCustomDays(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold disabled:bg-slate-100"
                        placeholder="Days"
                        required
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400">days</span>
                    </div>
                  ) : (
                    <select
                      value={tenDayCycles}
                      disabled={isNoBalance}
                      onChange={(e) => setTenDayCycles(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 bg-white font-semibold disabled:bg-slate-100"
                    >
                      <option value={1}>10 Days (1 Cycle)</option>
                      <option value={2}>20 Days (2 Cycles)</option>
                      <option value={3}>30 Days (3 Cycles)</option>
                      <option value={4}>40 Days (4 Cycles)</option>
                    </select>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-medium">Tenure (Weeks)</label>
                    <button
                      type="button"
                      disabled={isNoBalance}
                      onClick={() => setIsManualWeeks(!isManualWeeks)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      {isManualWeeks ? 'Presets' : 'Custom'}
                    </button>
                  </div>
                  {isManualWeeks ? (
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={52}
                        disabled={isNoBalance}
                        value={tenureWeeks}
                        onChange={(e) => setTenureWeeks(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold disabled:bg-slate-100"
                        placeholder="Weeks"
                        required
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-400">weeks</span>
                    </div>
                  ) : (
                    <select
                      value={tenureWeeks}
                      disabled={isNoBalance}
                      onChange={(e) => setTenureWeeks(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 bg-white font-semibold disabled:bg-slate-100"
                    >
                      <option value={4}>4 Weeks (~1 Month)</option>
                      <option value={8}>8 Weeks (~2 Months)</option>
                      <option value={12}>12 Weeks (~3 Months)</option>
                    </select>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* EXCEEDED BALANCE WARNING */}
          {isExceedingBalance && availableBalance > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>
                Requested amount ({currency}{principal.toLocaleString()}) exceeds available circle balance ({currency}{availableBalance.toLocaleString()}). You can only request up to {currency}{availableBalance.toLocaleString()}.
              </span>
            </div>
          )}

          {/* DYNAMIC CALCULATION BREAKDOWN BOX */}
          {repaymentMethod === 'ten_day_cycle' ? (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  10-Days Repayment Calculation
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {interestRate}% Fixed per 10 Days
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Principal:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{currency}{principal.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Periodic Interest:</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    +{currency}{periodicInterest} / 10d
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Active Tenure:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{activeDays} Days</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Close at {activeDays}d:</span>
                  <span className="font-mono font-bold text-emerald-950 text-sm">
                    {currency}{totalRepayment10Day.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Milestone table */}
              <div className="mt-2 pt-2 border-t border-emerald-200/80">
                <div className="text-[11px] font-semibold text-emerald-900 mb-1">
                  Full Closure Milestones (Principal {currency}{principal} + Elapsed Interest):
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] sm:text-[11px]">
                  {[1, 2, 3, 4].map((p) => {
                    const intP = periodicInterest * p;
                    const totP = principal + intP;
                    return (
                      <div
                        key={p}
                        className={`p-1.5 rounded-lg border transition ${
                          activeCycles === p
                            ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-sm'
                            : 'bg-white/80 text-slate-700 border-emerald-200'
                        }`}
                      >
                        <div className={activeCycles === p ? 'text-emerald-100' : 'text-slate-400'}>
                          {p * 10} Days
                        </div>
                        <div className="font-mono font-bold">{currency}{totP}</div>
                        <div className={activeCycles === p ? 'text-emerald-100 text-[9px]' : 'text-emerald-700 text-[9px]'}>
                          +{currency}{intP} int
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 text-xs sm:text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-700" />
                  Weekly EMI Schedule Breakdown
                </span>
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  {activeWeeks} Equal Installments
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Principal:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{currency}{principal.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Weekly EMI Due:</span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">{currency}{weeklyEmiAmount} / week</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Interest ({activeWeeks}w):</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">+{currency}{totalInterestWeekly}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Repayment:</span>
                  <span className="font-mono font-bold text-indigo-950 text-sm">{currency}{totalRepaymentWeekly.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-indigo-200/80 text-[11px] text-slate-600 flex justify-between items-center">
                <span>• Weekly Principal: <strong className="text-slate-900 font-mono">{currency}{weeklyPrincipalPart}</strong></span>
                <span>• Weekly Interest: <strong className="text-emerald-700 font-mono">{currency}{weeklyInterestPart}</strong></span>
                <span>• Total Weeks: <strong className="text-indigo-700 font-mono">{activeWeeks} Weeks</strong></span>
              </div>
            </div>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              Internal mutual accounting. All earned interest flows directly to your circle common fund to finance group tours and activities.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-request-loan-btn"
              disabled={isNoBalance || isExceedingBalance || !principal || !purpose}
              className={`px-4 py-2 rounded-xl font-semibold shadow-sm transition ${
                isNoBalance || isExceedingBalance || !principal || !purpose
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isNoBalance
                ? `No Balance Available (${currency}0)`
                : isExceedingBalance
                ? `Exceeds Available Fund (Max ${currency}${availableBalance.toLocaleString()})`
                : 'Submit Loan Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
