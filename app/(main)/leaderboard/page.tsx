"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";

interface LeaderboardUser {
    id: string;
    display_name: string;
    total_xp: number;
    current_level: string;
    current_streak: number;
}

type TimePeriod = "weekly" | "all-time";

export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<TimePeriod>("weekly");

    useEffect(() => {
        async function fetchLeaderboard() {
            setLoading(true);
            const supabase = createClient();

            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);

            const { data } = await supabase
                .from("profiles")
                .select("id, display_name, total_xp, current_level, current_streak")
                .order("total_xp", { ascending: false })
                .limit(20);

            if (data) setUsers(data);
            setLoading(false);
        }

        fetchLeaderboard();
    }, [period]);

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">🏆</span>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
                </div>

                {/* Period Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    <button
                        onClick={() => setPeriod("weekly")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            period === "weekly"
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                        }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => setPeriod("all-time")}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            period === "all-time"
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                        }`}
                    >
                        All Time
                    </button>
                </div>
            </div>

            {/* Top 3 Podium */}
            {users.length >= 3 && (
                <div className="flex items-end justify-center gap-3 mb-8">
                    {/* 2nd place */}
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-400 mb-1">
                            {users[1].display_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {users[1].display_name?.split(" ")[0] || "—"}
                        </span>
                        <div className="w-20 h-16 bg-gray-200 dark:bg-gray-700 rounded-t-xl flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-lg">🥈</span>
                                <p className="text-xs font-bold text-gray-600 dark:text-gray-300">{users[1].total_xp} XP</p>
                            </div>
                        </div>
                    </div>

                    {/* 1st place */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-xl font-bold text-white mb-1 ring-4 ring-yellow-300 dark:ring-yellow-500/30">
                            {users[0].display_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                            {users[0].display_name?.split(" ")[0] || "—"}
                        </span>
                        <div className="w-20 h-24 bg-yellow-400 dark:bg-yellow-500 rounded-t-xl flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-2xl">👑</span>
                                <p className="text-xs font-bold text-yellow-900">{users[0].total_xp} XP</p>
                            </div>
                        </div>
                    </div>

                    {/* 3rd place */}
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-orange-200 dark:bg-orange-900/30 flex items-center justify-center text-xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                            {users[2].display_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {users[2].display_name?.split(" ")[0] || "—"}
                        </span>
                        <div className="w-20 h-12 bg-orange-200 dark:bg-orange-900/40 rounded-t-xl flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-lg">🥉</span>
                                <p className="text-xs font-bold text-orange-600 dark:text-orange-400">{users[2].total_xp} XP</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Full List */}
            {users.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🤷</div>
                    <p className="text-gray-600 dark:text-gray-400">No learners yet. Be the first!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {users.map((user, index) => {
                        const isCurrentUser = user.id === currentUserId;

                        return (
                            <div
                                key={user.id}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                                    isCurrentUser
                                        ? "bg-blue-50 dark:bg-blue-900/15 border-blue-200 dark:border-blue-800"
                                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                                }`}
                            >
                                {/* Rank */}
                                <div className="w-8 text-center">
                                    {index === 0 ? (
                                        <span className="text-xl">🥇</span>
                                    ) : index === 1 ? (
                                        <span className="text-xl">🥈</span>
                                    ) : index === 2 ? (
                                        <span className="text-xl">🥉</span>
                                    ) : (
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                            {index + 1}
                                        </span>
                                    )}
                                </div>

                                {/* Avatar */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                    isCurrentUser
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                }`}>
                                    {user.display_name?.charAt(0).toUpperCase() || "?"}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${
                                        isCurrentUser
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-gray-900 dark:text-white"
                                    }`}>
                                        {user.display_name || "Anonymous"}
                                        {isCurrentUser && " (You)"}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span>Level {user.current_level || "A1"}</span>
                                        {user.current_streak > 0 && (
                                            <span className="flex items-center gap-0.5">
                                                🔥 {user.current_streak}d
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* XP */}
                                <div className="text-right">
                                    <p className="font-bold text-blue-600 dark:text-blue-400">
                                        {(user.total_xp || 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">XP</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
