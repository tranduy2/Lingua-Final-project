"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";

interface UserProfile {
    email: string;
    name: string;
    totalXp: number;
    streak: number;
    level: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Get profile data
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("display_name, total_xp, current_streak, current_level")
                    .eq("id", user.id)
                    .single();

                setProfile({
                    email: user.email || "",
                    name: profileData?.display_name || user.user_metadata?.display_name || "Learner",
                    totalXp: profileData?.total_xp || 0,
                    streak: profileData?.current_streak || 0,
                    level: profileData?.current_level || "A1",
                });
            }
            setLoading(false);
        }

        loadProfile();
    }, []);

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile</h1>

            {/* User Info Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                        {profile?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{profile?.name}</h2>
                        <p className="text-gray-600 dark:text-gray-400">{profile?.email}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center py-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.totalXp}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total XP</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.streak}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Day Streak</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.level}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Level</p>
                    </div>
                </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Account</h3>
                <button
                    onClick={handleLogout}
                    className="w-full py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
