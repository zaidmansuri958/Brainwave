import Link from "next/link";
import { GraduationCap, Twitter, Linkedin, Github, Mail } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Browse Courses", href: "/courses" },
    { label: "Teach on Brainwave", href: "/register?role=teacher" },
    { label: "Doubt Sessions", href: "/doubt-sessions" },
    { label: "Certificates", href: "/certificates" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Contact Us", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-[#040810] border-t border-white/5">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">
                Brainwave<span className="text-blue-400">.ai</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
              India's AI-powered learning platform. Teachers upload recordings — AI builds
              the course. Students learn, grow, and earn verified certificates.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Mail, href: "#", label: "Email" },
              ].map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="h-9 w-9 rounded-xl border border-white/8 bg-white/3 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/15 hover:bg-white/8 transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4 tracking-wide">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-500 hover:text-slate-200 text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">
            © 2026 Brainwave.ai. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-slate-600 text-xs">
            <span>Made with</span>
            <span className="text-red-400">♥</span>
            <span>in India</span>
            <span>🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
