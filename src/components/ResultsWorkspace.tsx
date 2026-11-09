'use client';

import React, { useState } from 'react';
import {
  BrandId,
  CalculationResult,
  CalculatorState,
  MasterDatabase,
  QuotationRecord,
} from '@/types/trip';
import { formatRupiah } from '@/lib/calculator';
import ProposalPreview from './ProposalPreview';
import MasterDatabaseView from './MasterDatabaseView';
import {
  RotateCcw,
  Download,
  FolderOpen,
  Trash2,
  TrendingUp,
  Wallet,
  Calculator,
  Tag,
  Receipt,
  PackageCheck,
  FileText,
  Database,
  History,
} from 'lucide-react';

export type WorkspaceTab =
  | 'manifest'
  | 'rab'
  | 'proposal'
  | 'database'
  | 'history';

interface ResultsWorkspaceProps {
  brand: BrandId;
  db: MasterDatabase;
  state: CalculatorState;
  calc: CalculationResult;
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  onUpdatePriceOverride: (key: string, value: number | null) => void;
  onResetAllPriceOverrides: () => void;
  onSaveMaster: (updated: Partial<MasterDatabase>) => Promise<void>;
  onResetMaster: () => Promise<void>;
  onLoadQuotation: (q: QuotationRecord) => void;
  onDeleteQuotation: (quoteId: string) => Promise<void>;
}

