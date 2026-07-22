"use client";

import { apiFetch } from "@/lib/api-client";
/* eslint-disable react-hooks/incompatible-library -- React Hook Form exposes watch(), which React Compiler intentionally skips. */

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useRouter } from "next/navigation";
import { PencilSimpleIcon, PlusIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { z } from "zod";

import { bannerAdminSchema, brandAdminSchema, categoryAdminSchema, testimonialAdminSchema, voucherAdminSchema } from "@/lib/admin/schemas";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";

type Entity = "categories" | "brands" | "vouchers" | "banners" | "testimonials";
type FormValue = string | number | boolean | null | undefined | Date;
type Values = Record<string, FormValue>;
export type EntityField = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "datetime-local" | "select";
  options?: { value: string; label: string }[];
};
const schemas: Record<Entity, z.ZodType> = {
  categories: categoryAdminSchema,
  brands: brandAdminSchema,
  vouchers: voucherAdminSchema,
  banners: bannerAdminSchema,
  testimonials: testimonialAdminSchema,
};

const entityResolver =
  (entity: Entity): Resolver<Values> =>
  async (values) => {
    const parsed = schemas[entity].safeParse(values);
    if (parsed.success) return { values: parsed.data as Values, errors: {} };
    return {
      values: {},
      errors: Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), { type: issue.code, message: issue.message }])),
    };
  };

export function EntityManager({ entity, fields, defaults, initial, triggerLabel = "Add new" }: { entity: Entity; fields: EntityField[]; defaults: Values; initial?: Values & { id: string }; triggerLabel?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const form = useForm<Values>({
    resolver: entityResolver(entity),
    defaultValues: initial ?? defaults,
  });
  useEffect(() => {
    const warning = (event: BeforeUnloadEvent) => {
      if (open && form.formState.isDirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", warning);
    return () => window.removeEventListener("beforeunload", warning);
  }, [form.formState.isDirty, open]);
  async function save(values: Values) {
    setBusy(true);
    try {
      const response = await apiFetch(`/api/admin/entities/${entity}`, {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initial ? { ...values, id: initial.id } : values),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: { message?: string };
      };
      if (!result.success) throw new Error(result.error?.message);
      toast.success("Data saved successfully.");
      form.reset(values);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the data.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {initial ? (
          <Button size="icon-sm" variant="ghost" aria-label="Edit">
            <PencilSimpleIcon aria-hidden />
          </Button>
        ) : (
          <Button>
            <PlusIcon aria-hidden />
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl">
            {initial ? "Edit" : "Create"} {entity.slice(0, -1)}
          </DialogTitle>
          <DialogDescription>Input is revalidated by the server. Changes are recorded.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(save)} className="mt-4 grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: control }) => (
                  <FormItem className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>{field.type === "checkbox" ? <Checkbox checked={Boolean(control.value)} onCheckedChange={control.onChange} /> : field.type === "textarea" ? <Textarea name={control.name} ref={control.ref} onBlur={control.onBlur} value={String(control.value ?? "")} onChange={control.onChange} className="min-h-28 w-full rounded-md border border-input bg-white p-3 text-sm" /> : field.type === "select" ? <SearchableSelect name={control.name} ref={control.ref} onBlur={control.onBlur} value={String(control.value ?? "")} onValueChange={control.onChange} options={[{ value: "", label: "None" }, ...(field.options ?? [])]} placeholder={`Select ${field.label.toLowerCase()}`} searchPlaceholder={`Search ${field.label.toLowerCase()}…`} /> : <Input {...control} value={control.value instanceof Date ? toLocal(control.value) : String(control.value ?? "")} type={field.type ?? "text"} />}</FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            {fields.some((field) => /imageUrl|logoUrl/.test(field.name)) && (
              <div
                className="aspect-[16/8] bg-[#ebe6dc] bg-cover bg-center sm:col-span-2"
                style={
                  form.watch(fields.find((field) => /imageUrl|logoUrl/.test(field.name))!.name)
                    ? {
                        backgroundImage: `url(${String(form.watch(fields.find((field) => /imageUrl|logoUrl/.test(field.name))!.name))})`,
                      }
                    : undefined
                }
                aria-label="Image preview"
              />
            )}
            <Button disabled={busy} className="sm:col-span-2">
              {busy && <SpinnerGapIcon className="animate-spin" aria-hidden />}
              Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
function toLocal(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}
