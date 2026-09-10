import React, { useState, useEffect } from 'react';
import { Circle, CircleMember, User } from '../../types';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  circle: Circle;
  members: CircleMember[];
  initialMemberId?: string;
  onRecord: (data: {
    userId: string;
    date: string;
    weekNumber?: number;
    amount: number;
    paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer';
    referenceNote: string;
    status: 'Paid' | 'Partially Paid' | 'Waived';
  }) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  circle,
  members,
  initialMemberId,
  onRecord,
}) => {
  const [memberId, setMemberId] = useState(initialMemberId || members[0]?.userId || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState(circle.contributionAmount || 500);
  const [method, setMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('UPI');
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState<'Paid' | 'Partially Paid' | 'Waived'>('Paid');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialMemberId) {
      setMemberId(initialMemberId);
    }
  }, [initialMemberId]);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    onRecord({
      userId: memberId,
      date,
      weekNumber: 1,
      amount: Number(amount),
      paymentMethod: method,
      referenceNote: reference || `${method} payment on ${date}`,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Record Savings Contribution</h3>
            <p className="text-xs text-slate-500">{circle.name} • Double-entry credit</p>
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
            <label className="block text-slate-700 font-medium mb-1">Select Member</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
            >
              {members.map((m) => (
                <option key={m.id} value={m.userId}>
                  {m.name} ({m.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Payment Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {(['UPI', 'Cash', 'Bank Transfer'] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2 px-2 text-center rounded-lg border text-xs font-semibold ${
                    method === m
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Reference / Note</label>
            <input
              type="text"
              placeholder="e.g. GPay UPI Ref 928374 or Cash handed to admin"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
            >
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Waived">Waived</option>
            </select>
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
              id="confirm-record-payment-btn"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
