-- =========================================================
-- SUPABASE POSTGRES SCHEMA & SEED DATA
-- Enterprise Tour Costing Monolith: Nabila Trip & Piknik Enthusiast
-- =========================================================

-- 1. Table Destinasi Wisata
CREATE TABLE IF NOT EXISTS destinasi (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  wilayah TEXT NOT NULL,
  htm_domestik_nabila BIGINT NOT NULL DEFAULT 0,
  htm_domestik_piknik BIGINT NOT NULL DEFAULT 0,
  htm_mancanegara_nabila BIGINT NOT NULL DEFAULT 0,
  htm_mancanegara_piknik BIGINT NOT NULL DEFAULT 0,
  wajib_guide BOOLEAN NOT NULL DEFAULT FALSE,
  biaya_guide_nabila BIGINT NOT NULL DEFAULT 0,
  biaya_guide_piknik BIGINT NOT NULL DEFAULT 0,
  keterangan TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table Armada Transportasi
CREATE TABLE IF NOT EXISTS armada (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  min_pax INT NOT NULL DEFAULT 1,
  max_pax INT NOT NULL DEFAULT 5,
  kapasitas INT NOT NULL DEFAULT 6,
  tarif_near_nabila BIGINT NOT NULL DEFAULT 0,
  tarif_medium_nabila BIGINT NOT NULL DEFAULT 0,
  tarif_far_nabila BIGINT NOT NULL DEFAULT 0,
  tarif_near_piknik BIGINT NOT NULL DEFAULT 0,
  tarif_medium_piknik BIGINT NOT NULL DEFAULT 0,
  tarif_far_piknik BIGINT NOT NULL DEFAULT 0,
  keterangan TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table Hotel & Penginapan
CREATE TABLE IF NOT EXISTS hotel (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  wilayah TEXT NOT NULL,
  klasifikasi TEXT NOT NULL,
  rate_nabila BIGINT NOT NULL DEFAULT 0,
  rate_piknik BIGINT NOT NULL DEFAULT 0,
  format_kamar TEXT NOT NULL DEFAULT 'Twin Share',
  kapasitas INT NOT NULL DEFAULT 2,
  include_sarapan TEXT NOT NULL DEFAULT 'Ya (2 Orang)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Table Jeep 4x4
CREATE TABLE IF NOT EXISTS jeep (
  id TEXT PRIMARY KEY,
  lokasi_basecamp TEXT NOT NULL,
  jenis_rute TEXT NOT NULL,
  tarif_nabila BIGINT NOT NULL DEFAULT 0,
  tarif_piknik BIGINT NOT NULL DEFAULT 0,
  kapasitas INT NOT NULL DEFAULT 5,
  destinasi_dilewati TEXT NOT NULL DEFAULT '',
  durasi_trip TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Table Operasional & SDM
CREATE TABLE IF NOT EXISTS operasional (
  kode TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL,
  satuan TEXT NOT NULL,
  biaya_nabila BIGINT NOT NULL DEFAULT 0,
  biaya_piknik BIGINT NOT NULL DEFAULT 0,
  rasio TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Table Quotations / Riwayat Penawaran Tersimpan
CREATE TABLE IF NOT EXISTS quotations (
  quote_id TEXT PRIMARY KEY,
  brand TEXT NOT NULL DEFAULT 'nabila',
  timestamp TEXT NOT NULL,
  nama_klien TEXT NOT NULL,
  pax INT NOT NULL DEFAULT 1,
  durasi TEXT NOT NULL,
  zona TEXT NOT NULL,
  armada TEXT NOT NULL,
  jumlah_jeep TEXT NOT NULL,
  hpp_total DOUBLE PRECISION NOT NULL DEFAULT 0,
  harga_jual_per_pax DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_nilai DOUBLE PRECISION NOT NULL DEFAULT 0,
  estimasi_laba DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Disimpan',
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE destinasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE armada ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel ENABLE ROW LEVEL SECURITY;
ALTER TABLE jeep ENABLE ROW LEVEL SECURITY;
ALTER TABLE operasional ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- Allow Public Read & Write
DROP POLICY IF EXISTS "Public Read Destinasi" ON destinasi;
CREATE POLICY "Public Read Destinasi" ON destinasi FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Destinasi" ON destinasi;
CREATE POLICY "Public Write Destinasi" ON destinasi FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Armada" ON armada;
CREATE POLICY "Public Read Armada" ON armada FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Armada" ON armada;
CREATE POLICY "Public Write Armada" ON armada FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Hotel" ON hotel;
CREATE POLICY "Public Read Hotel" ON hotel FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Hotel" ON hotel;
CREATE POLICY "Public Write Hotel" ON hotel FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Jeep" ON jeep;
CREATE POLICY "Public Read Jeep" ON jeep FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Jeep" ON jeep;
CREATE POLICY "Public Write Jeep" ON jeep FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Operasional" ON operasional;
CREATE POLICY "Public Read Operasional" ON operasional FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Operasional" ON operasional FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Quotations" ON quotations;
CREATE POLICY "Public Read Quotations" ON quotations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Quotations" ON quotations;
CREATE POLICY "Public Write Quotations" ON quotations FOR ALL USING (true);
