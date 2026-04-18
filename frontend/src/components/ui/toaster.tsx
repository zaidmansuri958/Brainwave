"use client";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          aria-live={toast.variant === "destructive" ? "assertive" : "polite"}
          aria-atomic="true"
          className={`pointer-events-auto rounded-lg p-4 shadow-lg text-white text-sm ${
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
