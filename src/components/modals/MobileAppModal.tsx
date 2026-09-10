import React, { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle2, ShieldCheck, Share2, Globe, ExternalLink, X, Sparkles } from 'lucide-react';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("To install on mobile:\n• On Chrome: Tap the three dots (⋮) menu -> 'Install app' or 'Add to Home screen'.\n• On iOS Safari: Tap the Share button -> 'Add to Home Screen'.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              BuddyFund Mobile App
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                APK &amp; PWA
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Native Android experience &amp; Instant Web App install
            </p>
          </div>
        </div>

        {/* Option 1: Android Native APK */}
        <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white mb-4 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Option 1</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">Recommended for Android</span>
              </div>
              <h3 className="text-base font-bold mt-1 text-white flex items-center gap-1.5">
                Download Android APK
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Direct installation file with native Android performance, offline caching, and push support.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
            <a
              href="https://github.com/karthikeyan-133/buddyfund/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download BuddyFund.apk</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
            </a>

            <a
              href="https://github.com/karthikeyan-133/buddyfund/actions"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              title="View automated GitHub Cloud builds"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Builds</span>
            </a>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Compatible with Android 8.0 (Oreo) through Android 15+</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Directly compiled from this repository via GitHub Actions</span>
            </div>
          </div>
        </div>

        {/* Option 2: Instant PWA Install (Android & iPhone) */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Option 2</span>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">iOS &amp; Android</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Add to Home Screen (Instant PWA)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Install BuddyFund instantly right from your browser without downloading file packages.
          </p>

          <div className="mt-3">
            {isInstalled ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>BuddyFund is already installed on this device!</span>
              </div>
            ) : (
              <button
                onClick={handleInstallPWA}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{deferredPrompt ? 'Install App to Home Screen' : 'How to Add to Home Screen'}</span>
              </button>
            )}
          </div>

          <div className="mt-2.5 text-[11px] text-slate-500 space-y-1">
            <p><strong>iOS / Safari:</strong> Tap the Share icon <span className="text-slate-700 font-mono">⎋</span> and select <strong>"Add to Home Screen"</strong>.</p>
            <p><strong>Android / Chrome:</strong> Tap <span className="text-slate-700 font-mono">⋮</span> menu and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
          </div>
        </div>

        {/* Option 3: Cloud Web App */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-900 block">Vercel Web Access</span>
              <span className="text-[11px] text-emerald-700">Access everywhere from any desktop, tablet, or phone</span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-1 rounded-lg border border-emerald-200 shadow-2xs">
            Live
          </span>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
