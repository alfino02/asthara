'use client';

import React, { useState } from 'react';
import {
  BrandId,
  MasterDatabase,
} from '@/types/trip';
import { BRANDS } from '@/lib/brands';
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  MapPin,
  Bus,
  Hotel,
  Compass,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

interface MasterDatabaseViewProps {
  brand: BrandId;
  db: MasterDatabase;
  onSaveMaster: (updated: Partial<MasterDatabase>) => Promise<void>;
  onResetMaster: () => Promise<void>;
}

type SubTable = 'destinasi' | 'armada' | 'hotel' | 'jeep' | 'operasional';

export default function MasterDatabaseView({
  brand,
  db,
  onSaveMaster,
  onResetMaster,
}: MasterDatabaseViewProps) {
  const [activeTable, setActiveTable] = useState<SubTable>('destinasi');
  const [localDb, setLocalDb] = useState<MasterDatabase>(db);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  React.useEffect(() => {
    setLocalDb(db);
  }, [db]);

  const bMeta = BRANDS[brand];
  const isNabila = brand === 'nabila';
  const accentBg = isNabila
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-orange-600 hover:bg-orange-700';
  const priceColBg = isNabila ? 'bg-red-50/40' : 'bg-orange-50/40';
  const priceHeadBg = isNabila
    ? 'bg-red-50/70 text-red-800'
    : 'bg-orange-50/70 text-orange-800';
  const priceInputBorder = isNabila ? 'border-red-200' : 'border-orange-200';

  const handleSave = async () => {
    setSaving(true);
    setSavedNotice(null);
    try {
      await onSaveMaster({
        destinasi: localDb.destinasi,
        armada: localDb.armada,
        hotel: localDb.hotel,
        jeep: localDb.jeep,
        operasional: localDb.operasional,
      });
      setSavedNotice('Tersimpan ke Database');
      setTimeout(() => setSavedNotice(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const addNewRow = () => {
    if (activeTable === 'destinasi') {
      const nextNum = localDb.destinasi.length + 1;
      const newId = `D${String(nextNum).padStart(3, '0')}`;
      setLocalDb((prev) => ({
        ...prev,
        destinasi: [
          ...prev.destinasi,
          {
            id: newId,
            nama: 'Destinasi Wisata Baru',
            wilayah: 'Batu, Malang',
            htmDomestikNabila: 50000,
            htmDomestikPiknik: 50000,
            htmMancanegaraNabila: 100000,
            htmMancanegaraPiknik: 100000,
            wajibGuide: false,
            biayaGuideNabila: 0,
            biayaGuidePiknik: 0,
            kapasitasGuide: 10,
            keterangan: '',
          },
        ],
      }));
    } else if (activeTable === 'armada') {
      const nextNum = localDb.armada.length + 1;
      setLocalDb((prev) => ({
        ...prev,
        armada: [
          ...prev.armada,
          {
            id: `ARM${String(nextNum).padStart(3, '0')}`,
            nama: 'Armada Baru',
            minPax: 1,
            maxPax: 10,
            kapasitas: 10,
            tarifNearNabila: 1000000,
            tarifMediumNabila: 1200000,
            tarifFarNabila: 1500000,
            tarifNearPiknik: 1000000,
            tarifMediumPiknik: 1200000,
            tarifFarPiknik: 1500000,
            keterangan: 'Mobil + Driver + BBM',
          },
        ],
      }));
    } else if (activeTable === 'hotel') {
      const nextNum = localDb.hotel.length + 1;
      setLocalDb((prev) => ({
        ...prev,
        hotel: [
          ...prev.hotel,
          {
            id: `HTL${String(nextNum).padStart(3, '0')}`,
            nama: 'Hotel Mitra Baru',
            wilayah: 'Kota Malang',
            klasifikasi: 'Bintang 3',
            rateNabila: 600000,
            ratePiknik: 600000,
            formatKamar: 'Twin / Double',
            kapasitas: 2,
            includeSarapan: 'Ya (2 Orang)',
          },
        ],
      }));
    } else if (activeTable === 'jeep') {
      const nextNum = localDb.jeep.length + 1;
      setLocalDb((prev) => ({
        ...prev,
        jeep: [
          ...prev.jeep,
          {
            id: `JEP${String(nextNum).padStart(3, '0')}`,
            lokasiBasecamp: 'Basecamp Jeep Baru',
            jenisRute: 'Bromo Sunrise',
            tarifNabila: 850000,
            tarifPiknik: 850000,
            kapasitas: 5,
            destinasiDilewati: 'Rute wisata offroad',
            durasiTrip: '3 Jam',
          },
        ],
      }));
    } else if (activeTable === 'operasional') {
      const nextNum = localDb.operasional.length + 1;
      setLocalDb((prev) => ({
        ...prev,
        operasional: [
          ...prev.operasional,
          {
            kode: `OPS_${nextNum}`,
            nama: 'Komponen Operasional Baru',
            kategori: 'Logistik',
            satuan: 'Per Hari',
            biayaNabila: 100000,
            biayaPiknik: 100000,
            rasio: 'Sesuai kebutuhan',
          },
        ],
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls (Strictly for Active Entity) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Database Master Harga — {bMeta.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola daftar harga tiket wisata, armada, hotel, jeep & operasional khusus entitas {bMeta.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={onResetMaster}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition shadow-2xs ${accentBg}`}
          >
            {savedNotice ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{savedNotice}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Harga'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-table Selector */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'destinasi', label: 'Destinasi Wisata', count: localDb.destinasi.length, icon: MapPin },
            { id: 'armada', label: 'Armada Kendaraan', count: localDb.armada.length, icon: Bus },
            { id: 'hotel', label: 'Akomodasi Hotel', count: localDb.hotel.length, icon: Hotel },
            { id: 'jeep', label: 'Jeep & Petualangan', count: localDb.jeep.length, icon: Compass },
            { id: 'operasional', label: 'Standar Operasional', count: localDb.operasional.length, icon: Wrench },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTable === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTable(tab.id as SubTable)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition shrink-0 ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200/80 text-slate-800">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addNewRow}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Baris</span>
        </button>
      </div>

      {/* Table Content (Strictly Active Entity Columns) */}
      <div
        className="overflow-x-auto border border-slate-200 rounded-xl bg-white"
        role="region"
        aria-label="Master Database Table"
        tabIndex={0}
      >
        {activeTable === 'destinasi' && (
          <table className="w-full text-left border-collapse text-xs min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <th className="p-2.5 w-16">ID</th>
                <th className="p-2.5">Nama Objek Wisata</th>
                <th className="p-2.5">Wilayah / Kota</th>
                <th className={`p-2.5 text-right ${priceHeadBg}`}>HTM Domestik (Rp)</th>
                <th className="p-2.5 text-center">Wajib Guide?</th>
                <th className="p-2.5 text-right">Biaya Guide (Rp)</th>
                <th className="p-2.5 text-center whitespace-nowrap">Kapasitas Guide</th>
                <th className="p-2.5">Keterangan Parkir / Akses</th>
                <th className="p-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localDb.destinasi.map((row, idx) => (
                <tr key={row.id + idx} className="hover:bg-slate-50/70">
                  <td className="p-2 font-mono text-[11px] text-slate-500">{row.id}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.nama}
                      onChange={(e) => {
                        const next = [...localDb.destinasi];
                        next[idx] = { ...row, nama: e.target.value };
                        setLocalDb({ ...localDb, destinasi: next });
                      }}
                      className="min-w-[180px] w-full px-2 py-1 border border-slate-200 rounded font-medium text-slate-900"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.wilayah}
                      onChange={(e) => {
                        const next = [...localDb.destinasi];
                        next[idx] = { ...row, wilayah: e.target.value };
                        setLocalDb({ ...localDb, destinasi: next });
                      }}
                      className="w-32 px-2 py-1 border border-slate-200 rounded text-slate-700"
                    />
                  </td>
                  <td className={`p-2 ${priceColBg}`}>
                    <input
                      type="number"
                      step={5000}
                      value={isNabila ? row.htmDomestikNabila : row.htmDomestikPiknik}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        const next = [...localDb.destinasi];
                        next[idx] = isNabila
                          ? { ...row, htmDomestikNabila: val }
                          : { ...row, htmDomestikPiknik: val };
                        setLocalDb({ ...localDb, destinasi: next });
                      }}
                      className={`w-28 px-2 py-1 text-right font-mono font-semibold border ${priceInputBorder} rounded bg-white text-slate-900`}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={row.wajibGuide}
                      onChange={(e) => {
                        const next = [...localDb.destinasi];
                        next[idx] = { ...row, wajibGuide: e.target.checked };
                        setLocalDb({ ...localDb, destinasi: next });
                      }}
                      className="w-4 h-4 rounded"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      step={25000}
                      value={isNabila ? row.biayaGuideNabila : row.biayaGuidePiknik}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        const next = [...localDb.destinasi];
                        next[idx] = isNabila
                          ? { ...row, biayaGuideNabila: val }
                          : { ...row, biayaGuidePiknik: val };
                        setLocalDb({ ...localDb, destinasi: next });
                      }}
                      className="w-24 px-2 py-1 text-right font-mono border border-slate-200 rounded"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <div className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">1 :</span>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={row.kapasitasGuide ?? 10}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value, 10) || 10);
                          const next = [...localDb.destinasi];
                          next[idx] = { ...row, kapasitasGuide: val };
                          setLocalDb({ ...localDb, destinasi: next });
                        }}
                        className="w-12 px-1 py-0.5 text-center font-mono text-xs font-semibold border border-slate-200 rounded bg-white text-slate-800"
                        title="Kapasitas kuota: 1 guide untuk berapa orang"
                      />
                      <span className="text-[10px] text-slate-500 font-medium">Pax</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.keterangan}
                      onChange={(e) => {
                        const next = [...localDb.destinasi];
                        next[idx] = { ...row, keterangan: e.target.value };
                        setLocalDb({ ...localDb, destinasi: next });
                      }}
                      className="min-w-[160px] w-full px-2 py-1 border border-slate-200 rounded text-slate-600"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setLocalDb({
                          ...localDb,
                          destinasi: localDb.destinasi.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTable === 'armada' && (
          <table className="w-full text-left border-collapse text-xs min-w-[680px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <th className="p-2.5">Tipe Kendaraan</th>
                <th className="p-2.5 text-center">Total Kursi</th>
                <th className={`p-2.5 text-right ${priceHeadBg}`}>Tarif Dalam Kota (&lt;50km)</th>
                <th className={`p-2.5 text-right ${priceHeadBg}`}>Tarif Luar Kota (50-150km)</th>
                <th className={`p-2.5 text-right ${priceHeadBg}`}>Luar Kota Jauh (&gt;150km)</th>
                <th className="p-2.5">Keterangan Driver & BBM</th>
                <th className="p-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localDb.armada.map((row, idx) => (
                <tr key={row.id + idx} className="hover:bg-slate-50/70">
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.nama}
                      onChange={(e) => {
                        const next = [...localDb.armada];
                        next[idx] = { ...row, nama: e.target.value };
                        setLocalDb({ ...localDb, armada: next });
                      }}
                      className="min-w-[180px] w-full px-2 py-1 border border-slate-200 rounded font-medium text-slate-900"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={row.kapasitas}
                      onChange={(e) => {
                        const next = [...localDb.armada];
                        next[idx] = { ...row, kapasitas: parseInt(e.target.value, 10) || 6 };
                        setLocalDb({ ...localDb, armada: next });
                      }}
                      className="w-16 px-1.5 py-1 text-center font-mono border border-slate-200 rounded"
                    />
                  </td>
                  <td className={`p-2 ${priceColBg}`}>
                    <input
                      type="number"
                      step={50000}
                      value={isNabila ? row.tarifNearNabila : row.tarifNearPiknik}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        const next = [...localDb.armada];
                        next[idx] = isNabila
                          ? { ...row, tarifNearNabila: val }
                          : { ...row, tarifNearPiknik: val };
                        setLocalDb({ ...localDb, armada: next });
                      }}
                      className={`w-28 px-2 py-1 text-right font-mono font-semibold border ${priceInputBorder} rounded bg-white`}
                    />
                  </td>
                  <td className={`p-2 ${priceColBg}`}>
                    <input
                      type="number"
                      step={50000}
                      value={isNabila ? row.tarifMediumNabila : row.tarifMediumPiknik}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        const next = [...localDb.armada];
                        next[idx] = isNabila
                          ? { ...row, tarifMediumNabila: val }
                          : { ...row, tarifMediumPiknik: val };
                        setLocalDb({ ...localDb, armada: next });
                      }}
                      className={`w-28 px-2 py-1 text-right font-mono font-semibold border ${priceInputBorder} rounded bg-white`}
                    />
                  </td>
                  <td className={`p-2 ${priceColBg}`}>
                    <input
                      type="number"
                      step={50000}
                      value={isNabila ? row.tarifFarNabila : row.tarifFarPiknik}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        const next = [...localDb.armada];
                        next[idx] = isNabila
                          ? { ...row, tarifFarNabila: val }
                          : { ...row, tarifFarPiknik: val };
                        setLocalDb({ ...localDb, armada: next });
                      }}
                      className={`w-28 px-2 py-1 text-right font-mono font-semibold border ${priceInputBorder} rounded bg-white`}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.keterangan}
                      onChange={(e) => {
                        const next = [...localDb.armada];
                        next[idx] = { ...row, keterangan: e.target.value };
                        setLocalDb({ ...localDb, armada: next });
                      }}
                      className="min-w-[150px] w-full px-2 py-1 border border-slate-200 rounded text-slate-600"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setLocalDb({
                          ...localDb,
                          armada: localDb.armada.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTable === 'hotel' && (
          <table className="w-full text-left border-collapse text-xs min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <th className="p-2.5">Nama Hotel / Penginapan</th>
                <th className="p-2.5">Kota / Wilayah</th>
                <th className="p-2.5">Klasifikasi</th>
                <th className={`p-2.5 text-right ${priceHeadBg}`}>Rate Kontrak (Rp/Mlm)</th>
                <th className="p-2.5">Format Kamar</th>
                <th className="p-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localDb.hotel.map((row, idx) => (
                <tr key={row.id + idx} className="hover:bg-slate-50/70">
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.nama}
                      onChange={(e) => {
                        const next = [...localDb.hotel];
                        next[idx] = { ...row, nama: e.target.value };
                        setLocalDb({ ...localDb, hotel: next });
                      }}
                      className="min-w-[180px] w-full px-2 py-1 border border-slate-200 rounded font-medium text-slate-900"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.wilayah}
                      onChange={(e) => {
                        const next = [...localDb.hotel];
                        next[idx] = { ...row, wilayah: e.target.value };
                        setLocalDb({ ...localDb, hotel: next });
                      }}
                      className="w-36 px-2 py-1 border border-slate-200 rounded"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.klasifikasi}
                      onChange={(e) => {
                        const next = [...localDb.hotel];
                        next[idx] = { ...row, klasifikasi: e.target.value };
                        setLocalDb({ ...localDb, hotel: next });
                      }}
                      className="w-28 px-2 py-1 border border-slate-200 rounded"
                    />
                  </td>
                  <td className={`p-2 text-right ${priceColBg}`}>
                    <input
                      type="number"
                      step={25000}
                      value={isNabila ? row.rateNabila : row.ratePiknik}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        const next = [...localDb.hotel];
                        next[idx] = isNabila
                          ? { ...row, rateNabila: val }
                          : { ...row, ratePiknik: val };
                        setLocalDb({ ...localDb, hotel: next });
                      }}
                      className={`w-32 px-2 py-1 text-right font-mono font-semibold border ${priceInputBorder} rounded bg-white`}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.formatKamar}
                      onChange={(e) => {
                        const next = [...localDb.hotel];
                        next[idx] = { ...row, formatKamar: e.target.value };
                        setLocalDb({ ...localDb, hotel: next });
                      }}
                      className="w-32 px-2 py-1 border border-slate-200 rounded"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setLocalDb({
                          ...localDb,
                          hotel: localDb.hotel.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTable === 'jeep' && (
          <table className="w-full text-left border-collapse text-xs min-w-[660px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <th className="p-2.5">Lokasi Basecamp</th>
                <th className="p-2.5">Jenis Rute</th>
                <th className={`p-2.5 text-right ${priceHeadBg}`}>Tarif Sewa / Unit (Rp)</th>
                <th className="p-2.5 text-center">Kapasitas (Pax)</th>
                <th className="p-2.5">Destinasi yang Dilewati</th>
                <th className="p-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localDb.jeep.map((row, idx) => (
                <tr key={row.id + idx} className="hover:bg-slate-50/70">
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.lokasiBasecamp}
                      onChange={(e) => {
                        const next = [...localDb.jeep];
                        next[idx] = { ...row, lokasiBasecamp: e.target.value };
                        setLocalDb({ ...localDb, jeep: next });
                      }}
                      className="min-w-[160px] w-full px-2 py-1 border border-slate-200 rounded font-medium text-slate-900"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.jenisRute}
                      onChange={(e) => {
                        const next = [...localDb.jeep];
                        next[idx] = { ...row, jenisRute: e.target.value };
                        setLocalDb({ ...localDb, jeep: next });
                      }}
                      className="w-36 px-2 py-1 border border-slate-200 rounded"
                    />
                  </td>
                  <td className={`p-2 text-right ${priceColBg}`}>
                    <input
                      type="number"
                      step={25000}
                      value={isNabila ? row.tarifNabila : row.tarifPiknik}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        const next = [...localDb.jeep];
                        next[idx] = isNabila
                          ? { ...row, tarifNabila: val }
                          : { ...row, tarifPiknik: val };
                        setLocalDb({ ...localDb, jeep: next });
                      }}
                      className={`w-28 px-2 py-1 text-right font-mono font-semibold border ${priceInputBorder} rounded bg-white`}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={row.kapasitas}
                      onChange={(e) => {
                        const next = [...localDb.jeep];
                        next[idx] = { ...row, kapasitas: parseInt(e.target.value, 10) || 5 };
                        setLocalDb({ ...localDb, jeep: next });
                      }}
                      className="w-16 px-2 py-1 text-center font-mono border border-slate-200 rounded"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.destinasiDilewati}
                      onChange={(e) => {
                        const next = [...localDb.jeep];
                        next[idx] = { ...row, destinasiDilewati: e.target.value };
                        setLocalDb({ ...localDb, jeep: next });
                      }}
                      className="min-w-[180px] w-full px-2 py-1 border border-slate-200 rounded text-slate-600"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setLocalDb({
                          ...localDb,
                          jeep: localDb.jeep.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTable === 'operasional' && (
          <table className="w-full text-left border-collapse text-xs min-w-[660px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                <th className="p-2.5 w-28">Kode Item</th>
                <th className="p-2.5">Nama Kebutuhan Operasional</th>
                <th className="p-2.5">Kategori</th>
                <th className="p-2.5">Satuan</th>
                <th className={`p-2.5 text-right ${priceHeadBg}`}>Biaya Standar (Rp)</th>
                <th className="p-2.5">Standar Rasio Penggunaan</th>
                <th className="p-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localDb.operasional.map((row, idx) => (
                <tr key={row.kode + idx} className="hover:bg-slate-50/70">
                  <td className="p-2 font-mono text-[11px] text-slate-600">{row.kode}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.nama}
                      onChange={(e) => {
                        const next = [...localDb.operasional];
                        next[idx] = { ...row, nama: e.target.value };
                        setLocalDb({ ...localDb, operasional: next });
                      }}
                      className="min-w-[180px] w-full px-2 py-1 border border-slate-200 rounded font-medium text-slate-900"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.kategori}
                      onChange={(e) => {
                        const next = [...localDb.operasional];
                        next[idx] = { ...row, kategori: e.target.value };
                        setLocalDb({ ...localDb, operasional: next });
                      }}
                      className="w-24 px-2 py-1 border border-slate-200 rounded"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.satuan}
                      onChange={(e) => {
                        const next = [...localDb.operasional];
                        next[idx] = { ...row, satuan: e.target.value };
                        setLocalDb({ ...localDb, operasional: next });
                      }}
                      className="w-24 px-2 py-1 border border-slate-200 rounded"
                    />
                  </td>
                  <td className={`p-2 text-right ${priceColBg}`}>
                    <input
                      type="number"
                      step={5000}
                      value={isNabila ? row.biayaNabila : row.biayaPiknik}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        const next = [...localDb.operasional];
                        next[idx] = isNabila
                          ? { ...row, biayaNabila: val }
                          : { ...row, biayaPiknik: val };
                        setLocalDb({ ...localDb, operasional: next });
                      }}
                      className={`w-28 px-2 py-1 text-right font-mono font-semibold border ${priceInputBorder} rounded bg-white`}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.rasio}
                      onChange={(e) => {
                        const next = [...localDb.operasional];
                        next[idx] = { ...row, rasio: e.target.value };
                        setLocalDb({ ...localDb, operasional: next });
                      }}
                      className="min-w-[160px] w-full px-2 py-1 border border-slate-200 rounded text-slate-600"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setLocalDb({
                          ...localDb,
                          operasional: localDb.operasional.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
