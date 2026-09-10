import React, { useState } from 'react';
import { Users, Sparkles, Calendar, DollarSign, Camera, Upload, UserCheck } from 'lucide-react';

const DEFAULT_ADMIN_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    contributionAmount: number;
    contributionFrequency: 'weekly' | 'monthly';
    contributionDay: string;
    adminSecretCode?: string;
    adminName?: string;
    adminPhotoUrl?: string;
  }) => void;
  defaultAdminName?: string;
  defaultAdminPhotoUrl?: string;
}

export const CreateCircleModal: React.FC<CreateCircleModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  defaultAdminName,
  defaultAdminPhotoUrl,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(500);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [day, setDay] = useState('Sunday');
  const [secretCode, setSecretCode] = useState('');
  const [adminName, setAdminName] = useState(defaultAdminName || '');
  const [adminPhotoUrl, setAdminPhotoUrl] = useState(defaultAdminPhotoUrl || DEFAULT_ADMIN_AVATAR);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [customPhotoInput, setCustomPhotoInput] = useState('');

  const handleAdminPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAdminPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onCreate({
      name,
      description,
      contributionAmount: Number(amount),
      contributionFrequency: frequency,
      contributionDay: day,
      adminSecretCode: secretCode || 'ADMIN2026',
      adminName: adminName.trim() || undefined,
      adminPhotoUrl: adminPhotoUrl || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-cute" style={{ fontFamily: "'Comfortaa', 'Fredoka', 'Quicksand', cursive, sans-serif" }}>Create New Circle in Ithanu_njangal</h3>
              <p className="text-xs text-slate-500 font-aesthetic">Private savings, tour planner, and peer ledger</p>
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
            <label className="block text-slate-700 font-medium mb-1">Circle Name</label>
            <input
              type="text"
              placeholder="e.g. Weekend Squad, College Gang, Euro Trip 2028"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Purpose / Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Weekly savings for our annual vacation and weekend outings."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Contribution (₹)</label>
              <input
                type="number"
                min={50}
                step={50}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Collection Day</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              <option value="Sunday">Sunday</option>
              <option value="Saturday">Saturday</option>
              <option value="Friday">Friday</option>
              <option value="1st of Month">1st of Month</option>
            </select>
          </div>

          {/* Circle Admin Profile (Name & Photo) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Circle Admin Profile</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Your Admin Identity</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group flex-shrink-0">
                <img
                  src={adminPhotoUrl}
                  alt="Admin Preview"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shadow-sm"
                />
                <label
                  htmlFor="modal-admin-photo-upload"
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow transition"
                  title="Upload photo"
                >
                  <Camera className="w-3 h-3" />
                </label>
                <input
                  id="modal-admin-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAdminPhotoUpload}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">Admin Name</label>
                <input
                  type="text"
                  placeholder="e.g. Karthik, Alex"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                <span>Admin Photo Option:</span>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="modal-admin-photo-btn"
                    className="text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1 font-medium"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Photo</span>
                  </label>
                  <input
                    id="modal-admin-photo-btn"
                    type="file"
                    accept="image/*"
                    onChange={handleAdminPhotoUpload}
                    className="hidden"
                  />
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                    className="text-slate-500 hover:text-slate-800 font-medium"
                  >
                    {showCustomUrlInput ? 'Hide URL' : 'Image URL'}
                  </button>
                </div>
              </div>

              {showCustomUrlInput && (
                <div className="flex items-center gap-1.5 mb-2">
                  <input
                    type="url"
                    placeholder="Paste image URL..."
                    value={customPhotoInput}
                    onChange={(e) => setCustomPhotoInput(e.target.value)}
                    className="flex-1 px-2.5 py-1 border border-slate-200 rounded-lg text-slate-800 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customPhotoInput.trim()) {
                        setAdminPhotoUrl(customPhotoInput.trim());
                        setShowCustomUrlInput(false);
                      }
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Set
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 font-medium">Admin Secret Code</label>
              <span className="text-[11px] text-emerald-600 font-medium">Used for Admin sign-in</span>
            </div>
            <input
              type="text"
              placeholder="e.g. SQUAD2026"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold tracking-wider"
              required
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              The system will automatically generate a 12-week recurring contribution schedule and double-entry ledger book upon creation.
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
              id="confirm-create-circle-btn"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm"
            >
              Create Circle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
