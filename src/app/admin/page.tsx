import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { createClient } from "@/lib/server";

interface StatCard {
    label: string;
    value: string;
    icon: string;
    change: string;
    changeColor: string;
    iconBg: string;
}

interface RecentActivityRow {
    name: string;
    action: string;
    exerciseId: string;
    time: string;
    status: string;
    statusColor: string;
}

interface GrammarErrorRow {
    name: string;
    value: number;
}

function getDisplayName(row: { display_name?: string | null; name?: string | null; id: string }) {
    return row.display_name || row.name || "Learner";
}

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function getRelativeTime(dateString: string) {
    if (!dateString) return "Unknown";

    try {
        return `${formatDistanceToNow(new Date(dateString), { addSuffix: true })}`;
    } catch {
        return "Unknown";
    }
}

function getActivityStatus(dateString: string) {
    if (!dateString) {
        return {
            label: "Active",
            color: "text-green-500 bg-green-50 dark:bg-green-900/20",
        };
    }

    const ageInHours = (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60);

    if (ageInHours <= 24) {
        return {
            label: "Active",
            color: "text-[#3C83F6] bg-[#3C83F6]/10",
        };
    }

    if (ageInHours <= 72) {
        return {
            label: "Review",
            color: "text-[#D06A00] bg-[#D06A00]/10",
        };
    }

    return {
        label: "Success",
        color: "text-green-500 bg-green-50 dark:bg-green-900/20",
    };
}

function getBarHeightClass(value: number) {
    if (value >= 90) return "h-[90%]";
    if (value >= 80) return "h-[80%]";
    if (value >= 70) return "h-[70%]";
    if (value >= 60) return "h-[60%]";
    if (value >= 50) return "h-[50%]";
    if (value >= 40) return "h-[40%]";
    if (value >= 30) return "h-[30%]";
    if (value >= 20) return "h-[20%]";
    if (value >= 10) return "h-[10%]";

    return "h-[6%]";
}

