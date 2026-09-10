import React from 'react';
import { AlertTriangle, Trash2, X, Compass } from 'lucide-react';
import { Tour, Circle } from '../../types';

interface DeleteTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: Tour | null;
  circle: Circle;
  onConfirmDelete: (tourId: string) => void;
}

export const DeleteTourModal: React.FC<DeleteTourModalProps> = ({
  isOpen,
  onClose,
  tour,
  circle,
  onConfirmDelete,
}) => {
  if (!isOpen || !tour) return null;

  const currency = circle.currencySymbol || '₹';

  const handleDelete = () => {
    onConfirmDelete(tour.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Warning Icon & Close */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm font-bold transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Warning Message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Delete Tour Proposal</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Delete "{tour.title}"?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete this tour plan? All destination itinerary, budget allocations, and linked travel planning data will be removed.
          </p>
        </div>

        {/* Tour Snapshot Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-800">
            <span className="truncate">{tour.title}</span>
            <span className="text-emerald-700 font-mono font-bold">
              {currency}{tour.estimatedBudget.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Destination: {tour.destination}</span>
            <span>{tour.duration}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition text-xs sm:text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold rounded-xl shadow-lg shadow-rose-600/25 transition flex items-center justify-center gap-1.5 text-xs sm:text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Yes, Delete Tour</span>
          </button>
        </div>
      </div>
    </div>
  );
};
