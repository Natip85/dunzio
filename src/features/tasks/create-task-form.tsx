"use client";
"use no memo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { type TaskCreateSelect, taskCreateSelectSchema } from "./task-types";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
interface Props {
  projectId: number | null;
  columnId: number;
}
export default function CreateTaskForm({ projectId, columnId }: Props) {
  const router = useRouter();
  const { mutateAsync: create, isPending: isLoading } =
    api.task.create.useMutation();

  const form = useForm<TaskCreateSelect>({
    resolver: zodResolver(taskCreateSelectSchema),
    defaultValues: { columnId, projectId, description: "" },
  });

  const onSubmit = async (values: TaskCreateSelect) => {
    await create(values);
    router.refresh();
  };
  console.log("errors: ", form.formState.errors);

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
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
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isLoading} type="submit" className="w-full">
                Create
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
