"use client";

import { UserIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";

export type UserOption = {
  id: string;
  name: string | null;
  image: string | null;
};

type UserSelectProps = {
  users: UserOption[];
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export const UNASSIGNED_VALUE = "__unassigned__";

export function UserSelect({
  users,
  value,
  onChange,
  placeholder = "Select assignee",
  disabled,
  className,
}: UserSelectProps) {
  // Use "__unassigned__" as the actual value for unassigned state
  const selectedValue = value ?? UNASSIGNED_VALUE;

  const handleValuesChange = (values: string[]) => {
    // Pass the value directly - "__unassigned__" or user ID
    onChange?.(values[0] ?? UNASSIGNED_VALUE);
  };

  return (
    <MultiSelect
      values={[selectedValue]}
      onValuesChange={handleValuesChange}
      single
    >
      <MultiSelectTrigger
        disabled={disabled}
        className={cn("w-full justify-start", className)}
      >
        <MultiSelectValue placeholder={placeholder} />
      </MultiSelectTrigger>
      <MultiSelectContent
        search={{ placeholder: "Search users...", emptyMessage: "No users found" }}
      >
        <MultiSelectGroup>
          <MultiSelectItem
            value={UNASSIGNED_VALUE}
            badgeLabel="Unassigned"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-muted text-xs">
                  <UserIcon className="size-4" />
                </AvatarFallback>
              </Avatar>
              <span>Unassigned</span>
            </div>
          </MultiSelectItem>
          {users.map((user) => (
            <MultiSelectItem
              key={user.id}
              value={user.id}
              badgeLabel={
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {user.name?.charAt(0) ?? ""}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.name ?? "Unknown"}</span>
                </div>
              }
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="text-xs">{user.name?.charAt(0) ?? ""}</AvatarFallback>
                </Avatar>
                <span>{user.name ?? "Unknown"}</span>
              </div>
            </MultiSelectItem>
          ))}
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  );
}
