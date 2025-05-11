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
import {
  type ColumnCreateSelect,
  columnCreateSelectSchema,
} from "./column-types";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
export const COLOR_OPTIONS = [
  "primary/20",
  "red-300",
  "orange-300",
  "yellow-300",
  "green-300",
  "sky-300",
  "purple-300",
  "pink-300",
];
interface Props {
  projectId: number | undefined;
}
export default function CreateColumnForm({ projectId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutateAsync: create, isPending: isLoading } =
    api.column.create.useMutation();

  const form = useForm<ColumnCreateSelect>({
    resolver: zodResolver(columnCreateSelectSchema),
    defaultValues: { description: "" },
  });

  const onSubmit = async (values: ColumnCreateSelect) => {
    await create({ ...values, projectId });
    setOpen(false);
    router.refresh();
  };

  const watchedName = form.watch("name") ?? form.getValues("name");
  const watchedColor = form.watch("color") ?? "primary/20";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96 p-4">
        <DialogHeader>
          <DialogTitle className="text-start">New column</DialogTitle>
          <Separator />
        </DialogHeader>
        <div className="w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="bg-primary/20 rounded-md px-3 py-2 text-center font-semibold">
                <Badge
                  variant={"outline"}
                  className={`rounded-full border-${watchedColor} bg-${watchedColor} border opacity-50`}
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
                            className={`bg-${color} h-8 w-8 rounded-full border-2 ${
                              field.value === color
                                ? "ring-2 ring-black ring-offset-2"
                                : ""
                            }`}
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
                  Create
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
