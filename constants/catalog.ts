import type { CatalogProduct, CatalogSort } from "@/types/catalog";

export const CATALOG_MIN_PRICE = 0;
export const CATALOG_MAX_PRICE = 15_000_000;
export const CATALOG_PAGE_SIZE = 12;

export const catalogCategories = [
  { value: "bags", label: "Bags" },
  { value: "shoes", label: "Shoes" },
  { value: "accessories", label: "Accessories" },
  { value: "men", label: "Men" },
] as const;

export const catalogBrands = [
  { value: "aster-row", label: "Aster & Row" },
  { value: "maison-aurelia", label: "Maison Aurelia" },
  { value: "noemie-studio", label: "Noémie Studio" },
  { value: "atelier-serein", label: "Atelier Serein" },
  { value: "elan-archive", label: "Élan Archive" },
  { value: "vetra", label: "Vetra" },
  { value: "oree", label: "Orée" },
  { value: "lune-form", label: "Lune Form" },
  { value: "maison-calme", label: "Maison Calme" },
  { value: "studio-nara", label: "Studio Nara" },
  { value: "arden-and-vale", label: "Arden & Vale" },
  { value: "serein-homme", label: "Serein Homme" },
] as const;

export const catalogColors = [
  { value: "black", label: "Black", swatch: "#252321" },
  { value: "beige", label: "Beige", swatch: "#d8c9b5" },
  { value: "brown", label: "Brown", swatch: "#76513c" },
  { value: "burgundy", label: "Burgundy", swatch: "#6f2530" },
  { value: "gold", label: "Soft Gold", swatch: "#b89d70" },
  { value: "ivory", label: "Ivory", swatch: "#f0eadf" },
  { value: "taupe", label: "Taupe", swatch: "#9b8b7b" },
] as const;

export const catalogSizes = ["One Size", "36", "37", "38", "39", "40", "41", "42"] as const;

export const catalogSortOptions: Array<{ value: CatalogSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-asc", label: "Price Low to High" },
  { value: "price-desc", label: "Price High to Low" },
  { value: "discount-desc", label: "Biggest Discount" },
];

export const popularCatalogKeywords = ["shoulder bag", "neutral shoes", "silk scarf", "preloved icon", "gifts under 3 juta"];

const images = {
  shoulder: ["/images/storefront/product-shoulder-bag.png", "/images/home/shoulder-alt.png"],
  slingback: ["/images/storefront/product-slingback.png", "/images/home/slingback-alt.png"],
  scarf: ["/images/storefront/product-silk-scarf.png", "/images/home/scarf-alt.png"],
  tote: ["/images/home/tote-main.png", "/images/home/tote-alt.png"],
  loafer: ["/images/home/loafer-main.png", "/images/home/loafer-alt.png"],
  watch: ["/images/home/watch-main.png", "/images/home/watch-alt.png"],
  burgundy: ["/images/home/preloved-burgundy-main.png", "/images/home/preloved-burgundy-alt.png"],
  taupe: ["/images/storefront/mega-menu-campaign.png", "/images/home/preloved-taupe-alt.png"],
} as const;

type ProductSeed = Omit<CatalogProduct, "image" | "hoverImage"> & { imageSet: keyof typeof images };

function defineProduct(seed: ProductSeed): CatalogProduct {
  const [image, hoverImage] = images[seed.imageSet];
  const { imageSet: _imageSet, ...product } = seed;
  void _imageSet;
  return { ...product, image, hoverImage };
}

