"use client";

import type { Route } from "next";
import Link from "next/link";
import { CheckCircleIcon } from "lucide-react";

import { NavUserAvatar } from "./nav-user-avatar";

const navigation = [{ name: "", href: "#" }];

export function Header() {
  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 right-0 left-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="ml-8 flex items-center gap-2 md:ml-0"
        >
          <div className="bg-foreground flex h-8 w-8 items-center justify-center rounded-lg">
            <CheckCircleIcon className="text-background h-4 w-4" />
          </div>
          <span className="text-foreground text-xl font-semibold tracking-tight">Dunzio</span>
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
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <NavUserAvatar />
        </div>
      </div>
    </header>
  );
}
