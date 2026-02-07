"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const difficultyData = [
  { level: "Easy", questions: 68420, accuracy: 94.2, avgTime: "6.2s", color: "bg-success" },
  { level: "Medium", questions: 52340, accuracy: 78.5, avgTime: "12.8s", color: "bg-primary" },
  { level: "Hard", questions: 36082, accuracy: 62.1, avgTime: "21.4s", color: "bg-warning" },
];

const totalQuestions = difficultyData.reduce((acc, d) => acc + d.questions, 0);

export function DifficultyDistribution() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Difficulty Levels</CardTitle>
        <CardDescription className="text-muted-foreground">
          Question distribution and performance by difficulty
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {difficultyData.map((item) => {
          const percentage = ((item.questions / totalQuestions) * 100).toFixed(1);
          return (
            <div
              key={item.level}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`size-3 rounded-full ${item.color}`} />
                  <span className="text-foreground font-medium">{item.level}</span>
                </div>
                <span className="text-muted-foreground text-sm">{percentage}%</span>
              </div>
              <Progress
                value={Number(percentage)}
                className="h-2"
              />
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>{item.questions.toLocaleString()} questions</span>
                <span>{item.accuracy}% accuracy</span>
                <span>Avg: {item.avgTime}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
