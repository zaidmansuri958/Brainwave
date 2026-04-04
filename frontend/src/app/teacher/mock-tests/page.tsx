"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { mockTestsApi } from "@/lib/api";
import { ClipboardList, Loader2, Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  LightStudioLayout,
  StudioHero,
  EmptyStateWell,
  studioBtnPrimary,
} from "@/components/layout/StudioPageShell";

export default function TeacherMockTestsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["teacher-mock-packages"],
    queryFn: () => mockTestsApi.teacherList().then((r) => r.data),
  });

  const packages = data?.packages || [];

  return (
    <LightStudioLayout maxWidthClassName="max-w-4xl">
      <StudioHero
        eyebrow="Teacher studio"
        title="Mock test packages"
        description="Build papers, sections, and MCQ items — students get timed attempts and instant scores."
        action={
          <Link href="/teacher/mock-tests/new" className={`${studioBtnPrimary} px-4 py-2.5 text-sm shrink-0`}>
            <Plus className="h-4 w-4" /> New package
          </Link>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : packages.length === 0 ? (
        <EmptyStateWell
          icon={ClipboardList}
          title="No packages yet"
          description="Package multiple papers into one purchase for your students."
          action={
            <Link href="/teacher/mock-tests/new" className={`${studioBtnPrimary} px-6 py-2.5 text-sm`}>
              Create a package
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {packages.map((p: any, i: number) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <Link
                href={`/teacher/mock-tests/${p.id}`}
                className="group flex items-center justify-between rounded-2xl border border-gray-100/90 bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200/80 hover:shadow-card-hover"
              >
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-indigo-950 transition-colors">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.status}</p>
                </div>
                <span className="font-bold text-gray-900 tabular-nums">{formatPrice(p.price)}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </LightStudioLayout>
  );
}
