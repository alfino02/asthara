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
  const accentText = isNabila ? 'text-red-600' : 'text-orange-600';
  const accentLightBg = isNabila ? 'bg-red-50' : 'bg-orange-50';

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

  return (
    <>
      {/* ================= PAGE 1: COVER & RINGKASAN EKSEKUTIF ================= */}
      <div className={getPageClass(1, false)}>
        <div>
          {/* Header Kop Surat */}
          <div
            className={`flex items-center justify-between pb-3.5 border-b-2 ${accentBorder}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-950 p-1.5 flex items-center justify-center shrink-0">
                <img
                  src={b.logoUrl}
                  alt={b.name}
                  loading="eager"
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
          <div className="mt-5 p-5 rounded-xl bg-slate-900 text-white space-y-2">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${accentBg}`}
            >
              Proposal Penawaran Perjalanan Wisata
            </span>
            <h2 className="text-xl font-black tracking-tight leading-snug">
              {state.tripName || 'Program Custom Tour & Gathering Eksklusif'}
            </h2>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Disusun secara khusus oleh tim {b.name} ({b.legalEntity}) dengan
              standar pelayanan prima, armada pariwisata terbaik, serta
              manajemen operasional lapangan terpadu.
            </p>
          </div>

          {/* Grid Parameter Ringkas */}
          <div className="mt-5 grid grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-1.5 text-[11px]">
              <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                Informasi Rombongan
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200/70 gap-2">
                <span className="text-slate-500">Klien:</span>
                <span className="font-bold text-slate-900 text-right">
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

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-1.5 text-[11px]">
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
                <span className="font-semibold text-slate-900 text-right">
                  {calc.armadaSummaryText}
                </span>
              </div>
              <div className="flex justify-between py-0.5 gap-2">
                <span className="text-slate-500">Hotel:</span>
                <span className="font-semibold text-slate-900 text-right">
                  {calc.hotelSummaryText}
                </span>
              </div>
            </div>
          </div>

          {/* Highlight Box Harga */}
          <div
            className={`mt-5 p-4 rounded-xl border-2 ${accentBorder} ${accentLightBg}/40 flex items-center justify-between gap-3`}
          >
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                Investasi Paket Perjalanan
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-0.5">
                {formatRupiah(calc.sellingPricePerPax)}{' '}
                <span className="text-xs font-sans font-semibold text-slate-500">
                  / Pax
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Kuota {calc.totalPax} peserta • All-in sesuai rincian fasilitas
                resmi
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-semibold">
                Total Nilai Paket
              </div>
              <div className={`text-base font-black font-mono ${accentText}`}>
                {formatRupiah(calc.totalRevenue)}
              </div>
            </div>
          </div>

          {/* Executive Highlights Strip */}
          <div className="mt-5 grid grid-cols-4 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[9px] font-bold uppercase text-slate-400">
                Destinasi
              </div>
              <div className="text-sm font-black font-mono text-slate-900 mt-0.5">
                {totalSelectedDest} Objek
              </div>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[9px] font-bold uppercase text-slate-400">
                Akomodasi
              </div>
              <div className="text-sm font-black font-mono text-slate-900 mt-0.5">
                {state.incHotel && calc.nights > 0
                  ? `${calc.nights} Malam`
                  : 'Non-Hotel'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[9px] font-bold uppercase text-slate-400">
                Tour Leader
              </div>
              <div className="text-sm font-black font-mono text-slate-900 mt-0.5">
                {state.incTl ? `${calc.tlCount} Orang` : 'Opsional'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[9px] font-bold uppercase text-slate-400">
                Lampiran Dokumen
              </div>
              <div className="text-sm font-black font-mono text-slate-900 mt-0.5">
                {includeRab ? 'Proposal + RAB' : 'Proposal Klien'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Page 1 */}
        <div className="mt-6 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <span>
            {b.name} — {b.legalEntity}
          </span>
          <span className="font-bold text-slate-600">
            Halaman 1 dari {totalPages}
          </span>
        </div>
      </div>

      {/* ================= PAGE 2: RENCANA PERJALANAN & DESTINASI HARIAN ================= */}
      <div className={getPageClass(2, calc.days > 4)}>
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Rencana Rute & Destinasi Harian (Itinerary)
              </h2>
              <p className="text-[10px] text-slate-500">
                Jadwal kunjungan objek wisata untuk program {calc.days} Hari{' '}
                {calc.nights > 0 ? `${calc.nights} Malam` : '(Full Day)'}
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {docNumber}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {Array.from({ length: calc.days }, (_, idx) => idx + 1).map((d) => {
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
                  className="pdf-avoid-break rounded-xl border border-slate-200 overflow-hidden"
                >
                  <div className="bg-slate-900 text-white px-3.5 py-2 flex items-center justify-between text-[11px]">
                    <span className="font-bold uppercase tracking-wider">
                      Hari ke-{d} Perjalanan
                    </span>
                    <span className="text-slate-300 font-mono text-[10px]">
                      Armada: {armadaDesc}
                    </span>
                  </div>

                  <div className="p-3 bg-white space-y-2 text-[11px]">
                    {destList.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1.5">
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
                        Acara bebas / perjalanan transfer / penyesuaian jadwal
                        lapangan.
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
                            Hotel: <b>{state.hotelPlanByNight[d].hotelNama}</b>
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {state.incJeep && state.selectedJeepIds.length > 0 && (
            <div className="pdf-avoid-break mt-3.5 p-3 rounded-xl border border-amber-200 bg-amber-50/60 text-[11px] flex items-center justify-between gap-2">
              <div>
                <div className="font-black text-amber-950 uppercase text-[10px] tracking-wider">
                  Armada Khusus Jeep 4×4 & Adventure
                </div>
                <div className="text-amber-900 mt-0.5 font-semibold">
                  {calc.jeepSummaryText}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-200/80 text-amber-950 font-mono font-bold text-[10px] shrink-0">
                Termasuk Paket
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <span>
            {b.name} — {b.legalEntity}
          </span>
          <span className="font-bold text-slate-600">
            Halaman 2 dari {totalPages}
          </span>
        </div>
      </div>

      {/* ================= PAGE 3: FASILITAS INCLUDE & EXCLUDE ================= */}
      <div className={getPageClass(3, clientManifestItems.length > 14)}>
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
          <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
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
                {clientManifestItems.map((m, idx) => (
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
          <div className="pdf-avoid-break mt-4 grid grid-cols-2 gap-3 text-[11px]">
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
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
                    • Penginapan {calc.nights} malam ({calc.hotelSummaryText})
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
                {(state.incFoto || state.incVideo || state.incDrone) && (
                  <li>
                    • Dokumentasi profesional (
                    {[
                      state.incFoto && 'Fotografer',
                      state.incVideo && 'Videografer',
                      state.incDrone && 'Drone',
                    ]
                      .filter(Boolean)
                      .join(', ')}
                    )
                  </li>
                )}
                {state.incBanner && <li>• Spanduk / banner kegiatan (3×1m)</li>}
                {state.incP3k && <li>• Kotak P3K standar perjalanan</li>}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                <XCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Belum Termasuk (Exclude)</span>
              </div>
              <ul className="space-y-1 text-slate-600 text-[10px]">
                <li>
                  • Tiket pesawat / kereta menuju & dari kota penjemputan
                </li>
                <li>• Pengeluaran pribadi (laundry, minibar, oleh-oleh)</li>
                <li>• Wahana opsional di luar tiket terusan</li>
                <li>• Tipping sukarela kru lapangan</li>
                {!state.incHotel && calc.nights > 0 && (
                  <li>• Akomodasi penginapan / hotel</li>
                )}
                {!state.incMeal && <li>• Konsumsi makan harian peserta</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <span>
            {b.name} — {b.legalEntity}
          </span>
          <span className="font-bold text-slate-600">
            Halaman 3 dari {totalPages}
          </span>
        </div>
      </div>

      {/* ================= PAGE 4: RINCIAN HARGA, SYARAT & REKENING RESMI ================= */}
      <div className={getPageClass(4, false)}>
        <div>
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Rincian Penawaran Harga & Ketentuan Reservasi
              </h2>
              <p className="text-[10px] text-slate-500">
                Rekapitulasi biaya investasi dan prosedur konfirmasi pemesanan
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {docNumber}
            </span>
          </div>

          {/* Tabel Harga Resmi */}
          <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
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
                      {calc.nights > 0 ? `${calc.nights} Malam` : '(Full Day)'}{' '}
                      • {calc.armadaSummaryText}
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
          <div className="mt-4 grid grid-cols-2 gap-3.5 text-[11px]">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                Ketentuan Pembayaran
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[10px]">
                <li>
                  Down Payment (DP){' '}
                  <b>30% ({formatRupiah(calc.totalRevenue * 0.3)})</b> saat
                  konfirmasi pemesanan.
                </li>
                <li>
                  Pelunasan <b>70% ({formatRupiah(calc.totalRevenue * 0.7)})</b>{' '}
                  maksimal H-3 keberangkatan.
                </li>
                <li>
                  Penawaran berlaku 14 hari sejak tanggal diterbitkan ({todayStr}
                  ).
                </li>
              </ol>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${accentBorder} ${accentLightBg}/30 space-y-1`}
            >
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                Rekening Pembayaran Resmi
              </div>
              <div className="text-slate-500 text-[10px]">Bank Tujuan:</div>
              <div className="font-bold text-slate-900">{b.bankName}</div>
              <div className="text-slate-500 text-[10px]">Nomor Rekening:</div>
              <div className={`text-sm font-mono font-black ${accentText}`}>
                {b.bankAccountNumber}
              </div>
              <div className="text-slate-600 text-[10px]">
                a/n <b>{b.bankAccountHolder}</b>
              </div>
            </div>
          </div>

          {/* Signature Block */}
          <div className="mt-8 grid grid-cols-2 gap-6 text-[11px] text-center">
            <div className="space-y-12">
              <div className="font-semibold text-slate-600">
                Disetujui Oleh Klien,
              </div>
              <div className="border-t border-slate-300 pt-1.5 w-56 mx-auto font-bold text-slate-800 leading-snug">
                {state.tripName}
              </div>
            </div>

            <div className="space-y-12">
              <div className="font-semibold text-slate-600">Hormat Kami,</div>
              <div className="border-t border-slate-300 pt-1.5 w-44 mx-auto">
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
        <div className="mt-6 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
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
          <span className="font-bold text-slate-600">
            Halaman 4 dari {totalPages}
          </span>
        </div>
      </div>

      {/* ================= PAGE 5: RINCIAN ANGGARAN BIAYA POKOK (RAB HPP) ================= */}
      {includeRab && (
        <div className={getPageClass(5, true)}>
          <div>
            {/* Header RAB HPP */}
            <div
              className={`flex items-center justify-between pb-2.5 border-b-2 ${accentBorder}`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg ${accentBg} text-white flex items-center justify-center shrink-0`}
                >
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Rincian Anggaran Biaya Pokok (RAB HPP)
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    {state.tripName} • {calc.totalPax} Pax ({calc.days}H
                    {calc.nights}M) • {b.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider">
                  Lampiran RAB HPP
                </span>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {docNumber}
                </div>
              </div>
            </div>

            {/* 4-Card KPI Strip */}
            <div className="mt-3 grid grid-cols-4 gap-2 text-[10px]">
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-[9px] font-bold uppercase text-slate-400">
                  HPP Pokok ({calc.rabItems.length} Item)
                </div>
                <div className="text-xs font-black font-mono text-slate-900 mt-0.5">
                  {formatRupiah(calc.totalBaseCost)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70">
                <div className="text-[9px] font-bold uppercase text-amber-700">
                  Buffer / Pajak ({state.taxPct}%)
                </div>
                <div className="text-xs font-black font-mono text-amber-900 mt-0.5">
                  {formatRupiah(calc.taxOrBufferCost)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-900 bg-slate-900 text-white">
                <div className="text-[9px] font-bold uppercase text-slate-300">
                  Total HPP Final
                </div>
                <div className="text-xs font-black font-mono text-white mt-0.5">
                  {formatRupiah(calc.finalHpp)}
                </div>
                <div className="text-[9px] font-mono text-slate-300">
                  {formatRupiah(calc.hppPerPax)} / pax
                </div>
              </div>
              <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80">
                <div className="text-[9px] font-bold uppercase text-emerald-700">
                  Estimasi Laba ({state.enableLaba ? `${state.marginPct}%` : '0%'})
                </div>
                <div className="text-xs font-black font-mono text-emerald-900 mt-0.5">
                  {formatRupiah(calc.totalProfit)}
                </div>
                <div className="text-[9px] font-mono text-emerald-700">
                  Jual: {formatRupiah(calc.sellingPricePerPax)}/pax
                </div>
              </div>
            </div>

            {/* Tabel Rincian RAB HPP */}
            <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-900 text-white text-[9px] uppercase tracking-wider">
                    <th className="py-1.5 px-2 w-7 text-center">No</th>
                    <th className="py-1.5 px-2.5">Item Pengeluaran</th>
                    <th className="py-1.5 px-2 text-center">Volume</th>
                    <th className="py-1.5 px-2.5 text-right">Harga Satuan</th>
                    <th className="py-1.5 px-2.5 text-right">Subtotal Biaya</th>
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
                        <div className="font-bold text-slate-900 leading-snug flex flex-wrap items-center gap-1">
                          <span>{item.label}</span>
                          {item.isOverridden && (
                            <span className="px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[8px] font-bold uppercase">
                              Custom
                            </span>
                          )}
                        </div>
                        {item.subLabel && (
                          <div className="text-[9px] text-slate-500 leading-tight">
                            {item.subLabel}
                          </div>
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {item.volumeText}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-mono text-slate-700 whitespace-nowrap">
                        {formatRupiah(item.unitPrice)}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rekapitulasi Akhir RAB HPP & Harga Jual */}
            <div className="pdf-avoid-break mt-3 rounded-xl border border-slate-200 overflow-hidden text-[10px]">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-semibold">
                  Subtotal HPP Pokok Operasional ({calc.rabItems.length} komponen)
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {formatRupiah(calc.totalBaseCost)}
                </span>
              </div>
              <div className="bg-white px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                <span className="text-slate-600 font-semibold">
                  Pajak / Cadangan Buffer HPP ({state.taxPct}%)
                </span>
                <span className="font-mono font-bold text-amber-700">
                  {formatRupiah(calc.taxOrBufferCost)}
                </span>
              </div>
              <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between">
                <div>
                  <span className="font-black uppercase tracking-wider text-[10px]">
                    Total HPP Final
                  </span>
                  <span className="ml-2 text-[9px] font-mono text-slate-300">
                    (Modal HPP/Pax: {formatRupiah(calc.hppPerPax)})
                  </span>
                </div>
                <span className="font-mono font-black text-xs text-white">
                  {formatRupiah(calc.finalHpp)}
                </span>
              </div>
              <div className="bg-emerald-50/70 px-3 py-2 border-t border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-900">
                  Margin Laba Kotor ({state.enableLaba ? `${state.marginPct}%` : '0%'})
                </span>
                <span className="font-mono font-black text-emerald-800">
                  + {formatRupiah(calc.totalProfit)}
                </span>
              </div>
              <div
                className={`${accentLightBg} px-3 py-2 border-t ${accentBorder} flex items-center justify-between`}
              >
                <div>
                  <span className="font-black uppercase tracking-wider text-slate-900">
                    Total Harga Jual Penawaran ({calc.totalPax} Pax)
                  </span>
                  <span className="ml-2 font-mono font-bold text-slate-700">
                    ({formatRupiah(calc.sellingPricePerPax)} / Pax)
                  </span>
                </div>
                <span className={`font-mono font-black text-xs ${accentText}`}>
                  {formatRupiah(calc.totalRevenue)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Page 5 */}
          <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span>
              {b.name} — {b.legalEntity} • Lampiran Rincian RAB HPP
            </span>
            <span className="font-bold text-slate-600">
              Halaman 5 dari {totalPages}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
