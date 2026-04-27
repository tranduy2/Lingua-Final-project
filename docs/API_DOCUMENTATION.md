# Lingua API Documentation

## Overview

Lingua is a Next.js 15 app that combines two integration styles:

1. **Direct Supabase access** from client/server components for most database reads and writes.
2. **A small set of Next.js API routes** for AI-powered features and auth/session handling.

The frontend does not rely on a large REST layer. Instead, it queries Supabase tables directly under RLS protection and only calls custom endpoints when business logic or AI processing is needed.

---

## Core Endpoints

### 1) POST /api/check-answer

Description: Kiểm tra đáp án của người dùng, tạo phản hồi AI, trả diff, và cập nhật hearts của user khi câu trả lời sai.

Request Body:
```json
{
  "question": "Yesterday, she ___ (walk) to the store.",
  "userAnswer": "walk",
  "correctAnswer": "walked",
  "grammarRuleExplanation": "Regular verbs in past tense end with -ed",
  "userId": "uuid"
}
```

Response:
```json
{
  "isCorrect": false,
  "feedback": "Chưa đúng rồi. Câu này cần dùng thì quá khứ đơn.",
  "diff": [
    { "word": "walk", "status": "incorrect" },
    { "word": "walked", "status": "missing" }
  ],
  "remainingHearts": 4
}
```

Notes:
- Nếu LM Studio không khả dụng, endpoint fallback sang so khớp exact-match.
- Khi sai, endpoint giảm `hearts` trong bảng `users`.
- Frontend lesson page sau đó gọi thêm logic lưu weakness vào `user_weaknesses`.

---

### 2) POST /api/dictionary

Description: Tra cứu từ vựng theo CEFR level, trả nghĩa, IPA, ví dụ, bản dịch và từ đồng nghĩa.

Request Body:
```json
{
  "word": "curious",
  "userLevel": "B1"
}
```

Response:
```json
{
  "word": "curious",
  "phonetic": "/ˈkjʊr.i.əs/",
  "partOfSpeech": "adjective",
  "definition": "Tò mò, muốn tìm hiểu điều gì đó.",
  "example": "She was curious about the new student.",
  "exampleTranslation": "Cô ấy tò mò về học sinh mới.",
  "synonyms": ["interested", "inquisitive"]
}
```

Notes:
- Frontend gọi endpoint này qua `lookupWord()`.
- AI trả kết quả theo level của người học.

---

### 3) POST /api/admin/generate-exercises

Description: Sinh bài tập mới bằng AI để admin đổ vào bài học.

Request Body:
```json
{
  "topic": "Airport travel",
  "level": "A2",
  "count": 5
}
```

Response:
```json
{
  "success": true,
  "count": 5,
  "exercises": [
    {
      "type": "multiple_choice",
      "question": "...",
      "correct_answer": "...",
      "options": ["...", "...", "...", "..."],
      "explanation": "...",
      "hint": "...",
      "xp_reward": 5
    }
  ]
}
```

Notes:
- Chỉ dùng ở khu vực admin.
- Sau khi sinh xong, admin có thể lưu trực tiếp vào bảng `exercises` bằng Supabase client.

---

### 4) GET /api/unit/[id]

Description: Lấy chi tiết một unit cùng lessons, vocabulary, và exercises con để hiển thị nội dung học.

Request Params:
```text
id = uuid
```

Response:
```json
{
  "id": "uuid",
  "title": "Intro to Nouns",
  "description": "Identify people and objects.",
  "cefr_level": "A1",
  "lessons": [
    {
      "id": "uuid",
      "title": "Common Nouns",
      "vocabulary": [],
      "exercises": []
    }
  ]
}
```

Notes:
- Endpoint này đọc nested relations từ Supabase.
- Nếu unit không tồn tại hoặc bị RLS chặn, trả `404`.

---

### 5) GET /auth/callback

Description: Hoàn tất OAuth login, exchange code lấy session và redirect về trang đích.

Request Params:
```text
code = string
next = string (optional)
```

Response:
- Redirect sang `next` nếu đăng nhập thành công.
- Redirect sang `/login` nếu thất bại.

---

## Direct Supabase Data Access

Các màn hình chính không đi qua REST API mà truy vấn trực tiếp vào Supabase tables:

- `learn`: đọc `units` và nested `lessons`
- `lesson/[lessonId]`: đọc `lessons`, `exercises`, `grammar_rules`, `users`
- `dashboard`: đọc `profiles` và `user_lesson_progress`
- `leaderboard`: đọc `profiles`
- `statistics`: đọc `profiles`, `user_daily_activity`, `user_weaknesses`, `grammar_rules`
- `review`: đọc `user_weaknesses` và `grammar_rules`
- `profile`: đọc `profiles` và `user_weaknesses`
- `admin/curriculum`: CRUD `units` và `lessons`
- `admin/exercises`: CRUD `exercises` và đọc `grammar_rules`, `lessons`
- `admin/grammar-rules`: CRUD `grammar_rules`

---

## Auth Flow

1. User đăng nhập bằng email/password hoặc Google OAuth.
2. OAuth callback đi qua `/auth/callback` để exchange code lấy session.
3. Session được lưu bằng `@supabase/ssr`.
4. Middleware làm mới session trên mỗi request.

---

## RLS Summary

| Table | Access Pattern |
|-------|----------------|
| `profiles` | User chỉ đọc/cập nhật profile của chính mình |
| `units` | Read public nếu `is_published = true` |
| `lessons` | Read public |
| `exercises` | Read public |
| `grammar_rules` | Read public |
| `user_weaknesses` | User chỉ đọc/ghi dữ liệu của chính mình |
| `user_lesson_progress` | User chỉ đọc/ghi dữ liệu của chính mình |
| `user_daily_activity` | User chỉ đọc/ghi dữ liệu của chính mình |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `LM_STUDIO_BASE_URL` | Base URL LM Studio (mặc định: `http://127.0.0.1:1234`) |
| `LM_STUDIO_MODEL` | Model local dùng cho chat completions |
| `LM_STUDIO_API_KEY` | API key cho LM Studio (có thể dùng giá trị bất kỳ nếu local không yêu cầu) |
