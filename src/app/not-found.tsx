import Link from "next/link";
// import NotFoundSVG from "@/assets/images/not-found.svg";

export default function NotFound() {
  return (
    <div className="bg-background grid h-screen place-content-center px-4">
      <div className="text-center">
        {/* <NotFoundSVG /> */}

        <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-4xl">
          Uh-oh!
        </h1>

        <p className="text-muted-foreground mt-4">
          We can&apos;t find that page.
        </p>
        <Link href="/">Go back to site</Link>
      </div>
    </div>
  );
}
