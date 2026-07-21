export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface PriceValue {
  amount: number;
  compareAt?: number;
}
