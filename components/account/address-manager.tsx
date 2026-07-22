"use client";

import { apiFetch } from "@/lib/api-client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PlusIcon, SpinnerGapIcon, TrashIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaginationMeta } from "@/components/account/lazy-account-list";

export type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2: string | null;
  village: string | null;
  district: string;
  city: string;
  province: string;
  provinceCode: string | null;
  regencyCode: string | null;
  districtCode: string | null;
  villageCode: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export function AddressManager({ initialAddresses, initialMeta }: { initialAddresses: Address[]; initialMeta?: PaginationMeta }) {
  const fallbackMeta = {
    total: initialAddresses.length,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  };
  const [addresses, setAddresses] = useState(initialAddresses);
  const [meta, setMeta] = useState(initialMeta ?? fallbackMeta);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const loadMore = useCallback(async () => {
    if (loading || meta.page >= meta.totalPages) return;
    setLoading(true);
    try {
      const response = await apiFetch(`/api/addresses?page=${meta.page + 1}&limit=${meta.pageSize}`);
      const result = (await response.json()) as {
        success?: boolean;
        data?: Address[];
        meta?: PaginationMeta;
      };
      if (result.success && result.data && result.meta) {
        setAddresses((current) => [...current, ...result.data!.filter((item) => !current.some((existing) => existing.id === item.id))]);
        setMeta(result.meta);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, meta]);
  useEffect(() => {
    const node = sentinel.current;
    if (!node || meta.page >= meta.totalPages) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, meta.page, meta.totalPages]);
  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const response = await apiFetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, isDefault: values.isDefault === "on" }),
    });
    const result = (await response.json()) as {
      success: boolean;
      data?: Address;
      error?: { message?: string };
    };
    if (result.success && result.data) {
      setAddresses((items) => (result.data?.isDefault ? [result.data, ...items.map((item) => ({ ...item, isDefault: false }))] : [...items, result.data!]));
      form.reset();
      setOpen(false);
    } else setMessage(result.error?.message ?? "The address could not be saved.");
  }
  async function remove(id: string) {
    const response = await apiFetch(`/api/addresses/${id}`, {
      method: "DELETE",
    });
    if (response.ok) setAddresses((items) => items.filter((item) => item.id !== id));
  }
  return (
    <div className="mt-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <article key={address.id} className="relative border border-border bg-background p-5">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl">{address.label}</h2>
              {address.isDefault ? <span className="bg-primary px-2 py-1 text-[0.55rem] tracking-wider text-primary-foreground uppercase">Default</span> : null}
            </div>
            <p className="mt-4 text-sm font-semibold">{address.recipient}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              <br />
              {address.village ? `${address.village}, ` : ""}
              {address.district}
              <br />
              {address.city}, {address.province} {address.postalCode}
              <br />
              {address.phone}
            </p>
            <button type="button" onClick={() => remove(address.id)} aria-label={`Remove address ${address.label}`} className="absolute top-4 right-4 grid size-9 place-items-center hover:text-destructive">
              <TrashIcon aria-hidden />
            </button>
          </article>
        ))}
      </div>
      <div ref={sentinel} className="flex min-h-10 items-center justify-center">
        {loading ? <SpinnerGapIcon className="animate-spin text-muted-foreground" aria-label="Loading addresses" /> : null}
      </div>
      <Button variant="outline" className="mt-5" onClick={() => setOpen((value) => !value)}>
        <PlusIcon aria-hidden /> Add address
      </Button>
      {open ? (
        <form onSubmit={add} className="mt-6 grid gap-4 border border-border bg-background p-6 sm:grid-cols-2">
          {[
            ["label", "Label"],
            ["recipient", "Recipient"],
            ["phone", "Phone"],
            ["line1", "Address"],
            ["line2", "Address details (optional)"],
            ["postalCode", "Postal code"],
          ].map(([id, label]) => (
            <div key={id} className={id === "line1" || id === "line2" ? "sm:col-span-2" : ""}>
              <Label htmlFor={id}>{label}</Label>
              <Input id={id} name={id} required={id !== "line2"} inputMode={id === "postalCode" ? "numeric" : undefined} pattern={id === "postalCode" ? "[0-9]{5}" : undefined} className="mt-2" />
            </div>
          ))}
          <RegionFields />
          <input type="hidden" name="country" value="Indonesia" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isDefault" /> Make this my default address
          </label>
          <div className="sm:col-span-2">
            <Button type="submit">Save address</Button>
          </div>
          {message ? <p className="text-sm text-destructive sm:col-span-2">{message}</p> : null}
        </form>
      ) : null}
    </div>
  );
}

