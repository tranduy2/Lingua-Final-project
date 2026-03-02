"use client";

import { useState } from "react";

// ============================================
// EXERCISE INTERFACES
// ============================================

export interface Exercise {
    id: string;
    type: string;
    question: string;
    correct_answer: string;
    options?: string[];
    grammar_rule_id?: string | null;
}

interface ExerciseProps {
    exercise: Exercise;
    onAnswer: (answer: string) => void;
    disabled: boolean;
}

// ============================================
// MULTIPLE CHOICE COMPONENT
// ============================================

export function MultipleChoice({ exercise, onAnswer, disabled }: ExerciseProps) {
    const [selected, setSelected] = useState<string | null>(null);

    // Parse options from correct_answer field (format: "correct|wrong1|wrong2|wrong3")
    const options = exercise.options || exercise.correct_answer.split("|");
    const shuffledOptions = useState(() => [...options].sort(() => Math.random() - 0.5))[0];

    function handleSelect(option: string) {
        if (disabled) return;
        setSelected(option);
        onAnswer(option);
    }

    return (
        <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">{exercise.question}</h2>
            <div className="grid gap-3 mt-4">
                {shuffledOptions.map((option, i) => (
                    <button
                        key={i}
                        onClick={() => handleSelect(option.trim())}
                        disabled={disabled}
                        className={`w-full p-4 text-left rounded-xl border-2 transition-all font-medium ${selected === option.trim()
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-foreground hover:border-primary/50"
                            } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        <span className="inline-flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                                {String.fromCharCode(65 + i)}
                            </span>
                            {option.trim()}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ============================================
// FILL IN THE BLANK COMPONENT
// ============================================

export function FillInTheBlank({ exercise, onAnswer, disabled }: ExerciseProps) {
    const [value, setValue] = useState("");

    function handleSubmit() {
        if (!value.trim() || disabled) return;
        onAnswer(value.trim());
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">{exercise.question}</h2>
            <div className="flex gap-3">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={disabled}
                    placeholder="Type your answer..."
                    className="flex-1 h-12 px-4 rounded-xl border-2 border-border bg-background text-foreground text-lg focus:outline-none focus:border-primary disabled:opacity-60"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button
                    onClick={handleSubmit}
                    disabled={!value.trim() || disabled}
                    className="px-6 h-12 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
                >
                    Check
                </button>
            </div>
        </div>
    );
}

// ============================================
// WORD ORDERING COMPONENT
// ============================================

export function WordOrdering({ exercise, onAnswer, disabled }: ExerciseProps) {
    // Words to arrange - split the question by "|" or use correct_answer words scrambled
    const correctWords = exercise.correct_answer.split(" ");
    const [availableWords] = useState(() =>
        [...correctWords].sort(() => Math.random() - 0.5)
    );
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [remainingWords, setRemainingWords] = useState<string[]>(availableWords);

    function addWord(word: string, index: number) {
        if (disabled) return;
        setSelectedWords([...selectedWords, word]);
        const newRemaining = [...remainingWords];
        newRemaining.splice(index, 1);
        setRemainingWords(newRemaining);
    }

    function removeWord(word: string, index: number) {
        if (disabled) return;
        setRemainingWords([...remainingWords, word]);
        const newSelected = [...selectedWords];
        newSelected.splice(index, 1);
        setSelectedWords(newSelected);
    }

    function handleSubmit() {
        if (disabled) return;
        onAnswer(selectedWords.join(" "));
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">{exercise.question}</h2>

            {/* Selected words area */}
            <div className="min-h-[60px] p-4 rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-wrap gap-2">
                {selectedWords.length === 0 && (
                    <span className="text-muted-foreground text-sm">Tap words below to build the sentence...</span>
                )}
                {selectedWords.map((word, i) => (
                    <button
                        key={`selected-${i}`}
                        onClick={() => removeWord(word, i)}
                        disabled={disabled}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-80"
                    >
                        {word}
                    </button>
                ))}
            </div>

            {/* Available words */}
            <div className="flex flex-wrap gap-2">
                {remainingWords.map((word, i) => (
                    <button
                        key={`available-${i}`}
                        onClick={() => addWord(word, i)}
                        disabled={disabled}
                        className="px-4 py-2 bg-card border-2 border-border rounded-lg font-medium text-sm text-foreground hover:border-primary/50 disabled:opacity-60"
                    >
                        {word}
                    </button>
                ))}
            </div>

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={selectedWords.length === 0 || disabled}
                className="w-full h-12 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
            >
                Check Answer
            </button>
        </div>
    );
}

// ============================================
// LISTENING EXERCISE COMPONENT (Web Speech API)
// ============================================

export function ListeningExercise({ exercise, onAnswer, disabled }: ExerciseProps) {
    const [value, setValue] = useState("");
    const [speaking, setSpeaking] = useState(false);

    function speakText() {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(exercise.correct_answer);
        utterance.lang = "en-US";
        utterance.rate = 0.8;
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
    }

    function handleSubmit() {
        if (!value.trim() || disabled) return;
        onAnswer(value.trim());
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">{exercise.question}</h2>

            {/* Play audio button */}
            <div className="flex justify-center py-4">
                <button
                    onClick={speakText}
                    disabled={speaking}
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all ${speaking
                            ? "bg-primary/20 border-2 border-primary animate-pulse"
                            : "bg-primary/10 border-2 border-primary/50 hover:bg-primary/20"
                        }`}
                >
                    {speaking ? "🔊" : "🔈"}
                </button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
                {speaking ? "Listening..." : "Tap to listen, then type what you hear"}
            </p>

            {/* Answer input */}
            <div className="flex gap-3">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={disabled}
                    placeholder="Type what you hear..."
                    className="flex-1 h-12 px-4 rounded-xl border-2 border-border bg-background text-foreground text-lg focus:outline-none focus:border-primary disabled:opacity-60"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <button
                    onClick={handleSubmit}
                    disabled={!value.trim() || disabled}
                    className="px-6 h-12 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 disabled:opacity-50"
                >
                    Check
                </button>
            </div>
        </div>
    );
}
