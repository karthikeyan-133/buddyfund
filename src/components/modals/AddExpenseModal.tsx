import React, { useState } from 'react';
import { ExpenseCategory, Tour } from '../../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tours: Tour[];
  onAdd: (data: {
    title: string;
    amount: number;
    date: string;
    category: ExpenseCategory;
    paidBy: string;
    description: string;
    receiptUrl?: string;
    tourId?: string;
    notes?: string;
  }) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  tours,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [paidBy, setPaidBy] = useState('Circle Common Fund');
  const [description, setDescription] = useState('');
  const [tourId, setTourId] = useState(tours[0]?.id || '');
  const [receiptUrl, setReceiptUrl] = useState('https://images.unsplash.com/photo-1554415707-9e49fe74a63a?w=400');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    onAdd({
      title,
      amount: Number(amount),
      date,
      category,
      paidBy,
      description,
      receiptUrl,
      tourId: tourId || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Record Group Expense</h3>
            <p className="text-xs text-slate-500">Deducts automatically from common fund</p>
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
            <label className="block text-slate-700 font-medium mb-1">Expense Title</label>
            <input
              type="text"
              placeholder="e.g. Seafood Dinner at Baga Beach"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Amount (₹)</label>
              <input
                type="number"
                placeholder="2400"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                <option value="Food">Food</option>
                <option value="Hotel">Hotel</option>
                <option value="Travel">Travel</option>
                <option value="Fuel">Fuel</option>
                <option value="Tickets">Tickets</option>
                <option value="Shopping">Shopping</option>
                <option value="Events">Events</option>
                <option value="Emergency">Emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Paid From</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                <option value="Circle Common Fund">Circle Common Fund</option>
                <option value="Reimbursed to Member">Reimbursed to Member</option>
              </select>
            </div>
          </div>

          {tours.length > 0 && (
            <div>
              <label className="block text-slate-700 font-medium mb-1">Link to Tour (Optional)</label>
              <select
                value={tourId}
                onChange={(e) => setTourId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
              >
                <option value="">None (General Circle Expense)</option>
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-medium mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Provide itemized detail or restaurant name..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
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
              id="confirm-add-expense-btn"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
