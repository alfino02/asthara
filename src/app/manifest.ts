import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PT ASTHARA — Tour Costing & Logistics Suite',
    short_name: 'Asthara Trip',
    description:
      'Platform Monolith Perhitungan HPP, RAB, Manajemen Armada Harian, dan Generator Proposal PDF untuk Nabila Trip dan Piknik Enthusiast.',
    start_url: '/',
    id: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#020617',
    orientation: 'any',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Workspace Nabila Trip',
        short_name: 'Nabila Trip',
        description: 'Buka kalkulator HPP & logistik Nabila Trip',
        url: '/?brand=nabila',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Workspace Piknik Enthusiast',
        short_name: 'Piknik Enthusiast',
        description: 'Buka kalkulator HPP & logistik Piknik Enthusiast',
        url: '/?brand=piknik',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
      },
    ],
    categories: ['business', 'productivity', 'travel'],
    prefer_related_applications: false,
  };
}
