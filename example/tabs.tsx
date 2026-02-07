"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { parseAsString, useQueryState } from "nuqs";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityChart } from "./activity-chart";
import { DifficultyBars } from "./difficulty-bars";
import { HeroStats } from "./hero-stats";
import { LiveFeed } from "./live-feed";
import { PeakHours } from "./peak-hours";
import { QuestionDonut } from "./question-donut";
import {
  ActivityChartSkeleton,
  DifficultyBarsSkeleton,
  HeroStatsSkeleton,
  LiveFeedSkeleton,
  PeakHoursSkeleton,
  QuestionDonutSkeleton,
  TopicGridSkeleton,
  TopLearnersSkeleton,
} from "./skeletons";
import { TopLearners } from "./top-learners";
import { TopicGrid } from "./topic-grid";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "sessions", label: "Learning Sessions" },
  { id: "performance", label: "Performance" },
  { id: "users", label: "Users" },
];

type TabId = (typeof tabs)[number]["id"];

const tabContent: Record<TabId, ReactNode> = {
  overview: (
    <>
      <Suspense fallback={<HeroStatsSkeleton />}>
        <HeroStats />
      </Suspense>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<ActivityChartSkeleton />}>
            <ActivityChart />
          </Suspense>
        </div>
        <Suspense fallback={<QuestionDonutSkeleton />}>
          <QuestionDonut />
        </Suspense>
      </div>
    </>
  ),
  sessions: (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<ActivityChartSkeleton />}>
            <ActivityChart />
          </Suspense>
        </div>
        <Suspense fallback={<PeakHoursSkeleton />}>
          <PeakHours />
        </Suspense>
      </div>
      <Suspense fallback={<LiveFeedSkeleton />}>
        <LiveFeed />
      </Suspense>
    </>
  ),
  performance: (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<TopicGridSkeleton />}>
            <TopicGrid />
          </Suspense>
        </div>
        <Suspense fallback={<QuestionDonutSkeleton />}>
          <QuestionDonut />
        </Suspense>
      </div>
      <Suspense fallback={<DifficultyBarsSkeleton />}>
        <DifficultyBars />
      </Suspense>
    </>
  ),
  users: (
    <>
      <Suspense fallback={<HeroStatsSkeleton />}>
        <HeroStats />
      </Suspense>
      <Suspense fallback={<TopLearnersSkeleton />}>
        <TopLearners />
      </Suspense>
    </>
  ),
};

export function AdminDashboardTabs() {
  const [activeTab, setActiveTab] = useQueryState("tab", parseAsString.withDefault(tabs[0].id));

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex flex-col gap-0"
    >
      <div className="bg-background sticky top-0 z-10 px-6 py-2">
        <div className="mx-auto max-w-[1600px]">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      <main className="p-6">
        <div className="mx-auto max-w-[1600px] space-y-6">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="mt-0 space-y-6"
            >
              {tabContent[tab.id]}
            </TabsContent>
          ))}
        </div>
      </main>
    </Tabs>
  );
}
