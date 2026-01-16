-- Seed sample content for ESL learning

-- Insert Units
INSERT INTO units (id, title, description, cefr_level, order_index, icon) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Getting Started', 'Learn basic greetings and introductions', 'A1', 1, 'wave'),
  ('22222222-2222-2222-2222-222222222222', 'Daily Life', 'Talk about your daily routines and activities', 'A1', 2, 'sun'),
  ('33333333-3333-3333-3333-333333333333', 'Food & Dining', 'Order food and discuss meals', 'A2', 3, 'utensils');

-- Insert Lessons for Unit 1: Getting Started
INSERT INTO lessons (id, unit_id, title, description, learning_outcomes, target_skill, difficulty_level, xp_reward, order_index, estimated_minutes) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Hello & Goodbye', 'Learn basic greetings', ARRAY['Greet people appropriately', 'Say goodbye politely', 'Use formal and informal greetings'], 'vocabulary', 'A1', 15, 1, 5),
  ('aaaa2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'What''s Your Name?', 'Introduce yourself', ARRAY['Ask for someone''s name', 'Introduce yourself', 'Spell your name'], 'speaking', 'A1', 15, 2, 5),
  ('aaaa3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Where Are You From?', 'Talk about where you live', ARRAY['Ask about origin', 'Name countries and cities', 'Use the verb "to be"'], 'grammar', 'A1', 20, 3, 7);

-- Insert Lessons for Unit 2: Daily Life
INSERT INTO lessons (id, unit_id, title, description, learning_outcomes, target_skill, difficulty_level, xp_reward, order_index, estimated_minutes) VALUES
  ('bbbb1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Morning Routine', 'Describe your morning activities', ARRAY['Use present simple for routines', 'Tell time', 'Sequence events'], 'vocabulary', 'A1', 15, 1, 5),
  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'At Work or School', 'Talk about work and study', ARRAY['Describe your job or studies', 'Use basic work vocabulary', 'Ask about occupations'], 'reading', 'A1', 20, 2, 7);

-- Insert Vocabulary for Lesson 1
INSERT INTO vocabulary (lesson_id, word, translation, pronunciation, part_of_speech, example_sentence, difficulty_level) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'Hello', 'Hola (Spanish)', '/həˈloʊ/', 'interjection', 'Hello! How are you?', 'A1'),
  ('aaaa1111-1111-1111-1111-111111111111', 'Goodbye', 'Adiós (Spanish)', '/ɡʊdˈbaɪ/', 'interjection', 'Goodbye! See you tomorrow.', 'A1'),
  ('aaaa1111-1111-1111-1111-111111111111', 'Good morning', 'Buenos días (Spanish)', '/ɡʊd ˈmɔːrnɪŋ/', 'phrase', 'Good morning! Did you sleep well?', 'A1'),
  ('aaaa1111-1111-1111-1111-111111111111', 'Good evening', 'Buenas tardes (Spanish)', '/ɡʊd ˈiːvnɪŋ/', 'phrase', 'Good evening! Welcome to the restaurant.', 'A1'),
  ('aaaa1111-1111-1111-1111-111111111111', 'See you later', 'Hasta luego (Spanish)', '/siː juː ˈleɪtər/', 'phrase', 'See you later! Have a nice day.', 'A1'),
  ('aaaa1111-1111-1111-1111-111111111111', 'Nice to meet you', 'Mucho gusto (Spanish)', '/naɪs tuː miːt juː/', 'phrase', 'Nice to meet you! I''m Sarah.', 'A1');

