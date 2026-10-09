import { useEffect, useState } from "react";
import { employeesApi } from "../../api/admin";
import { MAX_PAGE_SIZE } from "../../utils/constants";

export default function AssignForm({ currentEmployeeId, onAssign }) {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState(currentEmployeeId || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    employeesApi.list({ size: MAX_PAGE_SIZE }).then((data) => setEmployees(data.content || []));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onAssign(Number(employeeId));
    } catch (err) {
      setError(err.message || "Couldn't assign employee.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      {error && <div className="error-banner" role="alert">{error}</div>}
      <div className="field">
        <label htmlFor="employeeId">Assign to employee</label>
        <select id="employeeId" className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
          <option value="" disabled>
            Select an employee
          </option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary" disabled={submitting || !employeeId} style={{ alignSelf: "flex-start" }}>
        {submitting ? "Assigning…" : "Assign"}
      </button>
    </form>
  );
}
