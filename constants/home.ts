import type { HomeCategory, StoreProduct, Testimonial } from "@/types/storefront";

export const heroContent = {
  eyebrow: "The New Modern · 2026",
  title: "Quiet confidence, beautifully carried.",
  description: "Siluet terkurasi, material berkarakter, dan detail yang terasa personal—untuk gaya yang bertahan melampaui musim.",
  image: "/images/home/hero-home.png",
};

export const homeCategories: HomeCategory[] = [
  { label: "Bags", href: "/category/bags", image: "/images/storefront/mega-menu-campaign.png", description: "Struktur ikonis untuk setiap ritme." },
  { label: "Shoes", href: "/category/shoes", image: "/images/storefront/product-slingback.png", description: "Langkah ringan, garis yang refined." },
  { label: "Accessories", href: "/category/accessories", image: "/images/storefront/product-silk-scarf.png", description: "Detail kecil dengan karakter besar." },
  { label: "Men", href: "/category/men", image: "/images/home/featured-men.png", description: "Essentials dengan presisi modern." },
  { label: "Preloved", href: "/preloved", image: "/images/home/preloved-burgundy-main.png", description: "Kisah istimewa, siap dilanjutkan." },
];

export const newArrivals: StoreProduct[] = [
  { id: "amelie-bag", slug: "amelie-shoulder-bag", brand: "Aster & Row", name: "Amélie Shoulder Bag", category: "Bags", price: 4890000, image: "/images/storefront/product-shoulder-bag.png", hoverImage: "/images/home/shoulder-alt.png", badge: "New" },
  { id: "celine-slingback", slug: "celine-slingback-45", brand: "Noémie Studio", name: "Céline Slingback 45", category: "Shoes", price: 2790000, compareAt: 3290000, image: "/images/storefront/product-slingback.png", hoverImage: "/images/home/slingback-alt.png", badge: "Sale" },
  { id: "lumiere-scarf", slug: "lumiere-silk-scarf", brand: "Maison Aurelia", name: "Lumière Silk Scarf", category: "Accessories", price: 1590000, image: "/images/storefront/product-silk-scarf.png", hoverImage: "/images/home/scarf-alt.png", badge: "New" },
  { id: "solenne-tote", slug: "solenne-soft-tote", brand: "Atelier Serein", name: "Solenne Soft Tote", category: "Bags", price: 5290000, image: "/images/home/tote-main.png", hoverImage: "/images/home/tote-alt.png", badge: "New" },
  { id: "marais-loafer", slug: "marais-leather-loafer", brand: "Élan Atelier", name: "Marais Leather Loafer", category: "Men", price: 3890000, image: "/images/home/loafer-main.png", hoverImage: "/images/home/loafer-alt.png" },
  { id: "oriel-watch", slug: "oriel-oval-watch", brand: "Maison Aurelia", name: "Oriel Oval Watch", category: "Accessories", price: 3490000, compareAt: 4190000, image: "/images/home/watch-main.png", hoverImage: "/images/home/watch-alt.png", badge: "Sale" },
];

export const prelovedProducts: StoreProduct[] = [
  { id: "archive-burgundy", slug: "archive-burgundy-top-handle", brand: "Élan Archive", name: "Burgundy Top Handle 28", category: "Preloved Bags", price: 7850000, compareAt: 9200000, image: "/images/home/preloved-burgundy-main.png", hoverImage: "/images/home/preloved-burgundy-alt.png", badge: "Preloved", condition: "Excellent" },
  { id: "archive-taupe", slug: "archive-taupe-structured-bag", brand: "Maison Aurelia", name: "Taupe Structured Bag 30", category: "Preloved Bags", price: 6490000, image: "/images/storefront/mega-menu-campaign.png", hoverImage: "/images/home/preloved-taupe-alt.png", badge: "Preloved", condition: "Very Good" },
  { id: "archive-charcoal", slug: "archive-charcoal-shoulder", brand: "Aster & Row", name: "Charcoal Shoulder 24", category: "Preloved Bags", price: 4190000, image: "/images/storefront/product-shoulder-bag.png", hoverImage: "/images/home/shoulder-alt.png", badge: "Sold Out", condition: "Pristine", soldOut: true },
];

export const brands = ["Aster & Row", "Maison Aurelia", "Noémie Studio", "Atelier Serein", "Élan Archive", "Vetra", "Orée", "Lune Form", "Maison Calme", "Studio Nara", "Arden & Vale", "Serein Homme"] as const;

export const testimonials: Testimonial[] = [
  { id: "t1", name: "Nadia Prameswari", location: "Jakarta", quote: "Kurasi produknya terasa sangat personal. Tas tiba dengan kemasan rapi, detail kondisi akurat, dan prosesnya jauh lebih tenang dari pengalaman belanja luxury saya sebelumnya.", rating: 5 },
  { id: "t2", name: "Clara Wijaya", location: "Surabaya", quote: "Saya suka transparansi untuk koleksi preloved. Foto dan condition notes sesuai, sementara tim care memberi update di setiap tahap autentikasi.", rating: 5 },
  { id: "t3", name: "Raka Mahendra", location: "Bandung", quote: "Navigasinya sederhana dan pengirimannya cepat. Gift yang saya pilih terasa istimewa bahkan sebelum kotaknya dibuka.", rating: 5 },
];

export const guaranteeItems = [
  { icon: "inspect", title: "Pemeriksaan Menyeluruh", description: "Setiap detail material, hardware, dan konstruksi diperiksa oleh tim terlatih." },
  { icon: "authentic", title: "Jaminan Keaslian", description: "Produk preloved disertai hasil autentikasi dan perlindungan pembelian." },
  { icon: "secure", title: "Transaksi Aman", description: "Pembayaran terenkripsi dan data pribadi diproses dengan hati-hati." },
  { icon: "delivery", title: "Pengiriman Terpercaya", description: "Kemasan aman, pelacakan aktif, dan opsi proteksi selama perjalanan." },
] as const;

export const shoppingSteps = [
  { number: "01", title: "Pilih produk", description: "Temukan pilihan melalui koleksi, kategori, atau pencarian." },
  { number: "02", title: "Checkout", description: "Konfirmasi item, alamat, dan opsi pengiriman yang sesuai." },
  { number: "03", title: "Pembayaran", description: "Bayar melalui kanal terpercaya dengan konfirmasi langsung." },
  { number: "04", title: "Pengiriman", description: "Pantau perjalanan pesanan hingga tiba dengan aman." },
] as const;
