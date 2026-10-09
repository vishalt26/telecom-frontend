export const tooltipStyle = {
  contentStyle: {
    background: "var(--surface-2)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--fs-sm)",
    boxShadow: "var(--shadow-md)",
  },
  labelStyle: { color: "var(--text-primary)", fontWeight: 600 },
  itemStyle: { color: "var(--text-secondary)" },
};

export const axisTickStyle = { fill: "var(--text-muted)", fontSize: 12 };

export const STATUS_COLORS = {
  PENDING: "var(--status-warning)",
  IN_PROGRESS: "var(--series-1)",
  RESOLVED: "var(--status-good)",
  COMPLETED: "var(--series-3)",
};

export const CATEGORICAL = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
];

// Fixed per-category color (by identity, matching CATEGORIES' order in utils/constants.js) —
// never reassigned by sort rank, so a category keeps its color regardless of chart order.
export const CATEGORY_COLORS = {
  NETWORK: CATEGORICAL[0],
  BILLING: CATEGORICAL[1],
  SIM: CATEGORICAL[2],
  BROADBAND: CATEGORICAL[3],
  NEW_CONNECTION: CATEGORICAL[4],
  PLAN_CHANGE: CATEGORICAL[5],
  OTHER: CATEGORICAL[6],
};
