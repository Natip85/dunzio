"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc";

type TeamWorkloadProps = {
  boardId: string;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TeamWorkload({ boardId }: TeamWorkloadProps) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.boardSummary.getTeamWorkload.queryOptions({ boardId }));

  return (
    <Card className="h-full rounded-xl border p-5">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-base font-semibold">Team workload</CardTitle>
        <CardDescription>Monitor the capacity of your team.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3.5 p-0">
        {/* Header row */}
        <div className="flex items-center justify-between px-1">
          <span className="text-muted-foreground text-xs font-medium">Assignee</span>
          <span className="text-muted-foreground text-xs font-medium">Work distribution</span>
        </div>

        {data.map((member) => (
          <div
            key={member.assigneeId ?? "__unassigned"}
            className="flex items-center gap-3"
          >
            <div className="flex w-36 shrink-0 items-center gap-2">
              {member.assigneeId ?
                <Avatar size="sm">
                  {member.image && (
                    <AvatarImage
                      src={member.image}
                      alt={member.name}
                    />
                  )}
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
              : <div className="bg-muted flex size-6 items-center justify-center rounded-full">
                  <User className="text-muted-foreground size-3.5" />
                </div>
              }
              <span className="truncate text-sm font-medium">{member.name}</span>
            </div>
            <div className="flex flex-1 items-center gap-2.5">
              <div className="bg-secondary h-5 flex-1 overflow-hidden rounded">
                <div
                  className="bg-primary/60 h-full rounded transition-all duration-500"
                  style={{ width: `${Math.max(member.percentage, 3)}%` }}
                />
              </div>
              <span className="text-muted-foreground w-8 text-right text-xs font-medium tabular-nums">
                {member.percentage}%
              </span>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <p className="text-muted-foreground py-6 text-center text-sm">No team members</p>
        )}
      </CardContent>
    </Card>
  );
}
