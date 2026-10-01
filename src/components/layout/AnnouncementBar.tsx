"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { IconButton } from "@/components/ui/button";
import styles from "./site-header.module.css";
import type { Announcement } from "./navigation.types";

export interface AnnouncementBarProps {
  announcement?: Announcement | null;
}

export function AnnouncementBar({ announcement }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  const message = announcement?.message ?? announcement?.text;
  const linkLabel = announcement?.linkLabel ?? announcement?.ctaLabel;

  if (!announcement || announcement.isVisible === false || !message || !isVisible) {
    return null;
  }

  const content = (
    <>
      <span>{message}</span>
      {linkLabel ? <strong>{linkLabel}</strong> : null}
      {announcement.href ? <Icon name="arrow-right" size={16} /> : null}
    </>
  );

  return (
    <aside className={styles.announcement} aria-label="Site announcement">
      <div className={styles.announcementInner}>
        {announcement.href ? (
          <Link className={styles.announcementLink} href={announcement.href}>
            {content}
          </Link>
        ) : (
          <p className={styles.announcementText}>{content}</p>
        )}
        {announcement.dismissible ? (
          <IconButton
            aria-label="Dismiss announcement"
            className={styles.announcementDismiss}
            onClick={() => setIsVisible(false)}
          >
            <Icon name="close" size={17} />
          </IconButton>
        ) : null}
      </div>
    </aside>
  );
}
