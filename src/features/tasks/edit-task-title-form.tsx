"use client";
"use no memo";

import { SheetTitle } from "@/components/ui/sheet";
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
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
interface Props {
  task: TaskSelect;
}
export default function EditTaskTitleForm({ task }: Props) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const { mutateAsync: editTitle, isPending: isLoading } =
    api.task.editTitle.useMutation();

  const form = useForm<TaskSelect>({
    resolver: zodResolver(taskSelectSchema),
    defaultValues: task,
  });

  const onSubmit = async (values: TaskSelect) => {
    await editTitle(values);
    router.refresh();
    setEdit(false);
  };
  console.log("errors: ", form.formState.errors);
  return (
    <SheetTitle className="flex justify-between gap-2 pr-20">
      {edit ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full items-center justify-between gap-3"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2">
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
      ) : (
        <div className="flex w-full justify-between">
          <div>
            <span className="text-4xl">
              {task.title} #{task.id}{" "}
            </span>
          </div>
          <div>
            <Button onClick={() => setEdit(true)} variant={"outline"}>
              Edit
            </Button>
          </div>
        </div>
      )}
    </SheetTitle>
  );
}
