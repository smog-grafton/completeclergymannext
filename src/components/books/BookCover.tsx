import Image from "next/image";
import type { CSSProperties } from "react";

import type { Book } from "@/types";

import styles from "./books.module.css";

export interface BookCoverProps {
  book: Pick<Book, "title" | "subtitle" | "coverImage" | "coverDesign">;
  size?: "small" | "medium" | "large";
  priority?: boolean;
  className?: string;
}

export function BookCover({ book, size = "medium", priority = false, className }: BookCoverProps) {
  const classes = [styles.bookCover, styles["bookCover" + capitalize(size)], className]
    .filter(Boolean)
    .join(" ");

  if (book.coverImage) {
    return (
      <div className={classes}>
        <Image
          src={book.coverImage.url}
          alt={book.coverImage.alt}
          fill
          priority={priority}
          sizes={coverSizes(size)}
        />
      </div>
    );
  }

  const style = {
    "--cc-book-background": book.coverDesign.background,
    "--cc-book-accent": book.coverDesign.accent,
    "--cc-book-ink": book.coverDesign.ink,
  } as CSSProperties;

  return (
    <div className={classes} style={style} role="img" aria-label={"Cover for " + book.title}>
      <span className={styles.coverMotif} data-motif={book.coverDesign.motif} aria-hidden="true" />
      <span className={styles.coverBrand}>The Complete Clergyman</span>
      <span className={styles.coverTitle}>{book.title}</span>
      {book.subtitle ? <span className={styles.coverSubtitle}>{book.subtitle}</span> : null}
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function coverSizes(size: BookCoverProps["size"]) {
  if (size === "small") return "(max-width: 700px) 34vw, 12rem";
  if (size === "large") return "(max-width: 760px) min(82vw, 27rem), 31vw";
  return "(max-width: 700px) 44vw, (max-width: 1100px) 24vw, 17rem";
}
