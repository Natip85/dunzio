"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/utils/trpc-client";

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
}

function formatTime(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function HeroStats() {
  const trpc = useTRPC();
  const { data: userStats } = useSuspenseQuery(trpc.admin.getUserStats.queryOptions());
  const { data: sessionStats } = useSuspenseQuery(trpc.admin.getSessionStats.queryOptions());
  const { data: questionStats } = useSuspenseQuery(trpc.admin.getQuestionStats.queryOptions());
  const { data: avgTimeStats } = useSuspenseQuery(trpc.admin.getAvgTimeStats.queryOptions());
  const { data: hintsStats } = useSuspenseQuery(trpc.admin.getHintsStats.queryOptions());

  const totalUsers = userStats.totalUsers;
  const percentChange = userStats.percentChange;
  const isPositive = percentChange >= 0;

  const totalSessions = sessionStats.totalSessions;
  const sessionPercentChange = sessionStats.percentChange;
  const isSessionPositive = sessionPercentChange >= 0;

  const totalQuestions = questionStats.totalQuestions;
  const questionPercentChange = questionStats.percentChange;
  const isQuestionPositive = questionPercentChange >= 0;

  const avgTimeMs = avgTimeStats.avgTimeMs;
  const avgTimePercentChange = avgTimeStats.percentChange;
  // For time, negative change (faster) is good, so we flip the logic
  const isTimeImproved = avgTimePercentChange <= 0;

  const totalHints = hintsStats.totalHints;
  const avgHintsPerQuestion = hintsStats.avgHintsPerQuestion;
  const hintsPercentChange = hintsStats.percentChange;
  // For hints, negative change (fewer hints needed) is good
  const isHintsImproved = hintsPercentChange <= 0;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {/* Giant hero stat */}
      <Card className="bg-primary col-span-2 row-span-2 min-h-[280px] justify-between rounded-3xl p-8 lg:col-span-2">
        <CardHeader className="p-0">
          <CardDescription className="text-primary-foreground/70 text-sm font-medium tracking-wider uppercase">
            Total Users
          </CardDescription>
          <CardTitle className="text-primary-foreground mt-2 text-7xl font-bold tracking-tighter lg:text-8xl">
            {totalUsers.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-primary-foreground/80 flex items-center gap-2 p-0">
          {isPositive ?
            <ArrowUpRight className="size-5" />
          : <ArrowDownRight className="size-5" />}
          <span className="text-sm font-medium">
            {isPositive ? "+" : ""}
            {percentChange}% from last month
          </span>
        </CardFooter>
      </Card>

      {/* Secondary stats */}
      <Card className="justify-between rounded-3xl border p-6">
        <CardHeader className="p-0">
          <CardDescription className="text-xs font-medium tracking-wider uppercase">
            Learning Sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <CardTitle className="text-4xl font-bold tracking-tight">
            {formatNumber(totalSessions)}
          </CardTitle>
          <div
            className={`mt-1 flex items-center gap-1 ${isSessionPositive ? "text-success" : "text-warning"}`}
          >
            {isSessionPositive ?
              <ArrowUpRight className="size-3" />
            : <ArrowDownRight className="size-3" />}
            <span className="text-xs">
              {isSessionPositive ? "+" : ""}
              {sessionPercentChange}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="justify-between rounded-3xl border p-6">
        <CardHeader className="p-0">
          <CardDescription className="text-xs font-medium tracking-wider uppercase">
            Questions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <CardTitle className="text-4xl font-bold tracking-tight">
            {formatNumber(totalQuestions)}
          </CardTitle>
          <div
            className={`mt-1 flex items-center gap-1 ${isQuestionPositive ? "text-success" : "text-warning"}`}
          >
            {isQuestionPositive ?
              <ArrowUpRight className="size-3" />
            : <ArrowDownRight className="size-3" />}
            <span className="text-xs">
              {isQuestionPositive ? "+" : ""}
              {questionPercentChange}%
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="justify-between rounded-3xl border p-6">
        <CardHeader className="p-0">
          <CardDescription className="text-xs font-medium tracking-wider uppercase">
            Avg Time
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <CardTitle className="text-4xl font-bold tracking-tight">
            {formatTime(avgTimeMs)}
          </CardTitle>
          <div
            className={`mt-1 flex items-center gap-1 ${isTimeImproved ? "text-success" : "text-warning"}`}
          >
            {isTimeImproved ?
              <ArrowDownRight className="size-3" />
            : <ArrowUpRight className="size-3" />}
            <span className="text-xs">
              {avgTimePercentChange >= 0 ? "+" : ""}
              {avgTimePercentChange}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Wide stat with chart placeholder */}
      <Card className="col-span-2 rounded-3xl border p-6 lg:col-span-3">
        <CardHeader className="flex-row items-start justify-between p-0">
          <div>
            <CardDescription className="text-xs font-medium tracking-wider uppercase">
              Hints Used
            </CardDescription>
            <CardTitle className="mt-2 text-4xl font-bold tracking-tight">
              {formatNumber(totalHints)}
            </CardTitle>
          </div>
          <div
            className={`flex items-center gap-1 ${isHintsImproved ? "text-success" : "text-warning"}`}
          >
            {isHintsImproved ?
              <ArrowDownRight className="size-4" />
            : <ArrowUpRight className="size-4" />}
            <span className="text-sm font-medium">
              {hintsPercentChange >= 0 ? "+" : ""}
              {hintsPercentChange}%
            </span>
          </div>
        </CardHeader>
        <CardFooter className="p-0">
          <p className="text-muted-foreground text-sm">
            Average {avgHintsPerQuestion} hints per question answered
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
