import React, { useState, useEffect } from 'react';
import { Edit3, Clock, Calendar, AlertCircle, CheckCircle2, ShieldCheck, X, Wallet } from 'lucide-react';
import { Loan, Circle, LoanRepaymentMethod, LoanStatus } from '../../types';

interface EditLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  circle: Circle;
  availableBalance?: number;
  onSave: (updatedLoan: Loan) => void;
}

export const EditLoanModal: React.FC<EditLoanModalProps> = ({
  isOpen,
  onClose,
  loan,
  circle,
  availableBalance = 0,
  onSave,
}) => {
  const [repaymentMethod, setRepaymentMethod] = useState<LoanRepaymentMethod>(
    loan.repaymentMethod || 'ten_day_cycle'
  );
  const [principal, setPrincipal] = useState<number>(loan.principal);
  const [interestRate, setInterestRate] = useState<number>(loan.interestRate || 5);
  const [isManualInterest, setIsManualInterest] = useState<boolean>(false);
  const [purpose, setPurpose] = useState<string>(loan.purpose || '');
  const [status, setStatus] = useState<LoanStatus>(loan.status);
  const [dueDate, setDueDate] = useState<string>(loan.dueDate || '');

  // 10-Day Cycle state
  const initialCycles = Math.max(1, Math.round((loan.cycleDays || 10) / 10));
  const [tenDayCycles, setTenDayCycles] = useState<number>(initialCycles);
  const [isManualDays, setIsManualDays] = useState<boolean>(
    (loan.cycleDays || 10) % 10 !== 0 || (loan.cycleDays || 10) > 40
  );
  const [customDays, setCustomDays] = useState<number>(loan.cycleDays || 10);

  // Weekly EMI state
  const [tenureWeeks, setTenureWeeks] = useState<number>(loan.tenureWeeks || 4);
  const [isManualWeeks, setIsManualWeeks] = useState<boolean>(
    ![4, 8, 12].includes(loan.tenureWeeks || 4)
  );

  useEffect(() => {
    if (loan) {
      setRepaymentMethod(loan.repaymentMethod || 'ten_day_cycle');
      setPrincipal(loan.principal);
      setInterestRate(loan.interestRate || 5);
      setPurpose(loan.purpose || '');
      setStatus(loan.status);
      setDueDate(loan.dueDate || '');

      const cDays = loan.cycleDays || 10;
      setCustomDays(cDays);
      setTenDayCycles(Math.max(1, Math.round(cDays / 10)));
      setIsManualDays(cDays % 10 !== 0 || cDays > 40);

      const tWeeks = loan.tenureWeeks || 4;
      setTenureWeeks(tWeeks);
      setIsManualWeeks(![4, 8, 12].includes(tWeeks));
    }
  }, [loan]);

  if (!isOpen) return null;

  const currency = circle.currencySymbol || '₹';

  // Calculations
  const activeDays = isManualDays ? Math.max(1, Number(customDays)) : tenDayCycles * 10;
  const activeCycles = Math.max(1, Math.ceil(activeDays / 10));
  const periodicInterest = Math.round((principal * interestRate) / 100);
  const totalInterest10Day = periodicInterest * activeCycles;
  const totalRepayment10Day = principal + totalInterest10Day;

  const activeWeeks = Math.max(1, Number(tenureWeeks));
  const totalInterestWeekly = Math.round(((principal * interestRate) / 100) * (activeWeeks / 4));
  const totalRepaymentWeekly = principal + totalInterestWeekly;
  const weeklyEmiAmount = Math.round(totalRepaymentWeekly / activeWeeks);
  const weeklyPrincipalPart = Math.round(principal / activeWeeks);
  const weeklyInterestPart = Math.max(0, weeklyEmiAmount - weeklyPrincipalPart);

  const totalRepayment = repaymentMethod === 'weekly_emi' ? totalRepaymentWeekly : totalRepayment10Day;
  const totalInterest = repaymentMethod === 'weekly_emi' ? totalInterestWeekly : totalInterest10Day;
  const remainingAmount = Math.max(0, totalRepayment - loan.totalPaid);

  const handleMethodChange = (newMethod: LoanRepaymentMethod) => {
    setRepaymentMethod(newMethod);
    const addedDays = newMethod === 'weekly_emi' ? activeWeeks * 7 : activeDays;
    const computedDue = new Date(Date.now() + addedDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    setDueDate(computedDue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!principal || !purpose) return;

    const approxMonths =
      repaymentMethod === 'weekly_emi'
        ? Math.max(1, Math.ceil(activeWeeks / 4))
        : Math.max(1, Math.ceil(activeDays / 30));

    const updatedLoan: Loan = {
      ...loan,
      principal: Number(principal),
      interestRate: Number(interestRate),
      durationMonths: approxMonths,
      purpose,
      status,
      dueDate,
      repaymentMethod,
      cycleDays: repaymentMethod === 'weekly_emi' ? undefined : activeDays,
      tenureWeeks: repaymentMethod === 'weekly_emi' ? activeWeeks : undefined,
      weeklyEmiAmount: repaymentMethod === 'weekly_emi' ? weeklyEmiAmount : undefined,
      monthlyInterest: repaymentMethod === 'weekly_emi' ? weeklyEmiAmount : periodicInterest,
      totalInterest,
      totalRepayment,
      remainingAmount,
      // Update installment schedules
      installments:
        repaymentMethod === 'weekly_emi'
          ? Array.from({ length: activeWeeks }).map((_, i) => ({
              installmentNumber: i + 1,
              dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              principalAmount: weeklyPrincipalPart,
              interestAmount: weeklyInterestPart,
              totalDue: weeklyEmiAmount,
              paidAmount: 0,
              status: 'Pending',
            }))
          : Array.from({ length: activeCycles }).map((_, i) => ({
              installmentNumber: i + 1,
              dueDate: new Date(Date.now() + (i + 1) * 10 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
              principalAmount: 0,
              interestAmount: periodicInterest,
              totalDue: periodicInterest,
              paidAmount: 0,
              status: 'Pending',
            })),
    };

    onSave(updatedLoan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-sm">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">Edit Loan Request</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Admin Control
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Borrower: <strong className="text-slate-800">{loan.borrowerName}</strong> • Circle: {circle.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Admin Notice */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Circle Admin Authority:</span> You can adjust the principal, interest rate, repayment method, tenure, due date, and status. Financial calculations and schedules will automatically update.
          </div>
        </div>

        {/* Available Circle Fund Balance Badge */}
        <div
          className={`p-3 rounded-2xl border flex items-center justify-between ${
            availableBalance <= 0
              ? 'bg-rose-50/80 border-rose-200 text-rose-950'
              : principal > availableBalance
              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                availableBalance <= 0
                  ? 'bg-rose-100 text-rose-700'
                  : principal > availableBalance
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 block">Available Circle Fund Balance</span>
              <span className={`text-sm font-bold font-mono ${availableBalance <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {currency}{availableBalance.toLocaleString()}
              </span>
            </div>
          </div>
          {principal > availableBalance && availableBalance > 0 && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-lg">
              Exceeds Available Fund
            </span>
          )}
          {availableBalance <= 0 && (
            <span className="text-[10px] font-bold text-rose-800 bg-rose-100/90 px-2 py-0.5 rounded-lg">
              No Balance Available
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Repayment Method Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Repayment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleMethodChange('ten_day_cycle')}
                className={`p-3 text-left rounded-2xl border transition relative ${
                  repaymentMethod === 'ten_day_cycle'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
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
                  5% interest every 10 days ({currency}50 on {currency}1k) to renew or close anytime.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleMethodChange('weekly_emi')}
                className={`p-3 text-left rounded-2xl border transition relative ${
                  repaymentMethod === 'weekly_emi'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
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
                  Principal + 5% interest divided into equal weekly installments.
                </p>
              </button>
            </div>
          </div>

          {/* Principal & Interest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loan Principal ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400">{currency}</span>
                <input
                  type="number"
                  min={100}
                  step={50}
                  value={principal}
                  onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl font-bold font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Interest Rate (%)</label>
                <button
                  type="button"
                  onClick={() => setIsManualInterest(!isManualInterest)}
                  className="text-[10px] text-emerald-700 hover:underline font-semibold"
                >
                  {isManualInterest ? 'Fix at 5%' : 'Custom %'}
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  disabled={!isManualInterest}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className={`w-full px-3 py-2 border border-slate-200 rounded-xl font-bold font-mono text-slate-900 outline-none text-sm ${
                    !isManualInterest ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-emerald-500/20'
                  }`}
                  required
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 font-semibold">%</span>
              </div>
            </div>
          </div>

          {/* Tenure Adjustments */}
          {repaymentMethod === 'ten_day_cycle' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">10-Day Tenure Cycles</label>
                <button
                  type="button"
                  onClick={() => setIsManualDays(!isManualDays)}
                  className="text-[10px] text-emerald-700 hover:underline font-semibold"
                >
                  {isManualDays ? 'Use Presets' : 'Custom Days'}
                </button>
              </div>

              {isManualDays ? (
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={customDays}
                    onChange={(e) => setCustomDays(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 text-sm"
                    placeholder="Enter custom days"
                    required
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">Days</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((cycles) => (
                    <button
                      key={cycles}
                      type="button"
                      onClick={() => setTenDayCycles(cycles)}
                      className={`py-2 px-2 text-center rounded-xl border text-xs font-semibold transition ${
                        tenDayCycles === cycles
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>{cycles * 10} Days</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {currency}{periodicInterest * cycles} int
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Weekly EMI Tenure</label>
                <button
                  type="button"
                  onClick={() => setIsManualWeeks(!isManualWeeks)}
                  className="text-[10px] text-indigo-700 hover:underline font-semibold"
                >
                  {isManualWeeks ? 'Use Presets' : 'Custom Weeks'}
                </button>
              </div>

              {isManualWeeks ? (
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={tenureWeeks}
                    onChange={(e) => setTenureWeeks(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 text-sm"
                    placeholder="Enter custom weeks"
                    required
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium">Weeks</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {[4, 8, 12].map((weeks) => {
                    const emi = Math.round(
                      (principal + ((principal * interestRate) / 100) * (weeks / 4)) / weeks
                    );
                    return (
                      <button
                        key={weeks}
                        type="button"
                        onClick={() => setTenureWeeks(weeks)}
                        className={`py-2 px-2 text-center rounded-xl border text-xs font-semibold transition ${
                          tenureWeeks === weeks
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-800 font-bold shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div>{weeks} Weeks</div>
                        <div className="text-[10px] text-slate-400 font-mono">{currency}{emi}/wk</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Status & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Loan Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LoanStatus)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 bg-white font-semibold text-xs sm:text-sm"
              >
                <option value="Pending">Pending (Awaiting Approval)</option>
                <option value="Active">Active (Approved & Disbursed)</option>
                <option value="Repaid">Repaid (Closed)</option>
                <option value="Rejected">Rejected (Declined)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 bg-white font-mono text-xs sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose / Note</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Festival Advance, Medical Expense"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 text-xs sm:text-sm"
              required
            />
          </div>

          {/* Automated Live Calculation Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Principal Amount:</span>
              <span className="font-mono font-bold text-slate-900">{currency}{principal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>Total Interest ({interestRate}%):</span>
              <span className="font-mono font-bold text-emerald-700">+{currency}{totalInterest.toLocaleString()}</span>
            </div>

            {repaymentMethod === 'weekly_emi' ? (
              <>
                <div className="flex items-center justify-between text-indigo-950 font-bold pt-1.5 border-t border-slate-200">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    Weekly EMI ({activeWeeks} weeks):
                  </span>
                  <span className="font-mono text-indigo-700 text-sm font-bold">
                    {currency}{weeklyEmiAmount} / week
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Weekly breakdown:</span>
                  <span>{currency}{weeklyPrincipalPart} principal + {currency}{weeklyInterestPart} interest</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-emerald-950 font-bold pt-1.5 border-t border-slate-200">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    Periodic Interest (Every 10 Days):
                  </span>
                  <span className="font-mono text-emerald-700 text-sm font-bold">
                    {currency}{periodicInterest} / 10d
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-[10px]">
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <div className="text-slate-400">10 Days</div>
                    <div className="font-bold font-mono text-slate-800">{currency}{principal + periodicInterest}</div>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <div className="text-slate-400">20 Days</div>
                    <div className="font-bold font-mono text-slate-800">{currency}{principal + periodicInterest * 2}</div>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                    <div className="text-slate-400">40 Days</div>
                    <div className="font-bold font-mono text-slate-800">{currency}{principal + periodicInterest * 4}</div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200">
              <span>Total Repayment:</span>
              <span className="font-mono text-slate-900">{currency}{totalRepayment.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Already Paid:</span>
              <span className="font-mono">{currency}{loan.totalPaid.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-amber-800">
              <span>Updated Remaining Due:</span>
              <span className="font-mono">{currency}{remainingAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
