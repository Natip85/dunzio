"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronsDown, ChevronsUp, ChevronUp, Equal } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useTRPC } from "@/trpc";

type PriorityBreakdownProps = {
  boardId: string;
};

const priorityConfig: Record<string, { label: string; color: string; icon: typeof ChevronsUp }> = {
  highest: { label: "Highest", color: "#e74c3c", icon: ChevronsUp },
  high: { label: "High", color: "#e67e22", icon: ChevronUp },
  medium: { label: "Medium", color: "#f39c12", icon: Equal },
  low: { label: "Low", color: "#3498db", icon: ChevronDown },
  lowest: { label: "Lowest", color: "#2ecc71", icon: ChevronsDown },
};

const chartConfig = Object.fromEntries(
  Object.entries(priorityConfig).map(([key, val]) => [key, { label: val.label, color: val.color }])
);

export function PriorityBreakdown({ boardId }: PriorityBreakdownProps) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.boardSummary.getPriorityBreakdown.queryOptions({ boardId })
  );

  const chartData = data.map((d) => ({
    priority: priorityConfig[d.priority]?.label ?? d.priority,
    count: d.count,
    fill: priorityConfig[d.priority]?.color ?? "#94a3b8",
  }));

  return (
    <Card className="h-full border p-5">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-base font-semibold">Priority breakdown</CardTitle>
        <CardDescription>Get a holistic view of how work is being prioritized.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer
          config={chartConfig}
          className="h-[220px] w-full"
        >
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="priority"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const item = payload[0]?.payload as
                  | { priority: string; count: number; fill: string }
                  | undefined;
                if (!item) return null;
                return (
                  <div className="border-border bg-card rounded-lg border px-3 py-2 shadow-xl">
                    <p className="text-foreground text-sm font-semibold">{item.priority}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.count.toLocaleString()} issue{item.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
