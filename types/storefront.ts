export interface NavigationLink {
  label: string;
  href: string;
}

export interface NavigationGroup {
  title: string;
  links: NavigationLink[];
}

export interface NavigationItem extends NavigationLink {
  featured?: boolean;
  groups?: NavigationGroup[];
}

export interface SuggestedProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: NavigationLink[];
}

export type ProductBadge = "New" | "Preloved" | "Sale" | "Sold Out";

export interface StoreProduct {
  id: string;
  slug: string;
  brand: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  image: string;
  hoverImage: string;
  badge?: ProductBadge;
  condition?: "Pristine" | "Excellent" | "Very Good";
  soldOut?: boolean;
}

export interface HomeCategory extends NavigationLink {
  image: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
}
