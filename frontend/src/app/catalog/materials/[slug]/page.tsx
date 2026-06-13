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
      // Free product — backend grants access immediately, no Razorpay round-trip.
      if (order?.free || order?.enrolled) {
        qc.invalidateQueries({ queryKey: ["my-material-purchases"] });
        toast({ title: "Added to your library!" });
        return;
      }
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

  if (isLoading) {
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

  if (!product) {
    return (
      <LightStudioLayout maxWidthClassName="max-w-2xl">
        <StudioBackLink href="/catalog/materials">Back to catalog</StudioBackLink>
        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-lg font-semibold text-red-700">Study material not found</p>
          <p className="mt-2 text-sm text-red-500">This product may have been removed or the link is incorrect.</p>
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
        className="rounded-xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm"
      >
        <span className="inline-block mb-4 border border-gray-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-black ">Study material</span>
        <h1 className="  uppercase text-3xl sm:text-4xl text-gray-900 tracking-tight leading-none">{product.title}</h1>
        {product.description && <p className="text-gray-700 mt-6 text-lg font-bold leading-relaxed">{product.description}</p>}

        <div className="mt-8 flex flex-wrap items-baseline gap-4 rounded-xl border border-gray-200 bg-amber-50 p-6 shadow-sm">
          <span className=" text-4xl  text-gray-900 uppercase tabular-nums">{formatPrice(product.price)}</span>
          <span className="text-sm font-semibold text-gray-500">{product.file_count ?? 0} files included</span>
        </div>

        {owned ? (
          <div className="mt-8 rounded-xl border border-gray-200 bg-green-100 p-6 shadow-md">
            <p className=" text-xl  uppercase tracking-tight text-gray-900 mb-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0" strokeWidth={3} /> Your downloads
            </p>
            <ul className="space-y-3">
              {(filesData?.files || []).map((f: { id: string; file_name: string; file_url: string }) => (
                <li key={f.id}>
                  <a
                    href={f.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-[3px_3px_0_#111111] transition-all hover:-translate-y-1 hover:shadow-[5px_5px_0_#111111]"
                  >
                    <span className="flex items-center gap-3 text-sm font-bold text-gray-900">
                      <Lock className="h-4 w-4 text-gray-400" strokeWidth={3} />
                      {f.file_name}
                    </span>
                    <ArrowRight className="h-5 w-5 text-black opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" strokeWidth={3} />
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
            className={`mt-10 w-full sm:w-auto px-10 py-4 text-base ${studioBtnPrimary}`}
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
