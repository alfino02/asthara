import { supabase, isSupabaseConfigured } from './supabase';
import {
  MasterDatabase,
  DestinasiRow,
  ArmadaRow,
  HotelRow,
  JeepRow,
  OperasionalRow,
  QuotationRecord,
} from '@/types/trip';
import { INITIAL_MASTER_DB } from './seed-data';

export async function getSupabaseMasterDatabase(): Promise<MasterDatabase | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  try {
    const [destRes, armadaRes, hotelRes, jeepRes, opsRes, quoteRes] = await Promise.all([
      supabase.from('destinasi').select('*').order('nama'),
      supabase.from('armada').select('*').order('min_pax'),
      supabase.from('hotel').select('*').order('nama'),
      supabase.from('jeep').select('*').order('lokasi_basecamp'),
      supabase.from('operasional').select('*').order('kode'),
      supabase.from('quotations').select('*').order('created_at', { ascending: false }),
    ]);

    // Check if tables are empty, auto-seed if needed
    if (!destRes.data || destRes.data.length === 0) {
      await seedSupabaseDatabase(INITIAL_MASTER_DB);
      return INITIAL_MASTER_DB;
    }

    const destinasi: DestinasiRow[] = (destRes.data || []).map((d: any) => ({
      id: d.id,
      nama: d.nama,
      wilayah: d.wilayah,
      htmDomestikNabila: Number(d.htm_domestik_nabila) || 0,
      htmDomestikPiknik: Number(d.htm_domestik_piknik) || 0,
      htmMancanegaraNabila: Number(d.htm_mancanegara_nabila) || 0,
      htmMancanegaraPiknik: Number(d.htm_mancanegara_piknik) || 0,
      wajibGuide: Boolean(d.wajib_guide),
      biayaGuideNabila: Number(d.biaya_guide_nabila) || 0,
      biayaGuidePiknik: Number(d.biaya_guide_piknik) || 0,
      keterangan: d.keterangan || '',
    }));

    const armada: ArmadaRow[] = (armadaRes.data || []).map((a: any) => ({
      id: a.id,
      nama: a.nama,
      minPax: Number(a.min_pax) || 1,
      maxPax: Number(a.max_pax) || 5,
      kapasitas: Number(a.kapasitas) || 6,
      tarifNearNabila: Number(a.tarif_near_nabila) || 0,
      tarifMediumNabila: Number(a.tarif_medium_nabila) || 0,
      tarifFarNabila: Number(a.tarif_far_nabila) || 0,
      tarifNearPiknik: Number(a.tarif_near_piknik) || 0,
      tarifMediumPiknik: Number(a.tarif_medium_piknik) || 0,
      tarifFarPiknik: Number(a.tarif_far_piknik) || 0,
      keterangan: a.keterangan || '',
    }));

    const hotel: HotelRow[] = (hotelRes.data || []).map((h: any) => ({
      id: h.id,
      nama: h.nama,
      wilayah: h.wilayah,
      klasifikasi: h.klasifikasi,
      rateNabila: Number(h.rate_nabila) || 0,
      ratePiknik: Number(h.rate_piknik) || 0,
      formatKamar: h.format_kamar || 'Twin Share',
      kapasitas: Number(h.kapasitas) || 2,
      includeSarapan: h.include_sarapan || 'Ya (2 Orang)',
    }));

    const jeep: JeepRow[] = (jeepRes.data || []).map((j: any) => ({
      id: j.id,
      lokasiBasecamp: j.lokasi_basecamp,
      jenisRute: j.jenis_rute,
      tarifNabila: Number(j.tarif_nabila) || 0,
      tarifPiknik: Number(j.tarif_piknik) || 0,
      kapasitas: Number(j.kapasitas) || 5,
      destinasiDilewati: j.destinasi_dilewati || '',
      durasiTrip: j.durasi_trip || '',
    }));

    const operasional: OperasionalRow[] = (opsRes.data || []).map((o: any) => ({
      kode: o.kode,
      nama: o.nama,
      kategori: o.kategori,
      satuan: o.satuan,
      biayaNabila: Number(o.biaya_nabila) || 0,
      biayaPiknik: Number(o.biaya_piknik) || 0,
      rasio: o.rasio || '',
    }));

    const quotations: QuotationRecord[] = (quoteRes.data || []).map((q: any) => ({
      quoteId: q.quote_id,
      brand: q.brand,
      timestamp: q.timestamp,
      namaKlien: q.nama_klien,
      pax: Number(q.pax) || 1,
      durasi: q.durasi,
      zona: q.zona,
      armada: q.armada,
      jumlahJeep: q.jumlah_jeep,
      hppTotal: Number(q.hpp_total) || 0,
      hargaJualPerPax: Number(q.harga_jual_per_pax) || 0,
      totalNilai: Number(q.total_nilai) || 0,
      estimasiLaba: Number(q.estimasi_laba) || 0,
      status: q.status || 'Disimpan',
      payloadJson: typeof q.payload_json === 'string' ? q.payload_json : JSON.stringify(q.payload_json || {}),
    }));

    return {
      destinasi,
      armada,
      hotel,
      jeep,
      operasional,
      quotations,
    };
  } catch (err) {
    console.error('Gagal mengambil data dari Supabase:', err);
    return null;
  }
}

