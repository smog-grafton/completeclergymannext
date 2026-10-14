"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icons";
import { IconButton } from "@/components/ui/button";
import { AnnouncementBar } from "./AnnouncementBar";
import { BrandLockup } from "./BrandLockup";
import { NavigationDrawer } from "./NavigationDrawer";
import type {
  Announcement,
  HeaderSearchConfig,
  HeaderSearchResult,
  NavigationDrawerContent,
  NavigationItem,
  SiteBrand,
} from "./navigation.types";
import { SearchPanel } from "./SearchPanel";
import { useAccountAuth } from "@/components/account/AccountAuthProvider";
import styles from "./site-header.module.css";

export interface SiteHeaderProps {
  /** A backend-managed announcement. Pass `null` to hide it. */
  announcement?: Announcement | null;
  brand: SiteBrand;
  className?: string;
  /** Alias used by the content repository integration. */
  drawerContent?: NavigationDrawerContent;
  /** Zero-based location of the Features control within desktop navigation. */
  featurePosition?: number;
  featurePanelDescription?: string;
  featurePanelEyebrow?: string;
  featureItems?: NavigationItem[];
  featuresLabel?: string;
  /** Optional callbacks make local UI state observable by a future shell/store. */
  onDrawerOpenChange?: (open: boolean) => void;
  onSearchResultSelect?: (result: HeaderSearchResult) => void;
  /** Alias used by the content repository integration. */
  primaryItems?: NavigationItem[];
  primaryNavigation?: NavigationItem[];
  /** Alias used by the content repository integration. */
  searchConfig?: HeaderSearchConfig;
  search?: HeaderSearchConfig;
  sideNavigation?: NavigationDrawerContent;
}

