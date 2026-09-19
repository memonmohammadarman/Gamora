// SUPABASE CLIENT CONFIGURATION
//
// Paste your project's publishable key below. Both the URL and the
// publishable key are meant to be public — Supabase is designed so this
// key can sit in frontend code; Row Level Security (see supabase-setup.sql)
// is what actually protects user data, not hiding this key. NEVER put your
// secret key (sb_secret_...) here or anywhere else in frontend JavaScript —
// it bypasses RLS entirely.
//
// Where to find the publishable key:
//   Supabase dashboard → your project → Project Settings → API Keys
//     "Publishable key" (starts with sb_publishable_...) → paste below

const SUPABASE_URL = "https://ekzshekbhkfdjlcdavmu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Mv6cDDRGl1QrUkDar5voBw_0NlQgoAU";

// Fail loudly, right here, if the CDN script didn't load — this is the
// actual root cause behind a confusing "onAuthReady is not defined" error
// showing up later in a different file. If you see THIS error instead,
// the fix is checking your internet connection or that this tag is present
// and loaded BEFORE js/supabase.js on the page:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
if (!window.supabase) {
  throw new Error(
    "GAMORA: the Supabase library (supabase-js) did not load. " +
    "Check your internet connection and that the CDN <script> tag loads before js/supabase.js."
  );
}

// Fail loudly and specifically if the publishable key placeholder was never
// replaced — this is a deliberate, clear configuration error, not a crash.
// Without this check, createClient() would accept the placeholder silently
// and every login/signup call would fail later with a confusing 401.


// `supabase` here is the global the CDN script attaches to window — we call
// our actual client `supabaseClient` everywhere else so it's never confused
// with that global.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);    