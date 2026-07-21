"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import * as m from "motion/react-m";

import { EmptyState } from "@/components/shared/empty-state";

export function CatalogEmptyState({ action }: { action: React.ReactNode }) {
  return <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><EmptyState icon={MagnifyingGlassIcon} title="No matching products yet" description="Try removing a filter or using a broader search term. We have included a few recommendations below." action={action} className="min-h-96" /></m.div>;
}
