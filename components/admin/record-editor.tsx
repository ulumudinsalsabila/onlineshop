"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PencilSimpleIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type RecordField = { name: string; label: string; type?: "text" | "number" | "checkbox" | "select"; options?: string[] };
export function RecordEditor({ title, endpoint, fields, initial }: { title: string; endpoint: string; fields: RecordField[]; initial: Record<string, string | number | boolean | null> }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [values, setValues] = useState(initial);
  async function save() { setBusy(true); try { const response = await apiFetch(endpoint, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); const result = await response.json() as { success?: boolean; error?: { message?: string } }; if (!response.ok || !result.success) throw new Error(result.error?.message ?? "Could not save the data."); toast.success("Data saved successfully."); setOpen(false); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save the data."); } finally { setBusy(false); } }
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button size="icon-sm" variant="outline" aria-label={`Edit ${title}`}><PencilSimpleIcon aria-hidden /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Edit {title}</DialogTitle><DialogDescription>Changes are saved directly to the database through the backend API.</DialogDescription></DialogHeader><div className="grid gap-4 sm:grid-cols-2">{fields.map((field) => <div key={field.name} className={field.type === "checkbox" ? "flex items-center gap-3 pt-7" : ""}>{field.type === "checkbox" ? <><Checkbox id={`${title}-${field.name}`} checked={Boolean(values[field.name])} onCheckedChange={(checked) => setValues((current) => ({ ...current, [field.name]: Boolean(checked) }))} /><Label htmlFor={`${title}-${field.name}`}>{field.label}</Label></> : <><Label htmlFor={`${title}-${field.name}`}>{field.label}</Label>{field.type === "select" ? <select id={`${title}-${field.name}`} value={String(values[field.name] ?? "")} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} className="mt-2 h-11 w-full rounded-md border border-input bg-white px-3 text-sm">{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : <Input id={`${title}-${field.name}`} type={field.type ?? "text"} value={String(values[field.name] ?? "")} onChange={(event) => setValues((current) => ({ ...current, [field.name]: field.type === "number" ? Number(event.target.value) : event.target.value }))} className="mt-2" />}</>}</div>)}</div><Button disabled={busy} onClick={() => void save()}>{busy && <SpinnerGapIcon className="animate-spin" aria-hidden />}Save</Button></DialogContent></Dialog>;
}
