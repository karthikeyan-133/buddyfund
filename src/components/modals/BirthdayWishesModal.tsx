import React from 'react';
import {
  X,
  Sparkles,
  Gift,
  Heart,
  Share2,
  PartyPopper,
  Crown,
  Cake,
  Stars,
  MessageCircle,
} from 'lucide-react';
import { User, Circle, CircleMember } from '../../types';

interface BirthdayWishesModalProps {
  isOpen: boolean;
  onClose: () => void;
  celebrant: User | CircleMember;
  circle: Circle;
  age?: number;
}

export const BirthdayWishesModal: React.FC<BirthdayWishesModalProps> = ({
  isOpen,
  onClose,
  celebrant,
  circle,
  age,
}) => {
  if (!isOpen) return null;

  const shareText = `🎉 Today is my Birthday! Celebrating with my awesome "${circle.name}" squad on Ithanu_njangal! 🎂✨`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-amber-300 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200 text-center">
        {/* Confetti & Graphic Design Festive Header */}
        <div className="relative bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 p-6 sm:p-8 text-white overflow-hidden">
          {/* Decorative Floating Background Shapes */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-300/30 rounded-full blur-xl" />
          <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-pink-400/30 rounded-full blur-xl" />
          <div className="absolute top-2 left-6 text-2xl animate-bounce">🎈</div>
          <div className="absolute top-8 right-8 text-2xl animate-pulse">✨</div>
          <div className="absolute bottom-4 left-10 text-xl animate-spin">🌟</div>
          <div className="absolute bottom-6 right-6 text-2xl animate-bounce">🎁</div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center text-sm font-bold transition z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Sponsor Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-yellow-200 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Ithanu_njangal Sponsored Birthday Wishes</span>
          </div>

          {/* Celebrant Photo with Crown */}
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 my-2">
            <div className="absolute -top-4 -right-1 z-10 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-lg border-2 border-white animate-bounce">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <img
              src={celebrant.avatarUrl}
              alt={celebrant.name}
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-yellow-300/60"
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-['Space_Grotesk'] tracking-tight text-white drop-shadow-md mt-2">
            HAPPY BIRTHDAY, {celebrant.name.toUpperCase()}! 🎂
          </h2>

          <p className="text-xs sm:text-sm text-yellow-100 font-medium mt-1">
            {age ? `Cheers to ${age} wonderful years! ` : ''}Your {circle.name} Squad is celebrating YOU today!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Personalized Message Card */}
          <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-purple-50 border border-amber-200/80 rounded-2xl p-4 text-slate-800 text-xs sm:text-sm leading-relaxed text-center shadow-xs">
            <p className="font-semibold text-slate-900 mb-1 flex items-center justify-center gap-1.5">
              <PartyPopper className="w-4 h-4 text-rose-500" />
              <span>A Special Wish from Ithanu_njangal & Friends</span>
            </p>
            <p className="text-slate-600">
              May your special day bring you immense joy, great company, prosperity, and countless unforgettable moments with your favorite circle! 🌟
            </p>
          </div>

          {/* Ithanu_njangal Sponsored Perks */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>Ithanu_njangal Birthday Perks for {celebrant.name}</span>
            </div>
            <ul className="text-[11px] sm:text-xs text-slate-600 space-y-1.5 pl-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span><strong>Squad VIP Badge:</strong> Prominently highlighted across the circle dashboard today!</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span><strong>Birthday Treat Alert:</strong> Your squad buddies have been notified to send their wishes!</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span><strong>Zero-Fee Group Ledger:</strong> Sponsored ledger & savings tracking by Ithanu_njangal!</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share on WhatsApp 📲</span>
            </a>
            <button
              onClick={onClose}
              className="w-full sm:flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
            >
              <Cake className="w-4 h-4" />
              <span>Thank You! Celebrate 🎉</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
