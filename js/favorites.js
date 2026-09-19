// FAVORITES — a list of game ids. For guests this lives entirely in
// localStorage, exactly as in Stage 4. For logged-in users, this file
// layers Supabase sync UNDERNEATH the same synchronous API everything else
// already calls (isFavorite, toggleFavorite, getFavoriteGames) — so
// game-library.js and game.js needed zero changes to become cloud-aware.
//
// How the sync works:
//   - On login, syncFavoritesWithCloud() merges local + cloud favorites
//     (never deletes local-only favorites) and saves the merged list both
//     to localStorage AND back up to Supabase.
//   - After that, toggleFavorite() keeps updating localStorage immediately
//     (so the UI never waits on a network request) and also pushes the
//     change to Supabase in the background if someone's logged in.
//   - Pages listen for the "playzone:favorites-synced" event to refresh
//     any cards that were already on screen before the cloud data arrived.

const FAVORITES_KEY = "playzone-favorites";

function getFavoriteIds() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

function setFavoriteIds(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

function isFavorite(id) {
  return getFavoriteIds().includes(id);
}

function toggleFavorite(id) {
  const ids = getFavoriteIds();
  const index = ids.indexOf(id);
  const willBeFavorite = index === -1;

  if (willBeFavorite) {
    ids.push(id);
  } else {
    ids.splice(index, 1);
  }
  setFavoriteIds(ids);

  if (currentUser) pushFavoriteToCloud(id, willBeFavorite);
  return willBeFavorite;
}

function getFavoriteGames() {
  return getFavoriteIds()
    .map((id) => getGameById(id))
    .filter(Boolean);
}

// Attaches click handlers to every .fav-btn inside a container. Safe to
// call repeatedly — it only wires buttons that exist right now.
function wireFavoriteButtons(container) {
  container.querySelectorAll(".fav-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const nowFavorite = toggleFavorite(id);
      btn.textContent = nowFavorite ? "♥" : "♡";
      btn.classList.toggle("is-favorite", nowFavorite);
    });
  });
}

// Re-reads localStorage and updates every heart icon already on the page —
// used after a cloud sync brings in favorites that weren't known locally.
function refreshAllFavoriteIcons() {
  document.querySelectorAll(".fav-btn[data-id]").forEach((btn) => {
    const fav = isFavorite(btn.dataset.id);
    btn.textContent = fav ? "♥" : "♡";
    btn.classList.toggle("is-favorite", fav);
  });
}

// ---------- Cloud sync (only runs for logged-in users) ----------

async function pushFavoriteToCloud(gameId, shouldBeFavorite) {
  try {
    if (shouldBeFavorite) {
      await supabaseClient
        .from("favorites")
        .upsert({ user_id: currentUser.id, game_id: gameId }, { onConflict: "user_id,game_id" });
    } else {
      await supabaseClient
        .from("favorites")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("game_id", gameId);
    }
  } catch (err) {
    console.error("Couldn't sync favorite to the cloud:", err);
  }
}

async function syncFavoritesWithCloud(user) {
  try {
    const { data, error } = await supabaseClient
      .from("favorites")
      .select("game_id")
      .eq("user_id", user.id);
    if (error) throw error;

    const cloudIds = data.map((row) => row.game_id);
    const localIds = getFavoriteIds();
    const mergedIds = Array.from(new Set([...localIds, ...cloudIds]));

    setFavoriteIds(mergedIds);

    // Push up anything that was only local so the cloud has the full merged set too.
    const missingFromCloud = mergedIds.filter((id) => !cloudIds.includes(id));
    await Promise.all(missingFromCloud.map((id) => pushFavoriteToCloud(id, true)));

    refreshAllFavoriteIcons();
    document.dispatchEvent(new CustomEvent("playzone:favorites-synced"));
  } catch (err) {
    console.error("Couldn't sync favorites with the cloud:", err);
  }
}

onAuthReady((user) => {
  if (user) syncFavoritesWithCloud(user);
});