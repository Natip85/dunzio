"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/utils/trpc-client";

export function PeakHours() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.admin.getPeakHours.queryOptions());

  const hours = data.hours;
  const peakTime = data.peakTime;
  return (
    <Card className="h-full rounded-3xl border p-6">
      <CardHeader className="mb-6 p-0">
        <CardTitle className="text-lg font-semibold">Peak Hours</CardTitle>
        <CardDescription>Most active learning times</CardDescription>
      </CardHeader>
      <CardContent className="flex h-[120px] items-end justify-between gap-2 p-0">
        {hours.map((hour) => (
          <div
            key={hour.hour}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <div className="relative flex w-full flex-1 items-end">
              <div
                className="bg-primary/20 hover:bg-primary/30 relative w-full overflow-hidden rounded-lg transition-colors"
                style={{ height: `${hour.value}%` }}
              >
                <div
                  className="bg-primary absolute right-0 bottom-0 left-0 rounded-lg transition-all"
                  style={{ height: `${hour.value}%` }}
                />
              </div>
            </div>
            <span className="text-muted-foreground text-[10px] font-medium">{hour.hour}</span>
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-border mt-4 border-t p-0 pt-4">
        <div className="flex w-full items-center justify-between">
          <span className="text-muted-foreground text-sm">Peak time</span>
          <span className="text-sm font-semibold">{peakTime}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
