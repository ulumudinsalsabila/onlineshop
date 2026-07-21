"use client";

import type { ComponentProps } from "react";
import * as m from "motion/react-m";

import { fadeUp } from "@/lib/motion";

export function MotionSection({ children, ...props }: ComponentProps<typeof m.section>) {
  return (
    <m.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} {...props}>
      {children}
    </m.section>
  );
}
