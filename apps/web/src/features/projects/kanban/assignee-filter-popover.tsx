"use client";

import { ChevronDownIcon, UserIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type AssigneeOption = {
  id: string;
  name: string | null;
  image: string | null;
};

type AssigneeFilterPopoverProps = {
  users: AssigneeOption[];
  selectedAssignees: string[];
  onToggleAssignee: (assigneeId: string) => void;
  onClearAll?: () => void;
};

export function AssigneeFilterPopover({
  users,
  selectedAssignees,
  onToggleAssignee,
  onClearAll,
}: AssigneeFilterPopoverProps) {
  const filterCount = selectedAssignees.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex gap-1.5 transition-all duration-300 ease-in-out"
        >
          {filterCount > 0 && <Badge className="rounded-full">{filterCount}</Badge>}
          Assignee
          <ChevronDownIcon className="size-4 transition-transform duration-200" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 p-0"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <h4 className="text-sm font-medium">Filter by Assignee</h4>
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
          <ScrollArea className="max-h-64">
            <div className="flex flex-col gap-0.5 p-2">
              {/* Unassigned option */}
              <Label
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors",
                  "hover:bg-accent/30",
                  selectedAssignees.includes("__unassigned__") && "bg-accent/50"
                )}
              >
                <Checkbox
                  checked={selectedAssignees.includes("__unassigned__")}
                  onCheckedChange={() => onToggleAssignee("__unassigned__")}
                />
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-muted text-xs">
                    <UserIcon className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">Unassigned</span>
              </Label>

              {/* User options */}
              {users.map((user) => {
                const isSelected = selectedAssignees.includes(user.id);
                return (
                  <Label
                    key={user.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors",
                      "hover:bg-accent/30",
                      isSelected && "bg-accent/50"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleAssignee(user.id)}
                    />
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.image ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {user.name?.charAt(0) ?? ""}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm">{user.name ?? "Unknown"}</span>
                  </Label>
                );
              })}

              {users.length === 0 && (
                <p className="text-muted-foreground px-2 py-4 text-center text-sm">
                  No team members found
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
