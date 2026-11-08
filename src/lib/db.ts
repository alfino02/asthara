import path from 'path';
import fs from 'fs';
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

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'trip_monolith.sqlite');

// Use global singleton in dev mode to avoid multiple locks
const globalForDb = globalThis as unknown as {
  sqliteDb?: any;
  isInitialized?: boolean;
};

function getSqliteInstance() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!globalForDb.sqliteDb) {
    // Load native node:sqlite
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require('node:sqlite');
    globalForDb.sqliteDb = new DatabaseSync(DB_PATH);
  }

  if (!globalForDb.isInitialized) {
    initSchemaAndSeed(globalForDb.sqliteDb);
    globalForDb.isInitialized = true;
  }

  return globalForDb.sqliteDb;
}

function initSchemaAndSeed(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS destinasi (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      wilayah TEXT NOT NULL,
      htmDomestikNabila INTEGER NOT NULL DEFAULT 0,
      htmDomestikPiknik INTEGER NOT NULL DEFAULT 0,
      htmMancanegaraNabila INTEGER NOT NULL DEFAULT 0,
      htmMancanegaraPiknik INTEGER NOT NULL DEFAULT 0,
      wajibGuide INTEGER NOT NULL DEFAULT 0,
      biayaGuideNabila INTEGER NOT NULL DEFAULT 0,
      biayaGuidePiknik INTEGER NOT NULL DEFAULT 0,
      keterangan TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS armada (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      minPax INTEGER NOT NULL DEFAULT 1,
      maxPax INTEGER NOT NULL DEFAULT 5,
      kapasitas INTEGER NOT NULL DEFAULT 6,
      tarifNearNabila INTEGER NOT NULL DEFAULT 0,
      tarifMediumNabila INTEGER NOT NULL DEFAULT 0,
      tarifFarNabila INTEGER NOT NULL DEFAULT 0,
      tarifNearPiknik INTEGER NOT NULL DEFAULT 0,
      tarifMediumPiknik INTEGER NOT NULL DEFAULT 0,
      tarifFarPiknik INTEGER NOT NULL DEFAULT 0,
      keterangan TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS hotel (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      wilayah TEXT NOT NULL,
      klasifikasi TEXT NOT NULL,
      rateNabila INTEGER NOT NULL DEFAULT 0,
      ratePiknik INTEGER NOT NULL DEFAULT 0,
      formatKamar TEXT NOT NULL DEFAULT 'Twin Share',
      kapasitas INTEGER NOT NULL DEFAULT 2,
      includeSarapan TEXT NOT NULL DEFAULT 'Ya (2 Orang)'
    );

    CREATE TABLE IF NOT EXISTS jeep (
      id TEXT PRIMARY KEY,
      lokasiBasecamp TEXT NOT NULL,
      jenisRute TEXT NOT NULL,
      tarifNabila INTEGER NOT NULL DEFAULT 0,
      tarifPiknik INTEGER NOT NULL DEFAULT 0,
      kapasitas INTEGER NOT NULL DEFAULT 5,
      destinasiDilewati TEXT NOT NULL DEFAULT '',
      durasiTrip TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS operasional (
      kode TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      kategori TEXT NOT NULL,
      satuan TEXT NOT NULL,
      biayaNabila INTEGER NOT NULL DEFAULT 0,
      biayaPiknik INTEGER NOT NULL DEFAULT 0,
      rasio TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS quotations (
      quoteId TEXT PRIMARY KEY,
      brand TEXT NOT NULL DEFAULT 'nabila',
      timestamp TEXT NOT NULL,
      namaKlien TEXT NOT NULL,
      pax INTEGER NOT NULL DEFAULT 1,
      durasi TEXT NOT NULL,
      zona TEXT NOT NULL,
      armada TEXT NOT NULL,
      jumlahJeep TEXT NOT NULL,
      hppTotal REAL NOT NULL DEFAULT 0,
      hargaJualPerPax REAL NOT NULL DEFAULT 0,
      totalNilai REAL NOT NULL DEFAULT 0,
      estimasiLaba REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Disimpan',
      payloadJson TEXT NOT NULL DEFAULT '{}'
    );
  `);

  // Check if destinasi is empty -> seed all tables
  const countRow = db.prepare('SELECT COUNT(*) as cnt FROM destinasi').get() as { cnt: number };
  if (!countRow || countRow.cnt === 0) {
    seedAllTables(db, INITIAL_MASTER_DB);
  }
}

export function seedAllTables(db: any, data: MasterDatabase, includeQuotations = true) {
  db.exec('BEGIN TRANSACTION');
  try {
    db.exec('DELETE FROM destinasi');
    const insDest = db.prepare(`
      INSERT INTO destinasi (
        id, nama, wilayah, htmDomestikNabila, htmDomestikPiknik,
        htmMancanegaraNabila, htmMancanegaraPiknik, wajibGuide,
        biayaGuideNabila, biayaGuidePiknik, keterangan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const d of data.destinasi) {
      insDest.run(
        d.id,
        d.nama,
        d.wilayah,
        Number(d.htmDomestikNabila) || 0,
        Number(d.htmDomestikPiknik) || 0,
        Number(d.htmMancanegaraNabila) || 0,
        Number(d.htmMancanegaraPiknik) || 0,
        d.wajibGuide ? 1 : 0,
        Number(d.biayaGuideNabila) || 0,
        Number(d.biayaGuidePiknik) || 0,
        d.keterangan || ''
      );
    }

    db.exec('DELETE FROM armada');
    const insArm = db.prepare(`
      INSERT INTO armada (
        id, nama, minPax, maxPax, kapasitas,
        tarifNearNabila, tarifMediumNabila, tarifFarNabila,
        tarifNearPiknik, tarifMediumPiknik, tarifFarPiknik, keterangan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of data.armada) {
      insArm.run(
        a.id,
        a.nama,
        Number(a.minPax) || 1,
        Number(a.maxPax) || 5,
        Number(a.kapasitas) || 6,
        Number(a.tarifNearNabila) || 0,
        Number(a.tarifMediumNabila) || 0,
        Number(a.tarifFarNabila) || 0,
        Number(a.tarifNearPiknik) || 0,
        Number(a.tarifMediumPiknik) || 0,
        Number(a.tarifFarPiknik) || 0,
        a.keterangan || ''
      );
    }

    db.exec('DELETE FROM hotel');
    const insHtl = db.prepare(`
      INSERT INTO hotel (
        id, nama, wilayah, klasifikasi, rateNabila, ratePiknik,
        formatKamar, kapasitas, includeSarapan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const h of data.hotel) {
      insHtl.run(
        h.id,
        h.nama,
        h.wilayah,
        h.klasifikasi,
        Number(h.rateNabila) || 0,
        Number(h.ratePiknik) || 0,
        h.formatKamar || 'Twin Share',
        Number(h.kapasitas) || 2,
        h.includeSarapan || 'Ya (2 Orang)'
      );
    }

    db.exec('DELETE FROM jeep');
    const insJeep = db.prepare(`
      INSERT INTO jeep (
        id, lokasiBasecamp, jenisRute, tarifNabila, tarifPiknik,
        kapasitas, destinasiDilewati, durasiTrip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const j of data.jeep) {
      insJeep.run(
        j.id,
        j.lokasiBasecamp,
        j.jenisRute,
        Number(j.tarifNabila) || 0,
        Number(j.tarifPiknik) || 0,
        Number(j.kapasitas) || 5,
        j.destinasiDilewati || '',
        j.durasiTrip || ''
      );
    }

    db.exec('DELETE FROM operasional');
    const insOps = db.prepare(`
      INSERT INTO operasional (
        kode, nama, kategori, satuan, biayaNabila, biayaPiknik, rasio
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const o of data.operasional) {
      insOps.run(
        o.kode,
        o.nama,
        o.kategori,
        o.satuan,
        Number(o.biayaNabila) || 0,
        Number(o.biayaPiknik) || 0,
        o.rasio || ''
      );
    }

    if (includeQuotations && data.quotations) {
      const qCount = (db.prepare('SELECT COUNT(*) as cnt FROM quotations').get() as { cnt: number }).cnt;
      if (qCount === 0) {
        const insQ = db.prepare(`
          INSERT INTO quotations (
            quoteId, brand, timestamp, namaKlien, pax, durasi, zona,
            armada, jumlahJeep, hppTotal, hargaJualPerPax, totalNilai,
            estimasiLaba, status, payloadJson
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const q of data.quotations) {
          insQ.run(
            q.quoteId,
            q.brand,
            q.timestamp,
            q.namaKlien,
            Number(q.pax) || 1,
            q.durasi,
            q.zona,
            q.armada,
            q.jumlahJeep,
            Number(q.hppTotal) || 0,
            Number(q.hargaJualPerPax) || 0,
            Number(q.totalNilai) || 0,
            Number(q.estimasiLaba) || 0,
            q.status || 'Disimpan',
            q.payloadJson || '{}'
          );
        }
      }
    }

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function getMasterDatabase(): MasterDatabase {
  const db = getSqliteInstance();

  const destRows = db.prepare('SELECT * FROM destinasi ORDER BY id ASC').all() as any[];
  const destinasi: DestinasiRow[] = destRows.map((r) => ({
    id: String(r.id),
    nama: String(r.nama),
    wilayah: String(r.wilayah),
    htmDomestikNabila: Number(r.htmDomestikNabila),
    htmDomestikPiknik: Number(r.htmDomestikPiknik),
    htmMancanegaraNabila: Number(r.htmMancanegaraNabila),
    htmMancanegaraPiknik: Number(r.htmMancanegaraPiknik),
    wajibGuide: Boolean(r.wajibGuide),
    biayaGuideNabila: Number(r.biayaGuideNabila),
    biayaGuidePiknik: Number(r.biayaGuidePiknik),
    keterangan: String(r.keterangan || ''),
  }));

  const armadaRows = db.prepare('SELECT * FROM armada ORDER BY kapasitas ASC').all() as any[];
  const armada: ArmadaRow[] = armadaRows.map((r) => ({
    id: String(r.id),
    nama: String(r.nama),
    minPax: Number(r.minPax),
    maxPax: Number(r.maxPax),
    kapasitas: Number(r.kapasitas),
    tarifNearNabila: Number(r.tarifNearNabila),
    tarifMediumNabila: Number(r.tarifMediumNabila),
    tarifFarNabila: Number(r.tarifFarNabila),
    tarifNearPiknik: Number(r.tarifNearPiknik),
    tarifMediumPiknik: Number(r.tarifMediumPiknik),
    tarifFarPiknik: Number(r.tarifFarPiknik),
    keterangan: String(r.keterangan || ''),
  }));

  const hotelRows = db.prepare('SELECT * FROM hotel ORDER BY rateNabila ASC').all() as any[];
  const hotel: HotelRow[] = hotelRows.map((r) => ({
    id: String(r.id),
    nama: String(r.nama),
    wilayah: String(r.wilayah),
    klasifikasi: String(r.klasifikasi),
    rateNabila: Number(r.rateNabila),
    ratePiknik: Number(r.ratePiknik),
    formatKamar: String(r.formatKamar),
    kapasitas: Number(r.kapasitas),
    includeSarapan: String(r.includeSarapan),
  }));

  const jeepRows = db.prepare('SELECT * FROM jeep ORDER BY id ASC').all() as any[];
  const jeep: JeepRow[] = jeepRows.map((r) => ({
    id: String(r.id),
    lokasiBasecamp: String(r.lokasiBasecamp),
    jenisRute: String(r.jenisRute),
    tarifNabila: Number(r.tarifNabila),
    tarifPiknik: Number(r.tarifPiknik),
    kapasitas: Number(r.kapasitas),
    destinasiDilewati: String(r.destinasiDilewati || ''),
    durasiTrip: String(r.durasiTrip || ''),
  }));

  const opsRows = db.prepare('SELECT * FROM operasional ORDER BY kode ASC').all() as any[];
  const operasional: OperasionalRow[] = opsRows.map((r) => ({
    kode: String(r.kode),
    nama: String(r.nama),
    kategori: String(r.kategori),
    satuan: String(r.satuan),
    biayaNabila: Number(r.biayaNabila),
    biayaPiknik: Number(r.biayaPiknik),
    rasio: String(r.rasio || ''),
  }));

  const quoteRows = db.prepare('SELECT * FROM quotations ORDER BY timestamp DESC').all() as any[];
  const quotations: QuotationRecord[] = quoteRows.map((r) => ({
    quoteId: String(r.quoteId),
    brand: (r.brand === 'piknik' ? 'piknik' : 'nabila'),
    timestamp: String(r.timestamp),
    namaKlien: String(r.namaKlien),
    pax: Number(r.pax),
    durasi: String(r.durasi),
    zona: String(r.zona),
    armada: String(r.armada),
    jumlahJeep: String(r.jumlahJeep),
    hppTotal: Number(r.hppTotal),
    hargaJualPerPax: Number(r.hargaJualPerPax),
    totalNilai: Number(r.totalNilai),
    estimasiLaba: Number(r.estimasiLaba),
    status: String(r.status),
    payloadJson: String(r.payloadJson || '{}'),
  }));

  return {
    destinasi,
    armada,
    hotel,
    jeep,
    operasional,
    quotations,
  };
}

export function updateMasterTables(payload: Partial<MasterDatabase>) {
  const db = getSqliteInstance();
  const current = getMasterDatabase();

  const merged: MasterDatabase = {
    destinasi: payload.destinasi ?? current.destinasi,
    armada: payload.armada ?? current.armada,
    hotel: payload.hotel ?? current.hotel,
    jeep: payload.jeep ?? current.jeep,
    operasional: payload.operasional ?? current.operasional,
    quotations: current.quotations,
  };

  seedAllTables(db, merged, false);
  return getMasterDatabase();
}

export function saveQuotationToDb(record: QuotationRecord) {
  const db = getSqliteInstance();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO quotations (
      quoteId, brand, timestamp, namaKlien, pax, durasi, zona,
      armada, jumlahJeep, hppTotal, hargaJualPerPax, totalNilai,
      estimasiLaba, status, payloadJson
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    record.quoteId,
    record.brand,
    record.timestamp,
    record.namaKlien,
    Number(record.pax) || 1,
    record.durasi,
    record.zona,
    record.armada,
    record.jumlahJeep,
    Number(record.hppTotal) || 0,
    Number(record.hargaJualPerPax) || 0,
    Number(record.totalNilai) || 0,
    Number(record.estimasiLaba) || 0,
    record.status || 'Disimpan',
    record.payloadJson || '{}'
  );

  return getMasterDatabase().quotations;
}

export function deleteQuotationFromDb(quoteId: string) {
  const db = getSqliteInstance();
  db.prepare('DELETE FROM quotations WHERE quoteId = ?').run(quoteId);
  return getMasterDatabase().quotations;
}

export function resetMasterDatabaseToDefault() {
  const db = getSqliteInstance();
  seedAllTables(db, INITIAL_MASTER_DB, false);
  return getMasterDatabase();
}
