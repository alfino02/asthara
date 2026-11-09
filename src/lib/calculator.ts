import {
  ArmadaDayPlan,
  ArmadaRow,
  BrandId,
  CalculationResult,
  CalculatorState,
  DestinasiRow,
  DistanceZone,
  HotelRow,
  JeepRow,
  ManifestItem,
  MasterDatabase,
  OperasionalRow,
  RabLineItem,
} from '@/types/trip';

export function formatRupiah(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  return 'Rp ' + rounded.toLocaleString('id-ID');
}

export function getArmadaRateForBrand(
  armada: ArmadaRow,
  zone: DistanceZone,
  brand: BrandId
): number {
  if (brand === 'nabila') {
    if (zone === 'near') return armada.tarifNearNabila;
    if (zone === 'medium') return armada.tarifMediumNabila;
    return armada.tarifFarNabila;
  } else {
    if (zone === 'near') return armada.tarifNearPiknik;
    if (zone === 'medium') return armada.tarifMediumPiknik;
    return armada.tarifFarPiknik;
  }
}

export function getDestHtmForBrand(
  dest: DestinasiRow,
  isForeigner: boolean,
  brand: BrandId
): number {
  if (brand === 'nabila') {
    return isForeigner ? dest.htmMancanegaraNabila : dest.htmDomestikNabila;
  }
  return isForeigner ? dest.htmMancanegaraPiknik : dest.htmDomestikPiknik;
}

export function getDestGuideForBrand(dest: DestinasiRow, brand: BrandId): number {
  return brand === 'nabila' ? dest.biayaGuideNabila : dest.biayaGuidePiknik;
}

export function getHotelRateForBrand(hotel: HotelRow, brand: BrandId): number {
  return brand === 'nabila' ? hotel.rateNabila : hotel.ratePiknik;
}

export function getJeepRateForBrand(jeep: JeepRow, brand: BrandId): number {
  return brand === 'nabila' ? jeep.tarifNabila : jeep.tarifPiknik;
}

export function getOpsRateForBrand(
  opsList: OperasionalRow[],
  kode: string,
  brand: BrandId,
  fallbackPrice = 0
): number {
  const found = opsList.find((o) => o.kode === kode);
  if (!found) return fallbackPrice;
  return brand === 'nabila' ? found.biayaNabila : found.biayaPiknik;
}

export function getAutoRecommendedArmada(
  regularPax: number,
  armadaList: ArmadaRow[]
): Record<string, number> {
  if (regularPax <= 0 || armadaList.length === 0) return {};

  const sorted = [...armadaList].sort((a, b) => a.kapasitas - b.kapasitas);

  // Find single vehicle that fits minPax/maxPax or kapasitas
  for (const veh of sorted) {
    if (regularPax <= veh.kapasitas) {
      // Prefer standard Hiace Commuter over Premio for auto unless small VIP
      if (veh.nama.toLowerCase().includes('premio') && regularPax > 8) continue;
      return { [veh.nama]: 1 };
    }
  }

  // Otherwise use largest vehicle (Big Bus) and calculate units
  const largest = sorted[sorted.length - 1];
  const units = Math.max(1, Math.ceil(regularPax / (largest.kapasitas || 50)));
  return { [largest.nama]: units };
}

export function getAutoFitUnitsForVehicle(
  armadaName: string,
  regularPax: number,
  armadaList: ArmadaRow[]
): number {
  const found = armadaList.find((a) => a.nama === armadaName);
  const cap = found?.kapasitas || 14;
  return Math.max(1, Math.ceil(Math.max(1, regularPax) / cap));
}

