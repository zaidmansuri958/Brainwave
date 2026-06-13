"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { mockTestsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/apiError";

function StarRow({ value, onChange, size = 5 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  const dim = size === 5 ? "h-6 w-6" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = (hover || value) >= i;
        return (
          <button
            key={i}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(i)}
            onMouseEnter={() => onChange && setHover(i)}
            onMouseLeave={() => onChange && setHover(0)}
            className={onChange ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
          >
            <Star className={`${dim} ${active ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
          </button>
        );
      })}
    </div>
  );
}

export function MockReviewsSection({ packageId, owned }: { packageId: string; owned: boolean }) {
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["mock-reviews", packageId],
    queryFn: () => mockTestsApi.reviews(packageId).then((r) => r.data),
    enabled: !!packageId,
  });

  const reviews: any[] = data?.reviews || [];
  const avg = data?.avg_rating || 0;
  const total = data?.total_reviews || 0;
  const myReview = reviews.find((r) => r.student_id === user?.id);

  const submit = useMutation({
    mutationFn: () => mockTestsApi.submitReview(packageId, { rating, review_text: text || undefined }),
    onSuccess: () => {
      toast({ title: "Review submitted — thank you!" });
      setRating(0); setText("");
      qc.invalidateQueries({ queryKey: ["mock-reviews", packageId] });
      qc.invalidateQueries({ queryKey: ["mock-stats"] });
    },
    onError: (e) => toast({ title: "Couldn't submit review", description: getApiErrorMessage(e), variant: "destructive" }),
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-gray-900">What students say</p>
        {total > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-extrabold text-gray-900">{avg.toFixed(1)}</span>
            <StarRow value={Math.round(avg)} size={3} />
            <span className="text-xs text-gray-400">({total})</span>
          </div>
        )}
      </div>

      {/* Submit form — only owners who haven't reviewed */}
      {owned && !myReview && (
        <div className="mb-5 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Rate this package</p>
          <StarRow value={rating} onChange={setRating} />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience (optional)…"
            rows={2}
            className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none"
          />
          <button
            type="button"
            disabled={rating === 0 || submit.isPending}
            onClick={() => submit.mutate()}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
            Submit Review
          </button>
        </div>
      )}

      {owned && myReview && (
        <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 flex items-center gap-2">
          <StarRow value={myReview.rating} size={3} />
          <span className="text-xs text-emerald-700 font-medium">You reviewed this package</span>
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-violet-400" /></div>
      ) : reviews.length === 0 ? (
        <div className="py-8 text-center">
          <MessageSquare className="h-8 w-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No reviews yet</p>
          {owned ? (
            <p className="text-xs text-gray-400 mt-0.5">Be the first to review this package!</p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">Purchase to share your experience.</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.slice(0, 6).map((r) => (
            <div key={r.id} className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600 overflow-hidden">
                  {r.student_avatar ? <img src={r.student_avatar} alt="" className="h-full w-full object-cover" /> : (r.student_name?.[0] || "S")}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{r.student_id === user?.id ? "You" : r.student_name}</p>
                  <p className="text-xs text-gray-400">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</p>
                </div>
                <span className="ml-auto shrink-0"><StarRow value={r.rating} size={3} /></span>
              </div>
              {r.review_text && <p className="text-xs text-gray-600 leading-relaxed italic">&quot;{r.review_text}&quot;</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
