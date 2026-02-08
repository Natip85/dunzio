"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, FilePlus2, Pencil } from "lucide-react";

import { useTRPC } from "@/trpc";

type HeroStatsProps = {
  boardId: string;
};

const stats = [
  {
    key: "completed" as const,
    label: "completed",
    subtitle: "in the last 7 days",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    key: "updated" as const,
    label: "updated",
    subtitle: "in the last 7 days",
    icon: Pencil,
    iconColor: "text-slate-500",
    bgColor: "bg-slate-50 dark:bg-slate-900/30",
  },
  {
    key: "created" as const,
    label: "created",
    subtitle: "in the last 7 days",
    icon: FilePlus2,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    key: "dueSoon" as const,
    label: "due soon",
    subtitle: "in the next 7 days",
    icon: CalendarClock,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
];

export function HeroStats({ boardId }: HeroStatsProps) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.boardSummary.getHeroStats.queryOptions({ boardId }));

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const value = data[stat.key];

        return (
          <div
            key={stat.key}
            className="bg-card flex items-center gap-3 border p-4"
          >
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${stat.bgColor}`}
            >
              <Icon className={`size-5 ${stat.iconColor}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold tabular-nums">{value}</span>
                <span className="text-muted-foreground text-sm">{stat.label}</span>
              </div>
              <p className="text-muted-foreground text-xs">{stat.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
