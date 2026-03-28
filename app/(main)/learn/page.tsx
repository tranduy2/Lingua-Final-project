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
    cefr_level?: string;
    order_index: number;
    lessons: Lesson[];
}

export default function LearnPage() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [userXp, setUserXp] = useState(0);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient();

            const { data, error } = await supabase
                .from("units")
                .select(`
                    id, title, description, order_index,
                    lessons!lessons_unit_id_fkey ( id, title, order_index, xp_reward )
                `)
                .eq("is_published", true)
                .order("order_index");

            console.log("=== THÁM TỬ BẮT LỖI ===");
            console.log("1. Link DB web đang dùng:", process.env.NEXT_PUBLIC_SUPABASE_URL);
            console.log("2. Dữ liệu tải về:", data);
            console.log("3. Lỗi (nếu có):", error);
            if (error) {
                console.log("4. Error code:", error.code);
                console.log("5. Error message:", error.message);
                console.log("6. Error details:", error.details);
                console.log("7. Error hint:", error.hint);
            }

            if (data) {
                const sorted = data.map((unit) => ({
                    ...unit,
                    lessons: unit.lessons?.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index) || [],
                }));
                setUnits(sorted);
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("total_xp, current_streak")
                    .eq("id", user.id)
                    .single();

                if (profileError) {
                    console.log("Profiles query failed (schema mismatch?):", profileError);
                }

                if (profile) {
                    setUserXp(profile.total_xp || 0);
                    setStreak(profile.current_streak || 0);
                }
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
                        <div className="h-20 bg-gray-200 dark:bg-[#2A2D35] rounded-2xl"></div>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex justify-center">
                                <div className="w-16 h-16 bg-gray-200 dark:bg-[#2A2D35] rounded-full"></div>
                            </div>
                        ))}
                        <div className="h-20 bg-gray-200 dark:bg-[#2A2D35] rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Empty
    if (units.length === 0) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h1 className="text-2xl font-bold text-[#1A1C1E] dark:text-white mb-2">No lessons yet</h1>
                <p className="text-[#75777F] mb-6">Check back soon for new content!</p>
                <Link href="/dashboard" className="text-[#3C83F6] hover:underline">Go to Dashboard</Link>
            </div>
        );
    }

    // Zigzag offsets: each lesson node shifts L → center → R → center
    const getZigzagOffset = (index: number) => {
        const pattern = [0, -50, 0, 50];
        return pattern[index % 4];
    };

    return (
        <div className="flex gap-6">
            {/* Main content */}
            <div className="flex-1 max-w-2xl mx-auto px-4 py-6">
                {/* Top stats bar */}
                <div className="flex items-center justify-end gap-5 mb-8 pr-2">
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg">🔥</span>
                        <span className="font-bold text-[#1A1C1E] dark:text-gray-200">{streak || 12}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg">💎</span>
                        <span className="font-bold text-[#1A1C1E] dark:text-gray-200">{userXp || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-lg">❤️</span>
                        <span className="font-bold text-[#1A1C1E] dark:text-gray-200">5</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#3C83F6]/10 dark:bg-[#3C83F6]/20 flex items-center justify-center">
                        <span className="text-sm">👤</span>
                    </div>
                </div>

                {/* Units */}
                {units.map((unit, unitIndex) => (
                    <div key={unit.id} className="mb-6">
                        {/* Unit Banner */}
                        <div className="relative bg-gradient-to-r from-green-400 to-green-500 rounded-2xl px-6 py-5 mb-8 shadow-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        Unit {unitIndex + 1}: {unit.title}
                                    </h2>
                                    <p className="text-white/80 text-sm mt-0.5">{unit.description}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    {unitIndex === 0 ? (
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <span className="text-white text-lg">📖</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Lesson Nodes - Zigzag Path */}
                        <div className="flex flex-col items-center py-2">
                            {unit.lessons.map((lesson, lessonIndex) => {
                                const isCheckpoint = lessonIndex === unit.lessons.length - 1 && unit.lessons.length > 2;
                                const offsetX = getZigzagOffset(lessonIndex);

                                return (
                                    <div key={lesson.id} className="flex flex-col items-center">
                                        {/* Connector line */}
                                        {lessonIndex > 0 && (
                                            <div className="w-[3px] h-16 bg-gray-300 dark:bg-gray-600"></div>
                                        )}

                                        {/* Node */}
                                        <Link
                                            href={`/lesson/${lesson.id}`}
                                            className="group relative"
                                            style={{ transform: `translateX(${offsetX}px)` }}
                                        >
                                            {isCheckpoint ? (
                                                /* Trophy checkpoint node */
                                                <div className="w-16 h-16 rounded-full bg-yellow-400 border-[3px] border-yellow-500 shadow-lg flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-xl cursor-pointer">
                                                    <span className="text-2xl">🏆</span>
                                                </div>
                                            ) : (
                                                /* Star lesson node */
                                                <div className="w-16 h-16 rounded-full bg-green-500 border-b-4 border-green-600 shadow-lg flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-xl cursor-pointer">
                                                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Hover tooltip */}
                                            <div className="absolute left-1/2 -translate-x-1/2 -bottom-9 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                <span className="text-xs bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg shadow-lg">
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

            {/* Right Sidebar */}
            <div className="hidden xl:block w-72 flex-shrink-0 py-6 space-y-4">
                {/* Daily Quests Card */}
                <div className="bg-white dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-[#1A1C1E] dark:text-white">Daily Quests</h3>
                        <Link href="/dashboard" className="text-xs font-bold text-[#3C83F6] uppercase hover:underline">
                            View All
                        </Link>
                    </div>

                    {/* Quest 1 - Earn XP */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#D06A00]/10 flex items-center justify-center text-lg">
                            ⚡
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-[#1A1C1E] dark:text-white">Earn 50 XP</span>
                                <span className="text-xs text-[#75777F]">30/50</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-[#2A2D35] rounded-full mt-1.5 overflow-hidden">
                                <div className="h-full bg-[#D06A00] rounded-full" style={{ width: "60%" }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Quest 2 - Speak */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#3C83F6]/10 flex items-center justify-center text-lg">
                            🗣️
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-[#1A1C1E] dark:text-white">Speak 5 phrases</span>
                                <span className="text-xs text-[#75777F]">1/5</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-[#2A2D35] rounded-full mt-1.5 overflow-hidden">
                                <div className="h-full bg-[#3C83F6] rounded-full" style={{ width: "20%" }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard Snippet */}
                <div className="bg-white dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-2xl p-5">
                    <h3 className="font-bold text-[#1A1C1E] dark:text-white mb-4">Silver League</h3>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#2A2D35] flex items-center justify-center text-sm">
                                👤
                            </div>
                            <span className="flex-1 text-sm text-[#1A1C1E] dark:text-gray-300">David</span>
                            <span className="text-sm font-bold text-[#1A1C1E] dark:text-white">1200 XP</span>
                        </div>
                        <div className="flex items-center gap-3 bg-[#3C83F6]/5 dark:bg-[#3C83F6]/10 -mx-2 px-2 py-2 rounded-xl">
                            <div className="w-9 h-9 rounded-full bg-[#3C83F6] flex items-center justify-center text-sm text-white">
                                👤
                            </div>
                            <span className="flex-1 text-sm font-bold text-[#3C83F6]">You</span>
                            <span className="text-sm font-bold text-[#1A1C1E] dark:text-white">{userXp} XP</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#2A2D35] flex items-center justify-center text-sm">
                                👤
                            </div>
                            <span className="flex-1 text-sm text-[#1A1C1E] dark:text-gray-300">Sarah</span>
                            <span className="text-sm font-bold text-[#1A1C1E] dark:text-white">850 XP</span>
                        </div>
                    </div>
                </div>

                {/* Super Lingua Promo */}
                <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-6 text-center">
                    <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 text-lg">
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
