"use client";
"use no memo";

import { type TaskSelect, taskSelectSchema } from "./task-types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import CommentCard from "./comment-card";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import type { Project } from "../projects/project-types";
import { authClient } from "@/lib/auth-client";
interface Props {
  task: Project["cols"][number]["colTasks"][number];
}
export default function EditDescriptionForm({ task }: Props) {
  const router = useRouter();
  const session = authClient.useSession().data;
  const [edit, setEdit] = useState(false);
  const { mutateAsync: editDescription, isPending: isLoading } =
    api.task.editDescription.useMutation();

  const form = useForm<TaskSelect>({
    resolver: zodResolver(taskSelectSchema),
    defaultValues: { ...task, createdBy: session?.user.id },
  });

  const onSubmit = async (values: TaskSelect) => {
    await editDescription(values);
    router.refresh();
    setEdit(false);
  };
  console.log("errors: ", form.formState.errors);
  return (
    <div className="p-2">
      {edit ? (
        <div className="flex w-full gap-5">
          <div className="relative size-10">
            <Image
              src={task.createdBy.image ?? ""}
              alt="profile img"
              fill
              className="rounded-full"
            />
          </div>
          <Card className="border-primary flex-1 rounded-md border p-0">
            <CardHeader className="bg-primary/20 border-primary flex items-center justify-between rounded-t-md border-b p-2">
              <div className="flex items-center gap-2">
                <CardTitle>namee</CardTitle>
                <CardDescription>created at</CardDescription>
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={"ghost"}>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => setEdit?.(true)}>
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <div>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full"
                  >
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              className="resize-none"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="mt-5 flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant={"outline"}
                        onClick={() => setEdit(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={isLoading}
                        type="submit"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Save
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <CommentCard
          text={task.description}
          createdAt={task.createdAt}
          name={""}
          image={task.createdBy.image}
          setEdit={() => setEdit(true)}
        />
      )}
    </div>
  );
}
