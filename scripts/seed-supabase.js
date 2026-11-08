const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = 'https://yfymulxfgswnzsumybxb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmeW11bHhmZ3N3bnpzdW15YnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMjQwMzAsImV4cCI6MjEwOTcwMDAzMH0._FtUA8GvMRemYMyLpWhhUBVQC1Io71l8BvxUFYZpwNs';
const supabase = createClient(url, key);

async function main() {
  console.log('Starting seed to Supabase...');

  // Read seed-data.ts and extract INITIAL_MASTER_DB
  const seedFile = fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'seed-data.ts'), 'utf8');
  
  // Extract destinasi
  const destMatch = seedFile.match(/destinasi:\s*\[([\s\S]*?)\],\s*armada:/);
  const destinasi = eval('[' + destMatch[1] + ']');
  console.log('Destinasi count:', destinasi.length);

  // Extract armada
  const armadaMatch = seedFile.match(/armada:\s*\[([\s\S]*?)\],\s*hotel:/);
  const armada = eval('[' + armadaMatch[1] + ']');
  console.log('Armada count:', armada.length);

  // Extract hotel
  const hotelMatch = seedFile.match(/hotel:\s*\[([\s\S]*?)\],\s*jeep:/);
  const hotel = eval('[' + hotelMatch[1] + ']');
  console.log('Hotel count:', hotel.length);

  // Extract jeep
  const jeepMatch = seedFile.match(/jeep:\s*\[([\s\S]*?)\],\s*operasional:/);
  const jeep = eval('[' + jeepMatch[1] + ']');
  console.log('Jeep count:', jeep.length);

  // Extract operasional
  const opsMatch = seedFile.match(/operasional:\s*\[([\s\S]*?)\],\s*quotations:/);
  const operasional = eval('[' + opsMatch[1] + ']');
  console.log('Operasional count:', operasional.length);

  // 1. Insert Destinasi
  const mappedDest = destinasi.map((d) => ({
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
  const res1 = await supabase.from('destinasi').upsert(mappedDest);
  if (res1.error) console.error('Dest error:', res1.error);
  else console.log('Destinasi seeded successfully!');

  // 2. Insert Armada
  const mappedArmada = armada.map((a) => ({
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
  const res2 = await supabase.from('armada').upsert(mappedArmada);
  if (res2.error) console.error('Armada error:', res2.error);
  else console.log('Armada seeded successfully!');

  // 3. Insert Hotel
  const mappedHotel = hotel.map((h) => ({
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
  const res3 = await supabase.from('hotel').upsert(mappedHotel);
  if (res3.error) console.error('Hotel error:', res3.error);
  else console.log('Hotel seeded successfully!');

  // 4. Insert Jeep
  const mappedJeep = jeep.map((j) => ({
    id: j.id,
    lokasi_basecamp: j.lokasiBasecamp,
    jenis_rute: j.jenisRute,
    tarif_nabila: j.tarifNabila,
    tarif_piknik: j.tarifPiknik,
    kapasitas: j.kapasitas,
    destinasi_dilewati: j.destinasiDilewati || '',
    durasi_trip: j.durasiTrip || '',
  }));
  const res4 = await supabase.from('jeep').upsert(mappedJeep);
  if (res4.error) console.error('Jeep error:', res4.error);
  else console.log('Jeep seeded successfully!');

  // 5. Insert Operasional
  const mappedOps = operasional.map((o) => ({
    kode: o.kode,
    nama: o.nama,
    kategori: o.kategori,
    satuan: o.satuan,
    biaya_nabila: o.biayaNabila,
    biaya_piknik: o.biayaPiknik,
    rasio: o.rasio || '',
  }));
  const res5 = await supabase.from('operasional').upsert(mappedOps);
  if (res5.error) console.error('Ops error:', res5.error);
  else console.log('Operasional seeded successfully!');

  console.log('ALL SUPABASE SEEDING COMPLETE!');
}

main().catch(console.error);
