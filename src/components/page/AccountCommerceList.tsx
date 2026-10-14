"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { accountJson } from "@/lib/accountApi";
import { useAccountAuth } from "@/components/account/AccountAuthProvider";

type Record = { id?: number; title?: string; slug?: string; accessType?: string; authors?: string[]; reference?: string; number?: string; status?: string; purpose?: string; provider?: string; method?: string; amount?: string | number; total?: string | number; currency?: string; paidAt?: string; endsAt?: string; plan?: { name: string } | null; items?: { title: string; quantity: number }[] };

export function AccountCommerceList({ kind }: { kind: "library" | "orders" | "payments" | "subscriptions" }) {
  const [records, setRecords] = useState<Record[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const { state: authState } = useAccountAuth();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => { if (authState === "unauthenticated") router.replace(`/login?next=${encodeURIComponent(pathname || "/account")}`); }, [authState, pathname, router]);
  useEffect(() => { if (authState !== "authenticated") return; accountJson<{ data: Record[] }>(`/account/${kind}`).then(({ data }) => setRecords(data)).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false)); }, [authState, kind]);
  if (authState !== "authenticated") return <div className="surface-panel" aria-busy="true">Checking your account…</div>;
  if (loading) return <div className="surface-panel" aria-busy="true">Loading your {kind}…</div>;
  if (error) return <div className="notice" role="alert">{error}</div>;
  if (!records.length) return <div className="empty-state"><h2>No {kind} yet.</h2><p>Verified purchases, payment attempts, and memberships will appear here.</p></div>;
  if (kind === "library") return <div style={{ display: "grid", gap: 14 }}>{records.map((record) => <section className="surface-panel" key={record.id}><p className="eyebrow">{record.accessType === "purchase" ? "Permanent purchase" : "Membership access"}</p><h2 style={{ marginTop: 0 }}>{record.title}</h2><p>{record.authors?.join(", ")}</p>{record.slug ? <Link className="button" href={`/books/${record.slug}/read`}>Open book</Link> : null}</section>)}</div>;
  return <div style={{ display: "grid", gap: 14 }}>{records.map((record, index) => <section className="surface-panel" key={record.reference ?? record.number ?? index}><p className="eyebrow">{record.reference ?? record.number ?? record.plan?.name ?? "Membership"}</p><h2 style={{ marginTop: 0 }}>{record.plan?.name ?? record.purpose ?? kind.slice(0, -1)}</h2><p><strong>{record.status}</strong>{record.provider ? ` · ${record.provider}${record.method ? ` (${record.method.replace("_", " ")})` : ""}` : ""}</p>{record.total ?? record.amount ? <p>{new Intl.NumberFormat("en-UG", { style: "currency", currency: record.currency ?? "UGX", maximumFractionDigits: record.currency === "UGX" ? 0 : 2 }).format(Number(record.total ?? record.amount))}</p> : null}{record.items?.length ? <p>{record.items.map((item) => `${item.title} × ${item.quantity}`).join(", ")}</p> : null}{record.endsAt ? <p className="field-help">Access ends {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(record.endsAt))}</p> : null}</section>)}</div>;
}
