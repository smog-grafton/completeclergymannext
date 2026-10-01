export function ResourceSkeleton({ detail = false }: { detail?: boolean }) {
  return (
    <section className="page" aria-busy="true" aria-label="Loading content">
      <div className="content-width">
        <div style={{ width: 112, height: 12, background: "var(--border)", marginBottom: 20 }} />
        <div style={{ width: detail ? "68%" : "42%", maxWidth: 720, height: detail ? 64 : 46, background: "var(--surface-muted)", marginBottom: 28 }} />
        {detail ? (
          <div className="two-column-detail"><div style={{ minHeight: 360, background: "var(--surface-muted)" }} /><div style={{ display: "grid", gap: 14 }}>{[100, 95, 82, 90, 68].map((width, index) => <div key={index} style={{ width: width + "%", height: 18, background: "var(--surface-muted)" }} />)}</div></div>
        ) : (
          <div className="grid-3">{Array.from({ length: 6 }, (_, index) => <div key={index} style={{ minHeight: 260, background: "var(--surface-muted)" }} />)}</div>
        )}
      </div>
    </section>
  );
}
