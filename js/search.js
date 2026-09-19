// SEARCH — powers the search box that appears in the header on every page.
// Searches title, category, and description (see searchGames() in
// games.js) and shows results in a small dropdown under the search bar.
// No page navigation needed to search — this works the same on the
// homepage, every category page, and the game page.

function wireSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return; // this page has no search bar (shouldn't happen, but be safe)

  const wrap = input.closest(".search-wrap");
  wrap.style.position = "relative";

  const results = document.createElement("div");
  results.className = "search-results hidden";
  wrap.appendChild(results);

  let debounceTimer = null;

  function runSearch() {
    const query = input.value;
    if (!query.trim()) {
      results.classList.add("hidden");
      return;
    }

    const matches = searchGames(query).slice(0, 8);
    if (matches.length === 0) {
      results.innerHTML = `<p class="search-empty">No games found.</p>`;
    } else {
      results.innerHTML = matches
        .map((g) => {
          const meta = CATEGORY_META[g.category];
          return `
          <a class="search-result" href="game.html?game=${g.id}">
            <span class="search-result-icon">${g.thumbnail}</span>
            <span class="search-result-text">
              <span class="search-result-title">${g.title}</span>
              <span class="search-result-category">${meta.icon} ${meta.title}</span>
            </span>
          </a>`;
        })
        .join("");
    }
    results.classList.remove("hidden");
  }

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 150);
  });

  input.addEventListener("focus", () => {
    if (input.value.trim()) results.classList.remove("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) results.classList.add("hidden");
  });
}

document.addEventListener("DOMContentLoaded", wireSearch);