# Deployment fe-onlineshop

Dokumen ini khusus repository frontend. Database, migration, seed, auth/session signing, email, payment, shipping, upload signing, dan webhook dikonfigurasi serta dijalankan oleh `be-onlineshop`.

## Prasyarat

- Node.js 22 atau runtime yang kompatibel dengan Next.js 16
- deployment `be-onlineshop` yang sudah sehat dan dapat diakses melalui HTTPS
- domain frontend final, misalnya `https://shop.example.com`
- domain API final, misalnya `https://api.example.com/api`

## Environment

Set hanya variable berikut pada Preview dan Production:

```env
NEXT_PUBLIC_APP_URL="https://shop.example.com"
NEXT_PUBLIC_API_URL="https://api.example.com/api"
```

Keduanya masuk ke browser bundle, sehingga nilainya tidak boleh berupa secret. Perubahan variable `NEXT_PUBLIC_*` memerlukan build/deployment baru.

## Deploy ke Vercel

1. Import repository `fe-onlineshop` sebagai project baru.
2. Framework preset: Next.js.
3. Root directory: root repository.
4. Build command: `npm run build`.
5. Tambahkan dua environment variable di atas.
6. Deploy setelah backend sehat.
7. Pasang custom domain dan perbarui `NEXT_PUBLIC_APP_URL` bila domain berubah.
8. Pastikan backend mengizinkan origin frontend final dan mengirim cookie sesi dengan konfigurasi domain, `Secure`, dan `SameSite` yang sesuai.

Langkah yang sama berlaku pada platform Node lain: jalankan `npm ci`, `npm run build`, lalu `npm run start`.

## Urutan rilis

1. Deploy backend dengan kontrak API yang backward-compatible.
2. Smoke test endpoint health dan endpoint autentikasi backend.
3. Deploy frontend.
4. Uji katalog, login/logout, cart, checkout, account, seller, dan admin sesuai role.
5. Periksa bahwa request browser langsung menuju origin `NEXT_PUBLIC_API_URL`.

## Checklist keamanan

- Frontend dan backend memakai HTTPS.
- Tidak ada database URL atau provider secret pada environment frontend.
- Cookie sesi tidak dapat dibaca JavaScript bila backend memakai cookie `HttpOnly`.
- CORS backend hanya mengizinkan origin frontend yang diperlukan.
- Webhook payment diarahkan langsung ke endpoint backend, bukan domain frontend.
- CSP `connect-src` mengizinkan origin dari `NEXT_PUBLIC_API_URL`.

## Troubleshooting

### Build gagal karena NEXT_PUBLIC_API_URL

Variable wajib ada saat build dan harus berupa URL API lengkap, contohnya `https://api.example.com/api`.

### Login berhasil tetapi kembali ke halaman login

Periksa cookie `ivory_session`, HTTPS, CORS credentials, domain cookie, dan konfigurasi `SameSite` pada backend. Hapus cookie lama setelah konfigurasi domain berubah.

### Request API 404

Pastikan `NEXT_PUBLIC_API_URL` menyertakan prefix `/api` dan tidak memiliki trailing slash. Periksa juga bahwa endpoint terkait sudah tersedia di `be-onlineshop`.

### Gambar eksternal ditolak

Tambahkan hostname delivery image yang memang digunakan ke `images.remotePatterns` dan CSP `img-src` di `next.config.ts`.
