"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const sessionsData = [
  { date: "Jan 1", sessions: 245, completed: 198 },
  { date: "Jan 2", sessions: 312, completed: 267 },
  { date: "Jan 3", sessions: 287, completed: 234 },
  { date: "Jan 4", sessions: 356, completed: 312 },
  { date: "Jan 5", sessions: 421, completed: 378 },
  { date: "Jan 6", sessions: 389, completed: 342 },
  { date: "Jan 7", sessions: 445, completed: 401 },
  { date: "Jan 8", sessions: 478, completed: 423 },
  { date: "Jan 9", sessions: 512, completed: 467 },
  { date: "Jan 10", sessions: 534, completed: 489 },
  { date: "Jan 11", sessions: 489, completed: 445 },
  { date: "Jan 12", sessions: 567, completed: 512 },
  { date: "Jan 13", sessions: 612, completed: 567 },
  { date: "Jan 14", sessions: 645, completed: 598 },
];

const chartConfig = {
  sessions: {
    label: "Total Learning Sessions",
    color: "oklch(0.7 0.15 200)",
  },
  completed: {
    label: "Completed",
    color: "oklch(0.65 0.15 145)",
  },
};

export function SessionsChart() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Learning Sessions</CardTitle>
        <CardDescription className="text-muted-foreground">
          Daily learning session activity over the last 14 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={sessionsData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="sessionsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="oklch(0.7 0.15 200)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.7 0.15 200)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="completedGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="oklch(0.65 0.15 145)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="oklch(0.65 0.15 145)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.25 0.01 285)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
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
                tickFormatter={(value) => `${value}`}
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
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="oklch(0.7 0.15 200)"
                strokeWidth={2}
                fill="url(#sessionsGradient)"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="oklch(0.65 0.15 145)"
                strokeWidth={2}
                fill="url(#completedGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
