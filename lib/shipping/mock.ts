import type { ShippingProvider, ShippingQuote, TrackingResult } from "./types";

const services = {
  jne: ["JNE", "REG", "Regular", 19000, 2, 4],
  sicepat: ["SiCepat", "REG", "Regular", 17000, 2, 3],
  anteraja: ["AnterAja", "REG", "Regular", 16500, 2, 4],
  jnt: ["J&T", "EZ", "EZ", 18000, 2, 4],
} as const;

export class MockShippingProvider implements ShippingProvider {
  readonly name = "mock";
  async getRates(input: { destinationPostalCode: string; courierCodes: string[] }) {
    const zone = Number(input.destinationPostalCode.slice(0, 1)) % 4;
    return input.courierCodes.flatMap((code): ShippingQuote[] => {
      const data = services[code as keyof typeof services];
      if (!data) return [];
      const [courierName, serviceCode, serviceName, base, min, max] = data;
      return [{ provider: this.name, courierCode: code, courierName, serviceCode, serviceName, cost: base + zone * 2500, estimateMinDays: min + zone, estimateMaxDays: max + zone, estimateLabel: `${min + zone}-${max + zone} days` }];
    });
  }
  async track(input: { trackingNumber: string; courierCode: string }): Promise<TrackingResult> {
    return { trackingNumber: input.trackingNumber, status: "IN_TRANSIT", events: [{ status: "IN_TRANSIT", note: `Paket sedang dibawa oleh ${input.courierCode.toUpperCase()}.`, occurredAt: new Date().toISOString() }] };
  }
}
