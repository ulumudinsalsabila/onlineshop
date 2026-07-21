import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { catalogProducts } from "../constants/catalog";
import { PrismaClient, ProductCondition, ProductStatus, UserRole } from "../generated/prisma/client";
import { hashPassword } from "../lib/security/password";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL wajib diisi sebelum menjalankan seed.");
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
const customerPassword = process.env.SEED_CUSTOMER_PASSWORD;
if (!adminPassword || !customerPassword) throw new Error("SEED_ADMIN_PASSWORD dan SEED_CUSTOMER_PASSWORD wajib diisi. Password demo tidak ditanam di source code.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

const categorySeeds = [
  ["Bags", "bags"], ["Shoes", "shoes"], ["Accessories", "accessories"], ["Men", "men"], ["Jewelry", "jewelry"], ["Ready to Wear", "ready-to-wear"],
] as const;
const brandSeeds = [
  ["Aster & Row", "aster-row"], ["Maison Aurelia", "maison-aurelia"], ["Noémie Studio", "noemie-studio"], ["Atelier Serein", "atelier-serein"], ["Élan Archive", "elan-archive"], ["Vetra", "vetra"], ["Orée", "oree"], ["Lune Form", "lune-form"], ["Maison Calme", "maison-calme"], ["Studio Nara", "studio-nara"],
] as const;

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.test").toLowerCase();
  const customerEmail = (process.env.SEED_CUSTOMER_EMAIL ?? "customer@example.test").toLowerCase();
  const [adminHash, customerHash] = await Promise.all([hashPassword(adminPassword!), hashPassword(customerPassword!)]);

  const admin = await prisma.user.upsert({ where: { email: adminEmail }, update: { role: UserRole.ADMIN, passwordHash: adminHash, emailVerified: new Date(), isActive: true }, create: { name: "Development Admin", email: adminEmail, passwordHash: adminHash, emailVerified: new Date(), role: UserRole.ADMIN } });
  const customer = await prisma.user.upsert({ where: { email: customerEmail }, update: { passwordHash: customerHash, emailVerified: new Date(), isActive: true }, create: { name: "Nadia Pratama", email: customerEmail, passwordHash: customerHash, emailVerified: new Date(), role: UserRole.CUSTOMER, wishlist: { create: {} } } });

  const categories = new Map<string, string>();
  for (const [name, slug] of categorySeeds) {
    const category = await prisma.category.upsert({ where: { slug }, update: { name, isActive: true }, create: { name, slug, description: `Koleksi ${name.toLowerCase()} yang dikurasi.` } });
    categories.set(slug, category.id);
  }
  const brands = [];
  for (const [name, slug] of brandSeeds) brands.push(await prisma.brand.upsert({ where: { slug }, update: { name, isActive: true }, create: { name, slug, isFeatured: brands.length < 6 } }));

  const seededProducts = [];
  for (const [index, source] of catalogProducts.slice(0, 24).entries()) {
    const brand = brands[index % brands.length];
    const categorySlug = categories.has(source.categorySlug) ? source.categorySlug : index % 2 ? "accessories" : "ready-to-wear";
    const condition = source.conditionType === "preloved" ? ProductCondition.PRELOVED : ProductCondition.NEW;
    const product = await prisma.product.upsert({
      where: { slug: source.slug },
      update: { name: source.name, price: source.price, compareAtPrice: source.compareAt, status: ProductStatus.ACTIVE, condition, brandId: brand.id, categoryId: categories.get(categorySlug)! },
      create: {
        slug: source.slug, baseSku: `IV-${String(index + 1).padStart(4, "0")}`, name: source.name, shortDescription: `${source.brand} — ${source.category}`, description: `${source.name} dipilih untuk koleksi IVORY dengan fokus pada material, proporsi, dan fungsi.`,
        price: source.price, compareAtPrice: source.compareAt, condition, conditionLabel: source.condition, completeness: condition === ProductCondition.PRELOVED ? "Product with dust bag" : null, flawNotes: condition === ProductCondition.PRELOVED ? "Tanda pemakaian ringan sesuai dokumentasi." : null, authenticationStatus: condition === ProductCondition.PRELOVED ? "Authenticated" : null,
        status: ProductStatus.ACTIVE, isFeatured: index < 8, isNewArrival: index < 10, publishedAt: new Date(), brandId: brand.id, categoryId: categories.get(categorySlug)!, material: "Premium leather and considered hardware", origin: "Responsibly sourced",
        images: { create: [{ url: source.image, alt: source.name, width: 1254, height: 1254, isPrimary: true, sortOrder: 0 }, { url: source.hoverImage, alt: `${source.name} alternate view`, width: 1254, height: 1254, sortOrder: 1 }] },
        variants: { create: [{ sku: `IV-${String(index + 1).padStart(4, "0")}-01`, name: [source.colors[0], source.sizes[0]].filter(Boolean).join(" / ") || "Default", color: source.colors[0], size: source.sizes[0], inventory: { create: { quantity: source.soldOut ? 0 : source.stock } } }] },
      },
      include: { variants: true, images: true },
    });
    seededProducts.push(product);
  }

  await prisma.banner.upsert({ where: { id: "seed-home-hero" }, update: {}, create: { id: "seed-home-hero", name: "The New Modern", placement: "HOME_HERO", eyebrow: "The New Modern · 2026", title: "Quiet confidence, beautifully carried.", body: "Siluet terkurasi, material berkarakter, dan detail yang terasa personal.", imageUrl: "/images/home/hero-home.png", imageAlt: "Model mengenakan tailoring ivory", href: "/new-arrivals", ctaLabel: "Shop now", isActive: true } });
  const testimonialData = [
    ["Alya S.", "Jakarta", "Kurasi produknya terasa personal dan proses belanjanya sangat tenang."],
    ["Marcella T.", "Surabaya", "Kondisi produk preloved dijelaskan transparan dan pengemasannya istimewa."],
    ["Dina R.", "Bandung", "Detail autentikasi membuat saya nyaman memilih tas yang sudah lama dicari."],
  ] as const;
  await prisma.testimonial.deleteMany({ where: { id: { startsWith: "seed-testimonial-" } } });
  await prisma.testimonial.createMany({ data: testimonialData.map(([name, location, quote], index) => ({ id: `seed-testimonial-${index + 1}`, name, location, quote, rating: 5, sortOrder: index })) });
  const homepageSections = [["hero", "Hero"], ["categories", "Shop by Category"], ["new-arrivals", "New Arrivals"], ["featured", "Featured Collection"], ["preloved", "Preloved Collection"], ["brands", "Shop by Brand"], ["promotion", "Promotional Banner"], ["authenticity", "Authenticity Guarantee"], ["how-to-shop", "How to Shop"], ["testimonials", "Testimonials"], ["newsletter", "Newsletter"]] as const;
  for (const [index, [key, title]] of homepageSections.entries()) await prisma.homepageSection.upsert({ where: { key }, update: { title, sortOrder: index }, create: { key, title, sortOrder: index } });

  const address = { recipient: customer.name ?? "Customer", phone: "+62 812 0000 0000", line1: "Jl. Senopati No. 10", district: "Kebayoran Baru", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12190", country: "Indonesia" };
  for (let orderIndex = 0; orderIndex < 2; orderIndex += 1) {
    const product = seededProducts[orderIndex];
    const variant = product.variants[0];
    await prisma.order.upsert({
      where: { orderNumber: `DEV-2026-000${orderIndex + 1}` }, update: {},
      create: { orderNumber: `DEV-2026-000${orderIndex + 1}`, userId: customer.id, status: orderIndex ? "DELIVERED" : "PROCESSING", paymentStatus: "PAID", customerEmail: customer.email, customerName: customer.name ?? "Customer", shippingAddress: address, subtotal: product.price, grandTotal: product.price, items: { create: { variantId: variant.id, productName: product.name, productSlug: product.slug, sku: variant.sku, variantName: variant.name, colorSnapshot: variant.color, sizeSnapshot: variant.size, imageUrlSnapshot: product.images[0]?.url, unitPrice: product.price, compareAtPrice: product.compareAtPrice, quantity: 1, lineTotal: product.price } }, payments: { create: { provider: "development", providerRef: `DEV-PAY-${orderIndex + 1}`, idempotencyKey: `seed-payment-${orderIndex + 1}`, method: "BANK_TRANSFER", status: "PAID", amount: product.price, paidAt: new Date() } } },
    });
  }

  await prisma.auditLog.create({ data: { userId: admin.id, action: "SEED_DATABASE", entityType: "System", metadata: { products: seededProducts.length, categories: categories.size, brands: brands.length } } });
  console.info(`Seed complete: ${categories.size} categories, ${brands.length} brands, ${seededProducts.length} products, 2 users, 2 orders.`);
}

main().finally(() => prisma.$disconnect());
