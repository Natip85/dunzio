import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon, MountainIcon, WorkflowIcon } from "lucide-react";
import Link from "next/link";

export default function SideMenuLinks() {
  return (
    <Sheet>
      <SheetTrigger asChild className="cursor-pointer">
        <Button variant={"ghost"} size={"sm"}>
          <MenuIcon className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>
            <Avatar>
              <AvatarFallback>
                <MountainIcon className="size-6" />
              </AvatarFallback>
            </Avatar>
          </SheetTitle>
        </SheetHeader>
        <div>
          <Separator />
          <SheetClose asChild>
            <Link
              href={"/projects"}
              className={`flex w-full items-center justify-start gap-3 ${buttonVariants({ variant: "ghost" })}`}
            >
              <WorkflowIcon /> Projects
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
