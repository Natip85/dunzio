import { GithubIcon } from "lucide-react";

import { PageTitle } from "@/components/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GitHubConnectButton } from "@/features/github/github-connect-button";
import { ConnectedRepoList, RepoSelector } from "@/features/github/repo-list";

export default function IntegrationsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 py-6 pr-4.5 pl-6">
      <PageTitle
        title="Integrations"
        subTitle="Connect third-party services to your organization"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-muted flex size-9 items-center justify-center rounded-md">
              <GithubIcon className="size-5" />
            </div>
            <div>
              <CardTitle>GitHub</CardTitle>
              <CardDescription>
                Connect repositories to automatically link branches, pull requests, and commits to
                tasks.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {/* Connection Status */}
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">Account</h4>
            <GitHubConnectButton />
          </div>

          <Separator />

          {/* Connected Repos */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium">Connected Repositories</h4>
            <p className="text-muted-foreground text-xs">
              Webhooks will be created on connected repositories to track branches, pull requests,
              and commits. Include a task key (e.g. PROJ-123) in your branch name, PR title, or
              commit message to link it automatically.
            </p>
            <ConnectedRepoList />
          </div>

          <Separator />

          {/* Add Repo */}
          <RepoSelector />
        </CardContent>
      </Card>
    </div>
  );
}
