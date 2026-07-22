import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StorefrontShell } from "@/components/layout";
import { Container } from "@/components/shared/container";
import { SellerApplicationForm } from "@/components/seller/seller-application-form";
import { requireUser } from "@/lib/auth-guard";
import { getSellerForUser } from "@/lib/seller/auth";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sell with IVORY",
  ...privateMetadata,
};

export default async function SellPage() {
  await requireUser();
  const seller = await getSellerForUser();
  if (seller && seller.status !== "REJECTED") redirect("/seller");
  return (
    <StorefrontShell>
      <Container className="grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase">Consignment · Curated</p>
          <h1 className="mt-4 font-serif text-5xl sm:text-6xl">Give an icon its next chapter.</h1>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">Every seller and product goes through review. We handle authentication, curation, listings, transactions, and shipping—this is not an open marketplace.</p>
          <ol className="mt-8 space-y-3 text-sm">
            {["Submit your seller profile", "Send product details and photos", "Receive an estimate after review", "Receive your payout after the return period"].map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="text-[#9d895c]">0{index + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
        <section className="border border-border bg-secondary/25 p-6 sm:p-8">
          <h2 className="font-serif text-3xl">Seller application</h2>
          <p className="mt-2 text-sm text-muted-foreground">This data is used only for review and payment.</p>
          <div className="mt-7">
            <SellerApplicationForm />
          </div>
        </section>
      </Container>
    </StorefrontShell>
  );
}
