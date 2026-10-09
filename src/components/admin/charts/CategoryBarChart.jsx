import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";
import { axisTickStyle, CATEGORY_COLORS, tooltipStyle } from "./chartTheme";
import { CATEGORY_LABELS } from "../../../utils/constants";

export default function CategoryBarChart({ byCategory }) {
  const data = Object.entries(byCategory)
    .map(([key, count]) => ({ key, label: CATEGORY_LABELS[key] || key, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <ChartCard title="Tickets by category" subtitle="Complaint categories + service requests">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="var(--gridline)" />
          <XAxis type="number" allowDecimals={false} tick={axisTickStyle} axisLine={false} tickLine={false} />
          <YAxis dataKey="label" type="category" tick={axisTickStyle} axisLine={false} tickLine={false} width={96} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "var(--surface-0)" }} />
          <Bar dataKey="count" name="Tickets" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((d) => (
              <Cell key={d.key} fill={CATEGORY_COLORS[d.key] || "var(--series-1)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
