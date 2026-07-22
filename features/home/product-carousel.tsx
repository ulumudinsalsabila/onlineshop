"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import * as m from "motion/react-m";

import { IconButton } from "@/components/shared/icon-button";
import { fadeUp, staggerChildren } from "@/lib/motion";
import type { StoreProduct } from "@/types/storefront";

import { ProductCard } from "./product-card";

export function ProductCarousel({ products, label }: { products: StoreProduct[]; label: string }) {
  const railRef = useRef<HTMLUListElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(true);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const updateControls = () => {
      setCanGoBack(rail.scrollLeft > 4);
      setCanGoForward(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
    };
    updateControls();
    rail.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    return () => {
      rail.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [products.length]);

  function move(direction: 1 | -1) {
    railRef.current?.scrollBy({ left: direction * railRef.current.clientWidth * 0.82, behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-5 flex justify-end gap-2">
        <IconButton aria-label={`Previous in ${label}`} variant="outline" onClick={() => move(-1)} disabled={!canGoBack}><ArrowLeftIcon aria-hidden /></IconButton>
        <IconButton aria-label={`Berikutnya pada ${label}`} variant="outline" onClick={() => move(1)} disabled={!canGoForward}><ArrowRightIcon aria-hidden /></IconButton>
      </div>
      <m.ul
        ref={railRef}
        aria-label={label}
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        className="-mx-(--container-gutter) flex snap-x snap-mandatory gap-4 overflow-x-auto px-(--container-gutter) pb-4 [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <m.li key={product.id} variants={fadeUp} className="w-[78vw] max-w-[22rem] shrink-0 snap-start sm:w-[42vw] lg:w-[calc((100%_-_3.75rem)/4)] lg:max-w-none">
            <ProductCard product={product} />
          </m.li>
        ))}
      </m.ul>
    </div>
  );
}
