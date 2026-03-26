"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { createClient } from "@/lib/client";

const navItems = [
    { href: "/learn", label: "Learn", icon: "📚" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/statistics", label: "Statistics", icon: "📈" },
    { href: "/review", label: "Smart Review", icon: "🧠" },
    { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
    { href: "/profile", label: "Profile", icon: "👤" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        async function checkRole() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role === "admin") {
                setIsAdmin(true);
            }
        }
        checkRole();
    }, []);

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
    }

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-[#1B1D24] border-r border-[#D4D6DB] dark:border-[#2E3039] p-4 fixed left-0 top-0">
            {/* Logo */}
            <Link href="/learn" className="flex items-center gap-3 mb-8 px-2">
                <div className="w-10 h-10 bg-[#3C83F6] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-xl font-bold text-[#1A1C1E] dark:text-white">Lingua</span>
            </Link>

            {/* Nav Items */}
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${isActive
                                    ? "bg-[#3C83F6]/10 text-[#3C83F6] dark:bg-[#3C83F6]/15 dark:text-[#6BA3F7]"
                                    : "text-[#75777F] hover:bg-[#F0F2F5] dark:hover:bg-[#2A2D35] hover:text-[#1A1C1E] dark:hover:text-white"
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Admin Link — only shown to admin users */}
            {isAdmin && (
                <div className="border-t border-[#D4D6DB] dark:border-[#2E3039] pt-4 mb-4">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#75777F] hover:bg-[#F0F2F5] dark:hover:bg-[#2A2D35] hover:text-[#1A1C1E] dark:hover:text-white"
                    >
                        <span className="text-xl">⚙️</span>
                        <span>Admin</span>
                    </Link>
                </div>
            )}

            {/* Theme Toggle & Logout */}
            <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                    <ThemeToggle />
                    <span className="text-sm text-[#75777F]">Theme</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full transition-colors font-medium"
                >
                    <span className="text-xl">🚪</span>
                    <span>Log out</span>
                </button>
            </div>
        </aside>
    );
}
