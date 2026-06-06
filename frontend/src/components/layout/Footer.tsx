import Link from "next/link";
import { Sparkles, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Browse Courses", href: "/courses" },
    { label: "Live Classes", href: "/features" },
    { label: "Doubt Sessions", href: "/features" },
    { label: "AI Tutor", href: "/features" },
    { label: "Certificates", href: "/features" },
  ],
  "For Learners": [
    { label: "How it Works", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Success Stories", href: "#" },
    { label: "Learning Path", href: "/courses" },
    { label: "Blog", href: "#" },
  ],
  "For Teachers": [
    { label: "Teach on Brainwave", href: "/for-teachers" },
    { label: "Teacher Resources", href: "/for-teachers" },
    { label: "Earnings", href: "/for-teachers" },
    { label: "Community", href: "/features" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">

          {/* Brand col — spans 2 */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Brainwave</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-6 max-w-xs">
              Your all-in-one platform for AI-powered courses, live classes, and career growth.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:bg-violet-600 hover:text-white transition-all">
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-white font-semibold text-sm mb-4">{group}</p>
              <div className="space-y-2.5">
                {links.map((link) => (
                  <Link key={link.label} href={link.href}
                    className="block text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <p className="text-white font-semibold text-sm mb-4">Stay updated</p>
            <p className="text-xs text-gray-500 mb-3">Subscribe to our newsletter</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Enter your email"
                className="flex-1 min-w-0 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors" />
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors">
                <Mail className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-gray-600 mt-2">We respect your privacy.</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Brainwave AI Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
