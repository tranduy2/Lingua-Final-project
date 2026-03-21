"use client";

interface StreakCalendarProps {
    currentStreak: number;
    lastActiveDate: string; // ISO date string
}

/**
 * Weekly streak calendar showing 7 days with fire icons for active days.
 */
export function StreakCalendar({ currentStreak, lastActiveDate }: StreakCalendarProps) {
    const today = new Date();
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Build 7-day view (current week)
    const todayDayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const mondayOffset = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - mondayOffset + i);
        const dateStr = date.toISOString().split("T")[0];
        const isToday = dateStr === today.toISOString().split("T")[0];
        const isPast = date <= today;

        // Simple heuristic: mark days as active based on streak count
        // counting back from last active date
        let isActive = false;
        if (lastActiveDate && currentStreak > 0) {
            const lastActive = new Date(lastActiveDate);
            const diff = Math.floor((lastActive.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            if (diff >= 0 && diff < currentStreak) {
                isActive = true;
            }
        }

        return { day: days[i], dateStr, isToday, isPast, isActive };
    });

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🔥</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{currentStreak}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">day streak</span>
            </div>
            <div className="flex gap-2">
                {weekDays.map((d) => (
                    <div key={d.dateStr} className="flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{d.day}</span>
                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
                                d.isActive
                                    ? "bg-orange-500 text-white"
                                    : d.isToday
                                    ? "bg-gray-200 dark:bg-gray-700 ring-2 ring-blue-500 text-gray-600 dark:text-gray-300"
                                    : d.isPast
                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                    : "bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600"
                            }`}
                        >
                            {d.isActive ? "🔥" : ""}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
