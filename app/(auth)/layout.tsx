import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            {/* Content (header is handled per page for different nav links) */}
            <main className="flex-1 flex items-center justify-center px-4 py-8">
                {children}
            </main>

            {/* Bottom Footer */}
            <footer className="py-4 px-6 border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white italic">Lingua</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        © 2024 Lingua Learning Inc.
                    </span>
                    <div className="flex items-center gap-4">
                        <Link href="#" className="text-sm text-blue-500 hover:underline">Terms</Link>
                        <Link href="#" className="text-sm text-blue-500 hover:underline">Privacy</Link>
                        <Link href="#" className="text-sm text-blue-500 hover:underline">Help</Link>
                        <Link href="#" className="text-sm text-blue-500 hover:underline">Languages</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
