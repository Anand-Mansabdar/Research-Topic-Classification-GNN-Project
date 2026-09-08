import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CORA_CLASSES } from "@/lib/classColors";

interface ProbabilityChartProps {
  probabilities: number[];
}

export function ProbabilityChart({ probabilities }: ProbabilityChartProps) {
  const data = probabilities
    .map((prob, id) => ({
      id,
      label: CORA_CLASSES[id]?.display ?? `Class ${id}`,
      prob,
    }))
    .sort((a, b) => b.prob - a.prob);

  const topId = data[0]?.id;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
          <XAxis
            type="number"
            domain={[0, 1]}
            tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
            tick={{ fontSize: 11, fill: "#00000099" }}
            axisLine={{ stroke: "#00000022" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={140}
            tick={{ fontSize: 12, fill: "#000000cc" }}
            axisLine={{ stroke: "#00000022" }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#FEF2F2" }}
            formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, "probability"]}
            contentStyle={{ border: "1px solid #00000022", borderRadius: 0, fontSize: 12 }}
          />
          <Bar dataKey="prob" radius={0} maxBarSize={18}>
            {data.map((entry) => (
              <Cell key={entry.id} fill={entry.id === topId ? "#BD181B" : "#FFC9CA"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
