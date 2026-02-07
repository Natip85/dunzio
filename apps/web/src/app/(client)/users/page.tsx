import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@dunzio/auth";

import { PageTitle } from "@/components/page-title";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateUserDialog } from "@/features/user/create-user-dialog";
import { UserRow } from "@/features/user/user-row";

export default async function UsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session == null) return redirect("/auth/sign-in");

  const users = await auth.api.listUsers({
    headers: await headers(),
    query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
  });
  return (
    <div className="flex flex-1 flex-col gap-6 py-6 pr-4.5 pl-6">
      <PageTitle title="Users">
        <CreateUserDialog />
      </PageTitle>{" "}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                selfId={session.user.id}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
