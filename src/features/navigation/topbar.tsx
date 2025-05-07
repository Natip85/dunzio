"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import UserAccountMenu from "./user-account-menu";
import SideMenuLinks from "./side-menu-links";

export default function Topbar() {
  const router = useRouter();
  const session = authClient.useSession().data;
  const pathname = usePathname();
  return (
    <nav className="bg-background z-50 shadow-sm">
      <div className="mx-auto w-full px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            {session && <SideMenuLinks />}
            <div>
              <Link href={"/"} className={buttonVariants({ variant: "ghost" })}>
                <MountainIcon className="size-6" />
              </Link>
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {pathname === "/"
                  ? "Home"
                  : pathname.replace("/", "").replace(/-/g, " ").toUpperCase()}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!session ? (
              <>
                <Button
                  onClick={() => router.push("/auth")}
                  variant="outline"
                  size="sm"
                >
                  Sign in
                </Button>
                <Button onClick={() => router.push("/auth")} size="sm">
                  Sign up
                </Button>
              </>
            ) : (
              <UserAccountMenu user={session.user} />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}
function MountainIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
