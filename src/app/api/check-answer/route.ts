import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

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

You MUST return ONLY a valid JSON object (no markdown, no extra text) with this EXACT structure:
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
    let remainingHearts = 5;
    let userId = "";

    try {
        const body = await request.json();
        const { question, grammarRuleExplanation } = body;
        userId = body.userId || "";
        userAnswer = body.userAnswer || "";
        correctAnswer = body.correctAnswer || "";

        if (!userAnswer || !correctAnswer) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // If user is provided, handle hearts logic
        if (userId) {
            const supabase = await createClient();
            
            // Get current hearts
            const { data: userData, error: fetchError } = await supabase
                .from("users")
                .select("hearts")
                .eq("id", userId)
                .single();
            
            if (fetchError) {
                console.error("Error fetching user hearts:", fetchError);
            } else if (userData) {
                remainingHearts = userData.hearts || 5;
            }
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Fallback to exact-match if no API key
            const result = fallbackCheck(userAnswer, correctAnswer);
            
            // Decrement hearts if wrong and user ID provided
            if (!result.isCorrect && userId) {
                const supabase = await createClient();
                const newHearts = Math.max(0, remainingHearts - 1);
                
                const { error: updateError } = await supabase
                    .from("users")
                    .update({ hearts: newHearts })
                    .eq("id", userId);
                
                if (updateError) {
                    console.error("Error updating hearts:", updateError);
                } else {
                    remainingHearts = newHearts;
                }
            }
            
            return NextResponse.json({ ...result, remainingHearts });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        const prompt = `${SYSTEM_PROMPT}

Question: "${question || "N/A"}"
User's Answer: "${userAnswer}"
Correct Answer: "${correctAnswer}"
${grammarRuleExplanation ? `Grammar Rule: "${grammarRuleExplanation}"` : ""}

Evaluate the user's answer. Return ONLY the JSON object, nothing else. No markdown code blocks, no extra text.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON from response (may be wrapped in markdown code blocks)
        let jsonText = text;
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            jsonText = jsonMatch[1];
        }

        const parsed: GeminiResponse = JSON.parse(jsonText);

        // Validate structure
        if (
            typeof parsed.isCorrect !== "boolean" ||
            typeof parsed.feedback !== "string" ||
            !Array.isArray(parsed.diff)
        ) {
            throw new Error("Invalid response structure");
        }

        // Decrement hearts if wrong and user ID provided
        if (!parsed.isCorrect && userId) {
            const supabase = await createClient();
            const newHearts = Math.max(0, remainingHearts - 1);
            
            const { error: updateError } = await supabase
                .from("users")
                .update({ hearts: newHearts })
                .eq("id", userId);
            
            if (updateError) {
                console.error("Error updating hearts:", updateError);
            } else {
                remainingHearts = newHearts;
            }
        }

        return NextResponse.json({ ...parsed, remainingHearts });
    } catch (error) {
        console.error("Gemini API error:", error);

        // Fallback to exact-match comparison
        if (userAnswer && correctAnswer) {
            const result = fallbackCheck(userAnswer, correctAnswer);
            
            // Decrement hearts if wrong and user ID provided
            if (!result.isCorrect && userId) {
                const supabase = await createClient();
                const newHearts = Math.max(0, remainingHearts - 1);
                
                const { error: updateError } = await supabase
                    .from("users")
                    .update({ hearts: newHearts })
                    .eq("id", userId);
                
                if (updateError) {
                    console.error("Error updating hearts:", updateError);
                } else {
                    remainingHearts = newHearts;
                }
            }
            
            return NextResponse.json({ ...result, remainingHearts });
        }
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
