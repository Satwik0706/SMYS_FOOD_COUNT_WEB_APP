import React, { useState, useEffect } from 'react';
import { Smartphone, X, Download } from 'lucide-react';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      return;
    }

    // Check if dismissed previously
    const dismissed = sessionStorage.getItem('smys_pwa_dismissed');
    if (dismissed) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    if (isIosDevice) {
      // Show for iOS after brief delay
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // For Android / Chrome
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('smys_pwa_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-14 left-4 right-4 z-50 max-w-md mx-auto animate-bounce-subtle">
      <div className="p-3 rounded-2xl bg-slate-900/90 text-white backdrop-blur-md shadow-xl border border-slate-700/60 flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <h4 className="font-bold text-[11px] text-orange-200">
              Install SMYS Portal App
            </h4>
            <p className="text-[10px] text-slate-300">
              {isIos
                ? 'Tap Safari Share ⎋ -> "Add to Home Screen"'
                : 'Install for 100% native student experience'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {!isIos && deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-[11px] font-bold text-white transition-all shadow-xs"
            >
              Install
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
