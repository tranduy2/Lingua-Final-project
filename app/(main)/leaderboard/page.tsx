"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";

interface LeaderboardUser {
    id: string;
    display_name: string;
    total_xp: number;
    current_level: string;
}

export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            const supabase = createClient();

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }

            // Get top users by XP
            const { data } = await supabase
                .from("profiles")
                .select("id, display_name, total_xp, current_level")
                .order("total_xp", { ascending: false })
                .limit(20);

            if (data) {
                setUsers(data);
            }

            setLoading(false);
        }

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🏆</span>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
            </div>

            {users.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🤷</div>
                    <p className="text-gray-600 dark:text-gray-400">No learners yet. Be the first!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {users.map((user, index) => {
                        const isCurrentUser = user.id === currentUserId;
                        const isTop3 = index < 3;

                        return (
                            <div
                                key={user.id}
                                className={`flex items-center gap-4 p-4 rounded-xl border ${isTop3
                                        ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800"
                                        : isCurrentUser
                                            ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    }`}
                            >
                                {/* Rank */}
                                <div className="w-10 text-center">
                                    {index === 0 ? (
                                        <span className="text-2xl">🥇</span>
                                    ) : index === 1 ? (
                                        <span className="text-2xl">🥈</span>
                                    ) : index === 2 ? (
                                        <span className="text-2xl">🥉</span>
                                    ) : (
                                        <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
                                            {index + 1}
                                        </span>
                                    )}
                                </div>

                                {/* Avatar */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${isCurrentUser
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    }`}>
                                    {user.display_name?.charAt(0).toUpperCase() || "?"}
                                </div>

                                {/* Name */}
                                <div className="flex-1">
                                    <p className={`font-medium ${isCurrentUser
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-gray-900 dark:text-white"
                                        }`}>
                                        {user.display_name || "Anonymous"}
                                        {isCurrentUser && " (You)"}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Level {user.current_level || "A1"}
                                    </p>
                                </div>

                                {/* XP */}
                                <div className="text-right">
                                    <p className="font-bold text-blue-600 dark:text-blue-400">
                                        {(user.total_xp || 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">XP</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
