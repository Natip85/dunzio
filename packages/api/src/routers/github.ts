import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@dunzio/db";
import { connectedRepo, githubConnection, taskLink } from "@dunzio/db/schema/projects";
import { env } from "@dunzio/env/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

// ----------------------------------------------------------------------------
// GitHub API helper types
// ----------------------------------------------------------------------------

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
};

type GitHubWebhook = {
  id: number;
  active: boolean;
};

// ----------------------------------------------------------------------------
// Helper to get user's GitHub token
// ----------------------------------------------------------------------------

async function getGitHubToken(userId: string) {
  const connection = await db.query.githubConnection.findFirst({
    where: eq(githubConnection.userId, userId),
  });

  if (!connection) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "GitHub account not connected. Please connect your GitHub account first.",
    });
  }

  return connection;
}

// ----------------------------------------------------------------------------
// Router
// ----------------------------------------------------------------------------

export const githubRouter = createTRPCRouter({
  /**
   * Get the current user's GitHub connection status.
   */
  getConnection: protectedProcedure.query(async ({ ctx }) => {
    const connection = await ctx.db.query.githubConnection.findFirst({
      where: eq(githubConnection.userId, ctx.session.user.id),
    });

    if (!connection) {
      return { connected: false as const };
    }

    return {
      connected: true as const,
      githubUsername: connection.githubUsername,
      connectedAt: connection.createdAt,
    };
  }),

  /**
   * Disconnect the current user's GitHub account (remove the stored token).
   */
  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.delete(githubConnection).where(eq(githubConnection.userId, ctx.session.user.id));

    return { success: true };
  }),

  /**
   * List the user's GitHub repos (fetched from GitHub API).
   */
  listRepos: protectedProcedure.query(async ({ ctx }) => {
    const connection = await getGitHubToken(ctx.session.user.id);

    const res = await fetch(
      "https://api.github.com/user/repos?per_page=100&sort=updated&type=all",
      {
        headers: {
          Authorization: `Bearer ${connection.accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      // eslint-disable-next-line no-console
      console.error("[GitHub API] Failed to fetch repos:", errorText);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch GitHub repositories",
      });
    }

    const repos = (await res.json()) as GitHubRepo[];

    return repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      isPrivate: repo.private,
      htmlUrl: repo.html_url,
      description: repo.description,
      defaultBranch: repo.default_branch,
    }));
  }),

  /**
   * Connect a GitHub repo to the active organization by creating a webhook.
   */
  connectRepo: protectedProcedure
    .input(
      z.object({
        githubRepoId: z.number(),
        owner: z.string(),
        name: z.string(),
        fullName: z.string(),
        isPrivate: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.session.session.activeOrganizationId;
      if (!orgId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No active organization",
        });
      }

      const connection = await getGitHubToken(ctx.session.user.id);

      // Create the webhook on GitHub
      const webhookRes = await fetch(
        `https://api.github.com/repos/${input.owner}/${input.name}/hooks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: "web",
            active: true,
            events: ["create", "push", "pull_request"],
            config: {
              url: `${env.GITHUB_APP_URL}/api/github/webhook`,
              content_type: "json",
              secret: env.GITHUB_WEBHOOK_SECRET,
            },
          }),
        }
      );

      if (!webhookRes.ok) {
        const errorText = await webhookRes.text();
        // eslint-disable-next-line no-console
        console.error("[GitHub API] Failed to create webhook:", errorText);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to create webhook on GitHub repository. Make sure you have admin access to the repo.",
        });
      }

      const webhook = (await webhookRes.json()) as GitHubWebhook;

      // Save connected repo to DB
      const [repo] = await ctx.db
        .insert(connectedRepo)
        .values({
          organizationId: orgId,
          githubRepoId: input.githubRepoId,
          owner: input.owner,
          name: input.name,
          fullName: input.fullName,
          isPrivate: input.isPrivate,
          webhookId: webhook.id,
          connectedById: ctx.session.user.id,
        })
        .onConflictDoUpdate({
          target: [connectedRepo.organizationId, connectedRepo.githubRepoId],
          set: {
            webhookId: webhook.id,
            connectedById: ctx.session.user.id,
          },
        })
        .returning();

      return repo;
    }),

  /**
   * Disconnect a GitHub repo from the organization (removes webhook + DB row).
   */
  disconnectRepo: protectedProcedure
    .input(z.object({ repoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.session.session.activeOrganizationId;
      if (!orgId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No active organization",
        });
      }

      // Find the connected repo
      const repo = await ctx.db.query.connectedRepo.findFirst({
        where: and(eq(connectedRepo.id, input.repoId), eq(connectedRepo.organizationId, orgId)),
      });

      if (!repo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Connected repository not found",
        });
      }

      // Try to delete the webhook on GitHub (best-effort)
      if (repo.webhookId) {
        try {
          const connection = await getGitHubToken(ctx.session.user.id);

          await fetch(
            `https://api.github.com/repos/${repo.owner}/${repo.name}/hooks/${repo.webhookId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${connection.accessToken}`,
                Accept: "application/json",
              },
            }
          );
        } catch (error) {
          // Best-effort: webhook might already be gone
          // eslint-disable-next-line no-console
          console.warn("[GitHub API] Failed to delete webhook:", error);
        }
      }

      // Remove from DB
      await ctx.db.delete(connectedRepo).where(eq(connectedRepo.id, input.repoId));

      return { success: true };
    }),

  /**
   * List all repos connected to the active organization.
   */
  listConnectedRepos: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.session.session.activeOrganizationId;
    if (!orgId) {
      return [];
    }

    return ctx.db.query.connectedRepo.findMany({
      where: eq(connectedRepo.organizationId, orgId),
      orderBy: (repo, { desc }) => [desc(repo.createdAt)],
    });
  }),

  /**
   * Get all GitHub links (branches, PRs, commits) for a specific issue.
   */
  getTaskLinks: protectedProcedure
    .input(z.object({ issueId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.taskLink.findMany({
        where: eq(taskLink.issueId, input.issueId),
        orderBy: (link, { desc }) => [desc(link.createdAt)],
      });
    }),

  /**
   * Batch fetch GitHub links for multiple issues (useful for kanban board).
   */
  getTaskLinksForBoard: protectedProcedure
    .input(z.object({ issueIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      if (input.issueIds.length === 0) return {};

      const links = await ctx.db.query.taskLink.findMany({
        where: inArray(taskLink.issueId, input.issueIds),
      });

      // Group by issueId
      const grouped: Record<string, typeof links> = {};
      for (const link of links) {
        const arr = (grouped[link.issueId] ??= []);
        arr.push(link);
      }

      return grouped;
    }),
});
