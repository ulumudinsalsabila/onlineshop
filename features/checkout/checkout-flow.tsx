"use client";

import { apiFetch } from "@/lib/api-client";

import { useEffect, useMemo, useState } from "react";
import * as m from "motion/react-m";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, MapPinIcon, PackageIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatIDR } from "@/lib/formatters";
import { RegionFields, type RegionSelection } from "@/components/account/address-manager";

type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2?: string | null;
  village?: string | null;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};
type Item = {
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  stock: number;
};
type Context = {
  cartId: string;
  customer: { name: string | null; email: string; phone: string | null };
  addresses: Address[];
  items: Item[];
};
type Destination = {
  id: number;
  label: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  postalCode: string;
};
type Quote = {
  provider: string;
  courierCode: string;
  courierName: string;
  serviceCode: string;
  serviceName: string;
  description: string;
  cost: number;
  etd: string;
  estimateLabel: string;
};
type Totals = {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  grandTotal: number;
  voucherCode: string | null;
};
type ApiResult<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };
type DestinationState = "idle" | "loading" | "ready" | "empty" | "error" | "timeout" | "quota";

const steps = ["Information", "Address", "Shipping", "Voucher", "Payment", "Review", "Confirmation"];
const emptyAddress = {
  label: "Home",
  recipient: "",
  phone: "",
  line1: "",
  line2: "",
  postalCode: "",
  country: "Indonesia",
  isDefault: false,
  provinceCode: "",
  regencyCode: "",
  districtCode: "",
  villageCode: "",
};

