"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/client";

interface Lesson {
    id: string;
    title: string;
    order_index: number;
    xp_reward: number;
}

interface Unit {
    id: string;
    title: string;
    description: string;
    cefr_level: string;
    order_index: number;
    lessons: Lesson[];
}

// Unit banner color cycles
const unitColors = [
    "from-green-400 to-green-500",
    "from-yellow-400 to-yellow-500",
    "from-blue-400 to-blue-500",
    "from-purple-400 to-purple-500",
    "from-pink-400 to-pink-500",
];

export default function LearnPage() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [userXp, setUserXp] = useState(0);

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient();

            const { data } = await supabase
                .from("units")
                .select(`
                    id, title, description, cefr_level, order_index,
                    lessons ( id, title, order_index, xp_reward )
                `)
                .eq("is_published", true)
                .order("order_index");

            if (data) {
                const sorted = data.map((unit) => ({
                    ...unit,
                    lessons: unit.lessons?.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index) || [],
                }));
                setUnits(sorted);
            }

            // Fetch user XP
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("user_statistics")
                    .select("total_xp")
                    .eq("user_id", user.id)
                    .single();
                if (profile) setUserXp(profile.total_xp || 0);
            }

            setLoading(false);
        }

        fetchData();
    }, []);

    // Loading skeleton
    if (loading) {
        return (
            <div className="flex gap-8">
                <div className="flex-1 max-w-2xl mx-auto px-4 py-8">
                    <div className="animate-pulse space-y-8">
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex justify-center">
                                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            </div>
                        ))}
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (units.length === 0) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No lessons yet</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Check back soon for new content!</p>
                <Link href="/dashboard" className="text-blue-500 hover:underline">Go to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="flex gap-6">
            {/* Main content */}
            <div className="flex-1 max-w-2xl mx-auto px-4 py-6">
                {/* Top stats bar */}
                <div className="flex items-center justify-end gap-5 mb-8">
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg">🔥</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">12</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg">💎</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{userXp}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg">❤️</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">5</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-sm">
                        👤
                    </div>
                </div>

                {/* Units */}
                {units.map((unit, unitIndex) => (
                    <div key={unit.id} className="mb-4">
                        {/* Unit Banner */}
                        <div className={`relative bg-gradient-to-r ${unitColors[unitIndex % unitColors.length]} rounded-2xl p-5 pr-6 mb-2 shadow-md`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        Unit {unitIndex + 1}: {unit.title}
                                    </h2>
                                    <p className="text-white/80 text-sm">{unit.description}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                                    {unitIndex === 0 ? "✓" : "📖"}
                                </div>
                            </div>
                        </div>

                        {/* Zigzag Lesson Path */}
                        <div className="py-4">
                            {unit.lessons.map((lesson, lessonIndex) => {
                                // Zigzag: alternate left/center/right
                                const positions = [0, 1, 2, 1]; // center, right, center-right, right pattern
                                const pos = positions[lessonIndex % 4];
                                const offsetX = pos === 0 ? 0 : pos === 1 ? -40 : 40;

                                const isCheckpoint = lessonIndex === unit.lessons.length - 1 && unit.lessons.length > 2;
                                const isCompleted = false; // TODO: track from Supabase
                                const nodeColor = isCheckpoint
                                    ? "bg-yellow-400 border-yellow-500 shadow-yellow-400/30"
                                    : "bg-green-500 border-green-600 shadow-green-500/30";

                                return (
                                    <div key={lesson.id} className="flex flex-col items-center">
                                        {/* Connecting line */}
                                        {lessonIndex > 0 && (
                                            <div className="w-0.5 h-10 bg-gray-300 dark:bg-gray-600"></div>
                                        )}

                                        {/* Lesson node */}
                                        <Link
                                            href={`/lesson/${lesson.id}`}
                                            className="group relative"
                                            style={{ transform: `translateX(${offsetX}px)` }}
                                        >
                                            <div
                                                className={`w-14 h-14 rounded-full ${nodeColor} border-b-4 flex items-center justify-center shadow-lg transition-all group-hover:scale-110 group-hover:shadow-xl cursor-pointer`}
                                            >
                                                {isCheckpoint ? (
                                                    <span className="text-xl">🏆</span>
                                                ) : (
                                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Hover tooltip */}
                                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                <span className="text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded-md shadow">
                                                    {lesson.title}
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Right Sidebar (Desktop only) */}
            <div className="hidden xl:block w-72 flex-shrink-0 py-6 space-y-4">
                {/* Daily Quests Card */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white">Daily Quests</h3>
                        <Link href="/dashboard" className="text-xs font-bold text-blue-500 uppercase hover:underline">
                            View All
                        </Link>
                    </div>

                    {/* Quest 1 */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-lg">
                            ⚡
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Earn 50 XP</span>
                                <span className="text-xs text-gray-500">30/50</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: "60%" }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Quest 2 */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-lg">
                            🗣️
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Speak 5 phrases</span>
                                <span className="text-xs text-gray-500">1/5</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: "20%" }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard snippet */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Silver League</h3>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm">
                                👤
                            </div>
                            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">David</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">1200 XP</span>
                        </div>
                        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 -mx-2 px-2 py-1.5 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-sm">
                                👤
                            </div>
                            <span className="flex-1 text-sm font-bold text-blue-600 dark:text-blue-400">You</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{userXp} XP</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm">
                                👤
                            </div>
                            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">Sarah</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">850 XP</span>
                        </div>
                    </div>
                </div>

                {/* Super Lingua Promo */}
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-5 text-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 text-lg">
                        💎
                    </div>
                    <h3 className="font-bold text-white mb-1">Try Super Lingua</h3>
                    <p className="text-white/80 text-sm mb-4">
                        No ads, unlimited hearts, and personalized practice.
                    </p>
                    <button className="w-full py-2.5 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                        Start Free Trial
                    </button>
                </div>
            </div>
        </div>
    );
}
