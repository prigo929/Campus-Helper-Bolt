import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = Boolean(supabase);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  university: string;
  major: string;
  year: string;
  avatar_url?: string;
  bio?: string;
  rating: number;
  total_ratings: number;
  created_at: string;
  role?: string;
};

export type Job = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  pay_rate: number;
  pay_type: 'hourly' | 'fixed' | 'negotiable';
  location: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type MarketplaceItem = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'books' | 'notes' | 'exams' | 'equipment' | 'other';
  price: number;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  images?: string[];
  status: 'available' | 'sold' | 'reserved';
  created_at: string;
  updated_at: string;
};

export type ForumPost = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: 'general' | 'academic' | 'events' | 'housing' | 'other';
  views: number;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  started_by: string | null;
  job_id?: string | null;
  marketplace_item_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type Rating = {
  id: string;
  rated_user_id: string;
  rater_user_id: string;
  rating: number;
  comment?: string;
  transaction_type: string;
  transaction_id?: string;
  created_at: string;
};
