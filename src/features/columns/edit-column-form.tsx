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
import { COLOR_OPTIONS } from "./create-column-form";
import { Badge } from "@/components/ui/badge";

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
      color: values.color,
    });

    setOpen(false);
    router.refresh();
  };

  const watchedName = form.watch("name") ?? form.getValues("name");
  const watchedColor = form.watch("color") ?? "primary/20";
  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="bg-primary/20 rounded-md px-3 py-2 text-center font-semibold">
            <Badge
              variant={"outline"}
              style={{ backgroundColor: watchedColor }}
              className={`rounded-full border opacity-50`}
            >
              {watchedName}
            </Badge>
          </div>
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
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => field.onChange(color)}
                        className={`h-8 w-8 rounded-full border-2 ${
                          field.value === color
                            ? "ring-2 ring-black ring-offset-2"
                            : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
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
