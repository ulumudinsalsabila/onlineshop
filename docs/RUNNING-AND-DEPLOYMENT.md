# Menjalankan dan Deploy IVORY

> Dokumen ini menjelaskan aplikasi legacy/full-stack. Untuk deployment frontend dan backend terpisah di Vercel, gunakan [`DEPLOY-VERCEL.md`](DEPLOY-VERCEL.md).

Panduan ini menggunakan npm karena project memiliki `package-lock.json`. Jalankan semua perintah dari root project.

## Menjalankan secara lokal

### Preview cepat tanpa database

Untuk melihat storefront tanpa memasang PostgreSQL, install dependency lalu buat `.env.local`:

```powershell
npm ci
@'
USE_MOCK_DATA="true"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
'@ | Set-Content .env.local
npm run dev
```

Buka `http://localhost:3000`. Mode ini mendukung homepage, katalog, filter, search, halaman produk/category/brand, guest cart, dan wishlist lokal. Data berasal dari `constants/catalog.ts`; tidak ada migration atau seed yang perlu dijalankan.

Login, register, account, checkout, order, admin, dan seller membutuhkan PostgreSQL. Untuk kembali ke mode lengkap, hapus `USE_MOCK_DATA` atau ubah menjadi `false`, kemudian isi `DATABASE_URL` dan ikuti langkah database di bawah.

### 1. Prasyarat

- Node.js 20.19 atau lebih baru
- npm
- PostgreSQL 14 atau lebih baru untuk mode lengkap
- Git opsional

XAMPP standar tidak menyertakan PostgreSQL. Jalankan PostgreSQL dari instalasi terpisah, Docker, atau layanan PostgreSQL terkelola.

Periksa instalasi:

```powershell
node --version
npm --version
psql --version
```

### 2. Siapkan database

Contoh dengan PostgreSQL lokal:

```powershell
createdb ivory_store
```

Atau gunakan Docker:

```powershell
docker run --name ivory-postgres -e POSTGRES_USER=ivory -e POSTGRES_PASSWORD=ganti-password-ini -e POSTGRES_DB=ivory_store -p 5432:5432 -d postgres:16-alpine
```

Pastikan port dapat diakses:

```powershell
Test-NetConnection localhost -Port 5432
```

### 3. Siapkan environment

```powershell
Copy-Item .env.example .env
```

Buat `AUTH_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Isi minimal berikut dalam `.env`:

```dotenv
DATABASE_URL="postgresql://ivory:ganti-password-ini@localhost:5432/ivory_store?schema=public"
AUTH_SECRET="hasil-generator-di-atas"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

SEED_ADMIN_EMAIL="admin@example.test"
SEED_ADMIN_PASSWORD="password-development-yang-kuat"
SEED_CUSTOMER_EMAIL="customer@example.test"
SEED_CUSTOMER_PASSWORD="password-development-yang-kuat"
```

Jangan commit file `.env`.

### 4. Install, migration, dan seed

```powershell
npm ci
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

Seed membuat akun development berikut:

- Admin: nilai `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD`
- Customer: nilai `SEED_CUSTOMER_EMAIL` dan `SEED_CUSTOMER_PASSWORD`

### 5. Jalankan development server

```powershell
npm run dev
```

Buka:

- Storefront: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Admin: `http://localhost:3000/admin`
- Seller application: `http://localhost:3000/sell`
- Prisma Studio: jalankan `npm run db:studio`

Tanpa credential eksternal, aplikasi tetap dapat diuji dengan:

- mock payment untuk Midtrans;
- mock shipping untuk Biteship;
- local upload di `public/uploads/consignments` jika Cloudinary kosong;
- link email dicetak ke terminal development jika Resend kosong.

### 6. Verifikasi sebelum bekerja

```powershell
npm test
npm run lint
npm run type-check
npm run build
```

Untuk menjalankan hasil production build secara lokal:

```powershell
npm start
```

`npm start` hanya dapat dijalankan setelah `npm run build` selesai.

## Deployment yang direkomendasikan

Arsitektur yang direkomendasikan:

- Next.js: Vercel
- PostgreSQL: Neon, Supabase, Railway, atau AWS RDS
- Upload: Cloudinary
- Email: Resend
- Payment: Midtrans
- Shipping: Biteship
- Shared rate limit: Redis/Upstash untuk deployment multi-instance

### 1. Siapkan PostgreSQL production

1. Buat database dan user khusus aplikasi.
2. Aktifkan koneksi TLS.
3. Salin connection string ke `DATABASE_URL`.
4. Pastikan user migration dapat membuat tabel, index, enum, dan extension `pg_trgm`.
5. Aktifkan backup dan point-in-time recovery jika tersedia.

