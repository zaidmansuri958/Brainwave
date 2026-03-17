"use client";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg p-4 shadow-lg text-white text-sm ${
            toast.variant === "destructive" ? "bg-red-600" : "bg-gray-900"
          }`}
        >
          {toast.title && <p className="font-semibold">{toast.title}</p>}
          {toast.description && <p className="mt-1 opacity-90">{toast.description}</p>}
        </div>
      ))}
    </div>
  );
}
