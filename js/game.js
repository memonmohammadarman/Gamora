// GAME.HTML CONTROLLER
//
// Runs the game page shell: reads which game was requested in the URL,
// fills in its details from the games.js database, runs the shared state
// machine (start → countdown → playing → game over), and hands off the
// actual gameplay each frame to whichever module is registered for that
// game's gameType in window.PlayzoneGames (see speed-rush.js for how one
// is built). This file's gameplay-facing logic — canvas setup, input
// handling, the state machine, sound, fullscreen, restart — is unchanged
// from Stage 3; everything new in Stage 4 (favorites, rating, plays,
// recently played, related games) is layered on top of it.
//
// To add a second playable game later:
//   1. Write a new js/<your-game>.js following the same shape as speed-rush.js
//      (reset, update, render, isOver, getScore, setInput, setSoundEnabled).
//   2. Register it: window.PlayzoneGames["your-slug"] = () => new YourGame();
//   3. Add a <script src="js/your-game.js"></script> to game.html.
//   4. Set that game's "playable": true in js/games.js.
// Nothing else on this page needs to change.

const params = new URLSearchParams(window.location.search);
const gameId = params.get("game");
const gameData = gameId ? getGameById(gameId) : null;

// ---------- DOM references ----------

const el = (id) => document.getElementById(id);

const canvas = el("gameCanvas");
const ctx = canvas.getContext("2d");
const gameArea = el("gameArea");

const overlayStart = el("overlayStart");
const overlayCountdown = el("overlayCountdown");
const overlayGameOver = el("overlayGameOver");
const overlayComingSoon = el("overlayComingSoon");
const countdownNumber = el("countdownNumber");

const playBtn = el("playBtn");
const playAgainBtn = el("playAgainBtn");
const restartBtn = el("restartBtn");
const fullscreenBtn = el("fullscreenBtn");
const soundBtn = el("soundBtn");
const favBtn = el("gameFavBtn");
const starRow = el("starRow");

const liveScoreEl = el("liveScore");
const liveBestEl = el("liveBest");
const finalScoreEl = el("finalScore");
const finalBestEl = el("finalBest");
const newBestBadge = el("newBestBadge");

// ---------- Fill in the page from the games database ----------

function populatePage() {
  if (!gameData) {
    document.title = "Game not found — PLAYZONE";
    el("gameTitle").textContent = "Game not found";
    el("gameDesc").textContent = "We couldn't find a game for that link. Head back and pick one from a category.";
    el("gameIcon").textContent = "❓";
    el("backLink").textContent = "← Back to home";
    el("backLink").href = "index.html";
    el("statsRow").classList.add("hidden");
    favBtn.classList.add("hidden");
    overlayStart.classList.add("hidden");
    overlayComingSoon.classList.remove("hidden");
    return;
  }

  const meta = CATEGORY_META[gameData.category];

  document.title = `${gameData.title} — PLAYZONE`;
  document.body.style.setProperty("--cat-color", meta.color);
  el("gameIcon").textContent = gameData.thumbnail;
  el("gameTitle").textContent = gameData.title;
  el("gameDesc").textContent = gameData.description;
  el("gameCategoryTag").textContent = `${meta.icon} ${meta.title}`;
  el("gameRating").textContent = `⭐ ${gameData.rating.toFixed(1)}`;
  el("gamePlays").textContent = `${formatPlays(gameData.plays + getLocalPlayCount(gameData.id))} plays`;
  el("gameControls").innerHTML = gameData.playable
    ? (gameData.controls || "<strong>Desktop:</strong> ← / → or A / D to steer &nbsp;·&nbsp; <strong>Mobile:</strong> drag the car or tap the on-screen arrows")
    : "Controls will show here once this game is built.";
  el("backLink").textContent = `← Back to ${meta.title}`;
  el("backLink").href = meta.file;
  el("overlayIcon").textContent = gameData.thumbnail;
  el("overlayStartTitle").textContent = gameData.title.toUpperCase();

  setupFavoriteButton();
  setupStarRating();
  buildRelatedGames();

  // "Opening" a game counts as recently played + one local play, once per page load.
  recordRecentlyPlayed(gameData.id);
  incrementLocalPlayCount(gameData.id);
}

function buildRelatedGames() {
  const grid = el("relatedGrid");
  const related = getRelatedGames(gameData.id, 3);
  renderGameGrid(grid, related, "No other games in this category yet.");
}

// ---------- Favorite heart button ----------

