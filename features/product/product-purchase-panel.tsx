"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, HeartIcon, MinusIcon, PlusIcon, ShareNetworkIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import * as m from "motion/react-m";
import { toast } from "sonner";

import { Price } from "@/components/shared/price";
import { useCommerce } from "@/components/shared/commerce-provider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { catalogColors } from "@/constants/catalog";
import { clampQuantity } from "@/lib/cart";
import { cn } from "@/lib/utils";
import type { CatalogProduct } from "@/types/catalog";
import type { ProductEditorialDetails } from "@/types/commerce";

export function ProductPurchasePanel({ product, details, shareUrl }: { product: CatalogProduct; details: ProductEditorialDetails; shareUrl: string }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, wishlistIds } = useCommerce();
  const [color, setColor] = useState(product.colors[0] ?? "default");
  const [size, setSize] = useState(product.sizes[0] ?? "default");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const wishlisted = wishlistIds.includes(product.id);
  const unavailable = product.stock < 1 || product.soldOut;
  const discount = product.compareAt && product.compareAt > product.price ? Math.round((1 - product.price / product.compareAt) * 100) : 0;

  function add(openCart = true) {
    const success = addToCart(product.id, { color, size, quantity, openCart, product });
    if (!success) { toast.error("This product is currently unavailable"); return false; }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1100);
    toast.success("Added to shopping bag", { description: `${product.name} · ${color} · ${size}` });
    return true;
  }

  async function shareNative() {
    const data = { title: product.name, text: `Discover ${product.name} by ${product.brand}`, url: shareUrl };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(shareUrl); toast.success("Product link copied"); }
    } catch {
      // The native share dialog can be dismissed without requiring feedback.
    }
  }
  function socialUrl(channel: "whatsapp" | "facebook" | "x" | "telegram") { const url = encodeURIComponent(shareUrl); const text = encodeURIComponent(`Discover ${product.name} by ${product.brand}`); return channel === "whatsapp" ? `https://wa.me/?text=${text}%20${url}` : channel === "facebook" ? `https://www.facebook.com/sharer/sharer.php?u=${url}` : channel === "x" ? `https://twitter.com/intent/tweet?text=${text}&url=${url}` : `https://t.me/share/url?url=${url}&text=${text}`; }
  function openSocial(channel: "whatsapp" | "facebook" | "x" | "telegram") { window.open(socialUrl(channel), "_blank", "noopener,noreferrer"); }
  async function copyLink() { await navigator.clipboard.writeText(shareUrl); toast.success("Product link copied"); }

  return (
    <div className="lg:sticky lg:top-44">
      <div className="flex flex-wrap items-center gap-2">
        {product.badge ? <Badge className="rounded-sm px-2.5 py-1 text-[0.625rem] tracking-wider uppercase">{product.badge}</Badge> : null}
        {product.condition ? <Badge variant="outline" className="rounded-sm px-2.5 py-1 text-[0.625rem] tracking-wider uppercase">Condition · {product.condition}</Badge> : null}
        {discount ? <Badge className="rounded-sm bg-destructive px-2.5 py-1 text-white">-{discount}%</Badge> : null}
      </div>
      <Link href={`/brand/${product.brandSlug}`} className="mt-6 inline-block text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase hover:text-foreground">{product.brand}</Link>
      <h1 className="mt-2 font-serif text-(length:--text-heading-1) leading-[0.94] font-medium">{product.name}</h1>
      <p className="mt-3 text-xs tracking-wider text-muted-foreground uppercase">SKU {details.sku}</p>
      <Price amount={product.price} compareAt={product.compareAt} className="mt-6 text-lg" />
      <p className="mt-6 text-sm leading-7 text-muted-foreground">{details.description}</p>

      <div className="mt-8 border-t border-border pt-6">
        <div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-wider uppercase">Color</span><span className="text-xs capitalize text-muted-foreground">{color}</span></div>
        <div className="mt-3 flex flex-wrap gap-3">{product.colors.map((value) => { const swatch = catalogColors.find((item) => item.value === value)?.swatch; return <button key={value} type="button" aria-label={`Select colour ${value}`} aria-pressed={color === value} onClick={() => setColor(value)} className={cn("grid size-9 place-items-center rounded-full border transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", color === value ? "border-primary ring-2 ring-primary/20 ring-offset-2" : "border-border")}><span className="size-6 rounded-full border border-black/10" style={{ backgroundColor: swatch }} aria-hidden /></button>; })}</div>
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-wider uppercase">Size</span><button type="button" className="text-xs underline underline-offset-4">Size guide</button></div>
        <div className="mt-3 flex flex-wrap gap-2">{product.sizes.map((value) => <button key={value} type="button" aria-pressed={size === value} onClick={() => setSize(value)} className={cn("min-w-12 border px-3 py-2 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring", size === value ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary")}>{value}</button>)}</div>
      </div>

      <div className="mt-7 flex items-end justify-between gap-5 border-y border-border py-5">
        <div><p className="text-xs font-semibold tracking-wider uppercase">Quantity</p><div className="mt-3 flex h-10 items-center border border-border"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((current) => clampQuantity(current - 1, product.stock))} disabled={quantity <= 1 || unavailable} className="grid size-10 place-items-center disabled:opacity-35"><MinusIcon aria-hidden /></button><m.span key={quantity} initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} className="min-w-8 text-center text-sm">{quantity}</m.span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => clampQuantity(current + 1, product.stock))} disabled={quantity >= product.stock || unavailable} className="grid size-10 place-items-center disabled:opacity-35"><PlusIcon aria-hidden /></button></div></div>
        <p className={cn("pb-2 text-xs font-medium", unavailable ? "text-destructive" : product.stock <= 3 ? "text-accent-foreground" : "text-muted-foreground")}>{unavailable ? "Sold out" : product.stock === 1 ? "Only one available" : product.stock <= 3 ? `Only ${product.stock} left` : "In stock"}</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <m.div animate={added ? { scale: [1, 1.025, 1] } : undefined}><Button size="lg" disabled={unavailable} onClick={() => add(true)} className="w-full">{added ? <><CheckCircleIcon weight="fill" aria-hidden /> Added</> : "Add to cart"}</Button></m.div>
        <Button size="lg" variant="outline" disabled={unavailable} onClick={() => { if (add(false)) router.push("/cart"); }}>Buy now</Button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button variant="ghost" onClick={() => { const next = toggleWishlist(product.id); toast(next ? "Added to wishlist" : "Removed from wishlist"); }}><HeartIcon weight={wishlisted ? "fill" : "regular"} className={wishlisted ? "text-destructive" : undefined} aria-hidden /> {wishlisted ? "Wishlisted" : "Wishlist"}</Button>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost"><ShareNetworkIcon aria-hidden /> Share</Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => void shareNative()}>Share from device</DropdownMenuItem><DropdownMenuItem onSelect={() => openSocial("whatsapp")}>WhatsApp</DropdownMenuItem><DropdownMenuItem onSelect={() => openSocial("facebook")}>Facebook</DropdownMenuItem><DropdownMenuItem onSelect={() => openSocial("x")}>X / Twitter</DropdownMenuItem><DropdownMenuItem onSelect={() => openSocial("telegram")}>Telegram</DropdownMenuItem><DropdownMenuItem onSelect={() => void copyLink()}>Copy link</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      </div>

      {product.conditionType === "preloved" ? (
        <div className="mt-7 border border-border bg-secondary/35 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheckIcon size={20} aria-hidden /> Authenticated preloved</div>
          <dl className="mt-4 grid gap-3 text-sm">
            <DetailRow label="Condition" value={product.condition ?? "Professionally inspected"} />
            <DetailRow label="Completeness" value={details.completeness ?? "Product only"} />
            <DetailRow label="Notes" value={details.flaws ?? "No significant flaws noted"} />
            {details.purchaseYear ? <DetailRow label="Purchase year" value={String(details.purchaseYear)} /> : null}
            <DetailRow label="Authentication" value={details.authenticationStatus ?? "Authenticated"} />
          </dl>
        </div>
      ) : null}

      <Accordion type="multiple" defaultValue={["shipping"]} className="mt-7 border-t border-border">
        <AccordionItem value="shipping"><AccordionTrigger className="rounded-none py-4 text-xs font-semibold tracking-wider uppercase hover:no-underline">Shipping</AccordionTrigger><AccordionContent className="pb-5 text-sm leading-6 text-muted-foreground">Tracked delivery is available across Indonesia, with complimentary shipping on orders over Rp2,500,000.</AccordionContent></AccordionItem>
        <AccordionItem value="returns"><AccordionTrigger className="rounded-none py-4 text-xs font-semibold tracking-wider uppercase hover:no-underline">Returns</AccordionTrigger><AccordionContent className="pb-5 text-sm leading-6 text-muted-foreground">New products may be returned within seven days under our policy. Preloved pieces follow the final-inspection policy.</AccordionContent></AccordionItem>
      </Accordion>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="grid grid-cols-[7.5rem_1fr] gap-3"><dt className="text-muted-foreground">{label}</dt><dd>{value}</dd></div>;
}
