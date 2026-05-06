import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert English teacher helping ESL students learn vocabulary. 
You explain vocabulary words tailored to the student's CEFR level.

IMPORTANT: The user may input a word in any language (e.g. Vietnamese, Chinese, etc.). 
If the input word is NOT in English, you MUST first translate it to the most appropriate English equivalent, 
and then explain that ENGLISH word. The "word" field in your response must ALWAYS be in English.

Level guidelines:
- A1/A2: Use very simple words, short explanations, and basic example sentences. Keep it beginner-friendly.
- B1/B2: Provide clear explanations with moderate complexity. Include useful collocations.
- C1/C2: Provide deeper nuances, idioms, formal/informal register differences, and complex examples.

You MUST return ONLY a valid JSON object (no markdown, no extra text) with this EXACT structure:
{
  "word": "string (MUST be the English word, even if the user typed in another language)",
  "phonetic": "string (IPA format, e.g. /əˈpɒl.ə.dʒaɪz/)",
  "partOfSpeech": "string (e.g. noun, verb, adjective)",
  "definition": "string (Clear explanation in Vietnamese, tailored to the user's CEFR level)",
  "example": "string (An English example sentence suitable for the user's level)",
  "exampleTranslation": "string (Vietnamese translation of the example sentence)",
  "synonyms": ["string"] // Array of 2-3 English synonyms. Empty array if none exist.
}`;

interface DictionaryResponse {
    word: string;
    phonetic: string;
    partOfSpeech: string;
    definition: string;
    example: string;
    exampleTranslation: string;
    synonyms: string[];
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
        const body = await request.json();
        const { word, userLevel } = body;

        if (!word) {
            return NextResponse.json(
                { error: "Missing 'word' field" },
                { status: 400 }
            );
        }

        const level = userLevel || "A1";
        const prompt = `${SYSTEM_PROMPT}

The student's CEFR level is: ${level}
The word to explain is: "${word}"

If the word above is not in English (e.g. it's Vietnamese or another language), first translate it to the best English equivalent, then explain that English word.
Return ONLY the JSON object, nothing else. No markdown code blocks, no extra text.`;

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
                temperature: 0.2,
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

        // Extract JSON from response (may be wrapped in markdown code blocks)
        let jsonText = text;
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            jsonText = jsonMatch[1];
        }

        let parsed: DictionaryResponse;
        try {
            parsed = JSON.parse(jsonText);
        } catch (parseError) {
            console.error("JSON parse error from LM Studio:", {
                text: jsonText.substring(0, 500),
                error: parseError instanceof Error ? parseError.message : String(parseError),
            });
            throw new Error(`Invalid JSON response from LM Studio: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }

        // Validate structure
        if (
            typeof parsed.word !== "string" ||
            typeof parsed.definition !== "string"
        ) {
            throw new Error("Invalid response structure from AI");
        }

        // Ensure synonyms is an array
        if (!Array.isArray(parsed.synonyms)) {
            parsed.synonyms = [];
        }

        return NextResponse.json(parsed);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("LM Studio Dictionary API error:", {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
        });

        return NextResponse.json(
            {
                error: "Failed to look up word. Please try again.",
                details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
            },
            { status: 500 }
        );
    }
}