export function KpiSummaryCards({
  brand,
  state,
  calc,
}: {
  brand: BrandId;
  state: CalculatorState;
  calc: CalculationResult;
}) {
  const isNabila = brand === 'nabila';

  return (
    <div className="no-print grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {/* Card 1: Harga Jual / Pax (Vivid Brand Gradient) */}
      <div
        className={`relative overflow-hidden rounded-2xl p-3 sm:p-3.5 text-white shadow-md transition-all hover:scale-[1.01] flex items-center justify-between gap-2.5 ${
          isNabila
            ? 'bg-gradient-to-br from-red-600 via-rose-600 to-red-800 shadow-red-600/15 border border-red-500/40'
            : 'bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 shadow-orange-600/15 border border-orange-500/40'
        }`}
      >
        <div className="min-w-0 relative z-10 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
            <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white/90 truncate">
              Harga Jual / Pax
            </div>
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-black font-mono tracking-tight mt-0.5 truncate tabular-nums">
            {formatRupiah(calc.sellingPricePerPax)}
          </div>
          <div className="text-[10px] sm:text-[11px] font-medium text-white/90 truncate mt-0.5 flex items-center gap-1">
            <span className="opacity-75">Omzet:</span>
            <b className="font-mono">{formatRupiah(calc.totalRevenue)}</b>
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/25 backdrop-blur-xs flex items-center justify-center shrink-0 hidden sm:flex shadow-inner">
          <Tag className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Card 2: HPP / Pax */}
      <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs transition-all hover:scale-[1.01] hover:border-slate-300 flex items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 truncate">
              Modal HPP / Pax
            </div>
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-black font-mono text-slate-900 mt-0.5 truncate tabular-nums">
            {formatRupiah(calc.hppPerPax)}
          </div>
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-600 truncate mt-0.5">
            {calc.vipPax > 0 ? (
              <span>
                Beban <b className="text-slate-900 font-mono">{calc.totalPax} pax</b> ({calc.regularPax} Reg + {calc.vipPax} VIP)
              </span>
            ) : (
              <span>
                Beban <b className="text-slate-900 font-mono">{calc.totalPax} peserta</b>
              </span>
            )}
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0 hidden sm:flex shadow-2xs">
          <Calculator className="w-4 h-4" />
        </div>
      </div>

      {/* Card 3: Total HPP Final */}
      <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs transition-all hover:scale-[1.01] hover:border-slate-300 flex items-center justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-500 truncate">
              Total HPP Final
            </div>
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-black font-mono text-slate-900 mt-0.5 truncate tabular-nums">
            {formatRupiah(calc.finalHpp)}
          </div>
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-600 truncate mt-0.5 flex items-center gap-1">
            <span>Buffer/Pajak:</span>
            <b className="font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60 text-[10px]">
              {state.taxPct}%
            </b>
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100/80 text-amber-600 flex items-center justify-center shrink-0 hidden sm:flex shadow-2xs">
          <Wallet className="w-4 h-4" />
        </div>
      </div>

      {/* Card 4: Estimasi Laba Kotor (Vivid Emerald Gradient) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-800 text-white rounded-2xl p-3 sm:p-3.5 shadow-md shadow-emerald-600/15 border border-emerald-500/40 transition-all hover:scale-[1.01] flex items-center justify-between gap-2.5">
        <div className="min-w-0 relative z-10 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-100 truncate">
              Estimasi Laba
            </div>
          </div>
          <div className="text-base sm:text-lg xl:text-xl font-black font-mono text-white mt-0.5 truncate tabular-nums">
            {formatRupiah(calc.totalProfit)}
          </div>
          <div className="text-[10px] sm:text-[11px] font-medium text-emerald-100 truncate mt-0.5 flex items-center gap-1">
            <span className="opacity-80">Gross Profit:</span>
            <b className="font-mono bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-400/30 text-[10px]">
              {state.enableLaba ? `${state.marginPct}%` : '0%'}
            </b>
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/25 backdrop-blur-xs flex items-center justify-center shrink-0 hidden sm:flex shadow-inner">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function ResultsWorkspace({
  brand,
  db,
  state,
  calc,
  activeTab,
  onTabChange,
  onUpdatePriceOverride,
  onResetAllPriceOverrides,
  onSaveMaster,
  onResetMaster,
  onLoadQuotation,
  onDeleteQuotation,
}: ResultsWorkspaceProps) {
  const [historySearch, setHistorySearch] = useState<string>('');

  const isNabila = brand === 'nabila';
  const accentText = isNabila ? 'text-red-400' : 'text-orange-400';
  const accentBadge = isNabila
    ? 'bg-red-500/20 text-red-300 border-red-500/30'
    : 'bg-orange-500/20 text-orange-300 border-orange-500/30';

  const overrideCount = Object.keys(state.customPriceOverrides || {}).length;

  // Export RAB to CSV (matching Excel structure)
  const handleExportRabCsv = () => {
    const rows = [
      ['KALKULATOR HPP & LOGISTIK CUSTOM TRIP - ' + brand.toUpperCase()],
      ['Nama Klien', state.tripName],
      ['Jumlah Peserta (Pax)', String(calc.totalPax)],
      ['Durasi Tour (Hari)', String(calc.days)],
      ['Harga Jual / Pax', String(calc.sellingPricePerPax)],
      ['HPP Modal / Pax', String(calc.hppPerPax)],
      ['Total HPP Final', String(calc.finalHpp)],
      ['Estimasi Omzet', String(calc.totalRevenue)],
      ['Estimasi Laba Kotor', String(calc.totalProfit)],
      [],
      [
        'Item Pengeluaran',
        'Kategori',
        'Volume / Kuantitas',
        'Harga Satuan (Rp)',
        'Subtotal Biaya (Rp)',
      ],
      ...calc.rabItems.map((item) => [
        `"${item.label.replace(/"/g, '""')}"`,
        item.category,
        `"${item.volumeText}"`,
        String(item.unitPrice),
        String(item.subtotal),
      ]),
      ['Total Biaya Pokok Murni', '', '', '', String(calc.totalBaseCost)],
      [
        `Pajak / Buffer (${state.taxPct}%)`,
        '',
        '',
        '',
        String(calc.taxOrBufferCost),
      ],
      ['TOTAL HPP TRIP (FINAL)', '', '', '', String(calc.finalHpp)],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `RAB_HPP_${brand.toUpperCase()}_${state.tripName.replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Strictly only show quotations belonging to the selected entity
  const brandQuotations = db.quotations.filter((q) => q.brand === brand);
  const filteredQuotations = brandQuotations.filter((q) => {
    if (
      historySearch &&
      !q.namaKlien.toLowerCase().includes(historySearch.toLowerCase()) &&
      !q.quoteId.toLowerCase().includes(historySearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const workspaceTabs: {
    id: WorkspaceTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }[] = [
    {
      id: 'manifest',
      label: 'Manifest & Logistik',
      icon: <PackageCheck className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: 'rab',
      label: 'RAB HPP (Negosiasi)',
      icon: <Receipt className="w-3.5 h-3.5 shrink-0" />,
      badge: calc.rabItems.length,
    },
    {
      id: 'proposal',
      label: 'Proposal PDF',
      icon: <FileText className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: 'database',
      label: 'Database Master',
      icon: <Database className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: 'history',
      label: 'Riwayat Arsip',
      icon: <History className="w-3.5 h-3.5 shrink-0" />,
      badge: brandQuotations.length,
    },
  ];

  return (
    <div
      className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden min-w-0 flex flex-col min-h-[660px] xl:h-[calc(100vh-210px)] xl:min-h-[640px] xl:max-h-[960px] print:h-auto print:overflow-visible"
    >
      {/* INTEGRATED WORKSPACE TABS HEADER (Always visible, instant 1-click tab switching!) */}
      <div className="bg-slate-950 px-3.5 py-2 flex items-center justify-between gap-2 border-b border-slate-800/90 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
          {workspaceTabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                  isActive
                    ? isNabila
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/25'
                      : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                      isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] font-mono text-slate-400 hidden md:block">
            {brand.toUpperCase()} ENGINE
          </div>
        </div>
      </div>
      {/* ================= VIEW 1: MANIFEST & LOGISTIK ================= */}
      {activeTab === 'manifest' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Modern Dark Header */}
          <div className="px-5 py-3.5 bg-slate-950 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${
                  isNabila
                    ? 'bg-gradient-to-br from-red-600 to-rose-600 shadow-red-600/20'
                    : 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-600/20'
                }`}
              >
                <PackageCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white">
                  Manifest Kebutuhan Operasional & Logistik Lapangan
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kalkulasi otomatis rasio peserta ({calc.totalPax} Pax) & durasi ({calc.days} Hari)
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold border shadow-xs ${accentBadge}`}
            >
              Standar {brand.toUpperCase()}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 pb-20 space-y-4">
            <div
              className="overflow-x-auto border border-slate-200/90 rounded-2xl shadow-xs bg-white"
              role="region"
              aria-label="Tabel Manifest Kebutuhan Operasional"
              tabIndex={0}
            >
              <table className="w-full text-left border-collapse text-xs min-w-[560px]">
                <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Kebutuhan Operasional</th>
                    <th className="py-3 px-4">Spesifikasi / Alokasi</th>
                    <th className="py-3 px-4 text-center">Satuan</th>
                    <th className="py-3 px-4">Keterangan Lapangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {calc.manifestItems.map((m, idx) => (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        m.status === 'nonaktif'
                          ? 'bg-slate-50/50 text-slate-400'
                          : m.status === 'vip'
                          ? 'bg-amber-50/50 text-slate-900 font-semibold'
                          : 'bg-white text-slate-800 hover:bg-slate-50/90'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold whitespace-nowrap">
                        {m.kategori}
                      </td>
                      <td className="py-3 px-4 font-medium">{m.spesifikasi}</td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-xl font-mono font-bold text-[11px] whitespace-nowrap shadow-2xs ${
                            m.status === 'nonaktif'
                              ? 'bg-slate-100 text-slate-400'
                              : m.status === 'vip'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-900 text-white'
                          }`}
                        >
                          {m.jumlahSatuan}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] leading-relaxed">
                        {m.keteranganLapangan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ringkasan Jadwal Harian Singkat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {Array.from({ length: calc.days }, (_, i) => i + 1).map((d) => {
                const dests = state.selectedDestByDay[d] || [];
                const armPlan = state.armadaPlanByDay[d];
                const armUnits =
                  state.incTransport && armPlan?.active
                    ? Object.entries(armPlan.selected || {})
                        .filter(([, u]) => Number(u) > 0)
                        .map(([k, u]) => `${u}× ${k}`)
                        .join(', ')
                    : 'Tanpa Armada';

                return (
                  <div
                    key={d}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-900" />
                        Jadwal Hari {d}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white font-mono text-[10px] font-bold shadow-2xs">
                        {armUnits}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate pt-1 border-t border-slate-100">
                      <span className="text-slate-400">Rute Wisata: </span>
                      {dests.length > 0 ? (
                        <span className="font-bold text-slate-800">
                          {dests.join(' → ')}
                        </span>
                      ) : (
                        <span className="italic text-slate-400">
                          Belum ada destinasi dipilih
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: RAB HPP (INLINE EDITABLE, PINNED HEADER & FOOTER) ================= */}
      {activeTab === 'rab' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Pinned Modern Dark Action Bar */}
          <div className="px-5 py-3.5 bg-slate-950 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${
                  isNabila
                    ? 'bg-gradient-to-br from-red-600 to-rose-600 shadow-red-600/20'
                    : 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-600/20'
                }`}
              >
                <Receipt className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white">
                  Rincian Anggaran Biaya Pokok (RAB HPP)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik kolom harga satuan untuk simulasi negosiasi vendor secara langsung
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {overrideCount > 0 && (
                <button
                  type="button"
                  onClick={onResetAllPriceOverrides}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Negosiasi ({overrideCount})</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleExportRabCsv}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5 transition shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV / Excel</span>
              </button>
            </div>
          </div>

          {/* Scrollable Table Body */}
          <div
            className="flex-1 overflow-y-auto overflow-x-auto"
            role="region"
            aria-label="Tabel Rincian Anggaran Biaya HPP"
            tabIndex={0}
          >
            <table className="w-full text-left border-collapse text-xs min-w-[580px]">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item Pengeluaran</th>
                  <th className="py-3 px-3 text-center">Volume</th>
                  <th className="py-3 px-3 text-right">
                    Harga Satuan (Editable)
                  </th>
                  <th className="py-3 px-4 text-right">Subtotal Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {calc.rabItems.map((item) => (
                  <tr
                    key={item.key}
                    className={`transition-colors ${
                      item.highlight === 'vip'
                        ? 'bg-amber-50/60 font-semibold'
                        : item.highlight === 'gala'
                        ? 'bg-purple-50/40'
                        : 'hover:bg-slate-50/90'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-sm text-slate-900 leading-snug">
                        {item.label}
                      </div>
                      {item.subLabel && (
                        <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                          {item.subLabel}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-xs font-semibold text-slate-600 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80 font-bold">
                        {item.volumeText}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {item.isOverridden && (
                          <button
                            type="button"
                            title={`Kembalikan ke harga DB: ${formatRupiah(
                              item.defaultUnitPrice
                            )}`}
                            onClick={() =>
                              onUpdatePriceOverride(item.key, null)
                            }
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 font-bold transition"
                          >
                            Reset
                          </button>
                        )}
                        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-900/10 overflow-hidden shadow-2xs transition">
                          <span className="px-2 py-1 text-[11px] font-mono font-bold text-slate-400 bg-slate-50 border-r border-slate-200">
                            Rp
                          </span>
                          <input
                            type="number"
                            step={5000}
                            value={item.unitPrice}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              onUpdatePriceOverride(
                                item.key,
                                Number.isNaN(val) ? 0 : val
                              );
                            }}
                            className={`w-28 px-2.5 py-1 text-right font-mono text-xs font-bold focus:outline-none ${
                              item.isOverridden
                                ? 'bg-amber-50/80 text-amber-900'
                                : 'bg-white text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-sm text-slate-900 whitespace-nowrap tabular-nums">
                      {formatRupiah(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pinned Modern Dark Summary Footer (Always visible without scrolling!) */}
          <div className="shrink-0 bg-slate-950 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs border-t border-slate-800 shadow-xl">
            <div className="flex flex-wrap items-center gap-5 text-xs">
              <div>
                <span className="text-slate-400">HPP Pokok: </span>
                <span className="font-mono font-bold text-white text-sm tabular-nums">
                  {formatRupiah(calc.totalBaseCost)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400">
                  Buffer / Pajak ({state.taxPct}%):{' '}
                </span>
                <span className="font-mono font-bold text-amber-300 text-sm tabular-nums">
                  {formatRupiah(calc.taxOrBufferCost)}
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                TOTAL HPP FINAL:
              </span>
              <span className={`text-base sm:text-lg font-black font-mono tabular-nums ${accentText}`}>
                {formatRupiah(calc.finalHpp)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 3: PROPOSAL PENAWARAN KLIEN (4-PAGE A4) ================= */}
      {activeTab === 'proposal' && (
        <div className="flex-1 h-full overflow-hidden print:h-auto print:overflow-visible">
          <ProposalPreview brand={brand} state={state} calc={calc} db={db} />
        </div>
      )}

      {/* ================= VIEW 4: DATABASE MASTER HARGA ================= */}
      {activeTab === 'database' && (
        <div className="flex-1 overflow-y-auto p-4">
          <MasterDatabaseView
            brand={brand}
            db={db}
            onSaveMaster={onSaveMaster}
            onResetMaster={onResetMaster}
          />
        </div>
      )}

      {/* ================= VIEW 5: RIWAYAT PENAWARAN ================= */}
      {activeTab === 'history' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950 text-white p-3.5 rounded-2xl">
            <div>
              <h3 className="text-xs font-black text-white">
                Riwayat Penawaran Tersimpan — {brand.toUpperCase()}
              </h3>
              <p className="text-[11px] text-slate-400">
                Klik &ldquo;Panggil&rdquo; untuk memuat ulang konfigurasi HPP ke
                kalkulator
              </p>
            </div>

            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Cari nama klien / ID..."
              className="px-3 py-1.5 text-xs border border-slate-800 rounded-xl bg-slate-900 text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {filteredQuotations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              Belum ada riwayat penawaran yang sesuai filter.
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredQuotations.map((q) => {
                const isQNa = q.brand === 'nabila';
                return (
                  <div
                    key={q.quoteId}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-slate-900">
                          {q.quoteId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            isQNa
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}
                        >
                          {q.brand}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {q.timestamp}
                        </span>
                      </div>
                      <div className="text-sm font-black text-slate-900 truncate">
                        {q.namaKlien}
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                        <span>
                          <b>{q.pax} Pax</b>
                        </span>
                        <span>•</span>
                        <span>{q.durasi}</span>
                        <span>•</span>
                        <span>{q.armada}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">
                          Harga Jual / Pax
                        </div>
                        <div className="text-sm font-mono font-black text-slate-900">
                          {formatRupiah(q.hargaJualPerPax)}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Total HPP: {formatRupiah(q.hppTotal)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onLoadQuotation(q)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition shadow-xs"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Panggil</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteQuotation(q.quoteId)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition"
                          title="Hapus Penawaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
