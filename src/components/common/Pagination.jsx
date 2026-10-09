export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="btn btn-sm btn-secondary" disabled={page <= 0} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span className="text-sm text-secondary">
        Page {page + 1} of {totalPages}
      </span>
      <button
        type="button"
        className="btn btn-sm btn-secondary"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
