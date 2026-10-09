import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { customersApi, employeesApi, getReportsSummary, getReportsTrends } from "../../api/admin";
import StatCard from "../../components/common/StatCard";
import LoadingState from "../../components/common/LoadingState";
import ErrorBanner from "../../components/common/ErrorBanner";
import StatusBarChart from "../../components/admin/charts/StatusBarChart";
import CategoryBarChart from "../../components/admin/charts/CategoryBarChart";
import TrendsLineChart from "../../components/admin/charts/TrendsLineChart";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState("");

  function load() {
    setError("");
    setSummary(null);
    setTrends(null);
    setCounts(null);
    Promise.all([getReportsSummary(), getReportsTrends(), customersApi.list({ size: 1 }), employeesApi.list({ size: 1 })])
      .then(([s, t, c, e]) => {
        setSummary(s);
        setTrends(t);
        setCounts({ customers: c.totalElements, employees: e.totalElements });
      })
      .catch((err) => setError(err.message || "Couldn't load the dashboard."));
  }

  useEffect(load, []);

  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!summary || !trends || !counts) return <LoadingState label="Loading dashboard…" />;

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="page-subtitle">Operational overview across all complaints and service requests.</p>
        </div>
        <Link to="/admin/reports" className="btn btn-secondary">
          Full reports
        </Link>
      </div>

      <div className="grid grid-cards">
        <StatCard label="Total tickets" value={summary.total} />
        <StatCard label="Open tickets" value={summary.openCount} />
        <StatCard label="Avg. resolution time" value={summary.avgResolutionHours != null ? `${summary.avgResolutionHours}h` : "—"} hint="Created → resolved" />
        <StatCard label="Created, last 30 days" value={summary.createdLast30Days} />
        <StatCard label="Customers" value={counts.customers} />
        <StatCard label="Employees" value={counts.employees} />
      </div>

      <div className="grid grid-2col">
        <TrendsLineChart points={trends} subtitle="Last 30 days" />
        <StatusBarChart byStatus={summary.byStatus} />
      </div>

      <CategoryBarChart byCategory={summary.byCategory} />
    </div>
  );
}
