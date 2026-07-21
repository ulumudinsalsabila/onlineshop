import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRightIcon,
  CreditCardIcon,
  FingerprintIcon,
  MagnifyingGlassIcon,
  PackageIcon,
  ShieldCheckIcon,
  ShoppingBagOpenIcon,
  TruckIcon,
} from "@phosphor-icons/react/dist/ssr";

import { Container } from "@/components/shared/container";
import { StorefrontShell } from "@/components/layout";
import { MotionSection } from "@/components/shared/motion-section";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  guaranteeItems,
  heroContent,
  homeCategories,
  shoppingSteps,
} from "@/constants/home";
import { HomeNewsletter, ProductCarousel, TestimonialCarousel } from "@/features/home";
import { productsForHome } from "@/lib/data/products";
import { publicMetadata } from "@/lib/seo";

export const metadata: Metadata = publicMetadata({ title: "Curated Fashion & Preloved Icons", description: "Discover premium fashion, new collections, and authenticated preloved pieces through a modern, personal shopping experience.", path: "/" });

const guaranteeIcons = {
  inspect: MagnifyingGlassIcon,
  authentic: FingerprintIcon,
  secure: ShieldCheckIcon,
  delivery: TruckIcon,
};

export default async function Home() {
  await connection();
  const database = await productsForHome();
  const isVisible = (key: string) => !database.sections.length || database.sections.some((section) => section.key === key && section.isVisible);
  const content = database.banner ? { eyebrow: database.banner.eyebrow ?? "IVORY", title: database.banner.title, description: database.banner.body ?? "", image: database.banner.imageUrl } : heroContent;
  return (
    <StorefrontShell>
      {isVisible("hero") ? <section className="relative isolate min-h-[43rem] overflow-hidden bg-primary text-white sm:min-h-[48rem] lg:min-h-[calc(100svh-5rem)]">
        <Image src={content.image} alt="Model wearing ivory tailoring with a taupe bag in a stone gallery" width={1536} height={1024} priority sizes="100vw" className="absolute inset-0 size-full object-cover object-[68%_center] lg:object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/48 to-black/5 sm:from-black/75 sm:via-black/38" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <Container className="relative flex min-h-[43rem] items-end pb-14 sm:min-h-[48rem] sm:items-center sm:pb-0 lg:min-h-[calc(100svh-5rem)]">
          <MotionSection className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.22em] text-white/78 uppercase">{content.eyebrow}</p>
            <h1 className="mt-5 font-serif text-[clamp(3.25rem,7vw,7.25rem)] leading-[0.88] font-medium tracking-[-0.035em] text-balance">{content.title}</h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/80 sm:text-base">{content.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="group bg-white text-primary hover:bg-white/90"><Link href="/new-arrivals" prefetch={false}>Shop now <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" aria-hidden /></Link></Button>
              <Button asChild size="lg" variant="outline" className="border-white/60 bg-transparent text-white hover:bg-white hover:text-primary"><Link href="/preloved" prefetch={false}>Explore preloved</Link></Button>
            </div>
          </MotionSection>
        </Container>
      </section> : null}

      {isVisible("categories") ? <MotionSection className="py-(--space-section)">
        <Container>
          <SectionHeading eyebrow="Curated worlds" title="Shop by category" description="Begin with the silhouette you seek, then discover the details that feel most personal." />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-12 lg:grid-rows-2">
            {homeCategories.map((category, index) => (
              <Link
                key={category.href}
                href={category.href}
                prefetch={false}
                className={`group relative isolate min-h-72 overflow-hidden bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${index === 0 ? "col-span-2 lg:col-span-5 lg:row-span-2 lg:min-h-[45rem]" : index === 1 || index === 4 ? "lg:col-span-4" : "lg:col-span-3"}`}
              >
                <Image src={category.image} alt="" width={1254} height={1254} sizes={index === 0 ? "(max-width: 1024px) 100vw, 42vw" : "(max-width: 1024px) 50vw, 25vw"} className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                  <h2 className="font-serif text-3xl sm:text-4xl">{category.label}</h2>
                  <p className="mt-1 hidden text-sm text-white/72 sm:block">{category.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[0.625rem] font-semibold tracking-[0.15em] uppercase">Explore <ArrowRightIcon className="transition-transform group-hover:translate-x-1" aria-hidden /></span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </MotionSection> : null}

      {isVisible("new-arrivals") ? <MotionSection className="border-y border-border bg-card py-(--space-section)">
        <Container>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Just landed" title="New arrivals" description="The latest pieces, defined by confident forms, quiet colour, and quality you can feel." />
            <TextLink href="/new-arrivals">View all arrivals</TextLink>
          </div>
          <div className="mt-5"><ProductCarousel products={database.newArrivals} label="New arrivals" /></div>
        </Container>
      </MotionSection> : null}

      {isVisible("featured") ? <MotionSection className="py-(--space-section)">
        <Container className="grid items-stretch lg:grid-cols-12">
          <div className="relative min-h-[34rem] overflow-hidden lg:col-span-7 lg:min-h-[49rem]">
            <Image src="/images/home/featured-men.png" alt="Man in charcoal tailoring carrying a leather weekender" width={1122} height={1402} sizes="(max-width: 1024px) 100vw, 58vw" className="absolute inset-0 size-full object-cover" />
          </div>
          <div className="relative flex min-h-[38rem] flex-col justify-between bg-primary p-8 text-primary-foreground sm:p-12 lg:col-span-5 lg:min-h-[49rem] lg:p-14">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-primary-foreground/60 uppercase">Featured collection · No. 03</p>
              <h2 className="mt-5 max-w-md font-serif text-(length:--text-heading-1) leading-[0.92] font-medium">The art of considered dressing.</h2>
              <p className="mt-6 max-w-sm text-sm leading-7 text-primary-foreground/68">Relaxed tailoring, purposeful leather goods, and a neutral palette designed to move from morning to evening.</p>
              <Button asChild size="lg" variant="outline" className="group mt-8 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"><Link href="/collections/considered-dressing" prefetch={false}>Discover the edit <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" aria-hidden /></Link></Button>
            </div>
            <div className="relative mt-12 aspect-[16/10] w-4/5 self-end overflow-hidden border-8 border-primary lg:-ml-24 lg:w-[90%] lg:self-start">
              <Image src="/images/storefront/mega-menu-campaign.png" alt="Structured taupe bag displayed on a pedestal" width={1122} height={1402} sizes="(max-width: 1024px) 70vw, 30vw" className="absolute inset-0 size-full object-cover" />
            </div>
          </div>
        </Container>
      </MotionSection> : null}

      {isVisible("preloved") ? <MotionSection className="bg-[#ded5c8] py-(--space-section)">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div>
              <Badge variant="outline" className="border-foreground/30 bg-transparent px-3 py-1 text-[0.625rem] tracking-[0.16em] uppercase">Authenticated preloved</Badge>
              <h2 className="mt-5 font-serif text-(length:--text-heading-1) leading-[0.95]">Icons with a story worth continuing.</h2>
            </div>
            <div className="grid gap-5 border-t border-foreground/20 pt-6 sm:grid-cols-2 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
              <div><FingerprintIcon size={26} weight="light" aria-hidden /><h3 className="mt-3 font-serif text-2xl">Authenticity, assured</h3><p className="mt-2 text-sm leading-6 text-foreground/65">Every piece is inspected before listing and reviewed again before dispatch.</p></div>
              <div><ShieldCheckIcon size={26} weight="light" aria-hidden /><h3 className="mt-3 font-serif text-2xl">Condition, clearly noted</h3><p className="mt-2 text-sm leading-6 text-foreground/65">Pristine, Excellent, or Very Good—each condition is described with complete transparency.</p></div>
            </div>
          </div>
          <div className="mt-8"><ProductCarousel products={database.prelovedProducts} label="Preloved collection" /></div>
          <div className="mt-6"><TextLink href="/preloved">Explore all preloved</TextLink></div>
        </Container>
      </MotionSection> : null}

      {isVisible("brands") ? <MotionSection className="py-(--space-section)">
        <Container>
          <SectionHeading align="center" eyebrow="A considered directory" title="Shop by brand" description="Independent houses and contemporary labels selected for their craft, point of view, and longevity." />
          <div className="mt-10 grid grid-cols-2 border-t border-l border-border sm:grid-cols-3 lg:grid-cols-6">
            {database.brands.map((brand) => <Link key={brand.slug} href={`/brand/${brand.slug}`} prefetch={false} className="group grid min-h-28 place-items-center border-r border-b border-border bg-card px-4 text-center font-serif text-xl transition-colors hover:bg-secondary focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-ring"><span className="transition-transform group-hover:-translate-y-0.5">{brand.name}</span></Link>)}
          </div>
        </Container>
      </MotionSection> : null}

      {isVisible("promotion") ? <MotionSection className="pb-(--space-section)">
        <Container>
          <div className="grid overflow-hidden bg-accent lg:grid-cols-2">
            <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16 lg:py-20">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase">Mid-year private sale</p>
              <h2 className="mt-4 font-serif text-(length:--text-heading-1) leading-[0.92]">A beautiful reason to linger.</h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-accent-foreground/70">Up to 40% off selected seasonal pieces, available for a limited time.</p>
              <Button asChild size="lg" className="group mt-8 w-fit"><Link href="/sale" prefetch={false}>Shop the sale <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" aria-hidden /></Link></Button>
            </div>
            <div className="relative min-h-[27rem] lg:min-h-[35rem]"><Image src="/images/storefront/product-silk-scarf.png" alt="Silk scarf in an ivory, charcoal, and soft gold palette" width={1254} height={1254} sizes="(max-width: 1024px) 100vw, 50vw" className="absolute inset-0 size-full object-cover" /></div>
          </div>
        </Container>
      </MotionSection> : null}

      {isVisible("authenticity") ? <MotionSection className="border-y border-border bg-card py-(--space-section)">
        <Container>
          <SectionHeading align="center" eyebrow="The IVORY promise" title="Confidence in every detail" description="From the first inspection to final delivery, every stage is designed for peace of mind." />
          <div className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {guaranteeItems.map((item) => {
              const Icon = guaranteeIcons[item.icon];
              return <article key={item.title} className="bg-background p-7 sm:p-9"><Icon size={28} weight="light" aria-hidden /><h3 className="mt-8 font-serif text-2xl">{item.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p></article>;
            })}
          </div>
        </Container>
      </MotionSection> : null}

      {isVisible("how-to-shop") ? <MotionSection className="py-(--space-section)">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr]">
            <SectionHeading eyebrow="Simple by design" title="How to shop" description="Four clear steps, from discovery to delivery." />
            <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {shoppingSteps.map((step, index) => {
                const StepIcon = [ShoppingBagOpenIcon, PackageIcon, CreditCardIcon, TruckIcon][index];
                return <li key={step.number} className="border-t border-border pt-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-wider text-muted-foreground">{step.number}</span><StepIcon size={22} weight="light" aria-hidden /></div><h3 className="mt-8 font-serif text-2xl">{step.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p></li>;
              })}
            </ol>
          </div>
        </Container>
      </MotionSection> : null}

      {isVisible("testimonials") ? <MotionSection className="bg-primary py-(--space-section) text-primary-foreground">
        <Container>
          <p className="mb-10 text-center text-xs font-semibold tracking-[0.2em] text-primary-foreground/55 uppercase">Notes from our community</p>
          <TestimonialCarousel testimonials={database.testimonials} />
        </Container>
      </MotionSection> : null}

      {isVisible("newsletter") ? <MotionSection className="py-(--space-section)">
        <Container className="text-center">
          <SectionHeading align="center" eyebrow="The private list" title="Good things, thoughtfully shared." description="Receive early access to collections, stories behind the craft, and occasional private invitations." />
          <HomeNewsletter />
          <Separator className="mx-auto mt-12 max-w-3xl" />
        </Container>
      </MotionSection> : null}
    </StorefrontShell>
  );
}

function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} prefetch={false} className="group inline-flex w-fit items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">{children}<ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" aria-hidden /></Link>;
}
