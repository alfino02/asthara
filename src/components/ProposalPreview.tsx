'use client';

import React, { useState, useEffect } from 'react';
import {
  BrandId,
  CalculationResult,
  CalculatorState,
  MasterDatabase,
} from '@/types/trip';
import { BRANDS } from '@/lib/brands';
import { formatRupiah } from '@/lib/calculator';
import {
  Printer,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Globe,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

interface ProposalPreviewProps {
  brand: BrandId;
  state: CalculatorState;
  calc: CalculationResult;
  db: MasterDatabase;
}

const SLIDE_TITLES = [
  { page: 1, short: '1. Cover & Ringkasan', full: 'Sampul & Ringkasan Eksekutif' },
  { page: 2, short: '2. Itinerary Harian', full: 'Rencana Rute & Destinasi' },
  { page: 3, short: '3. Fasilitas Layanan', full: 'Manifest & Include/Exclude' },
  { page: 4, short: '4. Harga & Rekening', full: 'Penawaran Harga & Reservasi' },
];

export default function ProposalPreview({
  brand,
  state,
  calc,
  db,
}: ProposalPreviewProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scaleMode, setScaleMode] = useState<'fit' | 'medium' | 'full'>('fit');

  const b = BRANDS[brand];
  const isNabila = brand === 'nabila';
  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const docNumber = `QUO/${b.shortName}/${new Date().getFullYear()}/${String(
    new Date().getMonth() + 1
  ).padStart(2, '0')}/${String(state.pax).padStart(3, '0')}`;

  const accentBorder = isNabila ? 'border-red-600' : 'border-orange-600';
  const accentBg = isNabila ? 'bg-red-600' : 'bg-orange-600';
  const accentGradient = isNabila
    ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-red-600/20'
    : 'bg-gradient-to-r from-orange-500 to-amber-600 shadow-md shadow-orange-600/20';
  const accentText = isNabila ? 'text-red-600' : 'text-orange-600';
  const accentLightBg = isNabila ? 'bg-red-50' : 'bg-orange-50';

  const prevPage = () => setCurrentPage((p) => (p > 1 ? p - 1 : 4));
  const nextPage = () => setCurrentPage((p) => (p < 4 ? p + 1 : 1));

  // Keyboard Left/Right arrow navigation & optional URL page param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pParam = Number(params.get('page'));
      if (pParam >= 1 && pParam <= 4) {
        setCurrentPage(pParam);
      }
    }

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
  }, []);

  const scaleClass =
    scaleMode === 'fit'
      ? 'max-w-[580px] text-[11px]'
      : scaleMode === 'medium'
      ? 'max-w-[680px] text-xs'
      : 'max-w-[780px] text-xs';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* TOP SLIDE NAVIGATION & ACTION BAR (No Print) */}
      <div className="no-print px-4 py-2.5 bg-slate-950 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Left: 4 Slide Page Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto bg-slate-900 p-1 rounded-xl border border-slate-800">
          {SLIDE_TITLES.map((s) => {
            const active = currentPage === s.page;
            return (
              <button
                key={s.page}
                type="button"
                onClick={() => setCurrentPage(s.page)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                  active
                    ? `${accentGradient} text-white`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {s.short}
              </button>
            );
          })}
        </div>

        {/* Center: Prev / Next Slide Controls + Scale Toggle */}
        <div className="flex items-center gap-2">
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
              Hal {currentPage} / 4
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

          {/* Print / PDF Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold text-white flex items-center gap-1.5 transition cursor-pointer ${accentGradient}`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
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

        {/* Printable Container (Shows active slide on screen; shows all 4 pages in @media print) */}
        <div id="printableQuotation" className={`w-full ${scaleClass} mx-auto my-auto`}>
          {/* ================= PAGE 1: COVER & RINGKASAN EKSEKUTIF ================= */}
          <div
            className={`quotation-page justify-between ${
              currentPage === 1 ? 'flex' : 'hidden'
            }`}
          >
            <div>
              {/* Header Kop Surat */}
              <div
                className={`flex items-center justify-between pb-3.5 border-b-2 ${accentBorder}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-950 p-1.5 flex items-center justify-center shrink-0">
                    <img
                      src={b.logoUrl}
                      alt={b.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-base font-black text-slate-900 tracking-tight uppercase">
                      {b.name}
                    </h1>
                    <p className="text-[11px] font-bold text-slate-600">
                      {b.legalEntity}
                    </p>
                    <p className="text-[10px] text-slate-500">{b.address}</p>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-600 space-y-0.5">
                  <div className="font-mono font-bold text-slate-900 text-xs">
                    {docNumber}
                  </div>
                  <div>Tanggal: {todayStr}</div>
                  <div className="text-slate-400">{b.website}</div>
                </div>
              </div>

              {/* Hero Title Block */}
              <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white space-y-1.5">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${accentBg}`}
                >
                  Proposal Penawaran Perjalanan Wisata
                </span>
                <h2 className="text-lg font-black tracking-tight leading-snug">
                  {state.tripName || 'Program Custom Tour & Gathering Eksklusif'}
                </h2>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Disusun secara khusus oleh tim {b.name} dengan standar
                  pelayanan prima, armada pariwisata terbaik, serta manajemen
                  operasional lapangan terpadu.
                </p>
              </div>

              {/* Grid Parameter Ringkas */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 text-[11px]">
                  <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    Informasi Rombongan
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200/70 gap-2">
                    <span className="text-slate-500">Klien:</span>
                    <span className="font-bold text-slate-900 text-right truncate">
                      {state.tripName}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-500">Total Peserta:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {calc.totalPax} Pax ({calc.regularPax} Reg
                      {calc.vipPax > 0 ? ` + ${calc.vipPax} VIP` : ''})
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Kategori Tamu:</span>
                    <span className="font-semibold text-slate-800">
                      {state.isForeigner ? 'Mancanegara (WNA)' : 'Domestik (WNI)'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 text-[11px]">
                  <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    Spesifikasi Program
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200/70">
                    <span className="text-slate-500">Durasi:</span>
                    <span className="font-bold text-slate-900">
                      {calc.days} Hari{' '}
                      {calc.nights > 0 ? `${calc.nights} Malam` : '(Full Day)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200/70 gap-2">
                    <span className="text-slate-500">Armada:</span>
                    <span className="font-semibold text-slate-900 text-right truncate">
                      {calc.armadaSummaryText}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 gap-2">
                    <span className="text-slate-500">Hotel:</span>
                    <span className="font-semibold text-slate-900 text-right truncate">
                      {calc.hotelSummaryText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Highlight Box Harga */}
              <div
                className={`mt-4 p-3.5 rounded-xl border-2 ${accentBorder} ${accentLightBg}/40 flex items-center justify-between gap-2`}
              >
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                    Investasi Paket Perjalanan
                  </div>
                  <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
                    {formatRupiah(calc.sellingPricePerPax)}{' '}
                    <span className="text-xs font-sans font-semibold text-slate-500">
                      / Pax
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Kuota {calc.totalPax} peserta • All-in sesuai rincian
                    fasilitas
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-semibold">
                    Total Nilai Paket
                  </div>
                  <div className={`text-sm font-black font-mono ${accentText}`}>
                    {formatRupiah(calc.totalRevenue)}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Page 1 */}
            <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>
                {b.name} — {b.legalEntity}
              </span>
              <span className="font-bold text-slate-600">Halaman 1 dari 4</span>
            </div>
          </div>

          {/* ================= PAGE 2: RENCANA PERJALANAN & DESTINASI HARIAN ================= */}
          <div
            className={`quotation-page justify-between ${
              currentPage === 2 ? 'flex' : 'hidden'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Rencana Rute & Destinasi Harian (Itinerary)
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Jadwal kunjungan objek wisata untuk program {calc.days} Hari{' '}
                    {calc.nights > 0 ? `${calc.nights} Malam` : ''}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {docNumber}
                </span>
              </div>

              <div className="mt-3.5 space-y-2.5">
                {Array.from({ length: calc.days }, (_, idx) => idx + 1).map(
                  (d) => {
                    const destList = state.selectedDestByDay[d] || [];
                    const mPlan = state.mealPlanByDay[d];
                    const armadaDay = state.armadaPlanByDay[d];
                    const armadaDesc =
                      state.incTransport && armadaDay?.active
                        ? Object.entries(armadaDay.selected || {})
                            .filter(([, u]) => Number(u) > 0)
                            .map(([k, u]) => `${u}× ${k}`)
                            .join(' + ')
                        : 'Tanpa Armada';

                    return (
                      <div
                        key={d}
                        className="rounded-xl border border-slate-200 overflow-hidden"
                      >
                        <div className="bg-slate-900 text-white px-3 py-1.5 flex items-center justify-between text-[11px]">
                          <span className="font-bold uppercase tracking-wider">
                            Hari ke-{d} Perjalanan
                          </span>
                          <span className="text-slate-300 font-mono text-[10px]">
                            Armada: {armadaDesc}
                          </span>
                        </div>

                        <div className="p-3 bg-white space-y-2 text-[11px]">
                          {destList.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {destList.map((dName, i) => {
                                const dRow = db.destinasi.find(
                                  (x) => x.nama === dName
                                );
                                return (
                                  <div
                                    key={dName + i}
                                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100"
                                  >
                                    <span className="font-bold text-slate-900 truncate">
                                      {i + 1}. {dName}
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded bg-white border border-slate-200 text-[9px] text-slate-500 shrink-0 ml-1">
                                      {dRow?.wilayah || 'Jatim'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-slate-400 italic text-[10px]">
                              Acara bebas / perjalanan transfer / penyesuaian
                              jadwal lapangan.
                            </p>
                          )}

                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                            <span>
                              Konsumsi H{d}:{' '}
                              <b>
                                {state.incMeal && mPlan?.sessions?.length
                                  ? mPlan.sessions
                                      .map((s) => s.toUpperCase())
                                      .join(', ')
                                  : 'Masing-masing'}
                              </b>
                            </span>
                            {d <= calc.nights &&
                              state.incHotel &&
                              state.hotelPlanByNight[d]?.active && (
                                <span>
                                  Hotel:{' '}
                                  <b>{state.hotelPlanByNight[d].hotelNama}</b>
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>
                {b.name} — {b.legalEntity}
              </span>
              <span className="font-bold text-slate-600">Halaman 2 dari 4</span>
            </div>
          </div>

          {/* ================= PAGE 3: FASILITAS INCLUDE & EXCLUDE ================= */}
          <div
            className={`quotation-page justify-between ${
              currentPage === 3 ? 'flex' : 'hidden'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Rincian Fasilitas & Manifest Layanan
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Daftar komponen layanan yang termasuk dalam paket perjalanan
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {docNumber}
                </span>
              </div>

              {/* Tabel Manifest Layanan */}
              <div className="mt-3.5 border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] uppercase">
                      <th className="py-2 px-2.5">Komponen Layanan</th>
                      <th className="py-2 px-2.5">Spesifikasi & Alokasi</th>
                      <th className="py-2 px-2.5 text-center">Kuantitas</th>
                      <th className="py-2 px-2.5">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {calc.manifestItems
                      .filter((m) => m.status !== 'nonaktif')
                      .map((m, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="py-1.5 px-2.5 font-bold text-slate-900">
                            {m.kategori}
                          </td>
                          <td className="py-1.5 px-2.5 text-slate-700">
                            {m.spesifikasi}
                          </td>
                          <td className="py-1.5 px-2.5 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                            {m.jumlahSatuan}
                          </td>
                          <td className="py-1.5 px-2.5 text-slate-500 text-[10px]">
                            {m.keteranganLapangan}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Include vs Exclude */}
              <div className="mt-3.5 grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
                  <div className="font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sudah Termasuk (Include)</span>
                  </div>
                  <ul className="space-y-1 text-slate-700 text-[10px]">
                    {state.incTransport && (
                      <li>
                        • Transportasi pariwisata AC ({calc.armadaSummaryText})
                      </li>
                    )}
                    <li>• Tiket masuk seluruh objek wisata sesuai itinerary</li>
                    {state.incJeep && (
                      <li>• Armada Jeep 4×4 ({calc.jeepSummaryText})</li>
                    )}
                    {state.incHotel && calc.nights > 0 && (
                      <li>
                        • Penginapan {calc.nights} malam ({calc.hotelSummaryText}
                        )
                      </li>
                    )}
                    {state.incMeal && (
                      <li>• Konsumsi makan sesuai jadwal program</li>
                    )}
                    {state.incSnack && (
                      <li>• Snack box & air mineral perjalanan</li>
                    )}
                    {state.incTl && (
                      <li>
                        • Pendampingan Tour Leader ({calc.tlCount} orang ×{' '}
                        {calc.tlDays} hari)
                      </li>
                    )}
                  </ul>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Belum Termasuk (Exclude)</span>
                  </div>
                  <ul className="space-y-1 text-slate-600 text-[10px]">
                    <li>
                      • Tiket pesawat / kereta menuju & dari kota penjemputan
                    </li>
                    <li>
                      • Pengeluaran pribadi (laundry, minibar, oleh-oleh)
                    </li>
                    <li>• Wahana opsional di luar tiket terusan</li>
                    <li>• Tipping sukarela kru lapangan</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>
                {b.name} — {b.legalEntity}
              </span>
              <span className="font-bold text-slate-600">Halaman 3 dari 4</span>
            </div>
          </div>

          {/* ================= PAGE 4: RINCIAN HARGA, SYARAT & REKENING RESMI ================= */}
          <div
            className={`quotation-page justify-between ${
              currentPage === 4 ? 'flex' : 'hidden'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Rincian Penawaran Harga & Ketentuan Reservasi
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Rekapitulasi biaya investasi dan prosedur konfirmasi
                    pemesanan
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {docNumber}
                </span>
              </div>

              {/* Tabel Harga Resmi */}
              <div className="mt-3.5 border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[10px] uppercase">
                      <th className="p-2.5">Deskripsi Paket</th>
                      <th className="p-2.5 text-center">Peserta</th>
                      <th className="p-2.5 text-right">Harga / Pax</th>
                      <th className="p-2.5 text-right">Total Investasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-white">
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900">
                          {state.tripName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Program {calc.days} Hari{' '}
                          {calc.nights > 0 ? `${calc.nights} Malam` : ''} •{' '}
                          {calc.armadaSummaryText}
                        </div>
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                        {calc.totalPax} Pax
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah(calc.sellingPricePerPax)}
                      </td>
                      <td
                        className={`p-2.5 text-right font-mono font-black text-xs whitespace-nowrap ${accentText}`}
                      >
                        {formatRupiah(calc.totalRevenue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terms & Conditions + Bank Account */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Ketentuan Pembayaran
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[10px]">
                    <li>
                      Down Payment (DP) <b>30% ({formatRupiah(calc.totalRevenue * 0.3)})</b>{' '}
                      saat konfirmasi pemesanan.
                    </li>
                    <li>
                      Pelunasan <b>70% ({formatRupiah(calc.totalRevenue * 0.7)})</b>{' '}
                      maksimal H-3 keberangkatan.
                    </li>
                    <li>
                      Penawaran berlaku 14 hari sejak tanggal diterbitkan.
                    </li>
                  </ol>
                </div>

                <div
                  className={`p-3 rounded-xl border ${accentBorder} ${accentLightBg}/30 space-y-1`}
                >
                  <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Rekening Pembayaran Resmi
                  </div>
                  <div className="text-slate-500 text-[10px]">Bank Tujuan:</div>
                  <div className="font-bold text-slate-900">{b.bankName}</div>
                  <div className="text-slate-500 text-[10px]">
                    Nomor Rekening:
                  </div>
                  <div className={`text-sm font-mono font-black ${accentText}`}>
                    {b.bankAccountNumber}
                  </div>
                  <div className="text-slate-600 text-[10px]">
                    a/n <b>{b.bankAccountHolder}</b>
                  </div>
                </div>
              </div>

              {/* Signature Block */}
              <div className="mt-6 grid grid-cols-2 gap-6 text-[11px] text-center">
                <div className="space-y-10">
                  <div className="font-semibold text-slate-600">
                    Disetujui Oleh Klien,
                  </div>
                  <div className="border-t border-slate-300 pt-1 w-40 mx-auto font-bold text-slate-800 truncate">
                    {state.tripName}
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="font-semibold text-slate-600">
                    Hormat Kami,
                  </div>
                  <div className="border-t border-slate-300 pt-1 w-40 mx-auto">
                    <div className="font-bold text-slate-900">
                      Manajemen {b.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {b.legalEntity}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Page 4 */}
            <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {b.phone}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {b.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Globe className="w-3 h-3" /> {b.website}
                </span>
              </div>
              <span className="font-bold text-slate-600">Halaman 4 dari 4</span>
            </div>
          </div>
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
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setCurrentPage(num)}
              className={`w-7 h-7 rounded-lg text-xs font-mono font-black transition cursor-pointer ${
                currentPage === num
                  ? `${accentGradient} text-white`
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {num}
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
