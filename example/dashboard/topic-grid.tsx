"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/utils/trpc-client";

export function TopicGrid() {
  const trpc = useTRPC();
  const { data: topics } = useSuspenseQuery(trpc.admin.getTopicPerformance.queryOptions());
  return (
    <Card className="h-full rounded-3xl border p-6">
      <CardHeader className="mb-6 p-0">
        <CardTitle className="text-lg font-semibold">Topic Performance</CardTitle>
        <CardDescription>Accuracy by subject</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 p-0">
        {topics.map((topic) => (
          <Card
            key={topic.name}
            className="bg-secondary/50 hover:bg-secondary gap-0 rounded-2xl border-0 p-4 transition-colors"
          >
            <CardHeader className="mb-3 flex-row items-center justify-between p-0">
              <CardTitle className="text-sm font-medium">{topic.name}</CardTitle>
              <div className={`size-2 rounded-full ${topic.color}`} />
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold tracking-tight">{topic.accuracy}%</span>
                <span className="text-muted-foreground text-xs">
                  {(topic.questions / 1000).toFixed(1)}K
                </span>
              </div>
              <div className="bg-background mt-3 h-1.5 overflow-hidden rounded-full">
                <div
                  className={`h-full ${topic.color} rounded-full transition-all`}
                  style={{ width: `${topic.accuracy}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
