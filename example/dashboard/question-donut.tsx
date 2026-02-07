"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { useTRPC } from "@/utils/trpc-client";

const chartConfig = {
  "Word Problems": { label: "Word Problems", color: "var(--chart-1)" },
  Equations: { label: "Equations", color: "var(--chart-2)" },
  "Multiple Choice": { label: "Multiple Choice", color: "var(--chart-3)" },
};

export function QuestionDonut() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.admin.getQuestionTypeStats.queryOptions());

  const total = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <Card className="h-full rounded-3xl border p-6">
      <CardHeader className="mb-4 p-0">
        <CardTitle className="text-lg font-semibold">Question Types</CardTitle>
        <CardDescription>Distribution breakdown</CardDescription>
      </CardHeader>
      <CardContent className="relative flex flex-1 items-center justify-center p-0">
        <ChartContainer
          config={chartConfig}
          className="h-[180px] w-[180px]"
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0]?.payload;
                  return (
                    <div className="border-border bg-card rounded-xl border px-4 py-3 shadow-2xl">
                      <p className="text-foreground text-sm font-semibold">{data?.name}</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {data?.value?.toLocaleString()} ({Math.round((data?.value / total) * 100)}%)
                      </p>
                    </div>
                  );
                }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold">{(total / 1000).toFixed(0)}K</p>
            <p className="text-muted-foreground text-xs">Total</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 p-0">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-2"
          >
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground text-xs">{item.name}</span>
          </div>
        ))}
      </CardFooter>
    </Card>
  );
}
