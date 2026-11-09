'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BrandId,
  CalculatorState,
  MasterDatabase,
  QuotationRecord,
} from '@/types/trip';
import { BRANDS } from '@/lib/brands';
import { INITIAL_MASTER_DB } from '@/lib/seed-data';
import {
  calculateTrip,
  createDefaultCalculatorState,
  formatRupiah,
} from '@/lib/calculator';
import EntitySelectorScreen from '@/components/BrandSelectorModal';
import ParameterPanel from '@/components/ParameterPanel';
import ResultsWorkspace, {
  KpiSummaryCards,
  WorkspaceTab,
} from '@/components/ResultsWorkspace';
import {
  Save,
  History,
  Database,
  RotateCcw,
  CheckCircle2,
  ArrowLeftRight,
  Receipt,
  FileText,
  PackageCheck,
  Menu,
  X,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Calendar,
} from 'lucide-react';

export default function HomePage() {
  const [selectedBrand, setSelectedBrand] = useState<BrandId>('nabila');
  const [showEntityModal, setShowEntityModal] = useState<boolean>(false);
  const [db, setDb] = useState<MasterDatabase>(INITIAL_MASTER_DB);
  const [state, setState] = useState<CalculatorState>(() =>
    createDefaultCalculatorState(INITIAL_MASTER_DB, 'nabila')
  );
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('manifest');
  const [savingQuote, setSavingQuote] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [desktopSidebarHidden, setDesktopSidebarHidden] =
    useState<boolean>(false);
  const [showParameterPanel, setShowParameterPanel] = useState<boolean>(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch Master Database from SQLite on mount & check optional URL params / localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBrand = localStorage.getItem('asthara_active_brand') as BrandId | null;
      if (savedBrand === 'nabila' || savedBrand === 'piknik') {
        setSelectedBrand(savedBrand);
      }
      const params = new URLSearchParams(window.location.search);
      const bParam = params.get('brand');
      if (bParam === 'nabila' || bParam === 'piknik') {
        setSelectedBrand(bParam);
      }
      const tParam = params.get('tab') as WorkspaceTab | null;
      if (
        tParam &&
        ['manifest', 'rab', 'proposal', 'database', 'history'].includes(tParam)
      ) {
        setActiveTab(tParam);
      }
    }

    fetch('/api/master')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setDb(res.data);
        }
      })
      .catch((err) => console.error('Gagal memuat /api/master:', err));
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleSelectBrand = (newBrand: BrandId) => {
    setSelectedBrand(newBrand);
    if (typeof window !== 'undefined') {
      localStorage.setItem('asthara_active_brand', newBrand);
    }
    setState(createDefaultCalculatorState(db, newBrand));
    setActiveTab('manifest');
    setMobileSidebarOpen(false);
    setShowEntityModal(false);
  };

  const activeBrand: BrandId = selectedBrand;

  // Real-time HPP Calculation memoized for active entity
  const calc = useMemo(() => {
    return calculateTrip(state, db, activeBrand);
  }, [state, db, activeBrand]);

  // If user requests full entity selector modal
  if (showEntityModal) {
    return (
      <EntitySelectorScreen
        onSelectBrand={handleSelectBrand}
        onClose={() => setShowEntityModal(false)}
      />
    );
  }

  const activeBrandMeta = BRANDS[selectedBrand];
  const isNabila = selectedBrand === 'nabila';
  const brandQuotationsCount = db.quotations.filter(
    (q) => q.brand === selectedBrand
  ).length;

  // Save Quotation to SQLite Database scoped to selectedBrand
  const handleSaveQuotation = async () => {
    setSavingQuote(true);
    try {
      const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
      const randCode = Math.floor(1000 + Math.random() * 9000);
      const quoteId = `QTC-${dateCode}-${randCode}`;

      const record: QuotationRecord = {
        quoteId,
        brand: selectedBrand,
        timestamp: new Date().toLocaleString('id-ID'),
        namaKlien: state.tripName || 'Custom Tour',
        pax: calc.totalPax,
        durasi: `${calc.days} Hari (${calc.nights} Malam)`,
        zona:
          state.distanceZone === 'near'
            ? 'Dalam Kota (<50km)'
            : state.distanceZone === 'medium'
            ? 'Luar Kota Dekat'
            : 'Luar Kota Jauh',
        armada: calc.armadaSummaryText,
        jumlahJeep: calc.jeepSummaryText,
        hppTotal: calc.finalHpp,
        hargaJualPerPax: calc.sellingPricePerPax,
        totalNilai: calc.totalRevenue,
        estimasiLaba: calc.totalProfit,
        status: 'Disimpan',
        payloadJson: JSON.stringify(state),
      };

      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      const data = await res.json();
      if (data.success) {
        setDb((prev) => ({
          ...prev,
          quotations: data.quotations,
        }));
        showToast(`Penawaran ${quoteId} berhasil disimpan!`);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan penawaran.');
    } finally {
      setSavingQuote(false);
    }
  };

  // Load Saved Quotation into Calculator
  const handleLoadQuotation = (q: QuotationRecord) => {
    try {
      const parsed = JSON.parse(q.payloadJson || '{}');
      const defaults = createDefaultCalculatorState(db, selectedBrand);
      setState({
        ...defaults,
        ...parsed,
        armadaPlanByDay: parsed.armadaPlanByDay || defaults.armadaPlanByDay,
        hotelPlanByNight: parsed.hotelPlanByNight || defaults.hotelPlanByNight,
        mealPlanByDay: parsed.mealPlanByDay || defaults.mealPlanByDay,
        snackPlanByDay: parsed.snackPlanByDay || defaults.snackPlanByDay,
        selectedDestByDay:
          parsed.selectedDestByDay || defaults.selectedDestByDay,
        customPriceOverrides: parsed.customPriceOverrides || {},
      });
      setActiveTab('rab');
      showToast(`Memuat penawaran ${q.quoteId} (${q.namaKlien})`);
    } catch (err) {
      console.error('Gagal parse payloadJson:', err);
    }
  };

  const handleDeleteQuotation = async (quoteId: string) => {
    try {
      const res = await fetch(
        `/api/quotations?quoteId=${encodeURIComponent(quoteId)}`,
        {
          method: 'DELETE',
        }
      );
      const data = await res.json();
      if (data.success) {
        setDb((prev) => ({
          ...prev,
          quotations: data.quotations,
        }));
        showToast(`Penawaran ${quoteId} dihapus.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMaster = async (updated: Partial<MasterDatabase>) => {
    const res = await fetch('/api/master', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    const data = await res.json();
    if (data.success && data.data) {
      setDb(data.data);
      showToast(`Database harga ${activeBrandMeta.name} berhasil disimpan!`);
    }
  };

  const handleResetMaster = async () => {
    const res = await fetch('/api/master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' }),
    });
    const data = await res.json();
    if (data.success && data.data) {
      setDb(data.data);
      showToast('Database dikembalikan ke standar awal Excel.');
    }
  };

  const handleUpdatePriceOverride = (key: string, value: number | null) => {
    setState((prev) => {
      const next = { ...prev.customPriceOverrides };
      if (value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return {
        ...prev,
        customPriceOverrides: next,
      };
    });
  };

  const selectSidebarTab = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
    if (tab === 'manifest' || tab === 'rab') {
      setShowParameterPanel(true);
    } else {
      setShowParameterPanel(false);
    }
  };

  const sidebarMenuItems: {
    id: WorkspaceTab;
    label: string;
    desc: string;
    icon: React.ReactNode;
    badge?: string | number;
  }[] = [
    {
      id: 'manifest',
      label: 'Manifest & Logistik',
      desc: 'Alokasi kru & armada lapangan',
      icon: <PackageCheck className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'rab',
      label: 'RAB HPP (Editable)',
      desc: 'Rincian biaya & negosiasi vendor',
      icon: <Receipt className="w-4 h-4 shrink-0" />,
      badge: calc.rabItems.length,
    },
    {
      id: 'proposal',
      label: 'Proposal Klien (PDF)',
      desc: 'Dokumen penawaran 4 halaman A4',
      icon: <FileText className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'database',
      label: 'Database Harga',
      desc: `Master tarif ${activeBrandMeta.shortName}`,
      icon: <Database className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'history',
      label: 'Riwayat Penawaran',
      desc: 'Arsip HPP tersimpan',
      icon: <History className="w-4 h-4 shrink-0" />,
      badge: brandQuotationsCount,
    },
  ];

  const isWideView =
    activeTab === 'database' ||
    activeTab === 'proposal' ||
    activeTab === 'history';
  const displayParameterPanel = !isWideView || showParameterPanel;

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col lg:flex-row print:h-auto print:overflow-visible">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2.5 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MOBILE TOP HEADER BAR */}
      <header className="no-print lg:hidden bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 px-3.5 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800 transition"
            aria-label="Buka Menu Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-slate-900 p-1 flex items-center justify-center shrink-0 border border-slate-800">
            <img
              src={activeBrandMeta.logoUrl}
              alt={activeBrandMeta.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black text-white truncate">
              {activeBrandMeta.name}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {activeBrandMeta.legalEntity}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            disabled={savingQuote}
            onClick={handleSaveQuotation}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center gap-1 shadow-md"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan</span>
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="no-print lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* MODERN HIDEABLE OBSIDIAN LEFT SIDEBAR */}
      <aside
        className={`no-print fixed lg:sticky top-0 left-0 z-50 lg:z-20 h-screen bg-slate-950 text-white border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
          mobileSidebarOpen
            ? 'translate-x-0 w-72 shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
        } ${
          desktopSidebarHidden
            ? 'lg:w-0 lg:border-r-0 lg:opacity-0 lg:pointer-events-none'
            : 'lg:w-68 lg:opacity-100'
        }`}
      >
        {/* Subtle Brand Radial Glow inside Sidebar */}
        <div
          className={`pointer-events-none absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-25 ${
            isNabila ? 'bg-red-600' : 'bg-orange-500'
          }`}
        />

        {/* Top Section: Active Entity Branding & Navigation Menu */}
        <div className="relative z-10 p-4 space-y-5 overflow-y-auto w-72 lg:w-68">
          {/* Active Brand Header inside Sidebar + Hide Button */}
          <div className="flex items-start justify-between gap-2 pb-4 border-b border-slate-800/90">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl bg-slate-900 p-1.5 flex items-center justify-center shrink-0 shadow-lg border ${
                  isNabila
                    ? 'border-red-500/40 shadow-red-600/10'
                    : 'border-orange-500/40 shadow-orange-500/10'
                }`}
              >
                <img
                  src={activeBrandMeta.logoUrl}
                  alt={activeBrandMeta.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-black tracking-tight text-white truncate">
                  {activeBrandMeta.name}
                </h1>
                <span
                  className={`inline-block mt-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                    isNabila
                      ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                      : 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                  }`}
                >
                  {activeBrandMeta.legalEntity}
                </span>
              </div>
            </div>

            {/* Hide Sidebar Button (Desktop) */}
            <button
              type="button"
              onClick={() => setDesktopSidebarHidden(true)}
              className="hidden lg:flex p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
              title="Sembunyikan Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>

            {/* Close Drawer Button (Mobile) */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Menu Navigation Group */}
          <div className="space-y-2">
            <div className="px-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Menu Navigasi Workspace
            </div>

            <nav className="space-y-1.5">
              {sidebarMenuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectSidebarTab(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-2xl transition-all flex items-center justify-between gap-2.5 group relative overflow-hidden ${
                      isActive
                        ? isNabila
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/25'
                          : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/25'
                        : 'text-slate-400 hover:bg-slate-900/90 hover:text-white border border-transparent hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`p-1.5 rounded-xl transition ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-900 text-slate-400 group-hover:text-white group-hover:bg-slate-800'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">
                          {item.label}
                        </div>
                        <div
                          className={`text-[10px] truncate ${
                            isActive ? 'text-white/80' : 'text-slate-500'
                          }`}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black shrink-0 ${
                          isActive
                            ? 'bg-black/25 text-white'
                            : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Live Glassmorphic Quick Summary Box inside Sidebar */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
              <span>Ringkasan Klien</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 font-mono text-[10px]">
                {calc.totalPax} Pax • {calc.days}H{calc.nights}M
              </span>
            </div>
            <div className="text-xs font-bold text-white truncate">
              {state.tripName || 'Custom Tour'}
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
              <span className="text-[10px] text-slate-400">Harga/Pax:</span>
              <span
                className={`text-xs font-black font-mono ${
                  isNabila ? 'text-red-400' : 'text-orange-400'
                }`}
              >
                {formatRupiah(calc.sellingPricePerPax)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Action Buttons (Simpan HPP, Reset, Ganti Entitas) */}
        <div className="relative z-10 p-4 border-t border-slate-800/90 bg-slate-950/90 space-y-2 w-72 lg:w-68">
          <button
            type="button"
            disabled={savingQuote}
            onClick={handleSaveQuotation}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingQuote ? 'Menyimpan...' : 'Simpan Penawaran HPP'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setState(createDefaultCalculatorState(db, selectedBrand));
                showToast('Parameter dikembalikan ke standar awal.');
              }}
              className="px-2.5 py-2 rounded-xl text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1.5 transition"
              title="Reset Parameter Kalkulator"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => setShowEntityModal(true)}
              className="px-2.5 py-2 rounded-xl text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1.5 transition"
              title="Buka Layar Pilihan Profil Entitas"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Entitas</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 pb-24 xl:pb-3 xl:h-screen xl:overflow-hidden print:h-auto print:overflow-visible">
        <main className="max-w-[1680px] mx-auto px-3 sm:px-5 pt-3 space-y-3 h-full flex flex-col">
          {/* MODERN TOP COMMAND BAR + KPI SUMMARY CARDS */}
          <div className="no-print space-y-3 shrink-0">
            <div className="no-print bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
              {/* Left: Hide/Show Sidebar Toggle + Brand Switcher + Active View Title */}
              <div className="flex items-center gap-3 min-w-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setDesktopSidebarHidden((prev) => !prev)}
                  className={`hidden lg:inline-flex items-center gap-2 h-9 px-3 rounded-xl text-xs font-bold border transition ${
                    desktopSidebarHidden
                      ? isNabila
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80'
                  }`}
                  title={
                    desktopSidebarHidden
                      ? 'Tampilkan Sidebar Navigasi'
                      : 'Sembunyikan Sidebar Navigasi'
                  }
                >
                  {desktopSidebarHidden ? (
                    <>
                      <PanelLeftOpen className="w-4 h-4" />
                      <span>Menu Sidebar</span>
                    </>
                  ) : (
                    <PanelLeftClose className="w-4 h-4" />
                  )}
                </button>

                {/* 1-Click Operational Brand Switcher Pill */}
                <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleSelectBrand('nabila')}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 ${
                      selectedBrand === 'nabila'
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Beralih ke operasional PT Asthara (Nabila Trip)"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedBrand === 'nabila' ? 'bg-white' : 'bg-red-500'
                      }`}
                    />
                    <span>PT ASTHARA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectBrand('piknik')}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 ${
                      selectedBrand === 'piknik'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Beralih ke operasional Piknik Enthusiast"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedBrand === 'piknik' ? 'bg-white' : 'bg-orange-500'
                      }`}
                    />
                    <span>Piknik Enthusiast</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEntityModal(true)}
                  className="hidden sm:inline-flex h-8 px-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 items-center gap-1.5 transition"
                  title="Buka Layar Pilihan Entitas Lengkap"
                >
                  <ArrowLeftRight className="w-3 h-3 text-slate-500" />
                  <span>Profil Entitas</span>
                </button>

                {/* Quick Navigation Pills when Sidebar is Hidden */}
                {desktopSidebarHidden && (
                  <div className="hidden xl:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
                    {sidebarMenuItems.map((item) => {
                      const active = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectSidebarTab(item.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            active
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {item.icon}
                          <span>{item.label.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-sm font-black text-slate-900 truncate">
                      {sidebarMenuItems.find((i) => i.id === activeTab)?.label}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Right: Quick Client Status Pills + Actions */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="hidden md:flex items-center gap-2.5 h-9 px-3.5 rounded-xl bg-slate-100/90 border border-slate-200/80 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <b>
                      {calc.totalPax} Pax
                      {calc.vipPax > 0 ? ` (${calc.vipPax} VIP)` : ''}
                    </b>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <b>
                      {calc.days}H{calc.nights}M
                    </b>
                  </span>
                </div>

                {isWideView && (
                  <button
                    type="button"
                    onClick={() => setShowParameterPanel((prev) => !prev)}
                    className="h-9 px-3.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center gap-1.5 transition"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>
                      {showParameterPanel
                        ? 'Tutup Parameter'
                        : 'Buka Parameter'}
                    </span>
                  </button>
                )}

                {desktopSidebarHidden && (
                  <button
                    type="button"
                    disabled={savingQuote}
                    onClick={handleSaveQuotation}
                    className="h-9 px-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center gap-1.5 shadow-sm hover:from-emerald-400 hover:to-teal-500 transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan HPP</span>
                  </button>
                )}
              </div>
            </div>

            <KpiSummaryCards brand={selectedBrand} state={state} calc={calc} />
          </div>

          {/* Workspace Grid: Parameter Panel + Active Tab Content */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start flex-1 min-h-0">
            {displayParameterPanel && (
              <div className="no-print xl:col-span-5 min-w-0">
                <ParameterPanel
                  brand={selectedBrand}
                  db={db}
                  state={state}
                  onChange={setState}
                />
              </div>
            )}

            <div
              ref={resultsRef}
              className={`${
                displayParameterPanel ? 'xl:col-span-7' : 'xl:col-span-12'
              } min-w-0`}
            >
              <ResultsWorkspace
                brand={selectedBrand}
                db={db}
                state={state}
                calc={calc}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onUpdatePriceOverride={handleUpdatePriceOverride}
                onResetAllPriceOverrides={() =>
                  setState((prev) => ({ ...prev, customPriceOverrides: {} }))
                }
                onSaveMaster={handleSaveMaster}
                onResetMaster={handleResetMaster}
                onLoadQuotation={handleLoadQuotation}
                onDeleteQuotation={handleDeleteQuotation}
              />
            </div>
          </div>
        </main>
      </div>

      {/* FLOATING MOBILE BOTTOM SUMMARY BAR */}
      <div className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 text-white backdrop-blur-md border-t border-slate-800 px-3.5 py-2.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
              <span>Harga Jual / Pax</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono ${
                  isNabila
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-orange-500/20 text-orange-300'
                }`}
              >
                {calc.totalPax} Pax
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-sm font-black font-mono ${
                  isNabila ? 'text-red-400' : 'text-orange-400'
                }`}
              >
                {formatRupiah(calc.sellingPricePerPax)}
              </span>
              <span className="text-[11px] font-mono text-slate-400 truncate">
                HPP: {formatRupiah(calc.hppPerPax)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => selectSidebarTab('rab')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-white flex items-center gap-1"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>RAB</span>
            </button>
            <button
              type="button"
              onClick={() => selectSidebarTab('proposal')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 ${
                isNabila ? 'bg-red-600' : 'bg-orange-600'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Proposal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
