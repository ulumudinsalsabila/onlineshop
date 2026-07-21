"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { catalogProducts } from "@/constants/catalog";
import { clampQuantity, createCartItemId, resolveCartLines } from "@/lib/cart";
import { LocalStorageCommerceRepository } from "@/lib/commerce-repository";
import type { CartItemRecord, PersistedCommerceState } from "@/types/commerce";

interface CommerceContextValue {
  hydrated: boolean;
  cart: CartItemRecord[];
  cartLines: ReturnType<typeof resolveCartLines>;
  cartCount: number;
  wishlistIds: string[];
  recentlyViewedIds: string[];
  cartOpen: boolean;
  setCartOpen(open: boolean): void;
  addToCart(productId: string, options?: { color?: string; size?: string; quantity?: number; openCart?: boolean }): boolean;
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

  useEffect(() => {
    let active = true;
    void repository.load().then((state) => {
      if (!active) return;
      setCart(state.cart);
      setWishlistIds(state.wishlistIds);
      setRecentlyViewedIds(state.recentlyViewedIds);
      setHydrated(true);
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

  function addToCart(productId: string, options: { color?: string; size?: string; quantity?: number; openCart?: boolean } = {}): boolean {
    const product = catalogProducts.find((item) => item.id === productId);
    if (!product || product.stock < 1 || product.soldOut) return false;
    const color = options.color && product.colors.includes(options.color) ? options.color : (product.colors[0] ?? "default");
    const size = options.size && product.sizes.includes(options.size) ? options.size : (product.sizes[0] ?? "default");
    const quantity = clampQuantity(options.quantity ?? 1, product.stock);
    const id = createCartItemId(productId, color, size);
    setCart((current) => {
      const existing = current.find((item) => item.id === id);
      return existing
        ? current.map((item) => item.id === id ? { ...item, quantity: clampQuantity(item.quantity + quantity, product.stock) } : item)
        : [...current, { id, productId, color, size, quantity }];
    });
    if (options.openCart !== false) setCartOpen(true);
    return true;
  }

  function updateQuantity(itemId: string, quantity: number) {
    setCart((current) => current.flatMap((item) => {
      if (item.id !== itemId) return [item];
      if (quantity <= 0) return [];
      const product = catalogProducts.find((entry) => entry.id === item.productId);
      return product && product.stock > 0 ? [{ ...item, quantity: clampQuantity(quantity, product.stock) }] : [item];
    }));
  }

  function removeFromCart(itemId: string) {
    setCart((current) => current.filter((item) => item.id !== itemId));
  }

  function toggleWishlist(productId: string): boolean {
    const willAdd = !wishlistIds.includes(productId);
    setWishlistIds((current) => willAdd ? [productId, ...current.filter((id) => id !== productId)] : current.filter((id) => id !== productId));
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

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) throw new Error("useCommerce harus digunakan di dalam CommerceProvider.");
  return context;
}
