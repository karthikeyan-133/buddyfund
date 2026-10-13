import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Info,
  Send,
  Calendar,
  QrCode,
  Copy,
  Check,
  Zap,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrLoadFailed, setQrLoadFailed] = useState(false);

  if (!isOpen) return null;

  const currency = circle.currencySymbol || '₹';
  const adminName = circle.adminName || adminMember?.name || 'Circle Admin';

  const targetUpiId =
    circle.adminUpiId?.trim() ||
    (adminMember?.phone ? `${adminMember.phone.replace(/[^0-9]/g, '')}@upi` : '') ||
    'karthik@upi';

  const payeeName = circle.adminName || adminMember?.name || 'Circle Admin';
  const savingsNote = `${circle.name} Weekly Savings - ${record.userName || currentUser.name || 'Member'}`;
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(targetUpiId)}&pn=${encodeURIComponent(payeeName)}&am=${record.amount}&cu=INR&tn=${encodeURIComponent(savingsNote)}`;
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPayUrl)}&margin=8&color=064e3b`;
  const displayQrUrl = circle.adminQrCodeUrl || dynamicQrUrl;

  const handleCopyUpi = () => {
    if (!targetUpiId) return;
    try {
      navigator.clipboard.writeText(targetUpiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
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
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1">
              <CreditCard className="w-3.5 h-3.5" />
              Weekly Savings Payment
            </div>
            <h3 className="font-bold text-slate-900 text-lg font-['Space_Grotesk']">
              Submit Savings Payment
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

        {/* Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Contribution Amount
            </span>
            <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-0.5">
              {currency}{record.amount.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Circle Admin</span>
            <span className="font-semibold text-slate-800 text-xs">{adminName}</span>
          </div>
        </div>

        {/* Payment Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5 text-xs">
              Payment Method
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

          {/* Dynamic UPI & QR Code Card for Online Payment */}
          {method === 'UPI' && (
            <div className="bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/80 border-2 border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900 font-['Space_Grotesk']">
                    Online UPI Payment
                  </span>
                </div>
                <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-mono">
                  {currency}{record.amount}
                </span>
              </div>

              {/* QR Code and Quick Pay Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                {!qrLoadFailed ? (
                  <div className="relative group p-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex-shrink-0">
                    <img
                      src={displayQrUrl}
                      alt={`UPI QR Code for ${currency}${record.amount}`}
                      className="w-32 h-32 sm:w-36 sm:h-36 object-contain rounded-lg"
                      onError={() => setQrLoadFailed(true)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/40 rounded-lg transition backdrop-blur-[1px]">
                      <span className="text-[10px] text-white font-bold bg-slate-900/80 px-2 py-1 rounded-md">
                        Scan with any UPI App
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-xl p-2 text-center flex-shrink-0">
                    <QrCode className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-500 font-medium">Use UPI ID below to pay</span>
                  </div>
                )}

                <div className="flex-1 text-center sm:text-left space-y-2.5 w-full">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Supported UPI Apps
                    </span>
                    <div className="text-xs font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                      <span className="text-emerald-700">Google Pay</span>
                      <span>•</span>
                      <span className="text-indigo-700">PhonePe</span>
                      <span>•</span>
                      <span className="text-sky-700">Paytm</span>
                      <span>•</span>
                      <span className="text-amber-700">BHIM</span>
                    </div>
                  </div>

                  {/* Admin UPI ID Box with 1-Click Copy */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center justify-between gap-2">
                    <div className="truncate text-left flex-1 min-w-0">
                      <span className="text-[9px] text-slate-400 font-semibold block uppercase">
                        Admin UPI ID
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800 select-all truncate block">
                        {targetUpiId}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="flex-shrink-0 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-md text-[11px] font-semibold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-white" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-white" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 1-Click Mobile App Direct Link */}
                  <a
                    href={upiPayUrl}
                    className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Pay via UPI App ({currency}{record.amount})</span>
                  </a>
                </div>
              </div>
            </div>
          )}

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
                  ? 'UPI / UTR Ref (Optional)'
                  : method === 'Bank Transfer'
                  ? 'Transfer Reference (Optional)'
                  : 'Handover Details (Optional)'}
              </label>
              <input
                type="text"
                placeholder={
                  method === 'UPI'
                    ? 'e.g. UPI Ref / UTR (Optional)'
                    : method === 'Bank Transfer'
                    ? 'e.g. IMPS / Ref (Optional)'
                    : 'Handed to admin (Optional)'
                }
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 text-xs">
              Note for Admin (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid from Google Pay / Cash given"
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Admin Confirmation Info Note */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Confirmation Flow:</span> Submitting this will mark your payment as <strong className="text-amber-800">Pending Confirmation</strong>. Circle Admin <span className="font-semibold">{adminName}</span> will receive a message to check if payment was received. Only when the admin clicks <span className="font-semibold text-emerald-800">"Payment Received (Get)"</span> will the status update to Paid.
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
