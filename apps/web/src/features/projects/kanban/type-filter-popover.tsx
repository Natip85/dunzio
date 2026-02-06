"use client";

import { ChevronDownIcon } from "lucide-react";

import type { IssueType } from "@dunzio/db/validators";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const ISSUE_TYPES: { value: IssueType; label: string; icon: string }[] = [
  { value: "task", label: "Task", icon: "✓" },
  { value: "bug", label: "Bug", icon: "🐛" },
  { value: "story", label: "Story", icon: "📖" },
  { value: "epic", label: "Epic", icon: "⚡" },
  { value: "subtask", label: "Subtask", icon: "◇" },
];

type TypeFilterPopoverProps = {
  selectedTypes: IssueType[];
  onToggleType: (type: IssueType) => void;
  onClearAll?: () => void;
};

export function TypeFilterPopover({
  selectedTypes,
  onToggleType,
  onClearAll,
}: TypeFilterPopoverProps) {
  const filterCount = selectedTypes.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex transition-all duration-300 ease-in-out"
        >
          {filterCount > 0 && <Badge className="rounded-full">{filterCount}</Badge>}
          Type
          <ChevronDownIcon className="transition-transform duration-200" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 p-0"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <h4 className="text-sm font-medium">Filter by Type</h4>
            {filterCount > 0 && onClearAll && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={onClearAll}
              >
                Clear all
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-2 p-2">
            {ISSUE_TYPES.map((type) => {
              const isSelected = selectedTypes.includes(type.value);
              return (
                <Label
                  key={type.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
                    "hover:bg-accent",
                    isSelected && "bg-accent/50"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleType(type.value)}
                  />
                  <span className="text-base">{type.icon}</span>
                  <span className="text-sm">{type.label}</span>
                </Label>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
