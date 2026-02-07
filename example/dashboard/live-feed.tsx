"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/utils/trpc-client";

export function LiveFeed() {
  const trpc = useTRPC();
  const { data: sessions } = useSuspenseQuery({
    ...trpc.admin.getLiveFeed.queryOptions(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
  return (
    <Card className="h-full rounded-3xl border p-6">
      <CardHeader className="mb-6 p-0">
        <CardTitle className="text-lg font-semibold">Live Activity</CardTitle>
        <CardDescription>Real-time learning session feed</CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-success relative inline-flex size-2 rounded-full" />
            </span>
            <span className="text-muted-foreground text-xs">Live</span>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {sessions.map((session, idx) => (
          <div
            key={idx}
            className="bg-secondary/30 hover:bg-secondary/50 flex items-center gap-4 rounded-2xl p-3 transition-colors"
          >
            <Avatar className="border-border size-10 border-2">
              <AvatarFallback className="bg-muted text-xs font-medium">
                {session.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{session.name}</span>
                {session.status === "in-progress" && (
                  <span className="bg-warning/20 text-warning rounded-full px-2 py-0.5 text-[10px] font-medium">
                    Active
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-xs">{session.topic}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{session.score}%</p>
              <p className="text-muted-foreground text-[10px]">{session.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
