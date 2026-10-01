import type { SVGProps } from "react";

export type IconName =
  | "arrow-right"
  | "arrow-up-right"
  | "chevron-down"
  | "chevron-left"
  | "close"
  | "facebook"
  | "email"
  | "instagram"
  | "linkedin"
  | "menu"
  | "play"
  | "search"
  | "website"
  | "x"
  | "youtube";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  name: IconName;
  size?: number;
}

/**
 * A deliberately small, dependency-free icon set for global editorial UI.
 * Icons are decorative by default; label their containing controls instead.
 */
export function Icon({ name, size = 20, ...props }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.65,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...props,
  };

  switch (name) {
    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M4 12h15" />
          <path d="m14 6 6 6-6 6" />
        </svg>
      );
    case "arrow-up-right":
      return (
        <svg {...common}>
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case "chevron-left":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="10.75" cy="10.75" r="5.75" />
          <path d="m15.2 15.2 4.3 4.3" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="m9 6 8 6-8 6V6Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common} fill="currentColor" stroke="none" viewBox="0 0 24 24">
          <path d="M13.8 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V10H8.2v3h2.6v8h3Z" />
        </svg>
      );
    case "email":
      return (
        <svg {...common}>
          <rect height="14" rx="1" width="18" x="3" y="5" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.6" r=".9" fill="currentColor" stroke="none" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common} fill="currentColor" stroke="none" viewBox="0 0 24 24">
          <path d="M6.2 8.2H3.3V21h2.9V8.2ZM4.8 3A1.7 1.7 0 1 0 4.8 6.4 1.7 1.7 0 0 0 4.8 3ZM21 13.7c0-3.9-2.1-5.7-4.8-5.7-2.2 0-3.2 1.2-3.8 2.1V8.2H9.5V21h2.9v-6.3c0-1.7.3-3.3 2.4-3.3 2 0 2.1 1.9 2.1 3.4V21H20l1-7.3Z" />
        </svg>
      );
    case "website":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.8 12h16.4M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5C9.8 18.2 8.7 15.4 8.7 12S9.8 5.8 12 3.5Z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common} fill="currentColor" stroke="none" viewBox="0 0 24 24">
          <path d="M18.9 3H22l-6.8 7.8L23 21h-6.1l-4.8-6.3L6.6 21H3.5l7.2-8.2L3.2 3h6.2l4.4 5.8L18.9 3Zm-1.1 16h1.7L8.4 4.9H6.6L17.8 19Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common} fill="currentColor" stroke="none" viewBox="0 0 24 24">
          <path d="M21.6 7.1a2.9 2.9 0 0 0-2-2C17.8 4.6 12 4.6 12 4.6s-5.8 0-7.6.5a2.9 2.9 0 0 0-2 2A30.3 30.3 0 0 0 2 12a30.3 30.3 0 0 0 .4 4.9 2.9 2.9 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.9 2.9 0 0 0 2-2A30.3 30.3 0 0 0 22 12a30.3 30.3 0 0 0-.4-4.9ZM10.1 15.1V8.9l5.3 3.1-5.3 3.1Z" />
        </svg>
      );
  }
}
