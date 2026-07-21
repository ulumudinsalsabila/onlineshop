"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartIcon, MinusIcon, PlusIcon, ShoppingBagIcon, TagIcon, TrashIcon, TruckIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { toast } from "sonner";

import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { Price } from "@/components/shared/price";
import { StorefrontBreadcrumb } from "@/components/shared/storefront-breadcrumb";
import { useCommerce } from "@/components/shared/commerce-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateCartTotals, VOUCHER_CODE } from "@/lib/cart";
import { formatIDR } from "@/lib/formatters";

export function CartPage() {
  const { hydrated, cartLines, cartCount, updateQuantity, removeFromCart, moveCartItemToWishlist } = useCommerce();
  const [voucherInput, setVoucherInput] = useState("");
  const [voucher, setVoucher] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [shippingEstimate, setShippingEstimate] = useState("");
  const totals = calculateCartTotals(cartLines, voucher);
  const hasUnavailable = cartLines.some((line) => !line.canCheckout);

  if (!hydrated) return <CartPageLoading />;

  return (
    <Container className="py-10 sm:py-14">
      <StorefrontBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Shopping Bag" }]} />
      <div className="mt-8 flex items-end justify-between gap-5"><div><p className="text-[0.625rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">Your selection</p><h1 className="mt-2 font-serif text-(length:--text-heading-1)">Shopping bag</h1></div><p className="text-sm text-muted-foreground">{cartCount} item</p></div>

      {!cartLines.length ? <EmptyState icon={ShoppingBagIcon} className="mt-10 min-h-[28rem]" title="Your bag is empty" description="Koleksi kami siap dijelajahi ketika Anda menemukan piece berikutnya." action={<Button asChild><Link href="/products">Explore products</Link></Button>} /> : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_23rem] xl:gap-16">
          <div>
            <AnimatePresence initial={false}>
              {cartLines.map((line) => (
                <m.article key={line.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -18, height: 0 }} className="grid grid-cols-[7.5rem_1fr] gap-4 border-t border-border py-6 first:border-t-0 first:pt-0 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <Link href={`/products/${line.product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-secondary"><Image src={line.product.image} alt={line.product.name} width={1254} height={1254} sizes="160px" className="absolute inset-0 size-full object-cover" /></Link>
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div><p className="text-[0.625rem] font-semibold tracking-wider text-muted-foreground uppercase">{line.product.brand}</p><Link href={`/products/${line.product.slug}`} className="mt-1 block font-serif text-xl leading-tight sm:text-2xl">{line.product.name}</Link><p className="mt-2 text-xs capitalize text-muted-foreground">{line.color} · {line.size}</p></div>
                      <Price amount={line.lineTotal} className="hidden shrink-0 text-sm sm:flex" />
                    </div>
                    {!line.canCheckout ? <p className="mt-3 flex items-center gap-1.5 text-xs text-destructive"><WarningCircleIcon aria-hidden /> Produk sold out atau stok berubah. Hapus item untuk melanjutkan checkout.</p> : null}
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-5">
                      <div className="flex h-10 items-center border border-border"><button type="button" aria-label={`Kurangi quantity ${line.product.name}`} onClick={() => updateQuantity(line.id, line.quantity - 1)} className="grid size-10 place-items-center"><MinusIcon aria-hidden /></button><m.span key={line.quantity} initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} className="min-w-8 text-center text-sm">{line.quantity}</m.span><button type="button" aria-label={`Tambah quantity ${line.product.name}`} disabled={line.quantity >= line.availableStock} onClick={() => updateQuantity(line.id, line.quantity + 1)} className="grid size-10 place-items-center disabled:opacity-35"><PlusIcon aria-hidden /></button></div>
                      <Price amount={line.lineTotal} className="text-sm sm:hidden" />
                      <div className="flex gap-4 text-xs"><button type="button" onClick={() => { moveCartItemToWishlist(line.id); toast.success("Dipindahkan ke wishlist"); }} className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"><HeartIcon aria-hidden /> Move to wishlist</button><button type="button" onClick={() => removeFromCart(line.id)} className="inline-flex items-center gap-1.5 text-destructive underline-offset-4 hover:underline"><TrashIcon aria-hidden /> Remove</button></div>
                    </div>
                  </div>
                </m.article>
              ))}
            </AnimatePresence>
          </div>

          <aside className="h-fit border border-border bg-secondary/25 p-6 lg:sticky lg:top-44" aria-label="Ringkasan belanja">
            <h2 className="font-serif text-2xl">Order summary</h2>
            <div className="mt-6 border-b border-border pb-6">
              <Label htmlFor="voucher" className="text-[0.625rem] tracking-wider uppercase">Voucher</Label>
              <div className="mt-2 flex gap-2"><Input id="voucher" value={voucherInput} onChange={(event) => setVoucherInput(event.target.value)} placeholder="Try ELAN10" className="bg-background" /><Button variant="outline" onClick={() => { const normalized = voucherInput.trim().toUpperCase(); setVoucher(normalized); toast(normalized === VOUCHER_CODE ? "Voucher applied" : "Voucher tidak dikenali"); }}><TagIcon aria-hidden /> Apply</Button></div>
              {voucher && !totals.voucherApplied ? <p className="mt-2 text-xs text-destructive">Kode voucher tidak valid.</p> : null}
            </div>
            <div className="border-b border-border py-6">
              <Label htmlFor="postal-code" className="text-[0.625rem] tracking-wider uppercase">Estimate shipping</Label>
              <div className="mt-2 flex gap-2"><Input id="postal-code" inputMode="numeric" value={postalCode} onChange={(event) => setPostalCode(event.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="Kode pos" className="bg-background" /><Button variant="outline" onClick={() => setShippingEstimate(postalCode.length === 5 ? "Estimasi tiba 2–4 hari kerja" : "Masukkan 5 digit kode pos")}>Check</Button></div>
              {shippingEstimate ? <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><TruckIcon aria-hidden /> {shippingEstimate}</p> : null}
            </div>
            <dl className="space-y-3 py-6 text-sm"><SummaryRow label="Subtotal" value={formatIDR(totals.subtotal)} /><SummaryRow label="Discount" value={totals.discount ? `−${formatIDR(totals.discount)}` : formatIDR(0)} accent={totals.discount > 0} /><SummaryRow label="Estimated shipping" value={totals.shipping ? formatIDR(totals.shipping) : "Complimentary"} /><div className="flex items-center justify-between border-t border-border pt-4 font-semibold"><dt>Grand total</dt><dd className="font-serif text-xl">{formatIDR(totals.grandTotal)}</dd></div></dl>
            {hasUnavailable ? <div className="mb-4 flex gap-2 bg-destructive/8 p-3 text-xs leading-5 text-destructive"><WarningCircleIcon className="mt-0.5 shrink-0" aria-hidden /> Hapus item yang tidak tersedia sebelum checkout.</div> : null}
            {hasUnavailable ? <Button size="lg" className="w-full" disabled>Checkout unavailable</Button> : <Button asChild size="lg" className="w-full"><Link href="/checkout" prefetch={false}>Proceed to checkout</Link></Button>}
            <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">Total dihitung ulang dari harga dan stok katalog saat ini.</p>
          </aside>
        </div>
      )}
    </Container>
  );
}

function SummaryRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) { return <div className="flex items-center justify-between"><dt className="text-muted-foreground">{label}</dt><dd className={accent ? "text-accent-foreground" : undefined}>{value}</dd></div>; }

function CartPageLoading() { return <Container className="py-14"><Skeleton className="h-4 w-48" /><Skeleton className="mt-8 h-14 w-72" /><div className="mt-10 grid gap-12 lg:grid-cols-[1fr_23rem]"><div className="space-y-6">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-52 rounded-none" />)}</div><Skeleton className="h-[32rem] rounded-none" /></div></Container>; }
