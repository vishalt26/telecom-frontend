import { useCallback, useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import LoadingState from "../../components/common/LoadingState";
import ErrorBanner from "../../components/common/ErrorBanner";
import EmptyState from "../../components/common/EmptyState";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import UserFormModal from "../../components/admin/UserFormModal";
import { formatDate } from "../../utils/formatters";

export default function UserAdminPage({ api, title, roleLabel, addLabel }) {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [data, setData] = useState({ content: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', user? }
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .list({ page, size: 10, q: search || undefined })
      .then(setData)
      .catch((err) => setError(err.message || "Couldn't load the list."))
      .finally(() => setLoading(false));
  }, [api, page, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(payload) {
    await api.create(payload);
    toast.success(`${roleLabel} added.`);
    setModal(null);
    load();
  }

  async function handleEdit(payload) {
    await api.update(modal.user.id, payload);
    toast.success(`${roleLabel} updated.`);
    setModal(null);
    load();
  }

  async function handleToggleEnabled(u) {
    try {
      await api.update(u.id, { name: u.name, phone: u.phone, enabled: !(u.enabled !== false) });
      toast.success(u.enabled !== false ? `${roleLabel} disabled.` : `${roleLabel} re-enabled.`);
      load();
    } catch (err) {
      toast.error(err.message || "Couldn't update status.");
    }
  }

  async function handleDelete() {
    try {
      await api.remove(deleteTarget.id);
      toast.success(`${roleLabel} removed.`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.message || `Couldn't remove this ${roleLabel.toLowerCase()}.`);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="stack">
      <div className="page-header">
        <h1>{title}</h1>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ mode: "create" })}>
          {addLabel}
        </button>
      </div>

      <input
        className="input"
        style={{ maxWidth: 320 }}
        placeholder={`Search ${title.toLowerCase()}…`}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
      />

      {loading ? (
        <LoadingState label={`Loading ${title.toLowerCase()}…`} />
      ) : error ? (
        <ErrorBanner message={error} onRetry={load} />
      ) : data.content.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()} found`} message={search ? "Try a different search." : `Add your first ${roleLabel.toLowerCase()}.`} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {data.content.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>
                    <span className={`badge ${u.enabled !== false ? "badge-resolved" : "badge-high"}`}>
                      {u.enabled !== false ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <div className="row">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal({ mode: "edit", user: u })}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleToggleEnabled(u)}>
                        {u.enabled !== false ? "Disable" : "Enable"}
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(u)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={data.page ?? 0} totalPages={data.totalPages ?? 1} onChange={setPage} />

      <UserFormModal
        open={!!modal}
        mode={modal?.mode}
        initialValues={modal?.user}
        roleLabel={roleLabel}
        onSubmit={modal?.mode === "create" ? handleCreate : handleEdit}
        onCancel={() => setModal(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Remove ${deleteTarget?.name}?`}
        message={`This will permanently delete this ${roleLabel.toLowerCase()} account.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
