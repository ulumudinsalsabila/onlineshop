import type { FooterSection, NavigationItem, NavigationLink, SuggestedProduct } from "@/types/storefront";

const popularBrands: NavigationLink[] = [
  { label: "Aster & Row", href: "/brand/aster-row" },
  { label: "Maison Aurelia", href: "/brand/maison-aurelia" },
  { label: "Noémie Studio", href: "/brand/noemie-studio" },
  { label: "Atelier Serein", href: "/brand/atelier-serein" },
  { label: "Élan Archive", href: "/brand/elan-archive" },
];

export const announcement = {
  id: "complimentary-shipping-july-2026",
  message: "Complimentary shipping across Indonesia on orders over Rp2,500,000",
  link: { label: "View details", href: "/shipping" },
};

export const mainNavigation: NavigationItem[] = [
  {
    label: "New Arrivals",
    href: "/new-arrivals",
    groups: [
      { title: "Discover", links: [{ label: "Just In", href: "/new-arrivals" }, { label: "Editor's Selection", href: "/editors-selection" }, { label: "The Occasion Edit", href: "/occasion" }] },
      { title: "Curated for You", links: [{ label: "Summer Neutrals", href: "/edits/summer-neutrals" }, { label: "Modern Icons", href: "/edits/modern-icons" }, { label: "After Dark", href: "/edits/after-dark" }] },
      { title: "Popular Brands", links: popularBrands.slice(0, 4) },
    ],
  },
  {
    label: "Bags",
    href: "/category/bags",
    groups: [
      { title: "By Style", links: [{ label: "Shoulder Bags", href: "/bags/shoulder" }, { label: "Totes", href: "/bags/totes" }, { label: "Crossbody", href: "/bags/crossbody" }, { label: "Top Handle", href: "/bags/top-handle" }, { label: "Evening Bags", href: "/bags/evening" }] },
      { title: "By Edit", links: [{ label: "Everyday Icons", href: "/edits/everyday-icons" }, { label: "Work Essentials", href: "/edits/work-essentials" }, { label: "Travel Edit", href: "/edits/travel" }] },
      { title: "Popular Brands", links: popularBrands },
    ],
  },
  {
    label: "Accessories",
    href: "/category/accessories",
    groups: [
      { title: "Categories", links: [{ label: "Wallets", href: "/accessories/wallets" }, { label: "Scarves", href: "/accessories/scarves" }, { label: "Jewelry", href: "/accessories/jewelry" }, { label: "Eyewear", href: "/accessories/eyewear" }] },
      { title: "Finishing Touches", links: [{ label: "Belts", href: "/accessories/belts" }, { label: "Hair Accessories", href: "/accessories/hair" }, { label: "Bag Charms", href: "/accessories/bag-charms" }] },
      { title: "Popular Brands", links: popularBrands.slice(0, 4) },
    ],
  },
  {
    label: "Shoes",
    href: "/category/shoes",
    groups: [
      { title: "Categories", links: [{ label: "Flats", href: "/shoes/flats" }, { label: "Heels", href: "/shoes/heels" }, { label: "Sandals", href: "/shoes/sandals" }, { label: "Sneakers", href: "/shoes/sneakers" }] },
      { title: "The Edit", links: [{ label: "Desk to Dinner", href: "/edits/desk-to-dinner" }, { label: "Weekend Ease", href: "/edits/weekend-ease" }] },
      { title: "Popular Brands", links: popularBrands.slice(0, 4) },
    ],
  },
  {
    label: "Men",
    href: "/category/men",
    groups: [
      { title: "Categories", links: [{ label: "Bags", href: "/men/bags" }, { label: "Shoes", href: "/men/shoes" }, { label: "Accessories", href: "/men/accessories" }] },
      { title: "Featured", links: [{ label: "New Season", href: "/men/new-season" }, { label: "Travel Essentials", href: "/men/travel" }] },
      { title: "Popular Brands", links: popularBrands.slice(0, 4) },
    ],
  },
  {
    label: "Preloved",
    href: "/preloved",
    groups: [
      { title: "Shop Preloved", links: [{ label: "Bags", href: "/preloved/bags" }, { label: "Shoes", href: "/preloved/shoes" }, { label: "Accessories", href: "/preloved/accessories" }] },
      { title: "Our Standard", links: [{ label: "Condition Guide", href: "/condition-guide" }, { label: "Authenticity Promise", href: "/authenticity" }] },
      { title: "Popular Brands", links: popularBrands },
    ],
  },
  { label: "Brands", href: "/products", groups: [{ title: "Popular Brands", links: popularBrands }, { title: "Browse", links: [{ label: "All Designers A–Z", href: "/products" }, { label: "Emerging Designers", href: "/products?sort=newest" }] }, { title: "Curated", links: [{ label: "Independent Studios", href: "/products" }, { label: "House Icons", href: "/products?sort=best-selling" }] }] },
  { label: "Sale", href: "/sale", featured: true, groups: [{ title: "Shop Sale", links: [{ label: "Bags", href: "/sale/bags" }, { label: "Shoes", href: "/sale/shoes" }, { label: "Accessories", href: "/sale/accessories" }] }, { title: "By Reduction", links: [{ label: "Up to 30%", href: "/sale/30" }, { label: "Up to 50%", href: "/sale/50" }] }, { title: "Last Chance", links: [{ label: "Final Pieces", href: "/sale/final-pieces" }] }] },
];

