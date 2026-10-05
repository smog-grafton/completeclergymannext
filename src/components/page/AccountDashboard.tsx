"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Account = { id: number; name: string; email: string; phone?: string; country?: string; roles: string[] };
type LibraryBook = { id: number; title: string; slug: string; authors: string[]; accessType: string; formats?: Array<{ kind: string; isAvailable: boolean }> };
type Registration = { id: number; confirmationCode: string; status: string; paymentStatus: string; attendeeCount: number; event?: { title: string; slug: string; startsAt?: string } };

export function AccountDashboard() {
  const [account, setAccount] = useState<Account | null>(null);
  const [library, setLibrary] = useState<LibraryBook[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [error, setError] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  useEffect(() => {
    const token = window.localStorage.getItem("cc_access_token");
    setHasToken(Boolean(token));
    if (!token || !apiBase) return;
    const request = <T,>(path: string) => fetch(`${apiBase}/api/v1/account${path}`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }).then(async (response) => { if (!response.ok) throw new Error(response.status === 401 ? "Your session has expired. Please sign in again." : "Your account could not be loaded."); return response.json() as Promise<{ data: T }>; });
    Promise.all([request<{ user: Account }>("/"), request<LibraryBook[]>("/library"), request<Registration[]>("/registrations")]).then(([profile, books, events]) => { setAccount(profile.data.user); setLibrary(books.data); setRegistrations(events.data); }).catch((reason: Error) => setError(reason.message));
  }, [apiBase]);

  if (!hasToken) return <div className="empty-state"><h2>Sign in to see your dashboard.</h2><p>Your personal library, event registrations, and contact preferences are kept here.</p><p style={{ marginTop: 24 }}><Link className="button" href="/login">Sign in</Link></p></div>;
  if (error) return <div className="empty-state"><h2>We could not load your account.</h2><p>{error}</p><p style={{ marginTop: 24 }}><Link className="button" href="/login">Sign in again</Link></p></div>;
  if (!account) return <div className="surface-panel" aria-busy="true"><p>Loading your account…</p></div>;
  return <><section className="surface-panel"><p className="eyebrow">Signed in</p><h2 style={{ marginTop: 0 }}>{account.name}</h2><p>{account.email}{account.phone ? ` · ${account.phone}` : ""}{account.country ? ` · ${account.country}` : ""}</p><button className="button--secondary" onClick={() => { window.localStorage.removeItem("cc_access_token"); window.location.assign("/"); }} type="button">Sign out</button></section><div className="grid-3" style={{ marginTop: 28 }}><section className="surface-panel"><p className="eyebrow">Library</p><h2 style={{ marginTop: 0 }}>Your books</h2>{library.length ? <ul style={{ paddingLeft: 20 }}>{library.map((book) => <li key={book.id}><Link className="text-link" href={`/books/${book.slug}/read${book.formats?.some((format) => format.kind === "flipbook" && format.isAvailable) ? "?format=flipbook" : ""}`}>{book.title}</Link></li>)}</ul> : <p>No verified books yet. Completed purchases will appear here.</p>}<Link className="text-link" href="/books">Browse books →</Link></section><section className="surface-panel"><p className="eyebrow">Events</p><h2 style={{ marginTop: 0 }}>Registrations</h2>{registrations.length ? <ul style={{ paddingLeft: 20 }}>{registrations.map((registration) => <li key={registration.id}>{registration.event?.title ?? "Event"} · {registration.status} · {registration.confirmationCode}</li>)}</ul> : <p>No event registrations yet.</p>}<Link className="text-link" href="/events">Explore events →</Link></section><section className="surface-panel"><p className="eyebrow">Preferences</p><h2 style={{ marginTop: 0 }}>Your details</h2><p>We use your contact details for your account, orders, event registrations, and the updates you choose to receive.</p><Link className="text-link" href="/community">Community preferences →</Link></section></div></>;
}
