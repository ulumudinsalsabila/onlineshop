"use client";

import { apiFetch } from "@/lib/api-client";
/* eslint-disable react-hooks/incompatible-library -- React Hook Form exposes watch(), which React Compiler intentionally skips. */

import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FloppyDiskIcon, PlusIcon, SpinnerGapIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { z } from "zod";

import { productAdminSchema } from "@/lib/admin/schemas";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type Values = z.input<typeof productAdminSchema>;
type Option = { id: string; name: string };

export function ProductForm({ productId, initial, categories, brands }: { productId?: string; initial?: Values; categories: Option[]; brands: Option[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const form = useForm<Values>({
    resolver: zodResolver(productAdminSchema),
    defaultValues: initial ?? {
      name: "",
      slug: "",
      baseSku: "",
      categoryId: categories[0]?.id ?? "",
      brandId: brands[0]?.id ?? "",
      description: "",
      shortDescription: "",
      condition: "NEW",
      conditionLabel: "",
      completeness: "",
      flawNotes: "",
      authenticationStatus: "",
      price: 0,
      compareAtPrice: null,
      costPrice: null,
      status: "DRAFT",
      isFeatured: false,
      isNewArrival: false,
      weightGrams: 1000,
      images: [],
      variants: [
        {
          sku: "",
          name: "Default",
          color: "",
          colorHex: "",
          size: "One Size",
          price: null,
          compareAtPrice: null,
          weightInGrams: 1000,
          stock: 0,
          lowStockAt: 2,
          isActive: true,
        },
      ],
    },
  });
  const images = useFieldArray({ control: form.control, name: "images" });
  const variants = useFieldArray({ control: form.control, name: "variants" });
  useEffect(() => {
    const warning = (event: BeforeUnloadEvent) => {
      if (form.formState.isDirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", warning);
    return () => window.removeEventListener("beforeunload", warning);
  }, [form.formState.isDirty]);
  async function uploadImages(files: File[]) {
    if (!files.length) return;
    const currentCount = form.getValues("images").length;
    if (currentCount + files.length > 12) {
      toast.error("A product can have up to 12 images.");
      return;
    }
    const invalid = files.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 4 * 1024 * 1024);
    if (invalid) {
      toast.error(`${invalid.name}: use a JPEG, PNG, or WebP file up to 4 MB.`);
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        const body = new FormData();
        body.append("image", file);
        const response = await apiFetch("/api/admin/products/images", {
          method: "POST",
          body,
        });
        const result = (await response.json()) as {
          success?: boolean;
          data?: { url: string; width: number; height: number };
          error?: { message?: string };
        };
        if (!response.ok || !result.success || !result.data) throw new Error(result.error?.message || `Could not upload ${file.name}.`);
        const isPrimary = form.getValues("images").length === 0;
        images.append({
          url: result.data.url,
          alt: form.getValues("name") || file.name.replace(/\.[^.]+$/, ""),
          width: result.data.width || 1200,
          height: result.data.height || 1500,
          isPrimary,
        });
      }
      toast.success(`${files.length} images uploaded successfully.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload the images.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  function setPrimary(index: number) {
    form.getValues("images").forEach((_, itemIndex) =>
      form.setValue(`images.${itemIndex}.isPrimary`, itemIndex === index, {
        shouldDirty: true,
      }),
    );
  }
  function removeImage(index: number) {
    const wasPrimary = Boolean(form.getValues(`images.${index}.isPrimary`));
    images.remove(index);
    if (wasPrimary && images.fields.length > 1) queueMicrotask(() => setPrimary(0));
  }
  async function submit(values: Values) {
    setBusy(true);
    try {
      const response = await apiFetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as {
        success?: boolean;
        data?: { id: string };
        error?: { message?: string };
      };
      if (!result.success) throw new Error(result.error?.message);
      toast.success(productId ? "Product updated." : "Product created.");
      form.reset(values);
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the product.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
        <section className="grid gap-5 border border-[#ded9cf] bg-[#faf8f3] p-5 sm:grid-cols-2 sm:p-6">
          <h2 className="font-serif text-2xl sm:col-span-2">Core information</h2>
          <TextField form={form} name="name" label="Product name" />
          <TextField form={form} name="slug" label="Slug" />
          <TextField form={form} name="baseSku" label="Base SKU" />
          <SelectField
            form={form}
            name="status"
            label="Status"
            options={[
              { id: "DRAFT", name: "Draft" },
              { id: "ACTIVE", name: "Published" },
              { id: "ARCHIVED", name: "Archived" },
            ]}
          />
          <SelectField form={form} name="categoryId" label="Category" options={categories} />
          <SelectField form={form} name="brandId" label="Brand" options={brands} />
          <SelectField
            form={form}
            name="condition"
            label="Condition"
            options={[
              { id: "NEW", name: "New" },
              { id: "PRELOVED", name: "Preloved" },
            ]}
          />
          <TextField form={form} name="authenticationStatus" label="Authenticity status" />
          <TextField form={form} name="shortDescription" label="Short description" className="sm:col-span-2" />
          <TextAreaField form={form} name="description" label="Description" />
          <TextAreaField form={form} name="flawNotes" label="Preloved flaw notes" />
          <TextField form={form} name="price" label="Price (IDR)" type="number" />
          <TextField form={form} name="compareAtPrice" label="Compare-at price" type="number" />
          <TextField form={form} name="costPrice" label="Cost price" type="number" />
          <TextField form={form} name="weightGrams" label="Weight (grams)" type="number" />
          <BooleanField form={form} name="isFeatured" label="Featured product" />
          <BooleanField form={form} name="isNewArrival" label="New arrival" />
        </section>
        <section className="border border-[#ded9cf] bg-[#faf8f3] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl">Images</h2>
              <p className="mt-1 text-xs text-muted-foreground">Upload up to 12 JPEG, PNG, or WebP files. Maximum 4 MB per file.</p>
            </div>
            <Button type="button" variant="outline" disabled={uploading || images.fields.length >= 12} onClick={() => fileInput.current?.click()}>
              {uploading ? <SpinnerGapIcon className="animate-spin" aria-hidden /> : <UploadSimpleIcon aria-hidden />} {uploading ? "Uploading..." : "Upload images"}
            </Button>
            <input ref={fileInput} className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadImages(Array.from(event.target.files ?? []))} />
          </div>
          <button
            type="button"
            disabled={uploading || images.fields.length >= 12}
            onClick={() => fileInput.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void uploadImages(Array.from(event.dataTransfer.files));
            }}
            className="mt-5 flex min-h-28 w-full flex-col items-center justify-center gap-2 border border-dashed border-[#b9b1a3] bg-white px-4 text-center text-sm text-muted-foreground transition hover:border-[#7d6f5b] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UploadSimpleIcon size={24} aria-hidden />
            <span>Drop images here or click to select</span>
          </button>
          {images.fields.length === 0 && <p className="mt-2 text-sm text-destructive">At least one image is required before saving the product.</p>}
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {images.fields.map((field, index) => {
              const url = safePreviewUrl(String(form.watch(`images.${index}.url`) ?? ""));
              const primary = Boolean(form.watch(`images.${index}.isPrimary`));
              return (
                <div key={field.id} className="grid gap-4 border border-[#ded9cf] p-4 sm:grid-cols-[7rem_1fr]">
                  <div
                    className="aspect-[4/5] bg-[#ebe6dc] bg-cover bg-center"
                    style={
                      url
                        ? {
                            backgroundImage: `url("${url.replaceAll('"', "%22")}")`,
                          }
                        : undefined
                    }
                    aria-label={`Image preview ${index + 1}`}
                  />
                  <div className="min-w-0 space-y-3">
                    <TextField form={form} name={`images.${index}.alt`} label="Alt text" />
                    <p className="truncate text-xs text-muted-foreground" title={String(form.watch(`images.${index}.url`) ?? "")}>
                      {String(form.watch(`images.${index}.url`) ?? "")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant={primary ? "default" : "outline"} onClick={() => setPrimary(index)}>
                        {primary ? "Primary image" : "Set primary"}
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => removeImage(index)}>
                        <TrashIcon aria-hidden /> Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="border border-[#ded9cf] bg-[#faf8f3] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">Variants & stock</h2>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                variants.append({
                  sku: "",
                  name: "",
                  color: "",
                  colorHex: "",
                  size: "",
                  price: null,
                  compareAtPrice: null,
                  weightInGrams: 1000,
                  stock: 0,
                  lowStockAt: 2,
                  isActive: true,
                })
              }
            >
              <PlusIcon aria-hidden /> Add variant
            </Button>
          </div>
          <div className="mt-5 space-y-4">
            {variants.fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 border border-[#ded9cf] p-4 sm:grid-cols-2 lg:grid-cols-4">
                <TextField form={form} name={`variants.${index}.sku`} label="SKU" />
                <TextField form={form} name={`variants.${index}.name`} label="Variant name" />
                <TextField form={form} name={`variants.${index}.color`} label="Color" />
                <TextField form={form} name={`variants.${index}.size`} label="Size" />
                <TextField form={form} name={`variants.${index}.price`} label="Override price" type="number" />
                <TextField form={form} name={`variants.${index}.weightInGrams`} label="Weight (grams)" type="number" />
                <TextField form={form} name={`variants.${index}.stock`} label="Stock" type="number" />
                <TextField form={form} name={`variants.${index}.lowStockAt`} label="Low-stock threshold" type="number" />
                <div className="flex items-end gap-3">
                  <BooleanField form={form} name={`variants.${index}.isActive`} label="Active" />
                  <Button type="button" size="icon" variant="destructive" disabled={variants.fields.length === 1} onClick={() => variants.remove(index)} aria-label="Remove variant">
                    <TrashIcon aria-hidden />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <div className="sticky bottom-4 flex justify-end">
          <Button size="lg" disabled={busy || uploading || !form.formState.isDirty}>
            {busy ? <SpinnerGapIcon className="animate-spin" aria-hidden /> : <FloppyDiskIcon aria-hidden />} Save product
          </Button>
        </div>
      </form>
    </Form>
  );
}

type AnyForm = ReturnType<typeof useForm<Values>>;
function TextField({ form, name, label, type = "text", className }: { form: AnyForm; name: Parameters<AnyForm["register"]>[0]; label: string; type?: string; className?: string }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} value={(field.value as string | number | null | undefined) ?? ""} type={type} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
function TextAreaField({ form, name, label }: { form: AnyForm; name: Parameters<AnyForm["register"]>[0]; label: string }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <textarea {...field} value={(field.value as string | undefined) ?? ""} className="min-h-28 w-full rounded-md border border-input bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-ring/30" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
function SelectField({ form, name, label, options }: { form: AnyForm; name: Parameters<AnyForm["register"]>[0]; label: string; options: Option[] }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <select {...field} value={String(field.value ?? "")} className="h-11 w-full rounded-md border border-input bg-white px-3 text-sm">
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
function BooleanField({ form, name, label }: { form: AnyForm; name: Parameters<AnyForm["register"]>[0]; label: string }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center gap-3 pt-2">
          <FormControl>
            <Checkbox checked={Boolean(field.value)} onCheckedChange={field.onChange} />
          </FormControl>
          <FormLabel className="font-normal">{label}</FormLabel>
          <FormDescription className="sr-only">Toggle {label}</FormDescription>
        </FormItem>
      )}
    />
  );
}
function safePreviewUrl(value: string) {
  return value.startsWith("/") || /^https:\/\//i.test(value) || /^http:\/\/localhost(?::\d+)?\//i.test(value) ? value : "";
}
