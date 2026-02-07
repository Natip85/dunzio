"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const topicData = [
  { topic: "Addition", accuracy: 92, questions: 45230, avgTime: 8.2 },
  { topic: "Subtraction", accuracy: 87, questions: 38450, avgTime: 9.5 },
  { topic: "Multiplication", accuracy: 78, questions: 32100, avgTime: 12.3 },
  { topic: "Division", accuracy: 71, questions: 24800, avgTime: 15.7 },
  { topic: "Fractions", accuracy: 65, questions: 18200, avgTime: 18.4 },
  { topic: "Decimals", accuracy: 72, questions: 15600, avgTime: 14.2 },
  { topic: "Percentages", accuracy: 68, questions: 12500, avgTime: 16.8 },
];

const chartConfig = {
  accuracy: {
    label: "Accuracy %",
    color: "oklch(0.7 0.15 200)",
  },
};

const getBarColor = (accuracy: number) => {
  if (accuracy >= 85) return "oklch(0.65 0.15 145)";
  if (accuracy >= 70) return "oklch(0.7 0.15 200)";
  if (accuracy >= 60) return "oklch(0.75 0.18 85)";
  return "oklch(0.6 0.18 25)";
};

export function TopicPerformance() {
  return (
    <Card className="h-full rounded-3xl border p-6">
      <CardHeader className="p-0">
        <CardTitle className="text-lg font-semibold">Topic Performance</CardTitle>
        <CardDescription>Accuracy rates across different math topics</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={topicData}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.25 0.01 285)"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="oklch(0.5 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="topic"
                stroke="oklch(0.5 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0]?.payload;
                  return (
                    <div className="border-border/50 bg-background rounded-lg border px-3 py-2 shadow-xl">
                      <p className="text-foreground text-sm font-medium">{data?.topic}</p>
                      <div className="text-muted-foreground space-y-0.5 text-xs">
                        <p>
                          Accuracy:{" "}
                          <span className="text-foreground font-mono font-medium">
                            {data?.accuracy}%
                          </span>
                        </p>
                        <p>
                          Questions:{" "}
                          <span className="text-foreground font-mono font-medium">
                            {data?.questions?.toLocaleString()}
                          </span>
                        </p>
                        <p>
                          Avg Time:{" "}
                          <span className="text-foreground font-mono font-medium">
                            {data?.avgTime}s
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="accuracy"
                radius={[0, 4, 4, 0]}
              >
                {topicData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.accuracy)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
