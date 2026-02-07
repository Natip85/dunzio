"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const recentSessions = [
  {
    id: "1",
    user: "Emma Wilson",
    email: "emma.w@example.com",
    topic: "Multiplication",
    mode: "quiz",
    score: 9,
    total: 10,
    status: "completed",
    duration: "8m 23s",
    hintsUsed: 2,
  },
  {
    id: "2",
    user: "James Chen",
    email: "james.c@example.com",
    topic: "Fractions",
    mode: "playground",
    score: 7,
    total: 10,
    status: "completed",
    duration: "12m 45s",
    hintsUsed: 5,
  },
  {
    id: "3",
    user: "Sofia Garcia",
    email: "sofia.g@example.com",
    topic: "Division",
    mode: "quiz",
    score: 4,
    total: 10,
    status: "in_progress",
    duration: "5m 12s",
    hintsUsed: 1,
  },
  {
    id: "4",
    user: "Liam Johnson",
    email: "liam.j@example.com",
    topic: "Addition",
    mode: "quiz",
    score: 10,
    total: 10,
    status: "completed",
    duration: "6m 08s",
    hintsUsed: 0,
  },
  {
    id: "5",
    user: "Olivia Brown",
    email: "olivia.b@example.com",
    topic: "Percentages",
    mode: "playground",
    score: 6,
    total: 10,
    status: "paused",
    duration: "9m 34s",
    hintsUsed: 3,
  },
  {
    id: "6",
    user: "Noah Davis",
    email: "noah.d@example.com",
    topic: "Decimals",
    mode: "quiz",
    score: 8,
    total: 10,
    status: "completed",
    duration: "11m 22s",
    hintsUsed: 2,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-success/20 text-success border-success/30 hover:bg-success/30">
          Completed
        </Badge>
      );
    case "in_progress":
      return (
        <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
          In Progress
        </Badge>
      );
    case "paused":
      return (
        <Badge className="bg-warning/20 text-warning border-warning/30 hover:bg-warning/30">
          Paused
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getModeBadge = (mode: string) => {
  switch (mode) {
    case "quiz":
      return (
        <Badge
          variant="secondary"
          className="bg-secondary text-secondary-foreground"
        >
          Quiz
        </Badge>
      );
    case "playground":
      return (
        <Badge
          variant="outline"
          className="border-border text-muted-foreground"
        >
          Playground
        </Badge>
      );
    default:
      return <Badge variant="outline">{mode}</Badge>;
  }
};

export function RecentSessions() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Learning Sessions</CardTitle>
        <CardDescription className="text-muted-foreground">
          Latest learning activity across all users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground">User</TableHead>
              <TableHead className="text-muted-foreground">Topic</TableHead>
              <TableHead className="text-muted-foreground">Mode</TableHead>
              <TableHead className="text-muted-foreground">Progress</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Duration</TableHead>
              <TableHead className="text-muted-foreground text-right">Hints</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentSessions.map((session) => (
              <TableRow
                key={session.id}
                className="border-border/50"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {session.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-foreground font-medium">{session.user}</div>
                      <div className="text-muted-foreground text-xs">{session.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{session.topic}</TableCell>
                <TableCell>{getModeBadge(session.mode)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(session.score / session.total) * 100}
                      className="h-2 w-16"
                    />
                    <span className="text-muted-foreground text-xs">
                      {session.score}/{session.total}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(session.status)}</TableCell>
                <TableCell className="text-muted-foreground">{session.duration}</TableCell>
                <TableCell className="text-muted-foreground text-right">
                  {session.hintsUsed}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
