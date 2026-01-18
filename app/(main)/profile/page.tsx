"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { User, Loader2 } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [displayName, setDisplayName] = useState("");

    useEffect(() => {
        async function loadProfile() {
            const supabase = createClient();

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            // Get profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (profile) {
                setProfile(profile);
                setDisplayName(profile.display_name || "");
            }
            setLoading(false);
        }

        loadProfile();
    }, [router]);

    async function handleSave() {
        setSaving(true);
        const supabase = createClient();

        await supabase
            .from("profiles")
            .update({ display_name: displayName })
            .eq("id", user.id);

        setSaving(false);
    }

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Profile</h1>

            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium">{displayName || "User"}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                </div>

                {/* Form */}
                <div>
                    <label className="block text-sm font-medium mb-1">Display Name</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-border">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{profile?.total_xp || 0}</p>
                        <p className="text-sm text-muted-foreground">Total XP</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-orange-500">{profile?.current_streak || 0}</p>
                        <p className="text-sm text-muted-foreground">Day Streak</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">{profile?.current_level || "A1"}</p>
                        <p className="text-sm text-muted-foreground">Level</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 h-10 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="h-10 px-4 border border-border rounded-lg hover:bg-muted"
                    >
                        Log out
                    </button>
                </div>
            </div>
        </div>
    );
}
