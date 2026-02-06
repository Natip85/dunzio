"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <section className="px-6 pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mb-6 font-serif text-5xl leading-[1.1] font-medium tracking-tight text-balance md:text-7xl lg:text-8xl">
            Track your projects
            <br />
            <span className="italic">effortlessly</span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-pretty md:text-xl">
            A modern project management tool built for teams. Plan sprints, track issues, and ship
            faster with a clean, intuitive interface.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-12 px-8 text-base"
              asChild
            >
              <Link href="/projects">
                Try Dunzio for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="text-muted-foreground mt-6 text-sm">
            Free forever. No credit card required.
          </p>
        </div>
      </section>
    </div>
  );
}
