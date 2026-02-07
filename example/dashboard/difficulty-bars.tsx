"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/utils/trpc-client";

export function DifficultyBars() {
  const trpc = useTRPC();
  const { data: difficulties } = useSuspenseQuery(trpc.admin.getDifficultyStats.queryOptions());
  return (
    <Card className="h-full rounded-3xl border p-6">
      <CardHeader className="mb-6 p-0">
        <CardTitle className="text-lg font-semibold">Difficulty Split</CardTitle>
        <CardDescription>Questions by level</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 p-0">
        {difficulties.map((diff) => (
          <div key={diff.level}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`size-2 rounded-full ${diff.color}`} />
                <span className="text-sm font-medium">{diff.level}</span>
              </div>
              <span className="text-muted-foreground font-mono text-sm">
                {(diff.count / 1000).toFixed(1)}K
              </span>
            </div>
            <div className="bg-secondary h-3 overflow-hidden rounded-full">
              <div
                className={`h-full ${diff.color} rounded-full transition-all duration-500`}
                style={{ width: `${diff.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
