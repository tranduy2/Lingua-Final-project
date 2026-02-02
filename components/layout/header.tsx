"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";

export function Header() {
    const [stats, setStats] = useState({ streak: 0, xp: 0 });

    useEffect(() => {
        async function fetchStats() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("current_streak, total_xp")
                    .eq("id", user.id)
                    .single();

                if (data) {
                    setStats({
                        streak: data.current_streak || 0,
                        xp: data.total_xp || 0,
                    });
                }
            }
        }

        fetchStats();
    }, []);

    return (
        <header className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-6">
                {/* Streak */}
                <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <span className="font-bold text-orange-500">{stats.streak}</span>
                </div>
                {/* XP */}
                <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <span className="font-bold text-yellow-500">{stats.xp}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center">
                    <span className="text-xl">🔔</span>
                </button>
            </div>
        </header>
    );
}
