"use client";

import { usePathname } from "next/navigation";
import * as m from "motion/react-m";

export function PageTransitionIndicator() {
  const pathname = usePathname();
  return (
    <m.div
      key={pathname}
      aria-hidden
      initial={{ scaleX: 0, opacity: 1 }}
      animate={{ scaleX: [0, 0.82, 1], opacity: [1, 1, 0] }}
      transition={{ duration: 0.6, times: [0, 0.75, 1] }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 origin-left bg-accent"
    />
  );
}
