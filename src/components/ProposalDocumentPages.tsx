'use client';

import React from 'react';
import {
  BrandId,
  CalculationResult,
  CalculatorState,
  MasterDatabase,
} from '@/types/trip';
import { BRANDS } from '@/lib/brands';
import { formatRupiah } from '@/lib/calculator';
import {
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Globe,
  Receipt,
  MapPin,
  Users,
  Calendar,
  Bus,
  Hotel,
  Utensils,
  Compass,
  ShieldCheck,
  Building2,
  Instagram,
  Info,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export interface ProposalDocumentPagesProps {
  brand: BrandId;
  state: CalculatorState;
  calc: CalculationResult;
  db: MasterDatabase;
  includeRab?: boolean;
  mode: 'preview' | 'print';
  currentPage?: number;
}

const ZONE_LABELS: Record<string, string> = {
  near: 'Dalam Kota / Sekitar (< 50 km)',
  medium: 'Luar Kota Dekat (50–150 km)',
  far: 'Luar Kota Jauh / Overland (> 150 km)',
};

export default function ProposalDocumentPages({
  brand,
  state,
  calc,
  db,
  includeRab = true,
  mode,
  currentPage = 1,
}: ProposalDocumentPagesProps) {
  const b = BRANDS[brand];
  const isNabila = brand === 'nabila';
  const isPrint = mode === 'print';
  const totalPages = includeRab ? 5 : 4;

  const now = new Date();
  const validUntil = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const todayStr = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const validUntilStr = validUntil.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const docNumber = `QUO/${b.shortName}/${now.getFullYear()}/${String(
    now.getMonth() + 1
  ).padStart(2, '0')}/${String(state.pax).padStart(3, '0')}`;

  const accentBorder = isNabila ? 'border-red-600' : 'border-orange-500';
  const accentSoftBorder = isNabila ? 'border-red-200' : 'border-orange-200';
  const accentBg = isNabila ? 'bg-red-600' : 'bg-orange-600';
  const accentBarGradient = isNabila
    ? 'bg-gradient-to-r from-red-700 via-red-600 to-rose-500'
    : 'bg-gradient-to-r from-blue-900 via-sky-500 to-orange-500';
  const accentText = isNabila ? 'text-red-600' : 'text-orange-600';
  const accentLightBg = isNabila ? 'bg-red-50' : 'bg-orange-50';
  const accentPill = isNabila
    ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-orange-50 text-orange-700 border-orange-200';
  const logoFrameClass = isNabila
    ? 'bg-slate-950 border-slate-800'
    : 'bg-white border-slate-200 shadow-xs';

  const getPageClass = (pageNum: number, allowFlow = false) => {
    if (isPrint) {
      return allowFlow ? 'pdf-print-page-flow' : 'pdf-print-page';
    }
    return `quotation-page justify-between ${
      currentPage === pageNum ? 'flex' : 'hidden'
    }`;
  };

  const clientManifestItems = calc.manifestItems.filter(
    (m) => m.status !== 'nonaktif' && m.kategori !== 'Cadangan Diskon'
  );

  const totalSelectedDest = Object.values(state.selectedDestByDay || {}).reduce(
    (sum, arr) => sum + (arr?.length || 0),
    0
  );

  const totalMealSessions = state.incMeal
    ? Array.from({ length: calc.days }, (_, i) => i + 1).reduce(
        (sum, d) => sum + (state.mealPlanByDay[d]?.sessions?.length || 0),
        0
      )
    : 0;

  const RunningHeader = ({
    stepLabel,
    title,
    subtitle,
  }: {
    stepLabel: string;
    title: string;
    subtitle: string;
  }) => (
    <div className="pb-3 mb-4 border-b border-slate-200">
      <div className={`h-1 w-full rounded-full mb-3 ${accentBarGradient}`} />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg p-1 flex items-center justify-center border shrink-0 ${logoFrameClass}`}
          >
            <img
              src={b.logoUrl}
              alt={b.name}
              loading="eager"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider border ${accentPill}`}
              >
                {stepLabel}
              </span>
              <h2 className="text-[13px] font-black text-slate-900 tracking-tight uppercase truncate">
                {title}
              </h2>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] font-mono font-bold text-slate-800">
            {docNumber}
          </div>
          <div className="text-[9px] text-slate-400">{todayStr}</div>
        </div>
      </div>
    </div>
  );

  const RunningFooter = ({
    pageNum,
    extraNote,
  }: {
    pageNum: number;
    extraNote?: string;
  }) => (
    <div className="mt-5 pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2 text-[9.5px] text-slate-500">
      <div className="flex items-center gap-2 min-w-0 truncate">
        <span className="font-bold text-slate-700">{b.name}</span>
        <span className="text-slate-300">•</span>
        <span>{b.legalEntity}</span>
        {extraNote ? (
          <>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{extraNote}</span>
          </>
        ) : (
          <>
            <span className="text-slate-300">•</span>
            <span>{b.phone}</span>
            <span className="text-slate-300">•</span>
            <span className="font-semibold text-slate-600">{b.website}</span>
          </>
        )}
      </div>
      <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-mono font-bold text-[9px] text-slate-700 shrink-0">
        Halaman {pageNum} / {totalPages}
      </span>
    </div>
  );

  return (
    <>
      {/* ================= PAGE 1: MODERN EXECUTIVE COVER & RINGKASAN ================= */}
      <div className={getPageClass(1, false)}>
        <div>
          {/* Top Signature Brand Accent Bar */}
          <div className={`h-1.5 w-full rounded-full mb-4 ${accentBarGradient}`} />

          {/* Official Letterhead */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-14 h-14 rounded-2xl p-2 flex items-center justify-center border shrink-0 ${logoFrameClass}`}
              >
                <img
                  src={b.logoUrl}
                  alt={b.name}
                  loading="eager"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">
                    {b.name}
                  </h1>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider border ${accentPill}`}
                  >
                    {b.badgeText}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-700 mt-1">
                  {b.legalEntity}
                </p>
                <p className="text-[9.5px] text-slate-500 leading-snug mt-0.5 max-w-[340px]">
                  {b.address}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 space-y-1">
              <div className="inline-block px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold text-[10.5px] tracking-wide">
                {docNumber}
              </div>
              <div className="text-[9.5px] text-slate-600">
                Terbit: <b className="text-slate-800">{todayStr}</b>
              </div>
              <div className="text-[9.5px] text-slate-500">
                Berlaku s/d: <b className="text-slate-700">{validUntilStr}</b>
              </div>
            </div>
          </div>

          {/* Executive Hero Banner */}
          <div className="mt-4 p-5 rounded-2xl bg-slate-950 text-white relative overflow-hidden">
            <div
              className={`absolute top-0 right-0 w-44 h-44 rounded-full opacity-15 -translate-y-1/2 translate-x-1/3 ${accentBg}`}
            />
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white ${accentBg}`}
                >
                  <Sparkles className="w-3 h-3" />
                  Official Travel Proposal & Quotation
                </span>
                <span className="text-[9.5px] font-mono text-slate-400">
                  {calc.days} Hari {calc.nights > 0 ? `${calc.nights} Malam` : 'Full Day'} • {calc.totalPax} Pax
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight leading-snug text-white">
                {state.tripName || 'Program Custom Tour & Gathering Eksklusif'}
              </h2>
              <p className="text-[10.5px] text-slate-300 leading-relaxed max-w-[92%]">
                Penawaran perjalanan wisata terpadu persembahan <b className="text-white">{b.name}</b> ({b.legalEntity}) — dirancang khusus dengan armada pariwisata pilihan, rute destinasi optimal, akomodasi nyaman, serta pendampingan kru profesional.
              </p>
            </div>
          </div>

          {/* Investment Spotlight Card */}
          <div
            className={`mt-4 p-4 rounded-2xl border-2 ${accentBorder} ${accentLightBg}/40 flex items-center justify-between gap-4`}
          >
            <div>
              <div className="text-[9.5px] font-black uppercase tracking-wider text-slate-500">
                Penawaran Investasi Paket Per Peserta
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black font-mono text-slate-950 tracking-tight">
                  {formatRupiah(calc.sellingPricePerPax)}
                </span>
                <span className="text-xs font-bold text-slate-500">/ Pax</span>
              </div>
              <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  All-in untuk <b>{calc.totalPax} peserta</b> sesuai rincian fasilitas resmi
                </span>
              </div>
            </div>

            <div className="text-right bg-white px-4 py-2.5 rounded-xl border border-slate-200/90 shrink-0 space-y-1">
              <div>
                <div className="text-[9px] font-bold uppercase text-slate-400">
                  Total Nilai Investasi
                </div>
                <div className={`text-base font-black font-mono ${accentText}`}>
                  {formatRupiah(calc.totalRevenue)}
                </div>
              </div>
              <div className="pt-1 border-t border-slate-100 text-[9.5px] text-slate-500">
                DP 30%: <b className="font-mono text-slate-800">{formatRupiah(calc.totalRevenue * 0.3)}</b>
              </div>
            </div>
          </div>

          {/* 2-Column Structured Spec Cards */}
          <div className="mt-4 grid grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 text-[10.5px]">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                <Users className={`w-3.5 h-3.5 ${accentText}`} />
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-800">
                  Informasi Klien & Peserta
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Nama Klien / Event</span>
                  <span className="font-bold text-slate-900 text-right">
                    {state.tripName}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Jumlah Peserta</span>
                  <span className="font-mono font-bold text-slate-900">
                    {calc.totalPax} Pax ({calc.regularPax} Reg
                    {calc.vipPax > 0 ? ` + ${calc.vipPax} VIP` : ''})
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Kategori Tamu</span>
                  <span className="font-semibold text-slate-800">
                    {state.isForeigner ? 'Mancanegara (WNA)' : 'Domestik (WNI)'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Zona Operasional</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {ZONE_LABELS[state.distanceZone] || state.distanceZone}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 text-[10.5px]">
              <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                <Calendar className={`w-3.5 h-3.5 ${accentText}`} />
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-800">
                  Spesifikasi Program
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Durasi Program</span>
                  <span className="font-bold text-slate-900">
                    {calc.days} Hari{' '}
                    {calc.nights > 0 ? `${calc.nights} Malam` : '(Full Day)'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Armada Utama</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {calc.armadaSummaryText}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Akomodasi Hotel</span>
                  <span className="font-semibold text-slate-900 text-right">
                    {calc.hotelSummaryText}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Pendampingan</span>
                  <span className="font-semibold text-slate-800">
                    {state.incTl
                      ? `${calc.tlCount} Tour Leader (${calc.tlDays} Hari)`
                      : 'Driver & Crew'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Visual Highlights Tiles */}
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
              <MapPin className={`w-3.5 h-3.5 mx-auto mb-1 ${accentText}`} />
              <div className="text-[8.5px] font-bold uppercase text-slate-400">
                Destinasi
              </div>
              <div className="text-xs font-black font-mono text-slate-900 mt-0.5">
                {totalSelectedDest} Objek Wisata
              </div>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
              <Hotel className={`w-3.5 h-3.5 mx-auto mb-1 ${accentText}`} />
              <div className="text-[8.5px] font-bold uppercase text-slate-400">
                Akomodasi
              </div>
              <div className="text-xs font-black font-mono text-slate-900 mt-0.5">
                {state.incHotel && calc.nights > 0
                  ? `${calc.nights} Malam`
                  : 'Tanpa Hotel'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
              <Utensils className={`w-3.5 h-3.5 mx-auto mb-1 ${accentText}`} />
              <div className="text-[8.5px] font-bold uppercase text-slate-400">
                Konsumsi
              </div>
              <div className="text-xs font-black font-mono text-slate-900 mt-0.5">
                {state.incMeal ? `${totalMealSessions}× Sesi Makan` : 'Opsional'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-center">
              <Receipt className={`w-3.5 h-3.5 mx-auto mb-1 ${accentText}`} />
              <div className="text-[8.5px] font-bold uppercase text-slate-400">
                Kelengkapan
              </div>
              <div className="text-xs font-black font-mono text-slate-900 mt-0.5">
                {includeRab ? 'Proposal + RAB' : 'Proposal Klien'}
              </div>
            </div>
          </div>

          {/* Quick Route Snapshot Box (Fills Page 1 with Useful Value) */}
          <div className="mt-4 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Compass className={`w-3.5 h-3.5 ${accentText}`} />
                Sekilas Rute Perjalanan
              </span>
              <span className="text-[9px] text-slate-400">
                Detail lengkap di Halaman 2
              </span>
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: Math.min(calc.days, 4) }, (_, idx) => idx + 1).map(
                (d) => {
                  const list = state.selectedDestByDay[d] || [];
                  return (
                    <div
                      key={d}
                      className="flex items-start gap-2 text-[10px] leading-snug"
                    >
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-[8.5px] shrink-0">
                        H{d}
                      </span>
                      <span className="text-slate-700 font-medium">
                        {list.length > 0
                          ? list.join('  →  ')
                          : 'Transfer / Acara bebas & fleksibel'}
                      </span>
                    </div>
                  );
                }
              )}
              {calc.days > 4 && (
                <div className="text-[9.5px] text-slate-500 italic pl-7">
                  + {calc.days - 4} hari perjalanan lanjutan (lihat rincian pada halaman Itinerary)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cover Contact Footer */}
        <div>
          <div className="mt-4 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-slate-500">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                <Phone className="w-3 h-3" /> {b.phone}
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3 h-3" /> {b.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <Globe className="w-3 h-3" /> {b.website}
              </span>
              <span className="inline-flex items-center gap-1">
                <Instagram className="w-3 h-3" /> {b.instagram}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-mono font-bold text-[9px] text-slate-700">
              Halaman 1 / {totalPages}
            </span>
          </div>
        </div>
      </div>

      {/* ================= PAGE 2: MODERN TIMELINE ITINERARY HARIAN ================= */}
      <div className={getPageClass(2, calc.days > 4)}>
        <div>
          <RunningHeader
            stepLabel="02 / Itinerary"
            title="Rencana Rute & Destinasi Harian"
            subtitle={`Jadwal perjalanan terstruktur untuk program ${calc.days} Hari ${
              calc.nights > 0 ? `${calc.nights} Malam` : '(Full Day)'
            } — ${state.tripName}`}
          />

          <div className="space-y-3">
            {Array.from({ length: calc.days }, (_, idx) => idx + 1).map((d) => {
              const destList = state.selectedDestByDay[d] || [];
              const mPlan = state.mealPlanByDay[d];
              const hasSnack = Boolean(state.incSnack && state.snackPlanByDay[d]);
              const armadaDay = state.armadaPlanByDay[d];
              const armadaDesc =
                state.incTransport && armadaDay?.active
                  ? Object.entries(armadaDay.selected || {})
                      .filter(([, u]) => Number(u) > 0)
                      .map(([k, u]) => `${u}× ${k}`)
                      .join(' + ')
                  : 'Tanpa Armada';
              const nightHotel =
                d <= calc.nights &&
                state.incHotel &&
                state.hotelPlanByNight[d]?.active
                  ? state.hotelPlanByNight[d]
                  : null;

              return (
                <div
                  key={d}
                  className="pdf-avoid-break rounded-xl border border-slate-200 bg-white overflow-hidden"
                >
                  {/* Day Card Header */}
                  <div className="bg-slate-900 text-white px-3.5 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9.5px] font-black font-mono uppercase ${accentBg} text-white`}
                      >
                        HARI 0{d}
                      </span>
                      <span className="text-[11px] font-bold tracking-wide">
                        Rangkaian Kunjungan & Aktivitas Hari ke-{d}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                      <Bus className="w-3 h-3 text-slate-400" />
                      {armadaDesc}
                    </span>
                  </div>

                  {/* Destinations Grid */}
                  <div className="p-3.5 space-y-2.5">
                    {destList.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {destList.map((dName, i) => {
                          const dRow = db.destinasi.find(
                            (x) => x.nama === dName
                          );
                          return (
                            <div
                              key={dName + i}
                              className="flex items-start justify-between gap-2 px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200/70"
                            >
                              <div className="flex items-start gap-2 min-w-0">
                                <span
                                  className={`w-4 h-4 rounded-full text-[9px] font-mono font-black flex items-center justify-center shrink-0 mt-0.5 text-white ${accentBg}`}
                                >
                                  {i + 1}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-bold text-[11px] text-slate-900 leading-tight">
                                    {dName}
                                  </div>
                                  {dRow?.keterangan && (
                                    <div className="text-[9px] text-slate-500 leading-tight mt-0.5">
                                      {dRow.keterangan}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[8.5px] font-semibold text-slate-600 shrink-0">
                                {dRow?.wilayah || 'Jatim'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-3 py-2 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-[10px] text-slate-500 italic">
                        Acara bebas / perjalanan transfer menuju titik penjemputan atau pengantaran.
                      </div>
                    )}

                    {/* Day Logistics Footer Strip */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[9.5px] text-slate-600">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Utensils className="w-3 h-3 text-slate-400" />
                          <span>Konsumsi:</span>
                          <b className="text-slate-800">
                            {state.incMeal && mPlan?.sessions?.length
                              ? mPlan.sessions
                                  .map((s) => s.toUpperCase())
                                  .join(', ')
                              : 'Masing-masing'}
                          </b>
                        </span>
                        {hasSnack && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[8.5px]">
                            + Snack Box & Air Mineral
                          </span>
                        )}
                      </div>
                      {nightHotel && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-semibold">
                          <Hotel className="w-3 h-3 text-slate-500" />
                          <span>
                            {nightHotel.hotelNama} ({nightHotel.klasifikasi})
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Jeep Adventure Highlight Card */}
          {state.incJeep && state.selectedJeepIds.length > 0 && (
            <div className="pdf-avoid-break mt-3.5 p-3.5 rounded-xl border border-amber-300/80 bg-amber-50/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9.5px] font-black uppercase tracking-wider text-amber-950">
                    Armada Khusus Jeep 4×4 & Petualangan
                  </div>
                  <div className="text-[11px] font-bold text-amber-900 mt-0.5">
                    {calc.jeepSummaryText}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-200/90 text-amber-950 font-mono font-bold text-[9.5px] shrink-0">
                Sudah Termasuk
              </span>
            </div>
          )}

          {/* Friendly Flexibility Note */}
          <div className="pdf-avoid-break mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start gap-2.5 text-[10px] text-slate-600">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <b className="text-slate-800">Catatan Fleksibilitas Jadwal:</b>{' '}
              Urutan dan jam kunjungan destinasi bersifat fleksibel dan dapat
              disesuaikan bersama Tour Leader di lapangan mengikuti kondisi
              cuaca, lalu lintas, serta preferensi rombongan.
            </div>
          </div>
        </div>

        <RunningFooter pageNum={2} />
      </div>

      {/* ================= PAGE 3: FASILITAS, MANIFEST & INCLUDE / EXCLUDE ================= */}
      <div className={getPageClass(3, clientManifestItems.length > 14)}>
        <div>
          <RunningHeader
            stepLabel="03 / Fasilitas"
            title="Manifest Layanan & Rincian Fasilitas"
            subtitle={`Daftar alokasi operasional dan kelengkapan layanan yang termasuk dalam paket ${state.tripName}`}
          />

          {/* Tabel Manifest Layanan */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-[10.5px]">
              <thead>
                <tr className="bg-slate-900 text-white text-[9.5px] uppercase tracking-wider">
                  <th className="py-2 px-3">Komponen Layanan</th>
                  <th className="py-2 px-3">Spesifikasi & Alokasi</th>
                  <th className="py-2 px-2.5 text-center">Kuantitas</th>
                  <th className="py-2 px-3">Keterangan Lapangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clientManifestItems.map((m, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}
                  >
                    <td className="py-2 px-3 font-bold text-slate-900">
                      {m.kategori}
                    </td>
                    <td className="py-2 px-3 text-slate-700 font-medium">
                      {m.spesifikasi}
                    </td>
                    <td className="py-2 px-2.5 text-center whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono font-bold text-[10px] text-slate-900">
                        {m.jumlahSatuan}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[9.5px]">
                      {m.keteranganLapangan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Include vs Exclude */}
          <div className="pdf-avoid-break mt-4 grid grid-cols-2 gap-3.5 text-[10.5px]">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <div className="font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 text-[10px] pb-1.5 border-b border-emerald-200/70">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sudah Termasuk (Include)</span>
              </div>
              <ul className="space-y-1.5 text-slate-700 text-[10px] leading-snug">
                {state.incTransport && (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>
                      Transportasi pariwisata AC ({calc.armadaSummaryText}) + BBM, tol & parkir
                    </span>
                  </li>
                )}
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Tiket masuk seluruh objek wisata sesuai itinerary</span>
                </li>
                {state.incJeep && state.selectedJeepIds.length > 0 && (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Armada Jeep 4×4 ({calc.jeepSummaryText})</span>
                  </li>
                )}
                {state.incHotel && calc.nights > 0 && (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>
                      Penginapan {calc.nights} malam ({calc.hotelSummaryText})
                    </span>
                  </li>
                )}
                {state.incMeal && (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>
                      Konsumsi makan sesuai program ({totalMealSessions}× sesi)
                    </span>
                  </li>
                )}
                {state.incSnack && (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Snack box & air mineral selama perjalanan</span>
                  </li>
                )}
                {state.incTl && (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>
                      Tour Leader bersertifikat ({calc.tlCount} orang × {calc.tlDays} hari)
                    </span>
                  </li>
                )}
                {(state.incFoto || state.incVideo || state.incDrone) && (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>
                      Dokumentasi profesional (
                      {[
                        state.incFoto && 'Fotografer',
                        state.incVideo && 'Videografer',
                        state.incDrone && 'Pilot Drone',
                      ]
                        .filter(Boolean)
                        .join(', ')}
                      )
                    </span>
                  </li>
                )}
                {state.incBanner && (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Cetak spanduk / banner foto rombongan (3×1m)</span>
                  </li>
                )}
                {state.incP3k && (
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Kotak P3K standar perjalanan & oksigen kaleng</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2">
              <div className="font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[10px] pb-1.5 border-b border-slate-200">
                <XCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Belum Termasuk (Exclude)</span>
              </div>
              <ul className="space-y-1.5 text-slate-600 text-[10px] leading-snug">
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>
                    Tiket pesawat / kereta api menuju dan dari kota penjemputan
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>
                    Pengeluaran pribadi peserta (laundry, minibar, oleh-oleh, telepon)
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>
                    Wahana permainan opsional atau aktivitas di luar tiket terusan
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>Tipping sukarela untuk Driver, Guide & Tour Leader</span>
                </li>
                {!state.incHotel && calc.nights > 0 && (
                  <li className="flex items-start gap-1.5">
                    <span className="text-slate-400 font-bold">•</span>
                    <span>Akomodasi penginapan / hotel</span>
                  </li>
                )}
                {!state.incMeal && (
                  <li className="flex items-start gap-1.5">
                    <span className="text-slate-400 font-bold">•</span>
                    <span>Konsumsi makan harian peserta</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Optional VIP / Gala Highlight */}
          {(state.incVip || (state.incGala && state.galaDinnerItems.length > 0)) && (
            <div className="pdf-avoid-break mt-3.5 p-3 rounded-xl border border-amber-200 bg-amber-50/50 text-[10px] text-amber-950 space-y-1">
              <div className="font-black uppercase tracking-wider text-[9.5px] text-amber-900">
                Layanan Tambahan & Acara Khusus Aktif
              </div>
              {state.incVip && (
                <div>
                  • <b>Handling Eksekutif VIP ({calc.vipPax} Tamu):</b>{' '}
                  {state.vipVehName}
                  {calc.nights > 0 ? ` & ${state.vipHotelName}` : ''}
                </div>
              )}
              {state.incGala && state.galaDinnerItems.length > 0 && (
                <div>
                  • <b>Paket Gala Dinner & Entertainment:</b>{' '}
                  {state.galaDinnerItems.map((g) => g.nama).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        <RunningFooter pageNum={3} />
      </div>

      {/* ================= PAGE 4: PENAWARAN HARGA, RESERVASI & REKENING RESMI ================= */}
      <div className={getPageClass(4, false)}>
        <div>
          <RunningHeader
            stepLabel="04 / Penawaran"
            title="Rincian Harga, Skema Pembayaran & Rekening"
            subtitle="Rekapitulasi nilai investasi paket wisata, prosedur booking, dan konfirmasi resmi"
          />

          {/* Tabel Harga Resmi */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-900 text-white text-[9.5px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Deskripsi Paket Perjalanan</th>
                  <th className="py-2.5 px-2.5 text-center">Kuota</th>
                  <th className="py-2.5 px-3 text-right">Harga / Pax</th>
                  <th className="py-2.5 px-3 text-right">Total Investasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-white">
                  <td className="py-3 px-3">
                    <div className="font-black text-slate-900 text-xs">
                      {state.tripName}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Program {calc.days} Hari{' '}
                      {calc.nights > 0 ? `${calc.nights} Malam` : '(Full Day)'}{' '}
                      • {calc.armadaSummaryText}
                      {state.incHotel && calc.nights > 0
                        ? ` • ${calc.hotelSummaryText}`
                        : ''}
                    </div>
                  </td>
                  <td className="py-3 px-2.5 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                    {calc.totalPax} Pax
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    {formatRupiah(calc.sellingPricePerPax)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono font-black text-sm whitespace-nowrap ${accentText}`}
                  >
                    {formatRupiah(calc.totalRevenue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3-Step Visual Booking Timeline */}
          <div className="mt-4 grid grid-cols-3 gap-2.5 text-[10px]">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 font-black text-slate-900">
                <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono text-white ${accentBg}`}>
                  01
                </span>
                <span>Konfirmasi & DP 30%</span>
              </div>
              <div className="text-slate-600 mt-1 font-mono font-bold text-[10.5px]">
                {formatRupiah(calc.totalRevenue * 0.3)}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                Penguncian jadwal armada & blokir kamar hotel
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 font-black text-slate-900">
                <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono bg-slate-800 text-white">
                  02
                </span>
                <span>Finalisasi Data (H-7)</span>
              </div>
              <div className="text-slate-700 mt-1 font-bold text-[10px]">
                Manifest & Rooming List
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                Konfirmasi daftar peserta, kamar & kebutuhan khusus
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 font-black text-slate-900">
                <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono bg-emerald-600 text-white">
                  03
                </span>
                <span>Pelunasan 70% (H-3)</span>
              </div>
              <div className="text-slate-600 mt-1 font-mono font-bold text-[10.5px]">
                {formatRupiah(calc.totalRevenue * 0.7)}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                Paling lambat 3 hari sebelum keberangkatan
              </div>
            </div>
          </div>

          {/* Terms & Conditions + Official Bank Card */}
          <div className="mt-4 grid grid-cols-2 gap-3.5 text-[10.5px]">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="font-black text-slate-900 uppercase tracking-wider text-[9.5px] pb-1.5 border-b border-slate-100">
                Syarat & Ketentuan Penawaran
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[9.5px] leading-snug">
                <li>
                  Harga penawaran berlaku <b>14 hari</b> sejak diterbitkan
                  (hingga <b>{validUntilStr}</b>).
                </li>
                <li>
                  Reservasi dinyatakan terkonfirmasi setelah pembayaran{' '}
                  <b>DP 30%</b> diterima dan bukti transfer dikirim ke admin
                  resmi.
                </li>
                <li>
                  Perubahan jumlah peserta signifikan dapat menyesuaikan
                  kalkulasi harga per pax secara proporsional.
                </li>
                <li>
                  Tarif khusus <i>high season</i> / libur nasional mengikuti
                  ketersediaan hotel & armada saat konfirmasi.
                </li>
              </ol>
            </div>

            <div
              className={`p-3.5 rounded-xl border-2 ${accentSoftBorder} ${accentLightBg}/40 flex flex-col justify-between space-y-2`}
            >
              <div>
                <div className="font-black text-slate-900 uppercase tracking-wider text-[9.5px] flex items-center gap-1.5 pb-1.5 border-b border-slate-200/70">
                  <CreditCard className={`w-3.5 h-3.5 ${accentText}`} />
                  <span>Rekening Pembayaran Resmi</span>
                </div>
                <div className="mt-2.5 space-y-1">
                  <div className="text-[9px] uppercase font-bold text-slate-500">
                    Bank Tujuan
                  </div>
                  <div className="text-xs font-black text-slate-900">
                    {b.bankName}
                  </div>
                  <div className="text-[9px] uppercase font-bold text-slate-500 pt-1">
                    Nomor Rekening
                  </div>
                  <div
                    className={`text-base font-mono font-black tracking-wide ${accentText}`}
                  >
                    {b.bankAccountNumber}
                  </div>
                  <div className="text-[10px] text-slate-700 pt-0.5">
                    a/n <b className="text-slate-900">{b.bankAccountHolder}</b>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/70 text-[9px] text-slate-600">
                Konfirmasi bukti transfer via WhatsApp resmi:{' '}
                <b className="text-slate-900 font-mono">{b.phone}</b>
              </div>
            </div>
          </div>

          {/* Signature Block */}
          <div className="mt-6 grid grid-cols-2 gap-8 text-[10.5px] text-center">
            <div className="space-y-12">
              <div>
                <div className="text-[9.5px] text-slate-400">
                  Malang, {todayStr}
                </div>
                <div className="font-bold text-slate-700 mt-0.5">
                  Disetujui Oleh Klien,
                </div>
              </div>
              <div className="border-t border-slate-300 pt-1.5 w-56 mx-auto">
                <div className="font-bold text-slate-900 leading-snug">
                  {state.tripName}
                </div>
                <div className="text-[9px] text-slate-400">
                  Perwakilan / PIC Rombongan
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <div className="text-[9.5px] text-slate-400">
                  Malang, {todayStr}
                </div>
                <div className="font-bold text-slate-700 mt-0.5">
                  Hormat Kami,
                </div>
              </div>
              <div className="border-t border-slate-300 pt-1.5 w-56 mx-auto">
                <div className="font-bold text-slate-900">
                  Manajemen {b.name}
                </div>
                <div className="text-[9.5px] text-slate-500">
                  {b.legalEntity}
                </div>
              </div>
            </div>
          </div>

          {/* Official Office Info Strip */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-[9.5px] text-slate-600">
            <div className="flex items-start gap-2 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">
                  Kantor Resmi {b.name}:
                </span>{' '}
                {b.address}
              </div>
            </div>
          </div>
        </div>

        <RunningFooter pageNum={4} />
      </div>

      {/* ================= PAGE 5: LAMPIRAN RINCIAN ANGGARAN BIAYA POKOK (RAB HPP) ================= */}
      {includeRab && (
        <div className={getPageClass(5, true)}>
          <div>
            <RunningHeader
              stepLabel="05 / RAB HPP"
              title="Rincian Anggaran Biaya Pokok (RAB HPP)"
              subtitle={`Modal pokok, pajak/buffer & margin — ${state.tripName} (${calc.totalPax} Pax, ${calc.days}H${calc.nights}M)`}
            />

            {/* 4-Card KPI Summary Strip */}
            <div className="grid grid-cols-4 gap-2.5 text-[10px]">
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[8.5px] font-bold uppercase text-slate-500">
                  HPP Pokok ({calc.rabItems.length} Item)
                </div>
                <div className="text-xs font-black font-mono text-slate-900 mt-0.5 tabular-nums">
                  {formatRupiah(calc.totalBaseCost)}
                </div>
                <div className="text-[8.5px] text-slate-400">
                  Biaya riil komponen
                </div>
              </div>
              <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70">
                <div className="text-[8.5px] font-bold uppercase text-amber-700">
                  Buffer / Pajak ({state.taxPct}%)
                </div>
                <div className="text-xs font-black font-mono text-amber-900 mt-0.5 tabular-nums">
                  {formatRupiah(calc.taxOrBufferCost)}
                </div>
                <div className="text-[8.5px] text-amber-700/80">
                  Cadangan operasional
                </div>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-900 bg-slate-900 text-white">
                <div className="text-[8.5px] font-bold uppercase text-slate-300">
                  Total HPP Final
                </div>
                <div className="text-xs font-black font-mono text-white mt-0.5 tabular-nums">
                  {formatRupiah(calc.finalHpp)}
                </div>
                <div className="text-[8.5px] font-mono text-slate-300">
                  Modal: {formatRupiah(calc.hppPerPax)}/pax
                </div>
              </div>
              <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80">
                <div className="text-[8.5px] font-bold uppercase text-emerald-700">
                  Estimasi Laba ({state.enableLaba ? `${state.marginPct}%` : '0%'})
                </div>
                <div className="text-xs font-black font-mono text-emerald-900 mt-0.5 tabular-nums">
                  {formatRupiah(calc.totalProfit)}
                </div>
                <div className="text-[8.5px] font-mono text-emerald-700">
                  Jual: {formatRupiah(calc.sellingPricePerPax)}/pax
                </div>
              </div>
            </div>

            {/* Tabel Rincian RAB HPP */}
            <div className="mt-3.5 border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-[9px] uppercase tracking-wider">
                    <th className="py-2 px-2 w-7 text-center">No</th>
                    <th className="py-2 px-2.5">Item Pengeluaran & Kategori</th>
                    <th className="py-2 px-2 text-center">Volume</th>
                    <th className="py-2 px-2.5 text-right">Harga Satuan</th>
                    <th className="py-2 px-2.5 text-right">Subtotal Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {calc.rabItems.map((item, idx) => (
                    <tr
                      key={item.key}
                      className={
                        item.highlight === 'vip'
                          ? 'bg-amber-50/70'
                          : item.highlight === 'gala'
                          ? 'bg-purple-50/50'
                          : idx % 2 === 1
                          ? 'bg-slate-50/60'
                          : 'bg-white'
                      }
                    >
                      <td className="py-1.5 px-2 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2.5">
                        <div className="font-bold text-slate-900 leading-snug flex flex-wrap items-center gap-1.5">
                          <span>{item.label}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[8px] font-semibold">
                            {item.category}
                          </span>
                          {item.isOverridden && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[8px] font-bold uppercase">
                              Negosiasi
                            </span>
                          )}
                        </div>
                        {item.subLabel && (
                          <div className="text-[9px] text-slate-500 leading-tight mt-0.5">
                            {item.subLabel}
                          </div>
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-center whitespace-nowrap">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100/90 border border-slate-200/80 font-mono font-semibold text-[9.5px] text-slate-700">
                          {item.volumeText}
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-mono text-slate-700 whitespace-nowrap tabular-nums">
                        {formatRupiah(item.unitPrice)}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap tabular-nums">
                        {formatRupiah(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 2-Column Financial Reconciliation Summary */}
            <div className="pdf-avoid-break mt-3.5 grid grid-cols-12 gap-3 text-[10px]">
              {/* Left: Parameter Summary */}
              <div className="col-span-5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-600 pb-1 border-b border-slate-200">
                  Parameter Kalkulasi
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Peserta & Durasi</span>
                  <span className="font-mono font-bold text-slate-800">
                    {calc.totalPax} Pax • {calc.days}H{calc.nights}M
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Margin Laba</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {state.enableLaba ? `${state.marginPct}% Aktif` : '0% (Nonaktif)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Buffer / Pajak HPP</span>
                  <span className="font-mono font-bold text-amber-700">
                    {state.taxPct}%
                  </span>
                </div>
                {state.incExtrabed && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Skema Extrabed</span>
                    <span className="font-bold text-slate-800">Aktif (Triple)</span>
                  </div>
                )}
                {state.incSpareDiskon && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Spare Diskon</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatRupiah(state.spareDiskonNominal ?? 50000)}
                      {(state.spareDiskonMode || 'per_pax') === 'per_pax'
                        ? '/pax'
                        : ' total'}
                    </span>
                  </div>
                )}
              </div>

              {/* Right: Financial Totals */}
              <div className="col-span-7 rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-white px-3 py-1.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">
                    Subtotal HPP Pokok ({calc.rabItems.length} item)
                  </span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {formatRupiah(calc.totalBaseCost)}
                  </span>
                </div>
                <div className="bg-slate-50/70 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">
                    Pajak / Cadangan Buffer ({state.taxPct}%)
                  </span>
                  <span className="font-mono font-bold text-amber-700 tabular-nums">
                    {formatRupiah(calc.taxOrBufferCost)}
                  </span>
                </div>
                <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between">
                  <div>
                    <span className="font-black uppercase tracking-wider text-[9.5px]">
                      Total HPP Final
                    </span>
                    <span className="ml-1.5 text-[8.5px] font-mono text-slate-300">
                      ({formatRupiah(calc.hppPerPax)}/pax)
                    </span>
                  </div>
                  <span className="font-mono font-black text-xs text-white tabular-nums">
                    {formatRupiah(calc.finalHpp)}
                  </span>
                </div>
                <div className="bg-emerald-50/80 px-3 py-1.5 border-t border-emerald-200 flex items-center justify-between">
                  <span className="font-bold text-emerald-900">
                    Margin Laba Kotor ({state.enableLaba ? `${state.marginPct}%` : '0%'})
                  </span>
                  <span className="font-mono font-black text-emerald-800 tabular-nums">
                    + {formatRupiah(calc.totalProfit)}
                  </span>
                </div>
                <div
                  className={`${accentLightBg} px-3 py-2 border-t ${accentBorder} flex items-center justify-between`}
                >
                  <div>
                    <span className="font-black uppercase tracking-wider text-slate-900 text-[9.5px]">
                      Total Penawaran
                    </span>
                    <span className="ml-1.5 font-mono font-bold text-[9px] text-slate-700">
                      ({formatRupiah(calc.sellingPricePerPax)}/pax)
                    </span>
                  </div>
                  <span className={`font-mono font-black text-xs tabular-nums ${accentText}`}>
                    {formatRupiah(calc.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <RunningFooter pageNum={5} extraNote="Lampiran Rincian RAB HPP" />
        </div>
      )}
    </>
  );
}
