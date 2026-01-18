import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AccessibilityProvider } from "@/components/providers/accessibility-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lingua - Learn English the Smart Way",
  description: "AI-free, rule-based English learning platform with CEFR curriculum, gamification, and personalized feedback.",
  keywords: ["English learning", "ESL", "CEFR", "language learning", "education"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AccessibilityProvider>
            {/* Skip to main content for accessibility */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            {children}
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}