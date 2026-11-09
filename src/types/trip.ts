export type BrandId = 'nabila' | 'piknik';

export type DistanceZone = 'near' | 'medium' | 'far';

export interface DestinasiRow {
  id: string;
  nama: string;
  wilayah: string;
  htmDomestikNabila: number;
  htmDomestikPiknik: number;
  htmMancanegaraNabila: number;
  htmMancanegaraPiknik: number;
  wajibGuide: boolean;
  biayaGuideNabila: number;
  biayaGuidePiknik: number;
  keterangan: string;
}

export interface ArmadaRow {
  id: string;
  nama: string;
  minPax: number;
  maxPax: number;
  kapasitas: number;
  tarifNearNabila: number;
  tarifMediumNabila: number;
  tarifFarNabila: number;
  tarifNearPiknik: number;
  tarifMediumPiknik: number;
  tarifFarPiknik: number;
  keterangan: string;
}

export interface HotelRow {
  id: string;
  nama: string;
  wilayah: string;
  klasifikasi: string;
  rateNabila: number;
  ratePiknik: number;
  formatKamar: string;
  kapasitas: number;
  includeSarapan: string;
}

export interface JeepRow {
  id: string;
  lokasiBasecamp: string;
  jenisRute: string;
  tarifNabila: number;
  tarifPiknik: number;
  kapasitas: number;
  destinasiDilewati: string;
  durasiTrip: string;
}

export interface OperasionalRow {
  kode: string;
  nama: string;
  kategori: string;
  satuan: string;
  biayaNabila: number;
  biayaPiknik: number;
  rasio: string;
}

export interface QuotationRecord {
  quoteId: string;
  brand: BrandId;
  timestamp: string;
  namaKlien: string;
  pax: number;
  durasi: string;
  zona: string;
  armada: string;
  jumlahJeep: string;
  hppTotal: number;
  hargaJualPerPax: number;
  totalNilai: number;
  estimasiLaba: number;
  status: string;
  payloadJson: string;
}

export interface MasterDatabase {
  destinasi: DestinasiRow[];
  armada: ArmadaRow[];
  hotel: HotelRow[];
  jeep: JeepRow[];
  operasional: OperasionalRow[];
  quotations: QuotationRecord[];
}

export interface ArmadaDayPlan {
  active: boolean;
  isAuto: boolean;
  selected: Record<string, number>; // armadaName -> unit count
}

export interface MealDayPlan {
  sessions: ('pagi' | 'siang' | 'malam')[];
  budget: number;
}

export interface HotelNightPlan {
  active: boolean;
  hotelNama: string;
  klasifikasi: string;
  wilayah: string;
  rate: number;
}

export interface GalaDinnerItem {
  id: string;
  nama: string;
  price: number;
  qty: number;
  days: number;
}

export interface CalculatorState {
  tripName: string;
  pax: number;
  duration: number; // 1 to 7
  distanceZone: DistanceZone;
  isForeigner: boolean;

  // Transportasi / Armada per hari
  incTransport: boolean;
  armadaPlanByDay: Record<number, ArmadaDayPlan>;
  inputTol: number;

  // VIP Executive & Beban Tambahan
  incVip: boolean;
  vipPaxMode?: 'add_to_pax' | 'sub_allocation'; // 'add_to_pax' = menambah beban peserta (reguler + vip), 'sub_allocation' = sub-alokasi total
  vipPax: number;
  vipVehName: string;
  vipVehRate: number;
  vipVehUnits?: number; // jumlah unit mobil VIP (default 1)
  vipVehDays: number; // durasi hari sewa mobil VIP
  vipHotelName: string;
  vipHotelRate: number;
  vipHotelRooms?: number; // jumlah kamar VIP
  vipHotelNights: number; // durasi malam kamar VIP
  incVipMeal: boolean;
  vipMealName: string;
  vipMealRate: number;
  vipMealDays: number; // durasi hari jamuan makan VIP
  vipMealPagi: boolean;
  vipMealSiang: boolean;
  vipMealMalam: boolean;
  incVipExtraBeban?: boolean; // beban biaya operasional / amenities tambahan VIP
  vipExtraBebanName?: string;
  vipExtraBebanBudget?: number;
  vipExtraBebanDays?: number;

