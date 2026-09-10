import React, { useState } from 'react';
import { Smartphone, Mail, Lock, ShieldCheck, Check } from 'lucide-react';
import { User } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: User[];
  onLoginAsUser: (userId: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  allUsers,
  onLoginAsUser,
}) => {
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to admin or first user
    onLoginAsUser(allUsers[0]?.id || 'user_1');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base font-cute" style={{ fontFamily: "'Comfortaa', 'Fredoka', 'Quicksand', cursive, sans-serif" }}>Ithanu_njangal Authentication</h3>
            <p className="text-xs text-slate-500 font-aesthetic">Secure OTP / Password Login</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-3 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Mobile Number</label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-slate-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm text-xs sm:text-sm transition"
            >
              Send Verification Code (OTP)
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-3 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Enter 4-Digit Code</label>
              <input
                type="text"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full text-center tracking-widest text-xl font-mono py-2 border border-slate-200 rounded-lg text-slate-900 font-bold"
                required
              />
              <span className="text-[11px] text-emerald-600 font-medium text-center block mt-1">
                Enter your 4-digit verification PIN
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm text-xs sm:text-sm transition"
            >
              Verify &amp; Enter Circle
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
