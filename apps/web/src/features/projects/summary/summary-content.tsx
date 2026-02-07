"use client";

import { Suspense } from "react";

import { EpicProgress } from "./epic-progress";
import { HeroStats } from "./hero-stats";
import { PriorityBreakdown } from "./priority-breakdown";
import { RecentActivity } from "./recent-activity";
import { StatusDonut } from "./status-donut";
import {
  EpicProgressSkeleton,
  HeroStatsSkeleton,
  PriorityBreakdownSkeleton,
  RecentActivitySkeleton,
  StatusDonutSkeleton,
  TeamWorkloadSkeleton,
  TypesOfWorkSkeleton,
} from "./summary-skeletons";
import { TeamWorkload } from "./team-workload";
import { TypesOfWork } from "./types-of-work";

type SummaryContentProps = {
  boardId: string;
};

export function SummaryContent({ boardId }: SummaryContentProps) {
  return (
    <div className="space-y-6 pb-8">
      {/* Row 1: Hero Stats */}
      <Suspense fallback={<HeroStatsSkeleton />}>
        <HeroStats boardId={boardId} />
      </Suspense>

      {/* Row 2: Status Overview + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<StatusDonutSkeleton />}>
          <StatusDonut boardId={boardId} />
        </Suspense>
        <Suspense fallback={<RecentActivitySkeleton />}>
          <RecentActivity boardId={boardId} />
        </Suspense>
      </div>

      {/* Row 3: Priority Breakdown + Types of Work */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<PriorityBreakdownSkeleton />}>
          <PriorityBreakdown boardId={boardId} />
        </Suspense>
        <Suspense fallback={<TypesOfWorkSkeleton />}>
          <TypesOfWork boardId={boardId} />
        </Suspense>
      </div>

      {/* Row 4: Team Workload + Epic Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<TeamWorkloadSkeleton />}>
          <TeamWorkload boardId={boardId} />
        </Suspense>
        <Suspense fallback={<EpicProgressSkeleton />}>
          <EpicProgress boardId={boardId} />
        </Suspense>
      </div>
    </div>
  );
}
