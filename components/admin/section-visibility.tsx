"use client";

import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { FloppyDiskIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Section = { id: string; key: string; title: string; isVisible: boolean; sortOrder: number };
export function SectionVisibility({ initial }: { initial: Section[] }) {
  const [sections, setSections] = useState(initial); const [busy, setBusy] = useState(false);
  async function save() { setBusy(true); try { const response = await apiFetch("/api/admin/content/sections", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sections }) }); const result = await response.json() as { success?: boolean; error?: { message?: string } }; if (!result.success) throw new Error(result.error?.message); toast.success("Homepage visibility saved."); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save the changes."); } finally { setBusy(false); } }
  return <section><div className="mb-4 flex items-end justify-between"><div><h2 className="text-base font-semibold">Homepage sections</h2><p className="mt-1 text-xs text-muted-foreground">Smaller sort order appears first.</p></div><Button onClick={() => void save()} disabled={busy}>{busy ? <SpinnerGapIcon className="animate-spin" aria-hidden /> : <FloppyDiskIcon aria-hidden />}Save</Button></div><div className="overflow-hidden rounded-lg border border-[#ded8cd] bg-white"><Table><TableHeader><TableRow><TableHead>Visible</TableHead><TableHead>Key</TableHead><TableHead>Section</TableHead><TableHead className="w-32">Sort order</TableHead></TableRow></TableHeader><TableBody>{sections.map((section, index) => <TableRow key={section.id}><TableCell><Checkbox checked={section.isVisible} onCheckedChange={(checked) => setSections((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, isVisible: Boolean(checked) } : item))} aria-label={`Tampilkan ${section.title}`} /></TableCell><TableCell className="font-mono text-xs text-muted-foreground">{section.key}</TableCell><TableCell className="font-medium">{section.title}</TableCell><TableCell><input aria-label={`Urutan ${section.title}`} type="number" min={0} value={section.sortOrder} onChange={(event) => setSections((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, sortOrder: Number(event.target.value) } : item))} className="h-9 w-20 rounded-md border border-input bg-white px-2 text-sm" /></TableCell></TableRow>)}</TableBody></Table></div></section>;
}
