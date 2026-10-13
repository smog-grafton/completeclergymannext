import type { Metadata, Viewport } from "next";
import { DM_Sans, Libre_Baskerville } from "next/font/google";
import { Footer, SiteHeader } from "@/components/layout";
import { MediaPlaybackProvider } from "@/components/media";
import { contentRepository } from "@/lib/data";
import "./globals.css";

// Site chrome, navigation, metadata, and pages are managed in Laravel. Render
// them at request time so a Vercel build never has to depend on the API being
// reachable or able to sustain a burst of static-generation requests.
export const dynamic = "force-dynamic";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const editorial = Libre_Baskerville({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await contentRepository.getSiteConfig();
  const seo = site.defaultSeo;
  const image = seo.image?.url ?? "/images/logos/logo-cleryman.png";

  return {
    metadataBase: new URL(site.domain),
    title: { default: seo.title ?? site.organizationName, template: "%s | " + site.organizationName },
    description: seo.description ?? site.description,
    alternates: { canonical: seo.canonicalPath ?? "/" },
    openGraph: { type: "website", siteName: site.organizationName, locale: "en_UG", images: [{ url: image, alt: site.logoMarkLabel }] },
    twitter: { card: "summary_large_image", title: seo.title ?? site.organizationName, description: seo.description ?? site.description, images: [image] },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#a00035",
  colorScheme: "light",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [site, socialLinks, primary, features, drawer, footerExplore, footerFeatures, footerOrganisation, footerAccount, searchResults] = await Promise.all([
    contentRepository.getSiteConfig(),
    contentRepository.getSocialLinks(),
    contentRepository.getNavigation("primary"),
    contentRepository.getNavigation("features"),
    contentRepository.getNavigation("drawer"),
    contentRepository.getNavigation("footer-explore"),
    contentRepository.getNavigation("footer-features"),
    contentRepository.getNavigation("footer-organisation"),
    contentRepository.getNavigation("footer-account"),
    contentRepository.searchResources("", { limit: 40 }),
  ]);
  const brand = {
    name: site.organizationName,
    shortName: site.shortName,
    href: "/",
    logoSrc: site.logoSrc,
    logoAlt: site.logoMarkLabel,
  };
  const footerGroups = [
    { id: "explore", label: "Explore", links: footerExplore?.items ?? [] },
    { id: "features", label: "Features", links: footerFeatures?.items ?? [] },
    { id: "organisation", label: "Organisation", links: footerOrganisation?.items ?? [] },
    { id: "account", label: "Account", links: footerAccount?.items ?? [] },
  ];

  return (
    <html lang="en" className={`${sans.variable} ${editorial.variable}`}>
      <body>
        <MediaPlaybackProvider>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="site-canvas">
          <SiteHeader
            announcement={site.announcement && site.announcement.isVisible ? { id: String(site.announcement.id), message: site.announcement.text, href: site.announcement.href, linkLabel: site.announcement.ctaLabel } : null}
            brand={brand}
            primaryItems={primary?.items}
            featureItems={features?.items}
            drawerContent={{ utilityItems: drawer?.items, missionHeading: "For the work of ministry", mission: site.footer.missionStatement }}
            searchConfig={{
              label: `Search ${site.organizationName} resources`,
              placeholder: "Search articles, books, messages, and more",
              emptyMessage: "Begin with a title, topic, or ministry question.",
              noResultsMessage: "No resources match that search yet.",
              items: searchResults.map((result) => ({ id: `${result.type}-${result.id}`, title: result.title, href: result.href, type: result.type.replaceAll("-", " "), excerpt: result.excerpt })),
            }}
          />
          <main id="main-content">{children}</main>
          <Footer
            brand={brand}
            aboutLink={footerOrganisation?.items.find((item) => item.href === "/about")}
            groups={footerGroups}
            legalLinks={site.footer.legalLinks}
            mission={site.footer.missionStatement}
            copyright={site.footer.copyright}
            socialLinks={socialLinks.map((link) => ({ id: link.platform, label: link.label, href: link.href, icon: link.platform as "instagram" | "linkedin" | "youtube" | "x" | "website" }))}
            newsletter={{ eyebrow: "Stay connected", heading: site.footer.newsletterHeading, description: site.footer.newsletterDescription, placeholder: "Your email address", buttonLabel: "Subscribe", successMessage: "Thank you. Your place in the community is reserved." }}
          />
        </div>
        </MediaPlaybackProvider>
      </body>
    </html>
  );
}
