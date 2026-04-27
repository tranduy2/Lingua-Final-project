"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/client";
import { getLevelInfo } from "@/lib/api/gamification";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface ProfileData {
    totalXp: number;
    streak: number;
    level: string;
    createdAt: string;
}

interface WeaknessData {
    rule: string;
    count: number;
    category?: string;
    lastTested?: string;
}

interface GrammarMastery {
    category: string;
    total: number;
    errors: number;
    mastery: number; // 0-100
}

// Colors for pie chart
const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b", "#10b981", "#ec4899"];

export default function StatisticsPage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [weaknesses, setWeaknesses] = useState<WeaknessData[]>([]);
    const [grammarMastery, setGrammarMastery] = useState<GrammarMastery[]>([]);
    const [loading, setLoading] = useState(true);

    // Simulated weekly XP data (in a real app, you'd track daily XP in a separate table)
    const [weeklyXp, setWeeklyXp] = useState<{ day: string; xp: number }[]>([]);

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            // Fetch profile
            const { data: prof } = await supabase
                .from("profiles")
                .select("total_xp, current_streak, current_level, created_at")
                .eq("id", user.id)
                .single();

            if (prof) {
                setProfile({
                    totalXp: prof.total_xp || 0,
                    streak: prof.current_streak || 0,
                    level: prof.current_level || "A1",
                    createdAt: prof.created_at || "",
                });

                // Get actual weekly XP data for the last 7 days
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

                const { data: dailyActivity } = await supabase
                    .from("user_daily_activity")
                    .select("activity_date, xp_earned")
                    .eq("user_id", user.id)
                    .gte("activity_date", sevenDaysAgo.toISOString().split("T")[0])
                    .order("activity_date", { ascending: true });

                const daysMap = new Map();
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split("T")[0];
                    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
                    daysMap.set(dateStr, { day: dayName, xp: 0 });
                }

                if (dailyActivity) {
                    dailyActivity.forEach((act: any) => {
                        if (daysMap.has(act.activity_date)) {
                            daysMap.get(act.activity_date).xp += act.xp_earned || 0;
                        }
                    });
                }

                setWeeklyXp(Array.from(daysMap.values()));
            }

            // Fetch user weaknesses with grammar rule names + categories
            const { data: weakData } = await supabase
                .from("user_weaknesses")
                .select(`
                    error_count,
                    last_tested_at,
                    grammar_rules ( title, category )
                `)
                .eq("user_id", user.id)
                .order("error_count", { ascending: false })
                .limit(10);

            if (weakData) {
                const mapped: WeaknessData[] = weakData
                    .map((w: any) => {
                        const gr = Array.isArray(w.grammar_rules)
                            ? w.grammar_rules[0]
                            : w.grammar_rules;
                        return {
                            rule: gr?.title || "Unknown",
                            count: w.error_count || 0,
                            category: gr?.category || "other",
                            lastTested: w.last_tested_at || "",
                        };
                    })
                    .filter((w: WeaknessData) => w.rule !== "Unknown");
                setWeaknesses(mapped);
            }

            // Fetch all grammar rules for mastery heatmap
            const { data: allRules } = await supabase
                .from("grammar_rules")
                .select("id, category");

            if (allRules && weakData) {
                // Group by category
                const categoryMap: Record<string, { total: number; errors: number }> = {};
                for (const rule of allRules) {
                    const cat = rule.category || "other";
                    if (!categoryMap[cat]) categoryMap[cat] = { total: 0, errors: 0 };
                    categoryMap[cat].total += 1;
                }
                // Count errors per category
                for (const w of weakData as any[]) {
                    const gr = Array.isArray(w.grammar_rules)
                        ? w.grammar_rules[0]
                        : w.grammar_rules;
                    const cat = gr?.category || "other";
                    if (categoryMap[cat]) {
                        categoryMap[cat].errors += w.error_count || 0;
                    }
                }
                // Calculate mastery (fewer errors = higher mastery)
                const masteryArr: GrammarMastery[] = Object.entries(categoryMap).map(
                    ([category, data]) => {
                        const maxPossibleErrors = data.total * 5; // assume 5 is max errors per rule
                        const mastery = Math.max(0, Math.round(
                            (1 - data.errors / Math.max(maxPossibleErrors, 1)) * 100
                        ));
                        return { category, total: data.total, errors: data.errors, mastery };
                    }
                );
                setGrammarMastery(masteryArr.sort((a, b) => a.mastery - b.mastery));
            }

            setLoading(false);
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 dark:bg-[#2A2D35] rounded w-48"></div>
                    <div className="grid md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-gray-200 dark:bg-[#2A2D35] rounded-xl"></div>
                        ))}
                    </div>
                    <div className="h-64 bg-gray-200 dark:bg-[#2A2D35] rounded-xl"></div>
                </div>
            </div>
        );
    }

    const levelInfo = profile ? getLevelInfo(profile.totalXp) : null;

    // Level progression data for area chart
    const levelData = [
        { level: "A1", xp: 0 },
        { level: "A2", xp: 200 },
        { level: "B1", xp: 500 },
        { level: "B2", xp: 1000 },
        { level: "C1", xp: 2000 },
        { level: "C2", xp: 4000 },
    ];
    const currentLevelIndex = levelData.findIndex((l) => l.level === profile?.level);
    const progressData = levelData.map((l, i) => ({
        ...l,
        your: i <= currentLevelIndex ? profile?.totalXp || 0 : null,
        required: l.xp,
    }));

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">📊</span>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistics</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
                Track your learning progress and identify areas for improvement.
            </p>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total XP</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{(profile?.totalXp || 0).toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-1 text-green-500 text-xs font-medium">
                        <span>⚡</span> Keep going!
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Level</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.level || "A1"}</p>
                    {levelInfo && (
                        <div className="mt-2 h-1.5 bg-gray-200 dark:bg-[#2A2D35] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{ width: `${levelInfo.progress}%` }}
                            ></div>
                        </div>
                    )}
                </div>
                <div className="bg-white dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Day Streak</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.streak || 0}</p>
                    <div className="mt-2 text-orange-500 text-xs font-medium">🔥 days in a row</div>
                </div>
                <div className="bg-white dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Weak Areas</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{weaknesses.length}</p>
                    <Link href="/review" className="mt-2 text-[#3C83F6] text-xs font-medium hover:underline block">
                        🧠 Review now →
                    </Link>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Weekly XP Bar Chart */}
                <div className="bg-white dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-2xl p-6">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4">📈 Weekly XP Activity</h2>
                    {weeklyXp.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={weeklyXp} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--color-bg, #1f2937)",
                                        border: "1px solid #374151",
                                        borderRadius: "8px",
                                        color: "#fff",
                                        fontSize: "13px",
                                    }}
                                    formatter={(value: number) => [`${value} XP`, "Earned"]}
                                />
                                <Bar dataKey="xp" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[220px] flex items-center justify-center text-gray-400">
                            No activity data yet
                        </div>
                    )}
                </div>

                {/* Level Progression Area Chart */}
                <div className="bg-white dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-2xl p-6">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4">🎯 Level Progression</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                            <XAxis dataKey="level" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--color-bg, #1f2937)",
                                    border: "1px solid #374151",
                                    borderRadius: "8px",
                                    color: "#fff",
                                    fontSize: "13px",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="required"
                                stroke="#374151"
                                fill="#374151"
                                fillOpacity={0.1}
                                name="XP Required"
                            />
                            <Area
                                type="monotone"
                                dataKey="your"
                                stroke="#3b82f6"
                                fill="url(#areaGradient)"
                                fillOpacity={0.3}
                                name="Your XP"
                                connectNulls={false}
                            />
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Error Distribution Pie Chart */}
            {weaknesses.length > 0 && (
                <div className="bg-white dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-2xl p-6 mb-8">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4">🔴 Error Distribution by Grammar Rule</h2>
                    <div className="grid md:grid-cols-2 items-center gap-6">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={weaknesses}
                                    dataKey="count"
                                    nameKey="rule"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    innerRadius={50}
                                    paddingAngle={3}
                                    label={({ rule, percent }) =>
                                        `${rule?.substring(0, 15)}${rule?.length > 15 ? "…" : ""} (${(percent * 100).toFixed(0)}%)`
                                    }
                                    labelLine={{ stroke: "#9ca3af" }}
                                >
                                    {weaknesses.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--color-bg, #1f2937)",
                                        border: "1px solid #374151",
                                        borderRadius: "8px",
                                        color: "#fff",
                                        fontSize: "13px",
                                    }}
                                    formatter={(value: number) => [`${value} errors`, "Count"]}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Legend list */}
                        <div className="space-y-3">
                            {weaknesses.map((w, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                                    ></div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                                        {w.rule}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {w.count} errors
                                    </span>
                                </div>
                            ))}
                            <Link
                                href="/review"
                                className="inline-flex items-center gap-1 text-sm text-[#3C83F6] font-medium hover:underline mt-2"
                            >
                                🧠 Practice weak areas →
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* 9.3 Grammar Mastery Heatmap */}
            {grammarMastery.length > 0 && (
                <div className="bg-white dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-2xl p-6 mb-8">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-2">🟩 Grammar Mastery Heatmap</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                        How well you&apos;ve mastered each grammar category. Green = strong, Red = needs work.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {grammarMastery.map((gm) => {
                            const hue = (gm.mastery / 100) * 120; // 0=red, 120=green
                            const bg = `hsl(${hue}, 70%, ${gm.mastery > 80 ? '40%' : gm.mastery > 50 ? '45%' : '45%'})`;
                            const lightBg = `hsl(${hue}, 60%, 92%)`;
                            const darkBg = `hsl(${hue}, 50%, 20%)`;

                            return (
                                <div
                                    key={gm.category}
                                    className="relative rounded-xl p-4 border border-[#D4D6DB] dark:border-[#2E3039] overflow-hidden"
                                >
                                    {/* Background fill based on mastery */}
                                    <div
                                        className="absolute inset-0 opacity-20 dark:opacity-30"
                                        style={{ backgroundColor: bg }}
                                    />
                                    <div className="relative">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize truncate">
                                            {gm.category}
                                        </p>
                                        <div className="flex items-end justify-between mt-2">
                                            <span
                                                className="text-2xl font-bold"
                                                style={{ color: bg }}
                                            >
                                                {gm.mastery}%
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {gm.errors} err / {gm.total} rules
                                            </span>
                                        </div>
                                        {/* Mini bar */}
                                        <div className="h-1.5 bg-gray-200 dark:bg-[#2A2D35] rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{ width: `${gm.mastery}%`, backgroundColor: bg }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 9.4 Error Frequency Analysis */}
            {weaknesses.length > 0 && (
                <div className="bg-white dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-2xl p-6 mb-8">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-2">📉 Error Frequency Analysis</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                        Your most common mistakes, ranked by frequency.
                    </p>
                    <div className="space-y-3">
                        {weaknesses.slice(0, 8).map((w, i) => {
                            const maxCount = weaknesses[0]?.count || 1;
                            const pct = (w.count / maxCount) * 100;
                            const severity =
                                w.count >= 5 ? "high" : w.count >= 3 ? "medium" : "low";
                            const barColor =
                                severity === "high"
                                    ? "bg-red-500"
                                    : severity === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-[#3C83F6]";
                            const dotColor =
                                severity === "high"
                                    ? "bg-red-400"
                                    : severity === "medium"
                                    ? "bg-yellow-400"
                                    : "bg-blue-400";

                            return (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {w.rule}
                                            </span>
                                            {w.category && (
                                                <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-[#2A2D35] text-gray-500 dark:text-gray-400 rounded capitalize hidden sm:inline">
                                                    {w.category}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-xs font-bold flex-shrink-0 ml-2 ${
                                            severity === "high"
                                                ? "text-red-500"
                                                : severity === "medium"
                                                ? "text-yellow-600 dark:text-yellow-400"
                                                : "text-[#3C83F6]"
                                        }`}>
                                            {w.count} error{w.count > 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-[#2A2D35] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    {w.lastTested && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Last: {new Date(w.lastTested).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric"
                                            })}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <Link
                        href="/review"
                        className="inline-flex items-center gap-1 text-sm text-[#3C83F6] font-medium hover:underline mt-4"
                    >
                        🧠 Practice these areas →
                    </Link>
                </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                <Link
                    href="/learn"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#3C83F6] text-white font-medium rounded-xl hover:bg-[#2B6FE0] transition-colors"
                >
                    📚 Continue Learning
                </Link>
                <Link
                    href="/leaderboard"
                    className="inline-flex items-center gap-2 px-5 py-3 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    🏆 Leaderboard
                </Link>
            </div>
        </div>
    );
}
