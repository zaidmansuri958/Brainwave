import { Pencil, Sparkles, Star } from "lucide-react";
import { CreativePricing } from "@/components/ui/creative-pricing";
import type { PricingTier } from "@/components/ui/creative-pricing";

const sampleTiers: PricingTier[] = [
  {
    name: "Starter",
    icon: <Pencil className="w-6 h-6" />,
    price: "10%",
    description: "Perfect for new teachers launching their first course",
    accent: "amber",
    features: ["Up to 500 students", "AI course builder", "Live sessions", "Basic analytics"],
    ctaLabel: "Start teaching free",
  },
  {
    name: "Growth",
    icon: <Star className="w-6 h-6" />,
    price: "9%",
    description: "For creators scaling consistently month-over-month",
    accent: "blue",
    features: ["500 to 5,000 students", "Priority review", "Dedicated manager", "Advanced analytics"],
    popular: true,
    ctaLabel: "Apply for Growth",
  },
  {
    name: "Scale",
    icon: <Sparkles className="w-6 h-6" />,
    price: "8%",
    description: "Built for top educators with large audiences",
    accent: "purple",
    features: ["5,000+ students", "Custom partnership terms", "SLA support", "Revenue share insights"],
    ctaLabel: "Talk to partnerships",
  },
];

function CreativePricingDemo() {
  return <CreativePricing tiers={sampleTiers} />;
}

export { CreativePricingDemo };
