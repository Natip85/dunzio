"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Zap } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc";

type EpicProgressProps = {
  boardId: string;
};

export function EpicProgress({ boardId }: EpicProgressProps) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.boardSummary.getEpicProgress.queryOptions({ boardId }));

  return (
    <Card className="h-full border p-5">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-base font-semibold">Epic progress</CardTitle>
        <CardDescription>See how your epics are progressing at a glance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 p-0">
        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-sm bg-emerald-500" />
            <span className="text-muted-foreground text-xs">Done</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-sm bg-blue-500" />
            <span className="text-muted-foreground text-xs">In progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-sm bg-gray-300 dark:bg-gray-600" />
            <span className="text-muted-foreground text-xs">To do</span>
          </div>
        </div>

        {data.map((epic) => {
          const donePercent = epic.total > 0 ? (epic.done / epic.total) * 100 : 0;
          const inProgressPercent = epic.total > 0 ? (epic.inProgress / epic.total) * 100 : 0;
          const todoPercent = epic.total > 0 ? (epic.todo / epic.total) * 100 : 0;

          return (
            <div
              key={epic.id}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-purple-600" />
                <span className="text-muted-foreground text-xs font-medium">{epic.key}</span>
                <span className="truncate text-sm">{epic.title}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-5 flex-1 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                  {donePercent > 0 && (
                    <div
                      className="flex h-full items-center justify-center bg-emerald-500 transition-all"
                      style={{ width: `${donePercent}%` }}
                    >
                      {donePercent >= 15 && (
                        <span className="text-[10px] font-medium text-white">
                          {epic.percentage}%
                        </span>
                      )}
                    </div>
                  )}
                  {inProgressPercent > 0 && (
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${inProgressPercent}%` }}
                    />
                  )}
                  {todoPercent > 0 && (
                    <div
                      className="h-full bg-gray-300 transition-all dark:bg-gray-600"
                      style={{ width: `${todoPercent}%` }}
                    />
                  )}
                </div>
                {donePercent < 15 && (
                  <span className="text-muted-foreground w-8 text-right text-xs font-medium tabular-nums">
                    {epic.percentage}%
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <p className="text-muted-foreground py-6 text-center text-sm">
            No epics with child issues
          </p>
        )}
      </CardContent>
    </Card>
  );
}