export function createDefaultCalculatorState(
  db: MasterDatabase,
  brand: BrandId = 'nabila'
): CalculatorState {
  const defaultPax = 28;
  const defaultDays = 2;
  const autoArmada = getAutoRecommendedArmada(defaultPax, db.armada);

  const armadaPlanByDay: Record<number, ArmadaDayPlan> = {};
  for (let d = 1; d <= 7; d++) {
    armadaPlanByDay[d] = {
      active: true,
      isAuto: true,
      selected: { ...autoArmada },
    };
  }

  const defaultHotel =
    db.hotel.find((h) => h.klasifikasi.includes('3')) || db.hotel[0] || {
      nama: 'Hotel Bintang 3',
      klasifikasi: 'Bintang 3',
      wilayah: 'Kota Malang',
      rateNabila: 600000,
      ratePiknik: 600000,
    };

  const hotelRate = getHotelRateForBrand(defaultHotel as HotelRow, brand);

  const hotelPlanByNight: Record<number, any> = {};
  for (let n = 1; n <= 6; n++) {
    hotelPlanByNight[n] = {
      active: n === 1,
      hotelNama: defaultHotel.nama,
      klasifikasi: defaultHotel.klasifikasi,
      wilayah: defaultHotel.wilayah,
      rate: hotelRate,
    };
  }

  const stdMealBudget = getOpsRateForBrand(db.operasional, 'MAKAN_STD', brand, 50000);
  const mealPlanByDay: Record<number, any> = {};
  const snackPlanByDay: Record<number, boolean> = {};
  for (let d = 1; d <= 7; d++) {
    mealPlanByDay[d] = {
      sessions: d === 1 ? ['siang', 'malam'] : d === 2 ? ['siang'] : ['siang', 'malam'],
      budget: stdMealBudget,
    };
    snackPlanByDay[d] = true;
  }

  const selectedDestByDay: Record<number, string[]> = {
    1: db.destinasi.slice(0, 2).map((d) => d.nama),
    2: db.destinasi.slice(2, 3).map((d) => d.nama),
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
  };

  return {
    tripName: 'Family Gathering PT. Maju Bersama',
    pax: defaultPax,
    duration: defaultDays,
    distanceZone: 'medium',
    isForeigner: false,

    incTransport: true,
    armadaPlanByDay,
    inputTol: 350000,

    incVip: false,
    vipPaxMode: 'add_to_pax',
    vipPax: 2,
    vipVehName: 'Toyota Alphard Transformer VIP',
    vipVehRate: 2500000,
    vipVehUnits: 1,
    vipVehDays: 2,
    vipHotelName: 'The Shalimar Boutique Hotel 5★',
    vipHotelRate: 1350000,
    vipHotelRooms: 1,
    vipHotelNights: 1,
    incVipMeal: true,
    vipMealName: 'Fine Dining / Resto VIP Eksklusif',
    vipMealRate: 100000,
    vipMealDays: 2,
    vipMealPagi: false,
    vipMealSiang: true,
    vipMealMalam: true,
    incVipExtraBeban: true,
    vipExtraBebanName: 'VIP Amenities, Fruit Basket & Driver Allowance',
    vipExtraBebanBudget: 500000,
    vipExtraBebanDays: 2,

    incGala: false,
    galaDinnerItems: [
      {
        id: 'gala_1',
        nama: 'Paket Buffet / Makan Malam Gala Dinner',
        price: 150000,
        qty: 28,
        days: 1,
      },
      {
        id: 'gala_2',
        nama: 'Hiburan Live Music / Electone & Sound System',
        price: 2500000,
        qty: 1,
        days: 1,
      },
    ],

    selectedDestByDay,

    incJeep: true,
    selectedJeepIds: db.jeep[1] ? [db.jeep[1].id] : db.jeep[0] ? [db.jeep[0].id] : [],

    incHotel: true,
    hotelRoomCapacity: 2,
    incExtrabed: false,
    extrabedPrice: 250000,
    customExtrabedCount: null,
    hotelPlanByNight,

    incMeal: true,
    mealPlanByDay,
    incSnack: true,
    snackPlanByDay,

    incTl: true,
    customTlCount: null,
    customTlDays: null,
    incAkomodasiKru: false,
    biayaAkomodasiKru: 300000,
    hariAkomodasiKru: 1,
    incRunner: false,
    runnerCount: 1,
    runnerBudget: getOpsRateForBrand(db.operasional, 'RUNNER', brand, 200000),
    runnerDays: 2,
    incFoto: true,
    fotoDays: 2,
    incVideo: false,
    videoDays: 1,
    incDrone: false,
    droneDays: 1,
    incGuide: true,
    guidePaxRatio: 10,
    incGuideUmum: false,
    guideDisabledDest: {},
    customGuideCounts: {},
    incBanner: true,
    incP3k: true,

    enableLaba: true,
    marginPct: 20,
    taxPct: 2,

    customPriceOverrides: {},
  };
}

