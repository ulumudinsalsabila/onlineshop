"use client";

import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, FloppyDiskIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
type Option = { id: string; name: string };
export function ConsignmentControls({ id, status, title, initialPrice, initialRate, categories, brands }: { id: string; status: string; title: string; initialPrice: number; initialRate: number; categories: Option[]; brands: Option[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [price, setPrice] = useState(initialPrice);
  const [rate, setRate] = useState(initialRate);
  const [fixedFee, setFixedFee] = useState(0);
  const [categoryId, setCategory] = useState(categories[0]?.id ?? "");
  const [brandId, setBrand] = useState(brands[0]?.id ?? "");
  const [productName, setProductName] = useState(title);
  const [slug, setSlug] = useState(
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
  );
  const [checks, setChecks] = useState({
    authenticity: false,
    material: false,
    hardware: false,
    stitching: false,
    odor: false,
    functionality: false,
  });
  async function call(url: string, method: "POST" | "PATCH", body: object) {
    setBusy(true);
    try {
      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: { message?: string };
      };
      if (!result.success) throw new Error(result.error?.message);
      toast.success("Consignment updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      {["SUBMITTED", "UNDER_REVIEW", "WAITING_FOR_ITEM"].includes(status) && (
        <section className="space-y-4">
          <h3 className="font-serif text-xl">Review action</h3>
          {status === "UNDER_REVIEW" && (
            <div>
              <Label htmlFor="estimate">Estimated price</Label>
              <Input id="estimate" type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} className="mt-2 bg-white" />
            </div>
          )}
          <div>
            <Label htmlFor="review-reason">Reason / note</Label>
            <textarea id="review-reason" value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 min-h-20 w-full rounded-md border bg-white p-3 text-sm" />
          </div>
          <div className="grid gap-2">
            {status === "SUBMITTED" && (
              <Button
                disabled={busy}
                onClick={() =>
                  void call(`/api/admin/consignments/${id}/review`, "PATCH", {
                    status: "UNDER_REVIEW",
                  })
                }
              >
                Start review
              </Button>
            )}
            {status === "UNDER_REVIEW" && (
              <>
                <Button
                  disabled={busy || !price}
                  onClick={() =>
                    void call(`/api/admin/consignments/${id}/review`, "PATCH", {
                      status: "APPROVED",
                      estimatedPrice: price,
                    })
                  }
                >
                  Send price estimate
                </Button>
                <Button
                  variant="outline"
                  disabled={busy || !reason}
                  onClick={() =>
                    void call(`/api/admin/consignments/${id}/review`, "PATCH", {
                      status: "NEEDS_REVISION",
                      reason,
                    })
                  }
                >
                  Request revision
                </Button>
                <Button
                  variant="destructive"
                  disabled={busy || !reason}
                  onClick={() =>
                    void call(`/api/admin/consignments/${id}/review`, "PATCH", {
                      status: "REJECTED",
                      reason,
                    })
                  }
                >
                  Reject
                </Button>
              </>
            )}
            {status === "WAITING_FOR_ITEM" && (
              <Button
                disabled={busy}
                onClick={() =>
                  void call(`/api/admin/consignments/${id}/review`, "PATCH", {
                    status: "INSPECTION",
                  })
                }
              >
                Confirm item received
              </Button>
            )}
          </div>
        </section>
      )}
      {status === "INSPECTION" && (
        <section className="space-y-4">
          <h3 className="font-serif text-xl">Inspection checklist</h3>
          {Object.keys(checks).map((key) => (
            <label key={key} className="flex items-center gap-3 text-sm capitalize">
              <Checkbox
                checked={checks[key as keyof typeof checks]}
                onCheckedChange={(value) =>
                  setChecks((current) => ({
                    ...current,
                    [key]: Boolean(value),
                  }))
                }
              />
              {key}
            </label>
          ))}
          <Input type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} aria-label="Recommended price" className="bg-white" />
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Inspection notes" className="min-h-20 w-full rounded-md border bg-white p-3 text-sm" />
          <Button
            disabled={busy}
            onClick={() =>
              void call(`/api/admin/consignments/${id}/inspection`, "POST", {
                result: Object.values(checks).every(Boolean) ? "PASSED" : "NEEDS_REVISION",
                checklist: checks,
                notes: reason,
                authenticityNote: checks.authenticity ? "Authenticated" : "Requires review",
                recommendedPrice: price,
              })
            }
          >
            <CheckCircleIcon aria-hidden />
            Save inspection
          </Button>
        </section>
      )}
      {["READY_TO_LIST", "LISTED"].includes(status) && (
        <section className="space-y-4 border-t pt-5">
          <h3 className="font-serif text-xl">Commission</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" value={rate} onChange={(event) => setRate(Number(event.target.value))} aria-label="Commission rate" className="bg-white" />
            <Input type="number" value={fixedFee} onChange={(event) => setFixedFee(Number(event.target.value))} aria-label="Fixed fee" className="bg-white" />
          </div>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() =>
              void call(`/api/admin/consignments/${id}/commission`, "PATCH", {
                rate,
                fixedFee,
              })
            }
          >
            <FloppyDiskIcon aria-hidden />
            Save commission
          </Button>
        </section>
      )}
      {status === "READY_TO_LIST" && (
        <section className="space-y-4 border-t pt-5">
          <h3 className="font-serif text-xl">Publish product</h3>
          <Input value={productName} onChange={(event) => setProductName(event.target.value)} aria-label="Product name" className="bg-white" />
          <Input value={slug} onChange={(event) => setSlug(event.target.value)} aria-label="Product slug" className="bg-white" />
          <select value={brandId} onChange={(event) => setBrand(event.target.value)} className="h-11 w-full rounded-md border bg-white px-3 text-sm" aria-label="Brand">
            {brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select value={categoryId} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full rounded-md border bg-white px-3 text-sm" aria-label="Category">
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <Input type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} aria-label="Listing price" className="bg-white" />
          <Button
            disabled={busy}
            onClick={() =>
              void call(`/api/admin/consignments/${id}/publish`, "POST", {
                productName,
                slug,
                brandId,
                categoryId,
                listingPrice: price,
              })
            }
          >
            {busy && <SpinnerGapIcon className="animate-spin" aria-hidden />}
            Publish with stock 1
          </Button>
        </section>
      )}
    </div>
  );
}
