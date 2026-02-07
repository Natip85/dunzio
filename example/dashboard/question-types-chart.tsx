"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const questionTypeData = [
  { name: "Word Problems", value: 45230, percentage: 38.5 },
  { name: "Equations", value: 42100, percentage: 35.8 },
  { name: "Multiple Choice", value: 30200, percentage: 25.7 },
];

const COLORS = ["oklch(0.7 0.15 200)", "oklch(0.65 0.15 145)", "oklch(0.75 0.18 85)"];

const chartConfig = {
  "Word Problems": {
    label: "Word Problems",
    color: COLORS[0],
  },
  Equations: {
    label: "Equations",
    color: COLORS[1],
  },
  "Multiple Choice": {
    label: "Multiple Choice",
    color: COLORS[2],
  },
};

export function QuestionTypesChart() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Question Types</CardTitle>
        <CardDescription className="text-muted-foreground">
          Distribution of question formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[260px] w-full"
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
                    <div className="border-border/50 bg-background rounded-lg border px-3 py-2 shadow-xl">
                      <p className="text-foreground text-sm font-medium">{data?.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {data?.value?.toLocaleString()} questions ({data?.percentage}%)
                      </p>
                    </div>
                  );
                }}
              />
              <Pie
                data={questionTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {questionTypeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex justify-center gap-6">
          {questionTypeData.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center gap-2"
            >
              <div
                className="size-3 rounded-sm"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-muted-foreground text-xs">{item.name}</span>
              <span className="text-foreground text-xs font-medium">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
