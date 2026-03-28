"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/client";
import {
    Exercise,
    MultipleChoice,
    FillInTheBlank,
    WordOrdering,
    ListeningExercise,
} from "@/components/exercises/exercise-types";
import { GrammarCard } from "@/components/feedback/grammar-card";
import { logUserWeakness } from "@/lib/api/weakness-tracker";
import { saveXpToProfile } from "@/lib/api/gamification";

interface LessonInfo {
    id: string;
    title: string;
    xp_reward: number;
}

interface DiffItem {
    word: string;
    status: "correct" | "incorrect" | "missing";
}

interface AIResult {
    isCorrect: boolean;
    feedback: string;
    diff: DiffItem[];
}

const TEXT_BASED_TYPES = ["fill_blank", "translation", "listening", "word_order"];

export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const lessonId = params.lessonId as string;

    const [lesson, setLesson] = useState<LessonInfo | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [hearts, setHearts] = useState(5);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [explanation, setExplanation] = useState("");
    const [userAnswer, setUserAnswer] = useState("");
    const [aiChecking, setAiChecking] = useState(false);
    const [aiFeedback, setAiFeedback] = useState("");
    const [aiDiff, setAiDiff] = useState<DiffItem[]>([]);
    const [grammarModal, setGrammarModal] = useState<{
        title: string;
        explanation: string;
        examples: string[];
        category: string;
        cefrLevel: string;
    } | null>(null);
    const [showGrammarModal, setShowGrammarModal] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient();
            const { data: lessonData, error: lessonError } = await supabase
                .from("lessons")
                .select("id, title, xp_reward")
                .eq("id", lessonId)
                .single();

            if (lessonError) {
                console.log("Lesson query error:", lessonError);
            }

            if (lessonData) setLesson(lessonData);

            const { data: exercisesData, error: exercisesError } = await supabase
                .from("exercises")
                .select("id, type, question, correct_answer, options")
                .eq("lesson_id", lessonId)
                .order("order_index");

            let rows: any[] = exercisesData || [];

            if (exercisesError) {
                console.log("Exercises query error:", exercisesError);
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from("exercises")
                    .select("*")
                    .eq("lesson_id", lessonId);

                if (fallbackError) {
                    console.log("Exercises fallback query error:", fallbackError);
                } else {
                    rows = fallbackData || [];
                }
            }

            if (rows.length > 0) {
                const parseOptions = (raw: unknown): string[] | undefined => {
                    if (Array.isArray(raw)) return raw;
                    if (typeof raw === "string") {
                        try {
                            const parsed = JSON.parse(raw);
                            return Array.isArray(parsed) ? parsed : undefined;
                        } catch {
                            return undefined;
                        }
                    }
                    return undefined;
                };

                const normalized = rows
                    .filter((exercise) => exercise?.id && exercise?.type && exercise?.question && exercise?.correct_answer)
                    .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                    .map((exercise) => ({
                        id: String(exercise.id),
                        type: String(exercise.type),
                        question: String(exercise.question),
                        correct_answer: String(exercise.correct_answer),
                        options: parseOptions(exercise.options),
                        grammar_rule_id: exercise.grammar_rule_id || null,
                    }));

                setExercises(normalized);
            }

            setLoading(false);
        }
        fetchData();
    }, [lessonId]);

    const currentExercise = exercises[currentIndex];
    const progress = exercises.length > 0 ? ((currentIndex + (showResult ? 1 : 0)) / exercises.length) * 100 : 0;

    const exerciseTypeLabel = (type: string) => {
        switch (type) {
            case "multiple_choice": return "Choose the correct answer";
            case "fill_blank": return "Fill in the blank";
            case "word_order": return "Put the words in order";
            case "listening": return "Listen and type";
            case "translation": return "Translate this sentence";
            default: return "Complete the exercise";
        }
    };

    async function handleAnswer(answer: string) {
        if (!currentExercise) return;

        const correctAnswer = currentExercise.correct_answer.split("|")[0].trim();
        const isTextBased = TEXT_BASED_TYPES.includes(currentExercise.type);

        setUserAnswer(answer);
        setAiFeedback("");
        setAiDiff([]);

        if (isTextBased) {
            // Use AI for text-based exercises
            setAiChecking(true);

            let grammarRuleExplanation = "";
            if (currentExercise.grammar_rule_id) {
                const supabase = createClient();
                const { data: rule } = await supabase
                    .from("grammar_rules")
                    .select("explanation")
                    .eq("id", currentExercise.grammar_rule_id)
                    .single();
                if (rule) grammarRuleExplanation = rule.explanation;
            }

            try {
                const res = await fetch("/api/check-answer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        question: currentExercise.question,
                        userAnswer: answer,
                        correctAnswer,
                        grammarRuleExplanation: grammarRuleExplanation || undefined,
                    }),
                });

                if (!res.ok) throw new Error("API request failed");

                const aiResult: AIResult = await res.json();

                setIsCorrect(aiResult.isCorrect);
                setAiFeedback(aiResult.feedback);
                setAiDiff(aiResult.diff || []);

                if (aiResult.isCorrect) {
                    setScore(score + 10);
                    setCorrectCount(correctCount + 1);
                } else {
                    setHearts(Math.max(0, hearts - 1));
                }
            } catch {
                // Fallback to exact-match
                const correct = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
                setIsCorrect(correct);
                setAiFeedback(correct ? "Correct! 🎉" : `The correct answer is "${correctAnswer}".`);
                if (correct) {
                    setScore(score + 10);
                    setCorrectCount(correctCount + 1);
                } else {
                    setHearts(Math.max(0, hearts - 1));
                }
            }

            setAiChecking(false);
        } else {
            // Multiple choice — standard exact-match
            const correct = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
            setIsCorrect(correct);

            if (correct) {
                setScore(score + 10);
                setCorrectCount(correctCount + 1);
            } else {
                setHearts(Math.max(0, hearts - 1));
            }
        }

        setShowResult(true);

        // Fetch grammar rule for wrong answers
        if (currentExercise.grammar_rule_id) {
            const supabase = createClient();
            const { data: rule } = await supabase
                .from("grammar_rules")
                .select("title, explanation, examples, category, cefr_level")
                .eq("id", currentExercise.grammar_rule_id)
                .single();

            if (rule) {
                setExplanation(rule.explanation);
                setGrammarModal({
                    title: rule.title || "Grammar Rule",
                    explanation: rule.explanation || "",
                    examples: rule.examples || [],
                    category: rule.category || "",
                    cefrLevel: rule.cefr_level || "",
                });
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user && !isCorrect) {
                logUserWeakness(user.id, currentExercise.grammar_rule_id, currentExercise.id);
            }
        } else {
            setExplanation("");
            setGrammarModal(null);
        }
    }

    async function handleNext() {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowResult(false);
            setExplanation("");
            setGrammarModal(null);
            setShowGrammarModal(false);
            setAiFeedback("");
            setAiDiff([]);
        } else {
            setLessonComplete(true);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                saveXpToProfile(user.id, score);
            }
        }
    }

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0F1729] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#3C83F6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#75777F]">Loading lesson...</p>
                </div>
            </div>
        );
    }

    // No exercises
    if (exercises.length === 0) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0F1729] flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <div className="text-6xl mb-4">📝</div>
                    <h1 className="text-2xl font-bold text-[#1A1C1E] dark:text-white mb-2">No exercises yet</h1>
                    <p className="text-[#75777F] mb-6">This lesson doesn&apos;t have any exercises. Check back later!</p>
                    <Link href="/learn" className="inline-block px-6 py-3 bg-[#3C83F6] text-white rounded-xl font-medium hover:bg-[#2B6FE0]">
                        Back to Learning Path
                    </Link>
                </div>
            </div>
        );
    }

    // Lesson complete
    if (lessonComplete) {
        const percentage = Math.round((correctCount / exercises.length) * 100);
        const isPassed = percentage >= 60;

        return (
            <div className="min-h-screen bg-white dark:bg-[#0F1729] flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <div className="text-7xl mb-6">{isPassed ? "🎉" : "📚"}</div>
                    <h1 className="text-3xl font-bold text-[#1A1C1E] dark:text-white mb-2">
                        {isPassed ? "Lesson Complete!" : "Keep Practicing!"}
                    </h1>
                    <p className="text-[#75777F] mb-8">
                        You got {correctCount} out of {exercises.length} correct ({percentage}%)
                    </p>

                    <div className="bg-[#F0F2F5] dark:bg-[#1B1D24] border border-[#D4D6DB] dark:border-[#2E3039] rounded-2xl p-6 mb-8 text-left space-y-4">
                        <div className="flex justify-between">
                            <span className="text-[#75777F]">XP Earned</span>
                            <span className="font-bold text-[#3C83F6]">+{score} XP</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#75777F]">Accuracy</span>
                            <span className="font-bold text-[#1A1C1E] dark:text-white">{percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#75777F]">Hearts Remaining</span>
                            <span className="font-bold text-[#1A1C1E] dark:text-white">❤️ {hearts}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setCurrentIndex(0);
                                setScore(0);
                                setCorrectCount(0);
                                setHearts(5);
                                setShowResult(false);
                                setLessonComplete(false);
                                setExplanation("");
                                setAiFeedback("");
                                setAiDiff([]);
                            }}
                            className="flex-1 py-3.5 border border-[#D4D6DB] dark:border-[#2E3039] rounded-xl font-medium text-[#1A1C1E] dark:text-white hover:bg-[#F0F2F5] dark:hover:bg-[#1B1D24]"
                        >
                            Try Again
                        </button>
                        <Link
                            href="/learn"
                            className="flex-1 py-3.5 bg-[#3C83F6] text-white rounded-xl font-medium hover:bg-[#2B6FE0] text-center"
                        >
                            Continue
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // AI Checking state
    if (aiChecking) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0F1729] flex flex-col">
                <header className="sticky top-0 bg-white dark:bg-[#0F1729] z-10 px-4 py-3">
                    <div className="max-w-2xl mx-auto flex items-center gap-4">
                        <Link href="/learn" className="text-[#75777F]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </Link>
                        <div className="flex-1">
                            <div className="h-3 bg-[#E3E5E8] dark:bg-[#2A2D35] rounded-full overflow-hidden">
                                <div className="h-full bg-[#3C83F6] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-red-500">❤️</span>
                            <span className="font-bold text-[#1A1C1E] dark:text-white text-sm">{hearts}</span>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-[#3C83F6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-lg font-semibold text-[#1A1C1E] dark:text-white mb-1">AI is checking...</p>
                        <p className="text-sm text-[#75777F]">Analyzing your answer with Gemini AI</p>
                    </div>
                </div>
            </div>
        );
    }

    // Main exercise screen
    return (
        <div className="min-h-screen bg-white dark:bg-[#0F1729] flex flex-col">
            {/* Top Bar */}
            <header className="sticky top-0 bg-white dark:bg-[#0F1729] z-10 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Link href="/learn" className="text-[#75777F] hover:text-[#1A1C1E] dark:hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Link>
                    <div className="flex-1">
                        <div className="h-3 bg-[#E3E5E8] dark:bg-[#2A2D35] rounded-full overflow-hidden">
                            <div className="h-full bg-[#3C83F6] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-red-500">❤️</span>
                        <span className="font-bold text-[#1A1C1E] dark:text-white text-sm">{hearts}</span>
                    </div>
                </div>
            </header>

            {/* Exercise Content */}
            <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4">
                <div className="flex-1 py-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1A1C1E] dark:text-white mb-1">
                        {exerciseTypeLabel(currentExercise.type)}
                    </h1>
                    <p className="text-xs font-bold text-[#3C83F6] uppercase tracking-wider mb-8">
                        {lesson?.title ? `Lesson: ${lesson.title}` : ""}
                    </p>

                    {!showResult && (
                        <>
                            {currentExercise.type === "multiple_choice" && (
                                <MultipleChoice exercise={currentExercise} onAnswer={handleAnswer} disabled={showResult} />
                            )}
                            {currentExercise.type === "fill_blank" && (
                                <FillInTheBlank exercise={currentExercise} onAnswer={handleAnswer} disabled={showResult} />
                            )}
                            {currentExercise.type === "word_order" && (
                                <WordOrdering exercise={currentExercise} onAnswer={handleAnswer} disabled={showResult} />
                            )}
                            {currentExercise.type === "listening" && (
                                <ListeningExercise exercise={currentExercise} onAnswer={handleAnswer} disabled={showResult} />
                            )}
                            {currentExercise.type === "translation" && (
                                <FillInTheBlank exercise={currentExercise} onAnswer={handleAnswer} disabled={showResult} />
                            )}
                        </>
                    )}
                </div>

                {/* Bottom feedback panel */}
                {showResult && (
                    <div className={`-mx-4 px-6 py-6 ${
                        isCorrect
                            ? "bg-green-50 dark:bg-green-900/10 border-t-2 border-green-300 dark:border-green-700"
                            : "bg-red-50 dark:bg-red-900/10 border-t-2 border-red-300 dark:border-red-700"
                    }`}>
                        {/* Header: Correct/Incorrect */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                                {isCorrect ? (
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                )}
                            </div>
                            <span className={`text-lg font-bold ${isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                {isCorrect ? "Correct! +10 XP" : "Incorrect solution"}
                            </span>
                        </div>

                        {/* AI Visual Diff */}
                        {aiDiff.length > 0 && !isCorrect && (
                            <div className="bg-white/60 dark:bg-[#1B2840] border border-[#D4D6DB] dark:border-[#2E3039] rounded-xl p-4 mb-4">
                                <p className="text-xs font-bold text-[#75777F] uppercase tracking-wider mb-3">Word-by-word analysis</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {aiDiff.map((item, i) => (
                                        <span
                                            key={i}
                                            className={`px-2 py-1 rounded-md text-sm font-medium ${
                                                item.status === "correct"
                                                    ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                                    : item.status === "incorrect"
                                                    ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 line-through"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-gray-600"
                                            }`}
                                        >
                                            {item.word}
                                            {item.status === "missing" && (
                                                <span className="text-[10px] ml-1 opacity-60">(missing)</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* AI Teacher's Note */}
                        {aiFeedback && (
                            <div className="bg-white/60 dark:bg-[#1B2840] border border-[#D4D6DB] dark:border-[#2E3039] rounded-xl p-4 mb-4 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#3C83F6] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-sm">💡</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#3C83F6] uppercase tracking-wider mb-1">Teacher&apos;s Note</p>
                                    <p className="text-sm text-[#1A1C1E] dark:text-gray-200 leading-relaxed">{aiFeedback}</p>
                                </div>
                            </div>
                        )}

                        {/* Grammar Rule (from DB) */}
                        {explanation && !isCorrect && !aiFeedback && (
                            <div className="bg-white/60 dark:bg-[#1B2840] border border-[#D4D6DB] dark:border-[#2E3039] rounded-xl p-4 mb-4 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-sm">💡</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-[#75777F] uppercase tracking-wider mb-1">Grammar Rule</p>
                                    <p className="text-sm text-[#1A1C1E] dark:text-gray-200">{explanation}</p>
                                    {grammarModal && (
                                        <button onClick={() => setShowGrammarModal(true)} className="text-xs font-medium text-[#3C83F6] hover:underline mt-2">
                                            See full rule →
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Continue button */}
                        <button
                            onClick={handleNext}
                            className="w-full py-3.5 bg-[#3C83F6] text-white font-semibold rounded-xl hover:bg-[#2B6FE0] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#3C83F6]/20"
                        >
                            {currentIndex < exercises.length - 1 ? "Continue" : "Finish Lesson"} <span>→</span>
                        </button>
                    </div>
                )}
            </main>

            {/* Grammar Card Modal */}
            {grammarModal && (
                <GrammarCard
                    isOpen={showGrammarModal}
                    onClose={() => setShowGrammarModal(false)}
                    title={grammarModal.title}
                    explanation={grammarModal.explanation}
                    examples={grammarModal.examples}
                    category={grammarModal.category}
                    cefrLevel={grammarModal.cefrLevel}
                />
            )}
        </div>
    );
}
