"use client";

import { apiFetch } from "@/lib/api-client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { catalogProducts } from "@/constants/catalog";
import { clampQuantity, createCartItemId, resolveCartLines } from "@/lib/cart";
import { LocalStorageCommerceRepository } from "@/lib/commerce-repository";
import type { CartItemRecord, PersistedCommerceState } from "@/types/commerce";
import type { CatalogProduct } from "@/types/catalog";
import type { StoreProduct } from "@/types/storefront";

interface CommerceContextValue {
  hydrated: boolean;
  cart: CartItemRecord[];
  cartLines: ReturnType<typeof resolveCartLines>;
  cartCount: number;
  wishlistIds: string[];
  recentlyViewedIds: string[];
  cartOpen: boolean;
  setCartOpen(open: boolean): void;
  addToCart(productId: string, options?: { color?: string; size?: string; quantity?: number; openCart?: boolean; product?: StoreProduct }): boolean;
  updateQuantity(itemId: string, quantity: number): void;
  removeFromCart(itemId: string): void;
  moveCartItemToWishlist(itemId: string): void;
  toggleWishlist(productId: string): boolean;
  moveWishlistToCart(productId: string): boolean;
  addRecentlyViewed(productId: string): void;
}

const CommerceContext = createContext<CommerceContextValue | null>(null);
const repository = new LocalStorageCommerceRepository();

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItemRecord[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistItemIds, setWishlistItemIds] = useState<Record<string, string>>({});
  const [databaseSyncEnabled, setDatabaseSyncEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    void repository.load().then((state) => {
      if (!active) return;
      setCart(state.cart);
      setWishlistIds(state.wishlistIds);
      setRecentlyViewedIds(state.recentlyViewedIds);
      setHydrated(true);
      void hasAuthenticatedSession().then((authenticated) => {
        if (!active || !authenticated) return;
        setDatabaseSyncEnabled(true);
        void syncCommerceFromDatabase(setCart, setWishlistIds, setWishlistItemIds);
      });
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: PersistedCommerceState = { version: 1, cart, wishlistIds, recentlyViewedIds };
    void repository.save(state);
  }, [cart, hydrated, recentlyViewedIds, wishlistIds]);

  const cartLines = useMemo(() => resolveCartLines(cart, catalogProducts), [cart]);
  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0);

  function addToCart(productId: string, options: { color?: string; size?: string; quantity?: number; openCart?: boolean; product?: StoreProduct } = {}): boolean {
    const supplied = options.product;
    const product = catalogProducts.find((item) => item.id === productId) ?? (supplied ? normalizeProductSnapshot(supplied) : undefined);
    if (!product || product.stock < 1 || product.soldOut) return false;
    const color = options.color && product.colors.includes(options.color) ? options.color : (product.colors[0] ?? "default");
    const size = options.size && product.sizes.includes(options.size) ? options.size : (product.sizes[0] ?? "default");
    const quantity = clampQuantity(options.quantity ?? 1, product.stock);
    const variant = product.variants?.find((item) => (!options.color || item.color === options.color) && (!options.size || item.size === options.size)) ?? product.variants?.[0];
    const id = createCartItemId(productId, color, size);
    setCart((current) => {
      const existing = current.find((item) => item.id === id);
      return existing
        ? current.map((item) => item.id === id ? { ...item, quantity: clampQuantity(item.quantity + quantity, product.stock) } : item)
        : [...current, { id, productId, variantId: variant?.id, color, size, quantity, productSnapshot: product }];
    });
    if (databaseSyncEnabled && variant?.id) void apiFetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variantId: variant.id, quantity }) }).then(applyRemoteCartResponse(setCart)).catch(() => undefined);
    if (options.openCart !== false) setCartOpen(true);
    return true;
  }

  function updateQuantity(itemId: string, quantity: number) {
    const remoteItem = cart.find((item) => item.id === itemId && item.variantId);
    setCart((current) => current.flatMap((item) => {
      if (item.id !== itemId) return [item];
      if (quantity <= 0) return [];
      const product = item.productSnapshot ?? catalogProducts.find((entry) => entry.id === item.productId);
      return product && product.stock > 0 ? [{ ...item, quantity: clampQuantity(quantity, product.stock) }] : [item];
    }));
    if (databaseSyncEnabled && remoteItem && quantity > 0) void apiFetch(`/api/cart/items/${itemId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity }) }).then(applyRemoteCartResponse(setCart)).catch(() => undefined);
  }

  function removeFromCart(itemId: string) {
    const remote = cart.some((item) => item.id === itemId && item.variantId);
    setCart((current) => current.filter((item) => item.id !== itemId));
    if (databaseSyncEnabled && remote) void apiFetch(`/api/cart/items/${itemId}`, { method: "DELETE" }).catch(() => undefined);
  }

  function toggleWishlist(productId: string): boolean {
    const willAdd = !wishlistIds.includes(productId);
    setWishlistIds((current) => willAdd ? [productId, ...current.filter((id) => id !== productId)] : current.filter((id) => id !== productId));
    if (databaseSyncEnabled && willAdd) void apiFetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) }).then(async (response) => { const result = await response.json() as { success?: boolean; data?: { id?: string } }; if (result.success && result.data?.id) setWishlistItemIds((current) => ({ ...current, [productId]: result.data!.id! })); }).catch(() => undefined);
    else if (databaseSyncEnabled && wishlistItemIds[productId]) void apiFetch(`/api/wishlist/items/${wishlistItemIds[productId]}`, { method: "DELETE" }).catch(() => undefined);
    return willAdd;
  }

  function moveCartItemToWishlist(itemId: string) {
    const line = cart.find((item) => item.id === itemId);
    if (!line) return;
    setWishlistIds((current) => [line.productId, ...current.filter((id) => id !== line.productId)]);
    removeFromCart(itemId);
  }

  function moveWishlistToCart(productId: string): boolean {
    const added = addToCart(productId, { openCart: false });
    if (added) setWishlistIds((current) => current.filter((id) => id !== productId));
    return added;
  }

  const addRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewedIds((current) => [productId, ...current.filter((id) => id !== productId)].slice(0, 12));
  }, []);

  return <CommerceContext.Provider value={{ hydrated, cart, cartLines, cartCount, wishlistIds, recentlyViewedIds, cartOpen, setCartOpen, addToCart, updateQuantity, removeFromCart, moveCartItemToWishlist, toggleWishlist, moveWishlistToCart, addRecentlyViewed }}>{children}</CommerceContext.Provider>;
}

type RemoteCart = { items: Array<{ id: string; variantId: string; quantity: number; availableStock: number; unitPrice: number; variant: { color: string | null; size: string | null }; product: { id: string; slug: string; name: string; brand: string; image: string | null } }> };

function remoteCartRecords(cart: RemoteCart): CartItemRecord[] {
  return cart.items.map((item) => { const color = item.variant.color ?? "default"; const size = item.variant.size ?? "One Size"; const snapshot = normalizeProductSnapshot({ id: item.product.id, slug: item.product.slug, name: item.product.name, brand: item.product.brand, category: "Product", price: item.unitPrice, image: item.product.image ?? "/images/storefront/product-shoulder-bag.png", hoverImage: item.product.image ?? "/images/storefront/product-shoulder-bag.png" }); snapshot.stock = item.availableStock; snapshot.colors = [color]; snapshot.sizes = [size]; snapshot.variants = [{ id: item.variantId, sku: "", name: `${color} / ${size}`, color, size, price: item.unitPrice, stock: item.availableStock }]; return { id: item.id, productId: item.product.id, variantId: item.variantId, color, size, quantity: item.quantity, productSnapshot: snapshot }; });
}

function applyRemoteCartResponse(setCart: React.Dispatch<React.SetStateAction<CartItemRecord[]>>) {
  return async (response: Response) => { const result = await response.json() as { success?: boolean; data?: RemoteCart }; if (result.success && result.data) setCart(remoteCartRecords(result.data)); };
}

async function hasAuthenticatedSession(): Promise<boolean> {
  try {
    const response = await apiFetch("/api/auth/session", { cache: "no-store" });
    if (!response.ok) return false;
    const session = await response.json() as { success?: boolean; data?: { user?: { id?: string } } };
    return Boolean(session.success && session.data?.user?.id);
  } catch {
    return false;
  }
}

async function syncCommerceFromDatabase(setCart: React.Dispatch<React.SetStateAction<CartItemRecord[]>>, setWishlistIds: React.Dispatch<React.SetStateAction<string[]>>, setWishlistItemIds: React.Dispatch<React.SetStateAction<Record<string, string>>>) {
  try {
    const [cartResponse, wishlistResponse] = await Promise.all([apiFetch("/api/cart"), apiFetch("/api/wishlist?limit=100")]);
    if (cartResponse.ok) { const cart = await cartResponse.json() as { success?: boolean; data?: RemoteCart }; if (cart.success && cart.data) setCart(remoteCartRecords(cart.data)); }
    if (wishlistResponse.ok) { const wishlist = await wishlistResponse.json() as { success?: boolean; data?: Array<{ id: string; product: { id: string } }> | { items?: Array<{ id: string; product: { id: string } }> } }; const items = Array.isArray(wishlist.data) ? wishlist.data : wishlist.data?.items ?? []; if (wishlist.success) { setWishlistIds(items.map((item) => item.product.id)); setWishlistItemIds(Object.fromEntries(items.map((item) => [item.product.id, item.id]))); } }
  } catch { /* Guest and offline states continue to use the local repository. */ }
}

function normalizeProductSnapshot(product: StoreProduct): CatalogProduct {
  const catalog = product as Partial<CatalogProduct>;
  return { ...product, categorySlug: catalog.categorySlug ?? product.category.toLowerCase().replace(/\s+/g, "-"), brandSlug: catalog.brandSlug ?? product.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-"), conditionType: catalog.conditionType ?? (product.badge === "Preloved" ? "preloved" : "new"), colors: catalog.colors?.length ? catalog.colors : ["default"], sizes: catalog.sizes?.length ? catalog.sizes : ["One Size"], stock: catalog.stock ?? (product.soldOut ? 0 : 20), createdAt: catalog.createdAt ?? new Date().toISOString(), salesCount: catalog.salesCount ?? 0 };
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) throw new Error("useCommerce must be used within CommerceProvider.");
  return context;
}
