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

// Sends logged-out visitors to login and remembers where they were going.
// While redirecting it never resolves, so the calling page's code simply stops.
export async function requireUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session.user;
  location.replace(`/login.html?next=${encodeURIComponent(location.pathname + location.search)}`);
  return new Promise(() => {});
}

// Where to go after login. Only same-site paths are allowed ("/x", not "//evil.com" or "/\evil.com").
export function nextPage(search = location.search) {
  const next = new URLSearchParams(search).get('next');
  return next && /^\/(?![/\\])/.test(next) ? next : '/marketplace.html';
}

// Writes into the page's #msg element: an inline alert, or a toast if it has class "toast".
export function showMessage(text, ok = false) {
  const el = document.getElementById('msg');
  el.textContent = text;
  el.dataset.tone = ok ? 'ok' : 'error';
  if (el.classList.contains('toast')) {
    el.dataset.show = String(Boolean(text));
    clearTimeout(el.hideTimer);
    el.hideTimer = setTimeout(() => { el.dataset.show = 'false'; }, 4000);
  } else {
    el.hidden = !text;
  }
}

// Disables a button and swaps its label while an action runs.
export async function busy(button, label, action) {
  const original = button.innerHTML;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = label;
  try {
    return await action();
  } finally {
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.innerHTML = original;
  }
}
