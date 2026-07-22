# IVORY Storefront

IVORY is a curated premium-fashion commerce application for new and authenticated preloved products. It includes the customer storefront, database-backed cart and checkout, account area, role-aware backoffice, and a controlled seller-consignment workflow.

> Repository ini adalah **frontend**. Backend NestJS berada di repository `git@github.com:ulumudinsalsabila/be-onlineshop.git`. Selama migrasi, route handler legacy tetap tersedia sebagai fallback sampai account/admin/seller selesai dipindahkan.

## Tech stack

- Next.js 16 App Router, React 19, strict TypeScript
- Tailwind CSS 4 and customized shadcn/ui components
- PostgreSQL, Prisma ORM, and transaction-safe inventory operations
- Auth.js credentials authentication with Argon2id
- Zod and React Hook Form
- Phosphor Icons and Motion with `LazyMotion`
- Midtrans and Biteship adapters with deterministic local fallbacks
- Cloudinary signed upload adapter with local-disk fallback
- Vitest and ESLint

## Requirements

- Node.js 20.19+ recommended (the current Prisma 6 compatibility setup can run on Node 20.9)
- PostgreSQL 14+ for the full commerce, account, admin, and seller flows (optional for storefront demo mode)
- npm (the committed lockfile is `package-lock.json`)

Panduan langkah demi langkah untuk local Windows, Vercel, provider production, dan troubleshooting tersedia di [docs/RUNNING-AND-DEPLOYMENT.md](docs/RUNNING-AND-DEPLOYMENT.md).

## Environment variables

Copy `.env.example` to `.env` and replace every placeholder that applies to your environment.

| Variable | Required | Description |
| --- | --- | --- |
| `USE_MOCK_DATA` | No | Set `true` to serve the public storefront from local catalog data without PostgreSQL. |
| `DATABASE_URL` | Full mode | PostgreSQL connection URL. It may be omitted only in mock storefront mode. |
| `AUTH_SECRET` | Yes | Auth.js signing secret. Generate with `npx auth secret`. |
| `AUTH_URL` | Production | Canonical authentication URL. |
| `AUTH_TRUST_HOST` | Deployment dependent | Allows Auth.js to trust proxy host headers. |
| `NEXT_PUBLIC_APP_URL` | Yes | Public base URL used in verification/reset links. |
| `RESEND_API_KEY` | Production email | Resend API key. When omitted, auth links are logged only during development. |
| `EMAIL_FROM` | Production email | Verified sender address. |
| `MIDTRANS_SERVER_KEY` | Production payment | Secret server key; empty enables the local mock provider. |
| `MIDTRANS_IS_PRODUCTION` | No | Selects Midtrans production endpoints when `true`. |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Snap.js only | Public client key for a future embedded Snap UI. |
| `BITESHIP_API_KEY` | Production shipping | Biteship API key; empty enables deterministic mock rates. |
| `BITESHIP_BASE_URL` | No | Biteship API base URL. |
| `BITESHIP_ORIGIN_POSTAL_CODE` | Yes | Five-digit warehouse origin postal code. |
| `CLOUDINARY_CLOUD_NAME` | Production uploads | Cloudinary cloud name. All Cloudinary values must be present to enable the adapter. |
| `CLOUDINARY_API_KEY` | Production uploads | Server-side Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Production uploads | Server-only signing secret; never expose it with a `NEXT_PUBLIC_` prefix. |
| `SEED_ADMIN_EMAIL` | Seed only | Development admin email. |
| `SEED_ADMIN_PASSWORD` | Seed only | Development admin password; intentionally absent from source. |
| `SEED_CUSTOMER_EMAIL` | Seed only | Development customer email. |
| `SEED_CUSTOMER_PASSWORD` | Seed only | Development customer password; intentionally absent from source. |

Never reuse seed credentials in production and never commit `.env`.

## Project structure

