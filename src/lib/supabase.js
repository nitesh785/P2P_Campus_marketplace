import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Public values from Supabase → Project Settings → API.
// The anon key is safe in frontend code: Row Level Security protects the data.
// NEVER put the service_role key here.
const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Same pattern as the database check on allowed_students.roll_no, e.g. 2026CSE102
export const ROLL_NO_PATTERN = /^\d{4}(CSE|CSDS|CSAI|CSIT)\d{3}$/;
