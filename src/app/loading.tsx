export default function Loading() {
  return (
    <section className="page">
      <div className="content-width" aria-busy="true" aria-label="Loading resource">
        <div style={{ width: "32%", height: 14, background: "var(--border)", marginBottom: 22 }} />
        <div style={{ width: "72%", height: 64, background: "var(--surface-muted)", marginBottom: 42 }} />
        <div style={{ width: "100%", height: 340, background: "var(--surface-muted)" }} />
      </div>
    </section>
  );
}
