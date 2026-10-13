"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { accountFetch } from "@/lib/accountApi";

type FlipbookPage = { number: number; imageUrl: string; thumbnailUrl?: string; width?: number; height?: number };

export function FlipbookReader({ slug, title }: { slug: string; title: string }) {
  const [pages, setPages] = useState<FlipbookPage[]>([]);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState("");
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  useEffect(() => {
    if (!apiBase) { setError("The reader is not configured yet."); return; }
    accountFetch(`/books/${slug}/flipbook`)
      .then(async (response) => response.ok ? response.json() : Promise.reject(new Error(response.status === 401 || response.status === 403 ? "Sign in with an active purchase or subscription to open this complete edition." : "This flipbook is not ready yet.")))
      .then((payload) => setPages(payload.data?.pages ?? []))
      .catch((reason: Error) => setError(reason.message));
  }, [apiBase, slug]);

  if (error) return <div className="empty-state"><h2>Flipbook unavailable</h2><p>{error}</p>{error.startsWith("Sign in") ? <p style={{ marginTop: 24 }}><Link className="button" href={`/login?next=${encodeURIComponent(`/books/${slug}/read?format=flipbook`)}`}>Sign in</Link></p> : null}</div>;
  if (!pages.length) return <div className="surface-panel" aria-busy="true"><p className="eyebrow">Preparing reader</p><h1>{title}</h1><p>Loading the edition…</p></div>;
  const page = pages[current];

  return <section aria-label={`${title} flipbook`} className="surface-panel" style={{ maxWidth: 1540, margin: "0 auto", padding: "clamp(18px, 3vw, 42px)" }}>
    <header style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", marginBottom: 20 }}><div><p className="eyebrow">Flipbook reader</p><h1 style={{ margin: 0 }}>{title}</h1></div><p className="metadata" style={{ margin: 0 }}>Page {page.number} of {pages.length}</p></header>
    <div style={{ alignItems: "center", background: "#202020", display: "grid", minHeight: "min(72vh, 1100px)", padding: "clamp(8px, 2vw, 24px)", placeItems: "center" }}>
      {/* Generated local/remote page assets are intentionally not constrained by Next image-host configuration. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={`${title}, page ${page.number}`} src={page.imageUrl} style={{ boxShadow: "0 12px 42px rgba(0,0,0,.42)", display: "block", maxHeight: "min(67vh, 1000px)", maxWidth: "100%", objectFit: "contain" }} />
    </div>
    <footer style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", marginTop: 20 }}><button className="button--secondary" disabled={current === 0} onClick={() => setCurrent((index) => Math.max(0, index - 1))} type="button">← Previous</button><label className="field-label" style={{ margin: 0 }}>Page <select className="field" onChange={(event) => setCurrent(Number(event.target.value))} style={{ display: "inline-block", marginLeft: 8, width: "auto" }} value={current}>{pages.map((entry, index) => <option key={entry.number} value={index}>{entry.number}</option>)}</select></label><button className="button--secondary" disabled={current === pages.length - 1} onClick={() => setCurrent((index) => Math.min(pages.length - 1, index + 1))} type="button">Next →</button></footer>
  </section>;
}
