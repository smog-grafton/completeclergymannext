"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/icons";
import { IconButton } from "@/components/ui/button";
import styles from "./site-header.module.css";
import type { NavigationDrawerContent, NavigationItem } from "./navigation.types";

const focusableSelector = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export interface NavigationDrawerProps {
  content: NavigationDrawerContent;
  featureItems: NavigationItem[];
  onClose: () => void;
  open: boolean;
  primaryItems: NavigationItem[];
  returnFocusRef?: RefObject<HTMLElement | null>;
}

function DrawerLink({ item, onNavigate }: { item: NavigationItem; onNavigate: () => void }) {
  const rel = item.external ? "noreferrer" : undefined;
  const target = item.external ? "_blank" : undefined;

  return (
    <a className={styles.drawerLink} href={item.href} onClick={onNavigate} rel={rel} target={target}>
      <span>{item.label}</span>
      {item.description ? <small>{item.description}</small> : null}
    </a>
  );
}

/**
 * This drawer is portaled to `document.body` so it remains fixed while a
 * `.site-canvas` ancestor shifts left on desktop. See SiteHeader's CSS for
 * the deliberately non-overlay canvas movement.
 */
export function NavigationDrawer({
  content,
  featureItems,
  onClose,
  open,
  primaryItems,
  returnFocusRef,
}: NavigationDrawerProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [isPresent, setIsPresent] = useState(open);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileDrawer, setIsMobileDrawer] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const headingId = useId();

  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 880px)");
    const updateDrawerMode = () => setIsMobileDrawer(mobileQuery.matches);
    updateDrawerMode();
    mobileQuery.addEventListener("change", updateDrawerMode);
    return () => mobileQuery.removeEventListener("change", updateDrawerMode);
  }, []);

  useEffect(() => {
    if (open) {
      setIsPresent(true);
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    setIsVisible(false);
    const timer = window.setTimeout(() => setIsPresent(false), 300);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const preferredReturnFocus = returnFocusRef?.current;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.classList.add("cc-navigation-drawer-open");
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 25);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      // Desktop navigation is a deliberate extension of the pushed canvas, so
      // the visible site remains usable. The full-screen mobile menu is modal.
      if (event.key !== "Tab" || !isMobileDrawer) {
        return;
      }

      const focusableElements = Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      );

      if (!focusableElements.length) {
        event.preventDefault();
        drawerRef.current?.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !drawerRef.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      body.classList.remove("cc-navigation-drawer-open");
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;

      const target = preferredReturnFocus ?? previouslyFocusedRef.current;
      window.setTimeout(() => target?.focus(), 0);
    };
  }, [isMobileDrawer, onClose, open, returnFocusRef]);

  if (!hasMounted || !isPresent) {
    return null;
  }

  const drawerPrimaryItems = content.primaryItems ?? primaryItems;
  const drawerFeatureItems = content.featureItems ?? featureItems;
  const utilityItems = content.utilityItems ?? [];

  return createPortal(
    <>
      <button
        aria-hidden="true"
        aria-label="Close navigation"
        className={[styles.drawerBackdrop, isVisible ? styles.drawerBackdropOpen : ""].filter(Boolean).join(" ")}
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <aside
        aria-hidden={!open}
        aria-labelledby={headingId}
        aria-modal={isMobileDrawer || undefined}
        className={[styles.drawer, isVisible ? styles.drawerOpen : ""].filter(Boolean).join(" ")}
        ref={drawerRef}
        role={isMobileDrawer ? "dialog" : "navigation"}
        tabIndex={-1}
      >
        <div className={styles.drawerTopline}>
          <p className={styles.drawerEyebrow} id={headingId}>
            {content.title ?? "Explore Complete Clergyman"}
          </p>
          <IconButton
            aria-label="Close navigation"
            className={styles.drawerClose}
            onClick={onClose}
            ref={closeButtonRef}
            tone="dark"
          >
            <Icon name="close" size={22} />
          </IconButton>
        </div>

        <nav aria-label={content.primaryLabel ?? "Primary navigation"} className={styles.drawerPrimaryNav}>
          {drawerPrimaryItems.map((item) => (
            <DrawerLink item={item} key={item.id} onNavigate={onClose} />
          ))}
        </nav>

        {drawerFeatureItems.length ? (
          <section className={styles.drawerFeatureSection}>
            <p className={styles.drawerSectionLabel}>{content.featureLabel ?? "Explore resources by"}</p>
            <nav aria-label="Featured destinations" className={styles.drawerFeatureNav}>
              {drawerFeatureItems.map((item) => (
                <DrawerLink item={item} key={item.id} onNavigate={onClose} />
              ))}
            </nav>
          </section>
        ) : null}

        <div className={styles.drawerLower}>
          {content.mission ? (
            <div className={styles.drawerMission}>
              {content.missionHeading ? <p>{content.missionHeading}</p> : null}
              <span>{content.mission}</span>
            </div>
          ) : null}
          {utilityItems.length ? (
            <nav aria-label="Organisation links" className={styles.drawerUtilityNav}>
              {utilityItems.map((item) => (
                <DrawerLink item={item} key={item.id} onNavigate={onClose} />
              ))}
            </nav>
          ) : null}
        </div>
      </aside>
    </>,
    document.body,
  );
}