-- Insert Exercises for Lesson 1
INSERT INTO exercises (lesson_id, type, question, options, correct_answer, explanation, hint, xp_reward, order_index) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'multiple_choice', 'What do you say when you meet someone for the first time?', '["Hello", "Goodbye", "See you later", "Good night"]', 'Hello', 'We use "Hello" as a greeting when we meet someone.', 'Think about the beginning of a conversation.', 5, 1),
  ('aaaa1111-1111-1111-1111-111111111111', 'multiple_choice', 'What is the appropriate greeting in the morning?', '["Good evening", "Good morning", "Good night", "Goodbye"]', 'Good morning', '"Good morning" is used from sunrise until noon.', 'Think about when the sun rises.', 5, 2),
  ('aaaa1111-1111-1111-1111-111111111111', 'fill_blank', 'Complete the sentence: "___ to meet you!"', '["Nice", "Goodbye", "See", "Later"]', 'Nice', 'The phrase "Nice to meet you" is a polite way to greet someone new.', 'This is a friendly phrase for introductions.', 5, 3),
  ('aaaa1111-1111-1111-1111-111111111111', 'matching', 'Match the greeting with the time of day', '{"options": [{"left": "Good morning", "right": "6 AM - 12 PM"}, {"left": "Good afternoon", "right": "12 PM - 6 PM"}, {"left": "Good evening", "right": "6 PM - 9 PM"}]}', '{"Good morning": "6 AM - 12 PM", "Good afternoon": "12 PM - 6 PM", "Good evening": "6 PM - 9 PM"}', 'Different greetings are used at different times of day.', 'Morning is before noon, afternoon is after.', 10, 4),
  ('aaaa1111-1111-1111-1111-111111111111', 'word_order', 'Arrange the words to make a sentence: "you / Nice / meet / to"', '["you", "Nice", "meet", "to"]', 'Nice to meet you', 'The correct order forms a polite greeting phrase.', 'Start with "Nice".', 5, 5),
  ('aaaa1111-1111-1111-1111-111111111111', 'translation', 'How do you say "Hello, how are you?" in a casual way?', '["Hey, how''s it going?", "Good morning, sir", "Goodbye friend", "Nice meeting you"]', 'Hey, how''s it going?', '"Hey, how''s it going?" is an informal way to greet friends.', 'Think about how you greet your friends.', 5, 6);

-- Insert Exercises for Lesson 2
INSERT INTO exercises (lesson_id, type, question, options, correct_answer, explanation, hint, xp_reward, order_index) VALUES
  ('aaaa2222-2222-2222-2222-222222222222', 'multiple_choice', 'How do you ask someone''s name politely?', '["What''s your name?", "Name?", "You who?", "Tell name"]', 'What''s your name?', '"What''s your name?" is the polite way to ask for someone''s name.', 'Use a complete question.', 5, 1),
  ('aaaa2222-2222-2222-2222-222222222222', 'fill_blank', 'Complete: "My ___ is John."', '["name", "call", "say", "speak"]', 'name', 'We use "My name is..." to introduce ourselves.', 'What word means what people call you?', 5, 2),
  ('aaaa2222-2222-2222-2222-222222222222', 'multiple_choice', 'Someone asks "What''s your name?" How do you respond?', '["I''m fine, thanks", "My name is Maria", "Yes, please", "Goodbye"]', 'My name is Maria', 'When asked your name, you respond with "My name is..." or "I''m..."', 'Give information about yourself.', 5, 3);

-- Insert Achievements
INSERT INTO achievements (id, name, description, icon, xp_reward, requirement_type, requirement_value) VALUES
  ('achv1111-1111-1111-1111-111111111111', 'First Steps', 'Complete your first lesson', 'footprints', 50, 'lessons_completed', 1),
  ('achv2222-2222-2222-2222-222222222222', 'Getting Warmed Up', 'Complete 5 lessons', 'fire', 100, 'lessons_completed', 5),
  ('achv3333-3333-3333-3333-333333333333', 'Week Warrior', 'Maintain a 7-day streak', 'calendar', 150, 'streak_days', 7),
  ('achv4444-4444-4444-4444-444444444444', 'XP Hunter', 'Earn 100 XP', 'star', 50, 'total_xp', 100),
  ('achv5555-5555-5555-5555-555555555555', 'XP Master', 'Earn 500 XP', 'trophy', 100, 'total_xp', 500),
  ('achv6666-6666-6666-6666-666666666666', 'Perfect Score', 'Complete a lesson with 100% accuracy', 'target', 75, 'perfect_lessons', 1),
  ('achv7777-7777-7777-7777-777777777777', 'Vocabulary Builder', 'Master 10 vocabulary words', 'book', 100, 'vocabulary_mastered', 10),
  ('achv8888-8888-8888-8888-888888888888', 'Month Warrior', 'Maintain a 30-day streak', 'crown', 500, 'streak_days', 30);
