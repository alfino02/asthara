# Nabila Trip & Piknik Enthusiast — Next.js Monolith HPP & Custom Trip System

Aplikasi **Next.js Fullstack Monolith** dengan database **SQLite Terpadu (`node:sqlite`)** untuk perhitungan HPP (Harga Pokok Penjualan), Manifest Kebutuhan Operasional, Manajemen Armada Harian (Multi-Select), Editor Database Master Harga, dan Generator Proposal Penawaran Klien (4 Halaman A4 PDF).

## Fitur Utama

1. **Multi-Brand dalam 1 Aplikasi (`Nabila Trip` & `Piknik Enthusiast`)**:
   - Pilihan entitas di awal saat membuka aplikasi (*Launchpad Modal*) maupun tombol *Instant Switcher* di header atas.
   - Menggunakan database katalog yang sama (Destinasi `D001`–`D021`, Armada, Hotel, Jeep, dan Operasional), namun memiliki **kolom harga kontrak terpisah** untuk **Nabila Trip** dan **Piknik Enthusiast**.
   - Otomatis menyesuaikan logo, skema warna, nama badan hukum (`PT. Nabila Pesona Nusantara` vs `CV. Piknik Kreasi Nusantara`), dan rekening bank pada lembar Proposal PDF.

2. **Database SQLite Sesuai Struktur Excel**:
   - File database otomatis dibuat dan di-seed di `data/trip_monolith.sqlite`.
   - Mencakup tabel:
     - `destinasi` (21+ objek wisata Jawa Timur: Batu, Malang, Bromo, Lumajang, Banyuwangi)
     - `armada` (Avanza, Innova Reborn, Hiace Commuter, Hiace Premio, Elf Long Giga, Medium Bus, Big Bus Jetbus)
     - `hotel` (Bintang 2 s.d Bintang 5, Rayz UMM, The Shalimar Boutique)
     - `jeep` (Lava Tour Semeru, Bromo Sukapura/Tosari, Pak Nur Short/Long, Offroad AR Batu, Kapal Menjangan)
     - `operasional` (Tour Leader, Videografer, Fotografer, Drone, Guide Lokal, Runner, Banner, Snack, Air Mineral, Makan, P3K)
     - `quotations` (Riwayat penawaran tersimpan beserta payload konfigurasi lengkap)

3. **Kalkulator HPP & Logistik Real-Time**:
   - Durasi Tour fleksibel **1 Hari s.d 7 Hari 6 Malam**.
   - **Armada Per Hari (Multi-Select & Auto-Fit)**: Pilih kombinasi beberapa jenis kendaraan di hari yang berbeda, otomatis menyesuaikan jumlah unit dengan jumlah peserta reguler saat dicentang.
   - **Alokasi Tamu VIP & Paket Gala Dinner**: Pisahkan kuota tamu VIP (Alphard, Hotel VIP, Fine Dining) dari rombongan reguler.
   - **Inline Editable RAB HPP**: Ubah harga satuan langsung pada tabel RAB untuk simulasi negosiasi vendor tanpa merusak harga database master, dilengkapi fitur Export CSV/Excel.

## Cara Menjalankan Project

```bash
cd C:\Users\ASUS\.gemini\antigravity\scratch\nabila-piknik-nextjs
npm run dev
```

Lalu buka `http://localhost:3000` di browser Anda.
