import { FloatingActions } from "./floating-actions";
import { PageTransitionIndicator } from "./page-transition-indicator";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { MiniCart } from "@/features/cart";

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <PageTransitionIndicator />
      <SiteHeader />
      <MiniCart />
      <main id="main-content" className="flex-1">{children}</main>
      <SiteFooter />
      <FloatingActions />
    </div>
  );
}
