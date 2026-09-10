import React, { useState, useEffect } from 'react';
import {
  Palmtree,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Image,
  FileText,
  Clock,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { Tour, Circle, CircleMember } from '../../types';

interface EditTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: Tour | null;
  circle: Circle;
  members: CircleMember[];
  onSave: (updatedTour: Tour) => void;
}

export const EditTourModal: React.FC<EditTourModalProps> = ({
  isOpen,
  onClose,
  tour,
  circle,
  members,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<Tour['status']>('planning');
  const [bannerUrl, setBannerUrl] = useState('');
  const [allocatedFromCircle, setAllocatedFromCircle] = useState(0);

  // Categorized Budgets
  const [travel, setTravel] = useState(0);
  const [hotel, setHotel] = useState(0);
  const [food, setFood] = useState(0);
  const [activity, setActivity] = useState(0);
  const [emergency, setEmergency] = useState(0);

  // Day-by-Day Itinerary
  const [itinerary, setItinerary] = useState<
    { day: number; title: string; description: string }[]
  >([]);

  // Attending members
  const [attendingMemberIds, setAttendingMemberIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Pre-fill fields whenever tour changes
  useEffect(() => {
    if (tour) {
      setTitle(tour.title || '');
      setDestination(tour.destination || '');
      setDuration(tour.duration || '');
      setStartDate(tour.startDate || '');
      setEndDate(tour.endDate || '');
      setStatus(tour.status || 'planning');
      setBannerUrl(tour.bannerUrl || '');
      setAllocatedFromCircle(tour.allocatedFromCircle || 0);

      const travelCat = tour.budgetBreakdown.find((b) => b.category === 'Travel');
      const hotelCat = tour.budgetBreakdown.find((b) => b.category === 'Hotel');
      const foodCat = tour.budgetBreakdown.find((b) => b.category === 'Food');
      const actCat = tour.budgetBreakdown.find(
        (b) => b.category === 'Activities' || b.category === 'Water Sports'
      );
      const emgCat = tour.budgetBreakdown.find(
        (b) => b.category === 'Emergency' || b.category === 'Buffer'
      );

      setTravel(travelCat?.allocated || 0);
      setHotel(hotelCat?.allocated || 0);
      setFood(foodCat?.allocated || 0);
      setActivity(actCat?.allocated || 0);
      setEmergency(emgCat?.allocated || 0);

      setItinerary(
        tour.itinerary && tour.itinerary.length > 0
          ? tour.itinerary
          : [
              { day: 1, title: 'Arrival & Check-in', description: 'Arrival and squad dinner.' },
              { day: 2, title: 'Sightseeing & Adventures', description: 'Explore local attractions.' },
            ]
      );

      setAttendingMemberIds(tour.attendingMemberIds || members.map((m) => m.userId));
      setNotes(tour.notes || '');
    }
  }, [tour, members]);

  if (!isOpen || !tour) return null;

  const currency = circle.currencySymbol || '₹';
  const totalBudget = travel + hotel + food + activity + emergency;
  const costPerMember = Math.round(
    totalBudget / (attendingMemberIds.length > 0 ? attendingMemberIds.length : 1)
  );

  const handleToggleMember = (userId: string) => {
    setAttendingMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddDay = () => {
    const nextDay = itinerary.length + 1;
    setItinerary([
      ...itinerary,
      { day: nextDay, title: `Day ${nextDay} Activity`, description: 'Squad activities & exploration.' },
    ]);
  };

  const handleRemoveDay = (index: number) => {
    const updated = itinerary
      .filter((_, i) => i !== index)
      .map((item, idx) => ({ ...item, day: idx + 1 }));
    setItinerary(updated);
  };

  const handleDayChange = (
    index: number,
    field: 'title' | 'description',
    value: string
  ) => {
    const updated = [...itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setItinerary(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Preserve existing actualSpent amounts if available
    const existingTravelSpent = tour.budgetBreakdown.find((b) => b.category === 'Travel')?.actualSpent || 0;
    const existingHotelSpent = tour.budgetBreakdown.find((b) => b.category === 'Hotel')?.actualSpent || 0;
    const existingFoodSpent = tour.budgetBreakdown.find((b) => b.category === 'Food')?.actualSpent || 0;
    const existingActSpent = tour.budgetBreakdown.find((b) => b.category === 'Activities')?.actualSpent || 0;
    const existingEmgSpent = tour.budgetBreakdown.find((b) => b.category === 'Emergency')?.actualSpent || 0;

    const updatedTour: Tour = {
      ...tour,
      title: title.trim() || 'Squad Tour',
      destination: destination.trim() || 'Tour Destination',
      duration: duration.trim() || '3 Days / 2 Nights',
      startDate,
      endDate,
      status,
      bannerUrl:
        bannerUrl.trim() ||
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
      estimatedBudget: totalBudget,
      allocatedFromCircle,
      budgetBreakdown: [
        { category: 'Travel', allocated: travel, actualSpent: existingTravelSpent },
        { category: 'Hotel', allocated: hotel, actualSpent: existingHotelSpent },
        { category: 'Food', allocated: food, actualSpent: existingFoodSpent },
        { category: 'Activities', allocated: activity, actualSpent: existingActSpent },
        { category: 'Emergency', allocated: emergency, actualSpent: existingEmgSpent },
      ],
      attendingMemberIds,
      itinerary,
      notes: notes.trim(),
    };

    onSave(updatedTour);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Palmtree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-['Space_Grotesk']">
                Edit Tour Plan &amp; Itinerary
              </h3>
              <p className="text-xs text-slate-500">Update destination, dates, budget breakdown, and schedule</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 text-xs sm:text-sm flex-1">
          {/* Basic Details */}
          <div className="space-y-3">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-500 block">
              1. Basic Information
            </span>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tour Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. London Trip, Goa Summer Getaway"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Destination</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. London, Manali"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Duration</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 7days/6nights"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tour Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Tour['status'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white font-medium capitalize"
                >
                  <option value="planning">Planning (Voting)</option>
                  <option value="confirmed">Confirmed (Booked)</option>
                  <option value="ongoing">Ongoing (Active)</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Banner Image URL</label>
              <div className="relative">
                <Image className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Categorized Budget Breakdown */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                2. Budget Breakdown Allocations ({currency})
              </span>
              <span className="text-xs font-bold text-emerald-700 font-mono">
                Total: {currency}{totalBudget.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Travel / Flights</label>
                <input
                  type="number"
                  min="0"
                  value={travel}
                  onChange={(e) => setTravel(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Hotel / Stay</label>
                <input
                  type="number"
                  min="0"
                  value={hotel}
                  onChange={(e) => setHotel(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Food &amp; Dining</label>
                <input
                  type="number"
                  min="0"
                  value={food}
                  onChange={(e) => setFood(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Activities</label>
                <input
                  type="number"
                  min="0"
                  value={activity}
                  onChange={(e) => setActivity(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Emergency / Buffer</label>
                <input
                  type="number"
                  min="0"
                  value={emergency}
                  onChange={(e) => setEmergency(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Funded from Circle</label>
                <input
                  type="number"
                  min="0"
                  value={allocatedFromCircle}
                  onChange={(e) => setAllocatedFromCircle(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono font-bold bg-white text-emerald-700"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Attending: <strong>{attendingMemberIds.length} members</strong>
              </span>
              <span className="text-slate-700">
                Est. Cost / Friend: <strong className="text-emerald-700 font-mono">{currency}{costPerMember.toLocaleString()}</strong>
              </span>
            </div>
          </div>

          {/* Attending Members Checklist */}
          <div className="space-y-2">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-500 block flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              3. Friends Attending ({attendingMemberIds.length}/{members.length})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
              {members.map((m) => {
                const isAttending = attendingMemberIds.includes(m.userId);
                return (
                  <label
                    key={m.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition text-xs ${
                      isAttending
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isAttending}
                      onChange={() => handleToggleMember(m.userId)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="truncate">{m.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Day-by-Day Itinerary Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                4. Day-by-Day Itinerary ({itinerary.length} Days)
              </span>
              <button
                type="button"
                onClick={handleAddDay}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Day
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {itinerary.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs font-mono shrink-0 mt-1">
                    D{item.day}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleDayChange(idx, 'title', e.target.value)}
                      placeholder="Day summary / title"
                      className="w-full px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 bg-white"
                    />
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => handleDayChange(idx, 'description', e.target.value)}
                      placeholder="Activities, sightseeing, dining plans..."
                      className="w-full px-2.5 py-1 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDay(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete day"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Notes &amp; Guidelines</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Important trip instructions, booking details, packing list..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 text-xs"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Tour Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
