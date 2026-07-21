"use client";

import * as m from "motion/react-m";

export function CatalogGridTransition({ transitionKey, children }: { transitionKey: string; children: React.ReactNode }) {
  return <m.div key={transitionKey} initial={{ opacity: 0.88, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>{children}</m.div>;
}

