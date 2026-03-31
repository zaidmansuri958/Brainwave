import Link from "next/link";
import { Zap, Twitter, Linkedin, Github, Youtube } from "lucide-react";

const links = {
  Platform: [
    { label: "Browse Courses",    href: "/courses" },
    { label: "Features",          href: "/features" },
    { label: "Pricing",           href: "/pricing" },
    { label: "Live Sessions",     href: "/courses" },
    { label: "AI Tutor",          href: "/courses" },
  ],
  Company: [
    { label: "About Us",          href: "#" },
    { label: "Blog",              href: "#" },
    { label: "Careers",           href: "#" },
    { label: "Press",             href: "#" },
  ],
  Support: [
    { label: "Help Center",       href: "#" },
    { label: "Contact",           href: "#" },
    { label: "Privacy Policy",    href: "#" },
    { label: "Terms of Service",  href: "#" },
  ],
};

const socials = [
  { icon: Twitter,  href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github,   href: "#", label: "GitHub" },
  { icon: Youtube,  href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-[#F5F4F1] border-t border-gray-200/70">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-gray-200/60">

          {/* Brand — spans 2 cols */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-[10px] bg-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-display font-bold text-lg text-gray-900 tracking-tight">
                Brainwave<span className="text-indigo-600">.ai</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[210px] mb-6">
              India&apos;s AI-powered learning platform — for ambitious students and educators.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  <Icon className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-4">
                {group}
              </p>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Brainwave Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Built with care in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
