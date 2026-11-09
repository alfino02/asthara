import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getSupabaseMasterDatabase } from '@/lib/supabase-service';
import { getMasterDatabase } from '@/lib/db';
import { INITIAL_MASTER_DB } from '@/lib/seed-data';
import {
  getAutoRecommendedArmada,
  getHotelRateForBrand,
  getOpsRateForBrand,
} from '@/lib/calculator';
import { BrandId, MasterDatabase } from '@/types/trip';

export const dynamic = 'force-dynamic';

async function fetchActiveMasterDatabase(): Promise<MasterDatabase> {
  if (isSupabaseConfigured) {
    try {
      const sDb = await getSupabaseMasterDatabase();
      if (sDb && sDb.destinasi && sDb.destinasi.length > 0) {
        return sDb;
      }
    } catch (err) {
      console.warn('Supabase fetch failed in ai-planner, fallback to sqlite/memory:', err);
    }
  }

  try {
    const localDb = getMasterDatabase();
    if (localDb && localDb.destinasi && localDb.destinasi.length > 0) {
      return localDb;
    }
  } catch (err) {
    console.warn('SQLite fetch failed in ai-planner, fallback to seed data:', err);
  }

  return INITIAL_MASTER_DB;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { prompt, brand = 'nabila' } = body as {
      prompt?: string;
      brand?: BrandId;
    };

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, message: 'Silakan masukkan deskripsi atau brief kebutuhan trip.' },
        { status: 400 }
      );
    }

    const db = await fetchActiveMasterDatabase();
    const text = prompt.toLowerCase();

    // 1. Parse Pax (jumlah peserta)
    let pax = 28;
    const paxMatch = text.match(/(\d+)\s*(?:pax|orang|peserta|rombongan|p\b)/i);
    if (paxMatch) {
      pax = Math.max(1, Math.min(500, parseInt(paxMatch[1], 10)));
    }

    // 2. Parse Duration (Hari & Malam)
    let duration = 2;
    const dMatch = text.match(/(\d)\s*d\s*\d*\s*n|(\d)\s*hari/i);
    if (dMatch) {
      duration = Math.max(1, Math.min(7, parseInt(dMatch[1] || dMatch[2], 10)));
    } else if (text.includes('full day') || text.includes('1 hari') || text.includes('1d')) {
      duration = 1;
    } else if (text.includes('3d') || text.includes('3 hari')) {
      duration = 3;
    } else if (text.includes('4d') || text.includes('4 hari')) {
      duration = 4;
    }

    // 3. Parse VIP Allocation
    const incVip =
      text.includes('vip') ||
      text.includes('direktur') ||
      text.includes('direksi') ||
      text.includes('alphard') ||
      text.includes('zenix') ||
      text.includes('eksekutif');

    let vipPax = 2;
    if (incVip) {
      const vipMatch = text.match(/(\d+)\s*(?:direktur|direksi|vip|tamu vip)/i);
      if (vipMatch) {
        vipPax = Math.max(1, Math.min(pax, parseInt(vipMatch[1], 10)));
      }
    } else {
      vipPax = 0;
    }

    // VIP Vehicle selection
    const isAlphard = text.includes('alphard');
    const vipVehName = isAlphard
      ? 'Toyota Alphard Transformer'
      : 'Toyota Innova Zenix Hybrid';
    const vipVehRate = isAlphard ? 2800000 : 1200000;

    // VIP Hotel selection
    let vipHotelName = 'The Shalimar Boutique Hotel 5★';
    let vipHotelRate = 1350000;
    if (text.includes('bintang 4') || text.includes('rayz')) {
      vipHotelName = 'Rayz UMM Hotel';
      vipHotelRate = 550000;
    }

    // Regular pax calculation
    const vipPaxMode = 'add_to_pax';
    const regularPax = pax; // Dalam skema add_to_pax, regularPax tetap armada utama, VIP menambah beban

    // 4. Parse Armada per Day
    const autoArmada = getAutoRecommendedArmada(regularPax, db.armada);
    const armadaPlanByDay: Record<number, any> = {};
    for (let d = 1; d <= 7; d++) {
      armadaPlanByDay[d] = {
        active: d <= duration,
        isAuto: true,
        selected: { ...autoArmada },
      };
    }

    // 5. Parse Hotel star rating
    let targetStar = '3';
    if (text.includes('bintang 5') || text.includes('5 star') || text.includes('bintang lima')) {
      targetStar = '5';
    } else if (text.includes('bintang 4') || text.includes('4 star') || text.includes('rayz') || text.includes('bintang empat')) {
      targetStar = '4';
    } else if (text.includes('bintang 2')) {
      targetStar = '2';
    }

    const matchedHotel =
      db.hotel.find((h) => h.klasifikasi.includes(targetStar)) || db.hotel[1] || db.hotel[0];
    const hotelRate = matchedHotel ? getHotelRateForBrand(matchedHotel, brand) : 600000;

    const hotelPlanByNight: Record<number, any> = {};
    for (let n = 1; n <= 6; n++) {
      hotelPlanByNight[n] = {
        active: n < duration,
        hotelNama: matchedHotel?.nama || 'Hotel Bintang 3',
        klasifikasi: matchedHotel?.klasifikasi || 'Bintang 3',
        wilayah: matchedHotel?.wilayah || 'Kota Malang',
        rate: hotelRate,
      };
    }

    // 6. Match Destinations
    const matchedDests: string[] = [];
    for (const d of db.destinasi) {
      const keywords = d.nama.toLowerCase().split(/[\s/()-]+/).filter((w) => w.length > 3);
      if (keywords.some((kw) => text.includes(kw))) {
        if (!matchedDests.includes(d.nama)) matchedDests.push(d.nama);
      }
    }

    // Destination Fallbacks by region keywords
    if (matchedDests.length === 0) {
      if (text.includes('bromo')) {
        const b = db.destinasi.find((d) => d.nama.toLowerCase().includes('bromo'));
        if (b) matchedDests.push(b.nama);
      }
      if (text.includes('tumpak sewu')) {
        const ts = db.destinasi.find((d) => d.nama.toLowerCase().includes('tumpak'));
        if (ts) matchedDests.push(ts.nama);
      }
      if (text.includes('batu') || matchedDests.length < 2) {
        for (const d of db.destinasi.slice(0, 3)) {
          if (!matchedDests.includes(d.nama)) matchedDests.push(d.nama);
        }
      }
    }

    const selectedDestByDay: Record<number, string[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    };
    matchedDests.forEach((dName, idx) => {
      const dayBucket = (idx % duration) + 1;
      selectedDestByDay[dayBucket].push(dName);
    });

    // 7. Jeep / Adventure
    const incJeep =
      text.includes('jeep') ||
      text.includes('bromo') ||
      text.includes('semeru') ||
      text.includes('offroad');

    const selectedJeepIds: string[] = [];
    if (incJeep) {
      if (text.includes('semeru') || text.includes('lava')) {
        const j = db.jeep.find((x) => x.lokasiBasecamp.toLowerCase().includes('semeru'));
        if (j) selectedJeepIds.push(j.id);
      }
      if (text.includes('bromo') || selectedJeepIds.length === 0) {
        const j =
          db.jeep.find((x) => x.jenisRute.toLowerCase().includes('bromo')) || db.jeep[0];
        if (j && !selectedJeepIds.includes(j.id)) selectedJeepIds.push(j.id);
      }
      if (text.includes('offroad batu') || text.includes('fun offroad')) {
        const j = db.jeep.find((x) => x.jenisRute.toLowerCase().includes('batu'));
        if (j && !selectedJeepIds.includes(j.id)) selectedJeepIds.push(j.id);
      }
    }

    // 8. Meals & Snack
    const mealFreq3 = text.includes('3x') || text.includes('3 kali') || text.includes('tiga kali');
    const stdMeal = getOpsRateForBrand(db.operasional, 'MAKAN_STD', brand, 50000);
    const mealPlanByDay: Record<number, any> = {};
    const snackPlanByDay: Record<number, boolean> = {};

    for (let d = 1; d <= 7; d++) {
      mealPlanByDay[d] = {
        sessions: mealFreq3
          ? ['pagi', 'siang', 'malam']
          : d === duration
          ? ['siang']
          : ['siang', 'malam'],
        budget: stdMeal,
      };
      snackPlanByDay[d] = d <= duration;
    }

    // 9. Documentation & SDM
    const incDrone = text.includes('drone') || text.includes('aerial');
    const incVideo = text.includes('video') || text.includes('cinematic') || text.includes('reels');
    const incGala = text.includes('gala') || text.includes('electone') || text.includes('hiburan') || text.includes('live music');

    // Armada text summary
    const armadaDesc = Object.entries(autoArmada)
      .filter(([_, count]) => (count as number) > 0)
      .map(([k, v]) => `${v}x ${k}`)
      .join(', ') || 'Armada Sesuai Pax';

    const clientNameMatch = text.match(/(?:pt|cv|instansi|kantor|gathering|tour)\s+([a-z0-9\s.&'-]+?)(?=\s+\d|\s+pax|\s+dengan|,|\.|$)/i);
    const detectedName = clientNameMatch ? clientNameMatch[0].trim().toUpperCase() : `Family Gathering ${duration}D1N — ${pax} Pax`;

    return NextResponse.json({
      success: true,
      summary: `✨ Berhasil memetakan brief: Paket ${duration} Hari ${pax} Pax (${regularPax} Reguler${
        incVip ? ` + ${vipPax} VIP [${vipVehName}]` : ''
      }), ${armadaDesc}, Akomodasi ${matchedHotel?.nama}, ${matchedDests.length} destinasi, ${
        incJeep ? 'include Jeep Adventure, ' : ''
      }makan ${mealFreq3 ? '3x' : '2x'}/hari${incDrone ? ', Drone' : ''}${incVideo ? ', Video' : ''}.`,
      config: {
        tripName: detectedName,
        pax,
        duration,
        incTransport: true,
        armadaPlanByDay,
        incHotel: duration > 1,
        hotelPlanByNight,
        selectedDestByDay,
        incJeep,
        selectedJeepIds,
        incMeal: true,
        mealPlanByDay,
        incSnack: true,
        snackPlanByDay,
        incTl: true,
        customTlCount: null,
        customTlDays: duration,
        incAkomodasiKru: duration > 1,
        hariAkomodasiKru: Math.max(1, duration - 1),
        incFoto: true,
        fotoDays: duration,
        incVideo,
        videoDays: duration,
        incDrone,
        droneDays: 1,
        incGala,
        // VIP configurations
        incVip,
        vipPaxMode,
        vipPax,
        vipVehName,
        vipVehRate,
        vipVehUnits: 1,
        vipVehDays: duration,
        vipHotelName,
        vipHotelRate,
        vipHotelRooms: Math.ceil(vipPax / 2),
        vipHotelNights: Math.max(1, duration - 1),
        incVipMeal: incVip,
        vipMealName: 'Jamuan Makan VIP (Resto Eksklusif)',
        vipMealRate: 150000,
        vipMealDays: duration,
        vipMealPagi: true,
        vipMealSiang: true,
        vipMealMalam: true,
        incVipExtraBeban: false,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/ai-planner:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memproses brief AI' },
      { status: 500 }
    );
  }
}
