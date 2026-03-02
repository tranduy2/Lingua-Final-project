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

interface LessonInfo {
    id: string;
    title: string;
    xp_reward: number;
}

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
    const [lessonComplete, setLessonComplete] = useState(false);
    const [explanation, setExplanation] = useState("");

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient();

            // Fetch lesson info
            const { data: lessonData } = await supabase
                .from("lessons")
                .select("id, title, xp_reward")
                .eq("id", lessonId)
                .single();

            if (lessonData) {
                setLesson(lessonData);
            }

            // Fetch exercises for this lesson
            const { data: exercisesData } = await supabase
                .from("exercises")
                .select("id, type, question, correct_answer, grammar_rule_id, options")
                .eq("lesson_id", lessonId)
                .order("order_index");

            if (exercisesData && exercisesData.length > 0) {
                setExercises(exercisesData);
            }

            setLoading(false);
        }

        fetchData();
    }, [lessonId]);

    const currentExercise = exercises[currentIndex];
    const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;

    async function handleAnswer(answer: string) {
        if (!currentExercise) return;

        // Validate answer
        const correctAnswer = currentExercise.correct_answer.split("|")[0].trim();
        const correct = answer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            setScore(score + 10);
            setCorrectCount(correctCount + 1);
        }

        // Fetch grammar rule explanation if wrong and has a rule
        if (!correct && currentExercise.grammar_rule_id) {
            const supabase = createClient();
            const { data: rule } = await supabase
                .from("grammar_rules")
                .select("explanation")
                .eq("id", currentExercise.grammar_rule_id)
                .single();

            if (rule) {
                setExplanation(rule.explanation);
            }
        } else {
            setExplanation("");
        }
    }

    function handleNext() {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowResult(false);
            setExplanation("");
        } else {
            setLessonComplete(true);
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading lesson...</p>
                </div>
            </div>
        );
    }

    // No exercises found
    if (exercises.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <div className="text-6xl mb-4">📝</div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">No exercises yet</h1>
                    <p className="text-muted-foreground mb-6">
                        This lesson doesn&apos;t have any exercises. Check back later!
                    </p>
                    <Link
                        href="/learn"
                        className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90"
                    >
                        Back to Learning Path
                    </Link>
                </div>
            </div>
        );
    }

    // Lesson complete screen
    if (lessonComplete) {
        const percentage = Math.round((correctCount / exercises.length) * 100);
        const isPassed = percentage >= 60;

        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <div className="text-6xl mb-4">{isPassed ? "🎉" : "📚"}</div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        {isPassed ? "Lesson Complete!" : "Keep Practicing!"}
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        You got {correctCount} out of {exercises.length} correct ({percentage}%)
                    </p>

                    {/* Score summary */}
                    <div className="bg-card border border-border rounded-xl p-6 mb-6 text-left space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">XP Earned</span>
                            <span className="font-bold text-primary">+{score} XP</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Accuracy</span>
                            <span className="font-bold text-foreground">{percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Exercises</span>
                            <span className="font-bold text-foreground">{correctCount}/{exercises.length}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setCurrentIndex(0);
                                setScore(0);
                                setCorrectCount(0);
                                setShowResult(false);
                                setLessonComplete(false);
                                setExplanation("");
                            }}
                            className="flex-1 py-3 border border-border rounded-xl font-medium text-foreground hover:bg-muted"
                        >
                            Try Again
                        </button>
                        <Link
                            href="/learn"
                            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 text-center"
                        >
                            Continue
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Exercise screen
    return (
        <div className="min-h-screen bg-background">
            {/* Header with progress bar */}
            <header className="sticky top-0 bg-card border-b border-border z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
                    <Link href="/learn" className="p-2 hover:bg-muted rounded-lg text-muted-foreground">
                        ✕
                    </Link>
                    <div className="flex-1">
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {currentIndex + 1}/{exercises.length}
                    </span>
                    <span className="text-sm font-bold text-primary">+{score} XP</span>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-2xl mx-auto px-4 py-8">
                <div className="space-y-6">
                    {/* Exercise type label */}
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full capitalize">
                        {currentExercise.type.replace("_", " ")}
                    </span>

                    {/* Render the right exercise component */}
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

                    {/* Result feedback */}
                    {showResult && (
                        <div
                            className={`p-6 rounded-xl border-2 ${isCorrect
                                    ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                                    : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">{isCorrect ? "✅" : "❌"}</span>
                                <span
                                    className={`text-xl font-bold ${isCorrect
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-red-600 dark:text-red-400"
                                        }`}
                                >
                                    {isCorrect ? "Correct! +10 XP" : "Incorrect"}
                                </span>
                            </div>

                            {!isCorrect && (
                                <p className="text-sm text-foreground mb-2">
                                    Correct answer: <strong>{currentExercise.correct_answer.split("|")[0]}</strong>
                                </p>
                            )}

                            {/* Grammar rule explanation */}
                            {explanation && (
                                <div className="mt-3 p-4 bg-card border border-border rounded-lg">
                                    <p className="text-xs font-medium text-primary mb-1">📖 Grammar Tip</p>
                                    <p className="text-sm text-foreground">{explanation}</p>
                                </div>
                            )}

                            <button
                                onClick={handleNext}
                                className="w-full mt-4 h-12 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
                            >
                                {currentIndex < exercises.length - 1 ? "Next Question →" : "Finish Lesson 🎉"}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
