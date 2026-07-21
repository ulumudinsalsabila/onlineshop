import { revalidateTag } from "next/cache";

export function invalidateStorefront() {
  revalidateTag("homepage", { expire: 0 });
  revalidateTag("products", { expire: 0 });
}
