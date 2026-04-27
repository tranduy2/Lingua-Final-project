import { NextResponse } from "next/server";

interface GeneratedExercise {
    type: "multiple_choice" | "fill_blank" | "matching" | "listening" | "speaking" | "translation" | "word_order";
    question: string;
    correct_answer: string;
    options?: string[];
    explanation?: string;
    hint?: string;
    xp_reward?: number;
}

const SYSTEM_PROMPT = `You are an expert English teacher creating vocabulary and grammar exercises for ESL students.

Your task is to generate high-quality exercises tailored to a specific CEFR level and topic.

IMPORTANT RULES:
1. Generate ONLY pure JSON array output. No markdown code blocks, no extra text.
2. Each exercise must have:
   - "type": one of ["multiple_choice", "fill_blank", "matching", "listening", "speaking", "translation", "word_order"]
   - "question": clear, engaging question text in English
   - "correct_answer": the correct answer (for multiple_choice: which option is correct, for fill_blank: the word to fill, for others: the answer)
   - "options": (ONLY for multiple_choice) array of 4 options including the correct one
   - "explanation": clear explanation in Vietnamese
   - "hint": a helpful hint in English
   - "xp_reward": 5-15 depending on difficulty

3. Level-appropriate content:
   - A1/A2: Simple vocabulary, present tense, basic structures
   - B1/B2: Intermediate grammar, varied tenses, common idioms
   - C1/C2: Advanced vocabulary, complex structures, nuanced meanings

4. Variety: Mix exercise types (don't use only multiple_choice).

5. Quality: Make questions practical and useful for language learners.`;

interface GenerateRequest {
    topic: string;
    level: string;
    count: number;
}

interface LmStudioChatCompletionResponse {
    choices?: Array<{
        message?: {
            content?: string | Array<{ type?: string; text?: string }>;
        };
    }>;
}

const LM_STUDIO_BASE_URL = process.env.LM_STUDIO_BASE_URL || "http://127.0.0.1:1234";
const LM_STUDIO_MODEL =
    process.env.LM_STUDIO_MODEL || "qwen2.5-coder-3b-instruct-q4_k_m";
const LM_STUDIO_API_KEY = process.env.LM_STUDIO_API_KEY || "lm-studio";

function extractAssistantText(payload: LmStudioChatCompletionResponse): string {
    const content = payload.choices?.[0]?.message?.content;

    if (typeof content === "string") {
        return content;
    }

    if (Array.isArray(content)) {
        return content
            .map((part) => part?.text || "")
            .join("")
            .trim();
    }

    return "";
}

export async function POST(request: Request) {
    try {
        const body: GenerateRequest = await request.json();
        const { topic = "General English", level = "A1", count = 5 } = body;

        if (!topic || !level) {
            return NextResponse.json(
                { error: "Missing required fields: topic, level" },
                { status: 400 }
            );
        }

        const validLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
        if (!validLevels.includes(level.toUpperCase())) {
            return NextResponse.json(
                { error: "Invalid level. Must be one of: A1, A2, B1, B2, C1, C2" },
                { status: 400 }
            );
        }

        const countNum = Math.min(Math.max(parseInt(String(count)) || 5, 1), 10);

        const prompt = `${SYSTEM_PROMPT}

Topic: "${topic}"
CEFR Level: ${level}
Number of exercises to generate: ${countNum}

Generate and return ONLY a valid JSON array of ${countNum} exercise objects. No markdown, no extra text. Start with [ and end with ].`;

        const endpoint = `${LM_STUDIO_BASE_URL.replace(/\/$/, "")}/v1/chat/completions`;
        const lmResponse = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${LM_STUDIO_API_KEY}`,
            },
            body: JSON.stringify({
                model: LM_STUDIO_MODEL,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: prompt },
                ],
                temperature: 0.3,
            }),
        });

        if (!lmResponse.ok) {
            const errText = await lmResponse.text();
            throw new Error(`LM Studio request failed: [${lmResponse.status}] ${errText}`);
        }

        const payload: LmStudioChatCompletionResponse = await lmResponse.json();
        const text = extractAssistantText(payload);

        if (!text) {
            throw new Error("LM Studio returned empty completion content");
        }

        // Extract JSON (may be wrapped in markdown code blocks)
        let jsonText = text.trim();
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            jsonText = jsonMatch[1].trim();
        }

        let exercises: GeneratedExercise[];
        try {
            exercises = JSON.parse(jsonText);
        } catch (parseError) {
            console.error("JSON parse error from LM Studio:", {
                text: jsonText.substring(0, 500),
                error: parseError instanceof Error ? parseError.message : String(parseError),
            });
            throw new Error(`Invalid JSON response from LM Studio: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }

        if (!Array.isArray(exercises)) {
            throw new Error("Expected JSON array of exercises");
        }

        // Validate and normalize each exercise
        const normalized = exercises
            .slice(0, countNum)
            .map((ex: any) => ({
                type: String(ex.type || "multiple_choice"),
                question: String(ex.question || ""),
                correct_answer: String(ex.correct_answer || ""),
                options: Array.isArray(ex.options)
                    ? ex.options.map((o: any) => String(o))
                    : ex.type === "multiple_choice"
                        ? ["Option 1", "Option 2", "Option 3", "Option 4"]
                        : undefined,
                explanation: ex.explanation ? String(ex.explanation) : undefined,
                hint: ex.hint ? String(ex.hint) : undefined,
                xp_reward: Math.min(Math.max(parseInt(String(ex.xp_reward)) || 5, 5), 15),
            }))
            .filter((ex: any) => ex.question && ex.correct_answer);

        return NextResponse.json({
            success: true,
            count: normalized.length,
            exercises: normalized,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Exercise generation error:", {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
        });

        return NextResponse.json(
            {
                error: "Failed to generate exercises",
                details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
            },
            { status: 500 }
        );
    }
}
