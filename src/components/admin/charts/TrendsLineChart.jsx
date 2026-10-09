import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";
import { axisTickStyle, tooltipStyle } from "./chartTheme";
import { formatDate } from "../../../utils/formatters";

export default function TrendsLineChart({ points, title = "Ticket trends", subtitle }) {
  const data = points.map((p) => ({ ...p, label: formatDate(p.date) }));

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--gridline)" />
          <XAxis dataKey="label" tick={axisTickStyle} axisLine={{ stroke: "var(--baseline)" }} tickLine={false} minTickGap={24} />
          <YAxis allowDecimals={false} tick={axisTickStyle} axisLine={false} tickLine={false} width={32} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }} />
          <Line type="monotone" dataKey="created" name="Created" stroke="var(--series-1)" strokeWidth={2} dot={{ r: 3, fill: "var(--series-1)" }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="resolved" name="Resolved" stroke="var(--series-3)" strokeWidth={2} dot={{ r: 3, fill: "var(--series-3)" }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