function isCurrentPath(href: string, pathname: string | null) {
  if (!pathname || href.startsWith("http")) {
    return false;
  }

  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function HeaderLink({ item, pathname }: { item: NavigationItem; pathname: string | null }) {
  const active = isCurrentPath(item.href, pathname);
  const className = [styles.navLink, active ? styles.navLinkActive : ""].filter(Boolean).join(" ");

  if (item.external) {
    return (
      <a className={className} href={item.href} rel="noreferrer" target="_blank">
        {item.label}
      </a>
    );
  }

  return (
    <Link aria-current={active ? "page" : undefined} className={className} href={item.href}>
      {item.label}
    </Link>
  );
}

/**
 * Global editorial header. It owns desktop Features/search disclosure and the
 * portal-based navigation drawer. Its props intentionally mirror simple API
 * records supplied by Laravel.
 */
export function SiteHeader({
  announcement = null,
  brand,
  className,
  drawerContent,
  featurePanelDescription = "Practical pathways for study, service, prayer, and shared ministry.",
  featurePanelEyebrow = "Find your next resource",
  featureItems = [],
  featuresLabel = "Features",
  featurePosition = 4,
  onDrawerOpenChange,
  onSearchResultSelect,
  primaryItems,
  primaryNavigation = [],
  searchConfig,
  search = {},
  sideNavigation = {},
}: SiteHeaderProps) {
  const pathname = usePathname();
  const { state: accountState, user, signOut } = useAccountAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const featureRegionRef = useRef<HTMLDivElement>(null);
  const featureButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const resolvedPrimaryNavigation = primaryItems ?? primaryNavigation;
  const resolvedSearch = searchConfig ?? search;
  const resolvedDrawerContent = drawerContent ?? sideNavigation;
  const beforeFeatures = resolvedPrimaryNavigation.slice(0, featurePosition);
  const afterFeatures = resolvedPrimaryNavigation.slice(featurePosition);
  const featuresAreActive = featureItems.some((item) => isCurrentPath(item.href, pathname));

  const closeFeatures = (returnFocus = false) => {
    setIsFeaturesOpen(false);
    if (returnFocus) {
      window.setTimeout(() => featureButtonRef.current?.focus(), 0);
    }
  };

  const closeSearch = (returnFocus = false) => {
    setIsSearchOpen(false);
    if (returnFocus) {
      window.setTimeout(() => searchButtonRef.current?.focus(), 0);
    }
  };

  const setDrawerOpen = (nextOpen: boolean) => {
    setIsDrawerOpen(nextOpen);
    onDrawerOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (!isFeaturesOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !featureRegionRef.current?.contains(event.target)) {
        closeFeatures();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFeatures(true);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isFeaturesOpen]);

  useEffect(() => {
    // A route update is a natural close point for all temporary navigation UI.
    setIsFeaturesOpen(false);
    setIsSearchOpen(false);
    setDrawerOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleFeatures = () => {
    setIsSearchOpen(false);
    setDrawerOpen(false);
    setIsFeaturesOpen((current) => !current);
  };

  const toggleSearch = () => {
    setIsFeaturesOpen(false);
    setDrawerOpen(false);
    setIsSearchOpen((current) => !current);
  };

  const openDrawer = () => {
    setIsFeaturesOpen(false);
    setIsSearchOpen(false);
    setDrawerOpen(true);
  };

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      setDrawerOpen(false);
      return;
    }

    openDrawer();
  };

  const signOutAndReturnHome = async () => {
    await signOut();
    window.location.assign("/");
  };

  return (
    <div className={[styles.shell, className].filter(Boolean).join(" ")}>
      <AnnouncementBar announcement={announcement} />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <BrandLockup brand={brand} />

          <nav aria-label="Primary navigation" className={styles.desktopNavigation}>
            {beforeFeatures.map((item) => (
              <HeaderLink item={item} key={item.id} pathname={pathname} />
            ))}
            {featureItems.length ? (
              <div className={styles.featureControl} ref={featureRegionRef}>
                <button
                  aria-controls="site-feature-panel"
                  aria-expanded={isFeaturesOpen}
                  className={[styles.navLink, styles.featureButton, featuresAreActive ? styles.navLinkActive : ""]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={toggleFeatures}
                  ref={featureButtonRef}
                  type="button"
                >
                  {featuresLabel}
                  <Icon
                    className={[styles.featureChevron, isFeaturesOpen ? styles.featureChevronOpen : ""]
                      .filter(Boolean)
                      .join(" ")}
                    name="chevron-down"
                    size={15}
                  />
                </button>

                {isFeaturesOpen ? (
                  <section
                    aria-label="Featured destinations"
                    className={styles.featurePanel}
                    id="site-feature-panel"
                  >
                    <div className={styles.featurePanelInner}>
                      <div className={styles.featurePanelIntro}>
                        <p className={styles.featurePanelEyebrow}>{featurePanelEyebrow}</p>
                        <p>{featurePanelDescription}</p>
                      </div>
                      <nav aria-label="Featured destinations" className={styles.featurePanelNav}>
                        {featureItems.map((item) => (
                          <Link className={styles.featurePanelLink} href={item.href} key={item.id}>
                            <span>{item.label}</span>
                            {item.description ? <small>{item.description}</small> : null}
                            <Icon className={styles.featurePanelArrow} name="arrow-right" size={18} />
                          </Link>
                        ))}
                      </nav>
                    </div>
                  </section>
                ) : null}
              </div>
            ) : null}
            {afterFeatures.map((item) => (
              <HeaderLink item={item} key={item.id} pathname={pathname} />
            ))}
          </nav>

          <div className={styles.headerActions}>
            {accountState === "authenticated" && user ? (
              <details className={styles.accountMenu}>
                <summary aria-label="Open your account menu" className={styles.accountLink}>
                  <Icon name="user" size={20} />
                  <span>{user.name.split(" ")[0]}</span>
                </summary>
                <div className={styles.accountMenuPanel}>
                  <p className={styles.accountMenuIdentity}>{user.name}</p>
                  <Link href="/account">My account</Link>
                  <Link href="/account/library">My library</Link>
                  <Link href="/account/orders">Orders</Link>
                  <Link href="/account/subscriptions">Subscriptions</Link>
                  <Link href="/account/payments">Payments</Link>
                  <button onClick={() => void signOutAndReturnHome()} type="button">Sign out</button>
                </div>
              </details>
            ) : accountState === "unauthenticated" ? (
              <>
                <Link aria-label="Sign in" className={styles.accountLink} href="/login"><Icon name="user" size={20} /><span>Sign in</span></Link>
                <Link className={styles.joinLink} href="/register">Join</Link>
              </>
            ) : (
              <Link aria-label="Your account" className={styles.accountLink} href="/account"><Icon name="user" size={20} /><span>Account</span></Link>
            )}
            <IconButton
              aria-controls="site-search-panel"
              aria-expanded={isSearchOpen}
              aria-label="Search resources"
              onClick={toggleSearch}
              ref={searchButtonRef}
            >
              <Icon name="search" size={21} />
            </IconButton>
            <IconButton
              aria-expanded={isDrawerOpen}
              aria-label={isDrawerOpen ? "Close navigation" : "Open navigation"}
              onClick={toggleDrawer}
              ref={menuButtonRef}
            >
              <Icon name="menu" size={23} />
            </IconButton>
          </div>
        </div>

        <SearchPanel
          config={resolvedSearch}
          onClose={() => closeSearch(true)}
          onResultSelect={(result) => {
            onSearchResultSelect?.(result);
            closeSearch();
          }}
          open={isSearchOpen}
        />
      </header>

      <NavigationDrawer
        content={resolvedDrawerContent}
        featureItems={featureItems}
        onClose={() => setDrawerOpen(false)}
        open={isDrawerOpen}
        primaryItems={resolvedPrimaryNavigation}
        returnFocusRef={menuButtonRef}
      />
    </div>
  );
}

// Compatibility re-export for layout integrations that import both globals
// from the historical SiteHeader module path.
export { Footer } from "./Footer";
