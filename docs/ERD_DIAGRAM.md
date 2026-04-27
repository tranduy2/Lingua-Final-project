# Lingua - Sơ Đồ Quan Hệ Thực Thể (ERD)

> **Cập nhật:** 26/04/2026  
> **Hệ thống:** Supabase (PostgreSQL) + Next.js 15

---

## 📊 Sơ Đồ Trực Quan (Mermaid)

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "creates"
    PROFILES ||--o{ USER_LESSON_PROGRESS : "has"
    PROFILES ||--o{ USER_WEAKNESSES : "tracks"
    PROFILES ||--o{ USER_DAILY_ACTIVITY : "logs"
    PROFILES ||--o{ USERS : "extends"
    
    UNITS ||--o{ LESSONS : "contains"
    LESSONS ||--o{ EXERCISES : "contains"
    LESSONS ||--o{ USER_LESSON_PROGRESS : "tracks"
    
    EXERCISES ||--o{ GRAMMAR_RULES : "links_to"
    GRAMMAR_RULES ||--o{ USER_WEAKNESSES : "identifies"

    PROFILES {
        uuid id PK "FK to auth.users"
        text display_name
        text name
        text avatar_url "nullable"
        text role "user | admin"
        int total_xp "default 0"
        int current_streak "default 0"
        text current_level "CEFR: A1-C2"
        date last_active_date
        timestamp created_at
        timestamp updated_at
    }

    UNITS {
        uuid id PK
        text title
        text description
        text cefr_level "A1, A2, B1, B2, C1, C2"
        int order_index "display order"
        bool is_published "default true"
        timestamp created_at
        timestamp updated_at
    }

    LESSONS {
        uuid id PK
        uuid unit_id FK "references units.id"
        text title
        text target_skill "nullable"
        int order_index "order within unit"
        int xp_reward "points on completion"
        timestamp created_at
        timestamp updated_at
    }

    EXERCISES {
        uuid id PK
        uuid lesson_id FK "references lessons.id"
        text type "multiple_choice | fill_blank | word_order | listening | translation"
        text question
        text correct_answer
        jsonb options "JSON array for MC"
        int order_index "order within lesson"
        uuid grammar_rule_id FK "nullable, references grammar_rules.id"
        timestamp created_at
        timestamp updated_at
    }

    GRAMMAR_RULES {
        uuid id PK
        text title "e.g., Past Simple Tense"
        text category "verb_tense | articles | prepositions | etc."
        text explanation "full explanation in English"
        text example_correct "correct sentence"
        text example_incorrect "incorrect sentence"
        text cefr_level "A1-C2"
        text array examples "array of example sentences"
        timestamp created_at
        timestamp updated_at
    }

    USER_WEAKNESSES {
        uuid id PK
        uuid user_id FK "references profiles.id"
        uuid grammar_rule_id FK "references grammar_rules.id"
        int error_count "number of times user answered incorrectly"
        timestamp last_tested_at "last time user encountered this error"
        timestamp created_at
        timestamp updated_at
        unique "user_id + grammar_rule_id"
    }

    USER_LESSON_PROGRESS {
        uuid id PK
        uuid user_id FK "references profiles.id"
        uuid lesson_id FK "references lessons.id"
        text status "not_started | in_progress | completed"
        int xp_earned "actual XP gained"
        int attempts "number of attempts"
        timestamp completed_at "nullable"
        timestamp created_at
        timestamp updated_at
        unique "user_id + lesson_id"
    }

    USER_DAILY_ACTIVITY {
        uuid id PK
        uuid user_id FK "references profiles.id"
        date activity_date
        int xp_earned "total XP for the day"
        int lessons_completed "count"
        int exercises_completed "count"
        timestamp created_at
        unique "user_id + activity_date"
    }

    USERS {
        uuid id PK "FK to profiles.id"
        int hearts "default 5, health system"
        timestamp created_at
    }
```

---

## 📋 Chi Tiết Các Thực Thể (Tables)

### 1. **PROFILES** (Hồ sơ người dùng)
Lưu thông tin cá nhân và chỉ số học tập của người dùng.

| Cột | Kiểu | PK/FK | Mô Tả |
|-----|------|-------|-------|
| `id` | UUID | PK, FK | Khóa chính, liên kết tới `auth.users` |
| `display_name` | TEXT | | Tên hiển thị |
| `name` | TEXT | | Tên đầy đủ (nullable) |
| `avatar_url` | TEXT | | Đường dẫn ảnh đại diện (nullable) |
| `role` | TEXT | | Vai trò: `user` hoặc `admin` |
| `total_xp` | INT | | Tổng XP tích lũy (default 0) |
| `current_streak` | INT | | Số ngày học liên tiếp (default 0) |
| `current_level` | TEXT | | Cấp độ CEFR hiện tại (A1-C2) |
| `last_active_date` | DATE | | Ngày hoạt động gần nhất |
| `created_at` | TIMESTAMP | | Thời gian tạo |
| `updated_at` | TIMESTAMP | | Thời gian cập nhật cuối |

**RLS Policy:** User chỉ có quyền đọc/cập nhật hồ sơ của chính mình.

---

### 2. **AUTH.USERS** (Authentication - Supabase)
Bảng quản lý xác thực người dùng từ Supabase Auth.

| Cột | Mô Tả |
|-----|-------|
| `id` | UUID, khóa chính, liên kết tới `profiles.id` |
| `email` | Email người dùng |
| `encrypted_password` | Mật khẩu mã hóa |
| `email_confirmed_at` | Thời gian xác nhận email |
| `last_sign_in_at` | Lần đăng nhập cuối |

---

### 3. **UNITS** (Chương học tập)
Nhóm các bài học theo cấp độ CEFR.

| Cột | Kiểu | PK/FK | Mô Tả |
|-----|------|-------|-------|
| `id` | UUID | PK | Khóa chính |
| `title` | TEXT | | Tên unit (e.g., "Unit 1: Greetings") |
| `description` | TEXT | | Mô tả nội dung |
| `cefr_level` | TEXT | | Cấp độ: A1, A2, B1, B2, C1, C2 |
| `order_index` | INT | | Thứ tự hiển thị |
| `is_published` | BOOLEAN | | Công khai hay ẩn (default true) |
| `created_at` | TIMESTAMP | | Thời gian tạo |
| `updated_at` | TIMESTAMP | | Thời gian cập nhật cuối |

**RLS Policy:** Người dùng đã xác thực có quyền đọc unit được công khai (is_published = true).

---

### 4. **LESSONS** (Bài học)
Các bài học riêng lẻ trong unit.

| Cột | Kiểu | PK/FK | Mô Tả |
|-----|------|-------|-------|
| `id` | UUID | PK | Khóa chính |
| `unit_id` | UUID | FK | Khóa ngoại → `units.id` |
| `title` | TEXT | | Tên bài học |
| `target_skill` | TEXT | | Kỹ năng mục tiêu (e.g., "listening", "grammar") |
| `order_index` | INT | | Thứ tự trong unit |
| `xp_reward` | INT | | XP thưởng khi hoàn thành |
| `created_at` | TIMESTAMP | | Thời gian tạo |
| `updated_at` | TIMESTAMP | | Thời gian cập nhật cuối |

**RLS Policy:** Người dùng đã xác thực có quyền đọc all lessons.

---

### 5. **EXERCISES** (Bài tập)
Các câu hỏi trong bài học.

| Cột | Kiểu | PK/FK | Mô Tả |
|-----|------|-------|-------|
| `id` | UUID | PK | Khóa chính |
| `lesson_id` | UUID | FK | Khóa ngoại → `lessons.id` |
| `type` | TEXT | | Loại: `multiple_choice`, `fill_blank`, `word_order`, `listening`, `translation` |
| `question` | TEXT | | Nội dung câu hỏi |
| `correct_answer` | TEXT | | Đáp án đúng |
| `options` | JSONB | | Mảng JSON cho multiple choice: `["A", "B", "C", "D"]` |
| `order_index` | INT | | Thứ tự trong bài học |
| `grammar_rule_id` | UUID | FK (nullable) | Khóa ngoại → `grammar_rules.id` |
| `created_at` | TIMESTAMP | | Thời gian tạo |
| `updated_at` | TIMESTAMP | | Thời gian cập nhật cuối |

**RLS Policy:** Người dùng đã xác thực có quyền đọc all exercises.

---

### 6. **GRAMMAR_RULES** (Quy tắc ngữ pháp)
Ngân hàng quy tắc ngữ pháp để phản hồi người dùng.

| Cột | Kiểu | PK/FK | Mô Tả |
|-----|------|-------|-------|
| `id` | UUID | PK | Khóa chính |
| `title` | TEXT | | Tên quy tắc (e.g., "Past Simple Tense") |
| `category` | TEXT | | Danh mục: `verb_tense`, `articles`, `prepositions`, `subject_verb_agreement` |
| `explanation` | TEXT | | Giải thích chi tiết |
| `example_correct` | TEXT | | Ví dụ câu đúng |
| `example_incorrect` | TEXT | | Ví dụ câu sai |
| `cefr_level` | TEXT | | Cấp độ CEFR (A1-C2) |
| `examples` | TEXT[] | | Mảng ví dụ bổ sung (nullable) |
| `created_at` | TIMESTAMP | | Thời gian tạo |
| `updated_at` | TIMESTAMP | | Thời gian cập nhật cuối |

**RLS Policy:** Người dùng đã xác thực có quyền đọc all grammar rules.

---

### 7. **USER_WEAKNESSES** (Điểm yếu của người dùng)
Ghi nhận lỗi sai lặp đi lặp lại về các quy tắc ngữ pháp.

| Cột | Kiểu | PK/FK | Mô Tả |
|-----|------|-------|-------|
| `id` | UUID | PK | Khóa chính |
| `user_id` | UUID | FK | Khóa ngoại → `profiles.id` |
| `grammar_rule_id` | UUID | FK | Khóa ngoại → `grammar_rules.id` |
| `error_count` | INT | | Số lần sai (default 1) |
| `last_tested_at` | TIMESTAMP | | Lần cuối gặp lỗi này |
| `created_at` | TIMESTAMP | | Thời gian tạo |
| `updated_at` | TIMESTAMP | | Thời gian cập nhật cuối |
| **Unique Constraint** | | | `(user_id, grammar_rule_id)` |

**RLS Policy:** Người dùng chỉ có quyền đọc/ghi điểm yếu của chính mình.

---

### 8. **USER_LESSON_PROGRESS** (Tiến độ bài học)
Theo dõi trạng thái hoàn thành bài học của mỗi người dùng.

| Cột | Kiểu | PK/FK | Mô Tả |
|-----|------|-------|-------|
| `id` | UUID | PK | Khóa chính |
| `user_id` | UUID | FK | Khóa ngoại → `profiles.id` |
| `lesson_id` | UUID | FK | Khóa ngoại → `lessons.id` |
| `status` | TEXT | | Trạng thái: `not_started`, `in_progress`, `completed` |
| `xp_earned` | INT | | XP thực tế nhận được |
| `attempts` | INT | | Số lần thử (default 1) |
| `completed_at` | TIMESTAMP | | Thời gian hoàn thành (nullable) |
| `created_at` | TIMESTAMP | | Thời gian tạo |
| `updated_at` | TIMESTAMP | | Thời gian cập nhật cuối |
| **Unique Constraint** | | | `(user_id, lesson_id)` |

**RLS Policy:** Người dùng chỉ có quyền đọc/ghi tiến độ của chính mình.

---

### 9. **USER_DAILY_ACTIVITY** (Hoạt động hàng ngày)
Ghi nhận hoạt động học tập mỗi ngày để xây dựng streak và thống kê.

| Cột | Kiểu | PK/FK | Mô Tả |
|-----|------|-------|-------|
| `id` | UUID | PK | Khóa chính |
| `user_id` | UUID | FK | Khóa ngoại → `profiles.id` |
| `activity_date` | DATE | | Ngày hoạt động |
| `xp_earned` | INT | | Tổng XP kiếm được trong ngày |
| `lessons_completed` | INT | | Số bài học hoàn thành |
| `exercises_completed` | INT | | Số bài tập hoàn thành |
| `created_at` | TIMESTAMP | | Thời gian ghi nhận |
| **Unique Constraint** | | | `(user_id, activity_date)` |

**RLS Policy:** Người dùng chỉ có quyền đọc/ghi hoạt động của chính mình.

---

### 10. **USERS** (Hệ thống Hearts)
Mở rộng thông tin người dùng để lưu hearts (mạng sống).

| Cột | Kiểu | PK/FK | Mô Tả |
|-----|------|-------|-------|
| `id` | UUID | PK, FK | Khóa chính, liên kết tới `profiles.id` |
| `hearts` | INT | | Số mạng sống còn lại (default 5) |
| `created_at` | TIMESTAMP | | Thời gian tạo |

**RLS Policy:** Người dùng chỉ có quyền đọc/ghi hearts của chính mình.

---

## 🔗 Mối Quan Hệ (Relationships)

| Bảng Nguồn | Bảng Đích | Loại | Khóa Ngoại | Mối Quan Hệ |
|------------|-----------|------|-----------|------------|
| `profiles` | `auth.users` | 1:1 | `profiles.id` | Mỗi hồ sơ liên kết tới một user Supabase |
| `lessons` | `units` | N:1 | `lessons.unit_id` | Một unit chứa nhiều lessons |
| `exercises` | `lessons` | N:1 | `exercises.lesson_id` | Một lesson chứa nhiều exercises |
| `exercises` | `grammar_rules` | N:1 | `exercises.grammar_rule_id` | Một exercise có thể liên kết tới một rule (nullable) |
| `user_weaknesses` | `profiles` | N:1 | `user_weaknesses.user_id` | Một user có nhiều điểm yếu |
| `user_weaknesses` | `grammar_rules` | N:1 | `user_weaknesses.grammar_rule_id` | Một rule có thể là điểm yếu của nhiều user |
| `user_lesson_progress` | `profiles` | N:1 | `user_lesson_progress.user_id` | Một user có nhiều tiến độ bài học |
| `user_lesson_progress` | `lessons` | N:1 | `user_lesson_progress.lesson_id` | Một lesson được nhiều user học |
| `user_daily_activity` | `profiles` | N:1 | `user_daily_activity.user_id` | Một user có nhiều record hoạt động hàng ngày |
| `users` | `profiles` | 1:1 | `users.id` | Mỗi user có một record hearts |

---

## 📈 Cấp Độ CEFR & XP Thresholds

```
A1 (Beginner)           → A2 (Elementary)       → B1 (Intermediate)
0 XP                    200 XP                  500 XP
     ↓                       ↓                       ↓
B2 (Upper Intermediate) → C1 (Advanced)         → C2 (Mastery)
1000 XP                 2000 XP                 4000 XP
```

**Tiến độ cấp độ:**
- A1 → A2: 0 - 199 XP
- A2 → B1: 200 - 499 XP
- B1 → B2: 500 - 999 XP
- B2 → C1: 1000 - 1999 XP
- C1 → C2: 2000 - 3999 XP
- C2: 4000+ XP

---

## 🔐 Row Level Security (RLS) Policies

### PROFILES
- **SELECT:** User có thể xem profile của chính mình
- **UPDATE:** User có thể cập nhật profile của chính mình
- **Admin:** Có thể xem tất cả profiles

### UNITS, LESSONS, EXERCISES, GRAMMAR_RULES
- **SELECT:** Public read cho tất cả authenticated users
- **INSERT/UPDATE/DELETE:** Admin only

### USER_WEAKNESSES, USER_LESSON_PROGRESS, USER_DAILY_ACTIVITY, USERS
- **SELECT:** User chỉ xem dữ liệu của chính mình
- **INSERT/UPDATE/DELETE:** User chỉ thay đổi dữ liệu của chính mình

---

## 💡 Quy Ước Đặt Tên

| Yếu Tố | Quy Ước | Ví Dụ |
|--------|--------|-------|
| **Bảng** | snake_case, số nhiều | `user_weaknesses`, `grammar_rules` |
| **Cột** | snake_case, số ít | `user_id`, `created_at` |
| **Primary Key** | `id` | UUID v4 |
| **Foreign Key** | `{table_name}_id` | `user_id`, `lesson_id` |
| **Boolean** | `is_*` hoặc `has_*` | `is_published`, `has_audio` |
| **Timestamp** | `*_at` | `created_at`, `updated_at`, `completed_at` |

---

## 🔄 Migrations & Indices

### Recommended Indices
```sql
-- Performance indices
CREATE INDEX idx_lessons_unit_id ON lessons(unit_id);
CREATE INDEX idx_exercises_lesson_id ON exercises(lesson_id);
CREATE INDEX idx_exercises_grammar_rule_id ON exercises(grammar_rule_id);
CREATE INDEX idx_user_weaknesses_user_id ON user_weaknesses(user_id);
CREATE INDEX idx_user_weaknesses_grammar_rule_id ON user_weaknesses(grammar_rule_id);
CREATE INDEX idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX idx_user_daily_activity_user_id ON user_daily_activity(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Unique constraints
ALTER TABLE user_weaknesses ADD CONSTRAINT unique_user_grammar_rule UNIQUE(user_id, grammar_rule_id);
ALTER TABLE user_lesson_progress ADD CONSTRAINT unique_user_lesson UNIQUE(user_id, lesson_id);
ALTER TABLE user_daily_activity ADD CONSTRAINT unique_user_date UNIQUE(user_id, activity_date);
```

---

## 📝 Ghi Chú

1. **UUID v4** được sử dụng cho tất cả primary keys để đảm bảo tính toàn vẹn dữ liệu phân tán.
2. **JSONB** được dùng cho `exercises.options` để lưu mảng choice.
3. **RLS Policies** được kích hoạt để bảo vệ dữ liệu người dùng.
4. **Soft Delete** có thể được thêm bằng cách thêm cột `deleted_at` nếu cần.
5. **Audit Logging** có thể được triển khai qua Supabase triggers.
