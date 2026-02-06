"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { useTRPC } from "@/trpc";

const editProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

type EditProjectFormValues = z.infer<typeof editProjectSchema>;

type EditProjectDialogProps = {
  project: {
    id: string;
    name: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
    },
  });

  // Reset form when project changes
  useEffect(() => {
    form.reset({
      name: project.name,
    });
  }, [project, form]);

  const updateMutation = useMutation(
    trpc.project.updateProject.mutationOptions({
      onSuccess: () => {
        toast.success("Project renamed");
        void queryClient.invalidateQueries({ queryKey: [["project"]] });
        onOpenChange(false);
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to rename project");
      },
    })
  );

  const onSubmit = (values: EditProjectFormValues) => {
    updateMutation.mutate({
      projectId: project.id,
      name: values.name.trim(),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>Update the project name.</DialogDescription>
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
