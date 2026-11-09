'use client';

import React, { useState, useEffect } from 'react';
import {
  BrandId,
  CalculatorState,
  DistanceZone,
  MasterDatabase,
} from '@/types/trip';
import {
  formatRupiah,
  getArmadaRateForBrand,
  getAutoFitUnitsForVehicle,
  getAutoRecommendedArmada,
  getDestGuideForBrand,
  getDestHtmForBrand,
  getHotelRateForBrand,
  getJeepRateForBrand,
} from '@/lib/calculator';
import {
  Sparkles,
  Bus,
  Crown,
  MapPin,
  Compass,
  Hotel,
  Utensils,
  Camera,
  Plus,
  Trash2,
  Copy,
  Wand2,
  Search,
  ChevronDown,
  ChevronUp,
  Briefcase,
} from 'lucide-react';

interface ParameterPanelProps {
  brand: BrandId;
  db: MasterDatabase;
  state: CalculatorState;
  onChange: React.Dispatch<React.SetStateAction<CalculatorState>>;
}

type ParamSectionTab = 'armada' | 'rute' | 'akomodasi' | 'kru';

export default function ParameterPanel({
  brand,
  db,
  state,
  onChange,
}: ParameterPanelProps) {
  const [activeSection, setActiveSection] = useState<ParamSectionTab>('armada');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pTab = new URLSearchParams(window.location.search).get(
        'paramTab'
      ) as ParamSectionTab | null;
      if (pTab && ['armada', 'rute', 'akomodasi', 'kru'].includes(pTab)) {
        setActiveSection(pTab);
      }
    }
  }, []);
  const [showSmartBrief, setShowSmartBrief] = useState<boolean>(false);
  const [activeTransportDay, setActiveTransportDay] = useState<number>(1);
  const [activeDestDay, setActiveDestDay] = useState<number>(1);
  const [destSearch, setDestSearch] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const isNabila = brand === 'nabila';
  const accentText = isNabila ? 'text-red-600' : 'text-orange-600';
  const accentGradient = isNabila
    ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-red-600/20'
    : 'bg-gradient-to-r from-orange-600 to-amber-600 shadow-md shadow-orange-600/20';
  const accentLightBg = isNabila ? 'bg-red-50/80' : 'bg-orange-50/80';
  const accentLightBorder = isNabila ? 'border-red-300' : 'border-orange-300';

  const days = Math.max(1, Math.min(7, state.duration));
  const nights = Math.max(0, days - 1);
  const isVip = Boolean(state.incVip);
  const rawVip = isVip ? Math.max(0, state.vipPax || 0) : 0;
  const vipMode = state.vipPaxMode || 'add_to_pax';
  const effectiveTotalPax =
    isVip && vipMode === 'add_to_pax' ? state.pax + rawVip : state.pax;
  const vipPax =
    isVip
      ? vipMode === 'add_to_pax'
        ? rawVip
        : Math.min(state.pax, rawVip)
      : 0;
  const regularPax =
    isVip
      ? vipMode === 'add_to_pax'
        ? state.pax
        : Math.max(0, state.pax - vipPax)
      : state.pax;

  const safeTransportDay = Math.min(activeTransportDay, days);
  const safeDestDay = Math.min(activeDestDay, days);

  const updateField = <K extends keyof CalculatorState>(
    key: K,
    value: CalculatorState[K]
  ) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  // Handle Pax Change (and auto-adjust auto-mode armada days)
  const handlePaxChange = (newPax: number) => {
    const clampedPax = Math.max(1, Math.min(500, newPax || 1));
    const newRegPax =
      state.incVip && state.vipPaxMode === 'sub_allocation'
        ? Math.max(0, clampedPax - (state.vipPax || 0))
        : clampedPax;
    const autoRec = getAutoRecommendedArmada(newRegPax, db.armada);

    onChange((prev) => {
      const nextArmada = { ...prev.armadaPlanByDay };
      for (let d = 1; d <= 7; d++) {
        const dayPlan = nextArmada[d];
        if (!dayPlan || dayPlan.isAuto) {
          nextArmada[d] = {
            active: dayPlan ? dayPlan.active : true,
            isAuto: true,
            selected: { ...autoRec },
          };
        }
      }
      return {
        ...prev,
        pax: clampedPax,
        armadaPlanByDay: nextArmada,
      };
    });
  };

  // Handle Duration Change
  const handleDurationChange = (newDuration: number) => {
    const dCount = Math.max(1, Math.min(7, newDuration));
    const nCount = Math.max(0, dCount - 1);
    const defaultHtl =
      db.hotel.find((h) => h.klasifikasi.includes('3')) || db.hotel[0];
    const hRate = defaultHtl ? getHotelRateForBrand(defaultHtl, brand) : 600000;

    onChange((prev) => {
      const nextHotels = { ...prev.hotelPlanByNight };
      for (let n = 1; n <= 6; n++) {
        if (!nextHotels[n]) {
          nextHotels[n] = {
            active: n <= nCount,
            hotelNama: defaultHtl?.nama || 'Hotel Bintang 3',
            klasifikasi: defaultHtl?.klasifikasi || 'Bintang 3',
            wilayah: defaultHtl?.wilayah || 'Kota Malang',
            rate: hRate,
          };
        } else if (n <= nCount && n >= prev.duration) {
          nextHotels[n] = { ...nextHotels[n], active: true };
        }
      }
      return {
        ...prev,
        duration: dCount,
        vipVehDays: dCount,
        vipHotelNights: Math.max(1, nCount),
        vipMealDays: dCount,
        vipExtraBebanDays: dCount,
        runnerDays: dCount,
        fotoDays: dCount,
        hotelPlanByNight: nextHotels,
      };
    });
  };

  // Toggle Armada vehicle on a specific day
  const toggleArmadaVehicle = (
    day: number,
    armadaName: string,
    checked: boolean
  ) => {
    onChange((prev) => {
      const currentPlan = prev.armadaPlanByDay[day] || {
        active: true,
        isAuto: false,
        selected: {},
      };
      const nextSelected = { ...currentPlan.selected };

      if (checked) {
        const autoUnits = getAutoFitUnitsForVehicle(
          armadaName,
          regularPax,
          db.armada
        );
        nextSelected[armadaName] = autoUnits;
      } else {
        delete nextSelected[armadaName];
      }

      return {
        ...prev,
        armadaPlanByDay: {
          ...prev.armadaPlanByDay,
          [day]: {
            ...currentPlan,
            active: true,
            isAuto: false,
            selected: nextSelected,
          },
        },
      };
    });
  };

  const setArmadaUnitCount = (
    day: number,
    armadaName: string,
    count: number
  ) => {
    const units = Math.max(0, Math.min(50, count));
    onChange((prev) => {
      const currentPlan = prev.armadaPlanByDay[day] || {
        active: true,
        isAuto: false,
        selected: {},
      };
      const nextSelected = { ...currentPlan.selected };
      if (units <= 0) {
        delete nextSelected[armadaName];
      } else {
        nextSelected[armadaName] = units;
      }
      return {
        ...prev,
        armadaPlanByDay: {
          ...prev.armadaPlanByDay,
          [day]: {
            ...currentPlan,
            isAuto: false,
            selected: nextSelected,
          },
        },
      };
    });
  };

  const autoFitCurrentDayArmada = (day: number) => {
    onChange((prev) => {
      const currentPlan = prev.armadaPlanByDay[day];
      const selectedKeys = Object.keys(currentPlan?.selected || {});
      let nextSelected: Record<string, number> = {};

      if (selectedKeys.length === 1) {
        const vName = selectedKeys[0];
        nextSelected[vName] = getAutoFitUnitsForVehicle(
          vName,
          regularPax,
          db.armada
        );
      } else {
        nextSelected = getAutoRecommendedArmada(regularPax, db.armada);
      }

      return {
        ...prev,
        armadaPlanByDay: {
          ...prev.armadaPlanByDay,
          [day]: {
            active: true,
            isAuto: true,
            selected: nextSelected,
          },
        },
      };
    });
  };

  const copyCurrentDayArmadaToAll = (day: number) => {
    onChange((prev) => {
      const source = prev.armadaPlanByDay[day] || {
        active: true,
        isAuto: false,
        selected: {},
      };
      const nextAll: Record<number, any> = {};
      for (let d = 1; d <= 7; d++) {
        nextAll[d] = {
          active: source.active,
          isAuto: source.isAuto,
          selected: { ...source.selected },
        };
      }
      return {
        ...prev,
        armadaPlanByDay: nextAll,
      };
    });
  };

  const autoRecommendAllDaysArmada = () => {
    const autoRec = getAutoRecommendedArmada(regularPax, db.armada);
    onChange((prev) => {
      const nextAll: Record<number, any> = {};
      for (let d = 1; d <= 7; d++) {
        nextAll[d] = {
          active: true,
          isAuto: true,
          selected: { ...autoRec },
        };
      }
      return {
        ...prev,
        armadaPlanByDay: nextAll,
      };
    });
  };

  // AI Auto-Planner trigger
  const handleRunAiPlanner = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiSummary(null);
    try {
      const res = await fetch('/api/ai-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, brand }),
      });
      const data = await res.json();
      if (data.success && data.config) {
        onChange((prev) => ({
          ...prev,
          ...data.config,
        }));
        setAiSummary(data.summary);
      } else {
        setAiSummary(`⚠️ ${data.message || 'Gagal memproses brief AI.'}`);
      }
    } catch (err: any) {
      console.error('Error run ai planner:', err);
      setAiSummary(`⚠️ Terjadi kendala: ${err?.message || 'Gagal terhubung ke server.'}`);
    } finally {
      setAiLoading(false);
    }
  };

  const currentDayPlan = state.armadaPlanByDay[safeTransportDay] || {
    active: true,
    isAuto: true,
    selected: {},
  };

  // Compute active day seat capacity & subtotal
  let dayTotalSeats = 0;
  let dayTotalUnits = 0;
  let dayTotalCost = 0;
  if (currentDayPlan.active) {
    for (const [aName, u] of Object.entries(currentDayPlan.selected || {})) {
      const units = Number(u) || 0;
      if (units <= 0) continue;
      const row = db.armada.find((a) => a.nama === aName);
      const cap = row?.kapasitas || 14;
      const rate = row
        ? getArmadaRateForBrand(row, state.distanceZone, brand)
        : 1500000;
      dayTotalUnits += units;
      dayTotalSeats += units * cap;
      dayTotalCost += units * rate;
    }
  }

  const filteredDestinasi = db.destinasi.filter(
    (d) =>
      d.nama.toLowerCase().includes(destSearch.toLowerCase()) ||
      d.wilayah.toLowerCase().includes(destSearch.toLowerCase())
  );

  const totalSelectedDestCount = Object.entries(state.selectedDestByDay)
    .filter(([d]) => Number(d) <= days)
    .reduce((acc, [, list]) => acc + list.length, 0);

  const sectionTabs: {
    id: ParamSectionTab;
    label: string;
    badge?: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'armada',
      label: 'Armada',
      badge: state.incTransport ? `${dayTotalUnits}U` : 'Off',
      icon: <Bus className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: 'rute',
      label: 'Rute & Jeep',
      badge: `${totalSelectedDestCount}`,
      icon: <MapPin className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: 'akomodasi',
      label: 'Hotel & Makan',
      badge: nights > 0 && state.incHotel ? `${nights}M` : 'Makan',
      icon: <Hotel className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: 'kru',
      label: 'Kru & Acara',
      badge: state.enableLaba ? `${state.marginPct}%` : '0%',
      icon: <Camera className="w-3.5 h-3.5 shrink-0" />,
    },
  ];

  const seatFillPct = Math.min(
    100,
    Math.round((regularPax / Math.max(1, dayTotalSeats)) * 100)
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-md flex flex-col lg:h-[calc(100vh-158px)] overflow-hidden min-w-0">
      {/* MODERN DARK COMMAND HEADER DECK (Always visible, zero scroll needed) */}
      <div className="p-3.5 bg-slate-950 text-white space-y-2.5 shrink-0 relative overflow-hidden">
        {/* Subtle Brand Radial Accent */}
        <div
          className={`pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-25 ${
            isNabila ? 'bg-red-600' : 'bg-orange-500'
          }`}
        />

        {/* Row 1: Nama Klien + Smart Brief Toggle */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex-1 min-w-0 relative">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={state.tripName}
              onChange={(e) => updateField('tripName', e.target.value)}
              placeholder="Nama Klien / Instansi..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/90 border border-slate-800 rounded-xl focus:outline-none focus:border-slate-600 text-white font-bold placeholder-slate-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowSmartBrief((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition border ${
              showSmartBrief
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart Brief</span>
            {showSmartBrief ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Collapsible Smart Brief Drawer */}
        {showSmartBrief && (
          <div className="relative z-10 bg-slate-900/95 rounded-xl p-3 border border-slate-800 space-y-2">
            <textarea
              rows={2}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ketik brief klien: Gathering 2D1N Bromo & Batu 62 pax, Jeep Sunrise, Hotel Bintang 4, makan 3x..."
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setAiPrompt(
                      'Paket 2D1N Bromo & Batu 28 pax. Ada 2 direktur VIP minta Alphard & hotel bintang 5. Include jeep sunrise, makan 3x sehari, drone 1 hari.'
                    )
                  }
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300"
                >
                  2D1N + VIP (28p)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAiPrompt(
                      'Gathering 3D2N Bromo, Tumpak Sewu & Batu 62 pax. Hotel bintang 4, Jeep Semeru & Bromo, dokumentasi foto video drone.'
                    )
                  }
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300"
                >
                  3D2N Corp (62p)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAiPrompt(
                      '1 Hari Full Day Batu Fun Offroad & Petik Apel 14 pax.'
                    )
                  }
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300"
                >
                  1D Batu (14p)
                </button>
              </div>
              <button
                type="button"
                disabled={aiLoading || !aiPrompt.trim()}
                onClick={handleRunAiPlanner}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 ${accentGradient} disabled:opacity-50`}
              >
                <Wand2 className="w-3 h-3" />
                <span>{aiLoading ? 'Memetakan...' : 'Terapkan'}</span>
              </button>
            </div>
            {aiSummary && (
              <div
                className={`text-[10px] px-2.5 py-1.5 rounded border ${
                  aiSummary.startsWith('⚠️')
                    ? 'text-rose-400 bg-rose-950/40 border-rose-800'
                    : 'text-emerald-400 bg-slate-950 border-slate-800'
                }`}
              >
                {aiSummary}
              </div>
            )}
          </div>
        )}

        {/* Row 2: Compact 4-Column Tactile Metric Tiles (Pax, Durasi, Zona, Margin) */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Pax Input */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Peserta</span>
              <button
                type="button"
                onClick={() => updateField('isForeigner', !state.isForeigner)}
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                  state.isForeigner
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-300'
                }`}
                title="Klik untuk ganti WNI / WNA"
              >
                {state.isForeigner ? 'WNA' : 'WNI'}
              </button>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <input
                type="number"
                min={1}
                max={500}
                value={state.pax}
                onChange={(e) => handlePaxChange(parseInt(e.target.value, 10))}
                className="w-full font-mono text-xs font-black text-white bg-transparent focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 font-semibold">
                {isVip && vipMode === 'add_to_pax' ? 'Reg' : 'Pax'}
              </span>
            </div>
            {isVip && (
              <div className="text-[8.5px] text-amber-300 font-bold font-mono mt-0.5 truncate">
                {vipMode === 'add_to_pax'
                  ? `+${vipPax} VIP = ${effectiveTotalPax} Beban`
                  : `${vipPax} VIP / ${effectiveTotalPax} Beban`}
              </div>
            )}
          </div>

          {/* Durasi */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Durasi Tour
            </label>
            <select
              value={state.duration}
              onChange={(e) =>
                handleDurationChange(parseInt(e.target.value, 10))
              }
              className="w-full text-xs font-bold text-white bg-slate-900 focus:outline-none mt-0.5"
            >
              <option value={1}>1 Hari (Full Day)</option>
              <option value={2}>2H 1M (2D1N)</option>
              <option value={3}>3H 2M (3D2N)</option>
              <option value={4}>4H 3M (4D3N)</option>
              <option value={5}>5H 4M (5D4N)</option>
              <option value={6}>6H 5M (6D5N)</option>
              <option value={7}>7H 6M (7D6N)</option>
            </select>
          </div>

          {/* Zona Jarak */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Zona Jarak
            </label>
            <select
              value={state.distanceZone}
              onChange={(e) =>
                updateField('distanceZone', e.target.value as DistanceZone)
              }
              className="w-full text-xs font-bold text-white bg-slate-900 focus:outline-none mt-0.5"
            >
              <option value="near">Dalam Kota</option>
              <option value="medium">Luar Kota Dekat</option>
              <option value="far">Luar Kota Jauh</option>
            </select>
          </div>

          {/* Margin Laba Quick Control */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <div className="flex items-center justify-between text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
              <span>Margin Laba</span>
              <input
                type="checkbox"
                checked={state.enableLaba}
                onChange={(e) => updateField('enableLaba', e.target.checked)}
                className="w-3 h-3 rounded accent-emerald-500"
                title="Aktifkan Margin Laba"
              />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <input
                type="number"
                min={0}
                max={100}
                disabled={!state.enableLaba}
                value={state.enableLaba ? state.marginPct : 0}
                onChange={(e) =>
                  updateField('marginPct', parseInt(e.target.value, 10) || 0)
                }
                className="w-full font-mono text-xs font-black text-emerald-400 bg-transparent focus:outline-none disabled:text-slate-600"
              />
              <span className="text-[10px] text-emerald-500 font-bold">%</span>
            </div>
          </div>
        </div>

        {/* Modern Gradient Segmented Section Tabs */}
        <div className="relative z-10 grid grid-cols-4 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {sectionTabs.map((t) => {
            const active = activeSection === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveSection(t.id)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 min-w-0 ${
                  active
                    ? `${accentGradient} text-white`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                {t.icon}
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* INTERNAL SCROLLABLE TAB BODY */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-gradient-to-b from-slate-50/50 to-white">
        {/* ==================== TAB 1: ARMADA & VIP ==================== */}
        {activeSection === 'armada' && (
          <div className="space-y-3">
            {/* Armada Header */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.incTransport}
                  onChange={(e) =>
                    updateField('incTransport', e.target.checked)
                  }
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-xs font-black text-slate-900">
                  Include Kendaraan / Armada ({regularPax} Pax Reguler)
                </span>
              </label>

              {state.incTransport && (
                <button
                  type="button"
                  onClick={autoRecommendAllDaysArmada}
                  className="text-[11px] font-bold text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 bg-white shadow-2xs hover:bg-slate-50 transition"
                >
                  Auto-Fit Semua Hari
                </button>
              )}
            </div>

            {state.incTransport && (
              <div className="space-y-2.5">
                {/* Day Selector Pills + Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100/90 p-2 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {Array.from({ length: days }, (_, idx) => idx + 1).map(
                      (d) => {
                        const plan = state.armadaPlanByDay[d];
                        const uCount =
                          plan && plan.active
                            ? Object.values(plan.selected || {}).reduce(
                                (a, b) => a + (Number(b) || 0),
                                0
                              )
                            : 0;
                        const isActiveTab = safeTransportDay === d;
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setActiveTransportDay(d)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition flex items-center gap-1 ${
                              isActiveTab
                                ? `${accentGradient} text-white`
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span>Hari {d}</span>
                            <span className="opacity-85 font-mono text-[10px]">
                              ({uCount}U)
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => autoFitCurrentDayArmada(safeTransportDay)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
                    >
                      Auto H{safeTransportDay}
                    </button>
                    {days > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          copyCurrentDayArmadaToAll(safeTransportDay)
                        }
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 shadow-2xs"
                        title="Salin armada hari ini ke semua hari"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>Salin Semua Hari</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tactile Vehicle List */}
                <div className="grid grid-cols-1 gap-1.5">
                  {db.armada.map((veh) => {
                    const units =
                      Number(currentDayPlan.selected?.[veh.nama]) || 0;
                    const isChecked = units > 0;
                    const rate = getArmadaRateForBrand(
                      veh,
                      state.distanceZone,
                      brand
                    );

                    return (
                      <div
                        key={veh.id}
                        className={`px-3 py-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                          isChecked
                            ? `${accentLightBg} ${accentLightBorder} border-l-4 ${
                                isNabila
                                  ? 'border-l-red-600'
                                  : 'border-l-orange-600'
                              } shadow-xs`
                            : 'bg-white border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        <label className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              toggleArmadaVehicle(
                                safeTransportDay,
                                veh.nama,
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 rounded border-slate-300 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {veh.nama}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-900 text-white font-mono font-bold shrink-0">
                                {veh.kapasitas} Seat
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {formatRupiah(rate)}/hari
                              {isChecked && (
                                <span
                                  className={`ml-1.5 font-bold ${accentText}`}
                                >
                                  • Subtotal: {formatRupiah(units * rate)}
                                </span>
                              )}
                            </div>
                          </div>
                        </label>

                        {isChecked && (
                          <div className="flex items-center gap-1 shrink-0 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                            <button
                              type="button"
                              onClick={() =>
                                setArmadaUnitCount(
                                  safeTransportDay,
                                  veh.nama,
                                  units - 1
                                )
                              }
                              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={units}
                              onChange={(e) =>
                                setArmadaUnitCount(
                                  safeTransportDay,
                                  veh.nama,
                                  parseInt(e.target.value, 10) || 1
                                )
                              }
                              className="w-8 h-6 text-center font-mono text-xs font-black text-slate-900 bg-transparent focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setArmadaUnitCount(
                                  safeTransportDay,
                                  veh.nama,
                                  units + 1
                                )
                              }
                              className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Seat Capacity Progress Bar & Tol Row */}
                <div className="p-2.5 rounded-xl bg-slate-900 text-white space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-300">
                        Kapasitas H{safeTransportDay}:{' '}
                        <b className="text-white">{dayTotalSeats} Kursi</b>
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                          dayTotalSeats >= regularPax
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {seatFillPct}% Okupansi
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">
                        Tol & Parkir:
                      </span>
                      <input
                        type="number"
                        step={25000}
                        value={state.inputTol}
                        onChange={(e) =>
                          updateField(
                            'inputTol',
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-24 px-2 py-0.5 text-right font-mono text-xs font-bold border border-slate-700 rounded-lg bg-slate-950 text-white"
                      />
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        dayTotalSeats >= regularPax
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                          : 'bg-gradient-to-r from-amber-400 to-red-500'
                      }`}
                      style={{ width: `${seatFillPct}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Alokasi Khusus Tamu VIP & Beban Tambahan */}
            <div className="pt-2.5 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.incVip}
                    onChange={(e) => updateField('incVip', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 accent-amber-500"
                  />
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    Alokasi Khusus Tamu VIP / Direksi
                  </span>
                </label>
                {state.incVip && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    {vipPax} Pax VIP • {vipMode === 'add_to_pax' ? 'Menambah Beban' : 'Sub-Alokasi'}
                  </span>
                )}
              </div>

              {state.incVip && (
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-slate-50 border border-amber-200/90 shadow-xs space-y-3 text-xs">
                  {/* Mode Alokasi Beban VIP */}
                  <div className="space-y-1 bg-white/80 p-2 rounded-xl border border-amber-200/70">
                    <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Skema Beban Peserta VIP
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateField('vipPaxMode', 'add_to_pax')}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left transition flex items-center justify-between border ${
                          vipMode === 'add_to_pax'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>Menambah Beban Pax</span>
                        <span className="font-mono text-[9px] opacity-90">+{rawVip}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateField('vipPaxMode', 'sub_allocation')}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left transition flex items-center justify-between border ${
                          vipMode === 'sub_allocation'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>Sub-Alokasi Kuota</span>
                        <span className="font-mono text-[9px] opacity-90">Bagian Pax</span>
                      </button>
                    </div>
                    <div className="text-[9.5px] text-amber-800 font-medium">
                      {vipMode === 'add_to_pax' ? (
                        <span>
                          💡 <b>Menambah Beban:</b> {state.pax} Peserta Reguler + {rawVip} Tamu VIP = <b>{effectiveTotalPax} Beban Total Pax</b>.
                        </span>
                      ) : (
                        <span>
                          💡 <b>Sub-Alokasi:</b> Total {state.pax} Peserta (terdiri dari {regularPax} Reguler + {vipPax} VIP).
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Input Jml VIP & Mobil VIP */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-700 block mb-0.5">
                          Jml VIP
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={vipMode === 'sub_allocation' ? state.pax : 100}
                          value={state.vipPax}
                          onChange={(e) =>
                            updateField(
                              'vipPax',
                              Math.max(1, parseInt(e.target.value, 10) || 1)
                            )
                          }
                          className="w-full px-2 py-1 font-mono font-bold border border-amber-300 rounded-lg bg-white text-center focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div className="col-span-3">
                        <span className="text-[10px] font-bold text-slate-700 block mb-0.5">
                          Mobil Khusus VIP
                        </span>
                        <input
                          type="text"
                          value={state.vipVehName}
                          onChange={(e) =>
                            updateField('vipVehName', e.target.value)
                          }
                          placeholder="Contoh: Toyota Alphard Transformer"
                          className="w-full px-2 py-1 font-semibold border border-amber-300 rounded-lg bg-white focus:ring-1 focus:ring-amber-500 text-xs"
                        />
                      </div>
                    </div>

                    {/* Unit & Hari Sewa Mobil VIP */}
                    <div className="grid grid-cols-3 gap-2 bg-white/70 p-2 rounded-xl border border-amber-200/60">
                      <div>
                        <span className="text-[9.5px] font-bold text-slate-600 block">
                          Unit Mobil
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={state.vipVehUnits || 1}
                            onChange={(e) =>
                              updateField(
                                'vipVehUnits',
                                Math.max(1, parseInt(e.target.value, 10) || 1)
                              )
                            }
                            className="w-full px-2 py-1 font-mono font-bold border border-slate-300 rounded-lg bg-white text-center"
                          />
                          <span className="text-[10px] text-slate-500 font-semibold">Unit</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9.5px] font-bold text-slate-600 block">
                          Durasi Hari
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="number"
                            min={1}
                            max={days}
                            value={state.vipVehDays || days}
                            onChange={(e) =>
                              updateField(
                                'vipVehDays',
                                Math.max(1, Math.min(days, parseInt(e.target.value, 10) || 1))
                              )
                            }
                            className="w-full px-2 py-1 font-mono font-bold border border-slate-300 rounded-lg bg-white text-center"
                          />
                          <span className="text-[10px] text-slate-500 font-semibold">Hari</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9.5px] font-bold text-slate-600 block">
                          Tarif Sewa/Hari
                        </span>
                        <input
                          type="number"
                          step={100000}
                          value={state.vipVehRate}
                          onChange={(e) =>
                            updateField(
                              'vipVehRate',
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-full px-2 py-1 font-mono font-bold border border-slate-300 rounded-lg bg-white mt-0.5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kamar & Hotel VIP (Jika bermalam) */}
                  {nights > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-amber-200/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-700">
                          Akomodasi Hotel VIP
                        </span>
                        <span className="text-[9.5px] text-slate-500">
                          Maks {nights} Malam
                        </span>
                      </div>
                      <input
                        type="text"
                        value={state.vipHotelName}
                        onChange={(e) => updateField('vipHotelName', e.target.value)}
                        placeholder="Nama Hotel VIP / Suite"
                        className="w-full px-2 py-1 font-semibold border border-amber-300 rounded-lg bg-white text-xs"
                      />
                      <div className="grid grid-cols-3 gap-2 bg-white/70 p-2 rounded-xl border border-amber-200/60">
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-600 block">
                            Jml Kamar
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={state.vipHotelRooms || Math.max(1, Math.ceil(vipPax / 2))}
                              onChange={(e) =>
                                updateField(
                                  'vipHotelRooms',
                                  Math.max(1, parseInt(e.target.value, 10) || 1)
                                )
                              }
                              className="w-full px-2 py-1 font-mono font-bold border border-slate-300 rounded-lg bg-white text-center"
                            />
                            <span className="text-[10px] text-slate-500 font-semibold">Kmr</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[9.5px] font-bold text-slate-600 block">
                            Durasi Malam
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <input
                              type="number"
                              min={1}
                              max={nights}
                              value={state.vipHotelNights || nights}
                              onChange={(e) =>
                                updateField(
                                  'vipHotelNights',
                                  Math.max(1, Math.min(nights, parseInt(e.target.value, 10) || 1))
                                )
                              }
                              className="w-full px-2 py-1 font-mono font-bold border border-slate-300 rounded-lg bg-white text-center"
                            />
                            <span className="text-[10px] text-slate-500 font-semibold">Mlm</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[9.5px] font-bold text-slate-600 block">
                            Tarif Kamar/Mlm
                          </span>
                          <input
                            type="number"
                            step={50000}
                            value={state.vipHotelRate}
                            onChange={(e) =>
                              updateField(
                                'vipHotelRate',
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="w-full px-2 py-1 font-mono font-bold border border-slate-300 rounded-lg bg-white mt-0.5"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Jamuan Makan Khusus VIP */}
                  <div className="space-y-1.5 pt-2 border-t border-amber-200/60">
                    <div className="flex items-center justify-between">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={state.incVipMeal}
                          onChange={(e) => updateField('incVipMeal', e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-slate-300 accent-amber-500"
                        />
                        <span className="text-[11px] font-bold text-slate-800">
                          Jamuan Makan Eksklusif VIP
                        </span>
                      </label>
                      {state.incVipMeal && (
                        <span className="text-[10px] text-amber-700 font-bold font-mono">
                          {state.vipMealDays || days} Hari
                        </span>
                      )}
                    </div>

                    {state.incVipMeal && (
                      <div className="bg-white/70 p-2 rounded-xl border border-amber-200/60 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <span className="text-[9.5px] font-bold text-slate-600 block">
                              Restoran / Menu VIP
                            </span>
                            <input
                              type="text"
                              value={state.vipMealName}
                              onChange={(e) => updateField('vipMealName', e.target.value)}
                              className="w-full px-2 py-1 font-semibold border border-slate-300 rounded-lg bg-white text-xs mt-0.5"
                            />
                          </div>
                          <div>
                            <span className="text-[9.5px] font-bold text-slate-600 block">
                              Durasi Hari
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <input
                                type="number"
                                min={1}
                                max={days}
                                value={state.vipMealDays || days}
                                onChange={(e) =>
                                  updateField(
                                    'vipMealDays',
                                    Math.max(1, Math.min(days, parseInt(e.target.value, 10) || 1))
                                  )
                                }
                                className="w-full px-2 py-1 font-mono font-bold border border-slate-300 rounded-lg bg-white text-center"
                              />
                              <span className="text-[10px] text-slate-500 font-semibold">Hari</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="text-[9.5px] font-bold text-slate-500">Sesi:</span>
                            <label className="inline-flex items-center gap-1 cursor-pointer text-[10px]">
                              <input
                                type="checkbox"
                                checked={state.vipMealPagi}
                                onChange={(e) => updateField('vipMealPagi', e.target.checked)}
                                className="w-3 h-3 rounded border-slate-300"
                              />
                              <span>Pagi</span>
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer text-[10px]">
                              <input
                                type="checkbox"
                                checked={state.vipMealSiang}
                                onChange={(e) => updateField('vipMealSiang', e.target.checked)}
                                className="w-3 h-3 rounded border-slate-300"
                              />
                              <span>Siang</span>
                            </label>
                            <label className="inline-flex items-center gap-1 cursor-pointer text-[10px]">
                              <input
                                type="checkbox"
                                checked={state.vipMealMalam}
                                onChange={(e) => updateField('vipMealMalam', e.target.checked)}
                                className="w-3 h-3 rounded border-slate-300"
                              />
                              <span>Malam</span>
                            </label>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[9.5px] font-bold text-slate-500">Budget:</span>
                            <input
                              type="number"
                              step={10000}
                              value={state.vipMealRate}
                              onChange={(e) =>
                                updateField('vipMealRate', parseInt(e.target.value, 10) || 0)
                              }
                              className="w-24 px-1.5 py-0.5 font-mono font-bold border border-slate-300 rounded-lg bg-white text-right"
                            />
                            <span className="text-[9px] text-slate-400">/porsi</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Beban Tambahan / Amenities & Layanan VIP */}
                  <div className="space-y-1.5 pt-2 border-t border-amber-200/60">
                    <div className="flex items-center justify-between">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={state.incVipExtraBeban || false}
                          onChange={(e) => updateField('incVipExtraBeban', e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-slate-300 accent-amber-500"
                        />
                        <span className="text-[11px] font-bold text-slate-800">
                          Beban Layanan & Amenities Ekstra VIP
                        </span>
                      </label>
                      {state.incVipExtraBeban && (
                        <span className="text-[10px] text-amber-700 font-bold font-mono">
                          {state.vipExtraBebanDays || days} Hari
                        </span>
                      )}
                    </div>

                    {state.incVipExtraBeban && (
                      <div className="grid grid-cols-4 gap-2 bg-white/70 p-2 rounded-xl border border-amber-200/60">
                        <div className="col-span-2">
                          <span className="text-[9.5px] font-bold text-slate-600 block">
                            Deskripsi Beban VIP
                          </span>
                          <input
                            type="text"
                            value={state.vipExtraBebanName || 'Amenities & Layanan Khusus VIP'}
                            onChange={(e) => updateField('vipExtraBebanName', e.target.value)}
                            className="w-full px-2 py-1 font-semibold border border-slate-300 rounded-lg bg-white text-xs mt-0.5"
                          />
                        </div>
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-600 block">
                            Hari
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <input
                              type="number"
                              min={1}
                              max={days}
                              value={state.vipExtraBebanDays || days}
                              onChange={(e) =>
                                updateField(
                                  'vipExtraBebanDays',
                                  Math.max(1, Math.min(days, parseInt(e.target.value, 10) || 1))
                                )
                              }
                              className="w-full px-1.5 py-1 font-mono font-bold border border-slate-300 rounded-lg bg-white text-center"
                            />
                            <span className="text-[10px] text-slate-500 font-semibold">H</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-600 block">
                            Beban/Hari
                          </span>
                          <input
                            type="number"
                            step={50000}
                            value={state.vipExtraBebanBudget || 500000}
                            onChange={(e) =>
                              updateField('vipExtraBebanBudget', parseInt(e.target.value, 10) || 0)
                            }
                            className="w-full px-1.5 py-1 font-mono font-bold border border-slate-300 rounded-lg bg-white mt-0.5 text-right"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: RUTE DESTINASI & JEEP ==================== */}
        {activeSection === 'rute' && (
          <div className="space-y-3.5">
            {/* Day Selector + Search */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
                  const count = (state.selectedDestByDay[d] || []).length;
                  const active = safeDestDay === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setActiveDestDay(d)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition flex items-center gap-1 ${
                        active
                          ? `${accentGradient} text-white`
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      <span>Hari {d}</span>
                      <span className="font-mono text-[10px] opacity-85">
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative flex-1 min-w-[150px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={destSearch}
                  onChange={(e) => setDestSearch(e.target.value)}
                  placeholder="Cari wisata..."
                  className="w-full pl-7 pr-2.5 py-1 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* Destination Checklist */}
            <div className="grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto pr-0.5">
              {filteredDestinasi.map((dest) => {
                const dayList = state.selectedDestByDay[safeDestDay] || [];
                const isSelected = dayList.includes(dest.nama);
                const htm = getDestHtmForBrand(dest, state.isForeigner, brand);
                const guideFee = getDestGuideForBrand(dest, brand);

                return (
                  <div
                    key={dest.id}
                    className={`px-3 py-2 rounded-xl border transition-all ${
                      isSelected
                        ? `${accentLightBg} ${accentLightBorder} border-l-4 ${
                            isNabila
                              ? 'border-l-red-600'
                              : 'border-l-orange-600'
                          }`
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            onChange((prev) => {
                              const cur =
                                prev.selectedDestByDay[safeDestDay] || [];
                              const next = checked
                                ? [...cur, dest.nama]
                                : cur.filter((x) => x !== dest.nama);
                              return {
                                ...prev,
                                selectedDestByDay: {
                                  ...prev.selectedDestByDay,
                                  [safeDestDay]: next,
                                },
                              };
                            });
                          }}
                          className="w-4 h-4 rounded border-slate-300 shrink-0"
                        />
                        <div className="min-w-0 truncate">
                          <span className="text-xs font-bold text-slate-900">
                            {dest.nama}
                          </span>
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                            {dest.wilayah}
                          </span>
                        </div>
                      </label>
                      <span className="text-xs font-mono font-bold text-slate-900 shrink-0">
                        {formatRupiah(htm)}
                      </span>
                    </div>

                    {isSelected && dest.wajibGuide && guideFee > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                        <label className="inline-flex items-center gap-1.5 text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!state.guideDisabledDest[dest.nama]}
                            onChange={(e) =>
                              updateField('guideDisabledDest', {
                                ...state.guideDisabledDest,
                                [dest.nama]: !e.target.checked,
                              })
                            }
                            className="w-3 h-3 rounded"
                          />
                          <span>Guide Lokal ({formatRupiah(guideFee)})</span>
                        </label>
                        {!state.guideDisabledDest[dest.nama] && (
                          <div className="flex items-center gap-1">
                            <span>Guide:</span>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              value={
                                state.customGuideCounts[dest.nama] ||
                                Math.max(1, Math.ceil(state.pax / 10))
                              }
                              onChange={(e) =>
                                updateField('customGuideCounts', {
                                  ...state.customGuideCounts,
                                  [dest.nama]:
                                    parseInt(e.target.value, 10) || 1,
                                })
                              }
                              className="w-10 px-1 py-0.2 text-center font-mono text-[10px] border border-slate-300 rounded bg-white"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Armada Jeep 4x4 */}
            <div className="pt-2.5 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.incJeep}
                    onChange={(e) => updateField('incJeep', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Compass className={`w-3.5 h-3.5 ${accentText}`} />
                    Armada Jeep 4×4 & Adventure
                  </span>
                </label>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {state.incJeep
                    ? `${state.selectedJeepIds.length} Rute Aktif`
                    : 'Nonaktif'}
                </span>
              </div>

              {state.incJeep && (
                <div className="grid grid-cols-1 gap-1.5">
                  {db.jeep.map((j) => {
                    const checked = state.selectedJeepIds.includes(j.id);
                    const rate = getJeepRateForBrand(j, brand);
                    const autoUnits = Math.max(
                      1,
                      Math.ceil(state.pax / Math.max(1, j.kapasitas))
                    );

                    return (
                      <label
                        key={j.id}
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                          checked
                            ? `${accentLightBg} ${accentLightBorder} border-l-4 ${
                                isNabila
                                  ? 'border-l-red-600'
                                  : 'border-l-orange-600'
                              }`
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const isChk = e.target.checked;
                              updateField(
                                'selectedJeepIds',
                                isChk
                                  ? [...state.selectedJeepIds, j.id]
                                  : state.selectedJeepIds.filter(
                                      (id) => id !== j.id
                                    )
                              );
                            }}
                            className="w-4 h-4 rounded border-slate-300 shrink-0"
                          />
                          <div className="min-w-0 truncate">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {j.lokasiBasecamp}{' '}
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-white ml-1">
                                {autoUnits} Unit
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-900 shrink-0">
                          {formatRupiah(rate)}/U
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: HOTEL & KONSUMSI ==================== */}
        {activeSection === 'akomodasi' && (
          <div className="space-y-3.5">
            {/* Hotel Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.incHotel && nights > 0}
                    disabled={nights === 0}
                    onChange={(e) => updateField('incHotel', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Hotel className={`w-3.5 h-3.5 ${accentText}`} />
                    Akomodasi Hotel ({nights} Malam)
                  </span>
                </label>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {nights > 0
                    ? `${Math.ceil(regularPax / 2)} Kamar Twin`
                    : 'Tour 1 Hari (Tanpa Inap)'}
                </span>
              </div>

              {state.incHotel && nights > 0 && (
                <div className="space-y-1.5 bg-slate-100/80 p-2.5 rounded-xl border border-slate-200">
                  {Array.from({ length: nights }, (_, i) => i + 1).map((n) => {
                    const nPlan = state.hotelPlanByNight[n] || {
                      active: true,
                      hotelNama: db.hotel[0]?.nama || 'Hotel Bintang 3',
                      klasifikasi: 'Bintang 3',
                      wilayah: 'Kota Malang',
                      rate: 600000,
                    };

                    return (
                      <div
                        key={n}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            Malam ke-{n}
                          </span>
                          <label className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={nPlan.active}
                              onChange={(e) =>
                                updateField('hotelPlanByNight', {
                                  ...state.hotelPlanByNight,
                                  [n]: { ...nPlan, active: e.target.checked },
                                })
                              }
                              className="w-3.5 h-3.5 rounded"
                            />
                            <span>Menginap</span>
                          </label>
                        </div>
                        {nPlan.active && (
                          <div className="grid grid-cols-3 gap-1.5">
                            <select
                              value={nPlan.hotelNama}
                              onChange={(e) => {
                                const found = db.hotel.find(
                                  (h) => h.nama === e.target.value
                                );
                                if (found) {
                                  updateField('hotelPlanByNight', {
                                    ...state.hotelPlanByNight,
                                    [n]: {
                                      active: true,
                                      hotelNama: found.nama,
                                      klasifikasi: found.klasifikasi,
                                      wilayah: found.wilayah,
                                      rate: getHotelRateForBrand(found, brand),
                                    },
                                  });
                                }
                              }}
                              className="col-span-2 px-2 py-1 border border-slate-300 rounded-lg bg-white text-[11px] font-bold"
                            >
                              {db.hotel.map((h) => (
                                <option key={h.id} value={h.nama}>
                                  {h.nama} ({h.klasifikasi})
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              step={25000}
                              value={nPlan.rate}
                              onChange={(e) => {
                                const newRate =
                                  parseInt(e.target.value, 10) || 0;
                                updateField('hotelPlanByNight', {
                                  ...state.hotelPlanByNight,
                                  [n]: { ...nPlan, rate: newRate },
                                });
                                updateField('customPriceOverrides', {
                                  ...state.customPriceOverrides,
                                  [`hotel_night_${n}`]: newRate,
                                });
                              }}
                              className="px-2 py-1 font-mono font-bold text-right border border-slate-300 rounded-lg bg-white text-[11px]"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 font-bold text-[11px]">
                      <input
                        type="checkbox"
                        checked={state.incAkomodasiKru}
                        onChange={(e) =>
                          updateField('incAkomodasiKru', e.target.checked)
                        }
                        className="w-3.5 h-3.5 rounded"
                      />
                      <span>Tunjangan Kamar Kru/Driver</span>
                    </label>
                    {state.incAkomodasiKru && (
                      <input
                        type="number"
                        step={50000}
                        value={state.biayaAkomodasiKru}
                        onChange={(e) =>
                          updateField(
                            'biayaAkomodasiKru',
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-24 px-2 py-0.5 font-mono font-bold text-right text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Konsumsi Makan & Snack */}
            <div className="pt-2.5 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.incMeal}
                    onChange={(e) => updateField('incMeal', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Utensils className={`w-3.5 h-3.5 ${accentText}`} />
                    Konsumsi Makan Harian
                  </span>
                </label>
              </div>

              {state.incMeal && (
                <div className="space-y-1.5 bg-slate-100/80 p-2.5 rounded-xl border border-slate-200">
                  {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
                    const mPlan = state.mealPlanByDay[d] || {
                      sessions: ['siang', 'malam'],
                      budget: 50000,
                    };
                    const sessions = mPlan.sessions || [];
                    const toggleSession = (s: 'pagi' | 'siang' | 'malam') => {
                      const next = sessions.includes(s)
                        ? sessions.filter((x) => x !== s)
                        : [...sessions, s];
                      updateField('mealPlanByDay', {
                        ...state.mealPlanByDay,
                        [d]: { ...mPlan, sessions: next },
                      });
                    };

                    return (
                      <div
                        key={d}
                        className="px-3 py-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs shadow-2xs"
                      >
                        <span className="font-bold text-slate-800 w-12">
                          Hari {d}
                        </span>
                        <div className="flex items-center gap-2">
                          {(['pagi', 'siang', 'malam'] as const).map((sess) => (
                            <label
                              key={sess}
                              className="inline-flex items-center gap-1 cursor-pointer capitalize text-[11px] font-semibold text-slate-700"
                            >
                              <input
                                type="checkbox"
                                checked={sessions.includes(sess)}
                                onChange={() => toggleSession(sess)}
                                className="w-3.5 h-3.5 rounded"
                              />
                              <span>{sess}</span>
                            </label>
                          ))}
                        </div>
                        <input
                          type="number"
                          step={5000}
                          value={mPlan.budget}
                          onChange={(e) =>
                            updateField('mealPlanByDay', {
                              ...state.mealPlanByDay,
                              [d]: {
                                ...mPlan,
                                budget: parseInt(e.target.value, 10) || 0,
                              },
                            })
                          }
                          className="w-20 px-2 py-0.5 font-mono font-bold text-right text-[11px] border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Snack Box */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={state.incSnack}
                    onChange={(e) => updateField('incSnack', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span>Snack Box & Air Mineral</span>
                </label>
                {state.incSnack && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() =>
                          updateField('snackPlanByDay', {
                            ...state.snackPlanByDay,
                            [d]: !state.snackPlanByDay[d],
                          })
                        }
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                          state.snackPlanByDay[d]
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-400 border-slate-200'
                        }`}
                      >
                        H{d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: KRU, DOKUMENTASI, GALA & PAJAK ==================== */}
        {activeSection === 'kru' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 gap-2 text-xs">
              {/* Tour Leader */}
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={state.incTl}
                    onChange={(e) => updateField('incTl', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span>Tour Leader (TL)</span>
                </label>
                {state.incTl && (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={
                          state.customTlCount ??
                          Math.max(1, Math.ceil(state.pax / 25))
                        }
                        onChange={(e) =>
                          updateField(
                            'customTlCount',
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                        className="w-11 px-1.5 py-1 text-center font-mono font-bold text-[11px] bg-white focus:outline-none"
                      />
                      <span className="px-1.5 text-[10px] font-semibold text-slate-500 border-l border-slate-200">
                        Org
                      </span>
                    </div>

                    <span className="text-slate-400 font-bold">×</span>

                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                      <input
                        type="number"
                        min={1}
                        max={7}
                        value={state.customTlDays ?? days}
                        onChange={(e) =>
                          updateField(
                            'customTlDays',
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                        className="w-11 px-1.5 py-1 text-center font-mono font-bold text-[11px] bg-white focus:outline-none"
                      />
                      <span className="px-1.5 text-[10px] font-semibold text-slate-500 border-l border-slate-200">
                        Hari
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Crew Runner */}
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={state.incRunner}
                    onChange={(e) => updateField('incRunner', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span>Crew Runner</span>
                </label>
                {state.incRunner && (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={state.runnerCount}
                        onChange={(e) =>
                          updateField(
                            'runnerCount',
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                        className="w-11 px-1.5 py-1 text-center font-mono font-bold text-[11px] bg-white focus:outline-none"
                      />
                      <span className="px-1.5 text-[10px] font-semibold text-slate-500 border-l border-slate-200">
                        Org
                      </span>
                    </div>

                    <span className="text-slate-400 font-bold">×</span>

                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                      <input
                        type="number"
                        min={1}
                        max={7}
                        value={state.runnerDays || days}
                        onChange={(e) =>
                          updateField(
                            'runnerDays',
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                        className="w-11 px-1.5 py-1 text-center font-mono font-bold text-[11px] bg-white focus:outline-none"
                      />
                      <span className="px-1.5 text-[10px] font-semibold text-slate-500 border-l border-slate-200">
                        Hari
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Fotografer */}
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={state.incFoto}
                    onChange={(e) => updateField('incFoto', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span>Fotografer</span>
                </label>
                {state.incFoto && (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={state.fotoCount ?? 1}
                        onChange={(e) =>
                          updateField(
                            'fotoCount',
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                        className="w-11 px-1.5 py-1 text-center font-mono font-bold text-[11px] bg-white focus:outline-none"
                      />
                      <span className="px-1.5 text-[10px] font-semibold text-slate-500 border-l border-slate-200">
                        Tim
                      </span>
                    </div>

                    <span className="text-slate-400 font-bold">×</span>

                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                      <input
                        type="number"
                        min={1}
                        max={7}
                        value={state.fotoDays}
                        onChange={(e) =>
                          updateField(
                            'fotoDays',
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                        className="w-11 px-1.5 py-1 text-center font-mono font-bold text-[11px] bg-white focus:outline-none"
                      />
                      <span className="px-1.5 text-[10px] font-semibold text-slate-500 border-l border-slate-200">
                        Hari
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Videografer */}
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={state.incVideo}
                    onChange={(e) => updateField('incVideo', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span>Videografer</span>
                </label>
                {state.incVideo && (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={state.videoCount ?? 1}
                        onChange={(e) =>
                          updateField(
                            'videoCount',
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                        className="w-11 px-1.5 py-1 text-center font-mono font-bold text-[11px] bg-white focus:outline-none"
                      />
                      <span className="px-1.5 text-[10px] font-semibold text-slate-500 border-l border-slate-200">
                        Tim
                      </span>
                    </div>

                    <span className="text-slate-400 font-bold">×</span>

                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                      <input
                        type="number"
                        min={1}
                        max={7}
                        value={state.videoDays}
                        onChange={(e) =>
                          updateField(
                            'videoDays',
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                        className="w-11 px-1.5 py-1 text-center font-mono font-bold text-[11px] bg-white focus:outline-none"
                      />
                      <span className="px-1.5 text-[10px] font-semibold text-slate-500 border-l border-slate-200">
                        Hari
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pilot Drone */}
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={state.incDrone}
                    onChange={(e) => updateField('incDrone', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span>Pilot Drone</span>
                </label>
                {state.incDrone && (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={state.droneCount ?? 1}
                        onChange={(e) =>
                          updateField(
                            'droneCount',
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                        className="w-11 px-1.5 py-1 text-center font-mono font-bold text-[11px] bg-white focus:outline-none"
                      />
                      <span className="px-1.5 text-[10px] font-semibold text-slate-500 border-l border-slate-200">
                        Unit
                      </span>
                    </div>

                    <span className="text-slate-400 font-bold">×</span>

                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                      <input
                        type="number"
                        min={1}
                        max={7}
                        value={state.droneDays}
                        onChange={(e) =>
                          updateField(
                            'droneDays',
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                        className="w-11 px-1.5 py-1 text-center font-mono font-bold text-[11px] bg-white focus:outline-none"
                      />
                      <span className="px-1.5 text-[10px] font-semibold text-slate-500 border-l border-slate-200">
                        Hari
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Spanduk */}
              <div className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={state.incBanner}
                    onChange={(e) => updateField('incBanner', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span>Spanduk (3×1m)</span>
                </label>
                {state.incBanner ? (
                  <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={state.bannerCount ?? 1}
                      onChange={(e) =>
                        updateField(
                          'bannerCount',
                          parseInt(e.target.value, 10) || 1
                        )
                      }
                      className="w-11 px-1.5 py-1 text-center font-mono font-bold text-[11px] bg-white focus:outline-none"
                    />
                    <span className="px-1.5 text-[10px] font-semibold text-slate-500 border-l border-slate-200">
                      Pcs
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    Nonaktif
                  </span>
                )}
              </div>
            </div>

            {/* Gala Dinner */}
            <div className="pt-2.5 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.incGala}
                    onChange={(e) => updateField('incGala', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-xs font-black text-slate-900">
                    Paket Gala Dinner & Entertainment
                  </span>
                </label>
                {state.incGala && (
                  <button
                    type="button"
                    onClick={() =>
                      updateField('galaDinnerItems', [
                        ...state.galaDinnerItems,
                        {
                          id: `gala_${Date.now()}`,
                          nama: 'Item Acara Tambahan',
                          price: 500000,
                          qty: 1,
                          days: 1,
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 bg-white shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah</span>
                  </button>
                )}
              </div>

              {state.incGala && (
                <div className="space-y-1.5">
                  {state.galaDinnerItems.map((gItem, idx) => (
                    <div
                      key={gItem.id}
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-1.5 text-xs"
                    >
                      <input
                        type="text"
                        value={gItem.nama}
                        onChange={(e) => {
                          const next = [...state.galaDinnerItems];
                          next[idx] = { ...gItem, nama: e.target.value };
                          updateField('galaDinnerItems', next);
                        }}
                        className="flex-1 min-w-0 px-2 py-1 border border-slate-300 rounded-lg bg-white text-[11px] font-semibold"
                      />
                      <input
                        type="number"
                        value={gItem.price}
                        onChange={(e) => {
                          const next = [...state.galaDinnerItems];
                          next[idx] = {
                            ...gItem,
                            price: parseInt(e.target.value, 10) || 0,
                          };
                          updateField('galaDinnerItems', next);
                        }}
                        className="w-24 px-2 py-1 font-mono font-bold text-right border border-slate-300 rounded-lg bg-white text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateField(
                            'galaDinnerItems',
                            state.galaDinnerItems.filter((_, i) => i !== idx)
                          )
                        }
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pajak / Buffer HPP */}
            <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-bold">
                Pajak / Cadangan Buffer HPP
              </span>
              <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-100 text-[11px] font-mono">
                {[0, 2, 5].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => updateField('taxPct', pct)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition ${
                      state.taxPct === pct
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {pct === 0 ? '0%' : pct === 2 ? '2% Pajak' : '5% Buffer'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
