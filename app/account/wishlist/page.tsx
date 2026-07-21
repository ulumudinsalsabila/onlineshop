import { AccountHeading } from "@/components/account/account-heading";
import { ProductCard } from "@/features/home/product-card";
import { requireUser } from "@/lib/auth-guard";
import { productWithRelations, toCatalogProduct } from "@/lib/data/product-dto";
import { prisma } from "@/lib/prisma";

export default async function AccountWishlistPage() { const user = await requireUser(); const wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id }, include: { items: { orderBy: { createdAt: "desc" }, include: { product: { include: productWithRelations } } } } }); const products = wishlist?.items.map((item) => toCatalogProduct(item.product)) ?? []; return <div><AccountHeading eyebrow="Saved pieces" title="Wishlist" description="Pilihan yang Anda simpan tersinkron dengan akun ini." />{products.length ? <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <p className="mt-12 border-y border-border py-16 text-center text-sm text-muted-foreground">Wishlist Anda masih kosong.</p>}</div>; }
