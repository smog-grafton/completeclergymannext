import type { ReactNode } from "react";

interface PageIntroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageIntro({ eyebrow, title, description, children }: PageIntroProps) {
  return (
    <header className="page-intro">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {children}
    </header>
  );
}

interface SectionHeadingProps {
  title: string;
  href?: string;
  linkText?: string;
}

export function SectionHeading({ title, href, linkText = "Explore all" }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {href ? <a href={href}>{linkText} →</a> : null}
    </div>
  );
}
