"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import * as m from "motion/react-m";

import { EmptyState } from "@/components/shared/empty-state";

export function CatalogEmptyState({ action }: { action: React.ReactNode }) {
  return <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><EmptyState icon={MagnifyingGlassIcon} title="Belum ada produk yang cocok" description="Coba kurangi filter atau gunakan kata pencarian yang lebih umum. Kami tetap menyiapkan beberapa pilihan untuk Anda di bawah ini." action={action} className="min-h-96" /></m.div>;
}

