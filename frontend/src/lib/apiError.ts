import axios from "axios";

/** Normalize FastAPI / axios error bodies for user-facing messages. */
export function getApiErrorMessage(e: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(e)) {
    const d = e.response?.data?.detail as unknown;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) {
      const parts = d.map((x: { msg?: string }) => x.msg).filter(Boolean);
      if (parts.length) return parts.join(" ");
    }
  }
  if (e && typeof e === "object" && "message" in e) {
    const m = (e as { message?: string }).message;
    if (typeof m === "string" && m && !m.startsWith("Request failed")) return m;
  }
  return fallback;
}

/** Razorpay `payment.failed` event payload — best-effort description. */
export function getRazorpayFailureMessage(resp: unknown): string {
  if (resp && typeof resp === "object" && "error" in resp) {
    const err = (resp as { error?: { description?: string; reason?: string; code?: string } }).error;
    if (err?.description) return err.description;
    if (err?.reason) return err.reason;
    if (err?.code) return `Error code: ${err.code}`;
  }
  return "The payment could not be completed. Try again or use another method.";
}
