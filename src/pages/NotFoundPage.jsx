import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="auth-page">
      <div className="card auth-card" style={{ textAlign: "center" }}>
        <h1 className="fs-xl">Page not found</h1>
        <p className="text-secondary" style={{ margin: "var(--space-3) 0 var(--space-5)" }}>
          The page you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link to="/" className="btn btn-primary">
          Go home
        </Link>
      </div>
    </div>
  );
}
