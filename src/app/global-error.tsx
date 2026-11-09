'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalRootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    console.error('[Global Root Layout Error]:', error);
  }, [error]);

  const handleClearCacheAndReload = async () => {
    setClearing(true);
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const k of keys) await caches.delete(k);
      }
    } catch {}
    window.location.href = '/';
  };

  return (
    <html lang="id">
      <body className="bg-slate-950 text-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white">Sinkronisasi Aplikasi</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Terjadi pembaruan aset pada sistem. Silakan tekan tombol di bawah untuk membersihkan cache dan memuat versi terbaru.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={handleClearCacheAndReload}
              disabled={clearing}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white transition flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${clearing ? 'animate-spin' : ''}`} />
              <span>{clearing ? 'Membersihkan...' : 'Bersihkan Cache & Muat Ulang'}</span>
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="w-full py-2 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
