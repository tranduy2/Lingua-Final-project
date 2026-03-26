import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

interface DiffItem {
    word: string;
    status: "correct" | "incorrect" | "missing";
}

interface GeminiResponse {
    isCorrect: boolean;
    feedback: string;
    diff: DiffItem[];
}

const SYSTEM_PROMPT = `You are a friendly, encouraging English teacher evaluating an ESL student's answer.

Rules:
- Tolerate very minor typos (e.g., "recieve" vs "receive") and still mark as correct.
- Catch actual grammar mistakes, wrong vocabulary, or missing words.
- If a grammar rule explanation is provided, reference it in your feedback.
- Provide feedback in Vietnamese (1-2 sentences). Be encouraging even when the answer is wrong.

You MUST return a JSON object with this EXACT structure:
{
  "isCorrect": boolean,
  "feedback": "string (Vietnamese, 1-2 sentences)",
  "diff": [
    { "word": "string", "status": "correct" | "incorrect" | "missing" }
  ]
}

Diff logic:
- "correct": The word matches the correct answer.
- "incorrect": The user wrote a wrong word (show the user's wrong word).
- "missing": A word from the correct answer that the user left out.

Build the diff by comparing the user's answer against the correct answer word by word.`;

function fallbackCheck(
    userAnswer: string,
    correctAnswer: string
): GeminiResponse {
    const correct =
        userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

    const correctWords = correctAnswer.split(" ");
    const userWords = userAnswer.split(" ");

    const diff: DiffItem[] = [];
    const maxLen = Math.max(correctWords.length, userWords.length);

    for (let i = 0; i < maxLen; i++) {
        if (i >= userWords.length) {
            diff.push({ word: correctWords[i], status: "missing" });
        } else if (i >= correctWords.length) {
            diff.push({ word: userWords[i], status: "incorrect" });
        } else if (
            userWords[i].toLowerCase() === correctWords[i].toLowerCase()
        ) {
            diff.push({ word: userWords[i], status: "correct" });
        } else {
            diff.push({ word: userWords[i], status: "incorrect" });
            diff.push({ word: correctWords[i], status: "missing" });
        }
    }

    return {
        isCorrect: correct,
        feedback: correct
            ? "Tuyệt vời! Câu trả lời chính xác! 🎉"
            : `Chưa đúng rồi. Đáp án đúng là "${correctAnswer}".`,
        diff,
    };
}

export async function POST(request: Request) {
    let userAnswer = "";
    let correctAnswer = "";

    try {
        const body = await request.json();
        const { question, grammarRuleExplanation } = body;
        userAnswer = body.userAnswer || "";
        correctAnswer = body.correctAnswer || "";

        if (!userAnswer || !correctAnswer) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Fallback to exact-match if no API key
            return NextResponse.json(fallbackCheck(userAnswer, correctAnswer));
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const prompt = `${SYSTEM_PROMPT}

Question: "${question || "N/A"}"
User's Answer: "${userAnswer}"
Correct Answer: "${correctAnswer}"
${grammarRuleExplanation ? `Grammar Rule: "${grammarRuleExplanation}"` : ""}

Evaluate the user's answer and return the JSON response.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const parsed: GeminiResponse = JSON.parse(text);

        // Validate structure
        if (
            typeof parsed.isCorrect !== "boolean" ||
            typeof parsed.feedback !== "string" ||
            !Array.isArray(parsed.diff)
        ) {
            throw new Error("Invalid response structure");
        }

        return NextResponse.json(parsed);
    } catch (error) {
        console.error("Gemini API error:", error);

        // Fallback to exact-match comparison
        if (userAnswer && correctAnswer) {
            return NextResponse.json(fallbackCheck(userAnswer, correctAnswer));
        }
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
