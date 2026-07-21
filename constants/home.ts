import type { HomeCategory, StoreProduct, Testimonial } from "@/types/storefront";

export const heroContent = {
  eyebrow: "The New Modern · 2026",
  title: "Quiet confidence, beautifully carried.",
  description: "Curated silhouettes, expressive materials, and details that feel personal—for a wardrobe that lasts beyond the season.",
  image: "/images/home/hero-home.png",
};

export const homeCategories: HomeCategory[] = [
  { label: "Bags", href: "/category/bags", image: "/images/storefront/mega-menu-campaign.png", description: "Iconic structure for every rhythm." },
  { label: "Shoes", href: "/category/shoes", image: "/images/storefront/product-slingback.png", description: "Light steps, refined lines." },
  { label: "Accessories", href: "/category/accessories", image: "/images/storefront/product-silk-scarf.png", description: "Small details with a distinct presence." },
  { label: "Men", href: "/category/men", image: "/images/home/featured-men.png", description: "Essentials with modern precision." },
  { label: "Preloved", href: "/preloved", image: "/images/home/preloved-burgundy-main.png", description: "Remarkable stories, ready to continue." },
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
  { id: "t1", name: "Nadia Prameswari", location: "Jakarta", quote: "The curation feels genuinely personal. My bag arrived beautifully packed, the condition notes were accurate, and the entire experience felt effortless.", rating: 5 },
  { id: "t2", name: "Clara Wijaya", location: "Surabaya", quote: "I appreciate the transparency of the preloved collection. The photographs and condition notes were precise, with thoughtful updates throughout authentication.", rating: 5 },
  { id: "t3", name: "Raka Mahendra", location: "Bandung", quote: "The navigation is simple and delivery was quick. The gift felt special before the box was even opened.", rating: 5 },
];

export const guaranteeItems = [
  { icon: "inspect", title: "Thorough Inspection", description: "Every material, hardware, and construction detail is reviewed by our trained team." },
  { icon: "authentic", title: "Authenticity Guaranteed", description: "Preloved pieces include authentication results and purchase protection." },
  { icon: "secure", title: "Secure Transactions", description: "Payments are encrypted and personal data is handled with care." },
  { icon: "delivery", title: "Trusted Delivery", description: "Secure packaging, active tracking, and protection options throughout the journey." },
] as const;

export const shoppingSteps = [
  { number: "01", title: "Choose your piece", description: "Explore through collections, categories, or search." },
  { number: "02", title: "Checkout", description: "Confirm your items, address, and preferred delivery option." },
  { number: "03", title: "Payment", description: "Pay through trusted channels with immediate confirmation." },
  { number: "04", title: "Delivery", description: "Follow your order until it arrives safely." },
] as const;
