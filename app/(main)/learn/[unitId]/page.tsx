"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/client";

interface Lesson {
    id: string;
    title: string;
    order_index: number;
    xp_reward: number;
    estimated_minutes: number;
}

interface Unit {
    id: string;
    title: string;
    description: string;
    cefr_level?: string;
}

export default function UnitDetailPage() {
    const params = useParams();
    const unitId = params.unitId as string;

    const [unit, setUnit] = useState<Unit | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient();

            // Fetch unit details
            const { data: unitData } = await supabase
                .from("units")
                .select("id, title, description")
                .eq("id", unitId)
                .single();

            if (unitData) {
                setUnit(unitData);
            }

            // Fetch lessons for this unit
            const { data: lessonsData } = await supabase
                .from("lessons")
                .select("id, title, order_index, xp_reward, estimated_minutes")
                .eq("unit_id", unitId)
                .order("order_index");

            if (lessonsData) {
                setLessons(lessonsData);
            }

            setLoading(false);
        }

        fetchData();
    }, [unitId]);

    if (loading) {
        return (
            <div className="max-w-xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                    <div className="space-y-3 pt-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!unit) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unit not found</h1>
                <Link href="/learn" className="text-blue-500 hover:underline">Back to Learning Path</Link>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            {/* Back link */}
            <Link
                href="/learn"
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
            >
                ← Back to Learning Path
            </Link>

            {/* Unit header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{unit.title}</h1>
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-medium">
                        {unit.cefr_level || "N/A"}
                    </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{unit.description}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-900 dark:text-white font-medium">Unit Progress</span>
                    <span className="text-blue-500">0 / {lessons.length} lessons</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-0"></div>
                </div>
            </div>

            {/* Lessons list */}
            <div className="space-y-3">
                {lessons.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                        <div className="text-4xl mb-2">📝</div>
                        <p>No lessons in this unit yet</p>
                    </div>
                ) : (
                    lessons.map((lesson, index) => (
                        <Link
                            key={lesson.id}
                            href={`/lesson/${lesson.id}`}
                            className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 transition-colors"
                        >
                            {/* Lesson number */}
                            <div className="w-12 h-12 rounded-full bg-blue-500 text-white font-bold text-lg flex items-center justify-center">
                                {index + 1}
                            </div>

                            {/* Lesson info */}
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900 dark:text-white">{lesson.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <span>⏱️ {lesson.estimated_minutes || 5} min</span>
                                    <span>⚡ +{lesson.xp_reward} XP</span>
                                </div>
                            </div>

                            {/* Arrow */}
                            <span className="text-gray-400">→</span>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
