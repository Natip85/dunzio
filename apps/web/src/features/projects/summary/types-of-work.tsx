"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { BookOpen, Bug, CheckSquare, Layers, Zap } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc";

type TypesOfWorkProps = {
  boardId: string;
};

const typeConfig: Record<
  string,
  { label: string; icon: typeof BookOpen; color: string; bgColor: string }
> = {
  story: {
    label: "Story",
    icon: BookOpen,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500",
  },
  epic: {
    label: "Epic",
    icon: Zap,
    color: "text-purple-600",
    bgColor: "bg-purple-500",
  },
  task: {
    label: "Task",
    icon: CheckSquare,
    color: "text-blue-600",
    bgColor: "bg-blue-500",
  },
  bug: {
    label: "Bug",
    icon: Bug,
    color: "text-red-600",
    bgColor: "bg-red-500",
  },
  subtask: {
    label: "Subtask",
    icon: Layers,
    color: "text-slate-500",
    bgColor: "bg-slate-500",
  },
};

export function TypesOfWork({ boardId }: TypesOfWorkProps) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.boardSummary.getTypesOfWork.queryOptions({ boardId }));

  return (
    <Card className="h-full border p-5">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-base font-semibold">Types of work</CardTitle>
        <CardDescription>Get a breakdown of work items by their types.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {/* Table header */}
        <div className="flex items-center justify-between px-1">
          <span className="text-muted-foreground text-xs font-medium">Type</span>
          <span className="text-muted-foreground text-xs font-medium">Distribution</span>
        </div>

        {data.map((item) => {
          const config = typeConfig[item.type];
          if (!config) return null;
          const Icon = config.icon;

          return (
            <div
              key={item.type}
              className="flex items-center gap-3"
            >
              <div className="flex w-24 shrink-0 items-center gap-2">
                <Icon className={`size-4 ${config.color}`} />
                <span className="text-sm font-medium">{config.label}</span>
              </div>
              <div className="flex flex-1 items-center gap-2.5">
                <div className="bg-secondary h-6 flex-1 overflow-hidden rounded">
                  <div
                    className={`h-full rounded ${config.bgColor} flex items-center px-2 transition-all duration-500`}
                    style={{ width: `${Math.max(item.percentage, 4)}%` }}
                  >
                    {item.percentage >= 10 && (
                      <span className="text-xs font-medium text-white">{item.percentage}%</span>
                    )}
                  </div>
                </div>
                {item.percentage < 10 && (
                  <span className="text-muted-foreground w-8 text-right text-xs font-medium tabular-nums">
                    {item.percentage}%
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <p className="text-muted-foreground py-6 text-center text-sm">No work items</p>
        )}
      </CardContent>
    </Card>
  );
}
