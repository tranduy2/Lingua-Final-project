"use client";

import { useState, useEffect } from "react";
import { lookupWord, DictionaryEntry } from "@/lib/api/dictionary";

interface VocabularyCardProps {
    word: string;
    userLevel?: string;
}

export function VocabularyCard({ word, userLevel = "A1" }: VocabularyCardProps) {
    const [entry, setEntry] = useState<DictionaryEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    function speakText(text: string, lang = "en-US") {
        if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    }

    useEffect(() => {
        setLoading(true);
        setError(null);
        setEntry(null);

        lookupWord(word, userLevel).then((result) => {
            setEntry(result.data);
            setError(result.error);
            setLoading(false);
        });
    }, [word, userLevel]);

    // Loading state
    if (loading) {
        return (
            <div className="p-6 bg-white dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[#3C83F6] border-t-transparent rounded-full animate-spin" />
                    <span className="text-[#75777F] text-sm">
                        AI is looking up &quot;{word}&quot;...
                    </span>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !entry) {
        return (
            <div className="p-6 bg-white dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-2xl">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">📖</span>
                    <div>
                        <h3 className="font-semibold text-[#1A1C1E] dark:text-white mb-1">{word}</h3>
                        <p className="text-sm text-red-500">{error || "Word not found"}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-2xl space-y-4">
            {/* Word + Phonetic + Part of Speech */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-bold text-[#1A1C1E] dark:text-white">{entry.word}</h3>
                    <button
                        onClick={() => speakText(entry.word)}
                        className="px-2 py-1 text-sm rounded-lg border border-[#D4D6DB] dark:border-[#2E3039] hover:bg-[#F0F2F5] dark:hover:bg-[#0B1525]"
                        title="Phat am tu vung"
                    >
                        🔊
                    </button>
                    {entry.phonetic && (
                        <span className="text-sm text-[#3C83F6] font-mono">{entry.phonetic}</span>
                    )}
                </div>
                {entry.partOfSpeech && (
                    <span className="inline-block px-3 py-0.5 text-xs font-semibold bg-[#3C83F6]/10 text-[#3C83F6] rounded-full">
                        {entry.partOfSpeech}
                    </span>
                )}
            </div>

            {/* Definition (Vietnamese) */}
            <div className="bg-[#F0F2F5] dark:bg-[#0B1525] border border-[#D4D6DB] dark:border-[#2E3039] rounded-xl p-4">
                <p className="text-xs font-bold text-[#75777F] uppercase tracking-wider mb-2">Định nghĩa</p>
                <p className="text-sm text-[#1A1C1E] dark:text-gray-200 leading-relaxed">{entry.definition}</p>
            </div>

            {/* Example + Translation */}
            {entry.example && (
                <div className="bg-[#F0F2F5] dark:bg-[#0B1525] border border-[#D4D6DB] dark:border-[#2E3039] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-[#75777F] uppercase tracking-wider">Ví dụ</p>
                        <button
                            onClick={() => speakText(entry.example || "")}
                            className="px-2 py-1 text-sm rounded-lg border border-[#D4D6DB] dark:border-[#2E3039] hover:bg-white/70 dark:hover:bg-[#1B1D24]"
                            title="Phat am cau vi du"
                        >
                            🔊
                        </button>
                    </div>
                    <p className="text-sm text-[#1A1C1E] dark:text-gray-200 italic mb-2">
                        &quot;{entry.example}&quot;
                    </p>
                    {entry.exampleTranslation && (
                        <p className="text-xs text-[#75777F]">
                            → {entry.exampleTranslation}
                        </p>
                    )}
                </div>
            )}

            {/* Synonyms */}
            {entry.synonyms && entry.synonyms.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-[#75777F] uppercase tracking-wider mb-2">Từ đồng nghĩa</p>
                    <div className="flex flex-wrap gap-2">
                        {entry.synonyms.map((syn, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-[#3C83F6]/5 dark:bg-[#3C83F6]/10 text-[#3C83F6] text-sm font-medium rounded-full border border-[#3C83F6]/20"
                            >
                                {syn}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* AI badge */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-[#D4D6DB]/50 dark:border-[#2E3039]/50">
                <span className="text-xs">✨</span>
                <span className="text-[10px] text-[#75777F]">Powered by Gemini AI · Level {userLevel}</span>
            </div>
        </div>
    );
}