Contoh format:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/ivory_store?sslmode=require"
```

### 2. Buat project Vercel

1. Push repository ke GitHub/GitLab/Bitbucket.
2. Import repository dari dashboard Vercel.
3. Framework preset: Next.js.
4. Install command: `npm ci`.
5. Build command: `npm run build`.
6. Output directory: gunakan default Next.js.
7. Gunakan Node.js 20 atau lebih baru.

Jangan menjalankan seed development sebagai bagian dari setiap build production.

### 3. Isi environment variables Vercel

Wajib:

```dotenv
DATABASE_URL="..."
AUTH_SECRET="..."
AUTH_URL="https://domain-anda.com"
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_APP_URL="https://domain-anda.com"
```

Email production:

```dotenv
RESEND_API_KEY="..."
EMAIL_FROM="IVORY <noreply@domain-anda.com>"
```

Cloudinary:

```dotenv
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

Midtrans:

```dotenv
MIDTRANS_SERVER_KEY="..."
MIDTRANS_IS_PRODUCTION="true"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="..."
```

Biteship:

```dotenv
BITESHIP_API_KEY="..."
BITESHIP_BASE_URL="https://api.biteship.com/v1"
BITESHIP_ORIGIN_POSTAL_CODE="12950"
```

Masukkan secret hanya melalui dashboard/secret manager. Jangan memakai prefix `NEXT_PUBLIC_` untuk server key, API secret, atau database URL.

### 4. Jalankan migration production

Migration harus dijalankan sebagai release step atau dari terminal terpercaya sebelum traffic dialihkan ke versi baru:

```powershell
npm ci
npm run db:migrate:deploy
```

Untuk deployment pertama, seed boleh digunakan di staging. Seed saat ini berisi akun dan pesanan demo sehingga tidak disarankan untuk database production live. Buat admin production melalui proses bootstrap satu kali dengan password unik, kemudian audit akun tersebut.

### 5. Deploy

Deploy melalui dashboard Vercel atau CLI:

```powershell
npx vercel --prod
```

Setelah custom domain aktif, pastikan `AUTH_URL` dan `NEXT_PUBLIC_APP_URL` menggunakan domain final HTTPS, lalu redeploy.

### 6. Konfigurasi provider

Midtrans:

- Notification URL: `https://domain-anda.com/api/payments/webhook/midtrans`
- Finish URL dapat diarahkan ke `https://domain-anda.com/checkout/pending`
- Gunakan credential sandbox di staging dan production credential hanya di production.

Biteship:

- Pastikan postal code origin sesuai lokasi gudang.
- Batasi API key jika provider menyediakan scope atau IP restriction.
- Uji rate, service code, dan tracking di staging.

Cloudinary:

- Gunakan key dengan hak minimum.
- Batasi format upload ke JPEG, PNG, dan WebP.
- Siapkan retention rule untuk submission yang ditolak/dibatalkan.
- Aplikasi menandatangani upload di server; jangan mengekspos API secret.

Resend:

- Verifikasi domain pengirim.
- Konfigurasikan SPF, DKIM, dan DMARC.
- Pastikan `EMAIL_FROM` menggunakan domain yang sudah diverifikasi.

### 7. Checklist setelah deploy

Periksa route berikut:

```text
https://domain-anda.com/
https://domain-anda.com/products
https://domain-anda.com/robots.txt
https://domain-anda.com/sitemap.xml
https://domain-anda.com/login
https://domain-anda.com/admin
```

Kemudian pastikan:

- register, verifikasi email, login, dan reset password bekerja;
- cart bertahan setelah refresh dan sinkron setelah login;
- checkout menghitung ulang harga dan ongkir di server;
- webhook Midtrans mengubah status tepat satu kali;
- upload seller masuk ke Cloudinary;
- CUSTOMER ditolak dari `/admin`;
- seller tidak dapat membaca submission seller lain;
- canonical, Open Graph, dan JSON-LD muncul pada halaman produk;
- header CSP dan security headers terkirim;
- log, error monitoring, database backup, dan alert webhook aktif.

## Deployment ke VPS/Node server

Sebagai alternatif Vercel:

```bash
npm ci
npm run db:migrate:deploy
npm run build
npm start
```

Jalankan proses menggunakan systemd atau process manager, pasang reverse proxy HTTPS seperti Nginx/Caddy, teruskan header host/proxy dengan benar, dan set `AUTH_TRUST_HOST=true`. Jangan mengandalkan local upload bila server menggunakan filesystem ephemeral atau beberapa instance.

## Masalah umum

- `ECONNREFUSED localhost:5432`: service PostgreSQL belum berjalan atau port salah.
- `AUTH_SECRET` invalid: gunakan secret acak minimal 32 karakter.
- Login selalu kembali ke halaman login: periksa `AUTH_URL`, `AUTH_TRUST_HOST`, cookie HTTPS, dan waktu server.
- Gambar Cloudinary ditolak CSP: pastikan URL menggunakan `https://res.cloudinary.com`.
- Webhook Midtrans 401: periksa server key, environment sandbox/production, dan signature payload.
- Build berhasil tetapi halaman database error: migration belum diterapkan atau `DATABASE_URL` tidak tersedia pada runtime.
