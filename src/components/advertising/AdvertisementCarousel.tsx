"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState } from "react";

import type { Advertisement } from "@/types";

import styles from "./advertising.module.css";

export interface AdvertisementCarouselProps {
  advertisements: Advertisement[];
  label?: string;
  className?: string;
  /**
   * Deliberately off by default: publication advertising should not distract
   * from reading. If enabled it pauses for hover, focus, touch, and reduced
   * motion preferences.
   */
  autoAdvanceMs?: number;
  currentDate?: Date;
}

export function AdvertisementCarousel({
  advertisements,
  label = "Sponsor message",
  className,
  autoAdvanceMs = 0,
  currentDate,
}: AdvertisementCarouselProps) {
  const activeAdvertisements = useMemo(
    () => advertisements.filter((advertisement) => isDisplayable(advertisement, currentDate)),
    [advertisements, currentDate],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [pointerStart, setPointerStart] = useState<number | null>(null);
  const carouselId = useId();

  useEffect(() => {
    setActiveIndex(0);
  }, [activeAdvertisements.length]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const count = activeAdvertisements.length;
  const canAutoAdvance = count > 1 && autoAdvanceMs > 0 && !isPaused && !prefersReducedMotion;

  useEffect(() => {
    if (!canAutoAdvance) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % count);
    }, Math.max(autoAdvanceMs, 4000));
    return () => window.clearInterval(timer);
  }, [autoAdvanceMs, canAutoAdvance, count]);

  if (!count) return null;

  function previous() {
    setActiveIndex((index) => (index - 1 + count) % count);
  }

  function next() {
    setActiveIndex((index) => (index + 1) % count);
  }

  function onPointerUp(event: React.PointerEvent<HTMLElement>) {
    if (pointerStart === null) return;
    const distance = event.clientX - pointerStart;
    setPointerStart(null);
    if (Math.abs(distance) < 38) return;
    if (distance > 0) previous();
    else next();
  }

  const classes = [styles.carousel, className].filter(Boolean).join(" ");

  return (
    <section
      className={classes}
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
      }}
      onPointerDown={(event) => setPointerStart(event.clientX)}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setPointerStart(null)}
    >
      <p className={styles.carouselLabel}>{label}</p>
      <div className={styles.viewport} id={carouselId} aria-live="polite">
        <div
          className={styles.track}
          style={{ transform: "translateX(-" + activeIndex * 100 + "%)" }}
        >
          {activeAdvertisements.map((advertisement) => (
            <AdvertisementSlide key={advertisement.id} advertisement={advertisement} />
          ))}
        </div>
      </div>
      {count > 1 ? (
        <div className={styles.carouselControls}>
          <button type="button" onClick={previous} aria-controls={carouselId} aria-label="Previous sponsor message">
            <span aria-hidden="true">←</span>
          </button>
          <div className={styles.dots} role="tablist" aria-label="Choose sponsor message">
            {activeAdvertisements.map((advertisement, index) => (
              <button
                type="button"
                key={advertisement.id}
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={"Show sponsor message " + (index + 1) + " of " + count}
                className={index === activeIndex ? styles.dotActive : ""}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
          <button type="button" onClick={next} aria-controls={carouselId} aria-label="Next sponsor message">
            <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : null}
    </section>
  );
}

function AdvertisementSlide({ advertisement }: { advertisement: Advertisement }) {
  const isExternal = /^https?:\/\//.test(advertisement.destinationUrl);

  return (
    <a
      className={styles.slide}
      href={advertisement.destinationUrl}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      aria-label={advertisement.title + " — sponsored by " + advertisement.advertiser}
    >
      <Image
        className={styles.desktopImage}
        src={advertisement.desktopImage.url}
        alt={advertisement.desktopImage.alt || advertisement.altText}
        fill
        sizes="(max-width: 700px) 0px, 100vw"
      />
      <Image
        className={styles.mobileImage}
        src={advertisement.mobileImage.url}
        alt=""
        fill
        sizes="(max-width: 700px) 100vw, 0px"
      />
      <span className={styles.slideOverlay}>
        <span>{advertisement.advertiser}</span>
        <span aria-hidden="true">Explore →</span>
      </span>
    </a>
  );
}

function isDisplayable(advertisement: Advertisement, currentDate?: Date) {
  if (!advertisement.isActive) return false;
  if (!currentDate) return true;

  const now = currentDate.getTime();
  const starts = new Date(advertisement.activeFrom).getTime();
  const ends = advertisement.activeUntil ? new Date(advertisement.activeUntil).getTime() : Number.POSITIVE_INFINITY;
  return now >= starts && now <= ends;
}
