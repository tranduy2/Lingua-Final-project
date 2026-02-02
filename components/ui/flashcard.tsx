"use client";

import { useState } from "react";

interface FlashcardProps {
    front: string;
    back: string;
    onKnow?: () => void;
    onDontKnow?: () => void;
}

export function Flashcard({ front, back, onKnow, onDontKnow }: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Card */}
            <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative h-64 cursor-pointer perspective-1000"
            >
                <div
                    className={`absolute inset-0 transition-transform duration-500 transform-style-3d ${isFlipped ? "rotate-y-180" : ""
                        }`}
                >
                    {/* Front */}
                    <div className={`absolute inset-0 backface-hidden ${isFlipped ? "invisible" : ""}`}>
                        <div className="h-full flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">TAP TO FLIP</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white text-center">{front}</p>
                        </div>
                    </div>

                    {/* Back */}
                    <div className={`absolute inset-0 backface-hidden rotate-y-180 ${!isFlipped ? "invisible" : ""}`}>
                        <div className="h-full flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl shadow-lg">
                            <p className="text-xs text-blue-500 dark:text-blue-400 mb-4">ANSWER</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white text-center">{back}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            {isFlipped && (
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={() => {
                            setIsFlipped(false);
                            onDontKnow?.();
                        }}
                        className="flex-1 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50"
                    >
                        ❌ Don't Know
                    </button>
                    <button
                        onClick={() => {
                            setIsFlipped(false);
                            onKnow?.();
                        }}
                        className="flex-1 py-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50"
                    >
                        ✅ Got It!
                    </button>
                </div>
            )}

            {/* Flip instruction */}
            {!isFlipped && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Click the card to reveal the answer
                </p>
            )}
        </div>
    );
}

// Flashcard deck component for studying multiple cards
interface FlashcardDeckProps {
    cards: Array<{ front: string; back: string }>;
    onComplete?: (known: number, total: number) => void;
}

export function FlashcardDeck({ cards, onComplete }: FlashcardDeckProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [knownCount, setKnownCount] = useState(0);
    const [completed, setCompleted] = useState(false);

    function handleKnow() {
        setKnownCount(knownCount + 1);
        nextCard();
    }

    function handleDontKnow() {
        nextCard();
    }

    function nextCard() {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCompleted(true);
            onComplete?.(knownCount + 1, cards.length);
        }
    }

    function restart() {
        setCurrentIndex(0);
        setKnownCount(0);
        setCompleted(false);
    }

    if (completed) {
        const percentage = Math.round((knownCount / cards.length) * 100);
        return (
            <div className="text-center py-8">
                <div className="text-6xl mb-4">{percentage >= 70 ? "🎉" : "📚"}</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {percentage >= 70 ? "Great job!" : "Keep practicing!"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You knew {knownCount} out of {cards.length} cards ({percentage}%)
                </p>
                <button
                    onClick={restart}
                    className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600"
                >
                    Practice Again
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Card {currentIndex + 1} of {cards.length}</span>
                    <span className="text-green-500">✅ {knownCount} known</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Current card */}
            <Flashcard
                front={cards[currentIndex].front}
                back={cards[currentIndex].back}
                onKnow={handleKnow}
                onDontKnow={handleDontKnow}
            />
        </div>
    );
}
