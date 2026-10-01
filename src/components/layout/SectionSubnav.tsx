"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavigationItem } from "./navigation.types";
import styles from "./section-subnav.module.css";

export interface SectionSubnavProps {
  activeHref?: string;
  className?: string;
  items?: NavigationItem[];
  label?: string;
  sticky?: boolean;
}

function isItemCurrent(itemHref: string, currentHref: string | null, activeHref?: string) {
  if (activeHref) {
    return itemHref === activeHref;
  }

  if (!currentHref) {
    return false;
  }

  const baseHref = itemHref.split("#")[0];
  return currentHref === baseHref;
}

/**
 * Contextual, horizontally-scrollable secondary navigation for About, account,
 * resource hubs, and any later section that benefits from local wayfinding.
 */
export function SectionSubnav({
  activeHref,
  className,
  items = [],
  label = "Section navigation",
  sticky = false,
}: SectionSubnavProps) {
  const pathname = usePathname();

  if (!items.length) {
    return null;
  }

  return (
    <nav
      aria-label={label}
      className={[styles.subnav, sticky ? styles.sticky : "", className].filter(Boolean).join(" ")}
    >
      <div className={styles.inner}>
        {items.map((item) => {
          const active = isItemCurrent(item.href, pathname, activeHref);

          if (item.external) {
            return (
              <a
                aria-current={active ? "page" : undefined}
                className={[styles.link, active ? styles.active : ""].filter(Boolean).join(" ")}
                href={item.href}
                key={item.id}
                rel="noreferrer"
                target="_blank"
              >
                {item.label}
              </a>
            );
          }

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={[styles.link, active ? styles.active : ""].filter(Boolean).join(" ")}
              href={item.href}
              key={item.id}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
