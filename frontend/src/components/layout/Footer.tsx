import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/40 dark:border-slate-700/60 bg-white/40 dark:bg-slate-950/35 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white mb-3">
              <GraduationCap className="h-7 w-7 text-primary-500" />
              <span>Brainwave.ai</span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm">
              AI-powered education platform. Learn from India's best teachers with AI-generated courses and instant doubt sessions.
            </p>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/courses" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">Browse Courses</Link></li>
              <li><Link href="/register?role=teacher" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">Teach on Brainwave</Link></li>
              <li><Link href="/search" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">Search Courses</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">Account Access</Link></li>
              <li><Link href="/profile" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">Profile Settings</Link></li>
              <li><Link href="/notifications" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">Notifications</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200/70 dark:border-slate-700/70 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-400">
          <p>© 2026 Brainwave.ai. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Designed for modern learning teams</p>
        </div>
      </div>
    </footer>
  );
}
