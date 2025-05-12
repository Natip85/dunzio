"use client";
"use no memo";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  type CommentCreateSelect,
  commentCreateSelectSchema,
} from "./comment-types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { api } from "@/trpc/react";
import type { TaskSelect } from "../tasks/task-types";
import { useRouter } from "next/navigation";

interface Props {
  task: TaskSelect;
}

export default function AddComment({ task }: Props) {
  const router = useRouter();
  const session = authClient.useSession().data;
  const utils = api.useUtils();
  const { mutateAsync: create, isPending: isLoading } =
    api.comment.create.useMutation();
  const form = useForm<CommentCreateSelect>({
    resolver: zodResolver(commentCreateSelectSchema),
    defaultValues: {
      taskId: task.id,
      userId: session?.user.id,
    },
  });

  const onSubmit = async (values: CommentCreateSelect) => {
    await create(values);
    router.refresh();
    await utils.comment.getAllByTask.invalidate(task.id);
  };
  console.log("errors: ", form.formState.errors);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-20 space-y-3">
        <div className="flex w-full gap-5">
          <div className="relative size-10">
            <Image
              src={session?.user.image ?? ""}
              alt="profile img"
              fill
              className="rounded-full"
            />
          </div>
          <Card className="flex-1 rounded-md border-0 p-0 shadow-none">
            <CardHeader className="flex items-center justify-between rounded-t-md p-2">
              <CardTitle className="m-0 p-0">Add comment</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div>
                <FormField
                  control={form.control}
                  name="content"
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
                    disabled={isLoading}
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}
