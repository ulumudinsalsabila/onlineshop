import type { CatalogProduct } from "@/types/catalog";
import type { ProductEditorialDetails } from "@/types/commerce";

const prelovedNotes: Record<string, Pick<ProductEditorialDetails, "completeness" | "flaws" | "purchaseYear" | "authenticationStatus">> = {
  p07: { completeness: "Dust bag and authenticity card", flaws: "Light hairline scratches on the hardware; corners and interior remain well cared for.", purchaseYear: 2021, authenticationStatus: "Authenticated · 18-point inspection passed" },
  p08: { completeness: "Replacement dust bag", flaws: "Light patina on the handle and natural creasing in the leather.", purchaseYear: 2020, authenticationStatus: "Authenticated · 18-point inspection passed" },
  p09: { completeness: "Full set with dust bag", flaws: "No significant visible imperfections.", purchaseYear: 2023, authenticationStatus: "Authenticated · 18-point inspection passed" },
  p16: { completeness: "Replacement shoe box", flaws: "Light wear on the outsole; the upper remains in excellent condition.", purchaseYear: 2022, authenticationStatus: "Authenticated · material and construction verified" },
  p19: { completeness: "Watch pouch", flaws: "Micro-scratches on the case consistent with normal wear.", purchaseYear: 2019, authenticationStatus: "Authenticated · movement and serial verified" },
  p23: { completeness: "Watch pouch and service note", flaws: "Soft patina on the leather strap.", purchaseYear: 2020, authenticationStatus: "Authenticated · movement and serial verified" },
  p25: { completeness: "Dust bag", flaws: "Even patina with light rubbing on two lower corners.", purchaseYear: 2018, authenticationStatus: "Authenticated · 18-point inspection passed" },
  p26: { completeness: "Dust bag and mirror", flaws: "No significant imperfections; fine hairlines are visible on the hardware.", purchaseYear: 2022, authenticationStatus: "Authenticated · 18-point inspection passed" },
  p30: { completeness: "Bag only", flaws: "Creasing on the back and light patina on the handle.", purchaseYear: 2020, authenticationStatus: "Authenticated · 18-point inspection passed" },
};

export function getProductDetails(product: CatalogProduct): ProductEditorialDetails {
  const categoryDescription: Record<string, string> = {
    bags: "Shaped with quiet proportions and considered function, this piece is designed for the everyday without losing character.",
    shoes: "A refined silhouette with construction that balances comfort, form, and modern detail.",
    accessories: "A considered finishing touch that brings personal dimension to the everyday wardrobe.",
    men: "A modern essential with expressive material and clean lines, designed to move easily from work to weekend.",
  };
  const material = product.categorySlug === "shoes" || product.categorySlug === "bags" || product.categorySlug === "men" ? "Premium leather and considered hardware" : product.name.toLowerCase().includes("scarf") ? "100% silk twill" : "Stainless steel, mineral glass, leather strap";
  return {
    sku: `IV-${product.categorySlug.slice(0, 3).toUpperCase()}-${product.id.toUpperCase()}`,
    description: categoryDescription[product.categorySlug] ?? "A premium choice with details designed to last beyond the season.",
    specifications: [
      { label: "Material", value: material },
      { label: "Color", value: product.colors.map(titleCase).join(", ") },
      { label: "Size", value: product.sizes.join(", ") },
      { label: "Origin", value: "Responsibly sourced · Crafted in small batches" },
    ],
    ...(product.conditionType === "preloved" ? prelovedNotes[product.id] : {}),
  };
}

function titleCase(value: string) {
  return value.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}
