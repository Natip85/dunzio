"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Header } from "@/features/nav/header";

export default function Home() {
  return (
    <div>
      <Header />
      <section className="px-6 pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="mb-6 font-serif text-5xl leading-[1.1] font-medium tracking-tight text-balance md:text-7xl lg:text-8xl">
            Capture your thoughts
            <br />
            <span className="italic">beautifully</span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-pretty md:text-xl">
            A minimalist note-taking experience designed for clarity. Write, organize, and find your
            ideas effortlessly across all your devices.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-12 px-8 text-base"
              asChild
            >
              <Link href="/notes">
                Try Quick Jot for free
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
