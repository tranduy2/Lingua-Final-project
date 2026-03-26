import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { AdminShell } from "@/components/layout/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

    // 1. Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // 2. Check if user has admin role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        redirect("/learn");
    }

    // 3. Render admin shell for authenticated admins
    return <AdminShell>{children}</AdminShell>;
}
