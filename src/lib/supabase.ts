import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mpymsolehyodfyamnpqn.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1weW1zb2xlaHlvZGZ5YW1ucHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4OTc1MjMsImV4cCI6MjEwNzQ3MzUyM30.LOwTKgp5lXKZc1lrLFfsWCINxrYVth1WZbbs97PbkxI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
