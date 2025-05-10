"use client";
"use no memo";

import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  columnCreateSelectSchema,
  type ColumnCreateSelect,
  type ColumnSelect,
} from "./column-types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  column: ColumnSelect;
  setOpen: (val: boolean) => void;
}

export default function EditColumnForm({ column, setOpen }: Props) {
  const router = useRouter();

  const { mutateAsync: edit, isPending: isLoading } =
    api.column.edit.useMutation();

  const form = useForm<ColumnCreateSelect>({
    resolver: zodResolver(columnCreateSelectSchema),
    defaultValues: { ...column, projectId: column.projectId },
  });

  const onSubmit = async (values: ColumnCreateSelect) => {
    await edit({
      id: column.id,
      name: values.name,
      description: values.description,
    });

    setOpen(false);
    router.refresh();
  };

  //   if (!column?.projectId) return null;
  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
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
          <div>
            <Button disabled={isLoading} type="submit" className="w-full">
              Update
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
