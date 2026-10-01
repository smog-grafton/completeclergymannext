import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page page--muted">
      <div className="content-width empty-state">
        <p className="eyebrow">404 · Page not found</p>
        <h1>There is no page here.</h1>
        <p>The resource may have moved, or the address may be incomplete. Return to the publication and continue exploring.</p>
        <p style={{ marginTop: 26 }}><Link className="button" href="/">Return to the homepage</Link></p>
      </div>
    </section>
  );
}
