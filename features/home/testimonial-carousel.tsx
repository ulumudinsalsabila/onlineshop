"use client";

import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, StarIcon } from "@phosphor-icons/react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

import { IconButton } from "@/components/shared/icon-button";
type Testimonial = { id: string; name: string; location: string | null; quote: string; rating: number };

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0);
  const testimonial = testimonials[active];
  if (!testimonial) return null;

  function move(direction: 1 | -1) {
    setActive((current) => (current + direction + testimonials.length) % testimonials.length);
  }

  return (
    <div className="mx-auto max-w-4xl text-center">
      <div className="mb-8 flex justify-center gap-1 text-accent-foreground" aria-label={`${testimonial.rating} out of 5 stars`}>
        {Array.from({ length: testimonial.rating }, (_, index) => <StarIcon key={index} size={17} weight="fill" aria-hidden />)}
      </div>
      <div className="min-h-56 sm:min-h-48">
        <AnimatePresence mode="wait">
          <m.figure key={testimonial.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>
            <blockquote className="font-serif text-3xl leading-[1.15] text-balance sm:text-4xl">“{testimonial.quote}”</blockquote>
            <figcaption className="mt-7 text-xs font-semibold tracking-[0.14em] uppercase">{testimonial.name} <span className="text-muted-foreground">· {testimonial.location}</span></figcaption>
          </m.figure>
        </AnimatePresence>
      </div>
      <div className="mt-8 flex items-center justify-center gap-4">
        <IconButton aria-label="Testimoni sebelumnya" variant="outline" onClick={() => move(-1)}><ArrowLeftIcon aria-hidden className="text-primary" /></IconButton>
        <span className="min-w-16 text-xs tabular-nums text-muted-foreground">{String(active + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}</span>
        <IconButton aria-label="Testimoni berikutnya" variant="outline" onClick={() => move(1)}><ArrowRightIcon aria-hidden className="text-primary" /></IconButton>
      </div>
    </div>
  );
}
