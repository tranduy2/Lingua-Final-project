import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AccessibilityProvider } from "@/components/providers/accessibility-provider";
import "./globals.css";

const lexend = Lexend({
  subsets: ["vietnamese"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "Lingua - Learn English the Smart Way",
  description: "Rule-based English learning platform with CEFR curriculum, gamification, and personalized feedback.",
  keywords: ["English learning", "ESL", "CEFR", "language learning", "education"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lexend.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AccessibilityProvider>
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