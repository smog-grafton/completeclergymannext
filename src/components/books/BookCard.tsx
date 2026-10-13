import Link from "next/link";

import type { BookWithRelations } from "@/types";

import { BookCover } from "./BookCover";
import styles from "./books.module.css";

export interface BookCardProps {
  book: BookWithRelations;
  href?: string;
  className?: string;
  priority?: boolean;
}

export function BookCard({ book, href, className, priority = false }: BookCardProps) {
  const destination = href ?? "/books/" + book.slug;
  const authorNames = book.authors.map((author) => author.name).join(", ");
  const classes = [styles.bookCard, className].filter(Boolean).join(" ");

  return (
    <article className={classes}>
      <Link className={styles.bookCoverLink} href={destination} tabIndex={-1}>
        <BookCover book={book} priority={priority} />
      </Link>
      <div className={styles.bookCardCopy}>
        <h3 className={styles.bookCardTitle}>
          <Link href={destination}>{book.title}</Link>
        </h3>
        {book.subtitle ? <p className={styles.bookCardSubtitle}>{book.subtitle}</p> : null}
        <p className={styles.bookCardAuthor}>{authorNames}</p>
        <div className={styles.bookCardFooter}>
          <span>{formatPrice(book.price.amount, book.price.currency)}</span>
          <Link href={destination} aria-label={"View " + book.title}>
            View <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat(currency === "UGX" ? "en-UG" : "en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