export async function seedSupabaseDatabase(data: MasterDatabase) {
  if (!supabase || !isSupabaseConfigured) return;

  // 1. Destinasi
  const mappedDest = data.destinasi.map((d) => ({
    id: d.id,
    nama: d.nama,
    wilayah: d.wilayah,
    htm_domestik_nabila: d.htmDomestikNabila,
    htm_domestik_piknik: d.htmDomestikPiknik,
    htm_mancanegara_nabila: d.htmMancanegaraNabila,
    htm_mancanegara_piknik: d.htmMancanegaraPiknik,
    wajib_guide: d.wajibGuide,
    biaya_guide_nabila: d.biayaGuideNabila,
    biaya_guide_piknik: d.biayaGuidePiknik,
    keterangan: d.keterangan || '',
  }));
  await supabase.from('destinasi').upsert(mappedDest);

  // 2. Armada
  const mappedArmada = data.armada.map((a) => ({
    id: a.id,
    nama: a.nama,
    min_pax: a.minPax,
    max_pax: a.maxPax,
    kapasitas: a.kapasitas,
    tarif_near_nabila: a.tarifNearNabila,
    tarif_medium_nabila: a.tarifMediumNabila,
    tarif_far_nabila: a.tarifFarNabila,
    tarif_near_piknik: a.tarifNearPiknik,
    tarif_medium_piknik: a.tarifMediumPiknik,
    tarif_far_piknik: a.tarifFarPiknik,
    keterangan: a.keterangan || '',
  }));
  await supabase.from('armada').upsert(mappedArmada);

  // 3. Hotel
  const mappedHotel = data.hotel.map((h) => ({
    id: h.id,
    nama: h.nama,
    wilayah: h.wilayah,
    klasifikasi: h.klasifikasi,
    rate_nabila: h.rateNabila,
    rate_piknik: h.ratePiknik,
    format_kamar: h.formatKamar,
    kapasitas: h.kapasitas,
    include_sarapan: h.includeSarapan,
  }));
  await supabase.from('hotel').upsert(mappedHotel);

  // 4. Jeep
  const mappedJeep = data.jeep.map((j) => ({
    id: j.id,
    lokasi_basecamp: j.lokasiBasecamp,
    jenis_rute: j.jenisRute,
    tarif_nabila: j.tarifNabila,
    tarif_piknik: j.tarifPiknik,
    kapasitas: j.kapasitas,
    destinasi_dilewati: j.destinasiDilewati || '',
    durasi_trip: j.durasiTrip || '',
  }));
  await supabase.from('jeep').upsert(mappedJeep);

  // 5. Operasional
  const mappedOps = data.operasional.map((o) => ({
    kode: o.kode,
    nama: o.nama,
    kategori: o.kategori,
    satuan: o.satuan,
    biaya_nabila: o.biayaNabila,
    biaya_piknik: o.biayaPiknik,
    rasio: o.rasio || '',
  }));
  await supabase.from('operasional').upsert(mappedOps);

  // 6. Quotations
  if (data.quotations && data.quotations.length > 0) {
    const mappedQuotes = data.quotations.map((q) => ({
      quote_id: q.quoteId,
      brand: q.brand,
      timestamp: q.timestamp,
      nama_klien: q.namaKlien,
      pax: q.pax,
      durasi: q.durasi,
      zona: q.zona,
      armada: q.armada,
      jumlah_jeep: q.jumlahJeep,
      hpp_total: q.hppTotal,
      harga_jual_per_pax: q.hargaJualPerPax,
      total_nilai: q.totalNilai,
      estimasi_laba: q.estimasiLaba,
      status: q.status,
      payload_json: JSON.parse(q.payloadJson || '{}'),
    }));
    await supabase.from('quotations').upsert(mappedQuotes);
  }
}

export async function saveSupabaseQuotation(record: QuotationRecord): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  let payload = {};
  try {
    payload = JSON.parse(record.payloadJson || '{}');
  } catch {
    payload = {};
  }

  const { error } = await supabase.from('quotations').upsert({
    quote_id: record.quoteId,
    brand: record.brand,
    timestamp: record.timestamp,
    nama_klien: record.namaKlien,
    pax: record.pax,
    durasi: record.durasi,
    zona: record.zona,
    armada: record.armada,
    jumlah_jeep: record.jumlahJeep,
    hpp_total: record.hppTotal,
    harga_jual_per_pax: record.hargaJualPerPax,
    total_nilai: record.totalNilai,
    estimasi_laba: record.estimasiLaba,
    status: record.status || 'Disimpan',
    payload_json: payload,
  });

  if (error) {
    console.error('Error saveSupabaseQuotation:', error);
    return false;
  }
  return true;
}

export async function deleteSupabaseQuotation(quoteId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  const { error } = await supabase.from('quotations').delete().eq('quote_id', quoteId);
  if (error) {
    console.error('Error deleteSupabaseQuotation:', error);
    return false;
  }
  return true;
}
