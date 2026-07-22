# IVORY Frontend

Frontend toko online berbasis Next.js 16. Repository ini tidak memiliki database, Prisma, endpoint API, webhook, atau secret provider. Seluruh data dan transaksi diproses oleh repository `be-onlineshop`.

## Menjalankan lokal

Persyaratan: Node.js 22+ dan backend yang aktif.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Environment frontend hanya:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

`NEXT_PUBLIC_API_URL` wajib menyertakan prefix `/api` dan tidak memakai trailing slash. Seluruh request browser dan Server Component menggunakan service `lib/api-client.ts` untuk memanggil URL backend tersebut secara langsung dengan credentials.

Login menyimpan JWT yang dikembalikan backend pada cookie frontend `ivory_access_token`. Service API otomatis menambahkan `Authorization: Bearer <token>` pada setiap request terautentikasi; Server Components membaca cookie yang sama dan meneruskannya sebagai Bearer header. Token dibersihkan saat logout atau ketika API mengembalikan HTTP 401.

Jangan menaruh `DATABASE_URL`, JWT/session secret, Midtrans server key, Cloudinary secret, atau secret lain di repository maupun environment frontend.

## Perintah

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — menjalankan hasil build
- `npm run lint` — ESLint
- `npm run type-check` — pemeriksaan TypeScript
- `npm test` — unit test

## Alur deployment

Deploy dan verifikasi `be-onlineshop` lebih dahulu. Setelah endpoint backend sehat, set dua environment frontend di platform deployment lalu build ulang. Detailnya ada di [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
