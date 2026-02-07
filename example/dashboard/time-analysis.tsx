"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const timeData = [
  { hour: "6AM", users: 45, sessions: 52 },
  { hour: "8AM", users: 189, sessions: 234 },
  { hour: "10AM", users: 312, sessions: 398 },
  { hour: "12PM", users: 267, sessions: 312 },
  { hour: "2PM", users: 398, sessions: 456 },
  { hour: "4PM", users: 512, sessions: 589 },
  { hour: "6PM", users: 445, sessions: 512 },
  { hour: "8PM", users: 378, sessions: 423 },
  { hour: "10PM", users: 156, sessions: 178 },
];

const chartConfig = {
  users: {
    label: "Active Users",
    color: "oklch(0.7 0.15 200)",
  },
  sessions: {
    label: "Learning Sessions",
    color: "oklch(0.75 0.18 85)",
  },
};

export function TimeAnalysis() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Activity by Time of Day</CardTitle>
        <CardDescription className="text-muted-foreground">
          Peak learning hours and user engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[220px] w-full"
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={timeData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.25 0.01 285)"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                stroke="oklch(0.5 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="oklch(0.5 0 0)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="border-border/50 bg-background rounded-lg border px-3 py-2 shadow-xl">
                      <p className="text-foreground mb-1 text-sm font-medium">{label}</p>
                      {payload.map((entry, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs"
                        >
                          <div
                            className="size-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-muted-foreground">
                            {chartConfig[entry.dataKey as keyof typeof chartConfig]?.label}:
                          </span>
                          <span className="text-foreground font-mono font-medium">
                            {entry.value?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="oklch(0.7 0.15 200)"
                strokeWidth={2}
                dot={{ fill: "oklch(0.7 0.15 200)", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="oklch(0.75 0.18 85)"
                strokeWidth={2}
                dot={{ fill: "oklch(0.75 0.18 85)", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: "oklch(0.7 0.15 200)" }}
            />
            <span className="text-muted-foreground text-xs">Active Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: "oklch(0.75 0.18 85)" }}
            />
            <span className="text-muted-foreground text-xs">Learning Sessions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
