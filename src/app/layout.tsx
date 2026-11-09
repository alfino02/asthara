import type { Metadata, Viewport } from 'next';
import './globals.css';
import PwaRegistration from '@/components/PwaRegistration';

export const metadata: Metadata = {
  title:
    'PT ASTHARA — Sistem Otomasi HPP & Logistik (Nabila Trip & Piknik Enthusiast)',
  description:
    'Platform Monolith Perhitungan HPP, RAB, Manajemen Armada Harian, dan Generator Proposal PDF untuk Nabila Trip dan Piknik Enthusiast.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Asthara Trip',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      {
        url: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-slate-900 selection:text-white">
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
