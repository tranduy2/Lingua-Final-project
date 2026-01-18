import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-border">
                <Link href="/" className="flex items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold">Lingua</span>
                </Link>
            </header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center p-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="py-4 px-6 text-center text-sm text-muted-foreground border-t border-border">
                © 2026 Lingua. University of Greenwich Final Year Project.
            </footer>
        </div>
    );
}
