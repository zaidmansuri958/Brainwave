import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Brainwave.ai — Learn with AI",
    template: "%s | Brainwave.ai",
  },
  description:
    "AI-powered educational platform. Learn from India's best teachers with verified certificates.",
  keywords: ["online learning", "AI education", "courses", "India", "brainwave"],
  openGraph: {
    title: "Brainwave.ai — Learn with AI",
    description: "AI-powered educational platform for India",
    siteName: "Brainwave.ai",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
