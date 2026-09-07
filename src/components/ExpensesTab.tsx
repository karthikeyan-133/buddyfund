import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Tag,
  User,
  Palmtree,
  ExternalLink,
  Image,
} from 'lucide-react';
import { Expense, Circle, ExpenseCategory, Tour, User as UserType } from '../types';

interface ExpensesTabProps {
  circle: Circle;
  currentUser: UserType;
  expenses: Expense[];
  tours: Tour[];
  onAddExpense: (data: {
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
  onOpenAddModal: () => void;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: 'bg-amber-100 text-amber-800 border-amber-200',
  Travel: 'bg-blue-100 text-blue-800 border-blue-200',
  Hotel: 'bg-purple-100 text-purple-800 border-purple-200',
  Fuel: 'bg-orange-100 text-orange-800 border-orange-200',
  Tickets: 'bg-pink-100 text-pink-800 border-pink-200',
  Shopping: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Events: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Emergency: 'bg-rose-100 text-rose-800 border-rose-200',
  Other: 'bg-slate-100 text-slate-800 border-slate-200',
};

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  circle,
  currentUser,
  expenses,
  tours,
  onAddExpense,
  onOpenAddModal,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const currency = circle.currencySymbol || '₹';

  const filtered = expenses.filter((e) => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (
      search &&
      !e.title.toLowerCase().includes(search.toLowerCase()) &&
      !e.description.toLowerCase().includes(search.toLowerCase()) &&
      !e.paidBy.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
            Group Expense Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Record all tour, food, transport, and emergency costs. Automatically updates the common wallet.
          </p>
        </div>

        <button
          id="expenses-add-btn"
          onClick={onOpenAddModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          Add New Expense
        </button>
      </div>

      {/* Expense KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Group Spend</span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {currency}{totalExpense.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Logged with receipts &amp; audit trail</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Invoices</span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {expenses.length} expenses
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Categorized by purpose</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Largest Category</span>
          <div className="text-xl font-bold text-purple-700 mt-1">
            Hotel &amp; Stays
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Advance resort reservations</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Funding Source</span>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            Circle Fund
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Paid transparently from pool</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            id="expenses-search-input"
            type="text"
            placeholder="Search expenses, restaurant, tour..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 min-h-[44px] text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        {/* Swipeable Category Chips on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'Food', label: '🍔 Food' },
            { id: 'Travel', label: '✈️ Travel' },
            { id: 'Hotel', label: '🏨 Hotel' },
            { id: 'Fuel', label: '⛽ Fuel' },
            { id: 'Tickets', label: '🎟️ Tickets' },
            { id: 'Events', label: '🎉 Events' },
            { id: 'Emergency', label: '🚨 Emergency' },
            { id: 'Other', label: '📦 Other' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-3 py-1.5 min-h-[36px] rounded-xl text-xs font-semibold transition flex-shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expense Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            No expenses found matching the filter.
          </div>
        ) : (
          filtered.map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Other
                    }`}
                  >
                    {exp.category}
                  </span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {currency}{exp.amount.toLocaleString()}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mt-2 leading-snug">
                  {exp.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {exp.description}
                </p>

                {exp.tourName && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                    <Palmtree className="w-3.5 h-3.5" />
                    <span>Assigned to: {exp.tourName}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{exp.date}</span>
                </div>

                {exp.receiptUrl && (
                  <a
                    href={exp.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <Image className="w-3 h-3" />
                    Receipt
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
