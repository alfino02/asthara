import { NextResponse } from 'next/server';
import { getMasterDatabase } from '@/lib/db';
import {
  getAutoRecommendedArmada,
  getHotelRateForBrand,
  getOpsRateForBrand,
} from '@/lib/calculator';
import { BrandId } from '@/types/trip';

export async function POST(request: Request) {
  try {
    const { prompt, brand = 'nabila' } = (await request.json()) as {
      prompt: string;
      brand?: BrandId;
    };

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, message: 'Masukkan deskripsi singkat rencana trip.' },
        { status: 400 }
      );
    }

    const db = getMasterDatabase();
    const text = prompt.toLowerCase();

    // 1. Parse Pax
    let pax = 28;
    const paxMatch = text.match(/(\d+)\s*(?:pax|orang|peserta|rombongan)/i);
    if (paxMatch) {
      pax = Math.max(1, Math.min(500, parseInt(paxMatch[1], 10)));
    }

    // 2. Parse Duration
    let duration = 2;
    const dMatch = text.match(/(\d)\s*d\s*\d*\s*n|(\d)\s*hari/i);
    if (dMatch) {
      duration = Math.max(1, Math.min(7, parseInt(dMatch[1] || dMatch[2], 10)));
    } else if (text.includes('full day') || text.includes('1 hari')) {
      duration = 1;
    }

    // 3. Parse VIP
    const incVip =
      text.includes('vip') ||
      text.includes('direktur') ||
      text.includes('alphard') ||
      text.includes('eksekutif');
    let vipPax = 2;
    const vipMatch = text.match(/(\d+)\s*(?:direktur|vip|tamu vip)/i);
    if (vipMatch) {
      vipPax = Math.min(pax, parseInt(vipMatch[1], 10));
    }

    const regularPax = incVip ? Math.max(1, pax - vipPax) : pax;

    // 4. Parse Armada per Day
    const autoArmada = getAutoRecommendedArmada(regularPax, db.armada);
    const armadaPlanByDay: Record<number, any> = {};
    for (let d = 1; d <= 7; d++) {
      armadaPlanByDay[d] = {
        active: true,
        isAuto: true,
        selected: { ...autoArmada },
      };
    }

    // 5. Parse Hotel star rating
    let targetStar = '3';
    if (text.includes('bintang 5') || text.includes('5 star')) targetStar = '5';
    else if (text.includes('bintang 4') || text.includes('4 star') || text.includes('rayz'))
      targetStar = '4';
    else if (text.includes('bintang 2')) targetStar = '2';

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
        matchedDests.push(d.nama);
      }
    }
    if (matchedDests.length === 0) {
      if (text.includes('bromo')) {
        const b = db.destinasi.find((d) => d.nama.toLowerCase().includes('bromo'));
        if (b) matchedDests.push(b.nama);
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

    // 7. Jeep
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
    }

    // 8. Meals & Documentation
    const mealFreq3 = text.includes('3x') || text.includes('3 kali');
    const stdMeal = getOpsRateForBrand(db.operasional, 'MAKAN_STD', brand, 50000);
    const mealPlanByDay: Record<number, any> = {};
    for (let d = 1; d <= 7; d++) {
      mealPlanByDay[d] = {
        sessions: mealFreq3
          ? ['pagi', 'siang', 'malam']
          : d === duration
          ? ['siang']
          : ['siang', 'malam'],
        budget: stdMeal,
      };
    }

    const incDrone = text.includes('drone');
    const incVideo = text.includes('video') || text.includes('cinematic');
    const incGala = text.includes('gala') || text.includes('electone') || text.includes('hiburan');

    return NextResponse.json({
      success: true,
      summary: `Berhasil menyusun skema ${duration} Hari untuk ${pax} Pax (${regularPax} Reguler${
        incVip ? ` + ${vipPax} VIP` : ''
      }), akomodasi ${matchedHotel?.nama}, armada ${Object.entries(autoArmada)
        .map(([k, v]) => `${v}x ${k}`)
        .join(', ')}, dan ${matchedDests.length} destinasi wisata.`,
      config: {
        tripName: `Custom Tour ${duration}D — ${pax} Pax`,
        pax,
        duration,
        incVip,
        vipPax,
        armadaPlanByDay,
        incHotel: duration > 1,
        hotelPlanByNight,
        selectedDestByDay,
        incJeep,
        selectedJeepIds,
        mealPlanByDay,
        incDrone,
        droneDays: 1,
        incVideo,
        videoDays: duration,
        incFoto: true,
        fotoDays: duration,
        incGala,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memproses brief AI' },
      { status: 500 }
    );
  }
}
