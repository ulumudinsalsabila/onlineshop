"use client";

import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { z } from "zod";
import { sellerProfileSchema } from "@/lib/seller/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
type Values = z.input<typeof sellerProfileSchema>;
export function SellerProfileForm({ initial }: { initial: Values }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues: initial,
  });
  async function submit(values: Values) {
    setBusy(true);
    try {
      const response = await apiFetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: { message?: string };
      };
      if (!result.success) throw new Error(result.error?.message);
      toast.success("Profile updated.");
      form.reset(values);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the profile.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="grid gap-5 border border-[#ddd5c7] bg-[#faf8f3] p-5 sm:grid-cols-2 sm:p-7">
        {(
          [
            ["displayName", "Display name"],
            ["phone", "Phone"],
            ["bankName", "Bank"],
            ["bankAccountName", "Account holder"],
            ["bankAccountNumber", "Account number"],
          ] as const
        ).map(([name, label]) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{label}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} className="min-h-28 w-full rounded-md border border-input bg-white p-3 text-sm" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={busy || !form.formState.isDirty} className="sm:col-span-2">
          {busy && <SpinnerGapIcon className="animate-spin" aria-hidden />}Save profile
        </Button>
      </form>
    </Form>
  );
}
