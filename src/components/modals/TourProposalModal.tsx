import React, { useState } from 'react';
import { Palmtree, MapPin, Calendar, Users, DollarSign } from 'lucide-react';
import { Circle, CircleMember } from '../../types';

interface TourProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  circle: Circle;
  members: CircleMember[];
  onCreateTour: (data: {
    title: string;
    destination: string;
    duration: string;
    startDate: string;
    endDate: string;
    estimatedBudget: number;
    travelBudget: number;
    hotelBudget: number;
    foodBudget: number;
    activityBudget: number;
    emergencyBudget: number;
  }) => void;
}

export const TourProposalModal: React.FC<TourProposalModalProps> = ({
  isOpen,
  onClose,
  circle,
  members,
  onCreateTour,
}) => {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Breakdown amounts
  const [travel, setTravel] = useState(0);
  const [hotel, setHotel] = useState(0);
  const [food, setFood] = useState(0);
  const [activity, setActivity] = useState(0);
  const [emergency, setEmergency] = useState(0);

  if (!isOpen) return null;

  const total = travel + hotel + food + activity + emergency;
  const costPerMember = Math.round(total / (members.length || 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTour({
      title,
      destination,
      duration,
      startDate,
      endDate,
      estimatedBudget: total,
      travelBudget: travel,
      hotelBudget: hotel,
      foodBudget: food,
      activityBudget: activity,
      emergencyBudget: emergency,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Palmtree className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Plan Squad Tour Proposal</h3>
              <p className="text-xs text-slate-500">Destination, duration, and categorized budget</p>
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
            <label className="block text-slate-700 font-medium mb-1">Tour Title</label>
            <input
              type="text"
              placeholder="e.g. Annual Squad Getaway, Hill Station Trip"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Destination</label>
              <input
                type="text"
                placeholder="e.g. Manali, Ooty, Goa"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Duration</label>
              <input
                type="text"
                placeholder="e.g. 3 Days / 2 Nights"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Budget Categories breakdown (Section 8) */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-600 block">
              Budget Category Allocations (₹)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-500 block mb-0.5">Travel / Flights / Train</label>
                <input
                  type="number"
                  value={travel}
                  onChange={(e) => setTravel(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-0.5">Hotel / Villa Stays</label>
                <input
                  type="number"
                  value={hotel}
                  onChange={(e) => setHotel(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-0.5">Food &amp; Dining</label>
                <input
                  type="number"
                  value={food}
                  onChange={(e) => setFood(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-0.5">Activities &amp; Water Sports</label>
                <input
                  type="number"
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono font-bold bg-white"
                />
              </div>
            </div>
            <div className="pt-2">
              <label className="text-slate-500 block mb-0.5">Emergency &amp; Buffer</label>
              <input
                type="number"
                value={emergency}
                onChange={(e) => setEmergency(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono font-bold bg-white"
              />
            </div>
          </div>

          {/* Automated calculations */}
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-800 block font-medium">Estimated Cost per Member:</span>
              <span className="text-lg font-bold font-mono text-emerald-900">
                ₹{costPerMember.toLocaleString()} / person
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-emerald-800 block font-medium">Total Tour Budget:</span>
              <span className="text-xl font-bold font-mono text-emerald-900">
                ₹{total.toLocaleString()}
              </span>
            </div>
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
              id="confirm-create-tour-btn"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm"
            >
              Publish Tour Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