export function CheckoutFlow() {
  const [context, setContext] = useState<Context | null>(null);
  const [step, setStep] = useState(0);
  const [addressId, setAddressId] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [destinationState, setDestinationState] = useState<DestinationState>("idle");
  const [rateError, setRateError] = useState<{
    code: string;
    message: string;
  } | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("VIRTUAL_ACCOUNT");
  const [notes, setNotes] = useState("");
  const [totals, setTotals] = useState<Totals | null>(null);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [addingAddress, setAddingAddress] = useState(false);
  const [busy, setBusy] = useState(false);
  const selectedAddress = context?.addresses.find((address) => address.id === addressId);

  async function loadContext() {
    const response = await apiFetch("/api/checkout", { cache: "no-store" });
    const result = (await response.json()) as ApiResult<Context>;
    if (!result.success) throw new Error(result.error.message);
    setContext(result.data);
    setAddressId((current) => current || result.data.addresses.find((address) => address.isDefault)?.id || result.data.addresses[0]?.id || "");
  }
  useEffect(() => {
    let active = true;
    void apiFetch("/api/checkout", { cache: "no-store" })
      .then(async (response) => response.json() as Promise<ApiResult<Context>>)
      .then((result) => {
        if (!active) return;
        if (!result.success) throw new Error(result.error.message);
        setContext(result.data);
        setAddressId(result.data.addresses.find((address) => address.isDefault)?.id || result.data.addresses[0]?.id || "");
      })
      .catch((error: Error) => toast.error(error.message));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const query = destinationQuery.trim();
    if (destination?.label === destinationQuery) return;
    if (query.length < 3) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setDestinationState("loading");
      void apiFetch(`/api/shipping/destinations?search=${encodeURIComponent(query)}`, { cache: "no-store", signal: controller.signal })
        .then(async (response) => {
          const result = (await response.json()) as ApiResult<{
            items: Destination[];
          }>;
          if (!result.success)
            throw Object.assign(new Error(result.error.message), {
              code: result.error.code,
            });
          setDestinations(result.data.items);
          setDestinationState(result.data.items.length ? "ready" : "empty");
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          const code = error instanceof Error && "code" in error ? String(error.code) : "";
          setDestinationState(code === "SHIPPING_TIMEOUT" ? "timeout" : code === "SHIPPING_QUOTA_EXCEEDED" || code === "RATE_LIMITED" ? "quota" : "error");
        });
    }, 600);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [destination, destinationQuery]);

  function changeDestinationQuery(value: string) {
    setDestinationQuery(value);
    setDestination(null);
    setDestinations([]);
    setQuotes([]);
    setQuote(null);
    setRateError(null);
    setTotals(null);
    setDestinationState(value.trim().length < 3 ? "idle" : "loading");
  }

  async function loadRates() {
    if (!destination) {
      toast.error("Select a destination district or city first.");
      return;
    }
    if (!context?.cartId) {
      setRateError({
        code: "CART_CONTEXT_STALE",
        message: "The cart is not synchronized. Reload this page after restarting the backend.",
      });
      return;
    }
    setBusy(true);
    setRateError(null);
    setQuotes([]);
    setQuote(null);
    try {
      const response = await apiFetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationId: destination.id,
          cartId: context.cartId,
        }),
      });
      const result = (await response.json()) as ApiResult<{ rates: Quote[] }>;
      if (!result.success) {
        setRateError(result.error);
        return;
      }
      setQuotes(result.data.rates);
    } catch {
      setRateError({
        code: "NETWORK_ERROR",
        message: "The connection to the shipping service was interrupted.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function saveAddress() {
    setBusy(true);
    try {
      const response = await apiFetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      const result = (await response.json()) as ApiResult<Address>;
      if (!result.success) throw new Error(result.error.message);
      await loadContext();
      setAddressId(result.data.id);
      setAddingAddress(false);
      toast.success("Address saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid address.");
    } finally {
      setBusy(false);
    }
  }

  const payload = useMemo(
    () =>
      quote && destination
        ? {
            addressId,
            shipping: {
              destinationId: destination.id,
              courierCode: quote.courierCode,
              serviceCode: quote.serviceCode,
            },
            voucherCode: voucherCode || undefined,
            paymentMethod,
            notes: notes || undefined,
          }
        : null,
    [addressId, destination, notes, paymentMethod, quote, voucherCode],
  );
  async function preview() {
    if (!payload) return;
    setBusy(true);
    try {
      const response = await apiFetch("/api/checkout/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResult<Totals>;
      if (!result.success) throw new Error(result.error.message);
      setTotals(result.data);
      toast.success(voucherCode ? "Voucher applied." : "Total updated.");
    } catch (error) {
      setTotals(null);
      toast.error(error instanceof Error ? error.message : "The total could not be calculated.");
    } finally {
      setBusy(false);
    }
  }
  async function submitOrder() {
    if (!payload) return;
    setBusy(true);
    try {
      const response = await apiFetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResult<{
        orderId: string;
        orderNumber: string;
        redirectUrl: string;
      }>;
      if (!result.success) throw new Error(result.error.message);
      sessionStorage.setItem("last-order-id", result.data.orderId);
      window.location.assign(result.data.redirectUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The order could not be created.");
      setBusy(false);
    }
  }

  async function next() {
    if (step === 1 && !addressId) {
      toast.error("Select a shipping address.");
      return;
    }
    if (step === 2 && !quote) {
      toast.error("Check the shipping rates and select a shipping service.");
      return;
    }
    if (step === 4 || step === 5) await preview();
    setStep((current) => Math.min(6, current + 1));
  }

  if (!context)
    return (
      <div className="flex min-h-[28rem] items-center justify-center">
        <SpinnerGapIcon className="size-7 animate-spin" aria-hidden />
        <span className="sr-only">Loading checkout</span>
      </div>
    );
  const rawSubtotal = context.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section>
        <ol aria-label="Checkout steps" className="mb-10 grid grid-cols-7 gap-1">
          {steps.map((label, index) => (
            <li key={label} className="min-w-0">
              <span className={`block h-1 ${index <= step ? "bg-primary" : "bg-border"}`} />
              <span className="mt-2 hidden text-[0.625rem] tracking-wider uppercase md:block">{label}</span>
            </li>
          ))}
        </ol>
        <m.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }}>
          <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Step {step + 1} of 7</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{steps[step]}</h1>
          <div className="mt-8">
            {step === 0 && <CustomerStep context={context} notes={notes} setNotes={setNotes} />}
            {step === 1 && (
              <AddressStep
                addresses={context.addresses}
                addressId={addressId}
                setAddressId={(value) => {
                  setAddressId(value);
                  setQuote(null);
                  setQuotes([]);
                  setTotals(null);
                }}
                adding={addingAddress}
                setAdding={setAddingAddress}
                form={addressForm}
                setForm={setAddressForm}
                save={saveAddress}
                busy={busy}
              />
            )}
            {step === 2 && (
              <ShippingStep
                query={destinationQuery}
                setQuery={changeDestinationQuery}
                destinations={destinations}
                destination={destination}
                chooseDestination={(value) => {
                  setDestination(value);
                  setDestinationQuery(value.label);
                  setDestinations([]);
                  setDestinationState("ready");
                  setTotals(null);
                }}
                destinationState={destinationState}
                quotes={quotes}
                quote={quote}
                setQuote={(value) => {
                  setQuote(value);
                  setTotals(null);
                }}
                checkRates={loadRates}
                rateError={rateError}
                busy={busy}
              />
            )}
            {step === 3 && <VoucherStep code={voucherCode} setCode={setVoucherCode} apply={preview} busy={busy} />}
            {step === 4 && <PaymentStep value={paymentMethod} setValue={setPaymentMethod} />}
            {step === 5 && <ReviewStep context={context} address={selectedAddress} quote={quote} payment={paymentMethod} />}
            {step === 6 && <ConfirmationStep submit={submitOrder} busy={busy} />}
          </div>
        </m.div>
        <div className="mt-10 flex justify-between border-t border-border pt-6">
          <Button variant="ghost" disabled={step === 0 || busy} onClick={() => setStep((current) => current - 1)}>
            <ArrowLeftIcon aria-hidden /> Back
          </Button>
          {step < 6 && (
            <Button disabled={busy} onClick={() => void next()}>
              {busy && <SpinnerGapIcon className="animate-spin" aria-hidden />} Continue <ArrowRightIcon aria-hidden />
            </Button>
          )}
        </div>
      </section>
      <aside className="h-fit border border-border bg-secondary/30 p-6 lg:sticky lg:top-28">
        <h2 className="font-serif text-2xl">Order summary</h2>
        <div className="mt-5 space-y-4">
          {context.items.map((item) => (
            <div key={item.variantId} className="flex justify-between gap-4 text-sm">
              <div>
                <p>{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.variantName} · {item.quantity}
                </p>
              </div>
              <span className="tabular-nums">{formatIDR(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>
        <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
          <SummaryRow label="Subtotal" value={rawSubtotal} />
          <SummaryRow label="Discount" value={totals?.discountTotal ?? 0} />
          <SummaryRow label="Shipping" value={totals?.shippingTotal ?? quote?.cost ?? 0} />
          <SummaryRow label="Total" value={totals?.grandTotal ?? rawSubtotal + (quote?.cost ?? 0)} strong />
        </dl>
        <p className="mt-4 text-[0.6875rem] leading-5 text-muted-foreground">The server recalculates the final total when your order is created.</p>
      </aside>
    </div>
  );
}

function CustomerStep({ context, notes, setNotes }: { context: Context; notes: string; setNotes(value: string): void }) {
  return (
    <div className="space-y-6">
      <div className="border border-border p-5">
        <p className="font-medium">{context.customer.name ?? "Customer"}</p>
        <p className="mt-1 text-sm text-muted-foreground">{context.customer.email}</p>
      </div>
      <div>
        <Label htmlFor="notes">Order notes (optional)</Label>
        <Textarea id="notes" value={notes} maxLength={500} onChange={(event) => setNotes(event.target.value)} className="mt-2 min-h-28 w-full rounded-md border border-input bg-card p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30" placeholder="Special instructions for your order" />
      </div>
    </div>
  );
}
function AddressStep({ addresses, addressId, setAddressId, adding, setAdding, form, setForm, save, busy }: { addresses: Address[]; addressId: string; setAddressId(value: string): void; adding: boolean; setAdding(value: boolean): void; form: typeof emptyAddress; setForm(value: typeof emptyAddress): void; save(): void; busy: boolean }) {
  const setRegions = (selection: RegionSelection) => setForm({ ...form, ...selection });
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {addresses.map((address) => (
          <button type="button" key={address.id} aria-pressed={addressId === address.id} onClick={() => setAddressId(address.id)} className={`border p-5 text-left transition-colors ${addressId === address.id ? "border-primary bg-secondary/60" : "border-border hover:border-foreground/40"}`}>
            <MapPinIcon className="mb-3 size-5" aria-hidden />
            <p className="font-semibold">
              {address.label} · {address.recipient}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {address.line1}, {address.village ? `${address.village}, ` : ""}
              {address.district}, {address.city} {address.postalCode}
              <br />
              {address.phone}
            </p>
          </button>
        ))}
      </div>
      <Button className="mt-5" variant="outline" onClick={() => setAdding(!adding)} aria-expanded={adding}>
        Add address
      </Button>
      {adding && (
        <div className="mt-6 grid gap-4 border border-border p-5 sm:grid-cols-2">
          {(["label", "recipient", "phone", "line1", "postalCode"] as const).map((key) => (
            <div key={key} className={key === "line1" ? "sm:col-span-2" : ""}>
              <Label htmlFor={`address-${key}`}>
                {
                  {
                    label: "Label",
                    recipient: "Recipient",
                    phone: "Phone number",
                    line1: "Address",
                    postalCode: "Postal code",
                  }[key]
                }
              </Label>
              <Input id={`address-${key}`} value={form[key]} inputMode={key === "postalCode" ? "numeric" : undefined} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-2" />
            </div>
          ))}
          <RegionFields onSelectionChange={setRegions} />
          <Button disabled={busy} onClick={save} className="sm:col-span-2">
            Save address
          </Button>
        </div>
      )}
    </div>
  );
}
function ShippingStep({ query, setQuery, destinations, destination, chooseDestination, destinationState, quotes, quote, setQuote, checkRates, rateError, busy }: { query: string; setQuery(value: string): void; destinations: Destination[]; destination: Destination | null; chooseDestination(value: Destination): void; destinationState: DestinationState; quotes: Quote[]; quote: Quote | null; setQuote(value: Quote): void; checkRates(): void; rateError: { code: string; message: string } | null; busy: boolean }) {
  const stateMessage = destinationState === "loading" ? "Searching destinations…" : destinationState === "empty" ? "No destinations found." : destinationState === "timeout" ? "The search timed out. Please try again." : destinationState === "quota" ? "The shipping search quota has been exceeded. Please try again later." : destinationState === "error" ? "Destinations could not be loaded." : query.trim().length > 0 && query.trim().length < 3 ? "Enter at least three characters." : null;
  const rateMessage = rateError?.code === "SHIPPING_TIMEOUT" ? "The shipping rate request timed out. Please try again." : rateError?.code === "SHIPPING_QUOTA_EXCEEDED" || rateError?.code === "RATE_LIMITED" ? "The shipping quota has been exceeded or too many requests were made." : rateError?.message;
  return (
    <div className="space-y-6">
      <div className="relative">
        <Label htmlFor="shipping-destination">District, city, or postal code</Label>
        <Input id="shipping-destination" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" placeholder="Example: Coblong, Bandung, 40132" className="mt-2" aria-expanded={destinations.length > 0} aria-controls="destination-results" />
        {stateMessage && (
          <p role="status" className="mt-2 text-xs text-muted-foreground">
            {stateMessage}
          </p>
        )}
        {destinations.length > 0 && (
          <div id="destination-results" className="absolute z-20 mt-1 max-h-64 w-full overflow-auto border border-border bg-background shadow-lg">
            {destinations.map((item) => (
              <button type="button" key={item.id} onClick={() => chooseDestination(item)} className="block w-full border-b border-border px-4 py-3 text-left text-sm last:border-0 hover:bg-secondary">
                <span className="font-medium">{item.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {item.district}, {item.city} {item.postalCode}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <Button type="button" onClick={checkRates} disabled={!destination || busy}>
        {busy && <SpinnerGapIcon className="animate-spin" aria-hidden />}Check shipping rates
      </Button>
      {destination && <p className="text-xs text-muted-foreground">Selected destination: {destination.label}</p>}
      {rateMessage && (
        <div role="alert" className="border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {rateMessage}
        </div>
      )}
      {!busy && destination && !rateError && quotes.length === 0 && <p className="text-sm text-muted-foreground">Click “Check shipping rates” to display available services.</p>}
      <RadioGroup
        value={quote ? `${quote.courierCode}-${quote.serviceCode}` : ""}
        onValueChange={(value) => {
          const selectedQuote = quotes.find((item) => `${item.courierCode}-${item.serviceCode}` === value);
          if (selectedQuote) setQuote(selectedQuote);
        }}
      >
        {quotes.map((item) => {
          const selected = quote?.courierCode === item.courierCode && quote.serviceCode === item.serviceCode;
          return (
            <label key={`${item.courierCode}-${item.serviceCode}`} className={`flex cursor-pointer items-center justify-between gap-4 border p-5 ${selected ? "border-primary bg-secondary/60" : "border-border"}`}>
              <span className="flex gap-3">
                <RadioGroupItem value={`${item.courierCode}-${item.serviceCode}`} aria-label={`${item.courierName} ${item.serviceName}`} />
                <span>
                  <span className="font-semibold">
                    {item.courierName} · {item.serviceName}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {item.description || "Shipping service"} · Estimated {item.etd || item.estimateLabel}
                  </span>
                </span>
              </span>
              <span className="font-medium">{formatIDR(item.cost)}</span>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
function VoucherStep({ code, setCode, apply, busy }: { code: string; setCode(value: string): void; apply(): void; busy: boolean }) {
  return (
    <div className="max-w-lg">
      <Label htmlFor="voucher">Voucher code</Label>
      <div className="mt-2 flex gap-2">
        <Input id="voucher" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="WELCOME10" />
        <Button variant="outline" disabled={!code || busy} onClick={apply}>
          Apply
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Validity, dates, minimum spend, and usage limits are verified again on the server.</p>
    </div>
  );
}
function PaymentStep({ value, setValue }: { value: string; setValue(value: string): void }) {
  const methods = [
    ["VIRTUAL_ACCOUNT", "Virtual account"],
    ["BANK_TRANSFER", "Bank transfer"],
    ["E_WALLET", "E-wallet"],
    ["CREDIT_CARD", "Credit/debit card"],
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {methods.map(([id, label]) => (
        <button type="button" key={id} aria-pressed={value === id} onClick={() => setValue(id)} className={`border p-5 text-left ${value === id ? "border-primary bg-secondary/60" : "border-border"}`}>
          <span className="font-semibold">{label}</span>
          <span className="mt-2 block text-xs text-muted-foreground">Securely processed through Midtrans Snap.</span>
        </button>
      ))}
    </div>
  );
}
function ReviewStep({ context, address, quote, payment }: { context: Context; address?: Address; quote: Quote | null; payment: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ReviewBox title="Customer" text={`${context.customer.name ?? "Customer"}\n${context.customer.email}`} />
      <ReviewBox title="Address" text={address ? `${address.recipient}\n${address.line1}, ${address.city} ${address.postalCode}` : "-"} />
      <ReviewBox title="Shipping" text={quote ? `${quote.courierName} ${quote.serviceName}\n${quote.estimateLabel}` : "-"} />
      <ReviewBox title="Payment" text={payment.replaceAll("_", " ")} />
    </div>
  );
}
function ConfirmationStep({ submit, busy }: { submit(): void; busy: boolean }) {
  return (
    <div className="border border-border bg-secondary/30 p-7 text-center">
      <CheckCircleIcon className="mx-auto size-10" weight="thin" aria-hidden />
      <h2 className="mt-4 font-serif text-3xl">Ready to place your order?</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">Stock will be reserved, every value recalculated, and then you will continue to payment.</p>
      <Button size="lg" className="mt-7" disabled={busy} onClick={submit}>
        {busy ? <SpinnerGapIcon className="animate-spin" aria-hidden /> : <PackageIcon aria-hidden />} Place order & pay
      </Button>
    </div>
  );
}
function ReviewBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-border p-5">
      <p className="text-xs font-semibold tracking-wider uppercase">{title}</p>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
function SummaryRow({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "border-t border-border pt-3 text-base font-semibold" : ""}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{formatIDR(value)}</dd>
    </div>
  );
}
