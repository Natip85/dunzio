import crypto from "node:crypto";
import { inArray } from "drizzle-orm";

import { db } from "@dunzio/db";
import { issue, taskLink } from "@dunzio/db/schema/projects";
import { env } from "@dunzio/env/server";

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", env.GITHUB_WEBHOOK_SECRET).update(body).digest("hex");

  return `sha256=${hmac}` === signature;
}

/**
 * Extract all task keys (e.g. "PROJ-123") from a string.
 * Returns deduplicated matches.
 */
function extractTaskKeys(text: string): string[] {
  const matches = text.match(/[A-Z]+-\d+/g);
  return [...new Set(matches ?? [])];
}

/**
 * Look up issues by their keys and return a map of key -> issue.
 */
async function findIssuesByKeys(keys: string[]) {
  if (keys.length === 0) return new Map<string, { id: string; key: string }>();

  const issues = await db
    .select({ id: issue.id, key: issue.key })
    .from(issue)
    .where(inArray(issue.key, keys));

  return new Map(issues.map((i) => [i.key, i]));
}

// ----------------------------------------------------------------------------
// Webhook event handlers
// ----------------------------------------------------------------------------

async function handleBranchCreated(payload: {
  ref: string;
  ref_type: string;
  repository: { full_name: string; html_url: string };
}) {
  if (payload.ref_type !== "branch") return;

  const keys = extractTaskKeys(payload.ref);
  const issueMap = await findIssuesByKeys(keys);

  for (const key of keys) {
    const foundIssue = issueMap.get(key);
    if (!foundIssue) continue;

    await db
      .insert(taskLink)
      .values({
        issueId: foundIssue.id,
        type: "branch",
        title: payload.ref,
        url: `${payload.repository.html_url}/tree/${payload.ref}`,
        ref: payload.ref,
        githubId: `branch:${payload.repository.full_name}:${payload.ref}`,
      })
      .onConflictDoNothing();
  }
}

async function handlePullRequest(payload: {
  action: string;
  pull_request: {
    id: number;
    number: number;
    title: string;
    html_url: string;
    state: string;
    merged: boolean;
    head: { ref: string };
  };
}) {
  const actions = ["opened", "closed", "reopened", "edited"];
  if (!actions.includes(payload.action)) return;

  const pr = payload.pull_request;
  // Extract task keys from both branch name and PR title
  const keys = extractTaskKeys(`${pr.head.ref} ${pr.title}`);
  const issueMap = await findIssuesByKeys(keys);

  const state = pr.merged ? "merged" : pr.state; // "open" | "closed" | "merged"

  for (const key of keys) {
    const foundIssue = issueMap.get(key);
    if (!foundIssue) continue;

    await db
      .insert(taskLink)
      .values({
        issueId: foundIssue.id,
        type: "pr",
        title: pr.title,
        url: pr.html_url,
        ref: String(pr.number),
        state,
        githubId: String(pr.id),
      })
      .onConflictDoUpdate({
        target: [taskLink.issueId, taskLink.type, taskLink.githubId],
        set: {
          title: pr.title,
          state,
          url: pr.html_url,
        },
      });
  }
}

async function handlePush(payload: {
  repository: { html_url: string };
  commits: {
    id: string;
    message: string;
    url: string;
  }[];
}) {
  if (!payload.commits) return;

  for (const commit of payload.commits) {
    const keys = extractTaskKeys(commit.message);
    const issueMap = await findIssuesByKeys(keys);

    for (const key of keys) {
      const foundIssue = issueMap.get(key);
      if (!foundIssue) continue;

      await db
        .insert(taskLink)
        .values({
          issueId: foundIssue.id,
          type: "commit",
          title: commit.message.split("\n")[0]?.slice(0, 200), // First line, truncated
          url: commit.url,
          ref: commit.id,
          githubId: commit.id,
        })
        .onConflictDoNothing();
    }
  }
}

// ----------------------------------------------------------------------------
// Route handler
// ----------------------------------------------------------------------------

/**
 * POST /api/github/webhook
 *
 * Receives GitHub webhook events, verifies the signature, and links
 * branches/PRs/commits to tasks based on task key extraction.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  // 1. Verify webhook signature
  if (!verifySignature(body, signature)) {
    // eslint-disable-next-line no-console
    console.error("[GitHub Webhook] Invalid signature");
    return new Response("Invalid signature", { status: 401 });
  }

  const event = req.headers.get("x-github-event");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const payload = JSON.parse(body);

  try {
    switch (event) {
      case "create":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await handleBranchCreated(payload);
        break;
      case "pull_request":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await handlePullRequest(payload);
        break;
      case "push":
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await handlePush(payload);
        break;
      case "ping":
        // GitHub sends a ping event when a webhook is first created
        // eslint-disable-next-line no-console
        console.log("[GitHub Webhook] Ping received");
        break;
      default:
        // eslint-disable-next-line no-console
        console.log(`[GitHub Webhook] Unhandled event: ${event}`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[GitHub Webhook] Error processing event:", error);
    // Return 200 to prevent GitHub from retrying — we log the error instead
    return new Response("OK", { status: 200 });
  }
}
