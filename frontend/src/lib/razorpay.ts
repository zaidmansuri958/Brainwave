/** Load Razorpay checkout script once. */
export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export function openRazorpayCheckout(opts: {
  key: string;
  amountPaise: number;
  currency: string;
  orderId: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string };
  onSuccess: (r: RazorpayHandlerResponse) => void;
  onFailure?: (err: unknown) => void;
  onDismiss?: () => void;
}): void {
  const w = window as unknown as {
    Razorpay: new (o: Record<string, unknown>) => { open: () => void; on: (e: string, fn: (a?: unknown) => void) => void };
  };
  const Rzp = w.Razorpay;
  const options: Record<string, unknown> = {
    key: opts.key,
    amount: opts.amountPaise,
    currency: opts.currency || "INR",
    name: opts.name || "Brainwave.ai",
    description: opts.description || "",
    order_id: opts.orderId,
    prefill: opts.prefill || {},
    theme: { color: "#4F46E5" },
    modal: { ondismiss: opts.onDismiss },
    handler: (response: RazorpayHandlerResponse) => opts.onSuccess(response),
  };
  const rzp = new Rzp(options);
  rzp.on("payment.failed", (resp?: unknown) => opts.onFailure?.(resp));
  rzp.open();
}
