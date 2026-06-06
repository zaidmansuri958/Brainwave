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
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 bg-gray-50">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-lg font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-500">
          {error.message || "An unexpected error occurred. Try again or return home."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-md btn-primary">Try again</button>
          <Link href="/" className="btn btn-md btn-secondary">Go home</Link>
        </div>
      </div>
    </div>
  );
}
