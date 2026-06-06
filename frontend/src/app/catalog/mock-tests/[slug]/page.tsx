"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { mockTestsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { loadRazorpay, openRazorpayCheckout } from "@/lib/razorpay";
import { Clock, Loader2, Play } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage, getRazorpayFailureMessage } from "@/lib/apiError";
import {
  LightStudioLayout,
  StudioBackLink,
  studioBtnPrimary,
  studioBtnSecondary,
} from "@/components/layout/StudioPageShell";

export default function MockPackagePublicPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const { data: pkg, isLoading } = useQuery({
    queryKey: ["mock-pkg", slug],
    queryFn: () => mockTestsApi.bySlug(slug).then((r) => r.data),
  });

  const { data: mine } = useQuery({
    queryKey: ["my-mock-packages"],
    queryFn: () => mockTestsApi.myPackages().then((r) => r.data),
    enabled: isAuthenticated(),
  });

  const owned = (mine?.packages || []).some((x: { package_id: string }) => x.package_id === pkg?.id);

  const buy = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated()) {
        router.push(`/login?redirect=/catalog/mock-tests/${slug}`);
        return;
      }
      let checkoutCompleted = false;
      const { data: order } = await mockTestsApi.purchaseInitiate(pkg!.id);
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load payment window. Check your connection or ad blocker.");
      openRazorpayCheckout({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amountPaise: Math.round(Number(order.amount) * 100),
        currency: order.currency || "INR",
        orderId: order.razorpay_order_id,
        description: pkg?.title,
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
          await mockTestsApi.purchaseConfirm({
            package_id: pkg!.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          qc.invalidateQueries({ queryKey: ["my-mock-packages"] });
          qc.invalidateQueries({ queryKey: ["mock-pkg", slug] });
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

  if (!pkg) {
    return (
      <LightStudioLayout maxWidthClassName="max-w-2xl">
        <StudioBackLink href="/catalog/mock-tests">Back to catalog</StudioBackLink>
        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-lg font-semibold text-red-700">Mock test package not found</p>
          <p className="mt-2 text-sm text-red-500">This package may have been removed or the link is incorrect.</p>
        </div>
      </LightStudioLayout>
    );
  }

  return (
    <LightStudioLayout maxWidthClassName="max-w-2xl">
      <StudioBackLink href="/catalog/mock-tests">Back to catalog</StudioBackLink>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm"
      >
        <span className="inline-block mb-4 border border-gray-200 bg-pink-100 px-3 py-1 text-xs font-semibold text-black ">Mock test package</span>
        <h1 className="  uppercase text-3xl sm:text-4xl text-gray-900 tracking-tight leading-none">{pkg.title}</h1>
        {pkg.description && <p className="text-gray-700 mt-6 text-lg font-bold leading-relaxed">{pkg.description}</p>}
        
        <div className="mt-8 flex items-center gap-4 rounded-xl border border-gray-200 bg-blue-100 p-6 shadow-sm">
          <p className=" text-4xl  text-gray-900 uppercase tabular-nums">{formatPrice(pkg.price)}</p>
        </div>

        {owned ? (
          <div className="mt-8 rounded-xl border border-gray-200 bg-yellow-300 p-6 shadow-md">
            <p className=" text-xl  uppercase tracking-tight text-gray-900 mb-4">Your papers</p>
            <ul className="space-y-3">
              {(pkg.papers || []).map((p: { id: string; title: string; time_limit_minutes: number }) => (
                <li key={p.id}>
                  <Link
                    href={`/mock-tests/take/${p.id}`}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-[3px_3px_0_#111111] transition-all hover:-translate-y-1 hover:shadow-[5px_5px_0_#111111]"
                  >
                    <span className="flex items-center gap-3 text-sm font-bold text-gray-900">
                      <Play className="h-5 w-5 text-black" strokeWidth={3} />
                      {p.title}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                      <Clock className="h-4 w-4" strokeWidth={3} />
                      {p.time_limit_minutes} min
                    </span>
                  </Link>
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
            {buy.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buy package"}
          </button>
        )}
      </motion.div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/catalog/mock-tests" className={`${studioBtnSecondary} px-4 py-2.5 text-sm`}>
          More mock tests
        </Link>
      </div>
    </LightStudioLayout>
  );
}
