'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaRegistration() {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Service Worker Registration & Version Sync
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSw = async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          console.log('[PWA] Service Worker registered with scope:', reg.scope);

          // Force check for sw updates
          reg.update().catch(() => {});

          reg.addEventListener('updatefound', () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (
                  installingWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  console.log('[PWA] New version available, triggering skipWaiting');
                  installingWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });
        } catch (err) {
          console.warn('[PWA] Service Worker registration failed:', err);
        }
      };

      if (
        document.readyState === 'complete' ||
        document.readyState === 'interactive'
      ) {
        registerSw();
      } else {
        window.addEventListener('load', registerSw);
      }
    }

    // 2. Safe check if already running in standalone mode (installed)
    try {
      const isStandaloneMedia =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(display-mode: standalone)').matches;

      const isIosStandalone =
        typeof window !== 'undefined' &&
        Boolean(
          (window.navigator as unknown as { standalone?: boolean })?.standalone
        );

      if (isStandaloneMedia || isIosStandalone) {
        setIsInstalled(true);
        return;
      }
    } catch {
      // Fallback: proceed normally
    }

    // 3. Listen for browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      try {
        const dismissed = sessionStorage.getItem('asthara_pwa_dismissed');
        if (!dismissed) {
          setShowInstallBanner(true);
        }
      } catch {
        setShowInstallBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      console.log('[PWA] App successfully installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setShowInstallBanner(false);
      }
    } catch (err) {
      console.warn('[PWA] Install prompt error:', err);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    try {
      sessionStorage.setItem('asthara_pwa_dismissed', '1');
    } catch {
      // Storage restricted
    }
  };

  if (!mounted || isInstalled || !showInstallBanner) {
    return null;
  }

  return (
    <aside
      aria-label="Install Aplikasi Asthara Trip"
      className="no-print fixed bottom-4 right-4 z-50 max-w-sm bg-slate-950/95 backdrop-blur-md text-white border border-slate-800 rounded-2xl p-3.5 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 p-0.5 shrink-0 shadow-md">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-black text-white truncate">
              Install Aplikasi Asthara
            </h4>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-0.5 rounded transition"
              aria-label="Tutup Banner Install"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
            Pasang di Desktop / HP untuk akses secepat aplikasi native &amp; hemat kuota.
          </p>

          <div className="flex items-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-3 h-3" />
              <span>Install Sekarang</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Nanti
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
