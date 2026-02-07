"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  MoreHorizontal,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null | undefined;
  createdAt: Date;
  metadata?: unknown;
};

type OrganizationRowProps = {
  organization: Organization;
  activeOrgId?: string | null;
  memberCount?: number;
};

export function OrganizationRow({ organization, activeOrgId, memberCount }: OrganizationRowProps) {
  const router = useRouter();
  const isActive = activeOrgId === organization.id;

  async function handleSetActive() {
    const res = await authClient.organization.setActive({ organizationId: organization.id });

    if (res.error) {
      toast.error(res.error.message ?? "Failed to switch organization");
    } else {
      toast.success(`Switched to ${organization.name}`);
      router.refresh();
    }
  }

  async function handleDelete() {
    const res = await authClient.organization.delete({ organizationId: organization.id });
    if (res.error) {
      toast.error(res.error.message ?? "Failed to delete organization");
    } else {
      toast.success("Organization deleted");
      router.refresh();
    }
  }

  return (
    <TableRow className="group">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar size="default">
            {organization.logo ?
              <AvatarImage
                src={organization.logo}
                alt={organization.name}
              />
            : null}
            <AvatarFallback>
              <Building2 className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{organization.name}</span>
            <span className="text-muted-foreground text-xs">/{organization.slug}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {isActive ?
          <Badge variant="default">Active</Badge>
        : <Badge variant="outline">Inactive</Badge>}
      </TableCell>
      <TableCell>
        {memberCount !== undefined ?
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <Users className="size-3.5" />
            <span>{memberCount}</span>
          </div>
        : <span className="text-muted-foreground text-sm">—</span>}
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground text-sm">
          {new Date(organization.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link href={`/organizations/${organization.id}`}>
              <Settings className="mr-1.5 size-3.5" />
              Manage
              <ChevronRight className="ml-1 size-3.5" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isActive && (
                <DropdownMenuItem onClick={handleSetActive}>
                  <CheckCircle2 className="mr-2 size-4" />
                  Set as Active
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete Organization
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete <strong>{organization.name}</strong>? This
                      action cannot be undone and will remove all members and data associated with
                      this organization.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