```text
app/                 Routes, layouts, metadata files, and route handlers
components/ui/       Customized shadcn/ui primitives
components/layout/   Storefront navigation and footer
components/admin/    Backoffice shell, tables, and controls
components/seller/   Seller dashboard forms and controls
features/            Catalog, product, cart, checkout, auth, and home UI
lib/data/            Database queries and DTO mapping
lib/checkout/        Server-authoritative checkout calculations
lib/payments/        Midtrans and mock payment adapters
lib/shipping/        Biteship and mock shipping adapters
lib/seller/          Consignment rules, validation, and storage adapters
prisma/              Schema, migrations, and development seed
public/              Static brand and storefront assets
styles/              Design tokens
```

Without the Midtrans and Biteship keys, checkout automatically uses local mock payment, courier rates, and tracking. Configure the Midtrans Payment Notification URL as `/api/payments/webhook/midtrans`; the server key must never be exposed to the browser.

## Database setup

```bash
npm install
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

The committed initial migration includes PostgreSQL `pg_trgm` GIN indexes for product and brand search. The database user running migrations needs permission to enable this extension.

For future schema changes during development, create a new migration with `npm run db:migrate -- --name describe_change`.

For deployment:

```bash
npm run db:migrate:deploy
npm run build
npm start
```

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

### Storefront demo without PostgreSQL

Create `.env.local` with:

```dotenv
USE_MOCK_DATA="true"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
```

Run `npm run dev`. `USE_MOCK_DATA=true` takes precedence even if an existing `.env` still contains `DATABASE_URL`. Homepage, catalog, search, product/category/brand pages, guest cart, and local wishlist work from the 30 products in `constants/catalog.ts`. Login mutations, account, checkout, orders, admin, and seller operations intentionally require PostgreSQL.

To use the separated API locally, run repository backend on port `4000`, run `npm run dev` in this repository, and set `NEXT_PUBLIC_API_URL="http://localhost:4000/api"`. Leaving the variable empty keeps the legacy API fallback during the staged migration.

## Demo accounts

The seed creates these identities, but passwords are deliberately not stored in source control:

| Role | Default email | Password source |
| --- | --- | --- |
| ADMIN | `admin@example.test` | `SEED_ADMIN_PASSWORD` |
| CUSTOMER | `customer@example.test` | `SEED_CUSTOMER_PASSWORD` |

Override the emails with `SEED_ADMIN_EMAIL` and `SEED_CUSTOMER_EMAIL`. Run the seed only with development credentials and rotate any account before exposing an environment publicly.

## Authentication and security

- Credentials are hashed with Argon2id.
- New customer accounts must verify their email before login.
- Verification and password-reset tokens are stored as SHA-256 digests and expire after use.
- Account pages use an optimistic Next.js Proxy redirect plus a secure database-backed server guard.
- Sensitive endpoints are rate limited in process. For multi-instance production deployment, replace the in-memory limiter with a shared Redis-compatible store.
- Auth email delivery uses Resend when configured; links are never returned from public API responses.

## Admin dashboard

The backoffice is available at `/admin` after signing in as `STAFF` or `ADMIN`.

- `STAFF` can operate products, orders, homepage content, and read customer/category/brand data.
- `ADMIN` has full access, including category/brand/voucher management, customer access, reports, and audit logs.
- Page layouts and every mutation API repeat authorization against the current database role. Important mutations create an `AuditLog` record.

The admin homepage-content module uses the `HomepageSection` table introduced by migration `20260722010000_admin_homepage_sections`. Apply migrations before opening the storefront or admin dashboard.

## Curated seller and consignment flow

Customers can apply at `/sell`. Approved sellers use `/seller` to submit preloved items, upload evidence, accept the store's estimate, follow inspection/listing status, view sales, and request eligible payouts. This remains a curated consignment system: a seller submission never becomes a public product until an administrator completes the required status sequence, passes inspection, and explicitly publishes it.

Seller operations are available to `ADMIN` through `/admin/sellers`; `STAFF` has no seller-review or payout permission by default. Sensitive reads and every mutation repeat ownership or permission checks on the server. Commission, payout, inventory, publication, and payment-settlement changes use database transactions and create seller activity/audit records.

Uploaded consignment evidence uses Cloudinary when all three Cloudinary variables are configured. Uploads are signed on the server, while MIME signature, byte size, and image dimensions are validated before storage. Without Cloudinary credentials, development files are stored under `public/uploads/consignments` and ignored by Git. Production deployments should additionally enable moderation/malware scanning and restricted delivery where seller evidence must remain private. Encrypt identity and bank-account fields at rest using a managed key service; admin screens intentionally show only masked values.

Apply migration `20260722030000_seller_consignment` before using these routes. Eligible sales become payoutable only after the return window is over and an administrator runs settlement. The checkout payment transaction marks a unique consignment sold, snapshots its commission using `Decimal`, and preserves its stock at one unit.

## Midtrans setup

1. Set `MIDTRANS_SERVER_KEY`; set `MIDTRANS_IS_PRODUCTION=true` only for the production account.
2. Configure the notification URL to `https://YOUR_DOMAIN/api/payments/webhook/midtrans`.
3. Keep the server key server-side. `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` is only intended for an embedded Snap client.
4. Register the production domain and allowed finish URL in Midtrans.

