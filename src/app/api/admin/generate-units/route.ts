import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert English curriculum designer.

Generate a JSON array of unit objects tailored to a given topic and CEFR level.

Rules:
1. Return ONLY a JSON array. No markdown, no commentary.
2. Each unit must include:
   - "title": short unit title in English
   - "description": 1-2 sentence summary in English
   - "cefr_level": one of ["A1","A2","B1","B2","C1","C2"]
   - "lessons": array of lesson objects; each lesson must include:
       - "title": short lesson title
       - "target_skill": one of ["reading","writing","listening","speaking","grammar","vocabulary"]

3. Keep content concise and level-appropriate.
4. Generate the requested number of units; each unit may have 1..6 lessons.`;

interface GenerateRequest {
  topic?: string;
  level?: string;
  count?: number;
  lessonsPerUnit?: number;
}

interface LmStudioChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
  }>;
}

const LM_STUDIO_BASE_URL = process.env.LM_STUDIO_BASE_URL || "http://127.0.0.1:1234";
const LM_STUDIO_MODEL = process.env.LM_STUDIO_MODEL || "qwen2.5-coder-3b-instruct-q4_k_m";
const LM_STUDIO_API_KEY = process.env.LM_STUDIO_API_KEY || "lm-studio";

function extractAssistantText(payload: LmStudioChatCompletionResponse): string {
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((p) => p?.text || "").join("").trim();
  return "";
}

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const topic = (body.topic || "General English").trim();
    const level = (body.level || "A1").toUpperCase();
    const count = Math.min(Math.max(parseInt(String(body.count)) || 1, 1), 5);
    const lessonsPerUnit = Math.min(Math.max(parseInt(String(body.lessonsPerUnit)) || 3, 1), 6);

    const validLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    const prompt = `${SYSTEM_PROMPT}\n\nTopic: "${topic}"\nCEFR level: ${level}\nUnits to generate: ${count}\nLessons per unit: ${lessonsPerUnit}\n\nReturn ONLY a JSON array of ${count} unit objects.`;

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
      const text = await lmResponse.text();
      throw new Error(`LM Studio error: [${lmResponse.status}] ${text}`);
    }

    const payload: LmStudioChatCompletionResponse = await lmResponse.json();
    const text = extractAssistantText(payload);
    if (!text) throw new Error("Empty response from LM Studio");

    let jsonText = text.trim();
    const codeBlock = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlock) jsonText = codeBlock[1].trim();

    let units: any[];
    try {
      units = JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse units JSON", { snippet: jsonText.substring(0, 1000) });
      throw e;
    }

    if (!Array.isArray(units)) throw new Error("Expected JSON array of units");

    // Normalize structure
    const normalized = units.slice(0, count).map((u: any) => ({
      title: String(u.title || "Untitled Unit"),
      description: String(u.description || ""),
      cefr_level: String(u.cefr_level || level),
      lessons: Array.isArray(u.lessons)
        ? u.lessons.slice(0, lessonsPerUnit).map((l: any) => ({
            title: String(l.title || "Lesson"),
            target_skill: String(l.target_skill || "grammar"),
          }))
        : [],
    }));

    return NextResponse.json({ success: true, count: normalized.length, units: normalized });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("generate-units error:", message);
    return NextResponse.json({ error: "Failed to generate units", details: message }, { status: 500 });
  }
}