function setupFavoriteButton() {
  const applyState = () => {
    const fav = isFavorite(gameData.id);
    favBtn.textContent = fav ? "♥ Favorited" : "♡ Favorite";
    favBtn.classList.toggle("is-favorite", fav);
  };
  applyState();
  favBtn.addEventListener("click", () => {
    toggleFavorite(gameData.id);
    applyState();
  });
  // Re-apply if a cloud sync (after login) changes the favorite state underneath us.
  document.addEventListener("playzone:favorites-synced", applyState);
}

// ---------- Local play count (demo/local only, not a real global counter) ----------

function getLocalPlayCount(id) {
  return parseInt(localStorage.getItem(`playzone-playcount-${id}`) || "0", 10);
}

function incrementLocalPlayCount(id) {
  const next = getLocalPlayCount(id) + 1;
  localStorage.setItem(`playzone-playcount-${id}`, String(next));
}

// ---------- Your rating (local only — never presented as a global score) ----------

function getUserRating(id) {
  return parseInt(localStorage.getItem(`playzone-rating-${id}`) || "0", 10);
}

function setupStarRating() {
  const stars = Array.from(starRow.querySelectorAll(".star"));
  const applyStars = (value) => {
    stars.forEach((star, i) => star.classList.toggle("filled", i < value));
  };
  applyStars(getUserRating(gameData.id));

  stars.forEach((star, i) => {
    star.addEventListener("click", () => {
      const value = i + 1;
      localStorage.setItem(`playzone-rating-${gameData.id}`, String(value));
      applyStars(value);
    });
  });
}

populatePage();

// ---------- High score ----------

const highScoreKey = gameData ? `playzone-highscore-${gameData.id}` : null;

function loadBest() {
  if (!highScoreKey) return 0;
  return parseInt(localStorage.getItem(highScoreKey) || "0", 10);
}

function saveBest(value) {
  if (!highScoreKey) return;
  localStorage.setItem(highScoreKey, String(value));
}

let bestScore = loadBest();

function formatScore(n) {
  return String(Math.max(0, Math.floor(n))).padStart(4, "0");
}

liveBestEl.textContent = formatScore(bestScore);

// ---------- Cloud sync for high score / plays (logged-in users only) ----------
// Guests keep working exactly as in Stage 4 — everything below only runs
// once we know someone is logged in, layered on top of the existing
// localStorage logic rather than replacing it.

async function syncGameStatsOnLoad(user) {
  try {
    const { data, error } = await supabaseClient
      .from("game_stats")
      .select("high_score")
      .eq("user_id", user.id)
      .eq("game_id", gameData.id)
      .maybeSingle();
    if (error) throw error;

    const cloudBest = data ? data.high_score : 0;
    if (cloudBest > bestScore) {
      // Cloud has a better score (e.g. played on another device) — adopt it locally.
      bestScore = cloudBest;
      saveBest(bestScore);
      liveBestEl.textContent = formatScore(bestScore);
    } else if (bestScore > cloudBest) {
      // This device is ahead (e.g. played as a guest before logging in) — push it up.
      await pushGameStatToCloud(user.id, bestScore, 0);
    }
  } catch (err) {
    console.error("Couldn't load cloud game stats:", err);
  }
}

async function pushGameStatToCloud(userId, highScore, playsIncrement) {
  try {
    const { data } = await supabaseClient
      .from("game_stats")
      .select("plays")
      .eq("user_id", userId)
      .eq("game_id", gameData.id)
      .maybeSingle();
    const newPlays = (data ? data.plays : 0) + playsIncrement;
    await supabaseClient.from("game_stats").upsert(
      {
        user_id: userId,
        game_id: gameData.id,
        high_score: highScore,
        plays: newPlays,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,game_id" }
    );
  } catch (err) {
    console.error("Couldn't save game stats to the cloud:", err);
  }
}

if (gameData) {
  onAuthReady((user) => {
    if (user) syncGameStatsOnLoad(user);
  });
}

// ---------- Sound toggle (persisted across the whole site) ----------

let soundEnabled = localStorage.getItem("playzone-sound-enabled") !== "off";

function applySoundIcon() {
  soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
  soundBtn.classList.toggle("muted", !soundEnabled);
}
applySoundIcon();

soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem("playzone-sound-enabled", soundEnabled ? "on" : "off");
  applySoundIcon();
  if (activeGame) activeGame.setSoundEnabled(soundEnabled);
});

// ---------- Set up the game module (if this game is playable) ----------

const factory = gameData ? window.PlayzoneGames?.[gameData.gameType] : null;
const activeGame = factory ? factory() : null;

if (!activeGame && gameData) {
  // Game exists in the database but has no code behind it yet.
  overlayStart.classList.add("hidden");
  overlayComingSoon.classList.remove("hidden");
} else if (activeGame) {
  activeGame.setSoundEnabled(soundEnabled);
}

