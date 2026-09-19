// RECENTLY PLAYED — tracks the last 6 distinct games a player opened, most
// recent first. Works exactly like Stage 4 for guests (localStorage only).
// For logged-in users, this layers Supabase sync underneath the same
// getRecentlyPlayedGames() call everything else already uses.

const RECENT_KEY = "gamora-recent";
const RECENT_LIMIT = 6;

function getRecentIds() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}

function setRecentIds(ids) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, RECENT_LIMIT)));
}

function recordRecentlyPlayed(id) {
  let ids = getRecentIds();
  ids = ids.filter((existingId) => existingId !== id); // dedupe
  ids.unshift(id); // most recent first
  setRecentIds(ids);

  if (currentUser) {
    supabaseClient
      .from("recently_played")
      .upsert(
        { user_id: currentUser.id, game_id: id, played_at: new Date().toISOString() },
        { onConflict: "user_id,game_id" }
      )
      .then(({ error }) => {
        if (error) console.error("Couldn't sync recently played to the cloud:", error);
      });
  }
}

function getRecentlyPlayedGames() {
  return getRecentIds()
    .map((id) => getGameById(id))
    .filter(Boolean);
}

// ---------- Cloud sync (only runs for logged-in users) ----------

async function syncRecentWithCloud(user) {
  try {
    const { data, error } = await supabaseClient
      .from("recently_played")
      .select("game_id, played_at")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .limit(RECENT_LIMIT);
    if (error) throw error;

    const cloudIds = data.map((row) => row.game_id);
    const localIds = getRecentIds();
    // Cloud order wins (it has real timestamps); anything local-only that
    // isn't in the cloud yet gets appended after it, most-recent-local-first.
    const mergedIds = [...cloudIds, ...localIds.filter((id) => !cloudIds.includes(id))].slice(0, RECENT_LIMIT);

    setRecentIds(mergedIds);

    // Push up anything that was only local so the cloud has it too.
    const missingFromCloud = localIds.filter((id) => !cloudIds.includes(id));
    await Promise.all(
      missingFromCloud.map((id) =>
        supabaseClient.from("recently_played").upsert(
          { user_id: user.id, game_id: id, played_at: new Date().toISOString() },
          { onConflict: "user_id,game_id" }
        )
      )
    );

    document.dispatchEvent(new CustomEvent("gamora:recent-synced"));
  } catch (err) {
    console.error("Couldn't sync recently played with the cloud:", err);
  }
}

onAuthReady((user) => {
  if (user) syncRecentWithCloud(user);
});