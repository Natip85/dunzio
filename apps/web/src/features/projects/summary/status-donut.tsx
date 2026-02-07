"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useTRPC } from "@/trpc";

type StatusDonutProps = {
  boardId: string;
};

export function StatusDonut({ boardId }: StatusDonutProps) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.boardSummary.getStatusOverview.queryOptions({ boardId }));

  const chartConfig = Object.fromEntries(
    data.columns.map((col) => [col.name, { label: col.name, color: col.color }])
  );

  const chartData = data.columns.map((col) => ({
    name: col.name,
    value: col.count,
    color: col.color,
  }));

  return (
    <Card className="h-full rounded-xl border p-5">
      <CardHeader className="p-0 pb-1">
        <CardTitle className="text-base font-semibold">Status overview</CardTitle>
        <CardDescription>Get a snapshot of the status of your work items.</CardDescription>
      </CardHeader>
      <CardContent className="relative flex flex-1 items-center justify-center p-0 pt-4">
        <ChartContainer
          config={chartConfig}
          className="h-[200px] w-[200px]"
        >
          <PieChart>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                const item = payload[0]?.payload as
                  | { name: string; value: number; color: string }
                  | undefined;
                if (!item) return null;
                return (
                  <div className="border-border bg-card rounded-lg border px-3 py-2 shadow-xl">
                    <p className="text-foreground text-sm font-semibold">{item.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.value.toLocaleString()} issues
                    </p>
                  </div>
                );
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        {/* Center total */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold">{data.total.toLocaleString()}</p>
            <p className="text-muted-foreground text-xs">Total work items</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-start gap-x-4 gap-y-2 p-0 pt-4">
        {data.columns.map((col) => (
          <div
            key={col.columnId}
            className="flex items-center gap-2"
          >
            <div
              className="size-2.5 rounded-sm"
              style={{ backgroundColor: col.color }}
            />
            <span className="text-muted-foreground text-xs">
              {col.name}: {col.count}
            </span>
          </div>
        ))}
      </CardFooter>
    </Card>
  );
}
