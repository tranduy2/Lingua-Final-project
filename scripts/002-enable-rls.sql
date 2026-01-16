-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_activity ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User lesson progress policies
CREATE POLICY "Users can view own lesson progress" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson progress" ON user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress" ON user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- User exercise progress policies
CREATE POLICY "Users can view own exercise progress" ON user_exercise_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise progress" ON user_exercise_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User vocabulary mastery policies
CREATE POLICY "Users can view own vocabulary mastery" ON user_vocabulary_mastery
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary mastery" ON user_vocabulary_mastery
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulary mastery" ON user_vocabulary_mastery
  FOR UPDATE USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User daily activity policies
CREATE POLICY "Users can view own daily activity" ON user_daily_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily activity" ON user_daily_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily activity" ON user_daily_activity
  FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for content tables
CREATE POLICY "Anyone can view units" ON units
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can view lessons" ON lessons
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can view exercises" ON exercises
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view vocabulary" ON vocabulary
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);
