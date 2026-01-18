"use client";

import { X, BookOpen, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrammarCardProps {
    title: string;
    explanation: string;
    examples: string[];
    category?: string;
    cefrLevel?: string;
    onClose: () => void;
    isOpen: boolean;
}

export function GrammarCard({
    title,
    explanation,
    examples,
    category,
    cefrLevel,
    onClose,
    isOpen,
}: GrammarCardProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="grammar-card-title"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-border">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Lightbulb className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2
                                id="grammar-card-title"
                                className="text-lg font-semibold text-foreground"
                            >
                                {title}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                {cefrLevel && (
                                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
                                        {cefrLevel}
                                    </span>
                                )}
                                {category && (
                                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-muted text-muted-foreground capitalize">
                                        {category}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-muted transition-colors"
                        aria-label="Close grammar explanation"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Explanation */}
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Explanation
                        </h3>
                        <p className="text-foreground leading-relaxed">{explanation}</p>
                    </div>

                    {/* Examples */}
                    {examples.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                                <BookOpen className="h-4 w-4" />
                                Examples
                            </h3>
                            <ul className="space-y-2">
                                {examples.map((example, index) => (
                                    <li
                                        key={index}
                                        className="pl-4 border-l-2 border-primary/50 text-foreground"
                                    >
                                        {example}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
}
