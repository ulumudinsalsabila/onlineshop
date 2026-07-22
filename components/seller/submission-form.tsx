"use client";

import { apiFetch } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FloppyDiskIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { z } from "zod";
import { submissionSchema } from "@/lib/seller/schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
type Values = z.input<typeof submissionSchema>;
type Option = { id: string; name: string };
export function SubmissionForm({ categories, brands, submissionId, initial }: { categories: Option[]; brands: Option[]; submissionId?: string; initial?: Values }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(submissionSchema),
    defaultValues: initial ?? {
      title: "",
      brandId: "",
      proposedBrand: "",
      categoryId: categories[0]?.id ?? "",
      conditionLabel: "EXCELLENT",
      completeness: "",
      flawNotes: "",
      description: "",
      expectedPrice: 1000000,
    },
  });
  useEffect(() => {
    const listener = (event: BeforeUnloadEvent) => {
      if (form.formState.isDirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  }, [form.formState.isDirty]);
  async function save(values: Values) {
    setBusy(true);
    try {
      const response = await apiFetch(submissionId ? `/api/seller/submissions/${submissionId}` : "/api/seller/submissions", {
        method: submissionId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as {
        success?: boolean;
        data?: { id: string };
        error?: { message?: string };
      };
      if (!result.success || !result.data) throw new Error(result.error?.message);
      toast.success("Draft saved.");
      form.reset(values);
      router.push(`/seller/submissions/${result.data.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the submission.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(save)} className="grid gap-5 border border-[#ddd5c7] bg-[#faf8f3] p-5 sm:grid-cols-2 sm:p-7">
        <Field form={form} name="title" label="Product name" />
        <SelectField form={form} name="categoryId" label="Category" options={categories} />
        <SelectField form={form} name="brandId" label="Brand" options={[{ id: "", name: "Brand not listed" }, ...brands]} />
        <Field form={form} name="proposedBrand" label="Proposed brand" />
        <SelectField
          form={form}
          name="conditionLabel"
          label="Condition"
          options={[
            { id: "PRISTINE", name: "Pristine" },
            { id: "EXCELLENT", name: "Excellent" },
            { id: "VERY_GOOD", name: "Very Good" },
            { id: "GOOD", name: "Good" },
          ]}
        />
        <Field form={form} name="expectedPrice" label="Expected price (IDR)" type="number" />
        <Area form={form} name="completeness" label="Included items" />
        <Area form={form} name="flawNotes" label="Flaw notes" />
        <Area form={form} name="description" label="Product description and history" wide />
        <Button size="lg" disabled={busy || (submissionId ? !form.formState.isDirty : false)} className="sm:col-span-2">
          {busy ? <SpinnerGapIcon className="animate-spin" aria-hidden /> : <FloppyDiskIcon aria-hidden />}
          Save draft
        </Button>
      </form>
    </Form>
  );
}
type F = ReturnType<typeof useForm<Values>>;
function Field({ form, name, label, type }: { form: F; name: Parameters<F["register"]>[0]; label: string; type?: string }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} value={(field.value as string | number | undefined) ?? ""} type={type} className="bg-white" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
function Area({ form, name, label, wide }: { form: F; name: Parameters<F["register"]>[0]; label: string; wide?: boolean }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={wide ? "sm:col-span-2" : ""}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea {...field} value={(field.value as string | undefined) ?? ""} className="min-h-28 w-full rounded-md border border-input bg-white p-3 text-sm" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
function SelectField({ form, name, label, options }: { form: F; name: Parameters<F["register"]>[0]; label: string; options: Option[] }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <SearchableSelect ref={field.ref} name={field.name} onBlur={field.onBlur} value={String(field.value ?? "")} onValueChange={field.onChange} options={options.map((option) => ({ value: option.id, label: option.name }))} placeholder={`Select ${label.toLowerCase()}`} searchPlaceholder={`Search ${label.toLowerCase()}…`} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
