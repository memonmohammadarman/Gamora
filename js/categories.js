// The single source of truth for every game on GAMORA: title, icon,
// description, which category it belongs to, and whether it's actually
// playable yet. Category pages use this to wire up card clicks; game.html
// uses it to fill in the game page and build the "More games" section.

const GAMES_DATABASE = [
  {
    "slug": "speed-rush",
    "title": "Speed Rush",
    "icon": "🏎️",
    "desc": "Dodge oncoming traffic on a rain-slicked highway and see how far you can push it.",
    "category": "racing",
    "categoryFile": "racing.html",
    "categoryTitle": "Racing",
    "color": "#ff6b3d",
    "playable": true
  },
  {
    "slug": "neon-highway",
    "title": "Neon Highway",
    "icon": "🌃",
    "desc": "Weave through night traffic at top speed before the clock runs out.",
    "category": "racing",
    "categoryFile": "racing.html",
    "categoryTitle": "Racing",
    "color": "#ff6b3d",
    "playable": false
  },
  {
    "slug": "rally-storm",
    "title": "Rally Storm",
    "icon": "🌧️",
    "desc": "Muddy back roads, tight corners, and a rival who never lets up.",
    "category": "racing",
    "categoryFile": "racing.html",
    "categoryTitle": "Racing",
    "color": "#ff6b3d",
    "playable": false
  },
  {
    "slug": "skid-row",
    "title": "Skid Row",
    "icon": "🛞",
    "desc": "Old-school arcade racing with tight tracks and instant restarts.",
    "category": "racing",
    "categoryFile": "racing.html",
    "categoryTitle": "Racing",
    "color": "#ff6b3d",
    "playable": false
  },
  {
    "slug": "nitro-loop",
    "title": "Nitro Loop",
    "icon": "🔥",
    "desc": "Time your nitro boosts to clear loops and ramps in one run.",
    "category": "racing",
    "categoryFile": "racing.html",
    "categoryTitle": "Racing",
    "color": "#ff6b3d",
    "playable": false
  },
  {
    "slug": "canyon-run",
    "title": "Canyon Run",
    "icon": "🏜️",
    "desc": "Race the sunset across desert cliffs with nowhere to slow down.",
    "category": "racing",
    "categoryFile": "racing.html",
    "categoryTitle": "Racing",
    "color": "#ff6b3d",
    "playable": false
  },
  {
    "slug": "shadow-blade",
    "title": "Shadow Blade",
    "icon": "🗡️",
    "desc": "A fast side-scrolling brawler built around perfect parries.",
    "category": "action",
    "categoryFile": "action.html",
    "categoryTitle": "Action",
    "color": "#ff3d6b",
    "playable": false
  },
  {
    "slug": "blaze-runner",
    "title": "Blaze Runner",
    "icon": "🔥",
    "desc": "Outrun a collapsing tower, floor by floor, before it's too late.",
    "category": "action",
    "categoryFile": "action.html",
    "categoryTitle": "Action",
    "color": "#ff3d6b",
    "playable": false
  },
  {
    "slug": "iron-fist-arena",
    "title": "Iron Fist Arena",
    "icon": "🥊",
    "desc": "One-on-one arena fights with a stamina system that rewards patience.",
    "category": "action",
    "categoryFile": "action.html",
    "categoryTitle": "Action",
    "color": "#ff3d6b",
    "playable": false
  },
  {
    "slug": "void-hunter",
    "title": "Void Hunter",
    "icon": "🌑",
    "desc": "Track enemies through a shifting dark maze using sound cues.",
    "category": "action",
    "categoryFile": "action.html",
    "categoryTitle": "Action",
    "color": "#ff3d6b",
    "playable": false
  },
  {
    "slug": "steel-rebellion",
    "title": "Steel Rebellion",
    "icon": "🤖",
    "desc": "Pilot a mech through waves of drones in short, tense missions.",
    "category": "action",
    "categoryFile": "action.html",
    "categoryTitle": "Action",
    "color": "#ff3d6b",
    "playable": false
  },
  {
    "slug": "crimson-strike",
    "title": "Crimson Strike",
    "icon": "🩸",
    "desc": "Precision combo attacks against bosses with real weak points.",
    "category": "action",
    "categoryFile": "action.html",
    "categoryTitle": "Action",
    "color": "#ff3d6b",
    "playable": false
  },
  {
    "slug": "block-cascade",
    "title": "Block Cascade",
    "icon": "🟩",
    "desc": "Classic falling-block stacking with a modern combo system.",
    "category": "puzzle",
    "categoryFile": "puzzle.html",
    "categoryTitle": "Puzzle",
    "color": "#3ddc97",
    "playable": false
  },
  {
    "slug": "mind-maze",
    "title": "Mind Maze",
    "icon": "🧠",
    "desc": "Rotate maze panels to guide a light beam to its exit.",
    "category": "puzzle",
    "categoryFile": "puzzle.html",
    "categoryTitle": "Puzzle",
    "color": "#3ddc97",
    "playable": false
  },
  {
    "slug": "gem-cipher",
    "title": "Gem Cipher",
    "icon": "💎",
    "desc": "Match encrypted gem patterns to crack each level's code.",
    "category": "puzzle",
    "categoryFile": "puzzle.html",
    "categoryTitle": "Puzzle",
    "color": "#3ddc97",
    "playable": false
  },
  {
    "slug": "loop-logic",
    "title": "Loop Logic",
    "icon": "🔁",
    "desc": "Connect circuit pieces before the power runs out.",
    "category": "puzzle",
    "categoryFile": "puzzle.html",
    "categoryTitle": "Puzzle",
    "color": "#3ddc97",
    "playable": false
  },
  {
    "slug": "pixel-puzzle",
    "title": "Pixel Puzzle",
    "icon": "🖼️",
    "desc": "Reassemble scrambled pixel art against a gentle timer.",
    "category": "puzzle",
    "categoryFile": "puzzle.html",
    "categoryTitle": "Puzzle",
    "color": "#3ddc97",
    "playable": false
  },
  {
    "slug": "shape-shift",
    "title": "Shape Shift",
    "icon": "🔺",
    "desc": "Rotate and fit shapes into impossible-looking sockets.",
    "category": "puzzle",
    "categoryFile": "puzzle.html",
    "categoryTitle": "Puzzle",
    "color": "#3ddc97",
    "playable": false
  },
  {
    "slug": "court-kings",
    "title": "Court Kings",
    "icon": "🏀",
    "desc": "Quick 3-point shootouts with a satisfying swish meter.",
    "category": "sports",
    "categoryFile": "sports.html",
    "categoryTitle": "Sports",
    "color": "#4d9dff",
    "playable": false
  },
  {
    "slug": "home-run-derby",
    "title": "Home Run Derby",
    "icon": "⚾",
    "desc": "Time your swing against increasingly tricky pitches.",
    "category": "sports",
    "categoryFile": "sports.html",
    "categoryTitle": "Sports",
    "color": "#4d9dff",
    "playable": false
  },
  {
    "slug": "goal-rush",
    "title": "Goal Rush",
    "icon": "⚽",
    "desc": "One-touch penalty shootouts against a sharp keeper AI.",
    "category": "sports",
    "categoryFile": "sports.html",
    "categoryTitle": "Sports",
    "color": "#4d9dff",
    "playable": false
  },
  {
    "slug": "slam-dunk-arena",
    "title": "Slam Dunk Arena",
    "icon": "🏆",
    "desc": "Chain trick dunks together for style points and combos.",
    "category": "sports",
    "categoryFile": "sports.html",
    "categoryTitle": "Sports",
    "color": "#4d9dff",
    "playable": false
  },
  {
    "slug": "ace-serve",
    "title": "Ace Serve",
    "icon": "🎾",
    "desc": "Fast rally-based tennis built for quick matches.",
    "category": "sports",
    "categoryFile": "sports.html",
    "categoryTitle": "Sports",
    "color": "#4d9dff",
    "playable": false
  },
  {
    "slug": "field-frenzy",
    "title": "Field Frenzy",
    "icon": "🏈",
    "desc": "Call your play and dodge tacklers on the way to the end zone.",
    "category": "sports",
    "categoryFile": "sports.html",
    "categoryTitle": "Sports",
    "color": "#4d9dff",
    "playable": false
  },
  {
    "slug": "style-studio",
    "title": "Style Studio",
    "icon": "👗",
    "desc": "Mix tops, bottoms, and accessories into a saved look.",
    "category": "dress-up",
    "categoryFile": "dressup.html",
    "categoryTitle": "Dress Up",
    "color": "#f2a71b",
    "playable": false
  },
  {
    "slug": "runway-royale",
    "title": "Runway Royale",
    "icon": "👠",
    "desc": "Style a model for three themed runway rounds.",
    "category": "dress-up",
    "categoryFile": "dressup.html",
    "categoryTitle": "Dress Up",
    "color": "#f2a71b",
    "playable": false
  },
  {
    "slug": "closet-queen",
    "title": "Closet Queen",
    "icon": "🧥",
    "desc": "Organize a huge original wardrobe and build daily outfits.",
    "category": "dress-up",
    "categoryFile": "dressup.html",
    "categoryTitle": "Dress Up",
    "color": "#f2a71b",
    "playable": false
  },
  {
    "slug": "glam-squad",
    "title": "Glam Squad",
    "icon": "💄",
    "desc": "Coordinate hair, makeup, and outfit for a full glam look.",
    "category": "dress-up",
    "categoryFile": "dressup.html",
    "categoryTitle": "Dress Up",
    "color": "#f2a71b",
    "playable": false
  },
  {
    "slug": "fashion-fix",
    "title": "Fashion Fix",
    "icon": "✂️",
    "desc": "Restyle a look to match a client's changing mood board.",
    "category": "dress-up",
    "categoryFile": "dressup.html",
    "categoryTitle": "Dress Up",
    "color": "#f2a71b",
    "playable": false
  },
  {
    "slug": "outfit-odyssey",
    "title": "Outfit Odyssey",
    "icon": "🎀",
    "desc": "Dress a traveling character for climates around the world.",
    "category": "dress-up",
    "categoryFile": "dressup.html",
    "categoryTitle": "Dress Up",
    "color": "#f2a71b",
    "playable": false
  },
  {
    "slug": "sizzle-kitchen",
    "title": "Sizzle Kitchen",
    "icon": "🍳",
    "desc": "Juggle multiple orders on a busy short-order grill.",
    "category": "cooking",
    "categoryFile": "cooking.html",
    "categoryTitle": "Cooking",
    "color": "#ff9f4d",
    "playable": false
  },
  {
    "slug": "bakery-bliss",
    "title": "Bakery Bliss",
    "icon": "🧁",
    "desc": "Time your bakes and frosting for a picture-perfect display case.",
    "category": "cooking",
    "categoryFile": "cooking.html",
    "categoryTitle": "Cooking",
    "color": "#ff9f4d",
    "playable": false
  },
  {
    "slug": "chef-s-rush",
    "title": "Chef's Rush",
    "icon": "🍽️",
    "desc": "A rapid-fire plating game against a rising difficulty curve.",
    "category": "cooking",
    "categoryFile": "cooking.html",
    "categoryTitle": "Cooking",
    "color": "#ff9f4d",
    "playable": false
  },
  {
    "slug": "flavor-lab",
    "title": "Flavor Lab",
    "icon": "🧪",
    "desc": "Combine original ingredients to invent new recipes.",
    "category": "cooking",
    "categoryFile": "cooking.html",
    "categoryTitle": "Cooking",
    "color": "#ff9f4d",
    "playable": false
  },
  {
    "slug": "recipe-rally",
    "title": "Recipe Rally",
    "icon": "📋",
    "desc": "Race a friend to complete matching recipe cards first.",
    "category": "cooking",
    "categoryFile": "cooking.html",
    "categoryTitle": "Cooking",
    "color": "#ff9f4d",
    "playable": false
  },
  {
    "slug": "grill-master",
    "title": "Grill Master",
    "icon": "🔥",
    "desc": "Flip, season, and serve without burning a single order.",
    "category": "cooking",
    "categoryFile": "cooking.html",
    "categoryTitle": "Cooking",
    "color": "#ff9f4d",
    "playable": false
  },
  {
    "slug": "duel-zone",
    "title": "Duel Zone",
    "icon": "🎮",
    "desc": "Split-keyboard arena duels with simple, sharp controls.",
    "category": "2-player",
    "categoryFile": "2-player.html",
    "categoryTitle": "2 Player",
    "color": "#c17bff",
    "playable": false
  },
  {
    "slug": "couch-clash",
    "title": "Couch Clash",
    "icon": "🛋️",
    "desc": "Local versus mini-games designed for two on one screen.",
    "category": "2-player",
    "categoryFile": "2-player.html",
    "categoryTitle": "2 Player",
    "color": "#c17bff",
    "playable": false
  },
  {
    "slug": "split-screen-showdown",
    "title": "Split Screen Showdown",
    "icon": "🖥️",
    "desc": "Same-screen racing with rubber-band catch-up mechanics.",
    "category": "2-player",
    "categoryFile": "2-player.html",
    "categoryTitle": "2 Player",
    "color": "#c17bff",
    "playable": false
  },
  {
    "slug": "face-off-arena",
    "title": "Face Off Arena",
    "icon": "🤺",
    "desc": "Best-of-five sword duels with parry and feint timing.",
    "category": "2-player",
    "categoryFile": "2-player.html",
    "categoryTitle": "2 Player",
    "color": "#c17bff",
    "playable": false
  },
  {
    "slug": "tug-of-war",
    "title": "Tug of War",
    "icon": "🪢",
    "desc": "Mash and time your pulls to drag your rival off the platform.",
    "category": "2-player",
    "categoryFile": "2-player.html",
    "categoryTitle": "2 Player",
    "color": "#c17bff",
    "playable": false
  },
  {
    "slug": "rival-run",
    "title": "Rival Run",
    "icon": "🏃",
    "desc": "A side-by-side obstacle sprint built for local bragging rights.",
    "category": "2-player",
    "categoryFile": "2-player.html",
    "categoryTitle": "2 Player",
    "color": "#c17bff",
    "playable": false
  },
  {
    "slug": "battle-royale-bits",
    "title": "Battle Royale Bits",
    "icon": "🎯",
    "desc": "Shrinking-arena survival built for short online matches.",
    "category": "multiplayer",
    "categoryFile": "multiplayer.html",
    "categoryTitle": "Multiplayer",
    "color": "#3ddccb",
    "playable": false
  },
  {
    "slug": "arena-legends",
    "title": "Arena Legends",
    "icon": "🛡️",
    "desc": "Pick a hero and fight in fast 3v3 online skirmishes.",
    "category": "multiplayer",
    "categoryFile": "multiplayer.html",
    "categoryTitle": "Multiplayer",
    "color": "#3ddccb",
    "playable": false
  },
  {
    "slug": "squad-up",
    "title": "Squad Up",
    "icon": "🧑‍🤝‍🧑",
    "desc": "Co-op missions that scale with however many friends join.",
    "category": "multiplayer",
    "categoryFile": "multiplayer.html",
    "categoryTitle": "Multiplayer",
    "color": "#3ddccb",
    "playable": false
  },
  {
    "slug": "global-grid",
    "title": "Global Grid",
    "icon": "🌍",
    "desc": "Turn-based territory control against players worldwide.",
    "category": "multiplayer",
    "categoryFile": "multiplayer.html",
    "categoryTitle": "Multiplayer",
    "color": "#3ddccb",
    "playable": false
  },
  {
    "slug": "party-playground",
    "title": "Party Playground",
    "icon": "🎈",
    "desc": "A rotating set of quick party mini-games for a full lobby.",
    "category": "multiplayer",
    "categoryFile": "multiplayer.html",
    "categoryTitle": "Multiplayer",
    "color": "#3ddccb",
    "playable": false
  },
  {
    "slug": "team-tactics",
    "title": "Team Tactics",
    "icon": "♟️",
    "desc": "Plan moves with teammates in real time, then execute together.",
    "category": "multiplayer",
    "categoryFile": "multiplayer.html",
    "categoryTitle": "Multiplayer",
    "color": "#3ddccb",
    "playable": false
  }
];

// Look up one game by its slug (the ?game= value in the URL).
function getGameBySlug(slug) {
  return GAMES_DATABASE.find((g) => g.slug === slug) || null;
}

// All other games in the same category, for the "More games" row.
function getRelatedGames(slug, limit = 3) {
  const game = getGameBySlug(slug);
  if (!game) return [];
  return GAMES_DATABASE.filter(
    (g) => g.category === game.category && g.slug !== slug
  ).slice(0, limit);
}

// Wire up every .game-card on a category page so clicking the card OR its
// Play button both navigate to the right game page. Runs once per page load.
function wireGameCards() {
  document.querySelectorAll(".game-card[data-slug]").forEach((card) => {
    const slug = card.dataset.slug;
    const goToGame = () => {
      window.location.href = `game.html?game=${slug}`;
    };

    const playBtn = card.querySelector(".play-btn");
    if (playBtn) {
      playBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        goToGame();
      });
    }

    card.style.cursor = "pointer";
    card.addEventListener("click", goToGame);
  });
}

document.addEventListener("DOMContentLoaded", wireGameCards);