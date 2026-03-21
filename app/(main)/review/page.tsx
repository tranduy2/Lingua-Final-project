"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/client";

interface WeaknessItem {
  id: string;
  error_count: number;
  last_tested_at: string;
  grammar_rule: {
    id: string;
    title: string;
    explanation: string;
    category: string;
  } | null;
}

export default function SmartReviewPage() {
  const [weaknesses, setWeaknesses] = useState<WeaknessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeaknesses() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_weaknesses")
        .select(`
          id,
          error_count,
          last_tested_at,
          grammar_rules (
            id,
            title,
            explanation,
            category
          )
        `)
        .eq("user_id", user.id)
        .order("error_count", { ascending: false });

      if (data) {
        // Normalize: Supabase may return the join as array or object
        const normalized: WeaknessItem[] = data
          .map((w: any) => ({
            ...w,
            grammar_rule: Array.isArray(w.grammar_rules)
              ? w.grammar_rules[0] || null
              : w.grammar_rules || null,
          }))
          .filter((w: WeaknessItem) => w.grammar_rule !== null);
        setWeaknesses(normalized);
      }

      setLoading(false);
    }

    fetchWeaknesses();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">🧠</span>
        <h1 className="text-2xl font-bold text-foreground">Smart Review</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Focus on the grammar rules you struggle with the most.
      </p>

      {weaknesses.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-xl font-bold text-foreground mb-2">No weaknesses found!</h2>
          <p className="text-muted-foreground mb-6">
            Complete some lessons first. Wrong answers will appear here for review.
          </p>
          <Link
            href="/learn"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90"
          >
            Go to Lessons
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {weaknesses.map((item) => {
            const rule = item.grammar_rule;
            if (!rule) return null;
            const isExpanded = expandedId === item.id;
            const severity =
              item.error_count >= 5 ? "high" : item.error_count >= 3 ? "medium" : "low";

            return (
              <div
                key={item.id}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Header - clickable */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-4 text-left flex items-center gap-4 hover:bg-muted/30 transition-colors"
                >
                  {/* Severity indicator */}
                  <div
                    className={`w-2 h-12 rounded-full flex-shrink-0 ${
                      severity === "high"
                        ? "bg-red-500"
                        : severity === "medium"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  ></div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{rule.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded capitalize">
                        {rule.category}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          severity === "high"
                            ? "text-red-500"
                            : severity === "medium"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-blue-500"
                        }`}
                      >
                        {item.error_count} error{item.error_count > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <span className="text-muted-foreground text-lg flex-shrink-0">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 ml-6 border-t border-border">
                    <div className="pt-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        📖 Explanation
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {rule.explanation}
                      </p>
                      <p className="text-xs text-muted-foreground mt-3">
                        Last tested:{" "}
                        {new Date(item.last_tested_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
