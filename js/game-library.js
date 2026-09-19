// GAME LIBRARY — turns game data (from games.js) into actual HTML cards,
// and powers every page that shows a grid of games: category pages, the
// homepage's Trending/Recently Played rows, and favorites.html.
//
// This file only knows how to render and wire up cards — it doesn't know
// about favorites or search internally; it calls out to favorites.js for
// the heart button so that logic lives in one place.

// A thumbnail can be an emoji (for now) or a real image path once you add
// artwork — anything containing a "/" is treated as an image file.
function renderThumbnail(game) {
  if (game.thumbnail.includes("/")) {
    return `<img src="${game.thumbnail}" alt="${game.title}" loading="lazy">`;
  }
  return `<span class="card-emoji">${game.thumbnail}</span>`;
}

function createGameCardHTML(game) {
  const meta = CATEGORY_META[game.category];
  const favClass = typeof isFavorite === "function" && isFavorite(game.id) ? "is-favorite" : "";
  const favIcon = typeof isFavorite === "function" && isFavorite(game.id) ? "♥" : "♡";
  const badge = game.playable ? "" : `<span class="card-badge">Coming soon</span>`;

  return `
    <article class="game-card" data-id="${game.id}" style="--card-color:${meta.color};">
      <button class="fav-btn ${favClass}" data-id="${game.id}" aria-label="Toggle favorite">${favIcon}</button>
      <div class="card-thumb">
        ${renderThumbnail(game)}
        ${badge}
      </div>
      <div class="card-body">
        <h3 class="card-title">${game.title}</h3>
        <span class="card-category">${meta.icon} ${meta.title}</span>
        <div class="card-meta">
          <span class="card-rating">⭐ ${game.rating.toFixed(1)}</span>
          <span class="card-plays">${formatPlays(game.plays)} plays</span>
        </div>
        <a class="card-play-btn" href="game.html?game=${game.id}">PLAY →</a>
      </div>
    </article>`;
}

// Renders a list of games into a container. Pass an emptyMessage for
// sections (search, favorites) that need a friendly "nothing here" state.
function renderGameGrid(container, games, emptyMessage = "No games found.") {
  if (!container) return;

  if (games.length === 0) {
    container.innerHTML = `<p class="empty-message">${emptyMessage}</p>`;
    return;
  }

  container.innerHTML = games.map(createGameCardHTML).join("");
  wireGameCardClicks(container);
  if (typeof wireFavoriteButtons === "function") wireFavoriteButtons(container);
}

// Clicking anywhere on a card (other than the heart button, which handles
// its own click) navigates to that game's page.
function wireGameCardClicks(container) {
  container.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".fav-btn")) return;
      if (e.target.closest(".card-play-btn")) return; // let the link navigate natively
      window.location.href = `game.html?game=${card.dataset.id}`;
    });
    card.style.cursor = "pointer";
  });
}

// Renders a full category page: fills in the games grid and the "N games
// in this category" count. Called once from an inline script on each
// category HTML file, e.g. renderCategoryPage("racing").
function renderCategoryPage(categorySlug) {
  const games = getGamesByCategory(categorySlug);
  const grid = document.getElementById("gameGrid");
  renderGameGrid(grid, games, "No games in this category yet.");

  const countEl = document.getElementById("catCount");
  if (countEl) {
    countEl.textContent = `${games.length} game${games.length === 1 ? "" : "s"} in this category`;
  }
}