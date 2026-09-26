import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Public values from Supabase → Project Settings → API.
// The publishable (anon) key is safe in frontend code: Row Level Security protects the data.
// NEVER put the secret / service_role key here.
const SUPABASE_URL = 'https://icphsbadppjnztfxxuui.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ksoiCHmFZ3Mfnf0BNqO_XQ_LlkYj8DF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Same pattern as the database check on allowed_students.roll_no, e.g. 2026CSE102
export const ROLL_NO_PATTERN = /^\d{4}(CSE|CSDS|CSAI|CSIT)\d{3}$/;

// Absolute URL of another page in this site (for email links).
export const pageUrl = (page) => new URL(page, location.href).href;

// Sends logged-out visitors to the login page. Returns the user, or null.
export async function requireUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) location.replace('login.html');
  return session?.user ?? null;
}

export function showMessage(text, ok = false) {
  const el = document.getElementById('msg');
  el.textContent = text;
  el.className = ok ? 'msg ok' : 'msg error';
}
