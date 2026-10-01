import type { IconName } from "@/components/ui/icons";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  external?: boolean;
  icon?: IconName;
}

export interface Announcement {
  id?: string;
  /** `message` is the presentation alias; `text` mirrors the backend model. */
  message?: string;
  text?: string;
  href?: string;
  linkLabel?: string;
  ctaLabel?: string;
  dismissible?: boolean;
  isVisible?: boolean;
}

export interface SiteBrand {
  /** `name` is the presentation alias; the others mirror SiteConfig fields. */
  name?: string;
  organizationName?: string;
  logoText?: string;
  href?: string;
  shortName?: string;
  logoSrc?: string;
  logoAlt?: string;
}

export interface HeaderSearchResult {
  id: string;
  title: string;
  href: string;
  type: string;
  excerpt?: string;
  keywords?: string[];
}

export interface HeaderSearchConfig {
  items?: HeaderSearchResult[];
  placeholder?: string;
  label?: string;
  emptyMessage?: string;
  noResultsMessage?: string;
  onQueryChange?: (query: string) => void;
}

export interface NavigationDrawerContent {
  featureLabel?: string;
  primaryItems?: NavigationItem[];
  primaryLabel?: string;
  featureItems?: NavigationItem[];
  utilityItems?: NavigationItem[];
  mission?: string;
  missionHeading?: string;
  title?: string;
}

export interface NewsletterConfig {
  eyebrow?: string;
  heading?: string;
  description?: string;
  placeholder?: string;
  buttonLabel?: string;
  successMessage?: string;
}

export interface SocialLink {
  id?: string;
  label: string;
  href: string;
  icon?: Extract<IconName, "email" | "facebook" | "instagram" | "linkedin" | "website" | "x" | "youtube">;
  /** Compatible with the future backend `SocialLink` record. */
  platform?: "email" | "facebook" | "instagram" | "linkedin" | "website" | "x" | "youtube";
}

export interface FooterLinkGroup {
  id: string;
  label: string;
  links: NavigationItem[];
}
