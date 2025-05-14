"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { useState, useRef } from "react";
import { Check, ChevronsUpDown, Trash2Icon, User } from "lucide-react";
import { useDebounce } from "use-debounce";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { UserSelect } from "../auth/auth-types";
import Image from "next/image";
import type { Project } from "./project-types";
import { authClient } from "@/lib/auth-client";

interface Props {
  project: Project;
}

export default function ManageAccess({ project }: Props) {
  const currentUser = authClient.useSession().data?.user;
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserSelect | null>(null);
  const [debouncedInputValue] = useDebounce(inputValue, 300);

  const inputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();

  const { data: users } = api.auth.getAll.useQuery();

  const { data: projectMembers } = api.project.projectMembers.useQuery(
    project.id,
  );
  const { mutateAsync: inviteUser } = api.project.addMember.useMutation({
    onSuccess: async () => {
      await utils.project.projectMembers.invalidate(project.id);
      setInputValue("");
      setSelectedUser(null);
    },
  });
  const { mutateAsync: removeMember } = api.project.removeMember.useMutation({
    onSuccess: async () => {
      await utils.project.projectMembers.invalidate(project.id);
    },
  });

  const filteredUsers = users
    ?.filter((user) => user.id !== currentUser?.id)
    .filter(
      (user) =>
        user.email.toLowerCase().includes(debouncedInputValue.toLowerCase()) ||
        user.name?.toLowerCase().includes(debouncedInputValue.toLowerCase()),
    );

  const selectUser = (user: UserSelect) => {
    setSelectedUser(user);
    setInputValue(user.email);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl tracking-tight">Who has access</h2>
        <p className="text-muted-foreground">
          Control who has access to your project and what permissions they have.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="grid gap-2">
          {projectMembers?.length !== 0 && (
            <h3 className="text-lg font-medium">Team Members</h3>
          )}
          {projectMembers?.map((member) => (
            <div key={member.id} className="rounded-md border">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative aspect-square size-8">
                      <Image
                        fill
                        src={member.user.image ?? "/placeholder.svg"}
                        alt={member.user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    </div>{" "}
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant={"destructive"}
                      onClick={async () =>
                        await removeMember({
                          projectId: project.id,
                          userId: member.user.id,
                        })
                      }
                    >
                      <Trash2Icon />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-2">
          <h3 className="text-lg font-medium">Invite New Members</h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div className="flex w-full items-center">
                    <Input
                      ref={inputRef}
                      placeholder="Email address"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        if (!open && e.target.value) {
                          setOpen(true);
                        }
                      }}
                      className="w-full"
                      onFocus={() => inputValue && setOpen(true)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="absolute top-0 right-0 h-full"
                      onClick={() => setOpen(!open)}
                    >
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start" sideOffset={5}>
                  <Command>
                    <CommandInput
                      placeholder="Search users..."
                      value={inputValue}
                      onValueChange={setInputValue}
                    />
                    <CommandList>
                      <CommandEmpty>No users found</CommandEmpty>
                      <CommandGroup>
                        {filteredUsers?.map((user) => (
                          <CommandItem
                            key={user.id}
                            onSelect={() => selectUser(user)}
                            className="flex items-center gap-2"
                          >
                            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                              {user.image ? (
                                <div className="relative aspect-square size-8">
                                  <Image
                                    fill
                                    src={user.image || "/placeholder.svg"}
                                    alt={user.name}
                                    className="h-8 w-8 rounded-full"
                                  />
                                </div>
                              ) : (
                                <User className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate text-sm font-medium">
                                {user.name}
                              </p>
                              <p className="text-muted-foreground truncate text-xs">
                                {user.email}
                              </p>
                            </div>
                            {inputValue === user.email && (
                              <Check className="text-primary h-4 w-4" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              onClick={async () => {
                if (!selectedUser) return;
                await inviteUser({
                  projectId: project.id,
                  userId: selectedUser.id,
                  email: inputValue,
                  name: selectedUser.name,
                });
              }}
            >
              Invite
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
