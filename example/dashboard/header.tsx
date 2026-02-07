"use client";

import { CalendarIcon, Download, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "../page-header";

export function DashboardHeader() {
  return (
    <PageHeader
      title="Analytics Dashboard"
      actions={
        <>
          <Select defaultValue="7d">
            <SelectTrigger
              disabled
              className="bg-card/50 border-border/50 w-[160px]"
            >
              <CalendarIcon className="text-muted-foreground mr-2 size-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="border-border/50 bg-card/50"
          >
            <RefreshCw className="size-4" />
            <span className="sr-only">Refresh data</span>
          </Button>
          <Button
            disabled
            variant="outline"
            className="border-border/50 bg-card/50"
          >
            <Download className="mr-2 size-4" />
            Export
          </Button>
        </>
      }
    />
  );
}
