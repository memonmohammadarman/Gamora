// PROFILE.HTML CONTROLLER
//
// Requires a logged-in user — redirects to login.html for guests. All the
// numbers shown here come from real Supabase data (or, for favorites/
// recently played, from the same localStorage that favorites.js/recent.js
// keep in sync with the cloud) — nothing here is a fake/placeholder number.

const el = (id) => document.getElementById(id);

onAuthReady((user, profile) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  renderProfile(user, profile);
});

async function renderProfile(user, profile) {
  el("profileUsername").textContent = profile?.username || "(no username set)";
  el("profileEmail").textContent = user.email;

  await Promise.all([renderStats(user), renderFavoritesSection(), renderRecentSection()]);
}

async function renderStats(user) {
  try {
    const { data: stats, error } = await supabaseClient
      .from("game_stats")
      .select("game_id, high_score, plays")
      .eq("user_id", user.id);
    if (error) throw error;

    const gamesPlayed = stats.length;
    const bestScore = stats.reduce((max, row) => Math.max(max, row.high_score), 0);
    const favoritesCount = getFavoriteIds().length;

    el("statGamesPlayed").textContent = gamesPlayed;
    el("statFavorites").textContent = favoritesCount;
    el("statBestScore").textContent = bestScore.toLocaleString();
  } catch (err) {
    console.error("Couldn't load stats:", err);
    el("statGamesPlayed").textContent = "—";
    el("statFavorites").textContent = "—";
    el("statBestScore").textContent = "—";
  }
}

function renderFavoritesSection() {
  renderGameGrid(
    el("profileFavGrid"),
    getFavoriteGames(),
    "No favorites yet — tap the heart on any game card to save it here."
  );
}

function renderRecentSection() {
  renderGameGrid(
    el("profileRecentGrid"),
    getRecentlyPlayedGames(),
    "Nothing played yet — jump into a game and it'll show up here."
  );
}

// Cloud data can arrive slightly after the initial render — refresh once it does.
document.addEventListener("gamora:favorites-synced", renderFavoritesSection);
document.addEventListener("gamora:recent-synced", renderRecentSection);

el("logoutBtn").addEventListener("click", logOutUser);