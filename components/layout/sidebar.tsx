"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
    { href: "/learn", label: "Learn", icon: "📚" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { href: "/profile", label: "Profile", icon: "👤" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 fixed left-0 top-0">
            {/* Logo */}
            <Link href="/learn" className="flex items-center gap-3 mb-8 px-2">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Lingua</span>
            </Link>

            {/* Nav Items */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Admin Link */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <span className="text-xl">⚙️</span>
                    <span>Admin</span>
                </Link>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center gap-3 px-2">
                <ThemeToggle />
                <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
            </div>
        </aside>
    );
}
