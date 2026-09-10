import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  Camera,
  Upload,
  UserCheck,
  Key,
  Eye,
  EyeOff,
  Check,
  X,
  Edit3,
} from 'lucide-react';
import { Circle } from '../../types';

interface EditCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  circle: Circle | null;
  onSave: (updatedCircle: Circle) => void;
}

export const EditCircleModal: React.FC<EditCircleModalProps> = ({
  isOpen,
  onClose,
  circle,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(500);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [day, setDay] = useState('Sunday');
  const [expectedMembers, setExpectedMembers] = useState(10);
  const [secretCode, setSecretCode] = useState('ADMIN2026');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminPhotoUrl, setAdminPhotoUrl] = useState('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [customPhotoInput, setCustomPhotoInput] = useState('');

  // Sync state whenever circle changes or modal opens
  useEffect(() => {
    if (circle) {
      setName(circle.name || '');
      setDescription(circle.description || '');
      setAmount(circle.contributionAmount || 500);
      setFrequency(circle.contributionFrequency || 'weekly');
      setDay(circle.contributionDay || 'Sunday');
      setExpectedMembers(circle.expectedMembers || 10);
      setSecretCode(circle.adminSecretCode || 'ADMIN2026');
      setAdminName(circle.adminName || '');
      setAdminPhotoUrl(circle.adminPhotoUrl || '');
      setShowCustomUrlInput(false);
      setCustomPhotoInput('');
    }
  }, [circle, isOpen]);

  if (!isOpen || !circle) return null;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated: Circle = {
      ...circle,
      name: name.trim(),
      description: description.trim(),
      contributionAmount: Number(amount),
      contributionFrequency: frequency,
      contributionDay: day,
      expectedMembers: Number(expectedMembers),
      adminSecretCode: secretCode.trim() || circle.adminSecretCode || 'ADMIN2026',
      adminName: adminName.trim() || circle.adminName,
      adminPhotoUrl: adminPhotoUrl.trim() || circle.adminPhotoUrl,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Edit Circle Settings</h3>
              <p className="text-xs text-slate-500">Update contribution rules and circle preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Circle Name */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">Circle Name</label>
            <input
              type="text"
              placeholder="e.g. Weekend Squad, College Gang"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          {/* Purpose / Description */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">Purpose / Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Weekly savings for our annual vacation and weekend outings."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Contribution Amount & Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Contribution (₹)</label>
              <input
                type="number"
                min={50}
                step={50}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Collection Day & Expected Members */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Collection Day</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
              >
                <option value="Sunday">Sunday</option>
                <option value="Saturday">Saturday</option>
                <option value="Friday">Friday</option>
                <option value="Monday">Monday</option>
                <option value="1st of Month">1st of Month</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Expected Members</label>
              <input
                type="number"
                min={2}
                max={100}
                value={expectedMembers}
                onChange={(e) => setExpectedMembers(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Circle Admin Profile (Name & Photo) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Circle Admin Profile</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Administrator Identity</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group flex-shrink-0">
                {adminPhotoUrl ? (
                  <img
                    src={adminPhotoUrl}
                    alt="Admin Preview"
                    className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base border-2 border-emerald-500">
                    {adminName ? adminName.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
                <label
                  htmlFor="edit-modal-admin-photo-upload"
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow transition"
                  title="Upload photo"
                >
                  <Camera className="w-3 h-3" />
                </label>
                <input
                  id="edit-modal-admin-photo-upload"
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
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                <span>Admin Photo Option:</span>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="edit-modal-admin-photo-btn"
                    className="text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1 font-medium"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Photo</span>
                  </label>
                  <input
                    id="edit-modal-admin-photo-btn"
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

          {/* Admin Secret Code */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">Circle Admin Secret Code</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showSecretCode ? 'text' : 'password'}
                placeholder="Admin Secret Code"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowSecretCode(!showSecretCode)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                title={showSecretCode ? 'Hide secret code' : 'Show secret code'}
              >
                {showSecretCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Used by the administrator to authenticate and manage this circle.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 text-xs sm:text-sm"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
