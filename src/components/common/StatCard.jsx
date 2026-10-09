export default function StatCard({ label, value, hint, accent }) {
  return (
    <div className="card stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
