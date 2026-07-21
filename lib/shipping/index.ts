import { env } from "@/lib/env";
import { BiteshipProvider } from "./biteship";
import { MockShippingProvider } from "./mock";

export * from "./types";

export function getShippingProvider() {
  return env.BITESHIP_API_KEY ? new BiteshipProvider(env.BITESHIP_API_KEY) : new MockShippingProvider();
}