export function calculateTrip(
  state: CalculatorState,
  db: MasterDatabase,
  brand: BrandId
): CalculationResult {
  const rawPax = Math.max(1, Number(state.pax) || 1);
  const days = Math.max(1, Math.min(7, Number(state.duration) || 1));
  const nights = Math.max(0, days - 1);
  const zone = state.distanceZone || 'medium';

  const isVipActive = Boolean(state.incVip);
  const rawVipPax = isVipActive ? Math.max(0, Number(state.vipPax) || 0) : 0;
  const vipPaxMode = state.vipPaxMode || 'add_to_pax';

  let totalPax = rawPax;
  let regularPax = rawPax;
  let vipPax = 0;

  if (isVipActive && rawVipPax > 0) {
    if (vipPaxMode === 'add_to_pax') {
      // VIP menambah beban peserta di atas kuota reguler
      regularPax = rawPax;
      vipPax = rawVipPax;
      totalPax = regularPax + vipPax;
    } else {
      // VIP sebagai sub-alokasi dari total pax
      vipPax = Math.min(rawPax, rawVipPax);
      regularPax = Math.max(0, rawPax - vipPax);
      totalPax = rawPax;
    }
  }

  const resolvePrice = (key: string, defaultPrice: number): { price: number; isOverridden: boolean } => {
    if (
      state.customPriceOverrides &&
      state.customPriceOverrides[key] !== undefined &&
      !Number.isNaN(Number(state.customPriceOverrides[key]))
    ) {
      return {
        price: Number(state.customPriceOverrides[key]),
        isOverridden: Number(state.customPriceOverrides[key]) !== defaultPrice,
      };
    }
    return { price: defaultPrice, isOverridden: false };
  };

  const rabItems: RabLineItem[] = [];
  const manifestItems: ManifestItem[] = [];

  // 1. ARMADA REGULER (Per Hari & Multi-Select)
  const armadaSummaryMap: Record<
    string,
    {
      nama: string;
      totalUnitDays: number;
      daysMap: Record<number, number>;
      defaultRate: number;
      effectiveRate: number;
      kapasitas: number;
      totalCost: number;
      isOverridden: boolean;
    }
  > = {};

  let maxDriverCount = 0;

  if (state.incTransport) {
    for (let d = 1; d <= days; d++) {
      const plan = state.armadaPlanByDay[d];
      if (!plan || !plan.active) continue;

      let dayDrivers = 0;
      for (const [armadaName, rawUnits] of Object.entries(plan.selected || {})) {
        const units = Number(rawUnits) || 0;
        if (units <= 0) continue;

        const armRow = db.armada.find((a) => a.nama === armadaName);
        const defaultRate = armRow ? getArmadaRateForBrand(armRow, zone, brand) : 1500000;
        const cap = armRow?.kapasitas || 14;
        const priceKey = `armada_${armadaName}`;
        const { price: effectiveRate, isOverridden } = resolvePrice(priceKey, defaultRate);

        if (!armadaSummaryMap[armadaName]) {
          armadaSummaryMap[armadaName] = {
            nama: armadaName,
            totalUnitDays: 0,
            daysMap: {},
            defaultRate,
            effectiveRate,
            kapasitas: cap,
            totalCost: 0,
            isOverridden,
          };
        }

        armadaSummaryMap[armadaName].totalUnitDays += units;
        armadaSummaryMap[armadaName].daysMap[d] = units;
        armadaSummaryMap[armadaName].totalCost += units * effectiveRate;

        const isBus = armadaName.toLowerCase().includes('bus');
        dayDrivers += isBus ? units * 2 : units;
      }
      if (dayDrivers > maxDriverCount) maxDriverCount = dayDrivers;
    }

    for (const s of Object.values(armadaSummaryMap)) {
      const dayKeys = Object.keys(s.daysMap).map(Number).sort((a, b) => a - b);
      let volText = '';
      if (days === 1) {
        volText = `${s.totalUnitDays} Unit`;
      } else if (
        dayKeys.length === days &&
        dayKeys.every((d) => s.daysMap[d] === s.daysMap[dayKeys[0]])
      ) {
        volText = `${s.daysMap[dayKeys[0]]} Unit × ${days} Hari`;
      } else {
        const detail = dayKeys.map((d) => `H${d}: ${s.daysMap[d]}U`).join(', ');
        volText = `${s.totalUnitDays} Unit-Hari (${detail})`;
      }

      rabItems.push({
        key: `armada_${s.nama}`,
        category: 'Transportasi',
        label: `Sewa Armada: ${s.nama}`,
        subLabel: `Kapasitas ${s.kapasitas} kursi/unit`,
        volumeText: volText,
        multiplier: s.totalUnitDays,
        unitPrice: s.effectiveRate,
        defaultUnitPrice: s.defaultRate,
        subtotal: s.totalCost,
        isOverridden: s.isOverridden,
      });
    }

    // Tol & Parkir
    const defaultTol = Number(state.inputTol) || 0;
    if (defaultTol > 0) {
      const { price: effTol, isOverridden } = resolvePrice('tol_parkir', defaultTol);
      rabItems.push({
        key: 'tol_parkir',
        category: 'Transportasi',
        label: 'BBM Tambahan, Tol & Parkir Kawasan',
        volumeText: '1 Paket Operasional',
        multiplier: 1,
        unitPrice: effTol,
        defaultUnitPrice: defaultTol,
        subtotal: effTol,
        isOverridden,
      });
    }
  }

  const regArmadaSummaryText =
    state.incTransport && Object.keys(armadaSummaryMap).length > 0
      ? Object.values(armadaSummaryMap)
          .map((s) => {
            const maxU = Math.max(...Object.values(s.daysMap));
            return `${maxU} Unit ${s.nama}`;
          })
          .join(' + ')
      : 'Land Tour Only (Tanpa Armada)';

  const armadaSummaryText =
    state.incVip && vipPax > 0 && state.vipVehName
      ? `${regArmadaSummaryText} (+ ${state.vipVehUnits || 1} Unit ${state.vipVehName} VIP)`
      : regArmadaSummaryText;

  manifestItems.push({
    kategori: 'Armada Utama',
    spesifikasi: armadaSummaryText,
    jumlahSatuan: state.incTransport
      ? `${Object.values(armadaSummaryMap).reduce((acc, x) => acc + Math.max(...Object.values(x.daysMap)), 0)} Unit`
      : '0 Unit',
    keteranganLapangan: state.incTransport
      ? `Zona ${zone === 'near' ? 'Dalam Kota (<50km)' : zone === 'medium' ? 'Luar Kota Dekat (50-150km)' : 'Luar Kota Jauh (>150km)'}`
      : 'Klien membawa kendaraan sendiri',
    status: state.incTransport ? 'aktif' : 'nonaktif',
  });

  // 2. VIP EXECUTIVE ALLOCATION & BEBAN TAMBAHAN
  if (state.incVip && vipPax > 0) {
    const vipVehDays = Math.max(1, Math.min(days, Number(state.vipVehDays) || days));
    const vipVehUnits = Math.max(1, Number(state.vipVehUnits) || 1);
    const { price: effVipVeh, isOverridden: ovVipVeh } = resolvePrice(
      'vip_vehicle',
      Number(state.vipVehRate) || 2500000
    );
    const vehSubtotal = vipVehUnits * vipVehDays * effVipVeh;
    rabItems.push({
      key: 'vip_vehicle',
      category: 'VIP & Gala',
      label: `Kendaraan Khusus VIP: ${state.vipVehName}`,
      subLabel: `Alokasi ${vipPax} Tamu VIP (${vipPaxMode === 'add_to_pax' ? 'Menambah Beban' : 'Sub-Alokasi'})`,
      volumeText: `${vipVehUnits} Unit × ${vipVehDays} Hari`,
      multiplier: vipVehUnits * vipVehDays,
      unitPrice: effVipVeh,
      defaultUnitPrice: Number(state.vipVehRate) || 2500000,
      subtotal: vehSubtotal,
      isOverridden: ovVipVeh,
      highlight: 'vip',
    });

    if (nights > 0 && (state.vipHotelNights ?? nights) > 0) {
      const defaultRooms = Math.max(1, Math.ceil(vipPax / 2));
      const vipRooms = Math.max(1, Number(state.vipHotelRooms) || defaultRooms);
      const vipNights = Math.max(1, Math.min(nights, Number(state.vipHotelNights) || nights));
      const { price: effVipHtl, isOverridden: ovVipHtl } = resolvePrice(
        'vip_hotel',
        Number(state.vipHotelRate) || 1350000
      );
      const htlSubtotal = vipRooms * vipNights * effVipHtl;
      rabItems.push({
        key: 'vip_hotel',
        category: 'VIP & Gala',
        label: `Hotel VIP: ${state.vipHotelName}`,
        subLabel: `${vipRooms} Kamar VIP`,
        volumeText: `${vipRooms} Kamar × ${vipNights} Malam`,
        multiplier: vipRooms * vipNights,
        unitPrice: effVipHtl,
        defaultUnitPrice: Number(state.vipHotelRate) || 1350000,
        subtotal: htlSubtotal,
        isOverridden: ovVipHtl,
        highlight: 'vip',
      });
    }

    const vipSessionsPerDay =
      (state.vipMealPagi ? 1 : 0) +
      (state.vipMealSiang ? 1 : 0) +
      (state.vipMealMalam ? 1 : 0);

    if (state.incVipMeal && vipSessionsPerDay > 0) {
      const vipMealDays = Math.max(1, Math.min(days, Number(state.vipMealDays) || days));
      const totalVipPortions = vipPax * vipSessionsPerDay * vipMealDays;
      const { price: effVipMeal, isOverridden: ovVipMeal } = resolvePrice(
        'vip_meal',
        Number(state.vipMealRate) || 100000
      );
      rabItems.push({
        key: 'vip_meal',
        category: 'VIP & Gala',
        label: `Jamuan Makan VIP: ${state.vipMealName}`,
        subLabel: `${vipSessionsPerDay}x sehari (${vipMealDays} hari)`,
        volumeText: `${totalVipPortions} Porsi`,
        multiplier: totalVipPortions,
        unitPrice: effVipMeal,
        defaultUnitPrice: Number(state.vipMealRate) || 100000,
        subtotal: totalVipPortions * effVipMeal,
        isOverridden: ovVipMeal,
        highlight: 'vip',
      });
    }

    if (state.incVipExtraBeban) {
      const extraDays = Math.max(1, Math.min(days, Number(state.vipExtraBebanDays) || days));
      const defExtraPrice = Number(state.vipExtraBebanBudget) || 500000;
      const { price: effExtra, isOverridden: ovExtra } = resolvePrice(
        'vip_extra_beban',
        defExtraPrice
      );
      rabItems.push({
        key: 'vip_extra_beban',
        category: 'VIP & Gala',
        label: `Beban Layanan Ekstra VIP: ${state.vipExtraBebanName || 'Amenities & Operasional Khusus VIP'}`,
        subLabel: 'Fruit Basket, Welcome Garland & Driver Standby',
        volumeText: `1 Paket × ${extraDays} Hari`,
        multiplier: extraDays,
        unitPrice: effExtra,
        defaultUnitPrice: defExtraPrice,
        subtotal: extraDays * effExtra,
        isOverridden: ovExtra,
        highlight: 'vip',
      });
    }

    manifestItems.push({
      kategori: 'Layanan Eksekutif VIP',
      spesifikasi: `${vipVehUnits} Unit ${state.vipVehName} (${vipVehDays} Hari)${nights > 0 ? ` & Hotel ${state.vipHotelName}` : ''}`,
      jumlahSatuan: `${vipPax} Tamu VIP`,
      keteranganLapangan: `Mode: ${vipPaxMode === 'add_to_pax' ? 'Menambah Beban Rombongan' : 'Sub-Alokasi Rombongan'}, handling terpisah dari reguler`,
      status: 'vip',
    });
  }

  // 3. GALA DINNER & ENTERTAINMENT
  if (state.incGala && state.galaDinnerItems.length > 0) {
    for (const item of state.galaDinnerItems) {
      const qty = Math.max(1, Number(item.qty) || 1);
      const itemDays = Math.max(1, Number(item.days) || 1);
      const mult = qty * itemDays;
      const defPrice = Number(item.price) || 0;
      const key = `gala_${item.id}`;
      const { price: effPrice, isOverridden } = resolvePrice(key, defPrice);

      rabItems.push({
        key,
        category: 'VIP & Gala',
        label: `Gala Dinner: ${item.nama}`,
        volumeText: itemDays > 1 ? `${qty} Unit/Pax × ${itemDays} Hari` : `${qty} Unit/Pax`,
        multiplier: mult,
        unitPrice: effPrice,
        defaultUnitPrice: defPrice,
        subtotal: mult * effPrice,
        isOverridden,
        highlight: 'gala',
      });
    }
  }

  // 4. DESTINASI WISATA & GUIDE LOKAL
  let totalDestCount = 0;
  for (let d = 1; d <= days; d++) {
    const destNames = state.selectedDestByDay[d] || [];
    for (const dName of destNames) {
      const destObj = db.destinasi.find((x) => x.nama === dName);
      if (!destObj) continue;
      totalDestCount++;

      const defaultHtm = getDestHtmForBrand(destObj, state.isForeigner, brand);
      const key = `dest_D${d}_${destObj.id}`;
      const { price: effHtm, isOverridden } = resolvePrice(key, defaultHtm);

      rabItems.push({
        key,
        category: 'Destinasi & Jeep',
        label: `Tiket Wisata (Hari ${d}): ${destObj.nama}`,
        subLabel: destObj.wilayah,
        volumeText: `${totalPax} Pax`,
        multiplier: totalPax,
        unitPrice: effHtm,
        defaultUnitPrice: defaultHtm,
        subtotal: totalPax * effHtm,
        isOverridden,
      });

      // Local guide per destination
      const destGuideDefault =
        getDestGuideForBrand(destObj, brand) ||
        getOpsRateForBrand(db.operasional, 'GUIDE_LOKAL', brand, 150000);
      const isGuideDisabled = Boolean(state.guideDisabledDest[destObj.nama]);
      const destGuideCap = Math.max(1, Number(destObj.kapasitasGuide) || Number(state.guidePaxRatio) || 10);

      if (state.incGuide && destObj.wajibGuide && !isGuideDisabled && destGuideDefault > 0) {
        const gCount =
          state.customGuideCounts[destObj.nama] || Math.max(1, Math.ceil(totalPax / destGuideCap));
        const gKey = `guide_dest_${destObj.id}_D${d}`;
        const { price: effGuide, isOverridden: ovGuide } = resolvePrice(gKey, destGuideDefault);
        rabItems.push({
          key: gKey,
          category: 'Destinasi & Jeep',
          label: `Guide Lokal Wajib: ${destObj.nama}`,
          subLabel: `Regulasi kawasan wisata (Rasio 1 Guide / ${destGuideCap} Pax)`,
          volumeText: `${gCount} Guide`,
          multiplier: gCount,
          unitPrice: effGuide,
          defaultUnitPrice: destGuideDefault,
          subtotal: gCount * effGuide,
          isOverridden: ovGuide,
        });
      }
    }
  }

  if (state.incGuide && state.incGuideUmum) {
    const defGuideUmum = getOpsRateForBrand(db.operasional, 'GUIDE_LOKAL', brand, 150000);
    const { price: effGuideUmum, isOverridden } = resolvePrice('guide_umum', defGuideUmum);
    rabItems.push({
      key: 'guide_umum',
      category: 'Kru & Dokumentasi',
      label: 'Pemandu Wisata (Local Guide Pendamping Umum)',
      volumeText: `1 Orang × ${days} Hari`,
      multiplier: days,
      unitPrice: effGuideUmum,
      defaultUnitPrice: defGuideUmum,
      subtotal: days * effGuideUmum,
      isOverridden,
    });
  }

  // 5. JEEP 4x4 & PETUALANGAN
  let totalJeepUnits = 0;
  const jeepNames: string[] = [];
  if (state.incJeep && state.selectedJeepIds.length > 0) {
    for (const jId of state.selectedJeepIds) {
      const jeepObj = db.jeep.find((j) => j.id === jId);
      if (!jeepObj) continue;

      const cap = Math.max(1, jeepObj.kapasitas || 5);
      const units = Math.max(1, Math.ceil(totalPax / cap));
      totalJeepUnits += units;
      jeepNames.push(`${jeepObj.lokasiBasecamp} (${units} Unit)`);

      const defaultJeepRate = getJeepRateForBrand(jeepObj, brand);
      const key = `jeep_${jeepObj.id}`;
      const { price: effJeepRate, isOverridden } = resolvePrice(key, defaultJeepRate);

      rabItems.push({
        key,
        category: 'Destinasi & Jeep',
        label: `Armada Jeep / Adventure: ${jeepObj.lokasiBasecamp}`,
        subLabel: `${jeepObj.jenisRute} (Maks ${cap} pax/unit)`,
        volumeText: `${units} Unit`,
        multiplier: units,
        unitPrice: effJeepRate,
        defaultUnitPrice: defaultJeepRate,
        subtotal: units * effJeepRate,
        isOverridden,
      });
    }
  }

  const jeepSummaryText =
    state.incJeep && jeepNames.length > 0 ? jeepNames.join(', ') : 'Tidak Menggunakan Jeep';

  manifestItems.push({
    kategori: 'Armada Jeep 4x4',
    spesifikasi: jeepSummaryText,
    jumlahSatuan: state.incJeep ? `${totalJeepUnits} Unit` : '0 Unit',
    keteranganLapangan: state.incJeep
      ? 'Disesuaikan kapasitas per rute jeep'
      : 'Tidak termasuk paket jeep',
    status: state.incJeep && totalJeepUnits > 0 ? 'aktif' : 'nonaktif',
  });

  // 6. AKOMODASI HOTEL REGULER (Per Malam) & EXTRABED
  const isExtrabedActive = Boolean(state.incExtrabed);
  const baseRoomCapacity = Math.max(1, Number(state.hotelRoomCapacity) || 2);
  const defaultTripleRooms = Math.max(1, Math.ceil(regularPax / 3));
  const defaultExtrabedsNeeded = isExtrabedActive
    ? Math.max(0, regularPax - (defaultTripleRooms * 2))
    : 0;
  const extrabedUnits = isExtrabedActive
    ? (state.customExtrabedCount !== undefined && state.customExtrabedCount !== null && state.customExtrabedCount >= 0
        ? Number(state.customExtrabedCount)
        : defaultExtrabedsNeeded)
    : 0;
  
  // When extrabeds are used, each extrabed accommodates 1 pax, reducing regular bed requirements
  const regularRooms = isExtrabedActive
    ? Math.max(1, Math.ceil(Math.max(0, regularPax - extrabedUnits) / baseRoomCapacity))
    : Math.max(1, Math.ceil(regularPax / baseRoomCapacity));
  const defaultExtrabedRate = Number(state.extrabedPrice) || 250000;
  const hotelNamesSummary: string[] = [];

  if (state.incHotel && nights > 0 && regularPax > 0) {
    for (let n = 1; n <= nights; n++) {
      const nPlan = state.hotelPlanByNight[n];
      if (!nPlan || !nPlan.active) continue;

      const matchedHotel = db.hotel.find((h) => h.nama === nPlan.hotelNama);
      const defaultRate = matchedHotel
        ? getHotelRateForBrand(matchedHotel, brand)
        : Number(nPlan.rate) || 600000;

      const key = `hotel_night_${n}`;
      const { price: effRate, isOverridden } = resolvePrice(key, defaultRate);
      hotelNamesSummary.push(`Malam ${n}: ${nPlan.hotelNama}`);

      const roomFormatLabel = isExtrabedActive
        ? 'Triple Share (3 Pax/Kamar) [Extrabed]'
        : baseRoomCapacity === 1
        ? 'Single Room (1 Pax/Kamar)'
        : baseRoomCapacity === 2
        ? 'Twin Share (2 Pax/Kamar)'
        : baseRoomCapacity === 3
        ? 'Triple Share (3 Pax/Kamar)'
        : `${baseRoomCapacity} Pax/Kamar`;

      rabItems.push({
        key,
        category: 'Akomodasi',
        label: `Akomodasi Hotel (Malam ${n}): ${nPlan.hotelNama}`,
        subLabel: `${nPlan.klasifikasi} — ${roomFormatLabel}`,
        volumeText: `${regularRooms} Kamar × 1 Malam`,
        multiplier: regularRooms,
        unitPrice: effRate,
        defaultUnitPrice: defaultRate,
        subtotal: regularRooms * effRate,
        isOverridden,
      });

      // Extrabed line item per malam if extrabed is active and required
      if (isExtrabedActive && extrabedUnits > 0) {
        const ebKey = `extrabed_night_${n}`;
        const { price: effEbRate, isOverridden: isEbOverridden } = resolvePrice(
          ebKey,
          defaultExtrabedRate
        );
        rabItems.push({
          key: ebKey,
          category: 'Akomodasi',
          label: `Extrabed Hotel (Malam ${n}): ${nPlan.hotelNama}`,
          subLabel: `Penambahan Kasur Ekstra Triple Share (${extrabedUnits} Bed/Pax)`,
          volumeText: `${extrabedUnits} Bed × 1 Malam`,
          multiplier: extrabedUnits,
          unitPrice: effEbRate,
          defaultUnitPrice: defaultExtrabedRate,
          subtotal: extrabedUnits * effEbRate,
          isOverridden: isEbOverridden,
        });
      }
    }
  }

  if (state.incAkomodasiKru && nights > 0) {
    const kruNights = Math.max(1, Number(state.hariAkomodasiKru) || nights);
    const defKruRate = Number(state.biayaAkomodasiKru) || 300000;
    const { price: effKruRate, isOverridden } = resolvePrice('akomodasi_kru', defKruRate);
    rabItems.push({
      key: 'akomodasi_kru',
      category: 'Akomodasi',
      label: 'Tunjangan Penginapan / Kamar Kru & Driver',
      volumeText: `1 Paket × ${kruNights} Malam`,
      multiplier: kruNights,
      unitPrice: effKruRate,
      defaultUnitPrice: defKruRate,
      subtotal: kruNights * effKruRate,
      isOverridden,
    });
  }

  const hotelSummaryText =
    state.incHotel && nights > 0 && hotelNamesSummary.length > 0
      ? hotelNamesSummary.join(' | ')
      : nights === 0
      ? 'Full Day Tour (Tanpa Menginap)'
      : 'Tanpa Akomodasi Hotel';

  const roomSharingDesc = isExtrabedActive
    ? `Triple Share (Kapasitas 3 Pax/Kamar: ${regularRooms} Kamar + ${extrabedUnits} Extrabed)`
    : baseRoomCapacity === 2
    ? `Twin Share (2 Pax/Kamar: ${regularRooms} Kamar)`
    : `${baseRoomCapacity} Pax/Kamar: ${regularRooms} Kamar`;

  manifestItems.push({
    kategori: 'Akomodasi Hotel',
    spesifikasi: hotelSummaryText,
    jumlahSatuan:
      state.incHotel && nights > 0
        ? isExtrabedActive && extrabedUnits > 0
          ? `${regularRooms} Kamar (${extrabedUnits} Extrabed)`
          : `${regularRooms} Kamar`
        : '0 Kamar',
    keteranganLapangan:
      state.incHotel && nights > 0
        ? `${roomSharingDesc} untuk ${regularPax} pax reguler`
        : 'Tanpa penginapan',
    status: state.incHotel && nights > 0 ? 'aktif' : 'nonaktif',
  });

  // 7. KRU & SDM (Tour Leader, Runner, Dokumentasi)
  const autoTlCount = Math.max(1, Math.ceil(totalPax / 25));
  const tlCount = state.incTl
    ? state.customTlCount !== null && state.customTlCount > 0
      ? state.customTlCount
      : autoTlCount
    : 0;
  const tlDays = state.incTl
    ? state.customTlDays !== null && state.customTlDays > 0
      ? state.customTlDays
      : days
    : 0;

  if (state.incTl && tlCount > 0) {
    const defTlRate = getOpsRateForBrand(db.operasional, 'TL_STD', brand, 450000);
    const { price: effTlRate, isOverridden } = resolvePrice('tl_fee', defTlRate);
    const mult = tlCount * tlDays;
    rabItems.push({
      key: 'tl_fee',
      category: 'Kru & Dokumentasi',
      label: 'Honor Tour Leader (TL) Bersertifikat',
      subLabel: 'Rasio standar 1 TL per 1–25 peserta',
      volumeText: `${tlCount} Orang × ${tlDays} Hari`,
      multiplier: mult,
      unitPrice: effTlRate,
      defaultUnitPrice: defTlRate,
      subtotal: mult * effTlRate,
      isOverridden,
    });
  }

  if (state.incRunner && state.runnerCount > 0) {
    const rCount = Math.max(1, Number(state.runnerCount) || 1);
    const rDays = Math.max(1, Number(state.runnerDays) || days);
    const defRunnerRate =
      Number(state.runnerBudget) || getOpsRateForBrand(db.operasional, 'RUNNER', brand, 200000);
    const { price: effRunner, isOverridden } = resolvePrice('runner_fee', defRunnerRate);
    rabItems.push({
      key: 'runner_fee',
      category: 'Kru & Dokumentasi',
      label: 'Crew Lapangan / Runner Bagasi & Logistik',
      volumeText: `${rCount} Orang × ${rDays} Hari`,
      multiplier: rCount * rDays,
      unitPrice: effRunner,
      defaultUnitPrice: defRunnerRate,
      subtotal: rCount * rDays * effRunner,
      isOverridden,
    });
  }

  // 8. KONSUMSI MAKAN & SNACK (Peserta + Kru)
  const totalCrewCount = tlCount + maxDriverCount + (state.incRunner ? state.runnerCount : 0);
  const mealConsumers =
    (state.incVip && state.incVipMeal ? regularPax : totalPax) + totalCrewCount;

  let totalMealPortions = 0;
  if (state.incMeal) {
    for (let d = 1; d <= days; d++) {
      const mPlan = state.mealPlanByDay[d];
      if (!mPlan || !mPlan.sessions || mPlan.sessions.length === 0) continue;

      const freq = mPlan.sessions.length;
      const dayPortions = mealConsumers * freq;
      totalMealPortions += dayPortions;

      const defaultBudget =
        Number(mPlan.budget) || getOpsRateForBrand(db.operasional, 'MAKAN_STD', brand, 50000);
      const key = `meal_day_${d}`;
      const { price: effBudget, isOverridden } = resolvePrice(key, defaultBudget);

      rabItems.push({
        key,
        category: 'Konsumsi',
        label: `Konsumsi Makan Hari ${d} (${mPlan.sessions.map((s) => s.toUpperCase()).join(', ')})`,
        subLabel: `${mealConsumers} orang (${totalPax} peserta + ${totalCrewCount} kru) × ${freq}x makan (Harga: ${formatRupiah(effBudget)} / 1x makan)`,
        volumeText: `${dayPortions} Porsi`,
        multiplier: dayPortions,
        unitPrice: effBudget,
        defaultUnitPrice: defaultBudget,
        subtotal: dayPortions * effBudget,
        isOverridden,
      });
    }
  }

  manifestItems.push({
    kategori: 'Porsi Makanan',
    spesifikasi: state.incMeal ? 'Katering Box / Prasmanan Resto' : 'Tidak Termasuk Makan',
    jumlahSatuan: `${totalMealPortions} Porsi`,
    keteranganLapangan: state.incMeal
      ? `Termasuk alokasi jatah makan ${totalCrewCount} kru lapangan`
      : 'Makan masing-masing peserta',
    status: state.incMeal && totalMealPortions > 0 ? 'aktif' : 'nonaktif',
  });

  // Snack & Air Mineral
  let activeSnackDays = 0;
  if (state.incSnack) {
    for (let d = 1; d <= days; d++) {
      if (state.snackPlanByDay[d]) activeSnackDays++;
    }
  }
  const totalSnackPacks = activeSnackDays * totalPax;
  if (state.incSnack && activeSnackDays > 0) {
    const defSnackPrice =
      getOpsRateForBrand(db.operasional, 'SNACK_STD', brand, 25000) +
      getOpsRateForBrand(db.operasional, 'MINERAL_600', brand, 4000);
    const { price: effSnack, isOverridden } = resolvePrice('snack_mineral', defSnackPrice);

    rabItems.push({
      key: 'snack_mineral',
      category: 'Konsumsi',
      label: 'Snack Box & Air Mineral Botol 600ml',
      subLabel: `Aktif ${activeSnackDays} hari perjalanan`,
      volumeText: `${totalSnackPacks} Paket`,
      multiplier: totalSnackPacks,
      unitPrice: effSnack,
      defaultUnitPrice: defSnackPrice,
      subtotal: totalSnackPacks * effSnack,
      isOverridden,
    });
  }

  manifestItems.push({
    kategori: 'Snack & Air Mineral',
    spesifikasi: 'Snack Box (2 Kue) & Air Mineral 600ml',
    jumlahSatuan: `${totalSnackPacks} Paket`,
    keteranganLapangan: state.incSnack
      ? `Dibagikan ${activeSnackDays} hari perjalanan`
      : 'Tidak termasuk snack',
    status: state.incSnack && totalSnackPacks > 0 ? 'aktif' : 'nonaktif',
  });

  // 9. DOKUMENTASI (Foto, Video, Drone) & LOGISTIK (Banner, P3K)
  if (state.incFoto) {
    const fCount = Math.max(1, Number(state.fotoCount) || 1);
    const fDays = Math.max(1, Number(state.fotoDays) || 1);
    const mult = fCount * fDays;
    const defFoto = getOpsRateForBrand(db.operasional, 'FOTO_REG', brand, 500000);
    const { price: effFoto, isOverridden } = resolvePrice('doc_foto', defFoto);
    rabItems.push({
      key: 'doc_foto',
      category: 'Kru & Dokumentasi',
      label: 'Fotografer Trip + Edit Softcopy Mirrorless',
      volumeText: `${fCount} Tim × ${fDays} Hari`,
      multiplier: mult,
      unitPrice: effFoto,
      defaultUnitPrice: defFoto,
      subtotal: mult * effFoto,
      isOverridden,
    });
  }

  if (state.incVideo) {
    const vCount = Math.max(1, Number(state.videoCount) || 1);
    const vDays = Math.max(1, Number(state.videoDays) || 1);
    const mult = vCount * vDays;
    const defVideo = getOpsRateForBrand(db.operasional, 'VIDEO_REG', brand, 500000);
    const { price: effVideo, isOverridden } = resolvePrice('doc_video', defVideo);
    rabItems.push({
      key: 'doc_video',
      category: 'Kru & Dokumentasi',
      label: 'Videografer Trip + Edit Video Cinematic',
      volumeText: `${vCount} Tim × ${vDays} Hari`,
      multiplier: mult,
      unitPrice: effVideo,
      defaultUnitPrice: defVideo,
      subtotal: mult * effVideo,
      isOverridden,
    });
  }

  if (state.incDrone) {
    const dCount = Math.max(1, Number(state.droneCount) || 1);
    const dDays = Math.max(1, Number(state.droneDays) || 1);
    const mult = dCount * dDays;
    const defDrone = getOpsRateForBrand(db.operasional, 'DRONE_VID', brand, 1500000);
    const { price: effDrone, isOverridden } = resolvePrice('doc_drone', defDrone);
    rabItems.push({
      key: 'doc_drone',
      category: 'Kru & Dokumentasi',
      label: 'Pilot Drone Aerial + Output Reels Cinematic',
      volumeText: `${dCount} Unit × ${dDays} Hari`,
      multiplier: mult,
      unitPrice: effDrone,
      defaultUnitPrice: defDrone,
      subtotal: mult * effDrone,
      isOverridden,
    });
  }

  if (state.incBanner) {
    const bCount = Math.max(1, Number(state.bannerCount) || 1);
    const defBanner = getOpsRateForBrand(db.operasional, 'BANNER_STD', brand, 85000);
    const { price: effBanner, isOverridden } = resolvePrice('log_banner', defBanner);
    rabItems.push({
      key: 'log_banner',
      category: 'Logistik',
      label: 'Cetak Spanduk / Banner Foto Kegiatan (3×1m)',
      volumeText: `${bCount} Lembar`,
      multiplier: bCount,
      unitPrice: effBanner,
      defaultUnitPrice: defBanner,
      subtotal: bCount * effBanner,
      isOverridden,
    });
  }

  if (state.incP3k) {
    const defP3k = getOpsRateForBrand(db.operasional, 'P3K_KIT', brand, 75000);
    const { price: effP3k, isOverridden } = resolvePrice('log_p3k', defP3k);
    rabItems.push({
      key: 'log_p3k',
      category: 'Logistik',
      label: 'Kotak P3K Standar Trip & Oksigen Kaleng',
      volumeText: '1 Kotak',
      multiplier: 1,
      unitPrice: effP3k,
      defaultUnitPrice: defP3k,
      subtotal: effP3k,
      isOverridden,
    });
  }

  manifestItems.push(
    {
      kategori: 'Tour Leader (TL)',
      spesifikasi: 'Tour Leader Bersertifikat',
      jumlahSatuan: `${tlCount} Orang`,
      keteranganLapangan: 'Rasio 1 TL per 1–25 pax',
      status: state.incTl ? 'aktif' : 'nonaktif',
    },
    {
      kategori: 'Driver & Co-Driver',
      spesifikasi: 'Kru Pengemudi Armada',
      jumlahSatuan: `${maxDriverCount} Orang`,
      keteranganLapangan: 'Sesuai standar operasional armada',
      status: state.incTransport ? 'aktif' : 'nonaktif',
    },
    {
      kategori: 'Spanduk / Banner',
      spesifikasi: 'Banner Foto Kegiatan (3×1m)',
      jumlahSatuan: state.incBanner ? '1 Lembar' : '0 Lembar',
      keteranganLapangan: 'Desain custom tema rombongan',
      status: state.incBanner ? 'aktif' : 'nonaktif',
    },
    {
      kategori: 'P3K Standar Trip',
      spesifikasi: 'Obat Dasar, Plester, Antimo & Oksigen',
      jumlahSatuan: state.incP3k ? '1 Kotak' : '0 Kotak',
      keteranganLapangan: 'Wajib dibawa Tour Leader',
      status: state.incP3k ? 'aktif' : 'nonaktif',
    }
  );

  // TOTALS
  const totalBaseCost = rabItems.reduce((sum, item) => sum + item.subtotal, 0);
  const taxRate = (Number(state.taxPct) || 0) / 100;
  const taxOrBufferCost = Math.round(totalBaseCost * taxRate);
  const finalHpp = totalBaseCost + taxOrBufferCost;
  const hppPerPax = Math.ceil(finalHpp / totalPax);

  const marginMultiplier = state.enableLaba ? 1 + (Number(state.marginPct) || 0) / 100 : 1;
  const sellingPricePerPax = Math.ceil(hppPerPax * marginMultiplier);
  const totalRevenue = sellingPricePerPax * totalPax;
  const totalProfit = state.enableLaba ? totalRevenue - finalHpp : 0;

  return {
    regularPax,
    vipPax,
    totalPax,
    days,
    nights,
    armadaSummaryText,
    jeepSummaryText,
    hotelSummaryText,
    tlCount,
    tlDays,
    driverCount: maxDriverCount,
    rabItems,
    manifestItems,
    totalBaseCost,
    taxOrBufferCost,
    finalHpp,
    hppPerPax,
    sellingPricePerPax,
    totalRevenue,
    totalProfit,
  };
}
