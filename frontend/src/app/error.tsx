"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bw-page flex min-h-[70vh] flex-col items-center justify-center px-6 py-16">
      <div className="neo-panel max-w-xl p-8 text-center">
      <h1 className="font-display text-xl font-bold uppercase text-gray-900 text-center">Something went wrong</h1>
      <p className="mt-2 max-w-md text-center text-sm text-gray-600">
        {error.message || "An unexpected error occurred. You can try again or return home."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="neo-primary-btn px-5 py-2.5 text-sm"
        >
          Try again
        </button>
        <Link
          href="/"
          className="neo-secondary-btn px-5 py-2.5 text-sm"
        >
          Home
        </Link>
      </div>
      </div>
    </div>
  );
}
