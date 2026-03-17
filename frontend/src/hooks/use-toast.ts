import { useState, useCallback } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastCount = 0;

const listeners: ((toasts: Toast[]) => void)[] = [];
let memoryToasts: Toast[] = [];

function addToast(toast: Omit<Toast, "id">) {
  const id = String(++toastCount);
  const newToast = { ...toast, id };
  memoryToasts = [newToast, ...memoryToasts].slice(0, 5);
  listeners.forEach((l) => l([...memoryToasts]));

  setTimeout(() => {
    memoryToasts = memoryToasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l([...memoryToasts]));
  }, 4000);
}

export function toast(props: Omit<Toast, "id">) {
  addToast(props);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(memoryToasts);

  if (!listeners.includes(setToasts)) {
    listeners.push(setToasts);
  }

  return { toasts, toast };
}
