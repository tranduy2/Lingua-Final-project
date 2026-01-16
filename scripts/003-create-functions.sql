-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user XP and check streak
CREATE OR REPLACE FUNCTION public.add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER
)
RETURNS void AS $$
DECLARE
  v_last_activity DATE;
  v_today DATE := CURRENT_DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- Get user's last activity date
  SELECT last_activity_date, current_streak, longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM profiles WHERE id = p_user_id;
  
  -- Update streak logic
  IF v_last_activity IS NULL OR v_last_activity < v_today - INTERVAL '1 day' THEN
    v_current_streak := 1;
  ELSIF v_last_activity = v_today - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  END IF;
  
  -- Update longest streak if necessary
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;
  
  -- Update profile
  UPDATE profiles
  SET 
    total_xp = total_xp + p_xp_amount,
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_activity_date = v_today,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Update or insert daily activity
  INSERT INTO user_daily_activity (user_id, activity_date, xp_earned)
  VALUES (p_user_id, v_today, p_xp_amount)
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET xp_earned = user_daily_activity.xp_earned + p_xp_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
