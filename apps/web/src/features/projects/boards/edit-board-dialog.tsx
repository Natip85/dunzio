"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useTRPC } from "@/trpc";

const editBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
});

type EditBoardFormValues = z.infer<typeof editBoardSchema>;

type EditBoardDialogProps = {
  board: {
    id: string;
    name: string;
    description?: string | null;
    projectId: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditBoardDialog({ board, open, onOpenChange }: EditBoardDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<EditBoardFormValues>({
    resolver: zodResolver(editBoardSchema),
    defaultValues: {
      name: board.name,
      description: board.description ?? "",
    },
  });

  // Reset form when board changes
  useEffect(() => {
    form.reset({
      name: board.name,
      description: board.description ?? "",
    });
  }, [board, form]);

  const updateMutation = useMutation(
    trpc.project.updateBoard.mutationOptions({
      onSuccess: () => {
        toast.success("Board updated");
        void queryClient.invalidateQueries({
          queryKey: trpc.project.listBoards.queryKey({ projectId: board.projectId }),
        });
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update board");
      },
    })
  );

  const onSubmit = (values: EditBoardFormValues) => {
    updateMutation.mutate({
      boardId: board.id,
      name: values.name.trim(),
      description: values.description?.trim() ?? undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Board</DialogTitle>
          <DialogDescription>Update the board name and description.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      {...field}
                    />
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
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What is this board for?"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
