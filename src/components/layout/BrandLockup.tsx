import Link from "next/link";
import Image from "next/image";
import styles from "./site-header.module.css";
import type { SiteBrand } from "./navigation.types";

interface BrandLockupProps {
  brand: SiteBrand;
  inverted?: boolean;
  compact?: boolean;
}

/** Uses the CMS-supplied brand asset. */
export function BrandLockup({ brand, compact = false, inverted = false }: BrandLockupProps) {
  const brandName = brand.name ?? brand.logoText ?? brand.organizationName ?? "";
  const brandHref = brand.href ?? "/";
  const classNames = [
    styles.brand,
    inverted ? styles.brandInverted : "",
    compact ? styles.brandCompact : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link className={classNames} href={brandHref} aria-label={brandName}>
      {brand.logoSrc ? (
        // The actual brand asset is intentionally supplied by content/config, not embedded in layout code.
        <Image
          alt={brand.logoAlt ?? brandName}
          className={styles.brandImage}
          height={887}
          src={brand.logoSrc}
          width={1774}
        />
      ) : <span className={styles.brandWords}>{brandName}</span>}
    </Link>
  );
}