export default async function AdminPage() {
    const supabase = await createClient();

    let stats = { users: 0, exercises: 0, rules: 0, activeSessions: 0 };
    let errorCategories: GrammarErrorRow[] = [];
    let recentActivity: RecentActivityRow[] = [];

    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [usersCountRes, activeSessionsRes, exercisesCountRes, rulesCountRes] = await Promise.all([
            supabase.from("profiles").select("id", { count: "exact", head: true }),
            supabase
                .from("profiles")
                .select("id", { count: "exact", head: true })
                .gte("last_active_date", sevenDaysAgo.toISOString().slice(0, 10)),
            supabase.from("exercises").select("id", { count: "exact", head: true }),
            supabase.from("grammar_rules").select("id", { count: "exact", head: true }),
        ]);

        stats = {
            users: usersCountRes.count || 0,
            exercises: exercisesCountRes.count || 0,
            rules: rulesCountRes.count || 0,
            activeSessions: activeSessionsRes.count || 0,
        };
    } catch (error) {
        console.error("Failed to load admin statistics:", error);
    }

    try {
        const { data } = await supabase
            .from("profiles")
            .select("id, name, display_name, created_at, updated_at, last_active_date")
            .order("updated_at", { ascending: false, nullsFirst: false })
            .order("created_at", { ascending: false, nullsFirst: false })
            .limit(10);

        const sorted = (data || [])
            .map((row) => {
                const activityDate = row.updated_at || row.last_active_date || row.created_at || "";
                const displayName = getDisplayName(row);
                const status = getActivityStatus(activityDate);

                return {
                    name: displayName,
                    action: row.created_at && row.updated_at && row.created_at === row.updated_at ? "Created Profile" : "Updated Profile",
                    exerciseId: `USR-${String(row.id).slice(0, 8).toUpperCase()}`,
                    time: getRelativeTime(activityDate),
                    status: status.label,
                    statusColor: status.color,
                    sortDate: activityDate,
                };
            })
            .sort((a, b) => {
                const aTime = new Date(a.sortDate || 0).getTime();
                const bTime = new Date(b.sortDate || 0).getTime();
                return bTime - aTime;
            })
            .slice(0, 5);

        recentActivity = sorted;
    } catch (error) {
        console.error("Failed to load recent activity:", error);
    }

    try {
        const { data } = await supabase
            .from("user_weaknesses")
            .select(
                `
                    error_count,
                    grammar_rules ( title, category )
                `,
            )
            .order("error_count", { ascending: false })
            .limit(6);

        errorCategories =
            data?.map((item: any) => {
                const rule = Array.isArray(item.grammar_rules) ? item.grammar_rules[0] : item.grammar_rules;

                return {
                    name: rule?.title || rule?.category || "Unknown",
                    value: Math.min(Math.max(item.error_count || 0, 0), 100),
                };
            }) || [];
    } catch (error) {
        console.error("Failed to load grammar errors:", error);
    }

    const statCards: StatCard[] = [
        {
            label: "Total Users",
            value: stats.users.toLocaleString(),
            icon: "👥",
            change: "Live count from profiles",
            changeColor: "text-green-500",
            iconBg: "bg-[#3C83F6]/10",
        },
        {
            label: "Total Exercises",
            value: stats.exercises.toLocaleString(),
            icon: "📋",
            change: `+ ${stats.exercises || 0} tracked exercises`,
            changeColor: "text-[#3C83F6]",
            iconBg: "bg-[#3C83F6]/10",
        },
        {
            label: "Active Sessions",
            value: stats.activeSessions.toLocaleString(),
            icon: "🔔",
            change: "Active in last 7 days",
            changeColor: "text-green-500",
            iconBg: "bg-[#D06A00]/10",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                {statCards.map((card) => (
                    <div key={card.label} className="bg-white dark:bg-[#111C2E] border border-[#D4D6DB] dark:border-[#1E3050] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-[#75777F] font-medium">{card.label}</span>
                            <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center text-lg`}>{card.icon}</div>
                        </div>
                        <p className="text-3xl font-bold text-[#1A1C1E] dark:text-white mb-2">{card.value}</p>
                        <p className={`text-xs ${card.changeColor} font-medium`}>📈 {card.change}</p>
                    </div>
                ))}
            </div>

            {/* Grammar Errors Chart + System Status */}
            <div className="grid md:grid-cols-[1fr_300px] gap-4">
                {/* Most Common Grammar Errors */}
                <div className="bg-white dark:bg-[#111C2E] border border-[#D4D6DB] dark:border-[#1E3050] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h2 className="text-lg font-bold text-[#1A1C1E] dark:text-white">Most Common Grammar Errors</h2>
                            <p className="text-sm text-[#75777F]">Frequency by error type (Last 7 Days)</p>
                        </div>
                        <Link
                            href="/statistics"
                            className="px-4 py-1.5 border border-[#D4D6DB] dark:border-[#1E3050] rounded-lg text-sm text-[#1A1C1E] dark:text-white hover:bg-[#F0F2F5] dark:hover:bg-[#1B2840]"
                        >
                            View Report
                        </Link>
                    </div>

                    {/* Bar chart */}
                    {errorCategories.length > 0 ? (
                        <>
                            <div className="flex items-end justify-between gap-3 h-48 mt-6 mb-4 px-2">
                                {errorCategories.map((cat) => (
                                    <div key={cat.name} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full relative h-40">
                                            <div
                                                className={`absolute bottom-0 w-full bg-[#3C83F6]/80 dark:bg-[#3C83F6]/60 rounded-t-md transition-all ${getBarHeightClass(cat.value)}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between px-2">
                                {errorCategories.map((cat) => (
                                    <span key={cat.name} className="text-xs text-[#75777F] text-center flex-1">{cat.name}</span>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-48 text-sm text-[#75777F]">
                            No grammar error data yet.
                        </div>
                    )}
                </div>

                {/* System Status */}
                <div className="bg-white dark:bg-[#111C2E] border border-[#D4D6DB] dark:border-[#1E3050] rounded-2xl p-6 space-y-6">
                    <h2 className="text-lg font-bold text-[#1A1C1E] dark:text-white">System Status</h2>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-4 border-green-400 flex items-center justify-center">
                            <span className="text-lg font-bold text-green-500">98%</span>
                        </div>
                        <div>
                            <p className="font-semibold text-[#1A1C1E] dark:text-white">System Uptime</p>
                            <p className="text-sm text-[#75777F]">All systems operational</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-[#1A1C1E] dark:text-white mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link
                                href="/admin/exercises"
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#3C83F6] text-white rounded-xl text-sm font-semibold hover:bg-[#2B6FE0] transition-colors"
                            >
                                ➕ Create New Exercise
                            </Link>
                            <Link
                                href="/admin/curriculum"
                                className="flex items-center justify-center gap-2 w-full py-2.5 border border-[#D4D6DB] dark:border-[#1E3050] rounded-xl text-sm font-medium text-[#1A1C1E] dark:text-white hover:bg-[#F0F2F5] dark:hover:bg-[#1B2840]"
                            >
                                📤 Import Content
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent User Activity */}
            <div className="bg-white dark:bg-[#111C2E] border border-[#D4D6DB] dark:border-[#1E3050] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#1A1C1E] dark:text-white">Recent User Activity</h2>
                    <Link href="/admin" className="text-sm font-bold text-[#3C83F6] cursor-pointer hover:underline">
                        View All →
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#D4D6DB] dark:border-[#1E3050]">
                                <th className="text-left text-xs font-bold text-[#75777F] uppercase tracking-wider py-3 pr-4">User</th>
                                <th className="text-left text-xs font-bold text-[#75777F] uppercase tracking-wider py-3 pr-4">Action</th>
                                <th className="text-left text-xs font-bold text-[#75777F] uppercase tracking-wider py-3 pr-4">Exercise ID</th>
                                <th className="text-left text-xs font-bold text-[#75777F] uppercase tracking-wider py-3 pr-4">Time</th>
                                <th className="text-left text-xs font-bold text-[#75777F] uppercase tracking-wider py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.length > 0 ? (
                                recentActivity.map((row, i) => (
                                    <tr key={i} className="border-b border-[#D4D6DB]/50 dark:border-[#1E3050]/50 last:border-0">
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3C83F6] to-[#6277A4] flex items-center justify-center text-white font-bold text-xs">
                                                    {getInitials(row.name)}
                                                </div>
                                                <span className="font-medium text-sm text-[#1A1C1E] dark:text-white">{row.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 pr-4 text-sm text-[#75777F]">{row.action}</td>
                                        <td className="py-4 pr-4">
                                            <span className="px-2.5 py-1 bg-[#F0F2F5] dark:bg-[#1B2840] rounded-md text-xs font-mono text-[#1A1C1E] dark:text-gray-300">
                                                {row.exerciseId}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4 text-sm text-[#75777F]">{row.time}</td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${row.statusColor}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="border-b border-[#D4D6DB]/50 dark:border-[#1E3050]/50 last:border-0">
                                    <td colSpan={5} className="py-8 text-center text-sm text-[#75777F]">
                                        No recent activity.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
