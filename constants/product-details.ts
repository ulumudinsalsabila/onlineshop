import type { CatalogProduct } from "@/types/catalog";
import type { ProductEditorialDetails } from "@/types/commerce";

const prelovedNotes: Record<string, Pick<ProductEditorialDetails, "completeness" | "flaws" | "purchaseYear" | "authenticationStatus">> = {
  p07: { completeness: "Dust bag dan authenticity card", flaws: "Hairline scratches ringan pada hardware; sudut dan interior terawat.", purchaseYear: 2021, authenticationStatus: "Authenticated · 18-point inspection passed" },
  p08: { completeness: "Dust bag pengganti", flaws: "Patina ringan pada handle dan crease alami pada leather.", purchaseYear: 2020, authenticationStatus: "Authenticated · 18-point inspection passed" },
  p09: { completeness: "Full set dengan dust bag", flaws: "Tidak ada kekurangan signifikan yang terlihat.", purchaseYear: 2023, authenticationStatus: "Authenticated · 18-point inspection passed" },
  p16: { completeness: "Shoe box pengganti", flaws: "Tanda pakai ringan pada outsole; upper dalam kondisi sangat baik.", purchaseYear: 2022, authenticationStatus: "Authenticated · material and construction verified" },
  p19: { completeness: "Watch pouch", flaws: "Micro scratches pada case, sesuai pemakaian wajar.", purchaseYear: 2019, authenticationStatus: "Authenticated · movement and serial verified" },
  p23: { completeness: "Watch pouch dan service note", flaws: "Patina lembut pada leather strap.", purchaseYear: 2020, authenticationStatus: "Authenticated · movement and serial verified" },
  p25: { completeness: "Dust bag", flaws: "Patina merata dan sedikit rubbing pada dua sudut bawah.", purchaseYear: 2018, authenticationStatus: "Authenticated · 18-point inspection passed" },
  p26: { completeness: "Dust bag dan mirror", flaws: "Tidak ada kekurangan signifikan; hardware menunjukkan hairline tipis.", purchaseYear: 2022, authenticationStatus: "Authenticated · 18-point inspection passed" },
  p30: { completeness: "Bag only", flaws: "Crease pada sisi belakang dan patina ringan pada handle.", purchaseYear: 2020, authenticationStatus: "Authenticated · 18-point inspection passed" },
};

export function getProductDetails(product: CatalogProduct): ProductEditorialDetails {
  const categoryDescription: Record<string, string> = {
    bags: "Dibentuk dengan proporsi yang tenang dan fungsi yang dipertimbangkan, piece ini dirancang untuk menemani ritme harian tanpa kehilangan karakter.",
    shoes: "Siluet refined dengan konstruksi yang seimbang antara kenyamanan, bentuk, dan detail yang terasa modern.",
    accessories: "Finishing touch yang terkurasi untuk memberi dimensi personal pada wardrobe sehari-hari.",
    men: "Essential modern dengan material berkarakter dan bentuk bersih yang mudah berpindah dari kerja ke akhir pekan.",
  };
  const material = product.categorySlug === "shoes" || product.categorySlug === "bags" || product.categorySlug === "men" ? "Premium leather and considered hardware" : product.name.toLowerCase().includes("scarf") ? "100% silk twill" : "Stainless steel, mineral glass, leather strap";
  return {
    sku: `IV-${product.categorySlug.slice(0, 3).toUpperCase()}-${product.id.toUpperCase()}`,
    description: categoryDescription[product.categorySlug] ?? "Pilihan premium dengan detail yang dibuat untuk bertahan melampaui musim.",
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
