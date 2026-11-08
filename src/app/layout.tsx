import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sistem Otomasi HPP & Logistik Custom Trip — Nabila Trip & Piknik Enthusiast',
  description:
    'Platform Monolith Perhitungan HPP, RAB, Manajemen Armada Harian, dan Generator Proposal PDF untuk Nabila Trip dan Piknik Enthusiast.',
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
      </body>
    </html>
  );
}
