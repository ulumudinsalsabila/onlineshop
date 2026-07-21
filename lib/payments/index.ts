import { env } from "@/lib/env";
import { MidtransProvider } from "./midtrans";
import { MockPaymentProvider } from "./mock";

export * from "./types";
export * from "./status";

export function getPaymentProvider() { return env.MIDTRANS_SERVER_KEY ? new MidtransProvider(env.MIDTRANS_SERVER_KEY) : new MockPaymentProvider(); }
