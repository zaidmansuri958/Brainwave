"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { mockTestsApi } from "@/lib/api";
import { ClipboardList, LayoutDashboard } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  LightStudioLayout,
  StudioHero,
  CatalogProductCard,
  CatalogSkeletonGrid,
  EmptyStateWell,
  studioBtnPrimary,
} from "@/components/layout/StudioPageShell";

export default function MockTestsCatalogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["mock-catalog"],
    queryFn: () => mockTestsApi.catalog().then((r) => r.data),
  });

  const packages = data?.packages || [];

  return (
    <LightStudioLayout>
      <StudioHero
        eyebrow="Practice"
        title="Mock tests"
        titleGradient
        description="Timed papers with structured sections — instant scoring when you submit."
        action={
          <Link href="/dashboard" className={`${studioBtnPrimary} px-5 py-2.5 text-sm shrink-0`}>
            <LayoutDashboard className="h-4 w-4 opacity-90" />
            My tests
          </Link>
        }
      />

      {isLoading ? (
        <CatalogSkeletonGrid />
      ) : packages.length === 0 ? (
        <EmptyStateWell
          icon={ClipboardList}
          title="No packages yet"
          description="Mock test packs will appear here as teachers publish them."
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {packages.map((p: { id: string; slug: string; title: string; price: number }, i: number) => (
            <CatalogProductCard
              key={p.id}
              href={`/catalog/mock-tests/${p.slug}`}
              icon={ClipboardList}
              title={p.title}
              price={formatPrice(p.price)}
              accentClass="text-violet-600"
              index={i}
            />
          ))}
        </div>
      )}
    </LightStudioLayout>
  );
}
