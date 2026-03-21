"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/client";
import { Loader2, Check, User, Mail, Lock } from "lucide-react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Password strength calculation
    function getPasswordStrength(): { level: number; label: string; color: string } {
        if (password.length === 0) return { level: 0, label: "", color: "" };
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 1) return { level: 1, label: "WEAK PASSWORD", color: "bg-red-500" };
        if (score <= 3) return { level: 2, label: "MEDIUM PASSWORD", color: "bg-yellow-500" };
        return { level: 3, label: "STRONG PASSWORD", color: "bg-blue-500" };
    }

    const strength = getPasswordStrength();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { display_name: name },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    }

    // Success message
    if (success) {
        return (
            <div className="w-full max-w-lg">
                <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10">
                    <Link href="/" className="text-2xl font-bold italic text-blue-600">Lingua</Link>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 sm:p-10 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <Check className="h-8 w-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        We sent a verification link to <strong className="text-gray-900 dark:text-white">{email}</strong>
                    </p>
                    <Link
                        href="/login"
                        className="inline-block w-full h-12 leading-[3rem] bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 text-center transition-colors"
                    >
                        Back to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg">
            {/* Top Nav */}
            <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10">
                <Link href="/" className="text-2xl font-bold italic text-blue-600">
                    Lingua
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                        Already have an account?
                    </span>
                    <Link
                        href="/login"
                        className="text-sm font-bold text-blue-600 hover:underline"
                    >
                        Login
                    </Link>
                </div>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-8 sm:p-10">
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-1">
                    Start Learning Today
                </h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                    Join the world&apos;s most accessible language platform.
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
                            Or Use Email
                        </span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Jane Doe"
                                required
                                className="w-full h-12 pl-11 pr-4 rounded-xl border-0 bg-blue-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="jane@example.com"
                                required
                                className="w-full h-12 pl-11 pr-4 rounded-xl border-0 bg-blue-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full h-12 pl-11 pr-4 rounded-xl border-0 bg-blue-50/50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Password strength indicator */}
                        {password.length > 0 && (
                            <div className="mt-2">
                                <div className="flex gap-1.5">
                                    {[1, 2, 3].map((bar) => (
                                        <div
                                            key={bar}
                                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                                                bar <= strength.level
                                                    ? strength.color
                                                    : "bg-gray-200 dark:bg-gray-700"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className={`text-xs font-bold mt-1 uppercase tracking-wide ${
                                    strength.level === 1
                                        ? "text-red-500"
                                        : strength.level === 2
                                        ? "text-yellow-500"
                                        : "text-blue-500"
                                }`}>
                                    {strength.label}
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-500/25"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
                    By signing up, you agree to our{" "}
                    <Link href="#" className="text-blue-500 font-semibold hover:underline">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-blue-500 font-semibold hover:underline">
                        Privacy Policy
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
}
