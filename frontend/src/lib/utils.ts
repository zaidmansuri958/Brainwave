import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = "INR"): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case "low": return "text-green-600";
    case "medium": return "text-amber-600";
    case "high": return "text-red-600";
    default: return "text-gray-600";
  }
}

export function getRiskEmoji(risk: string): string {
  switch (risk) {
    case "low": return "🟢";
    case "medium": return "🟡";
    case "high": return "🔴";
    default: return "⚪";
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateWhatsAppLink(courseTitle: string, shortDesc: string, slug: string): string {
  const url = `${process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}/courses/${slug}`;
  const text = `Check out this course: ${courseTitle}\n${shortDesc}\n\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
