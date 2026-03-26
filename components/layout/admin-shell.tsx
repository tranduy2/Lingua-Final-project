"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/client";

const adminNavItems = [
    { href: "/admin", label: "Overview", icon: "📊", exact: true },
    { href: "/admin/grammar-rules", label: "Grammar Manager", icon: "📝", exact: false },
    { href: "/admin/exercises", label: "Exercise Builder", icon: "✏️", exact: false },
    { href: "/admin/curriculum", label: "Curriculum", icon: "📚", exact: false },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#0B1525] flex">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-56 bg-white dark:bg-[#111C2E] border-r border-[#D4D6DB] dark:border-[#1E3050] fixed left-0 top-0 h-screen p-4">
                {/* Logo */}
                <Link href="/admin" className="flex items-center gap-3 mb-1 px-3 py-2">
                    <div className="w-9 h-9 bg-[#3C83F6] rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">🌐</span>
                    </div>
                    <div>
                        <span className="text-lg font-bold text-[#1A1C1E] dark:text-white block leading-tight">Lingua</span>
                        <span className="text-[10px] text-[#75777F]">Admin Console</span>
                    </div>
                </Link>

                {/* Nav */}
                <nav className="flex-1 mt-4 space-y-1">
                    {adminNavItems.map((item) => {
                        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-[#3C83F6] text-white shadow-md shadow-[#3C83F6]/20"
                                        : "text-[#75777F] hover:bg-[#F0F2F5] dark:hover:bg-[#1B2840] hover:text-[#1A1C1E] dark:hover:text-white"
                                }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="border-t border-[#D4D6DB] dark:border-[#1E3050] pt-3 space-y-1">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#75777F] hover:bg-[#F0F2F5] dark:hover:bg-[#1B2840] hover:text-[#1A1C1E] dark:hover:text-white"
                    >
                        <span className="text-lg">⚙️</span>
                        <span>Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 w-full font-medium"
                    >
                        <span className="text-lg">🚪</span>
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-56">
                {/* Top Header */}
                <header className="sticky top-0 z-10 bg-white dark:bg-[#111C2E] border-b border-[#D4D6DB] dark:border-[#1E3050] px-6 py-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-bold text-[#1A1C1E] dark:text-white">Dashboard Overview</h1>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 bg-[#F0F2F5] dark:bg-[#0B1525] rounded-xl px-4 py-2">
                                <span className="text-[#75777F]">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search users, exercises..."
                                    className="bg-transparent text-sm text-[#1A1C1E] dark:text-white placeholder-[#75777F] outline-none w-44"
                                />
                            </div>
                            <div className="relative">
                                <span className="text-xl cursor-pointer">🔔</span>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#111C2E]" />
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3C83F6] to-[#6277A4] flex items-center justify-center text-white font-bold text-sm">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
