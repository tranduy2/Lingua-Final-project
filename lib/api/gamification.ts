import { createClient } from "@/lib/client";

/**
 * Saves XP to the user's profile after completing a lesson.
 * Also updates the daily streak.
 */
export async function saveXpToProfile(userId: string, xpEarned: number) {
    const supabase = createClient();

    // Get current profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp, current_streak, last_active_date")
        .eq("id", userId)
        .single();

    if (!profile) return;

    const today = new Date().toISOString().split("T")[0];
    const lastActive = profile.last_active_date || "";

    // Calculate streak
    let newStreak = profile.current_streak || 0;
    if (lastActive === today) {
        // Already active today, no streak change
    } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastActive === yesterdayStr) {
            // Continue streak
            newStreak += 1;
        } else {
            // Streak broken or first time
            newStreak = 1;
        }
    }

    // Calculate level from XP (every 200 XP = level up)
    const newTotalXp = (profile.total_xp || 0) + xpEarned;
    const levelThresholds = [
        { xp: 0, level: "A1" },
        { xp: 200, level: "A2" },
        { xp: 500, level: "B1" },
        { xp: 1000, level: "B2" },
        { xp: 2000, level: "C1" },
        { xp: 4000, level: "C2" },
    ];
    let newLevel = "A1";
    for (const t of levelThresholds) {
        if (newTotalXp >= t.xp) newLevel = t.level;
    }

    // Update profile
    await supabase
        .from("profiles")
        .update({
            total_xp: newTotalXp,
            current_streak: newStreak,
            current_level: newLevel,
            last_active_date: today,
        })
        .eq("id", userId);

    return { newTotalXp, newStreak, newLevel };
}

/**
 * Returns XP thresholds for a given level.
 */
export function getLevelInfo(totalXp: number) {
    const levels = [
        { level: "A1", minXp: 0, maxXp: 200 },
        { level: "A2", minXp: 200, maxXp: 500 },
        { level: "B1", minXp: 500, maxXp: 1000 },
        { level: "B2", minXp: 1000, maxXp: 2000 },
        { level: "C1", minXp: 2000, maxXp: 4000 },
        { level: "C2", minXp: 4000, maxXp: 10000 },
    ];

    let current = levels[0];
    for (const l of levels) {
        if (totalXp >= l.minXp) current = l;
    }

    const xpInLevel = totalXp - current.minXp;
    const xpNeeded = current.maxXp - current.minXp;
    const progress = Math.min((xpInLevel / xpNeeded) * 100, 100);

    return { level: current.level, xpInLevel, xpNeeded, progress };
}
