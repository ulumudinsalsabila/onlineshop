import Link from "next/link";
import { EnvelopeSimpleIcon, InstagramLogoIcon, MapPinIcon, PhoneIcon, PinterestLogoIcon, TiktokLogoIcon } from "@phosphor-icons/react/dist/ssr";

import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { contactDetails, footerSections, paymentMethods, socialLinks } from "@/constants/storefront";
import { SITE_CONFIG } from "@/constants/site";

import { NewsletterForm } from "./newsletter-form";

const socialIcons = { Instagram: InstagramLogoIcon, TikTok: TiktokLogoIcon, Pinterest: PinterestLogoIcon };

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/45">
      <Container className="grid gap-12 py-14 lg:grid-cols-[1.15fr_2fr] lg:gap-20 lg:py-20">
        <div className="max-w-md">
          <Logo />
          <p className="mt-5 text-sm leading-7 text-muted-foreground">{SITE_CONFIG.description} Designed for choices that feel personal, intentional, and enduring.</p>
          <div className="mt-8">
            <h2 className="font-serif text-2xl">Private notes, thoughtfully curated.</h2>
            <p className="mt-2 text-sm text-muted-foreground">Early access to collections, editorial stories, and private invitations.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
          {footerSections.map((section) => (
            <FooterLinks key={section.title} title={section.title} links={section.links} />
          ))}
          <div>
            <h2 className="text-xs font-semibold tracking-[0.16em] uppercase">Contact</h2>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li><a href={`mailto:${contactDetails.email}`} className="flex gap-2.5 hover:text-foreground"><EnvelopeSimpleIcon className="mt-0.5 shrink-0" size={16} aria-hidden />{contactDetails.email}</a></li>
              <li><a href={`tel:${contactDetails.phone.replaceAll(" ", "")}`} className="flex gap-2.5 hover:text-foreground"><PhoneIcon className="mt-0.5 shrink-0" size={16} aria-hidden />{contactDetails.phone}</a></li>
              <li className="flex gap-2.5"><MapPinIcon className="mt-0.5 shrink-0" size={16} aria-hidden /><span>Jakarta, Indonesia<br />{contactDetails.hours}</span></li>
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-y border-border">
        <Container className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <span className="text-[0.625rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">Follow us</span>
            {socialLinks.map((social) => {
              const Icon = socialIcons[social.label];
              return <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="transition-colors hover:text-accent-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"><Icon size={19} aria-hidden /></a>;
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2" aria-label="Supported payment methods">
            {paymentMethods.map((method) => <span key={method} className="rounded-sm border border-border bg-background px-2.5 py-1 text-[0.625rem] font-bold tracking-wide text-muted-foreground">{method}</span>)}
          </div>
        </Container>
      </div>

      <Container className="flex flex-col gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/privacy" prefetch={false} className="hover:text-foreground">Privacy Policy</Link><Link href="/terms" prefetch={false} className="hover:text-foreground">Terms and Conditions</Link></div>
      </Container>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return <div><h2 className="text-xs font-semibold tracking-[0.16em] uppercase">{title}</h2><ul className="mt-5 space-y-3">{links.map((link) => <li key={link.href}><Link href={link.href} prefetch={false} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{link.label}</Link></li>)}</ul></div>;
}
