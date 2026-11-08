# PT ASTHARA ASIA GROUP — Tour Costing & Logistics Suite
**Next.js Monolith • Nabila Trip & Piknik Enthusiast • Supabase PostgreSQL • Vercel Ready**

Aplikasi sistem kalkulasi HPP, RAB nego vendor, manifest operasional lapangan, dan generator penawaran proposal klien resmi ukuran A4 berbasis cloud.

---

## 🚀 Status Integrasi Supabase Cloud (Live)

Proyek Supabase telah dibuat dan aktif secara otomatis:
- **Project Name**: `asthara-tour-monolith`
- **Project Ref**: `yfymulxfgswnzsumybxb`
- **Region**: `ap-southeast-1` (Singapore)
- **Database Engine**: PostgreSQL 15+ dengan Row Level Security (RLS)
- **Tabel Terdaftar**:
  1. `destinasi` (21 objek wisata)
  2. `armada` (7 armada pariwisata)
  3. `hotel` (6 hotel)
  4. `jeep` (6 paket rute 4x4)
  5. `operasional` (14 komponen SDM, logistik & legalitas)
  6. `quotations` (riwayat arsip penawaran tersimpan)

---

## 🔑 Environment Variables untuk Vercel Deployment

Saat melakukan deploy di Vercel Dashboard, masukkan variabel lingkungan berikut:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yfymulxfgswnzsumybxb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmeW11bHhmZ3N3bnpzdW15YnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxMjQwMzAsImV4cCI6MjEwOTcwMDAzMH0._FtUA8GvMRemYMyLpWhhUBVQC1Io71l8BvxUFYZpwNs` |

---

## 📦 Cara Deploy ke Vercel

### Metode 1: Lewat GitHub (Rekomendasi)
1. Buat repository baru di [GitHub](https://github.com/new) (misal: `asthara-tour-monolith`).
2. Jalankan perintah di terminal direktori proyek:
   ```bash
   git remote add origin https://github.com/USERNAME/asthara-tour-monolith.git
   git branch -M main
   git push -u origin main
   ```
3. Buka [vercel.com/new](https://vercel.com/new), pilih repositori tersebut.
4. Pada bagian **Environment Variables**, masukkan 2 variabel di atas.
5. Klik **Deploy**. Selesai!

### Metode 2: Lewat Vercel CLI Langsung
Jalankan di terminal direktori proyek:
```bash
npx vercel
```
Ikuti petunjuk di terminal untuk menghubungkan dan deploy langsung.