Webhook signatures, payment amount, state transitions, and unique event keys are verified before an order changes status. With no server key, checkout uses the local mock payment provider.

## Shipping provider setup

Set `BITESHIP_API_KEY`, `BITESHIP_BASE_URL`, and the five-digit `BITESHIP_ORIGIN_POSTAL_CODE`. Shipping options are fetched and priced again on the server during order creation. With no API key, deterministic mock courier rates and tracking are used. RajaOngkir is not currently implemented; add it behind the existing `ShippingProvider` interface if required.

## Cloudinary setup

Create a restricted Cloudinary API key and set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. The server generates the upload signature and stores only the secure delivery URL plus public ID. Ensure the Cloudinary account limits accepted formats and transformations, and configure retention/deletion rules for rejected submissions.

## Testing and production build

```bash
npm test
npm run lint
npm run type-check
npm run build
```

For deployment, use a managed PostgreSQL database, run migrations as a release step, and deploy the Next.js server to a Node-compatible platform:

```bash
npm ci
npm run db:migrate:deploy
npm run build
npm start
```

Set `NEXT_PUBLIC_APP_URL`, `AUTH_URL`, and `AUTH_TRUST_HOST` to match the public HTTPS origin. Use a persistent/shared rate limiter such as Redis for horizontally scaled deployments, managed encryption for seller financial identity fields, centralized logs, database backups, and error monitoring. Verify `/robots.txt`, `/sitemap.xml`, Midtrans webhooks, and Cloudinary delivery after deployment.

## SEO, accessibility, and security

- Public pages provide canonical metadata, Open Graph/Twitter cards, product and breadcrumb JSON-LD, plus dynamic sitemap entries.
- Cart, wishlist, search, checkout, auth, account, seller, and admin surfaces are noindex; private paths are also blocked in `robots.txt`.
- The root skip link, route titles, semantic landmarks, visible focus states, live feedback, and reduced-motion policy support keyboard and assistive-technology use.
- Mutation requests reject cross-site browser origins. Security headers restrict framing, MIME sniffing, referrers, permissions, scripts, and external media origins.
- Prices, discounts, shipping, stock, commission, and payouts are recalculated server-side. Prisma parameterization prevents raw-input SQL injection in application queries.

## Known limitations

- Mock storefront mode is read-only on the server. Guest cart and wishlist persist in browser storage, while authentication and transactional features remain unavailable until PostgreSQL is configured.
- Midtrans and Biteship fall back to mocks until production credentials are configured.
- The global commerce provider keeps an offline/localStorage fallback before synchronizing authenticated cart and wishlist data with the database.
- In-memory rate limiting is suitable for one process only; production multi-instance deployment needs a shared store.
- Catalog `best-selling` and `biggest-discount` sorting currently evaluates at most 300 filtered records; normal newest/price listings paginate in PostgreSQL.
- Email verification/reset links are logged in development when Resend is not configured.
- Cloudinary is used only for seller evidence uploads; existing curated catalog assets may remain local or reference externally managed URLs.
- Automated unit tests cover critical domain and security rules, but browser-level accessibility, visual regression, and payment-provider sandbox tests should be added to CI.

## Useful commands

```bash
npm test
npm run lint
npm run type-check
npm run build
npm run db:studio
```