export const searchData = {
  recent: ["structured bags", "silk scarf", "neutral slingbacks"],
  popular: ["new arrivals", "shoulder bags", "preloved icons", "summer edit", "gifts under Rp3 million"],
  suggestedProducts: [
    { id: "bag-amelie", name: "Amélie Shoulder Bag", category: "Bags", price: 4890000, image: "/images/storefront/product-shoulder-bag.png", href: "/products/amelie-shoulder-bag" },
    { id: "shoes-celine", name: "Céline Slingback 45", category: "Shoes", price: 3290000, image: "/images/storefront/product-slingback.png", href: "/products/celine-slingback-45" },
    { id: "scarf-lumiere", name: "Lumière Silk Scarf", category: "Accessories", price: 1590000, image: "/images/storefront/product-silk-scarf.png", href: "/products/lumiere-silk-scarf" },
  ] satisfies SuggestedProduct[],
};

export const footerSections: FooterSection[] = [
  { title: "Shop", links: [{ label: "New Arrivals", href: "/new-arrivals" }, { label: "Bags", href: "/category/bags" }, { label: "Shoes", href: "/category/shoes" }, { label: "Accessories", href: "/category/accessories" }, { label: "Preloved", href: "/preloved" }] },
  { title: "Customer Care", links: [{ label: "Contact Us", href: "/contact" }, { label: "Shipping & Delivery", href: "/shipping" }, { label: "Returns", href: "/returns" }, { label: "Size Guide", href: "/size-guide" }, { label: "FAQ", href: "/faq" }] },
  { title: "About", links: [{ label: "Our Story", href: "/about" }, { label: "Sell with Us", href: "/sell" }, { label: "Authenticity", href: "/authenticity" }, { label: "Journal", href: "/journal" }, { label: "Careers", href: "/careers" }] },
];

export const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "Pinterest", href: "https://pinterest.com" },
] as const;

export const contactDetails = {
  email: "care@ivory.id",
  phone: "+62 21 555 0188",
  whatsapp: "https://wa.me/6281112345678?text=Halo%20Maison%20Elan%2C%20saya%20butuh%20bantuan.",
  hours: "Monday–Saturday, 9:00 AM–6:00 PM WIB",
};

export const paymentMethods = ["VISA", "Mastercard", "BCA", "Mandiri", "BNI", "QRIS"] as const;
