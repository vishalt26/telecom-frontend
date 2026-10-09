import { useNavigate } from "react-router-dom";
import { ticketApiFor } from "../../api/tickets";
import { detailPath, resourceForType } from "../../utils/tickets";
import { useToast } from "../../context/ToastContext";
import TicketForm from "../../components/tickets/TicketForm";

export default function NewTicketPage({ type, title, description }) {
  const api = ticketApiFor(type);
  const navigate = useNavigate();
  const toast = useToast();
  const resource = resourceForType(type);

  async function handleSubmit(values) {
    const created = await api.create(values);
    toast.success(`${title} submitted.`);
    navigate(detailPath(created));
  }

  return (
    <div className="stack" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          {description && <p className="page-subtitle">{description}</p>}
        </div>
      </div>
      <div className="card">
        <TicketForm type={type} onSubmit={handleSubmit} onCancel={() => navigate(`/${resource}`)} submitLabel="Submit" />
      </div>
    </div>
  );
}