// ---------- Canvas sizing ----------
// The game always thinks in a fixed 400x700 space; we just scale the
// canvas's actual pixel resolution to match the screen's pixel density
// so the drawing stays crisp at any size.

function setupCanvasResolution() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 400 * dpr;
  canvas.height = 700 * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
setupCanvasResolution();
window.addEventListener("resize", setupCanvasResolution);

// ---------- Input handling ----------

const input = { left: false, right: false, pointerX: null };

window.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "KeyA"].includes(e.code)) input.left = true;
  if (["ArrowRight", "KeyD"].includes(e.code)) input.right = true;
});
window.addEventListener("keyup", (e) => {
  if (["ArrowLeft", "KeyA"].includes(e.code)) input.left = false;
  if (["ArrowRight", "KeyD"].includes(e.code)) input.right = false;
});

function pointerToLogicalX(clientX) {
  const rect = canvas.getBoundingClientRect();
  return ((clientX - rect.left) / rect.width) * 400;
}

canvas.addEventListener("pointerdown", (e) => {
  input.pointerX = pointerToLogicalX(e.clientX);
});
canvas.addEventListener("pointermove", (e) => {
  if (e.buttons > 0 || e.pointerType === "touch") {
    input.pointerX = pointerToLogicalX(e.clientX);
  }
});
window.addEventListener("pointerup", () => {
  input.pointerX = null;
});

function wireHoldButton(button, key) {
  const press = (e) => { e.preventDefault(); input[key] = true; };
  const release = () => { input[key] = false; };
  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("pointercancel", release);
}
wireHoldButton(el("touchLeft"), "left");
wireHoldButton(el("touchRight"), "right");

// ---------- State machine ----------

const STATE = { START: "start", COUNTDOWN: "countdown", PLAYING: "playing", GAME_OVER: "gameover" };
const COUNTDOWN_STEPS = ["3", "2", "1", "GO!"];
let pageState = STATE.START;
let countdownStep = 0;
let countdownTimer = 0;
let lastFrameTime = null;

function showOnly(overlay) {
  [overlayStart, overlayCountdown, overlayGameOver].forEach((o) => o.classList.add("hidden"));
  if (overlay) overlay.classList.remove("hidden");
}

function goToCountdown() {
  if (!activeGame) return;
  activeGame.reset();
  pageState = STATE.COUNTDOWN;
  countdownStep = 0;
  countdownTimer = 0;
  countdownNumber.textContent = COUNTDOWN_STEPS[0];
  showOnly(overlayCountdown);
}

function goToPlaying() {
  pageState = STATE.PLAYING;
  showOnly(null);
}

function goToGameOver() {
  pageState = STATE.GAME_OVER;
  const score = activeGame.getScore();
  const isNewBest = score > bestScore;
  if (isNewBest) {
    bestScore = score;
    saveBest(bestScore);
  }
  finalScoreEl.textContent = formatScore(score);
  finalBestEl.textContent = formatScore(bestScore);
  liveBestEl.textContent = formatScore(bestScore);
  newBestBadge.classList.toggle("hidden", !isNewBest);
  showOnly(overlayGameOver);

  if (currentUser) pushGameStatToCloud(currentUser.id, bestScore, 1);
}

playBtn.addEventListener("click", goToCountdown);
playAgainBtn.addEventListener("click", goToCountdown);
restartBtn.addEventListener("click", () => {
  if (!activeGame) return;
  if (pageState === STATE.PLAYING || pageState === STATE.GAME_OVER) goToCountdown();
});

fullscreenBtn.addEventListener("click", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    gameArea.requestFullscreen?.();
  }
});

// ---------- Main loop ----------

function frame(time) {
  if (lastFrameTime === null) lastFrameTime = time;
  const dt = Math.min(0.05, (time - lastFrameTime) / 1000);
  lastFrameTime = time;

  if (pageState === STATE.COUNTDOWN) {
    countdownTimer += dt;
    if (countdownTimer >= 0.7) {
      countdownTimer = 0;
      countdownStep += 1;
      if (countdownStep >= COUNTDOWN_STEPS.length) {
        goToPlaying();
      } else {
        countdownNumber.textContent = COUNTDOWN_STEPS[countdownStep];
      }
    }
  } else if (pageState === STATE.PLAYING && activeGame) {
    activeGame.setInput(input);
    activeGame.update(dt);
    liveScoreEl.textContent = formatScore(activeGame.getScore());
    if (activeGame.isOver()) {
      goToGameOver();
    }
  }

  if (activeGame && (pageState === STATE.PLAYING || pageState === STATE.COUNTDOWN)) {
    ctx.clearRect(0, 0, 400, 700);
    activeGame.render(ctx);
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);