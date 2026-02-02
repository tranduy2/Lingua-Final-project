"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xl">☀️</span>
            </button>
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <span className="text-xl">{isDark ? "☀️" : "🌙"}</span>
        </button>
    );
}
