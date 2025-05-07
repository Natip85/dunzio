"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogOutIcon, User2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
interface Props {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null;
  };
}
export default function UserAccountMenu({ user }: Props) {
  const router = useRouter();
  return (
    <Sheet>
      <SheetTrigger className="cursor-pointer">
        <Avatar>
          {user?.image && (
            <AvatarImage src={user.image} alt={`${user.name} avatar`} />
          )}
          <AvatarFallback>
            <User2 className="stroke-black" />
          </AvatarFallback>
        </Avatar>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <Avatar>
              {user?.image && (
                <AvatarImage src={user.image} alt={`${user.name} avatar`} />
              )}
              <AvatarFallback>
                <User2 className="stroke-black" />
              </AvatarFallback>
            </Avatar>
            <span>{user.name || "User"}</span>
          </SheetTitle>
        </SheetHeader>
        <div>
          <Separator />
          <Button
            variant={"ghost"}
            onClick={async () =>
              await authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/auth");
                  },
                },
              })
            }
            className="flex w-full cursor-pointer justify-start"
          >
            <LogOutIcon /> Sign out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
