import type { CatalogProduct } from "@/types/catalog";

export interface CartItemRecord {
  id: string;
  productId: string;
  variantId?: string;
  color: string;
  size: string;
  quantity: number;
  productSnapshot?: CatalogProduct;
}

export interface ResolvedCartLine extends CartItemRecord {
  product: CatalogProduct;
  unitPrice: number;
  lineTotal: number;
  availableStock: number;
  canCheckout: boolean;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  grandTotal: number;
  voucherApplied: boolean;
}

export interface PersistedCommerceState {
  version: 1;
  cart: CartItemRecord[];
  wishlistIds: string[];
  recentlyViewedIds: string[];
}

export interface CommerceRepository {
  load(): Promise<PersistedCommerceState>;
  save(state: PersistedCommerceState): Promise<void>;
  clear(): Promise<void>;
}

export interface ProductEditorialDetails {
  sku: string;
  description: string;
  specifications: Array<{ label: string; value: string }>;
  completeness?: string;
  flaws?: string;
  purchaseYear?: number;
  authenticationStatus?: string;
}
