export type ShippingItem = { name: string; value: number; weightGrams: number; quantity: number };
export type ShippingQuote = { provider: string; courierCode: string; courierName: string; serviceCode: string; serviceName: string; cost: number; estimateMinDays: number; estimateMaxDays: number; estimateLabel: string };
export type TrackingEvent = { status: string; note: string; occurredAt: string };
export type TrackingResult = { trackingNumber: string; status: string; events: TrackingEvent[] };

export interface ShippingProvider {
  readonly name: string;
  getRates(input: { destinationPostalCode: string; courierCodes: string[]; items: ShippingItem[] }): Promise<ShippingQuote[]>;
  track(input: { trackingNumber: string; courierCode: string }): Promise<TrackingResult>;
}
