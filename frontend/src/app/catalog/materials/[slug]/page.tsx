"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { materialsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { loadRazorpay, openRazorpayCheckout } from "@/lib/razorpay";
import { ArrowRight, CheckCircle2, Loader2, Lock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage, getRazorpayFailureMessage } from "@/lib/apiError";
import {
  LightStudioLayout,
  StudioBackLink,
  studioBtnPrimary,
  studioBtnSecondary,
} from "@/components/layout/StudioPageShell";

export default function MaterialDetailPublicPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ["material", slug],
    queryFn: () => materialsApi.bySlug(slug).then((r) => r.data),
  });

  const { data: purchases } = useQuery({
    queryKey: ["my-material-purchases"],
    queryFn: () => materialsApi.myPurchases().then((r) => r.data),
    enabled: isAuthenticated(),
  });

  const owned = (purchases?.purchases || []).some((x: { product_id: string }) => x.product_id === product?.id);

  const { data: filesData } = useQuery({
    queryKey: ["material-files", product?.id],
    queryFn: () => materialsApi.purchasedFiles(product!.id).then((r) => r.data),
    enabled: !!product?.id && owned,
  });

  const buy = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated()) {
        router.push(`/login?redirect=/catalog/materials/${slug}`);
        return;
      }
      let checkoutCompleted = false;
      const { data: order } = await materialsApi.purchaseInitiate(product!.id);
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load payment window. Check your connection or ad blocker.");
      openRazorpayCheckout({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amountPaise: Math.round(Number(order.amount) * 100),
        currency: order.currency || "INR",
        orderId: order.razorpay_order_id,
        description: product?.title,
        prefill: { name: user?.full_name, email: user?.email },
        onDismiss: () => {
          if (!checkoutCompleted) {
            toast({ title: "Payment cancelled", description: "You can try again when you're ready." });
          }
        },
        onFailure: (resp) => {
          toast({
            title: "Payment didn't go through",
            description: getRazorpayFailureMessage(resp),
            variant: "destructive",
          });
        },
        onSuccess: async (response) => {
          checkoutCompleted = true;
          await materialsApi.purchaseConfirm({
            product_id: product!.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          qc.invalidateQueries({ queryKey: ["my-material-purchases"] });
          toast({ title: "Purchase complete" });
        },
      });
    },
    onError: (e) =>
      toast({
        title: "Couldn't start checkout",
        description: getApiErrorMessage(e, "Check your connection and try again."),
        variant: "destructive",
      }),
  });

  if (isLoading || !product) {
    return (
      <LightStudioLayout maxWidthClassName="max-w-2xl">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-10 w-4/5 rounded-xl bg-gray-100" />
          <div className="h-24 rounded-2xl bg-gray-100" />
        </div>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </LightStudioLayout>
    );
  }

  return (
    <LightStudioLayout maxWidthClassName="max-w-2xl">
      <StudioBackLink href="/catalog/materials">Back to catalog</StudioBackLink>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-2xl border border-gray-100/90 bg-white p-6 sm:p-8 shadow-card"
      >
        <p className="eyebrow mb-2">Study material</p>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight">{product.title}</h1>
        {product.description && <p className="text-gray-600 mt-3 leading-relaxed">{product.description}</p>}

        <div className="mt-6 flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900 tabular-nums">{formatPrice(product.price)}</span>
          <span className="text-sm text-gray-400">{product.file_count ?? 0} files included</span>
        </div>

        {owned ? (
          <div className="mt-8 rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
            <p className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> Your downloads
            </p>
            <ul className="space-y-2">
              {(filesData?.files || []).map((f: { id: string; file_name: string; file_url: string }) => (
                <li key={f.id}>
                  <a
                    href={f.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    <Lock className="h-3.5 w-3.5 opacity-60" />
                    <span className="group-hover:underline">{f.file_name}</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => buy.mutate()}
            disabled={buy.isPending}
            className={`mt-8 w-full sm:w-auto px-8 py-3.5 text-sm ${studioBtnPrimary}`}
          >
            {buy.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buy now"}
          </button>
        )}
      </motion.div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/catalog/materials" className={`${studioBtnSecondary} px-4 py-2.5 text-sm`}>
          Browse more materials
        </Link>
      </div>
    </LightStudioLayout>
  );
}
