"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AccountApiError, accountJson } from "@/lib/accountApi";
import { useAccountAuth } from "@/components/account/AccountAuthProvider";

type Membership = { id: number; status: string; startsAt?: string; endsAt?: string; autoRenews: boolean; plan?: { name: string; slug: string } | null };
type LibraryBook = { id: number; title: string; slug: string; authors: string[]; accessType: string; formats?: Array<{ kind: string; isAvailable: boolean }> };
type Registration = { id: number; confirmationCode: string; status: string; paymentStatus: string; attendeeCount: number; event?: { title: string; slug: string; startsAt?: string } };
type AccountPanel = "library" | "membership" | "registrations";

const panelUnavailableMessage = "This part of your account is temporarily unavailable. Please try again shortly.";

export function AccountDashboard() {
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [unavailablePanels, setUnavailablePanels] = useState<Set<AccountPanel>>(new Set());
  const { state: authState, user: account, refresh, signOut } = useAccountAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (authState === "unauthenticated") router.replace(`/login?next=${encodeURIComponent(pathname || "/account")}`);
  }, [authState, pathname, router]);

  useEffect(() => {
    if (authState !== "authenticated") return;
    let cancelled = false;
    const request = <T,>(path: string) => accountJson<{ data: T }>(`/account${path}`);

    void Promise.allSettled([
      request<{ subscriptions?: Membership[] }>("/"),
      request<LibraryBook[]>("/library"),
      request<Registration[]>("/registrations"),
    ]).then(([profile, books, events]) => {
      if (cancelled) return;

      const failures = [profile, books, events]
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((result) => result.reason);

      if (failures.some((reason) => reason instanceof AccountApiError && reason.status === 401)) {
        void refresh();
        return;
      }

      const unavailable = new Set<AccountPanel>();
      if (profile.status === "fulfilled") setMemberships(profile.value.data.subscriptions ?? []);
      else unavailable.add("membership");
      if (books.status === "fulfilled") setLibrary(books.value.data);
      else unavailable.add("library");
      if (events.status === "fulfilled") setRegistrations(events.value.data);
      else unavailable.add("registrations");
      setUnavailablePanels(unavailable);
    });

    return () => { cancelled = true; };
  }, [authState, refresh]);

  if (authState !== "authenticated") return <div className="surface-panel" aria-busy="true"><p>Checking your account…</p></div>;
  if (!account) return <div className="surface-panel" aria-busy="true"><p>Loading your account…</p></div>;
  return <><section className="surface-panel"><p className="eyebrow">Signed in</p><h2 style={{ marginTop: 0 }}>{account.name}</h2><p>{account.email}{account.phone ? `${account.email ? " · " : ""}${account.phone}` : ""}{account.country ? ` · ${account.country}` : ""}</p><p><Link className="text-link" href="/account/profile">Edit profile →</Link></p><button className="button--secondary" onClick={() => void signOut().then(() => router.replace("/"))} type="button">Sign out</button></section><div className="grid-3" style={{ marginTop: 28 }}><section className="surface-panel"><p className="eyebrow">Library</p><h2 style={{ marginTop: 0 }}>Your books</h2>{unavailablePanels.has("library") ? <p role="status">{panelUnavailableMessage}</p> : library.length ? <ul style={{ paddingLeft: 20 }}>{library.map((book) => <li key={book.id}><Link className="text-link" href={`/books/${book.slug}/read${book.formats?.some((format) => format.kind === "flipbook" && format.isAvailable) ? "?format=flipbook" : ""}`}>{book.title}</Link></li>)}</ul> : <p>No verified books yet. Completed purchases and an active subscription appear here.</p>}<Link className="text-link" href="/account/library">Open library →</Link></section><section className="surface-panel"><p className="eyebrow">Membership</p><h2 style={{ marginTop: 0 }}>Your plan</h2>{unavailablePanels.has("membership") ? <p role="status">{panelUnavailableMessage}</p> : memberships.length ? <ul style={{ paddingLeft: 20 }}>{memberships.map((membership) => <li key={membership.id}>{membership.plan?.name ?? "Membership"} · {membership.status}{membership.endsAt ? ` · ends ${new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(membership.endsAt))}` : ""}</li>)}</ul> : <p>You do not have a membership yet.</p>}<Link className="text-link" href="/account/subscriptions">View memberships →</Link></section><section className="surface-panel"><p className="eyebrow">Events</p><h2 style={{ marginTop: 0 }}>Registrations</h2>{unavailablePanels.has("registrations") ? <p role="status">{panelUnavailableMessage}</p> : registrations.length ? <ul style={{ paddingLeft: 20 }}>{registrations.map((registration) => <li key={registration.id}>{registration.event?.title ?? "Event"} · {registration.status} · {registration.confirmationCode}</li>)}</ul> : <p>No event registrations yet.</p>}<Link className="text-link" href="/events">Explore events →</Link></section></div></>;
}
