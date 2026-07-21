import "server-only";
import { cache } from "react";

import { listProducts } from "@/lib/data/products";
import type { CatalogPreset, CatalogQuery, CatalogResponse } from "@/types/catalog";

export async function getCatalogProducts(query: CatalogQuery, preset: CatalogPreset = {}): Promise<CatalogResponse> {
  return getCatalogProductsCached(JSON.stringify(query), JSON.stringify(preset));
}

const getCatalogProductsCached = cache(async (query: string, preset: string) => listProducts(JSON.parse(query) as CatalogQuery, JSON.parse(preset) as CatalogPreset));
