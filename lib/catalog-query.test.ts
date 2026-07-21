import { describe, expect, it } from "vitest";
import { parseCatalogQuery, queryToSearchParams } from "./catalog-query";

describe("product filtering URL state", () => {
  it("menormalisasi filter valid dan menghapus nilai asing", () => { const query = parseCatalogQuery({ category: "bags,unknown", condition: "preloved", availability: "in-stock", sort: "price-asc", page: "2", minPrice: "500000" }); expect(query).toMatchObject({ categories: ["bags"], conditions: ["preloved"], inStock: true, sort: "price-asc", page: 2, minPrice: 500000 }); expect(queryToSearchParams(query).get("category")).toBe("bags"); });
  it("memberikan fallback aman untuk parameter invalid", () => { const query = parseCatalogQuery({ page: "-20", sort: "drop-table", discount: "999", q: "x".repeat(200) }); expect(query.page).toBe(1); expect(query.sort).toBe("newest"); expect(query.minDiscount).toBe(80); expect(query.q).toHaveLength(80); });
});
