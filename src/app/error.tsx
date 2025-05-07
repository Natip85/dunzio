"use client"; // Error boundaries must be Client Components

import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    // Log the error to an error reporting service
    console.log({ error });
    if (error.message === "UNAUTHORIZED") {
      // TODO add local storage redirect page
      redirect("/");
    }
    if (error.message === "FORBIDDEN") {
      router.back();
    }
  }, [error, router]);

  return (
    <div className="col flex min-h-screen items-center justify-center">
      <h2>Something went wrong!</h2>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
