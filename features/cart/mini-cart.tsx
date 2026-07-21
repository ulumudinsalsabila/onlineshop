"use client";

import Image from "next/image";
import Link from "next/link";
import { MinusIcon, PlusIcon, ShoppingBagIcon, TrashIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

import { Price } from "@/components/shared/price";
import { useCommerce } from "@/components/shared/commerce-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { calculateCartTotals } from "@/lib/cart";
import { formatIDR } from "@/lib/formatters";

export function MiniCart() {
  const { cartOpen, setCartOpen, cartLines, cartCount, updateQuantity, removeFromCart, hydrated } = useCommerce();
  const totals = calculateCartTotals(cartLines);
  const hasUnavailable = cartLines.some((line) => !line.canCheckout);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="w-[min(94vw,29rem)] gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-5 pr-14">
          <SheetTitle className="font-serif text-2xl">Your shopping bag</SheetTitle>
          <SheetDescription>{hydrated ? `${cartCount} item dalam bag` : "Memuat shopping bag…"}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {hydrated && !cartLines.length ? (
            <div className="flex min-h-80 flex-col items-center justify-center text-center">
              <span className="grid size-12 place-items-center rounded-full bg-secondary"><ShoppingBagIcon size={23} weight="light" aria-hidden /></span>
              <h3 className="mt-5 font-serif text-2xl">Your bag is waiting</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">Temukan piece yang terasa tepat, lalu simpan di sini sebelum checkout.</p>
              <Button asChild variant="outline" className="mt-6"><Link href="/products" onClick={() => setCartOpen(false)}>Explore products</Link></Button>
            </div>
          ) : null}

          <AnimatePresence initial={false}>
            {cartLines.map((line) => (
              <m.article key={line.id} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18, height: 0 }} className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-border py-5 first:pt-0">
                <Link href={`/products/${line.product.slug}`} onClick={() => setCartOpen(false)} className="relative aspect-[4/5] overflow-hidden bg-secondary">
                  <Image src={line.product.image} alt={line.product.name} width={1254} height={1254} sizes="104px" className="absolute inset-0 size-full object-cover" />
                </Link>
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-[0.625rem] font-semibold tracking-wider text-muted-foreground uppercase">{line.product.brand}</p><Link href={`/products/${line.product.slug}`} onClick={() => setCartOpen(false)} className="mt-1 block font-serif text-lg leading-tight">{line.product.name}</Link></div>
                    <button type="button" onClick={() => removeFromCart(line.id)} aria-label={`Hapus ${line.product.name}`} className="grid size-8 shrink-0 place-items-center text-muted-foreground hover:text-destructive focus-visible:outline-2 focus-visible:outline-ring"><TrashIcon aria-hidden /></button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{line.color} · {line.size}</p>
                  {!line.canCheckout ? <p className="mt-2 flex items-center gap-1 text-xs text-destructive"><WarningCircleIcon aria-hidden /> Stok tidak tersedia</p> : null}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex h-8 items-center border border-border">
                      <button type="button" aria-label={`Kurangi quantity ${line.product.name}`} onClick={() => updateQuantity(line.id, line.quantity - 1)} className="grid size-8 place-items-center"><MinusIcon aria-hidden /></button>
                      <m.span key={line.quantity} initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} className="min-w-7 text-center text-xs">{line.quantity}</m.span>
                      <button type="button" aria-label={`Tambah quantity ${line.product.name}`} disabled={line.quantity >= line.availableStock} onClick={() => updateQuantity(line.id, line.quantity + 1)} className="grid size-8 place-items-center disabled:opacity-35"><PlusIcon aria-hidden /></button>
                    </div>
                    <Price amount={line.lineTotal} className="text-sm" />
                  </div>
                </div>
              </m.article>
            ))}
          </AnimatePresence>
        </div>

        {cartLines.length ? (
          <SheetFooter className="border-t border-border bg-secondary/25 p-5">
            <div className="mb-2 flex items-center justify-between"><span className="text-sm text-muted-foreground">Subtotal</span><strong className="font-serif text-xl font-medium">{formatIDR(totals.subtotal)}</strong></div>
            <p className="mb-3 text-xs leading-5 text-muted-foreground">Ongkir dan voucher dihitung pada shopping cart.</p>
            <Button asChild size="lg"><Link href="/cart" onClick={() => setCartOpen(false)}>View shopping bag</Link></Button>
            {hasUnavailable ? <Button size="lg" disabled>Checkout unavailable</Button> : <Button asChild variant="outline" size="lg"><Link href="/checkout" prefetch={false} onClick={() => setCartOpen(false)}>Checkout</Link></Button>}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
