import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page/PageIntro";

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() {
  return (
    <section className="page">
      <div className="content-width">
        <PageIntro eyebrow="Account" title="Your account" description="A calm place for the parts of the platform that are personal to you." />
        <div className="grid-3">
          <article className="surface-panel"><p className="eyebrow">Library</p><h2 style={{ marginTop: 0 }}>Your books</h2><p>Verified book access will appear here after a completed order is linked to your account.</p><Link className="text-link" href="/account/library">Open library →</Link></article>
          <article className="surface-panel"><p className="eyebrow">Events</p><h2 style={{ marginTop: 0 }}>Registrations</h2><p>Event confirmations will appear here once the backend and accounts are connected.</p><Link className="text-link" href="/events">Explore events →</Link></article>
          <article className="surface-panel"><p className="eyebrow">Preferences</p><h2 style={{ marginTop: 0 }}>Stay informed</h2><p>Choose the kinds of resources and updates that best serve your ministry.</p><Link className="text-link" href="/community">Community preferences →</Link></article>
        </div>
      </div>
    </section>
  );
}
