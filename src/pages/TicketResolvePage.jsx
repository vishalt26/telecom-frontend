import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { complaintsApi, serviceRequestsApi } from "../api/tickets";
import LoadingState from "../components/common/LoadingState";
import ErrorBanner from "../components/common/ErrorBanner";

/**
 * Notifications only carry a bare ticketId (docs/api-contract.md), not its type,
 * so this resolves which resource it belongs to before routing to the real detail page.
 */
export default function TicketResolvePage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    complaintsApi
      .get(id)
      .then(() => !cancelled && setResource("complaints"))
      .catch(() =>
        serviceRequestsApi
          .get(id)
          .then(() => !cancelled && setResource("service-requests"))
          .catch((err) => !cancelled && setError(err.message || "This ticket couldn't be found."))
      );
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) return <ErrorBanner message={error} />;
  if (!resource) return <LoadingState label="Opening ticket…" />;
  return <Navigate to={`/tickets/${resource}/${id}`} replace />;
}
