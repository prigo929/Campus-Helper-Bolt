/*
  # Military Helper Platform Schema

  1. New Tables
    - `profiles` - User profiles with ratings
    - `jobs` - Part-time job listings
    - `marketplace_items` - Items for sale
    - `forum_posts` - Community forum posts
    - `forum_comments` - Comments on forum posts
    - `ratings` - User ratings and reviews

  2. Security
    - Enable RLS on all tables
    - Authenticated users can read most content
    - Users can only modify their own content
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  university text NOT NULL,
  major text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  avatar_url text,
  bio text,
  rating numeric DEFAULT 0,
  total_ratings integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);