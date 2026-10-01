import Link from "next/link";
import { PageIntro } from "@/components/page/PageIntro";

export default function LibraryPage() {
  return <section className="page page--muted"><div className="content-width"><PageIntro eyebrow="Account" title="Your library" description="Verified book access appears here after an account is connected to a completed order." /><div className="empty-state"><h2>Your library is waiting for verified access.</h2><p>Browse the available resources, or sign in once your order has been completed.</p><p style={{ marginTop: 24 }}><Link className="button" href="/books">Explore books</Link></p></div></div></section>;
}
