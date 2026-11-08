'use client';

import React from 'react';
import { BrandId } from '@/types/trip';
import { BRANDS } from '@/lib/brands';
import {
  Building2,
  ArrowRight,
  Database,
  ShieldCheck,
  Sparkles,
  FileSpreadsheet,
  Printer,
  Bus,
} from 'lucide-react';

interface EntitySelectorScreenProps {
  onSelectBrand: (brand: BrandId) => void;
}

export default function EntitySelectorScreen({
  onSelectBrand,
}: EntitySelectorScreenProps) {
  const brandList: BrandId[] = ['nabila', 'piknik'];

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col justify-between p-4 sm:p-8">
      {/* Ambient Modern Mesh Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-red-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-orange-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Executive Header */}
      <header className="relative z-10 max-w-5xl w-full mx-auto pt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-red-600/25">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-white block">
              PT ASTHARA ASIA GROUP
            </span>
            <span className="text-[11px] text-slate-400 block">
              Enterprise Tour Costing & Logistics Suite • Nabila Trip & Piknik Enthusiast
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-emerald-400 shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SQLite Monolith Engine Active</span>
        </div>
      </header>

      {/* Center Launchpad */}
      <main className="relative z-10 max-w-5xl w-full mx-auto my-auto py-8 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Entity Architecture • Single Unified Database</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Pilih Entitas Operasional
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Setiap entitas memiliki skema tarif kontrak mandiri, histori penawaran terpisah, serta kop & rekening resmi pada dokumen Proposal PDF.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {brandList.map((bId) => {
            const b = BRANDS[bId];
            const isNabila = bId === 'nabila';

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBrand(b.id)}
                className={`group relative text-left rounded-3xl p-6 sm:p-7 bg-slate-900/80 backdrop-blur-xl border transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1 ${
                  isNabila
                    ? 'border-slate-800 hover:border-red-500/80 hover:shadow-2xl hover:shadow-red-600/20'
                    : 'border-slate-800 hover:border-orange-500/80 hover:shadow-2xl hover:shadow-orange-500/20'
                }`}
              >
                {/* Top Decorative Gradient Glow inside Card */}
                <div
                  className={`pointer-events-none absolute -top-24 -right-24 w-52 h-52 rounded-full blur-3xl transition-opacity opacity-30 group-hover:opacity-60 ${
                    isNabila ? 'bg-red-600' : 'bg-orange-500'
                  }`}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 p-2.5 flex items-center justify-center border border-slate-800 shrink-0 shadow-xl ring-1 ring-white/10">
                      <img
                        src={b.logoUrl}
                        alt={b.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                        isNabila
                          ? 'bg-red-500/15 text-red-300 border-red-500/30'
                          : 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isNabila ? 'bg-red-400' : 'bg-orange-400'
                        }`}
                      />
                      {b.badgeText}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {b.name}
                  </h2>
                  <p
                    className={`text-xs font-bold mt-0.5 ${
                      isNabila ? 'text-red-400' : 'text-orange-400'
                    }`}
                  >
                    {b.legalEntity}
                  </p>
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    {b.tagline}
                  </p>

                  {/* Feature & Info Pills */}
                  <div className="mt-5 pt-4 border-t border-slate-800/90 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                        Skema Database:
                      </span>
                      <span className="font-mono font-bold text-slate-200">
                        Tarif Mandiri {b.shortName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Bus className="w-3.5 h-3.5 text-slate-400" />
                        Katalog Master:
                      </span>
                      <span className="font-mono text-slate-300">
                        21 Wisata • 7 Armada • 6 Hotel
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Printer className="w-3.5 h-3.5 text-slate-400" />
                        Rekening Resmi:
                      </span>
                      <span className="font-mono text-slate-300">
                        {b.bankName} ({b.bankAccountNumber})
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`relative z-10 mt-6 w-full py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition text-white shadow-lg ${
                    isNabila
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 group-hover:from-red-500 group-hover:to-rose-500 shadow-red-600/25'
                      : 'bg-gradient-to-r from-orange-600 to-amber-600 group-hover:from-orange-500 group-hover:to-amber-500 shadow-orange-600/25'
                  }`}
                >
                  <span>Masuk Workspace {b.name}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 max-w-5xl w-full mx-auto pb-2 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <Database className="w-3.5 h-3.5 text-slate-400" />
        <span>
          Database SQLite terpusat — Perubahan harga disimpan spesifik untuk entitas yang sedang aktif.
        </span>
      </footer>
    </div>
  );
}
