CREATE TYPE "public"."task_link_type" AS ENUM('branch', 'pr', 'commit');--> statement-breakpoint
CREATE TABLE "connected_repo" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"github_repo_id" integer NOT NULL,
	"owner" text NOT NULL,
	"name" text NOT NULL,
	"full_name" text NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"webhook_id" integer,
	"connected_by_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_connection" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"github_user_id" text NOT NULL,
	"github_username" text NOT NULL,
	"access_token" text NOT NULL,
	"scope" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_link" (
	"id" text PRIMARY KEY NOT NULL,
	"issue_id" text NOT NULL,
	"type" "task_link_type" NOT NULL,
	"title" text,
	"url" text NOT NULL,
	"ref" text NOT NULL,
	"state" text,
	"github_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "connected_repo" ADD CONSTRAINT "connected_repo_connected_by_id_user_id_fk" FOREIGN KEY ("connected_by_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_connection" ADD CONSTRAINT "github_connection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_link" ADD CONSTRAINT "task_link_issue_id_issue_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "connected_repo_org_id_idx" ON "connected_repo" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "connected_repo_org_repo_unique_idx" ON "connected_repo" USING btree ("organization_id","github_repo_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_connection_user_id_unique_idx" ON "github_connection" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_link_issue_id_idx" ON "task_link" USING btree ("issue_id");--> statement-breakpoint
CREATE UNIQUE INDEX "task_link_unique_idx" ON "task_link" USING btree ("issue_id","type","github_id");