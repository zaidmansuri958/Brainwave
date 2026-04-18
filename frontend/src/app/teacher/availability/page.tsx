"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { availabilityApi } from "@/lib/api";
import { Loader2, Plus } from "lucide-react";
import {
  LightStudioLayout,
  StudioHero,
  studioBtnPrimary,
} from "@/components/layout/StudioPageShell";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/apiError";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function fmtClock(v: string) {
  if (!v) return "";
  const part = v.includes("T") ? v.split("T")[1] : v;
  return part.slice(0, 5);
}

export default function AvailabilityPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["availability-rules"],
    queryFn: () => availabilityApi.listRules().then((r) => r.data),
  });

  const rules = data?.rules || [];

  const [weekday, setWeekday] = useState(0);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [tz, setTz] = useState("Asia/Kolkata");
  const [slotMins, setSlotMins] = useState(30);
  const [price, setPrice] = useState(0);

  const createRule = useMutation({
    mutationFn: () =>
      availabilityApi.createRule({
        weekday,
        start_time: start,
        end_time: end,
        timezone: tz,
        slot_duration_minutes: slotMins,
        price,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["availability-rules"] });
      toast({ title: "Rule saved" });
    },
    onError: (e) =>
      toast({
        title: "Couldn't save rule",
        description: getApiErrorMessage(e),
        variant: "destructive",
      }),
  });

  const genSlots = useMutation({
    mutationFn: (days: number) => availabilityApi.generateSlots(days),
    onSuccess: (r) => {
      toast({ title: `Slots created: ${r.data?.slots_created ?? 0}` });
    },
    onError: (e) =>
      toast({
        title: "Couldn't generate slots",
        description: getApiErrorMessage(e, "Add at least one rule, or try again."),
        variant: "destructive",
      }),
  });

  const input = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm";

  return (
    <LightStudioLayout maxWidthClassName="max-w-2xl">
      <StudioHero
        eyebrow="Scheduling"
        title="Doubt slots"
        description="Define weekly windows; then generate upcoming slots for students to book."
      />

      <div className="rounded-2xl border border-gray-100/90 bg-white p-6 space-y-4 shadow-card transition-shadow hover:shadow-card-hover duration-300">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="h-4 w-4" /> New rule
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">Weekday</label>
              <select className={`${input} mt-1`} value={weekday} onChange={(e) => setWeekday(Number(e.target.value))}>
                {DAYS.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Timezone</label>
              <input className={`${input} mt-1`} value={tz} onChange={(e) => setTz(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Start (HH:MM)</label>
              <input className={`${input} mt-1`} value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">End</label>
              <input className={`${input} mt-1`} value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Slot length (min)</label>
              <input
                type="number"
                className={`${input} mt-1`}
                value={slotMins}
                onChange={(e) => setSlotMins(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Price (₹, 0 = free)</label>
              <input
                type="number"
                className={`${input} mt-1`}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
          </div>
          <button
            type="button"
            disabled={createRule.isPending}
            onClick={() => createRule.mutate()}
            className={`${studioBtnPrimary} px-5 py-2.5 text-sm`}
          >
            {createRule.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save rule
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={() => genSlots.mutate(14)}
            disabled={genSlots.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60"
          >
            Generate slots (14 days)
          </button>
        </div>

        <div className="mt-10">
          <h2 className="font-display font-bold text-gray-900 mb-4">Your rules</h2>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          ) : rules.length === 0 ? (
            <p className="text-gray-400 text-sm rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center">
              No rules yet — add your first window above.
            </p>
          ) : (
            <ul className="space-y-2">
              {rules.map((r: any, i: number) => (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-sm"
                >
                  <span className="font-medium text-gray-900">{DAYS[r.weekday] ?? r.weekday}</span>{" "}
                  <span className="text-gray-600">
                    {fmtClock(r.start_time)}–{fmtClock(r.end_time)} · {r.slot_duration_minutes ?? 30}m · ₹{r.price ?? 0}
                  </span>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
    </LightStudioLayout>
  );
}
