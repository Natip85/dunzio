import { buttonVariants } from "@/components/ui/button";
import AuthForm from "@/features/auth/auth-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex-1 space-y-10 p-2 md:p-5">
      <div>
        <Link
          href={"/"}
          className={`flex w-fit justify-start ${buttonVariants({ variant: "ghost" })}`}
        >
          <ArrowLeft />
        </Link>
      </div>
      <AuthForm />
    </div>
  );
}