  // Gala Dinner & Entertainment
  incGala: boolean;
  galaDinnerItems: GalaDinnerItem[];

  // Destinasi per hari
  selectedDestByDay: Record<number, string[]>; // day -> array of dest.nama

  // Jeep 4x4 & Petualangan
  incJeep: boolean;
  selectedJeepIds: string[]; // array of jeep.id

  // Hotel Reguler per malam
  incHotel: boolean;
  hotelRoomCapacity?: number; // default 2 (Twin Share)
  incExtrabed?: boolean; // checkbox: jika dipilih kapasitas kamar menjadi 3 orang, mengurangi jumlah kamar yang dibutuhkan
  extrabedPrice?: number; // biaya extrabed per bed/pax per malam (default 250000)
  customExtrabedCount?: number | null; // null = auto dihitung dari pax & triple share
  hotelPlanByNight: Record<number, HotelNightPlan>;

  // Konsumsi & Snack
  incMeal: boolean;
  mealPlanByDay: Record<number, MealDayPlan>;
  incSnack: boolean;
  snackPlanByDay: Record<number, boolean>;

  // Kru & Operasional
  incTl: boolean;
  customTlCount: number | null; // null = auto (1 per 25 pax)
  customTlDays: number | null;
  incAkomodasiKru: boolean;
  biayaAkomodasiKru: number;
  hariAkomodasiKru: number;
  incRunner: boolean;
  runnerCount: number;
  runnerBudget: number;
  runnerDays: number;
  incFoto: boolean;
  fotoCount?: number;
  fotoDays: number;
  incVideo: boolean;
  videoCount?: number;
  videoDays: number;
  incDrone: boolean;
  droneCount?: number;
  droneDays: number;
  incGuide: boolean;
  guidePaxRatio?: number; // kapasitas rasio guide: 1 guide untuk berapa orang (default 10)
  incGuideUmum: boolean;
  guideDisabledDest: Record<string, boolean>;
  customGuideCounts: Record<string, number>;
  incBanner: boolean;
  bannerCount?: number;
  incP3k: boolean;

  // Profit & Tax
  enableLaba: boolean;
  marginPct: number;
  taxPct: number; // default 2% (or 5% buffer selectable)

  // Inline RAB Overrides
  customPriceOverrides: Record<string, number>;
}

export interface RabLineItem {
  key: string;
  category: 'Transportasi' | 'VIP & Gala' | 'Destinasi & Jeep' | 'Akomodasi' | 'Konsumsi' | 'Kru & Dokumentasi' | 'Logistik';
  label: string;
  subLabel?: string;
  volumeText: string;
  multiplier: number; // total qty * days so subtotal = multiplier * effectiveUnitPrice
  unitPrice: number;
  defaultUnitPrice: number;
  subtotal: number;
  isOverridden: boolean;
  highlight?: 'vip' | 'gala' | 'normal';
}

export interface ManifestItem {
  kategori: string;
  spesifikasi: string;
  jumlahSatuan: string;
  keteranganLapangan: string;
  status: 'aktif' | 'nonaktif' | 'vip';
}

export interface CalculationResult {
  regularPax: number;
  vipPax: number;
  totalPax: number;
  days: number;
  nights: number;
  armadaSummaryText: string;
  jeepSummaryText: string;
  hotelSummaryText: string;
  tlCount: number;
  tlDays: number;
  driverCount: number;
  rabItems: RabLineItem[];
  manifestItems: ManifestItem[];
  totalBaseCost: number;
  taxOrBufferCost: number;
  finalHpp: number;
  hppPerPax: number;
  sellingPricePerPax: number;
  totalRevenue: number;
  totalProfit: number;
}
