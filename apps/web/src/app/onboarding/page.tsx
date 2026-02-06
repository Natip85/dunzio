"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc";

type OnboardingStep = "loading" | "organization" | "project" | "columns" | "complete";

const columnCategorySchema = z.enum(["todo", "in_progress", "done"]);

// Schema for organization step
const organizationFormSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Organization name is too long"),
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

// Schema for project step
const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name is too long"),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

// Schema for columns step
const columnSchema = z.object({
  name: z.string().min(1, "Column name is required").max(50, "Column name is too long"),
  category: columnCategorySchema,
});

const columnsFormSchema = z.object({
  columns: z
    .array(columnSchema)
    .min(1, "At least one column is required")
    .max(20, "Maximum 20 columns allowed"),
});

type ColumnsFormValues = z.infer<typeof columnsFormSchema>;

const DEFAULT_COLUMNS: ColumnsFormValues["columns"] = [
  { name: "To Do", category: "todo" },
  { name: "In Progress", category: "in_progress" },
  { name: "In Review", category: "in_progress" },
  { name: "Done", category: "done" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const trpc = useTRPC();

  const {
    data: statusData,
    isLoading,
    refetch,
  } = useQuery(trpc.onboarding.getStatus.queryOptions());

  const boardId = statusData?.board?.id;

  // If user has an org but it's not set as active, activate it
  useEffect(() => {
    const activateOrg = async () => {
      if (statusData?.organizationNeedsActivation && statusData.organization?.id) {
        try {
          await authClient.organization.setActive({
            organizationId: statusData.organization.id,
          });
          // Refetch to get updated session state
          await refetch();
        } catch {
          // Silently fail - will retry on next render
        }
      }
    };
    void activateOrg();
  }, [statusData?.organizationNeedsActivation, statusData?.organization?.id, refetch]);

  // Determine current step (wait for activation to complete)
  const step = statusData?.step;
  const isValidStep =
    step === "organization" || step === "project" || step === "columns" || step === "complete";
  let currentStep: OnboardingStep = "organization";
  if (isLoading || statusData?.organizationNeedsActivation) {
    currentStep = "loading";
  } else if (isValidStep) {
    currentStep = step;
  }

  // Redirect when onboarding is complete
  useEffect(() => {
    if (currentStep === "complete") {
      // If user has multiple organizations with completed onboarding,
      // redirect to workspace selection so they can choose
      if (
        statusData?.totalOrganizations &&
        statusData.totalOrganizations > 1 &&
        statusData.completedOrganizations &&
        statusData.completedOrganizations > 1
      ) {
        router.replace("/select-workspace");
      } else if (statusData?.project?.id) {
        // Single org or first time setup - go directly to project
        router.replace(`/projects/${statusData.project.id}`);
      }
    }
  }, [
    currentStep,
    statusData?.project?.id,
    statusData?.totalOrganizations,
    statusData?.completedOrganizations,
    router,
  ]);

  const organizationForm = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: { name: "" },
  });

  const projectForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: { name: "" },
  });

  const columnsForm = useForm<ColumnsFormValues>({
    resolver: zodResolver(columnsFormSchema),
    defaultValues: { columns: DEFAULT_COLUMNS },
  });

  const { fields, append, remove } = useFieldArray({
    control: columnsForm.control,
    name: "columns",
  });

  // Sync columns from server when we have existing data
  useEffect(() => {
    if (statusData?.columns && statusData.columns.length > 0) {
      columnsForm.reset({
        columns: statusData.columns.map((col) => ({
          name: col.name,
          category: col.category as "todo" | "in_progress" | "done",
        })),
      });
    }
  }, [statusData?.columns, columnsForm]);

  // Sync project name from server
  useEffect(() => {
    if (statusData?.project?.name) {
      projectForm.reset({ name: statusData.project.name });
    }
  }, [statusData?.project?.name, projectForm]);

  // Step 2: Create project
  const createProjectMutation = useMutation(
    trpc.onboarding.createProject.mutationOptions({
      onSuccess: () => {
        toast.success("Project created!");
        void refetch();
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Failed to create project";
        toast.error(message);
      },
    })
  );

  // Step 3: Update columns
  const updateColumnsMutation = useMutation(
    trpc.onboarding.updateColumns.mutationOptions({
      onSuccess: () => {
        toast.success("Board columns saved!");
        // Navigate to the project
        if (statusData?.project?.id) {
          router.push(`/projects/${statusData.project.id}`);
        }
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Failed to update columns";
        toast.error(message);
      },
    })
  );

  // Step 1: Create organization
  const handleCreateOrganization = async (values: OrganizationFormValues) => {
    const name = values.name.trim();
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    try {
      const result = await authClient.organization.create({ name, slug });

      if (result.error) {
        throw new Error(result.error.message ?? "Failed to create organization");
      }

      const setActiveResult = await authClient.organization.setActive({
        organizationId: result.data.id,
      });

      if (setActiveResult.error) {
        throw new Error(setActiveResult.error.message ?? "Failed to set active organization");
      }

      toast.success("Workspace created!");
      // Refetch status to move to next step
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create organization");
    }
  };

  // Step 2: Create project
  const handleCreateProject = (values: ProjectFormValues) => {
    createProjectMutation.mutate({ name: values.name.trim() });
  };

  // Step 3: Save columns and complete
  const handleSaveColumns = (values: ColumnsFormValues) => {
    if (!boardId) {
      toast.error("Board not found");
      return;
    }

    updateColumnsMutation.mutate({
      boardId,
      columns: values.columns.map((col) => ({
        name: col.name.trim(),
        category: col.category,
      })),
    });
  };

  // Add a new column
  const addColumn = () => {
    append({ name: "", category: "todo" });
  };

  const isCreatingOrg = organizationForm.formState.isSubmitting;
  const isCreatingProject = createProjectMutation.isPending;
  const isSavingColumns = updateColumnsMutation.isPending;
  const columnsValue = columnsForm.watch("columns");
  const hasInvalidColumns = columnsValue.some((c) => !c.name.trim());

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {/* Initial Loading */}
        {currentStep === "loading" && (
          <motion.div
            key="initial-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <Card className="w-full max-w-md">
              <CardContent className="flex flex-col items-center gap-6 py-12">
                <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
                <p className="text-muted-foreground text-sm">Loading...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 1: Organization */}
        {currentStep === "organization" && (
          <motion.div
            key="organization"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create your workspace</CardTitle>
                <CardDescription>
                  Workspaces are where your teams organize projects and collaborate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...organizationForm}>
                  <form
                    onSubmit={organizationForm.handleSubmit(handleCreateOrganization)}
                    className="space-y-4"
                  >
                    <FormField
                      control={organizationForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workspace name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Acme Inc."
                              disabled={isCreatingOrg}
                              autoFocus
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            You can always change this later in settings.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isCreatingOrg}
                    >
                      {isCreatingOrg ? "Creating..." : "Continue"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Project Name */}
        {currentStep === "project" && (
          <motion.div
            key="project"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full max-w-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Name your first project</CardTitle>
                <CardDescription>
                  Projects help your team track progress, stay organized, and manage tasks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...projectForm}>
                  <form
                    onSubmit={projectForm.handleSubmit(handleCreateProject)}
                    className="space-y-4"
                  >
                    <FormField
                      control={projectForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="My Kanban Project"
                              disabled={isCreatingProject}
                              autoFocus
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Example project names: Team Astro, Visual upgrade, Bug tracking, Product
                            launch
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isCreatingProject}
                    >
                      {isCreatingProject ? "Creating..." : "Create project"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Columns */}
        {currentStep === "columns" && (
          <motion.div
            key="columns"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full max-w-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Set up your board columns</CardTitle>
                <CardDescription>
                  Name your columns and set their type. Column type helps track whether work is
                  waiting, active, or finished.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...columnsForm}>
                  <form
                    onSubmit={columnsForm.handleSubmit(handleSaveColumns)}
                    className="space-y-4"
                  >
                    {/* Column headers */}
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-muted-foreground flex-1 text-xs font-medium">
                        Column name
                      </span>
                      <span className="text-muted-foreground w-[120px] text-xs font-medium">
                        Column type
                      </span>
                      <div className="w-8" /> {/* Spacer for delete button */}
                    </div>

                    <div className="space-y-2">
                      {fields.map((field, index) => (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-start gap-2"
                        >
                          <FormField
                            control={columnsForm.control}
                            name={`columns.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder="e.g. Backlog, In Review, QA..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={columnsForm.control}
                            name={`columns.${index}.category`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue placeholder="Stage" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="todo">Waiting</SelectItem>
                                    <SelectItem value="in_progress">Active</SelectItem>
                                    <SelectItem value="done">Finished</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 1}
                            className="text-muted-foreground hover:text-destructive mt-1"
                          >
                            <X className="size-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={addColumn}
                    >
                      <Plus className="mr-2 size-4" />
                      Add status
                    </Button>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSavingColumns || fields.length === 0 || hasInvalidColumns}
                    >
                      {isSavingColumns ? "Saving..." : "Finish"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
