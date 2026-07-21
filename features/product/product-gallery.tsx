"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowsOutSimpleIcon } from "@phosphor-icons/react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

import type { CatalogProduct } from "@/types/catalog";

export function ProductGallery({ product }: { product: CatalogProduct }) {
  const images = [product.image, product.hoverImage];
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState("50% 50%");

  return (
    <div className="min-w-0">
      <div className="-mx-(--container-gutter) flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden" aria-label={`${product.name} gallery`}>
        {images.map((image, index) => <div key={image} className="relative aspect-[4/5] w-[92vw] shrink-0 snap-center bg-secondary"><Image src={image} alt={`${product.name}, view ${index + 1}`} width={1254} height={1254} priority={index === 0} sizes="92vw" className="absolute inset-0 size-full object-cover" /></div>)}
      </div>

      <div className="hidden grid-cols-[5.5rem_minmax(0,1fr)] gap-4 md:grid">
        <div className="space-y-3" aria-label="Select image">
          {images.map((image, index) => <button key={image} type="button" onClick={() => setActive(index)} aria-label={`Show image ${index + 1}`} aria-pressed={active === index} className="relative aspect-[4/5] w-full overflow-hidden bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><Image src={image} alt="" width={1254} height={1254} sizes="88px" className="absolute inset-0 size-full object-cover" /><span className={`absolute inset-0 border-2 transition-colors ${active === index ? "border-primary" : "border-transparent"}`} /></button>)}
        </div>
        <div
          className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-secondary"
          onPointerMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setOrigin(`${((event.clientX - rect.left) / rect.width) * 100}% ${((event.clientY - rect.top) / rect.height) * 100}%`); }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <m.div key={images[active]} initial={{ opacity: 0.25 }} animate={{ opacity: 1 }} exit={{ opacity: 0.2 }} className="absolute inset-0">
              <Image src={images[active]} alt={`${product.name}, view ${active + 1}`} width={1254} height={1254} priority={active === 0} sizes="(max-width: 1200px) 55vw, 45vw" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.65]" style={{ transformOrigin: origin }} />
            </m.div>
          </AnimatePresence>
          <span className="pointer-events-none absolute right-4 bottom-4 flex items-center gap-2 bg-background/90 px-3 py-2 text-[0.625rem] font-semibold tracking-wider uppercase backdrop-blur-sm"><ArrowsOutSimpleIcon aria-hidden /> Hover to zoom</span>
        </div>
      </div>
    </div>
  );
}
