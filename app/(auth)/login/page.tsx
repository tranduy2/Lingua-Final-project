"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/learn");
            router.refresh();
        }
    }

    return (
        <div className="w-full max-w-lg">
            {/* Top Nav */}
            <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10">
                <Link href="/" className="text-2xl font-bold italic text-blue-600">
                    Lingua
                </Link>
                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600"
                    >
                        Login
                    </Link>
                    <Link
                        href="/signup"
                        className="text-sm font-medium text-white bg-blue-600 px-5 py-2 rounded-full hover:bg-blue-700 transition-colors"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 sm:p-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-1">
                    Welcome Back
                </h1>
                <p className="text-center text-blue-500 mb-8">
                    Continue your language journey today.
                </p>

                {/* Google OAuth Button */}
                <button
                    type="button"
                    onClick={async () => {
                        const supabase = createClient();
                        await supabase.auth.signInWithOAuth({
                            provider: "google",
                            options: {
                                redirectTo: `${window.location.origin}/auth/callback`,
                            },
                        });
                    }}
                    className="w-full h-12 flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-4 bg-white dark:bg-gray-900 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                            Or Email
                        </span>
                    </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                            className="w-full h-12 px-4 rounded-xl border-0 bg-blue-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label htmlFor="password" className="text-sm font-semibold text-gray-900 dark:text-white">
                                Password
                            </label>
                            <Link href="/forgot-password" className="text-sm font-medium text-blue-500 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full h-12 px-4 pr-12 rounded-xl border-0 bg-blue-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-500/25"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Logging in...
                            </>
                        ) : (
                            "Login to Lingua"
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="text-blue-500 font-semibold hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>

            {/* Card footer links */}
            <div className="flex justify-center gap-6 mt-6">
                <Link href="#" className="text-sm text-gray-400 hover:text-gray-600">Privacy Policy</Link>
                <Link href="#" className="text-sm text-gray-400 hover:text-gray-600">Terms of Service</Link>
                <Link href="#" className="text-sm text-gray-400 hover:text-gray-600">Help Center</Link>
            </div>
        </div>
    );
}
