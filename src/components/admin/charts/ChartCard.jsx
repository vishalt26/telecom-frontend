export default function ChartCard({ title, subtitle, children, height = 280 }) {
  return (
    <div className="card">
      <h2 className="card-title" style={{ marginBottom: subtitle ? 2 : "var(--space-4)" }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-muted" style={{ marginBottom: "var(--space-4)" }}>
          {subtitle}
        </p>
      )}
      <div style={{ height }}>{children}</div>
    </div>
  );
}
