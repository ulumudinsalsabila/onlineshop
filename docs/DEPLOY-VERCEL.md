# Deploy frontend dan backend IVORY ke Vercel

Panduan ini berlaku untuk dua repository terpisah:

```text
git@github.com:ulumudinsalsabila/onlineshop.git     # Next.js frontend
git@github.com:ulumudinsalsabila/be-onlineshop.git  # NestJS + Prisma backend
```

Masing-masing repository dihubungkan ke satu Vercel Project. Frontend dan backend mempunyai deployment, domain, environment variable, dan rollback sendiri.

Dokumentasi acuan:

- [Vercel projects](https://vercel.com/docs/projects)
- [NestJS on Vercel](https://vercel.com/docs/frameworks/backend/nestjs)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)

## 1. Prasyarat

- Repository sudah di-push ke GitHub.
- Branch production, biasanya `main`, dalam keadaan buildable.
- Database PostgreSQL production sudah tersedia.
- Node.js project setting menggunakan versi **22.x**.
- Migration production sudah ditinjau sebelum dijalankan.

Jalankan quality gate dari root sebelum push:

```bash
npm ci
npm run lint
npm run type-check
npm test
npm run build
```

Jangan commit `.env`, token, API key, atau connection string database.

## 2. Siapkan domain

Domain yang direkomendasikan:

```text
Frontend: https://shop.example.com
Backend:  https://api.example.com
```

Subdomain pada satu domain utama lebih andal untuk cookie dibanding mengandalkan dua domain acak `*.vercel.app`. HTTPS wajib untuk cookie production backend karena cookie menggunakan `Secure` dan `SameSite=None`.

Untuk deployment awal tanpa custom domain, tentukan nama project terlebih dahulu, misalnya:

```text
Frontend: https://ivory-store.vercel.app
Backend:  https://ivory-api.vercel.app
```

Setelah custom domain ditambahkan atau URL berubah, perbarui environment variable terkait dan redeploy kedua project.

## 3. Buat Vercel Project backend

1. Buka Vercel Dashboard dan pilih **Add New → Project**.
2. Import repository `be-onlineshop`.
3. Beri nama project, misalnya `ivory-api`.
4. Biarkan **Root Directory** pada root repository (`.`).
5. Framework akan terdeteksi sebagai **NestJS** dari `src/main.ts`.
6. Atur Node.js ke **22.x**.
7. Biarkan Install Command, Build Command, dan Output Directory menggunakan deteksi otomatis Vercel.

Backend ini akan dijalankan sebagai satu Vercel Function. Health check setelah deploy:

```text
GET https://api.example.com/api/health
```

Response yang diharapkan:

```json
{"success":true,"data":{"status":"ok","service":"toko-online-backend"}}
```

### Environment backend

Tambahkan melalui **Project → Settings → Environment Variables**:

| Variable | Wajib | Contoh/keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Ya | PostgreSQL production dengan TLS dan connection pooling yang sesuai untuk serverless |
| `JWT_SECRET` | Ya | Secret acak minimal 32 karakter, berbeda dari password pengguna |
| `FRONTEND_URL` | Ya | Origin frontend tanpa trailing slash, misalnya `https://shop.example.com` |

Jangan mengatur `PORT`; Vercel menyediakannya saat runtime. `NODE_ENV` juga dikelola oleh platform.

`FRONTEND_URL` menerima beberapa origin yang dipisahkan koma:

```dotenv
FRONTEND_URL="https://shop.example.com,https://staging.example.com"
```

Origin diperiksa pada mutation request. Nilainya harus sama persis dengan origin browser, termasuk protokol dan tanpa path.

## 4. Buat Vercel Project frontend

1. Pilih **Add New → Project** lagi.
2. Import repository `onlineshop`.
3. Beri nama project, misalnya `ivory-store`.
4. Biarkan **Root Directory** pada root repository (`.`).
5. Framework Preset harus terdeteksi sebagai **Next.js**.
6. Atur Node.js ke **22.x**.
7. Biarkan Install Command dan Output Directory menggunakan default Vercel.

### Environment frontend wajib

Selama migrasi backend belum selesai, frontend masih menjalankan Auth.js dan route legacy untuk account, checkout, payment, admin, dan seller. Karena itu frontend masih membutuhkan database serta secret server berikut:

```dotenv
USE_MOCK_DATA="false"
DATABASE_URL="postgresql://..."
AUTH_SECRET="secret-authjs-yang-kuat"
AUTH_URL="https://shop.example.com"
AUTH_TRUST_HOST="true"
NEXT_PUBLIC_APP_URL="https://shop.example.com"
NEXT_PUBLIC_API_URL="https://api.example.com/api"
```

`NEXT_PUBLIC_API_URL` dibundel ketika `next build`. Setelah nilainya diubah, deployment lama tidak ikut berubah; lakukan redeploy.

### Environment frontend berdasarkan fitur

Email:

```dotenv
RESEND_API_KEY="..."
EMAIL_FROM="IVORY <noreply@example.com>"
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

Jangan memakai prefix `NEXT_PUBLIC_` untuk `DATABASE_URL`, private key, server key, atau API secret. Variable dengan prefix tersebut dapat masuk ke bundle browser.

Cloudinary wajib untuk upload production. Filesystem Vercel Function bersifat sementara dan tidak boleh dipakai sebagai penyimpanan permanen.

## 5. Jalankan migration database

Build Vercel hanya menjalankan `prisma generate`; migration tidak dijalankan otomatis. Jalankan migration satu kali dari terminal terpercaya sebelum mengalihkan traffic:

```powershell
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
npm ci
npm run db:migrate:deploy
Remove-Item Env:DATABASE_URL
```

Di Bash:

```bash
DATABASE_URL='postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require' npm run db:migrate:deploy
```

Gunakan direct database URL untuk migration jika penyedia membedakan direct URL dan pooled runtime URL. Jangan menjalankan seed demo pada production.

## 6. Urutan deployment pertama

1. Buat kedua Vercel Project dan tentukan domain akhirnya.
2. Isi environment backend, termasuk origin frontend final.
3. Jalankan migration production.
4. Deploy backend.
5. Pastikan `/api/health` sukses.
6. Isi environment frontend, termasuk URL backend final.
7. Deploy frontend.
8. Jalankan smoke test di bagian berikut.

Setiap perubahan environment variable hanya berlaku untuk deployment baru. Tekan **Redeploy** setelah memperbarui variable.

## 7. Konfigurasi provider eksternal

### Midtrans

Webhook masih berada di frontend selama fase migrasi:

```text
https://shop.example.com/api/payments/webhook/midtrans
```

Jangan arahkan webhook ke backend NestJS sebelum endpoint payment sudah dipindahkan dan diuji.

### Resend

- Verifikasi domain pengirim.
- Gunakan SPF, DKIM, dan DMARC.
- Pastikan `EMAIL_FROM` memakai domain yang sudah diverifikasi.

### Cloudinary

- Batasi tipe file dan ukuran upload.
- Jangan pernah menaruh `CLOUDINARY_API_SECRET` pada variable public.

### PostgreSQL

- Gunakan TLS.
- Gunakan user aplikasi dengan hak minimum.
- Gunakan connection pooler yang direkomendasikan penyedia untuk traffic serverless.
- Aktifkan backup dan point-in-time recovery bila tersedia.

## 8. Preview deployment

Production dan Preview mempunyai environment variable terpisah. Isi variable pada kedua environment jika preview harus berfungsi penuh.

Backend saat ini memvalidasi `Origin` secara exact melalui `FRONTEND_URL`. URL Preview Vercel berubah per deployment, sehingga mutation lintas project akan ditolak jika origin preview tidak terdaftar. Pilihan paling stabil:

- gunakan domain staging tetap untuk frontend dan backend; atau
- tambahkan URL preview frontend yang sedang diuji ke `FRONTEND_URL`, lalu redeploy backend preview.

GET katalog/search tidak membutuhkan sesi, tetapi login/cart/wishlist akun membutuhkan konfigurasi cookie dan origin yang benar. Guest cart dan guest wishlist tetap lokal di browser.

Karena project berasal dari repository berbeda, `NEXT_PUBLIC_API_URL` harus diisi eksplisit dengan URL deployment backend yang sesuai untuk Production atau Preview.

## 9. Smoke test setelah deploy

### Backend

- `GET /api/health` mengembalikan status `ok`.
- `GET /api/products` mengembalikan `{ success: true }`.
- Request mutation dari origin selain frontend mendapatkan `403 INVALID_ORIGIN`.
- Secret tidak muncul pada response atau log.

### Frontend publik

- Homepage dan `/products` dapat dirender.
- Product detail dapat dibuka langsung dan melalui client navigation.
- Search overlay memanggil domain backend, bukan `/api/search` frontend.
- Guest dapat memakai cart dan wishlist tanpa request `401`.
- CSP mengizinkan koneksi ke `NEXT_PUBLIC_API_URL`.

### Account dan transaksi

- Register, verifikasi email, login, dan reset password bekerja.
- Checkout tetap meminta login.
- Address, order, payment, dan tracking dapat diakses pemiliknya saja.
- Admin/seller authorization tetap menolak role yang salah.
- Webhook Midtrans mengubah status secara idempotent.
- Upload seller tersimpan di Cloudinary.

## 10. Troubleshooting

### Frontend gagal build karena Turbopack root

Pastikan `next.config.ts` memiliki `turbopack.root` yang menunjuk ke root repository dan `package-lock.json` berada di root frontend.

### `NEXT_PUBLIC_API_URL` masih memakai URL lama

Variable public dibekukan saat build. Perbarui environment variable frontend lalu redeploy; restart Function saja tidak cukup.

### Backend mengembalikan `403 INVALID_ORIGIN`

Periksa `FRONTEND_URL`. Nilai harus berupa origin exact:

```text
Benar: https://shop.example.com
Salah: https://shop.example.com/
Salah: https://shop.example.com/products
```

### Login backend tidak menyimpan cookie

- Pastikan request browser memakai `credentials: include`.
- Gunakan HTTPS.
- Pastikan `FRONTEND_URL` benar.
- Gunakan custom subdomain frontend/backend pada domain utama yang sama bila browser memblokir third-party cookie pada domain `*.vercel.app` terpisah.

### Prisma tidak dapat terhubung

- Pastikan `DATABASE_URL` tersedia pada environment project yang gagal.
- Periksa TLS dan allowlist penyedia database.
- Gunakan pooled connection string untuk runtime serverless bila disediakan.
- Pastikan migration sudah dijalankan.

### Perubahan frontend tidak men-deploy backend

Ini perilaku yang benar karena kedua repository berdiri sendiri. Jika kontrak API berubah, deploy backend lebih dahulu, lalu redeploy frontend setelah backend backward-compatible dan sehat.

## 11. Rollback

1. Gunakan **Instant Rollback** pada project yang bermasalah.
2. Jangan rollback migration database secara otomatis.
3. Jika perubahan kontrak API tidak backward-compatible, rollback frontend dan backend sebagai satu pasangan.
4. Setelah rollback, ulang smoke test health, katalog, login, checkout, dan webhook.
