"use client";

import Link from "next/link";
import { useState } from "react";
import {
  GraduationCap,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight,
  Sparkles,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const platformLinks = [
  { href: "/courses", label: "Browse Courses" },
  { href: "/register?role=teacher", label: "Teach on Brainwave" },
  { href: "/doubt-sessions", label: "Doubt Sessions" },
  { href: "/live-classes", label: "Live Classes" },
  { href: "/pricing", label: "Pricing" },
];

const resourceLinks = [
  { href: "/docs", label: "Documentation" },
  { href: "/api-docs", label: "API Reference" },
  { href: "/blog", label: "Blog" },
  { href: "/community", label: "Community" },
  { href: "/changelog", label: "Changelog" },
];

const companyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/careers", label: "Careers" },
  { href: "/press", label: "Press Kit" },
  { href: "/contact", label: "Contact" },
  { href: "/partners", label: "Partners" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/gdpr", label: "GDPR" },
];

const socialLinks = [
  { href: "https://github.com", label: "GitHub", icon: Github },
  { href: "https://twitter.com", label: "Twitter", icon: Twitter },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const renderLinkGroup = (
    title: string,
    links: { href: string; label: string }[]
  ) => (
    <div>
      <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "group/link inline-flex items-center gap-1.5 text-sm text-gray-400",
                "hover:text-white transition-all duration-200"
              )}
            >
              <span className="transition-transform duration-200 group-hover/link:translate-x-1">
                {link.label}
              </span>
              <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="relative bg-[#030014] text-gray-300 mt-auto overflow-hidden">
      {/* Animated glow line separator */}
      <div className="glow-line w-full" />

      {/* Mesh gradient overlay at top */}
      <div
        className="absolute top-0 left-0 right-0 h-80 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 20% 0%, rgba(168,85,247,0.05) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 0%, rgba(59,130,246,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Newsletter Section */}
      <div className="relative border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-3">
              <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/15">
                <Sparkles className="h-3 w-3 mr-1.5" />
                Join 50,000+ learners
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                Stay ahead with AI-powered learning
              </h3>
              <p className="text-gray-400 text-sm max-w-md">
                Get the latest courses, AI tools, and learning insights delivered to your inbox weekly.
              </p>
            </div>

            <div className="w-full lg:w-auto">
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1 min-w-[280px]">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="pl-10 h-12 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:shadow-indigo-500/30 hover:scale-[1.02]"
                >
                  Subscribe
                </Button>
              </form>
              {subscribed && (
                <p className="text-xs text-indigo-400 mt-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Thanks for subscribing! Check your inbox.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-bold text-xl group"
            >
              <div className="relative">
                <GraduationCap className="h-8 w-8 text-indigo-400 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-white text-xl font-bold tracking-tight">
                Brainwave.ai
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              The next-generation AI-powered education platform. Learn from
              India&apos;s best teachers with AI-generated courses, real-time
              doubt sessions, and verified certificates.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl",
                    "bg-white/[0.03] border border-white/[0.06]",
                    "text-gray-400 hover:text-white",
                    "hover:bg-white/[0.08] hover:border-white/[0.12]",
                    "hover:shadow-lg hover:shadow-indigo-500/10",
                    "transition-all duration-300"
                  )}
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Groups */}
          {renderLinkGroup("Platform", platformLinks)}
          {renderLinkGroup("Resources", resourceLinks)}
          {renderLinkGroup("Company", companyLinks)}
          {renderLinkGroup("Legal", legalLinks)}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Brainwave.ai. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                All systems operational
              </div>

              <span className="text-gray-700">|</span>

              <p className="text-sm text-gray-500">
                Made with ❤️ in India 🇮🇳
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
