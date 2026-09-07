import React, { useState } from 'react';
import { Coins, AlertCircle, Sparkles } from 'lucide-react';
import { Circle } from '../../types';

interface RequestLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  circle: Circle;
  onRequest: (data: {
    principal: number;
    interestRate: number;
    durationMonths: number;
    purpose: string;
  }) => void;
}

export const RequestLoanModal: React.FC<RequestLoanModalProps> = ({
  isOpen,
  onClose,
  circle,
  onRequest,
}) => {
  const [principal, setPrincipal] = useState(5000);
  const [interestRate, setInterestRate] = useState(2); // 2% per month
  const [durationMonths, setDurationMonths] = useState(3);
  const [purpose, setPurpose] = useState('');

  if (!isOpen) return null;

  const monthlyInterest = (principal * interestRate) / 100;
  const totalInterest = monthlyInterest * durationMonths;
  const totalRepayment = principal + totalInterest;
  const monthlyInstallment = Math.round(totalRepayment / durationMonths);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!principal || !purpose) return;
    onRequest({
      principal: Number(principal),
      interestRate: Number(interestRate),
      durationMonths: Number(durationMonths),
      purpose,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Request Internal Peer Loan</h3>
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Reason / Purpose</label>
            <input
              type="text"
              placeholder="e.g. Medical emergency, laptop repair, security deposit"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Principal (₹)</label>
              <input
                type="number"
                min={500}
                step={500}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Interest / Month</label>
              <select
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white font-mono"
              >
                <option value={1}>1% / month</option>
                <option value={1.5}>1.5% / month</option>
                <option value={2}>2% / month</option>
                <option value={2.5}>2.5% / month</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Tenure (Months)</label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white font-mono"
              >
                <option value={1}>1 Month</option>
                <option value={2}>2 Months</option>
                <option value={3}>3 Months</option>
                <option value={6}>6 Months</option>
              </select>
            </div>
          </div>

          {/* Real-time automated calculation box */}
          <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-xl space-y-2 text-indigo-950">
            <span className="font-bold text-xs uppercase tracking-wider block text-indigo-900">
              Automated Calculation Summary
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">Monthly Interest:</span>
                <span className="font-mono font-bold">₹{monthlyInterest}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Interest ({durationMonths} mos):</span>
                <span className="font-mono font-bold text-emerald-700">₹{totalInterest}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Repayment:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">₹{totalRepayment}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Monthly Installment:</span>
                <span className="font-mono font-bold text-indigo-700 text-sm">₹{monthlyInstallment}/mo</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              Internal accounting only. All earned interest will be channeled directly to the common pool to fund group tours.
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm"
            >
              Submit Loan Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
