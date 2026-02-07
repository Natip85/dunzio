"use client";

import React from "react";
import { Award, BookOpen, Brain, Clock, Target, TrendingUp, Users, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
        <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-foreground text-2xl font-bold">{value}</div>
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span
              className={`text-xs font-medium ${trend.isPositive ? "text-success" : "text-destructive"}`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
          )}
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      description: "Active learners",
      icon: <Users className="size-4" />,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: "Learning Sessions",
      value: "18,429",
      description: "Total sessions completed",
      icon: <BookOpen className="size-4" />,
      trend: { value: 8.2, isPositive: true },
    },
    {
      title: "Questions Answered",
      value: "156,842",
      description: "Across all topics",
      icon: <Target className="size-4" />,
      trend: { value: 23.1, isPositive: true },
    },
    {
      title: "Avg. Accuracy",
      value: "78.4%",
      description: "Overall correct rate",
      icon: <TrendingUp className="size-4" />,
      trend: { value: 3.2, isPositive: true },
    },
    {
      title: "Avg. Session Time",
      value: "12m 34s",
      description: "Per learning session",
      icon: <Clock className="size-4" />,
      trend: { value: 5.7, isPositive: true },
    },
    {
      title: "Badges Earned",
      value: "4,291",
      description: "Total achievements",
      icon: <Award className="size-4" />,
      trend: { value: 15.3, isPositive: true },
    },
    {
      title: "Skills Mastered",
      value: "892",
      description: "Topics at 90%+ accuracy",
      icon: <Brain className="size-4" />,
      trend: { value: 7.8, isPositive: true },
    },
    {
      title: "Hints Used",
      value: "34,521",
      description: "Average 0.22 per question",
      icon: <Zap className="size-4" />,
      trend: { value: 2.1, isPositive: false },
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          {...stat}
        />
      ))}
    </div>
  );
}
