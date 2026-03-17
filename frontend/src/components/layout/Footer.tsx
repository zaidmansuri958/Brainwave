import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <GraduationCap className="h-7 w-7 text-primary-400" />
              <span>Brainwave.ai</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-xs">
              AI-powered education platform. Learn from India's best teachers with AI-generated courses and instant doubt sessions.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/courses" className="hover:text-white transition-colors">Browse Courses</Link></li>
              <li><Link href="/register?role=teacher" className="hover:text-white transition-colors">Teach on Brainwave</Link></li>
              <li><Link href="/doubt-sessions" className="hover:text-white transition-colors">Doubt Sessions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© 2026 Brainwave.ai. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Made with ❤️ in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
}
