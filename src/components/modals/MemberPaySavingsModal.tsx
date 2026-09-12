import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Info,
  Send,
} from 'lucide-react';
import { Circle, CircleMember, ContributionRecord, User } from '../../types';

interface MemberPaySavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  circle: Circle;
  record: ContributionRecord;
  currentUser: User;
  adminMember?: CircleMember;
  onSubmitPayment: (data: {
    recordId: string;
    userId: string;
    amount: number;
    paymentMethod: 'UPI' | 'Cash' | 'Bank Transfer';
    referenceNote: string;
    date: string;
  }) => void;
}

export const MemberPaySavingsModal: React.FC<MemberPaySavingsModalProps> = ({
  isOpen,
  onClose,
  circle,
  record,
  currentUser,
  adminMember,
  onSubmitPayment,
}) => {
  const [method, setMethod] = useState<'UPI' | 'Cash' | 'Bank Transfer'>('UPI');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [userNote, setUserNote] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currency = circle.currencySymbol || '₹';
  const adminName = circle.adminName || adminMember?.name || 'Circle Admin';
  const adminPhone = circle.adminPhone || adminMember?.phone || '';
  
  // Resolve UPI ID: circle.adminUpiId or derived from phone or clean circle name
  const rawUpi =
    circle.adminUpiId ||
    (adminPhone ? `${adminPhone.replace(/[^0-9]/g, '')}@upi` : `${circle.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`);
  const adminUpiId = rawUpi.trim();

  // Standard UPI URI scheme
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(adminUpiId)}&pn=${encodeURIComponent(
    adminName
  )}&am=${record.amount}&cu=INR&tn=${encodeURIComponent(`${circle.name} Weekly Savings`)}`;

  // Public QR code service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayUrl)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(adminUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const combinedRef = reference.trim()
      ? `${reference.trim()}${userNote.trim() ? ` • ${userNote.trim()}` : ''}`
      : userNote.trim() || `${method} payment claimed on ${date}`;

    onSubmitPayment({
      recordId: record.id,
      userId: record.userId || currentUser.id,
      amount: record.amount,
      paymentMethod: method,
      referenceNote: combinedRef,
      date,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Mobile Pull Drag Bar */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1">
              <CreditCard className="w-3.5 h-3.5" />
              Weekly Savings Contribution
            </div>
            <h3 className="font-bold text-slate-900 text-lg font-['Space_Grotesk']">
              Pay {currency}{record.amount.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500">
              {circle.name} • Due: {record.dueDate || record.weekLabel || 'Current Cycle'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center text-sm font-bold transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount & Admin Details Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
              Amount Due
            </span>
            <span className="text-[11px] bg-white/20 text-emerald-100 px-2 py-0.5 rounded-md font-medium">
              Verified Circle Due
            </span>
          </div>

          <div className="text-3xl font-extrabold font-mono tracking-tight">
            {currency}{record.amount.toLocaleString()}
          </div>

          {/* Admin Beneficiary Info */}
          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
            <div>
              <span className="text-emerald-200 text-[11px] block">Pay To (Circle Admin)</span>
              <span className="font-bold text-white text-sm">{adminName}</span>
              {adminPhone && (
                <span className="text-[11px] text-emerald-200 block">{adminPhone}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              {showQr ? 'Hide QR' : 'Show QR'}
            </button>
          </div>
        </div>

        {/* UPI Details & Deep Link Box */}
        {showQr && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-3 text-center animate-in zoom-in-95 duration-150">
            <span className="text-xs font-semibold text-slate-700">
              Scan with any UPI App (GPay, PhonePe, Paytm)
            </span>
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-block">
              <img
                src={qrCodeUrl}
                alt="UPI Payment QR Code"
                className="w-40 h-40 object-contain rounded-lg"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Instant scan &amp; transfer {currency}{record.amount}
            </p>
          </div>
        )}

        {/* UPI ID Quick Copy & Launch Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Admin UPI ID:</span>
            <div className="flex items-center gap-1.5">
              <code className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                {adminUpiId}
              </code>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="p-1.5 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded border border-slate-200 transition"
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <a
            href={upiPayUrl}
            className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5 border border-emerald-200"
          >
            <span>Tap to Pay with UPI App (GPay / PhonePe / Paytm)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5 text-xs">
              How did you make this payment?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['UPI', 'Cash', 'Bank Transfer'] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`py-2 px-2 text-center rounded-xl border text-xs font-semibold transition ${
                    method === m
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m === 'Cash' ? '💵 Cash' : m === 'UPI' ? '⚡ UPI' : '🏦 Bank Transfer'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-xs">
                Payment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-xs">
                {method === 'UPI'
                  ? 'UTR / UPI Ref Number'
                  : method === 'Bank Transfer'
                  ? 'Transfer Reference / IMPS'
                  : 'Cash Handover Details'}
              </label>
              <input
                type="text"
                placeholder={
                  method === 'UPI'
                    ? '12-digit UPI UTR (e.g. 4238...)'
                    : method === 'Bank Transfer'
                    ? 'Ref / IMPS Number'
                    : 'Handed directly to admin'
                }
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required={method === 'UPI' || method === 'Bank Transfer'}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 text-xs">
              Note to Admin (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Sent from Google Pay account"
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Verification Notice */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Admin Verification Notice:</span> Once submitted, this payment will be marked as <strong className="text-amber-800">Pending Confirmation</strong>. Circle Admin <span className="font-semibold">{adminName}</span> will receive a confirmation request message to check if payment is received. Only when the admin clicks <span className="font-semibold text-emerald-800">"Payment Received (Get)"</span> will the circle fund update.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium text-xs sm:text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-payment-claim-btn"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center gap-2 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Payment for Confirmation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
