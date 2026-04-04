"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { materialsApi } from "@/lib/api";
import { BookMarked, FileStack } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  LightStudioLayout,
  StudioHero,
  CatalogProductCard,
  CatalogSkeletonGrid,
  EmptyStateWell,
  studioBtnPrimary,
} from "@/components/layout/StudioPageShell";

export default function MaterialsCatalogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["materials-catalog"],
    queryFn: () => materialsApi.catalog().then((r) => r.data),
  });

  const items = data?.items || [];

  return (
    <LightStudioLayout>
      <StudioHero
        eyebrow="Marketplace"
        title="Study materials"
        titleGradient
        description="Notes, PDFs, and bundles from verified teachers — instant access after purchase."
        action={
          <Link href="/dashboard" className={`${studioBtnPrimary} px-5 py-2.5 text-sm shrink-0`}>
            <BookMarked className="h-4 w-4 opacity-90" />
            My library
          </Link>
        }
      />

      {isLoading ? (
        <CatalogSkeletonGrid />
      ) : items.length === 0 ? (
        <EmptyStateWell
          icon={FileStack}
          title="Nothing listed yet"
          description="Check back soon — teachers add new bundles regularly."
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((it: { id: string; slug: string; title: string; price: number }, i: number) => (
            <CatalogProductCard
              key={it.id}
              href={`/catalog/materials/${it.slug}`}
              icon={FileStack}
              title={it.title}
              price={formatPrice(it.price)}
              accentClass="text-indigo-600"
              index={i}
            />
          ))}
        </div>
      )}
    </LightStudioLayout>
  );
}