export const catalogProducts: CatalogProduct[] = [
  defineProduct({ id: "p01", slug: "amelie-shoulder-bag", brand: "Aster & Row", brandSlug: "aster-row", name: "Amélie Shoulder Bag", category: "Bags", categorySlug: "bags", price: 4_890_000, compareAt: 5_490_000, imageSet: "shoulder", badge: "New", conditionType: "new", colors: ["black", "gold"], sizes: ["One Size"], stock: 8, createdAt: "2026-07-18", salesCount: 86 }),
  defineProduct({ id: "p02", slug: "celine-slingback-45", brand: "Noémie Studio", brandSlug: "noemie-studio", name: "Céline Slingback 45", category: "Shoes", categorySlug: "shoes", price: 2_790_000, compareAt: 3_290_000, imageSet: "slingback", badge: "Sale", conditionType: "new", colors: ["beige", "ivory"], sizes: ["36", "37", "38", "39"], stock: 14, createdAt: "2026-07-15", salesCount: 124 }),
  defineProduct({ id: "p03", slug: "lumiere-silk-scarf", brand: "Maison Aurelia", brandSlug: "maison-aurelia", name: "Lumière Silk Scarf", category: "Accessories", categorySlug: "accessories", price: 1_590_000, imageSet: "scarf", badge: "New", conditionType: "new", colors: ["ivory", "black", "gold"], sizes: ["One Size"], stock: 22, createdAt: "2026-07-20", salesCount: 73 }),
  defineProduct({ id: "p04", slug: "solenne-soft-tote", brand: "Atelier Serein", brandSlug: "atelier-serein", name: "Solenne Soft Tote", category: "Bags", categorySlug: "bags", price: 5_290_000, imageSet: "tote", badge: "New", conditionType: "new", colors: ["brown"], sizes: ["One Size"], stock: 6, createdAt: "2026-07-19", salesCount: 65 }),
  defineProduct({ id: "p05", slug: "marais-leather-loafer", brand: "Élan Archive", brandSlug: "elan-archive", name: "Marais Leather Loafer", category: "Men", categorySlug: "men", price: 3_890_000, imageSet: "loafer", conditionType: "new", colors: ["brown", "black"], sizes: ["39", "40", "41", "42"], stock: 11, createdAt: "2026-07-10", salesCount: 54 }),
  defineProduct({ id: "p06", slug: "oriel-oval-watch", brand: "Maison Aurelia", brandSlug: "maison-aurelia", name: "Oriel Oval Watch", category: "Accessories", categorySlug: "accessories", price: 3_490_000, compareAt: 4_190_000, imageSet: "watch", badge: "Sale", conditionType: "new", colors: ["gold", "brown"], sizes: ["One Size"], stock: 4, createdAt: "2026-06-28", salesCount: 91 }),
  defineProduct({ id: "p07", slug: "archive-burgundy-top-handle", brand: "Élan Archive", brandSlug: "elan-archive", name: "Burgundy Top Handle 28", category: "Bags", categorySlug: "bags", price: 7_850_000, compareAt: 9_200_000, imageSet: "burgundy", badge: "Preloved", condition: "Excellent", conditionType: "preloved", colors: ["burgundy", "gold"], sizes: ["One Size"], stock: 1, createdAt: "2026-07-14", salesCount: 39 }),
  defineProduct({ id: "p08", slug: "taupe-structured-bag-30", brand: "Maison Aurelia", brandSlug: "maison-aurelia", name: "Taupe Structured Bag 30", category: "Bags", categorySlug: "bags", price: 6_490_000, imageSet: "taupe", badge: "Preloved", condition: "Very Good", conditionType: "preloved", colors: ["taupe", "gold"], sizes: ["One Size"], stock: 1, createdAt: "2026-07-12", salesCount: 31 }),
  defineProduct({ id: "p09", slug: "charcoal-shoulder-24", brand: "Aster & Row", brandSlug: "aster-row", name: "Charcoal Shoulder 24", category: "Bags", categorySlug: "bags", price: 4_190_000, imageSet: "shoulder", badge: "Sold Out", condition: "Pristine", conditionType: "preloved", colors: ["black"], sizes: ["One Size"], stock: 0, soldOut: true, createdAt: "2026-06-20", salesCount: 44 }),
  defineProduct({ id: "p10", slug: "serenite-mini-tote", brand: "Vetra", brandSlug: "vetra", name: "Sérénité Mini Tote", category: "Bags", categorySlug: "bags", price: 3_750_000, compareAt: 4_690_000, imageSet: "tote", badge: "Sale", conditionType: "new", colors: ["brown", "taupe"], sizes: ["One Size"], stock: 9, createdAt: "2026-06-15", salesCount: 112 }),
  defineProduct({ id: "p11", slug: "rive-soft-shoulder", brand: "Lune Form", brandSlug: "lune-form", name: "Rive Soft Shoulder", category: "Bags", categorySlug: "bags", price: 4_450_000, imageSet: "shoulder", conditionType: "new", colors: ["black"], sizes: ["One Size"], stock: 13, createdAt: "2026-06-05", salesCount: 98 }),
  defineProduct({ id: "p12", slug: "atelier-weekend-tote", brand: "Studio Nara", brandSlug: "studio-nara", name: "Atelier Weekend Tote", category: "Bags", categorySlug: "bags", price: 4_990_000, imageSet: "tote", badge: "New", conditionType: "new", colors: ["brown"], sizes: ["One Size"], stock: 7, createdAt: "2026-07-17", salesCount: 47 }),
  defineProduct({ id: "p13", slug: "eloise-kitten-heel", brand: "Orée", brandSlug: "oree", name: "Éloise Kitten Heel", category: "Shoes", categorySlug: "shoes", price: 2_950_000, imageSet: "slingback", badge: "New", conditionType: "new", colors: ["beige"], sizes: ["36", "37", "38", "39"], stock: 10, createdAt: "2026-07-16", salesCount: 68 }),
  defineProduct({ id: "p14", slug: "dune-slingback", brand: "Maison Calme", brandSlug: "maison-calme", name: "Dune Slingback", category: "Shoes", categorySlug: "shoes", price: 2_390_000, compareAt: 3_190_000, imageSet: "slingback", badge: "Sale", conditionType: "new", colors: ["ivory", "beige"], sizes: ["36", "37", "38"], stock: 5, createdAt: "2026-05-29", salesCount: 133 }),
  defineProduct({ id: "p15", slug: "montmartre-loafer", brand: "Atelier Serein", brandSlug: "atelier-serein", name: "Montmartre Loafer", category: "Shoes", categorySlug: "shoes", price: 3_650_000, imageSet: "loafer", conditionType: "new", colors: ["brown"], sizes: ["37", "38", "39", "40"], stock: 16, createdAt: "2026-06-22", salesCount: 77 }),
  defineProduct({ id: "p16", slug: "archive-almond-slingback", brand: "Noémie Studio", brandSlug: "noemie-studio", name: "Archive Almond Slingback", category: "Shoes", categorySlug: "shoes", price: 2_150_000, imageSet: "slingback", badge: "Preloved", condition: "Excellent", conditionType: "preloved", colors: ["beige"], sizes: ["38"], stock: 1, createdAt: "2026-07-08", salesCount: 25 }),
  defineProduct({ id: "p17", slug: "nocturne-silk-square", brand: "Maison Aurelia", brandSlug: "maison-aurelia", name: "Nocturne Silk Square", category: "Accessories", categorySlug: "accessories", price: 1_390_000, compareAt: 1_790_000, imageSet: "scarf", badge: "Sale", conditionType: "new", colors: ["black", "gold"], sizes: ["One Size"], stock: 18, createdAt: "2026-05-18", salesCount: 146 }),
  defineProduct({ id: "p18", slug: "aurelia-timepiece", brand: "Vetra", brandSlug: "vetra", name: "Aurelia Timepiece", category: "Accessories", categorySlug: "accessories", price: 4_250_000, imageSet: "watch", badge: "New", conditionType: "new", colors: ["gold", "brown"], sizes: ["One Size"], stock: 3, createdAt: "2026-07-13", salesCount: 34 }),
  defineProduct({ id: "p19", slug: "heritage-oval-watch", brand: "Élan Archive", brandSlug: "elan-archive", name: "Heritage Oval Watch", category: "Accessories", categorySlug: "accessories", price: 5_950_000, imageSet: "watch", badge: "Preloved", condition: "Very Good", conditionType: "preloved", colors: ["gold", "brown"], sizes: ["One Size"], stock: 1, createdAt: "2026-06-30", salesCount: 29 }),
  defineProduct({ id: "p20", slug: "quiet-lines-scarf", brand: "Lune Form", brandSlug: "lune-form", name: "Quiet Lines Scarf", category: "Accessories", categorySlug: "accessories", price: 1_250_000, imageSet: "scarf", conditionType: "new", colors: ["ivory", "black"], sizes: ["One Size"], stock: 24, createdAt: "2026-06-11", salesCount: 82 }),
  defineProduct({ id: "p21", slug: "serein-weekender", brand: "Atelier Serein", brandSlug: "atelier-serein", name: "Serein Weekender", category: "Men", categorySlug: "men", price: 6_250_000, compareAt: 7_190_000, imageSet: "tote", badge: "Sale", conditionType: "new", colors: ["brown"], sizes: ["One Size"], stock: 5, createdAt: "2026-06-18", salesCount: 61 }),
  defineProduct({ id: "p22", slug: "rive-business-loafer", brand: "Maison Calme", brandSlug: "maison-calme", name: "Rive Business Loafer", category: "Men", categorySlug: "men", price: 3_790_000, imageSet: "loafer", badge: "New", conditionType: "new", colors: ["black", "brown"], sizes: ["39", "40", "41", "42"], stock: 12, createdAt: "2026-07-11", salesCount: 71 }),
  defineProduct({ id: "p23", slug: "archive-gentlemans-watch", brand: "Élan Archive", brandSlug: "elan-archive", name: "Archive Gentleman's Watch", category: "Men", categorySlug: "men", price: 4_890_000, imageSet: "watch", badge: "Preloved", condition: "Excellent", conditionType: "preloved", colors: ["gold", "brown"], sizes: ["One Size"], stock: 1, createdAt: "2026-06-24", salesCount: 36 }),
  defineProduct({ id: "p24", slug: "nara-city-loafer", brand: "Studio Nara", brandSlug: "studio-nara", name: "Nara City Loafer", category: "Men", categorySlug: "men", price: 3_250_000, compareAt: 3_890_000, imageSet: "loafer", badge: "Sale", conditionType: "new", colors: ["brown"], sizes: ["39", "40", "41"], stock: 8, createdAt: "2026-05-25", salesCount: 102 }),
  defineProduct({ id: "p25", slug: "vintage-cognac-tote", brand: "Vetra", brandSlug: "vetra", name: "Vintage Cognac Tote", category: "Bags", categorySlug: "bags", price: 5_750_000, imageSet: "tote", badge: "Preloved", condition: "Very Good", conditionType: "preloved", colors: ["brown"], sizes: ["One Size"], stock: 1, createdAt: "2026-07-04", salesCount: 27 }),
  defineProduct({ id: "p26", slug: "burgundy-evening-handle", brand: "Orée", brandSlug: "oree", name: "Burgundy Evening Handle", category: "Bags", categorySlug: "bags", price: 6_950_000, imageSet: "burgundy", badge: "Preloved", condition: "Pristine", conditionType: "preloved", colors: ["burgundy", "gold"], sizes: ["One Size"], stock: 1, createdAt: "2026-07-09", salesCount: 22 }),
  defineProduct({ id: "p27", slug: "calme-structured-shoulder", brand: "Maison Calme", brandSlug: "maison-calme", name: "Calme Structured Shoulder", category: "Bags", categorySlug: "bags", price: 4_650_000, imageSet: "taupe", conditionType: "new", colors: ["taupe"], sizes: ["One Size"], stock: 15, createdAt: "2026-05-14", salesCount: 93 }),
  defineProduct({ id: "p28", slug: "atelier-monogram-free-tote", brand: "Aster & Row", brandSlug: "aster-row", name: "Atelier Leather Tote", category: "Bags", categorySlug: "bags", price: 5_890_000, imageSet: "tote", badge: "New", conditionType: "new", colors: ["brown"], sizes: ["One Size"], stock: 6, createdAt: "2026-07-21", salesCount: 18 }),
  defineProduct({ id: "p29", slug: "silk-geometry-90", brand: "Studio Nara", brandSlug: "studio-nara", name: "Silk Geometry 90", category: "Accessories", categorySlug: "accessories", price: 1_750_000, imageSet: "scarf", badge: "New", conditionType: "new", colors: ["ivory", "gold", "black"], sizes: ["One Size"], stock: 20, createdAt: "2026-07-18", salesCount: 49 }),
  defineProduct({ id: "p30", slug: "preloved-dune-top-handle", brand: "Lune Form", brandSlug: "lune-form", name: "Dune Top Handle", category: "Bags", categorySlug: "bags", price: 5_250_000, imageSet: "taupe", badge: "Sold Out", condition: "Excellent", conditionType: "preloved", colors: ["taupe"], sizes: ["One Size"], stock: 0, soldOut: true, createdAt: "2026-06-09", salesCount: 41 }),
];
