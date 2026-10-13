"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { accountJson, accountFetch, accessToken, clearAccessToken } from "@/lib/accountApi";

type Account = { id: number; name: string; email?: string | null; phone?: string; country?: string; roles: string[] };
type Membership = { id: number; status: string; startsAt?: string; endsAt?: string; autoRenews: boolean; plan?: { name: string; slug: string } | null };
type LibraryBook = { id: number; title: string; slug: string; authors: string[]; accessType: string; formats?: Array<{ kind: string; isAvailable: boolean }> };
type Registration = { id: number; confirmationCode: string; status: string; paymentStatus: string; attendeeCount: number; event?: { title: string; slug: string; startsAt?: string } };

export function AccountDashboard() {
  const [account, setAccount] = useState<Account | null>(null);
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [error, setError] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  useEffect(() => {
    const token = accessToken();
    setHasToken(Boolean(token));
    if (!token || !apiBase) return;
    const request = <T,>(path: string) => accountJson<{ data: T }>(`/account${path}`);
    Promise.all([request<{ user: Account; subscriptions?: Membership[] }>("/"), request<LibraryBook[]>("/library"), request<Registration[]>("/registrations")]).then(([profile, books, events]) => { setAccount(profile.data.user); setMemberships(profile.data.subscriptions ?? []); setLibrary(books.data); setRegistrations(events.data); }).catch((reason: Error) => setError(reason.message));
  }, [apiBase]);

  if (!hasToken) return <div className="empty-state"><h2>Sign in to see your dashboard.</h2><p>Your personal library, event registrations, and contact preferences are kept here.</p><p style={{ marginTop: 24 }}><Link className="button" href="/login">Sign in</Link></p></div>;
  if (error) return <div className="empty-state"><h2>We could not load your account.</h2><p>{error}</p><p style={{ marginTop: 24 }}><Link className="button" href="/login">Sign in again</Link></p></div>;
  if (!account) return <div className="surface-panel" aria-busy="true"><p>Loading your account…</p></div>;
  async function signOut() { try { await accountFetch("/account/logout", { method: "POST" }); } finally { clearAccessToken(); window.location.assign("/"); } }
  return <><section className="surface-panel"><p className="eyebrow">Signed in</p><h2 style={{ marginTop: 0 }}>{account.name}</h2><p>{account.email}{account.phone ? `${account.email ? " · " : ""}${account.phone}` : ""}{account.country ? ` · ${account.country}` : ""}</p><button className="button--secondary" onClick={signOut} type="button">Sign out</button></section><div className="grid-3" style={{ marginTop: 28 }}><section className="surface-panel"><p className="eyebrow">Library</p><h2 style={{ marginTop: 0 }}>Your books</h2>{library.length ? <ul style={{ paddingLeft: 20 }}>{library.map((book) => <li key={book.id}><Link className="text-link" href={`/books/${book.slug}/read${book.formats?.some((format) => format.kind === "flipbook" && format.isAvailable) ? "?format=flipbook" : ""}`}>{book.title}</Link></li>)}</ul> : <p>No verified books yet. Completed purchases and an active subscription appear here.</p>}<Link className="text-link" href="/books">Browse books →</Link></section><section className="surface-panel"><p className="eyebrow">Membership</p><h2 style={{ marginTop: 0 }}>Your plan</h2>{memberships.length ? <ul style={{ paddingLeft: 20 }}>{memberships.map((membership) => <li key={membership.id}>{membership.plan?.name ?? "Membership"} · {membership.status}{membership.endsAt ? ` · ends ${new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(membership.endsAt))}` : ""}</li>)}</ul> : <p>You do not have a membership yet.</p>}<Link className="text-link" href="/subscriptions">View memberships →</Link></section><section className="surface-panel"><p className="eyebrow">Events</p><h2 style={{ marginTop: 0 }}>Registrations</h2>{registrations.length ? <ul style={{ paddingLeft: 20 }}>{registrations.map((registration) => <li key={registration.id}>{registration.event?.title ?? "Event"} · {registration.status} · {registration.confirmationCode}</li>)}</ul> : <p>No event registrations yet.</p>}<Link className="text-link" href="/events">Explore events →</Link></section></div></>;
}
