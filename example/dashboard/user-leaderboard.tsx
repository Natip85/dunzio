"use client";

import { Award, Medal, Trophy } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const topUsers = [
  { rank: 1, name: "Emma Wilson", score: 12450, sessions: 89, accuracy: 94.2 },
  { rank: 2, name: "James Chen", score: 11280, sessions: 76, accuracy: 91.8 },
  { rank: 3, name: "Sofia Garcia", score: 10890, sessions: 82, accuracy: 89.5 },
  { rank: 4, name: "Liam Johnson", score: 9720, sessions: 68, accuracy: 92.1 },
  { rank: 5, name: "Olivia Brown", score: 9340, sessions: 71, accuracy: 87.3 },
  { rank: 6, name: "Noah Davis", score: 8980, sessions: 65, accuracy: 90.6 },
  { rank: 7, name: "Ava Martinez", score: 8650, sessions: 59, accuracy: 88.9 },
  { rank: 8, name: "Ethan Wilson", score: 8210, sessions: 54, accuracy: 86.7 },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="size-5 text-yellow-500" />;
    case 2:
      return <Medal className="size-5 text-gray-400" />;
    case 3:
      return <Award className="size-5 text-amber-600" />;
    default:
      return (
        <span className="text-muted-foreground w-5 text-center font-mono text-sm">{rank}</span>
      );
  }
};

export function UserLeaderboard() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Top Learners</CardTitle>
        <CardDescription className="text-muted-foreground">
          Highest scoring users this month
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topUsers.map((user) => (
          <div
            key={user.rank}
            className={`flex items-center gap-4 rounded-lg p-3 transition-colors ${
              user.rank <= 3 ? "bg-primary/5 border-primary/10 border" : "hover:bg-muted/50"
            }`}
          >
            <div className="flex w-8 items-center justify-center">{getRankIcon(user.rank)}</div>
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-foreground truncate font-medium">{user.name}</div>
              <div className="text-muted-foreground text-xs">
                {user.sessions} learning sessions • {user.accuracy}% accuracy
              </div>
            </div>
            <div className="text-right">
              <div className="text-foreground font-semibold">{user.score.toLocaleString()}</div>
              <div className="text-muted-foreground text-xs">points</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
