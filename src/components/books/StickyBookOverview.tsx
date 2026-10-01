import Link from "next/link";
import type { ReactNode } from "react";

import type { BookWithRelations, RichTextBlock } from "@/types";

import { BookCover } from "./BookCover";
import { formatPrice } from "./BookCard";
import styles from "./books.module.css";

export interface StickyBookOverviewProps {
  book: BookWithRelations;
  purchaseHref?: string;
  sampleHref?: string;
  audioHref?: string;
  children?: ReactNode;
  className?: string;
}

export function StickyBookOverview({
  book,
  purchaseHref,
  sampleHref,
  audioHref,
  children,
  className,
}: StickyBookOverviewProps) {
  const hasAudio = book.formats.some((format) => format.kind === "audio" && format.isAvailable);
  const classes = [styles.stickyBookOverview, className].filter(Boolean).join(" ");
  const destination = purchaseHref ?? "/checkout?book=" + encodeURIComponent(book.slug);

  return (
    <article className={classes}>
      <aside className={styles.bookAside}>
        <div className={styles.bookSticky}>
          <BookCover book={book} size="large" priority />
          <p className={styles.bookPrice}>{formatPrice(book.price.amount, book.price.currency)}</p>
          <Link className={styles.bookPrimaryAction} href={destination}>
            Buy this book
          </Link>
          <div className={styles.bookFormats} aria-label="Available formats">
            {book.formats
              .filter((format) => format.isAvailable)
              .map((format) => (
                <span key={format.kind}>{format.label}</span>
              ))}
          </div>
        </div>
      </aside>
      <div className={styles.bookDetail}>
        <p className={styles.bookEyebrow}>Book</p>
        <h1 className={styles.bookDetailTitle}>{book.title}</h1>
        {book.subtitle ? <p className={styles.bookDetailSubtitle}>{book.subtitle}</p> : null}
        <p className={styles.bookAuthors}>By {book.authors.map((author) => author.name).join(", ")}</p>
        <div className={styles.bookActions}>
          <Link className={styles.bookPrimaryAction} href={destination}>
            Buy now
          </Link>
          <Link className={styles.bookSecondaryAction} href={sampleHref ?? "/books/" + book.slug + "/read"}>
            Read a sample
          </Link>
          {hasAudio ? (
            <Link className={styles.bookSecondaryAction} href={audioHref ?? "/books/" + book.slug + "/audio"}>
              Listen to audio
            </Link>
          ) : null}
        </div>
        <div className={styles.bookDescription}>{children ?? <RichText blocks={book.description} />}</div>
        <dl className={styles.bookFacts}>
          {book.isbn ? (
            <div>
              <dt>ISBN</dt>
              <dd>{book.isbn}</dd>
            </div>
          ) : null}
          <div>
            <dt>Pages</dt>
            <dd>{book.pageCount}</dd>
          </div>
          <div>
            <dt>Published</dt>
            <dd>{new Intl.DateTimeFormat("en", { year: "numeric" }).format(new Date(book.publishedAt))}</dd>
          </div>
          <div>
            <dt>Language</dt>
            <dd>{languageName(book.language)}</dd>
          </div>
          {book.categories.length ? (
            <div>
              <dt>Categories</dt>
              <dd>{book.categories.map((category) => category.name).join(", ")}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
}

export function RichText({ blocks }: { blocks: RichTextBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return block.level === 2 ? <h2 key={index}>{block.text}</h2> : <h3 key={index}>{block.text}</h3>;
        }
        if (block.type === "quote") {
          return (
            <blockquote key={index}>
              <p>{block.text}</p>
              {block.attribution ? <cite>{block.attribution}</cite> : null}
            </blockquote>
          );
        }
        if (block.type === "scripture") {
          return (
            <blockquote className={styles.scriptureBlock} key={index}>
              <p>{block.text}</p>
              <cite>{block.reference}</cite>
            </blockquote>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={index}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{block.text}</p>;
      })}
    </>
  );
}

function languageName(code: string) {
  if (code === "lg") return "Luganda";
  if (code === "sw") return "Swahili";
  return "English";
}
