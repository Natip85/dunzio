ALTER TABLE "dunzio_tasks" DROP CONSTRAINT "dunzio_tasks_task_project_id_dunzio_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "dunzio_tasks" ADD CONSTRAINT "dunzio_tasks_task_project_id_dunzio_projects_id_fk" FOREIGN KEY ("task_project_id") REFERENCES "public"."dunzio_projects"("id") ON DELETE cascade ON UPDATE no action;