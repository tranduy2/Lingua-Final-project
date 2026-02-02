"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Lingua</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#method" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Method</a>
          <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          )}
          <Link href="/login" className="text-gray-900 dark:text-white hover:text-blue-500">Login</Link>
          <Link href="/signup" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Stop Guessing.
              <br />
              <span className="text-blue-500">Start Understanding.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
              Lingua uses a unique rule-based feedback system to teach you the <strong>why</strong> behind English grammar, not just the what.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup" className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600">
                Get Started for Free
              </Link>
              <a href="#method" className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-900 dark:text-white">
                ▶ See how it works
              </a>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white dark:border-gray-900"></div>
                <div className="w-8 h-8 rounded-full bg-blue-300 border-2 border-white dark:border-gray-900"></div>
                <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-white dark:border-gray-900"></div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Trusted by <strong>10,000+</strong> learners</span>
            </div>
          </div>

          {/* Demo Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <span className="text-red-500">✗</span>
                <span className="text-gray-900 dark:text-white">
                  <span className="line-through text-red-500">She go</span> She <span className="text-green-500 font-medium">goes</span> to the store.
                </span>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">LOGIC RULE #42</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Third-person singular subjects require verbs ending in "s" in the present simple tense.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="method" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-500 mb-2">THE METHODOLOGY</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Rule-Based Learning Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Logic-Driven Feedback</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Traditional apps tell you <em>that</em> you're wrong. Lingua explains <strong>why</strong>. Our engine analyzes the structure of your sentence and provides a detailed breakdown of the grammatical rule you missed.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 text-xl">✓</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Instant Corrections</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Get feedback the moment you finish typing.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 text-xl">✓</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Deep Understanding</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Internalize the rules so you never make the same mistake twice.</p>
                  </div>
                </div>
              </div>
              <a href="#" className="inline-flex items-center gap-1 text-blue-500 hover:underline text-sm font-medium">
                Learn more about our method →
              </a>
            </div>

            {/* Right Columns - Feature Cards */}
            <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-3">✨</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Real-time Analysis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instant feedback as you type complex sentences, powered by our custom syntax engine.</p>
              </div>
              <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-3">🌳</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Grammar Logic Trees</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Visualize how sentence structures connect. See the skeleton of the language.</p>
              </div>
              <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-3">📈</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Visual Progress</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Watch your mastery grow across 12 distinct grammar categories with clear charts.</p>
              </div>
              <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-3">👥</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Expert Curated</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Exercises designed by linguists to target common pain points for learners.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Simple 3-Step Process</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Write</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Practice with daily prompts or free-write your own thoughts.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analyze</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Our engine breaks down your sentence structure instantly.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Master</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Review the logic rules and track your improvement over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to master English grammar?
          </h2>
          <p className="text-blue-100 mb-8">
            Join thousands of learners using the logic-based approach today. No credit card required.
          </p>
          <Link href="/signup" className="inline-flex px-8 py-3 bg-white text-blue-500 font-medium rounded-lg hover:bg-gray-100">
            Get Started for Free
          </Link>
          <p className="text-blue-200 text-sm mt-4">Free 14-day trial • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Lingua</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">Privacy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">Terms</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">Twitter</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">Instagram</a>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2026 Lingua Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
