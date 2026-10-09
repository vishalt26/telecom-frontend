import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";
import { axisTickStyle, STATUS_COLORS, tooltipStyle } from "./chartTheme";
import { STATUSES, STATUS_LABELS } from "../../../utils/constants";

export default function StatusBarChart({ byStatus }) {
  const data = STATUSES.map((s) => ({ status: s, label: STATUS_LABELS[s], count: byStatus[s] || 0 }));

  return (
    <ChartCard title="Tickets by status" subtitle="Complaints and service requests combined">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="var(--gridline)" />
          <XAxis dataKey="label" tick={axisTickStyle} axisLine={{ stroke: "var(--baseline)" }} tickLine={false} />
          <YAxis allowDecimals={false} tick={axisTickStyle} axisLine={false} tickLine={false} width={32} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "var(--surface-0)" }} />
          <Bar dataKey="count" name="Tickets" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((d) => (
              <Cell key={d.status} fill={STATUS_COLORS[d.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
