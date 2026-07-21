"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

import { contactDetails } from "@/constants/storefront";

export function FloatingActions() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setShowBackToTop(window.scrollY > 500);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <div className="fixed right-4 bottom-4 z-30 flex flex-col items-end gap-2 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {showBackToTop ? (
          <m.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            type="button"
            aria-label="Kembali ke atas"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="grid size-11 place-items-center rounded-full border border-border bg-background text-foreground shadow-soft transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowUpIcon size={19} aria-hidden />
          </m.button>
        ) : null}
      </AnimatePresence>
      <a href={contactDetails.whatsapp} target="_blank" rel="noreferrer" aria-label="Hubungi kami melalui WhatsApp" className="group flex h-12 items-center gap-0 overflow-hidden rounded-full bg-[#315c4a] px-3.5 text-white shadow-lifted transition-[gap,padding,background-color] hover:gap-2 hover:bg-[#284d3d] sm:hover:px-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <WhatsappLogoIcon size={23} weight="fill" aria-hidden />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold tracking-wider uppercase opacity-0 transition-[max-width,opacity] group-hover:max-w-24 group-hover:opacity-100">Need help?</span>
      </a>
    </div>
  );
}
