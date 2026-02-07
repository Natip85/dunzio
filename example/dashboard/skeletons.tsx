"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {/* Giant hero stat */}
      <Card className="bg-primary col-span-2 row-span-2 min-h-[280px] justify-between rounded-3xl p-8 lg:col-span-2">
        <CardHeader className="p-0">
          <Skeleton className="bg-primary-foreground/20 h-4 w-24" />
          <Skeleton className="bg-primary-foreground/20 mt-2 h-20 w-48" />
        </CardHeader>
        <CardFooter className="flex items-center gap-2 p-0">
          <Skeleton className="bg-primary-foreground/20 h-4 w-32" />
        </CardFooter>
      </Card>

      {/* Secondary stats */}
      {[...Array(3)].map((_, i) => (
        <Card
          key={i}
          className="justify-between rounded-3xl border p-6"
        >
          <CardHeader className="p-0">
            <Skeleton className="h-3 w-20" />
          </CardHeader>
          <CardContent className="p-0">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="mt-1 h-3 w-12" />
          </CardContent>
        </Card>
      ))}

      {/* Wide stat */}
      <Card className="col-span-2 rounded-3xl border p-6 lg:col-span-3">
        <CardHeader className="flex-row items-start justify-between p-0">
          <div>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-10 w-20" />
          </div>
          <Skeleton className="h-4 w-12" />
        </CardHeader>
        <CardFooter className="p-0">
          <Skeleton className="h-4 w-48" />
        </CardFooter>
      </Card>
    </div>
  );
}

export function ActivityChartSkeleton() {
  return (
    <Card className="h-full rounded-3xl border p-6">
      <CardHeader className="mb-6 flex-row items-center justify-between p-0">
        <div>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-1 h-4 w-48" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Skeleton className="h-[250px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export function QuestionDonutSkeleton() {
  return (
    <Card className="h-full rounded-3xl border p-6">
      <CardHeader className="mb-4 p-0">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-1 h-4 w-36" />
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center p-0">
        <Skeleton className="size-[180px] rounded-full" />
      </CardContent>
      <CardFooter className="mt-4 flex justify-center gap-4 p-0">
        {[...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-3 w-20"
          />
        ))}
      </CardFooter>
    </Card>
  );
}

export function TopicGridSkeleton() {
  return (
    <Card className="h-full rounded-3xl border p-6">
      <CardHeader className="mb-6 p-0">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-1 h-4 w-28" />
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 p-0">
        {[...Array(6)].map((_, i) => (
          <Card
            key={i}
            className="bg-secondary/50 gap-0 rounded-2xl border-0 p-4"
          >
            <CardHeader className="mb-3 flex-row items-center justify-between p-0">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-2 rounded-full" />
            </CardHeader>
            <CardContent className="p-0">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

const peakHoursBarHeights = [45, 65, 80, 55, 90, 70, 40, 60];

export function PeakHoursSkeleton() {
  return (
    <Card className="h-full rounded-3xl border p-6">
      <CardHeader className="mb-6 p-0">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-1 h-4 w-36" />
      </CardHeader>
      <CardContent className="flex h-[120px] items-end justify-between gap-2 p-0">
        {peakHoursBarHeights.map((height, i) => (
          <div
            key={i}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <Skeleton
              className="w-full rounded-lg"
              style={{ height: `${height}%` }}
            />
            <Skeleton className="h-2 w-6" />
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-border mt-4 border-t p-0 pt-4">
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardFooter>
    </Card>
  );
}

export function DifficultyBarsSkeleton() {
  return (
    <Card className="h-full rounded-3xl border p-6">
      <CardHeader className="mb-6 p-0">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-1 h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-5 p-0">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-2 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function LiveFeedSkeleton() {
  return (
    <Card className="h-full rounded-3xl border p-6">
      <CardHeader className="mb-6 p-0">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-1 h-4 w-40" />
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        {[...Array(5)].map((_, idx) => (
          <div
            key={idx}
            className="bg-secondary/30 flex items-center gap-4 rounded-2xl p-3"
          >
            <Skeleton className="size-10 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-1 h-3 w-20" />
            </div>
            <div className="text-right">
              <Skeleton className="h-6 w-10" />
              <Skeleton className="mt-1 h-2 w-14" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TopLearnersSkeleton() {
  return (
    <Card className="h-full rounded-3xl border p-6">
      <CardHeader className="mb-6 flex-row items-center gap-3 p-0">
        <Skeleton className="size-10 rounded-xl" />
        <div>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-1 h-4 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-0">
        {[...Array(5)].map((_, idx) => (
          <Card
            key={idx}
            className="bg-secondary/30 flex-row items-center gap-4 rounded-2xl border-0 p-3"
          >
            <Skeleton className="size-12 rounded-full" />
            <CardContent className="flex-1 p-0">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-1 h-3 w-20" />
            </CardContent>
            <Skeleton className="h-6 w-12" />
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
