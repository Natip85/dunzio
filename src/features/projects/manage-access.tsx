"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function ManageAccess() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl tracking-tight">Who has access</h2>
        <p className="text-muted-foreground">
          Control who has access to your project and what permissions they have.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="grid gap-2">
          <h3 className="text-lg font-medium">Team Members</h3>
          <div className="rounded-md border">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-muted h-10 w-10 rounded-full"></div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-muted-foreground text-sm">
                      john@example.com
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Admin</p>
                </div>
              </div>
            </div>
            <Separator />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-muted h-10 w-10 rounded-full"></div>
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-muted-foreground text-sm">
                      jane@example.com
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Editor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <h3 className="text-lg font-medium">Invite New Members</h3>
          <div className="flex gap-2">
            <Input className="flex-1" placeholder="Email address" />
            <Button>Invite</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
