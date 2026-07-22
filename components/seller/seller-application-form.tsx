"use client";

import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { z } from "zod";
import { sellerApplicationSchema } from "@/lib/seller/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Values = z.input<typeof sellerApplicationSchema>;
export function SellerApplicationForm() { const router = useRouter(); const [busy, setBusy] = useState(false); const form = useForm<Values>({ resolver: zodResolver(sellerApplicationSchema), defaultValues: { displayName: "", phone: "", identityNumber: "", bio: "", applicationNote: "", bankName: "", bankAccountName: "", bankAccountNumber: "" } }); async function submit(values: Values) { setBusy(true); try { const response = await apiFetch("/api/seller/application", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); const result = await response.json() as { success?: boolean; error?: { message?: string } }; if (!result.success) throw new Error(result.error?.message); toast.success("Pengajuan seller dikirim."); router.push("/seller/application"); router.refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Pengajuan gagal."); } finally { setBusy(false); } } return <Form {...form}><form onSubmit={form.handleSubmit(submit)} className="grid gap-5 sm:grid-cols-2">{([ ["displayName", "Nama seller"], ["phone", "Nomor telepon"], ["identityNumber", "Nomor identitas"], ["bankName", "Bank"], ["bankAccountName", "Nama pemilik rekening"], ["bankAccountNumber", "Nomor rekening"] ] as const).map(([name, label]) => <FormField key={name} control={form.control} name={name} render={({ field }) => <FormItem><FormLabel>{label}</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>} />)}{([ ["bio", "Tentang Anda"], ["applicationNote", "Mengapa ingin titip jual?"] ] as const).map(([name, label]) => <FormField key={name} control={form.control} name={name} render={({ field }) => <FormItem className="sm:col-span-2"><FormLabel>{label}</FormLabel><FormControl><textarea {...field} value={field.value ?? ""} className="min-h-28 w-full rounded-md border border-input bg-white p-3 text-sm" /></FormControl><FormMessage /></FormItem>} />)}<Button size="lg" disabled={busy} className="sm:col-span-2">{busy && <SpinnerGapIcon className="animate-spin" aria-hidden />}Kirim pengajuan</Button></form></Form>; }
