"use client";

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="page page--muted">
      <div className="content-width empty-state">
        <p className="eyebrow">A temporary interruption</p>
        <h1>We could not load that resource.</h1>
        <p>Please try again. The content service may be temporarily unavailable; no placeholder editorial data has been substituted.</p>
        <p style={{ marginTop: 26 }}><button className="button" type="button" onClick={reset}>Try again</button></p>
      </div>
    </section>
  );
}
