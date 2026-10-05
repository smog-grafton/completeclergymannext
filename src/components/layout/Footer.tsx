"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { postPublicApi } from "@/lib/publicApi";
import { BrandLockup } from "./BrandLockup";
import type {
  FooterLinkGroup,
  NavigationItem,
  NewsletterConfig,
  SiteBrand,
  SocialLink,
} from "./navigation.types";
import styles from "./footer.module.css";

export interface FooterProps {
  aboutLink?: NavigationItem;
  brand: SiteBrand;
  className?: string;
  copyright?: string;
  groups: FooterLinkGroup[];
  legalLinks: NavigationItem[];
  mission: string;
  newsletter?: NewsletterConfig | null;
  onNewsletterSubmit?: (email: string) => void | Promise<void>;
  socialLinks: SocialLink[];
}

function FooterLink({ item }: { item: NavigationItem }) {
  if (item.external) {
    return (
      <a href={item.href} rel="noreferrer" target="_blank">
        {item.label}
      </a>
    );
  }

  return <Link href={item.href}>{item.label}</Link>;
}

function resolveSocialIcon(social: SocialLink) {
  return social.icon ?? social.platform ?? "website";
}

/** A concise, API-ready publication footer rather than a generic sitemap wall. */
export function Footer({
  aboutLink,
  brand,
  className,
  copyright,
  groups,
  legalLinks,
  mission,
  newsletter,
  onNewsletterSubmit,
  socialLinks,
}: FooterProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const submitNewsletter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setFormError("Enter a valid email address to subscribe.");
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      if (onNewsletterSubmit) {
        await onNewsletterSubmit(trimmedEmail);
      } else {
        await postPublicApi("/subscriptions", { email: trimmedEmail, phone: phone.trim() || undefined, source: "footer", interests: hasConsent ? ["newsletter", "sms"] : ["newsletter"] });
      }
      setIsSubscribed(true);
      setEmail("");
      setPhone("");
    } catch {
      setFormError("We could not save your email just now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className={[styles.footer, className].filter(Boolean).join(" ")}>
      <div className={styles.main}>
        <section className={styles.brandColumn}>
          <BrandLockup brand={brand} inverted />
          <p>{mission}</p>
          {aboutLink?.external ? (
            <a className={styles.aboutLink} href={aboutLink.href} rel="noreferrer" target="_blank">
              {aboutLink.label}
              <Icon name="arrow-right" size={16} />
            </a>
          ) : aboutLink ? (
            <Link className={styles.aboutLink} href={aboutLink.href}>
              {aboutLink.label}
              <Icon name="arrow-right" size={16} />
            </Link>
          ) : null}
        </section>

        {groups.length ? (
          <nav aria-label="Footer navigation" className={styles.linkGroups}>
            {groups.map((group) => (
              <section className={styles.linkGroup} key={group.id}>
                <h2>{group.label}</h2>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.id}>
                      <FooterLink item={link} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        ) : null}

        {newsletter ? (
          <section aria-labelledby="footer-newsletter-heading" className={styles.newsletter}>
            {newsletter.eyebrow ? <p className={styles.eyebrow}>{newsletter.eyebrow}</p> : null}
            {newsletter.heading ? <h2 id="footer-newsletter-heading">{newsletter.heading}</h2> : null}
            {newsletter.description ? <p className={styles.newsletterDescription}>{newsletter.description}</p> : null}
            {isSubscribed ? (
              <p aria-live="polite" className={styles.success}>
                {newsletter.successMessage ?? "Thank you. Your place in the community is reserved."}
              </p>
            ) : (
              <form className={styles.newsletterForm} noValidate onSubmit={submitNewsletter}>
                <label className={styles.visuallyHidden} htmlFor="footer-newsletter-email">
                  Email address
                </label>
                <div className={styles.fieldRow}>
                  <input
                    aria-describedby={formError ? "footer-newsletter-error" : undefined}
                    autoComplete="email"
                    id="footer-newsletter-email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={newsletter.placeholder ?? "Your email address"}
                    type="email"
                    value={email}
                  />
                  <Button disabled={isSubmitting} type="submit">
                    {isSubmitting ? "Saving" : (newsletter.buttonLabel ?? "Subscribe")}
                  </Button>
                </div>
                <label className={styles.visuallyHidden} htmlFor="footer-newsletter-phone">
                  Phone number (optional)
                </label>
                <input
                  autoComplete="tel"
                  id="footer-newsletter-phone"
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Phone number (optional)"
                  type="tel"
                  value={phone}
                />
                <label className={styles.consent}>
                  <input checked={hasConsent} onChange={(event) => setHasConsent(event.target.checked)} type="checkbox" />
                  <span>I am happy to receive occasional ministry updates by email{phone ? " and SMS" : ""}.</span>
                </label>
                {formError ? (
                  <p aria-live="polite" className={styles.formError} id="footer-newsletter-error">
                    {formError}
                  </p>
                ) : null}
              </form>
            )}
          </section>
        ) : null}
      </div>

      <div className={styles.lower}>
        <p className={styles.copyright}>{copyright}</p>
        {socialLinks.length ? (
          <nav aria-label="Social channels" className={styles.socialLinks}>
            {socialLinks.map((social) => (
              <a
                aria-label={social.label}
                href={social.href}
                key={social.id ?? social.href}
                rel="noreferrer"
                target="_blank"
              >
                <Icon name={resolveSocialIcon(social)} size={18} />
              </a>
            ))}
          </nav>
        ) : null}
        {legalLinks.length ? (
          <nav aria-label="Legal navigation" className={styles.legalLinks}>
            {legalLinks.map((link) => (
              <FooterLink item={link} key={link.id} />
            ))}
          </nav>
        ) : null}
      </div>
    </footer>
  );
}
