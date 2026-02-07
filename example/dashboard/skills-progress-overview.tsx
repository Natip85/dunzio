"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const skillsData = [
  {
    topic: "Addition",
    totalQuestions: 45230,
    correctQuestions: 41611,
    avgHintsUsed: 0.12,
    avgTimeMs: 8200,
    trend: "up",
  },
  {
    topic: "Subtraction",
    totalQuestions: 38450,
    correctQuestions: 33451,
    avgHintsUsed: 0.18,
    avgTimeMs: 9500,
    trend: "up",
  },
  {
    topic: "Multiplication",
    totalQuestions: 32100,
    correctQuestions: 25038,
    avgHintsUsed: 0.28,
    avgTimeMs: 12300,
    trend: "stable",
  },
  {
    topic: "Division",
    totalQuestions: 24800,
    correctQuestions: 17608,
    avgHintsUsed: 0.35,
    avgTimeMs: 15700,
    trend: "down",
  },
  {
    topic: "Fractions",
    totalQuestions: 18200,
    correctQuestions: 11830,
    avgHintsUsed: 0.42,
    avgTimeMs: 18400,
    trend: "up",
  },
  {
    topic: "Decimals",
    totalQuestions: 15600,
    correctQuestions: 11232,
    avgHintsUsed: 0.31,
    avgTimeMs: 14200,
    trend: "stable",
  },
];

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
      return <TrendingUp className="text-success size-4" />;
    case "down":
      return <TrendingDown className="text-destructive size-4" />;
    default:
      return <Minus className="text-muted-foreground size-4" />;
  }
};

const formatTime = (ms: number) => {
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
};

export function SkillsProgressOverview() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Skills Progress</CardTitle>
        <CardDescription className="text-muted-foreground">
          Detailed breakdown of mastery levels per topic
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skillsData.map((skill) => {
            const accuracy = ((skill.correctQuestions / skill.totalQuestions) * 100).toFixed(1);
            return (
              <div
                key={skill.topic}
                className="bg-muted/30 hover:bg-muted/50 rounded-lg p-3 transition-colors"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-medium">{skill.topic}</span>
                    {getTrendIcon(skill.trend)}
                  </div>
                  <span className="text-primary text-sm font-semibold">{accuracy}%</span>
                </div>
                <Progress
                  value={Number(accuracy)}
                  className="mb-2 h-2"
                />
                <div className="text-muted-foreground flex justify-between text-xs">
                  <span>{skill.totalQuestions.toLocaleString()} questions</span>
                  <span>{skill.avgHintsUsed.toFixed(2)} hints/q</span>
                  <span>Avg: {formatTime(skill.avgTimeMs)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
