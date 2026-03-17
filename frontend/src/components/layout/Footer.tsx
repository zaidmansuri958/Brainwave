import Link from "next/link";
import { GraduationCap, Github, Twitter, Linkedin, Youtube, Heart } from "lucide-react";

export function Footer() {
  const footerLinks = {
    Platform: [
      { label: "Browse Courses", href: "/courses" },
      { label: "Teach on Brainwave", href: "/register?role=teacher" },
      { label: "Doubt Sessions", href: "/doubt-sessions" },
      { label: "Certificates", href: "/verify" },
    ],
    Resources: [
      { label: "Help Center", href: "/help" },
      { label: "Blog", href: "/blog" },
      { label: "Community", href: "/community" },
      { label: "API", href: "/api-docs" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  };

  return (
    <footer className="relative mt-auto border-t border-border/50">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-500/[0.02] dark:to-primary-500/[0.05] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl gradient-bg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                <span className="gradient-text">Brainwave</span>
                <span className="text-muted-foreground">.ai</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              AI-powered education platform. Learn from the best teachers with AI-generated courses,
              real-time doubt sessions, and verified certificates.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Youtube, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="h-10 w-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-md transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-foreground mb-4 text-sm">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Brainwave.ai. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
