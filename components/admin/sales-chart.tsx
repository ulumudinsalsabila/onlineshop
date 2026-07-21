"use client";

import * as m from "motion/react-m";
import { formatIDR } from "@/lib/formatters";

export function SalesChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <div className="mt-7 flex h-64 items-end gap-2 sm:gap-4" role="img" aria-label="Grafik penjualan enam bulan terakhir">{data.map((item) => <div key={item.label} className="group flex h-full min-w-0 flex-1 flex-col justify-end"><div className="mb-2 hidden truncate text-center text-[0.625rem] text-[#77736b] group-hover:block sm:block">{item.value ? formatIDR(item.value) : "—"}</div><div className="relative flex h-[82%] items-end bg-[#ebe6dc]"><m.div initial={{ height: 0 }} animate={{ height: `${Math.max(item.value ? 6 : 0, (item.value / max) * 100)}%` }} transition={{ duration: 0.55, ease: "easeOut" }} className="w-full bg-[#9d895c]" /></div><span className="mt-3 text-center text-[0.625rem] font-semibold tracking-wider uppercase">{item.label}</span></div>)}</div>;
}
