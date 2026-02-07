"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc";

type RecentActivityProps = {
  boardId: string;
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getDateGroup(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (activityDate.getTime() === today.getTime()) return "Today";
  if (activityDate.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatAction(action: string): string {
  switch (action) {
    case "created":
      return "created";
    case "updated":
      return "updated";
    case "commented":
      return "commented on";
    case "assigned":
      return "assigned";
    case "moved":
      return "moved";
    default:
      return action;
  }
}

export function RecentActivity({ boardId }: RecentActivityProps) {
  const trpc = useTRPC();
  const { data: activities } = useSuspenseQuery(
    trpc.boardSummary.getRecentActivity.queryOptions({ boardId })
  );

  // Group activities by date
  const grouped = activities.reduce<Record<string, typeof activities>>((acc, activity) => {
    const group = getDateGroup(activity.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(activity);
    return acc;
  }, {});

  return (
    <Card className="h-full rounded-xl border p-5">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-base font-semibold">Recent activity</CardTitle>
        <CardDescription>
          Stay up to date with what&apos;s happening across the space.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[320px] space-y-4 overflow-y-auto p-0">
        {Object.entries(grouped).length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">No recent activity</p>
        )}
        {Object.entries(grouped).map(([dateGroup, items]) => (
          <div
            key={dateGroup}
            className="space-y-3"
          >
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {dateGroup}
            </p>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3"
              >
                <Avatar size="sm">
                  {item.actorImage && (
                    <AvatarImage
                      src={item.actorImage}
                      alt={item.actorName}
                    />
                  )}
                  <AvatarFallback>{getInitials(item.actorName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{item.actorName}</span>{" "}
                    <span className="text-muted-foreground">{formatAction(item.action)}</span>{" "}
                    <span className="font-medium">
                      {item.issueKey}: {item.issueTitle}
                    </span>
                    {item.action === "created" && (
                      <>
                        {" "}
                        <Badge
                          variant="outline"
                          className="ml-1 text-[10px] font-medium uppercase"
                        >
                          Open
                        </Badge>
                      </>
                    )}
                  </p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {getRelativeTime(item.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
