'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: ErrorProps) {
  const [clearing, setClearing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('[Asthara Client Error Boundary Caught]:', error);
  }, [error]);

  const handleHardRefreshAndClearCache = async () => {
    setClearing(true);
    try {
      // 1. Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }

      // 2. Clear all CacheStorage
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        for (const key of cacheKeys) {
          await caches.delete(key);
        }
      }

      // 3. Clear session storage flags
      try {
        sessionStorage.clear();
      } catch {}

      // 4. Force hard reload from server
      window.location.href = '/';
    } catch (err) {
      console.warn('Cache clear error, reloading directly:', err);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-red-600 selection:text-white">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-red-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-orange-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px]" />

      <main className="relative z-10 max-w-lg w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 p-0.5 shadow-lg shadow-red-600/25">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-400" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistem Otomasi PT ASTHARA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Pembaruan Versi Terdeteksi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Browser Anda memuat cache aset versi sebelumnya saat aplikasi diperbarui ke versi terbaru. Silakan tekan tombol di bawah untuk menyinkronkan kembali aset aplikasi secara bersih.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleHardRefreshAndClearCache}
            disabled={clearing}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${clearing ? 'animate-spin' : ''}`} />
            <span>{clearing ? 'Menyinkronkan...' : 'Bersihkan Cache & Muat Ulang'}</span>
          </button>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        </div>

        {/* Expandable Technical Details */}
        <div className="pt-2 border-t border-slate-800/80 text-left">
          <button
            type="button"
            onClick={() => setShowDetails((p) => !p)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-slate-400 transition py-1"
          >
            <span>Detail Teknis Error</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDetails && (
            <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-red-400 overflow-x-auto max-h-36 whitespace-pre-wrap leading-tight">
              {error.message || 'Client runtime exception'}
              {error.digest && `\nDigest: ${error.digest}`}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
