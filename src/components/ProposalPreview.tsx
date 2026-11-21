'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BrandId,
  CalculationResult,
  CalculatorState,
  MasterDatabase,
} from '@/types/trip';
import {
  Printer,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Receipt,
} from 'lucide-react';
import ProposalDocumentPages from './ProposalDocumentPages';

interface ProposalPreviewProps {
  brand: BrandId;
  state: CalculatorState;
  calc: CalculationResult;
  db: MasterDatabase;
  includeRabInPdf: boolean;
  onToggleIncludeRab: (val: boolean) => void;
  onPrintPdf: () => void;
}

const ALL_SLIDE_TITLES = [
  { page: 1, short: '1. Cover', full: 'Sampul & Ringkasan Eksekutif' },
  { page: 2, short: '2. Itinerary', full: 'Rencana Rute & Destinasi' },
  { page: 3, short: '3. Fasilitas', full: 'Manifest & Include/Exclude' },
  { page: 4, short: '4. Harga', full: 'Penawaran Harga & Reservasi' },
  { page: 5, short: '5. RAB HPP', full: 'Rincian Anggaran Biaya Pokok (RAB HPP)' },
];

export default function ProposalPreview({
  brand,
  state,
  calc,
  db,
  includeRabInPdf,
  onToggleIncludeRab,
  onPrintPdf,
}: ProposalPreviewProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scaleMode, setScaleMode] = useState<'fit' | 'medium' | 'full'>('fit');

  const isNabila = brand === 'nabila';
  const totalPages = includeRabInPdf ? 5 : 4;
  const slideTitles = includeRabInPdf
    ? ALL_SLIDE_TITLES
    : ALL_SLIDE_TITLES.slice(0, 4);

  const accentGradient = isNabila
    ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-red-600/20'
    : 'bg-gradient-to-r from-orange-500 to-amber-600 shadow-md shadow-orange-600/20';

  const prevPage = useCallback(
    () => setCurrentPage((p) => (p > 1 ? p - 1 : totalPages)),
    [totalPages]
  );
  const nextPage = useCallback(
    () => setCurrentPage((p) => (p < totalPages ? p + 1 : 1)),
    [totalPages]
  );

  // Clamp currentPage if user unchecks includeRabInPdf while viewing page 5
  useEffect(() => {
    if (!includeRabInPdf && currentPage > 4) {
      setCurrentPage(4);
    }
  }, [includeRabInPdf, currentPage]);

  // Keyboard Left/Right arrow navigation & optional URL page param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pParam = Number(params.get('page'));
      if (pParam >= 1 && pParam <= totalPages) {
        setCurrentPage(pParam);
      }
    }
  }, [totalPages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'ArrowRight') nextPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevPage, nextPage]);

  const scaleClass =
    scaleMode === 'fit'
      ? 'max-w-[600px] text-[11px]'
      : scaleMode === 'medium'
      ? 'max-w-[700px] text-xs'
      : 'max-w-[800px] text-xs';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* TOP SLIDE NAVIGATION & ACTION BAR */}
      <div className="no-print px-4 py-2.5 bg-slate-950 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Left: Slide Page Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-slate-900 p-1 rounded-xl border border-slate-800">
          {slideTitles.map((s) => {
            const active = currentPage === s.page;
            return (
              <button
                key={s.page}
                type="button"
                onClick={() => setCurrentPage(s.page)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap flex items-center gap-1 ${
                  active
                    ? `${accentGradient} text-white`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {s.page === 5 && <Receipt className="w-3 h-3" />}
                <span>{s.short}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Include RAB toggle + Prev/Next + Scale + Export PDF */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-[11px] font-bold text-slate-200 cursor-pointer hover:border-slate-500 transition">
            <input
              type="checkbox"
              checked={includeRabInPdf}
              onChange={(e) => onToggleIncludeRab(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-emerald-500"
            />
            <span>Sertakan RAB HPP</span>
          </label>

          <div className="inline-flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              type="button"
              onClick={prevPage}
              className="px-2 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 transition"
              title="Halaman Sebelumnya (Panah Kiri)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Prev</span>
            </button>
            <span className="px-2.5 text-[11px] font-mono font-bold text-white">
              Hal {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={nextPage}
              className="px-2 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 transition"
              title="Halaman Selanjutnya (Panah Kanan)"
            >
              <span className="hidden sm:inline text-[11px]">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fit / Scale Selector */}
          <div className="hidden md:inline-flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setScaleMode('fit')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 transition ${
                scaleMode === 'fit'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ukuran Fit Layar"
            >
              <ZoomOut className="w-3 h-3" />
              <span>Fit</span>
            </button>
            <button
              type="button"
              onClick={() => setScaleMode('medium')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 transition ${
                scaleMode === 'medium'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ukuran Sedang (90%)"
            >
              <Maximize2 className="w-3 h-3" />
              <span>90%</span>
            </button>
            <button
              type="button"
              onClick={() => setScaleMode('full')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 transition ${
                scaleMode === 'full'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ukuran Penuh (100%)"
            >
              <ZoomIn className="w-3 h-3" />
              <span>100%</span>
            </button>
          </div>

          {/* Print / Export PDF Button */}
          <button
            type="button"
            onClick={onPrintPdf}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5 transition cursor-pointer ${accentGradient}`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export / Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* INTERACTIVE SLIDE STAGE (Fitted inside Viewport) */}
      <div
        className="flex-1 overflow-y-auto bg-slate-200/70 p-3 sm:p-5 relative flex flex-col items-center justify-between"
        role="region"
        aria-label="Preview Slide Dokumen Proposal A4"
        tabIndex={0}
      >
        {/* Floating Left Slide Button */}
        <button
          type="button"
          onClick={prevPage}
          className="no-print hidden sm:flex fixed lg:absolute left-4 top-1/2 -translate-y-1/2 z-20 px-3 py-2.5 rounded-2xl bg-slate-950/90 hover:bg-slate-900 text-white border border-slate-700/80 shadow-xl items-center gap-1.5 text-xs font-bold transition hover:scale-105 cursor-pointer"
          title="Slide ke Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xl:inline">Prev</span>
        </button>

        {/* Floating Right Slide Button */}
        <button
          type="button"
          onClick={nextPage}
          className="no-print hidden sm:flex fixed lg:absolute right-4 top-1/2 -translate-y-1/2 z-20 px-3 py-2.5 rounded-2xl bg-slate-950/90 hover:bg-slate-900 text-white border border-slate-700/80 shadow-xl items-center gap-1.5 text-xs font-bold transition hover:scale-105 cursor-pointer"
          title="Slide ke Halaman Selanjutnya"
        >
          <span className="hidden xl:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* On-Screen Slide Preview Container */}
        <div className={`w-full ${scaleClass} mx-auto my-auto`}>
          <ProposalDocumentPages
            brand={brand}
            state={state}
            calc={calc}
            db={db}
            includeRab={includeRabInPdf}
            mode="preview"
            currentPage={currentPage}
          />
        </div>
      </div>

      {/* Pinned Bottom Slide Navigation Bar */}
      <div className="no-print bg-slate-950 text-white px-4 py-2 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
        <button
          type="button"
          onClick={prevPage}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Halaman Sebelumnya</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-[11px] text-slate-400 font-semibold mr-1">
            Slide Halaman:
          </span>
          {slideTitles.map((s) => (
            <button
              key={s.page}
              type="button"
              onClick={() => setCurrentPage(s.page)}
              className={`w-7 h-7 rounded-lg text-xs font-mono font-black transition cursor-pointer ${
                currentPage === s.page
                  ? `${accentGradient} text-white`
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {s.page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={nextPage}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer ${accentGradient}`}
        >
          <span>Halaman Selanjutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
