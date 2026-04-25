-- 1. Create a table for public profiles linked to Auth
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
CREATE POLICY "Users can view their own data." ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data." ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 4. Create a trigger to automatically insert a user record when a new user signs up
-- Note: This requires 'supabase_functions' extensions or just manual insertion from code.
-- Standard practice is to use a trigger on auth.users:

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
