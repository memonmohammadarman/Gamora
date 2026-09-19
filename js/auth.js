// AUTH — session detection, sign up / log in / log out, and keeping every
// page's header in sync with whether someone is logged in. Include this
// (after supabase.js) on every page that has a header.
//
// Other files (favorites.js, recent.js, game.js) call onAuthReady(fn) to
// run their cloud-sync logic once we know who's logged in — fn receives
// (user, profile), both null for a guest. It fires immediately if auth is
// already resolved, and again on every login/logout, so nothing needs a
// page refresh.

let currentUser = null;
let currentProfile = null;
let authResolved = false;
const authReadyCallbacks = [];

function onAuthReady(callback) {
  if (authResolved) callback(currentUser, currentProfile);
  authReadyCallbacks.push(callback);
}

async function fetchProfile(userId) {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}

async function refreshAuthState(user) {
  currentUser = user;
  currentProfile = user ? await fetchProfile(user.id) : null;
  authResolved = true;
  updateAuthHeader();
  authReadyCallbacks.forEach((cb) => cb(currentUser, currentProfile));
}

function updateAuthHeader() {
  document.querySelectorAll(".auth-logged-out").forEach((el) => {
    el.classList.toggle("hidden", !!currentUser);
  });
  document.querySelectorAll(".auth-logged-in").forEach((el) => {
    el.classList.toggle("hidden", !currentUser);
  });
  document.querySelectorAll(".auth-username").forEach((el) => {
    el.textContent = currentProfile ? `👤 ${currentProfile.username}` : "👤 Account";
  });
}

// Fires on every sign-in, sign-out, and token refresh.
// Guarded so that if this script ever gets accidentally included twice on
// the same page, we don't register duplicate listeners.
if (!window.__gamoraAuthInitialized) {
  window.__gamoraAuthInitialized = true;

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    refreshAuthState(session ? session.user : null);
  });

  // Resolve whatever session Supabase already has (it persists sessions in
  // localStorage itself, which is how "stay logged in" works across visits).
  supabaseClient.auth.getSession().then(({ data }) => {
    refreshAuthState(data.session ? data.session.user : null);
  });
}

// ---------- Actions used by login.html / signup.html / profile.html ----------

async function isUsernameTaken(username) {
  const { data } = await supabaseClient
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  return !!data;
}

async function signUpUser(email, password, username) {
  const taken = await isUsernameTaken(username);
  if (taken) {
    return { error: { message: "That username is already taken — try another." } };
  }

  // The username travels in signUp's own metadata so the database trigger
  // (which runs with elevated privileges) can write it straight into the
  // new profile row — no follow-up client update needed, so this works
  // correctly whether or not email confirmation is required.
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  return { data, error };
}

async function logInUser(email, password) {
  return supabaseClient.auth.signInWithPassword({ email, password });
}

async function logOutUser() {
  await supabaseClient.auth.signOut();
  window.location.href = "index.html";
}

async function sendPasswordReset(email) {
  return supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/login.html",
  });
}