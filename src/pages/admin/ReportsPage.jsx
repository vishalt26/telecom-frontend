import { useEffect, useState } from "react";
import { getReportsSummary, getReportsTrends } from "../../api/admin";
import StatCard from "../../components/common/StatCard";
import LoadingState from "../../components/common/LoadingState";
import ErrorBanner from "../../components/common/ErrorBanner";
import StatusBarChart from "../../components/admin/charts/StatusBarChart";
import CategoryBarChart from "../../components/admin/charts/CategoryBarChart";
import TrendsLineChart from "../../components/admin/charts/TrendsLineChart";

const RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

function rangeDates(days) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export default function ReportsPage() {
  const [rangeDays, setRangeDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [error, setError] = useState("");

  function load() {
    setError("");
    setTrends(null);
    Promise.all([getReportsSummary(), getReportsTrends(rangeDates(rangeDays))])
      .then(([s, t]) => {
        setSummary(s);
        setTrends(t);
      })
      .catch((err) => setError(err.message || "Couldn't load reports."));
  }

  useEffect(load, [rangeDays]);

  const totalInRange = trends?.reduce((sum, p) => sum + p.created, 0) ?? 0;
  const resolvedInRange = trends?.reduce((sum, p) => sum + p.resolved, 0) ?? 0;

  return (
    <div className="stack">
      <div className="page-header">
        <h1>Reports</h1>
      </div>

      <div className="row" role="group" aria-label="Date range">
        {RANGES.map((r) => (
          <button
            key={r.days}
            type="button"
            className={`btn btn-sm ${rangeDays === r.days ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setRangeDays(r.days)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorBanner message={error} onRetry={load} />
      ) : !summary || !trends ? (
        <LoadingState label="Loading reports…" />
      ) : (
        <>
          <div className="grid grid-cards">
            <StatCard label="Created in range" value={totalInRange} />
            <StatCard label="Resolved in range" value={resolvedInRange} />
            <StatCard label="Avg. resolution time" value={summary.avgResolutionHours != null ? `${summary.avgResolutionHours}h` : "—"} hint="All-time" />
            <StatCard label="Total tickets" value={summary.total} hint="All-time" />
          </div>

          <TrendsLineChart points={trends} title="Created vs resolved" subtitle={RANGES.find((r) => r.days === rangeDays)?.label} />

          <div className="grid grid-2col">
            <CategoryBarChart byCategory={summary.byCategory} />
            <StatusBarChart byStatus={summary.byStatus} />
          </div>
        </>
      )}
    </div>
  );
}
