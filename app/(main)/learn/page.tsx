"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/client";

// Simple interfaces
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

export default function LearnPage() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUnits() {
            const supabase = createClient();

            const { data, error } = await supabase
                .from("units")
                .select(`
          id,
          title,
          description,
          cefr_level,
          order_index,
          lessons (
            id,
            title,
            order_index,
            xp_reward
          )
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
            setLoading(false);
        }

        fetchUnits();
    }, []);

    // Loading skeleton
    if (loading) {
        return (
            <div className="max-w-xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-4 pt-6">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                                </div>
                            </div>
                            <div className="flex justify-center gap-6 pl-6">
                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                            </div>
                        </div>
                    ))}
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
        <div className="max-w-xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Learning Path</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Master English step by step</p>

            {/* Units with Duolingo-style lesson nodes */}
            <div className="space-y-12">
                {units.map((unit, unitIndex) => (
                    <div key={unit.id} className="relative">
                        {/* Unit Header */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                {unitIndex + 1}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{unit.title}</h2>
                                    <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-medium">
                                        {unit.cefr_level}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{unit.description}</p>
                            </div>
                        </div>

                        {/* Lesson Nodes - Duolingo style path */}
                        <div className="relative ml-6">
                            {/* Connecting line */}
                            {unit.lessons.length > 1 && (
                                <div
                                    className="absolute left-8 top-8 w-1 bg-gray-200 dark:bg-gray-700 rounded-full"
                                    style={{ height: `calc(100% - 4rem)` }}
                                ></div>
                            )}

                            <div className="space-y-6">
                                {unit.lessons.map((lesson, lessonIndex) => (
                                    <div key={lesson.id} className="relative flex items-center gap-4">
                                        {/* Circular lesson button */}
                                        <Link
                                            href={`/lesson/${lesson.id}`}
                                            className="relative z-10 w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-lg transition-all hover:scale-110 hover:shadow-xl"
                                        >
                                            {lessonIndex + 1}
                                        </Link>

                                        {/* Lesson info */}
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">{lesson.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">+{lesson.xp_reward} XP</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress indicator at bottom */}
            <div className="mt-12 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Overall Progress</span>
                    <span className="text-sm text-blue-500">0%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-0"></div>
                </div>
            </div>
        </div>
    );
}
