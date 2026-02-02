"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/client";

interface UserStats {
    totalXp: number;
    streak: number;
    lessonsCompleted: number;
    level: string;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<UserStats>({
        totalXp: 0,
        streak: 0,
        lessonsCompleted: 0,
        level: "A1",
    });
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("Learner");

    useEffect(() => {
        async function fetchStats() {
            const supabase = createClient();

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUserName(user.user_metadata?.display_name || "Learner");

                // Get profile with stats
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("total_xp, current_streak, current_level")
                    .eq("id", user.id)
                    .single();

                if (profile) {
                    setStats({
                        totalXp: profile.total_xp || 0,
                        streak: profile.current_streak || 0,
                        lessonsCompleted: 0, // Will implement later
                        level: profile.current_level || "A1",
                    });
                }
            }

            setLoading(false);
        }

        fetchStats();
    }, []);

    // Calculate level progress (100 XP per level)
    const xpForCurrentLevel = stats.totalXp % 100;
    const levelProgress = xpForCurrentLevel;

    // Daily goal (10 XP)
    const dailyGoal = 10;
    const dailyProgress = Math.min(stats.totalXp % dailyGoal, dailyGoal);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Welcome */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Hello, {userName}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Keep up the great work!</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-3">
                        <span className="text-xl">⚡</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalXp}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total XP</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3">
                        <span className="text-xl">🔥</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.streak}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Day Streak</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                        <span className="text-xl">🎯</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.level}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Level</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                        <span className="text-xl">📚</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lessonsCompleted}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lessons Done</p>
                </div>
            </div>

            {/* Progress Section */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    📈 Your Progress
                </h2>
                <div className="space-y-4">
                    {/* Level Progress */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-900 dark:text-white">Level Progress</span>
                            <span className="text-gray-600 dark:text-gray-400">{levelProgress} / 100 XP</span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${levelProgress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Daily Goal */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-900 dark:text-white">Daily Goal</span>
                            <span className="text-gray-600 dark:text-gray-400">{dailyProgress} / {dailyGoal} XP</span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${(dailyProgress / dailyGoal) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Continue Learning</h2>
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/learn"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600"
                    >
                        📚 Go to Lessons
                    </Link>
                    <Link
                        href="/leaderboard"
                        className="inline-flex items-center gap-2 px-5 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        🏆 View Leaderboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
