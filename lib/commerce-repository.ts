"use client";

import type { CartItemRecord, CommerceRepository, PersistedCommerceState } from "@/types/commerce";

const storageKey = "maison-elan-commerce-v1";
const emptyState: PersistedCommerceState = { version: 1, cart: [], wishlistIds: [], recentlyViewedIds: [] };

function isCartItem(value: unknown): value is CartItemRecord {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItemRecord>;
  return typeof item.id === "string" && typeof item.productId === "string" && typeof item.color === "string" && typeof item.size === "string" && typeof item.quantity === "number";
}

function sanitize(value: unknown): PersistedCommerceState {
  if (!value || typeof value !== "object") return emptyState;
  const state = value as Partial<PersistedCommerceState>;
  return {
    version: 1,
    cart: Array.isArray(state.cart) ? state.cart.filter(isCartItem).slice(0, 50) : [],
    wishlistIds: Array.isArray(state.wishlistIds) ? state.wishlistIds.filter((item): item is string => typeof item === "string").slice(0, 100) : [],
    recentlyViewedIds: Array.isArray(state.recentlyViewedIds) ? state.recentlyViewedIds.filter((item): item is string => typeof item === "string").slice(0, 12) : [],
  };
}

export class LocalStorageCommerceRepository implements CommerceRepository {
  async load(): Promise<PersistedCommerceState> {
    try {
      return sanitize(JSON.parse(localStorage.getItem(storageKey) ?? "null"));
    } catch {
      return emptyState;
    }
  }

  async save(state: PersistedCommerceState): Promise<void> {
    localStorage.setItem(storageKey, JSON.stringify(sanitize(state)));
  }

  async clear(): Promise<void> {
    localStorage.removeItem(storageKey);
  }
}

