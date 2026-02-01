"use client";

import type { Route } from "next";
import Link from "next/link";
import { Menu, Pen, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { NavUserAvatar } from "./nav-user-avatar";

const navigation = [{ name: "Notes", href: "/notes" }];

export function Header() {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 fixed top-0 right-0 left-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <div className="flex lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[200px] p-3"
            >
              <Link
                href="/"
                className="flex items-center gap-2"
              >
                <div className="bg-foreground flex h-8 w-8 items-center justify-center rounded-lg">
                  <Pen className="text-background h-4 w-4" />
                </div>
                <span className="text-foreground text-xl font-semibold tracking-tight">
                  Quick-Jot
                </span>
              </Link>
              <nav className="mt-6 flex flex-col gap-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href as Route}
                    className="text-foreground hover:text-muted-foreground text-lg font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    href={"/admin" as Route}
                    className="text-foreground hover:text-muted-foreground flex items-center gap-2 text-lg font-medium transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="bg-foreground flex h-8 w-8 items-center justify-center rounded-lg">
            <Pen className="text-background h-4 w-4" />
          </div>
          <span className="text-foreground text-xl font-semibold tracking-tight">Quick-Jot</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex lg:gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href as Route}
              className="text-foreground hover:text-muted-foreground text-sm font-medium transition-colors"
            >
              {item.name}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href={"/admin" as Route}
              className="text-foreground hover:text-muted-foreground flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <NavUserAvatar />
        </div>
      </div>
    </header>
  );
}
