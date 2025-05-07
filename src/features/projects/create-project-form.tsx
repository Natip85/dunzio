"use client";
"use no memo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { projectSelectSchema, type ProjectSelect } from "./project-types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function CreateProjectForm() {
  const user = authClient.useSession().data?.user;
  const router = useRouter();
  const { mutateAsync: create, isPending: isLoading } =
    api.project.create.useMutation();

  const form = useForm<ProjectSelect>({
    resolver: zodResolver(projectSelectSchema),
    defaultValues: {
      id: 0,
      userId: user?.id,
      name: "Untitled project",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  async function onSubmit(values: ProjectSelect) {
    const res = await create(values);
    router.push(`/projects/${res}`);
  }
  console.log("ERRORS: ", form.formState.errors);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex-1 space-y-5 py-4">
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name..." type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="relative size-96 w-full">
            <Image src={""} alt="'img" fill />
          </div>
          <div className="flex items-center justify-end border-t pt-5">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 text-white hover:bg-green-700 hover:text-white"
            >
              Create project
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
