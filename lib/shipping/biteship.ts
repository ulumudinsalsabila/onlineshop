import { env } from "@/lib/env";
import type { ShippingProvider, ShippingQuote, TrackingResult } from "./types";

type BiteshipRate = { courier_code: string; courier_name: string; courier_service_code: string; courier_service_name: string; price: number; duration?: string; shipment_duration_range?: string };

export class BiteshipProvider implements ShippingProvider {
  readonly name = "biteship";
  constructor(private readonly apiKey: string) {}

  async getRates(input: { destinationPostalCode: string; courierCodes: string[]; items: { name: string; value: number; weightGrams: number; quantity: number }[] }) {
    const response = await fetch(`${env.BITESHIP_BASE_URL}/rates/couriers`, { method: "POST", headers: { Authorization: this.apiKey, "Content-Type": "application/json" }, body: JSON.stringify({ origin_postal_code: Number(env.BITESHIP_ORIGIN_POSTAL_CODE), destination_postal_code: Number(input.destinationPostalCode), couriers: input.courierCodes.join(","), items: input.items.map((item) => ({ name: item.name, description: item.name, value: item.value, length: 20, width: 15, height: 10, weight: item.weightGrams, quantity: item.quantity })) }), cache: "no-store" });
    if (!response.ok) throw new Error(`BITESHIP_RATES_${response.status}`);
    const payload = await response.json() as { pricing?: BiteshipRate[] };
    return (payload.pricing ?? []).map((rate): ShippingQuote => {
      const range = (rate.shipment_duration_range ?? rate.duration ?? "2-5").match(/\d+/g)?.map(Number) ?? [2, 5];
      return { provider: this.name, courierCode: rate.courier_code, courierName: rate.courier_name, serviceCode: rate.courier_service_code, serviceName: rate.courier_service_name, cost: rate.price, estimateMinDays: range[0], estimateMaxDays: range[1] ?? range[0], estimateLabel: rate.duration ?? `${range[0]}-${range[1] ?? range[0]} hari` };
    });
  }

  async track(input: { trackingNumber: string; courierCode: string }): Promise<TrackingResult> {
    const response = await fetch(`${env.BITESHIP_BASE_URL}/trackings/${encodeURIComponent(input.trackingNumber)}/couriers/${encodeURIComponent(input.courierCode)}`, { headers: { Authorization: this.apiKey }, cache: "no-store" });
    if (!response.ok) throw new Error(`BITESHIP_TRACKING_${response.status}`);
    const payload = await response.json() as { status?: string; history?: { status?: string; note?: string; updated_at?: string }[] };
    return { trackingNumber: input.trackingNumber, status: payload.status ?? "UNKNOWN", events: (payload.history ?? []).map((event) => ({ status: event.status ?? "UNKNOWN", note: event.note ?? "Pembaruan pengiriman", occurredAt: event.updated_at ?? new Date().toISOString() })) };
  }
}
