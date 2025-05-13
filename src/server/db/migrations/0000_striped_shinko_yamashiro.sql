CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "dunzio_columns" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#CCCCCC' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "dunzio_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"user_id" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "dunzio_project_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" varchar(500) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "dunzio_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(500) NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "dunzio_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"column_id" integer,
	"task_project_id" integer,
	"user_id" varchar(500) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dunzio_columns" ADD CONSTRAINT "dunzio_columns_project_id_dunzio_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."dunzio_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dunzio_comments" ADD CONSTRAINT "dunzio_comments_task_id_dunzio_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."dunzio_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dunzio_comments" ADD CONSTRAINT "dunzio_comments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dunzio_project_members" ADD CONSTRAINT "dunzio_project_members_project_id_dunzio_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."dunzio_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dunzio_project_members" ADD CONSTRAINT "dunzio_project_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dunzio_projects" ADD CONSTRAINT "dunzio_projects_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dunzio_tasks" ADD CONSTRAINT "dunzio_tasks_column_id_dunzio_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."dunzio_columns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dunzio_tasks" ADD CONSTRAINT "dunzio_tasks_task_project_id_dunzio_projects_id_fk" FOREIGN KEY ("task_project_id") REFERENCES "public"."dunzio_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dunzio_tasks" ADD CONSTRAINT "dunzio_tasks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "column_project_id_idx" ON "dunzio_columns" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "comment_task_id_idx" ON "dunzio_comments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "comment_user_id_idx" ON "dunzio_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_member_unique_idx" ON "dunzio_project_members" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "project_name_idx" ON "dunzio_projects" USING btree ("name");--> statement-breakpoint
CREATE INDEX "project_user_id_idx" ON "dunzio_projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_project_id_idx" ON "dunzio_tasks" USING btree ("task_project_id");--> statement-breakpoint
CREATE INDEX "task_column_id_idx" ON "dunzio_tasks" USING btree ("column_id");