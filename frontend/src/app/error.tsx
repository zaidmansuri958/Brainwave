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
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAFAF9] px-6 py-16">
      <h1 className="font-display text-xl font-bold text-gray-900 text-center">Something went wrong</h1>
      <p className="text-gray-600 text-sm mt-2 text-center max-w-md">
        {error.message || "An unexpected error occurred. You can try again or return home."}
      </p>
      <div className="flex flex-wrap gap-3 justify-center mt-8">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-sm font-semibold shadow-button-indigo hover:bg-indigo-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
