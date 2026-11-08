import { BrandId } from '@/types/trip';

export interface BrandMeta {
  id: BrandId;
  name: string;
  shortName: string;
  tagline: string;
  legalEntity: string;
  logoUrl: string;
  accentHex: string;
  accentDarkHex: string;
  badgeText: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  // Tailwind semantic classes for clean UI
  theme: {
    primaryBg: string;
    primaryBgHover: string;
    primaryText: string;
    primaryBorder: string;
    lightBg: string;
    lightBorder: string;
    lightText: string;
    ring: string;
    gradientCard: string;
  };
}

export const BRANDS: Record<BrandId, BrandMeta> = {
  nabila: {
    id: 'nabila',
    name: 'Nabila Trip',
    shortName: 'NABILA',
    tagline: 'Tour & Travel Organizer — Malang, Batu, Bromo & Banyuwangi',
    legalEntity: 'PT ASTHARA ASIA GROUP',
    logoUrl: '/logos/nabila.png',
    accentHex: '#dc2626',
    accentDarkHex: '#991b1b',
    badgeText: 'Divisi Corporate & Custom Tour',
    address: 'Jl. Soekarno Hatta, Kota Malang, Jawa Timur',
    phone: '+62 812-3456-7890',
    email: 'reservasi@nabilatrip.com',
    website: 'www.nabilatrip.com',
    instagram: '@nabilatrip',
    bankName: 'Bank Central Asia (BCA)',
    bankAccountNumber: '8161-428-990',
    bankAccountHolder: 'PT ASTHARA ASIA GROUP',
    theme: {
      primaryBg: 'bg-red-600',
      primaryBgHover: 'hover:bg-red-700',
      primaryText: 'text-red-600',
      primaryBorder: 'border-red-600',
      lightBg: 'bg-red-50',
      lightBorder: 'border-red-200',
      lightText: 'text-red-700',
      ring: 'focus:ring-red-500',
      gradientCard: 'from-red-600 to-rose-700',
    },
  },
  piknik: {
    id: 'piknik',
    name: 'Piknik Enthusiast',
    shortName: 'PIKNIK',
    tagline: 'Private Trip, Gathering & Adventure Specialist Jawa Timur',
    legalEntity: 'PT ASTHARA ASIA GROUP',
    logoUrl: '/logos/piknik.png',
    accentHex: '#ea580c',
    accentDarkHex: '#9a3412',
    badgeText: 'Divisi Adventure & Gathering',
    address: 'Jl. Raya Tlogomas, Kota Malang, Jawa Timur',
    phone: '+62 813-5790-2468',
    email: 'halo@piknikenthusiast.com',
    website: 'www.piknikenthusiast.com',
    instagram: '@piknikenthusiast',
    bankName: 'Bank Mandiri / BCA',
    bankAccountNumber: '144-00-2389102-8',
    bankAccountHolder: 'PT ASTHARA ASIA GROUP',
    theme: {
      primaryBg: 'bg-orange-600',
      primaryBgHover: 'hover:bg-orange-700',
      primaryText: 'text-orange-600',
      primaryBorder: 'border-orange-600',
      lightBg: 'bg-orange-50',
      lightBorder: 'border-orange-200',
      lightText: 'text-orange-700',
      ring: 'focus:ring-orange-500',
      gradientCard: 'from-orange-600 to-amber-700',
    },
  },
};