type RegionOption = { code: string; name: string };
export type RegionSelection = {
  provinceCode: string;
  regencyCode: string;
  districtCode: string;
  villageCode: string;
};
export function RegionFields({ onSelectionChange }: { onSelectionChange?: (selection: RegionSelection) => void } = {}) {
  const [provinceCode, setProvinceCode] = useState("");
  const [regencyCode, setRegencyCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [villageCode, setVillageCode] = useState("");
  const provinces = useRegionOptions("/api/regions/provinces?limit=100");
  const regencies = useRegionOptions(provinceCode ? `/api/regions/provinces/${encodeURIComponent(provinceCode)}/regencies?limit=500` : null);
  const districts = useRegionOptions(regencyCode ? `/api/regions/regencies/${encodeURIComponent(regencyCode)}/districts?limit=500` : null);
  const villages = useRegionOptions(districtCode ? `/api/regions/districts/${encodeURIComponent(districtCode)}/villages?limit=500` : null);
  return (
    <>
      <RegionSelect
        name="provinceCode"
        label="Province"
        value={provinceCode}
        options={provinces}
        onChange={(value) => {
          setProvinceCode(value);
          setRegencyCode("");
          setDistrictCode("");
          setVillageCode("");
          onSelectionChange?.({
            provinceCode: value,
            regencyCode: "",
            districtCode: "",
            villageCode: "",
          });
        }}
      />
      <RegionSelect
        name="regencyCode"
        label="Regency / city"
        value={regencyCode}
        options={regencies}
        disabled={!provinceCode}
        onChange={(value) => {
          setRegencyCode(value);
          setDistrictCode("");
          setVillageCode("");
          onSelectionChange?.({
            provinceCode,
            regencyCode: value,
            districtCode: "",
            villageCode: "",
          });
        }}
      />
      <RegionSelect
        name="districtCode"
        label="District"
        value={districtCode}
        options={districts}
        disabled={!regencyCode}
        onChange={(value) => {
          setDistrictCode(value);
          setVillageCode("");
          onSelectionChange?.({
            provinceCode,
            regencyCode,
            districtCode: value,
            villageCode: "",
          });
        }}
      />
      <RegionSelect
        name="villageCode"
        label="Village / subdistrict"
        value={villageCode}
        options={villages}
        disabled={!districtCode}
        onChange={(value) => {
          setVillageCode(value);
          onSelectionChange?.({
            provinceCode,
            regencyCode,
            districtCode,
            villageCode: value,
          });
        }}
      />
    </>
  );
}
function RegionSelect({ name, label, value, options, disabled, onChange }: { name: string; label: string; value: string; options: RegionOption[]; disabled?: boolean; onChange?: (value: string) => void }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} value={onChange ? value : undefined} required disabled={disabled} onChange={onChange ? (event) => onChange(event.target.value) : undefined} className="mt-2 h-10 w-full border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50">
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
function useRegionOptions(path: string | null) {
  const [options, setOptions] = useState<RegionOption[]>([]);
  useEffect(() => {
    if (!path) return;
    let active = true;
    void apiFetch(path)
      .then((response) => response.json())
      .then((result: { success?: boolean; data?: RegionOption[] }) => {
        if (active) setOptions(result.success && result.data ? result.data : []);
      })
      .catch(() => {
        if (active) setOptions([]);
      });
    return () => {
      active = false;
    };
  }, [path]);
  return path ? options : [];
}
