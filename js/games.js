// GAMORA GAME DATABASE
//
// This is the single source of truth for every game on the site. To add a
// new game, add one object here — see the bottom of this file for the
// exact steps. Nothing in this file touches the DOM; it's pure data plus
// small lookup functions, so it's safe to load on every single page.

const CATEGORY_META = {
  "racing": {
    "title": "Racing",
    "icon": "🏎️",
    "color": "#ff6b3d",
    "file": "racing.html",
    "eyebrow": "pedal down"
  },
  "action": {
    "title": "Action",
    "icon": "⚔️",
    "color": "#ff3d6b",
    "file": "action.html",
    "eyebrow": "no time to think"
  },
  "puzzle": {
    "title": "Puzzle",
    "icon": "🧩",
    "color": "#3ddc97",
    "file": "puzzle.html",
    "eyebrow": "slow down and think"
  },
  "sports": {
    "title": "Sports",
    "icon": "🏀",
    "color": "#4d9dff",
    "file": "sports.html",
    "eyebrow": "bring your a-game"
  },
  "dress-up": {
    "title": "Dress Up",
    "icon": "👗",
    "color": "#f2a71b",
    "file": "dressup.html",
    "eyebrow": "make it yours"
  },
  "cooking": {
    "title": "Cooking",
    "icon": "🍔",
    "color": "#ff9f4d",
    "file": "cooking.html",
    "eyebrow": "order up"
  },
  "2-player": {
    "title": "2 Player",
    "icon": "👥",
    "color": "#c17bff",
    "file": "2-player.html",
    "eyebrow": "share the keyboard"
  },
  "multiplayer": {
    "title": "Multiplayer",
    "icon": "🌐",
    "color": "#3ddccb",
    "file": "multiplayer.html",
    "eyebrow": "coming online"
  }
};

const GAMES = [
  {
    "id": "speed-rush",
    "title": "Speed Rush",
    "category": "racing",
    "description": "Dodge traffic and survive as long as possible.",
    "gameType": "speed-rush",
    "thumbnail": "🏎️",
    "featured": true,
    "playable": true,
    "controls": "<strong>Desktop:</strong> ← / → or A / D to steer &nbsp;·&nbsp; <strong>Mobile:</strong> drag the car or tap the on-screen arrows",
    "rating": 4.8,
    "plays": 12500
  },
  {
    "id": "neon-drift",
    "title": "Neon Drift",
    "category": "racing",
    "description": "Drift through a glowing night city chasing the highest combo.",
    "gameType": "neon-drift",
    "thumbnail": "🌃",
    "featured": false,
    "playable": false,
    "rating": 4.5,
    "plays": 8600
  },
  {
    "id": "highway-escape",
    "title": "Highway Escape",
    "category": "racing",
    "description": "Weave through gridlock traffic before the convoy catches up.",
    "gameType": "highway-escape",
    "thumbnail": "🚗",
    "featured": false,
    "playable": false,
    "rating": 4.3,
    "plays": 6400
  },
  {
    "id": "shadow-arena",
    "title": "Shadow Arena",
    "category": "action",
    "description": "One-on-one arena duels built around perfectly timed parries.",
    "gameType": "shadow-arena",
    "thumbnail": "🗡️",
    "featured": true,
    "playable": true,
    "controls": "<strong>Desktop:</strong> Space, any arrow key, or click to parry &nbsp;·&nbsp; <strong>Mobile:</strong> tap the screen the instant the strike flashes",
    "rating": 4.6,
    "plays": 9800
  },
  {
    "id": "robot-strike",
    "title": "Robot Strike",
    "category": "action",
    "description": "Pilot a mech through waves of drones in fast, tense missions.",
    "gameType": "robot-strike",
    "thumbnail": "🤖",
    "featured": false,
    "playable": false,
    "rating": 4.4,
    "plays": 7200
  },
  {
    "id": "galaxy-defender",
    "title": "Galaxy Defender",
    "category": "action",
    "description": "Hold the line against wave after wave of alien raiders.",
    "gameType": "galaxy-defender",
    "thumbnail": "👾",
    "featured": false,
    "playable": false,
    "rating": 4.2,
    "plays": 5100
  },
  {
    "id": "color-connect",
    "title": "Color Connect",
    "category": "puzzle",
    "description": "Link matching colors without crossing the lines.",
    "gameType": "color-connect",
    "thumbnail": "🎨",
    "featured": true,
    "playable": false,
    "rating": 4.7,
    "plays": 11200
  },
  {
    "id": "block-master",
    "title": "Block Master",
    "category": "puzzle",
    "description": "Classic falling-block stacking with a modern combo system.",
    "gameType": "block-master",
    "thumbnail": "🟩",
    "featured": false,
    "playable": true,
    "controls": "<strong>Desktop:</strong> ← / → or A / D to move, click/tap to rotate &nbsp;·&nbsp; <strong>Mobile:</strong> tap the on-screen arrows to move, tap the board to rotate",
    "rating": 4.5,
    "plays": 9300
  },
  {
    "id": "brain-switch",
    "title": "Brain Switch",
    "category": "puzzle",
    "description": "Flip perspective to solve each shifting logic puzzle.",
    "gameType": "brain-switch",
    "thumbnail": "🧠",
    "featured": false,
    "playable": false,
    "rating": 4.3,
    "plays": 6700
  },
  {
    "id": "street-hoops",
    "title": "Street Hoops",
    "category": "sports",
    "description": "Quick 3-point shootouts with a satisfying swish meter.",
    "gameType": "street-hoops",
    "thumbnail": "🏀",
    "featured": true,
    "playable": true,
    "controls": "<strong>Desktop:</strong> Space, any arrow key, or click to shoot &nbsp;·&nbsp; <strong>Mobile:</strong> tap when the meter hits the sweet spot",
    "rating": 4.6,
    "plays": 10400
  },
  {
    "id": "penalty-pro",
    "title": "Penalty Pro",
    "category": "sports",
    "description": "One-touch penalty shootouts against a sharp keeper AI.",
    "gameType": "penalty-pro",
    "thumbnail": "⚽",
    "featured": false,
    "playable": false,
    "rating": 4.4,
    "plays": 8100
  },
  {
    "id": "cricket-clash",
    "title": "Cricket Clash",
    "category": "sports",
    "description": "Time your swing against a full over of tricky deliveries.",
    "gameType": "cricket-clash",
    "thumbnail": "🏏",
    "featured": false,
    "playable": false,
    "rating": 4.2,
    "plays": 5600
  },
  {
    "id": "style-studio",
    "title": "Style Studio",
    "category": "dress-up",
    "description": "Mix tops, bottoms, and accessories into a saved look.",
    "gameType": "style-studio",
    "thumbnail": "👗",
    "featured": true,
    "playable": false,
    "rating": 4.5,
    "plays": 9100
  },
  {
    "id": "runway-royale",
    "title": "Runway Royale",
    "category": "dress-up",
    "description": "Style a model for three themed runway rounds.",
    "gameType": "runway-royale",
    "thumbnail": "👠",
    "featured": false,
    "playable": false,
    "rating": 4.3,
    "plays": 6800
  },
  {
    "id": "closet-queen",
    "title": "Closet Queen",
    "category": "dress-up",
    "description": "Organize a huge original wardrobe and build daily outfits.",
    "gameType": "closet-queen",
    "thumbnail": "🧥",
    "featured": false,
    "playable": false,
    "rating": 4.2,
    "plays": 5400
  },
  {
    "id": "glam-squad",
    "title": "Glam Squad",
    "category": "dress-up",
    "description": "Coordinate hair, makeup, and outfit for a full glam look.",
    "gameType": "glam-squad",
    "thumbnail": "💄",
    "featured": false,
    "playable": false,
    "rating": 4.4,
    "plays": 7300
  },
  {
    "id": "fashion-fix",
    "title": "Fashion Fix",
    "category": "dress-up",
    "description": "Restyle a look to match a client's changing mood board.",
    "gameType": "fashion-fix",
    "thumbnail": "✂️",
    "featured": false,
    "playable": false,
    "rating": 4.1,
    "plays": 4200
  },
  {
    "id": "outfit-odyssey",
    "title": "Outfit Odyssey",
    "category": "dress-up",
    "description": "Dress a traveling character for climates around the world.",
    "gameType": "outfit-odyssey",
    "thumbnail": "🎀",
    "featured": false,
    "playable": false,
    "rating": 4.3,
    "plays": 5900
  },
  {
    "id": "sizzle-kitchen",
    "title": "Sizzle Kitchen",
    "category": "cooking",
    "description": "Juggle multiple orders on a busy short-order grill.",
    "gameType": "sizzle-kitchen",
    "thumbnail": "🍳",
    "featured": true,
    "playable": false,
    "rating": 4.6,
    "plays": 10800
  },
  {
    "id": "bakery-bliss",
    "title": "Bakery Bliss",
    "category": "cooking",
    "description": "Time your bakes and frosting for a picture-perfect display case.",
    "gameType": "bakery-bliss",
    "thumbnail": "🧁",
    "featured": false,
    "playable": false,
    "rating": 4.4,
    "plays": 7900
  },
  {
    "id": "chefs-rush",
    "title": "Chef's Rush",
    "category": "cooking",
    "description": "A rapid-fire plating game against a rising difficulty curve.",
    "gameType": "chefs-rush",
    "thumbnail": "🍽️",
    "featured": false,
    "playable": false,
    "rating": 4.2,
    "plays": 5300
  },
  {
    "id": "flavor-lab",
    "title": "Flavor Lab",
    "category": "cooking",
    "description": "Combine original ingredients to invent new recipes.",
    "gameType": "flavor-lab",
    "thumbnail": "🧪",
    "featured": false,
    "playable": false,
    "rating": 4.3,
    "plays": 6100
  },
  {
    "id": "recipe-rally",
    "title": "Recipe Rally",
    "category": "cooking",
    "description": "Race a friend to complete matching recipe cards first.",
    "gameType": "recipe-rally",
    "thumbnail": "📋",
    "featured": false,
    "playable": false,
    "rating": 4.1,
    "plays": 3900
  },
  {
    "id": "grill-master",
    "title": "Grill Master",
    "category": "cooking",
    "description": "Flip, season, and serve without burning a single order.",
    "gameType": "grill-master",
    "thumbnail": "🔥",
    "featured": false,
    "playable": false,
    "rating": 4.4,
    "plays": 6600
  },
  {
    "id": "duel-zone",
    "title": "Duel Zone",
    "category": "2-player",
    "description": "Split-keyboard arena duels with simple, sharp controls.",
    "gameType": "duel-zone",
    "thumbnail": "🎮",
    "featured": true,
    "playable": false,
    "rating": 4.5,
    "plays": 8300
  },
  {
    "id": "couch-clash",
    "title": "Couch Clash",
    "category": "2-player",
    "description": "Local versus mini-games designed for two on one screen.",
    "gameType": "couch-clash",
    "thumbnail": "🛋️",
    "featured": false,
    "playable": false,
    "rating": 4.3,
    "plays": 6200
  },
  {
    "id": "split-screen-showdown",
    "title": "Split Screen Showdown",
    "category": "2-player",
    "description": "Same-screen racing with rubber-band catch-up mechanics.",
    "gameType": "split-screen-showdown",
    "thumbnail": "🖥️",
    "featured": false,
    "playable": false,
    "rating": 4.2,
    "plays": 5000
  },
  {
    "id": "face-off-arena",
    "title": "Face Off Arena",
    "category": "2-player",
    "description": "Best-of-five sword duels with parry and feint timing.",
    "gameType": "face-off-arena",
    "thumbnail": "🤺",
    "featured": false,
    "playable": false,
    "rating": 4.4,
    "plays": 5800
  },
  {
    "id": "tug-of-war",
    "title": "Tug of War",
    "category": "2-player",
    "description": "Mash and time your pulls to drag your rival off the platform.",
    "gameType": "tug-of-war",
    "thumbnail": "🪢",
    "featured": false,
    "playable": false,
    "rating": 4.1,
    "plays": 4100
  },
  {
    "id": "rival-run",
    "title": "Rival Run",
    "category": "2-player",
    "description": "A side-by-side obstacle sprint built for local bragging rights.",
    "gameType": "rival-run",
    "thumbnail": "🏃",
    "featured": false,
    "playable": false,
    "rating": 4.3,
    "plays": 4900
  },
  {
    "id": "battle-royale-bits",
    "title": "Battle Royale Bits",
    "category": "multiplayer",
    "description": "Shrinking-arena survival built for short online matches.",
    "gameType": "battle-royale-bits",
    "thumbnail": "🎯",
    "featured": true,
    "playable": false,
    "rating": 4.5,
    "plays": 9700
  },
  {
    "id": "arena-legends",
    "title": "Arena Legends",
    "category": "multiplayer",
    "description": "Pick a hero and fight in fast 3v3 online skirmishes.",
    "gameType": "arena-legends",
    "thumbnail": "🛡️",
    "featured": false,
    "playable": false,
    "rating": 4.4,
    "plays": 7600
  },
  {
    "id": "squad-up",
    "title": "Squad Up",
    "category": "multiplayer",
    "description": "Co-op missions that scale with however many friends join.",
    "gameType": "squad-up",
    "thumbnail": "🧑‍🤝‍🧑",
    "featured": false,
    "playable": false,
    "rating": 4.2,
    "plays": 5500
  },
  {
    "id": "global-grid",
    "title": "Global Grid",
    "category": "multiplayer",
    "description": "Turn-based territory control against players worldwide.",
    "gameType": "global-grid",
    "thumbnail": "🌍",
    "featured": false,
    "playable": false,
    "rating": 4.1,
    "plays": 3800
  },
  {
    "id": "party-playground",
    "title": "Party Playground",
    "category": "multiplayer",
    "description": "A rotating set of quick party mini-games for a full lobby.",
    "gameType": "party-playground",
    "thumbnail": "🎈",
    "featured": false,
    "playable": false,
    "rating": 4.3,
    "plays": 5200
  },
  {
    "id": "team-tactics",
    "title": "Team Tactics",
    "category": "multiplayer",
    "description": "Plan moves with teammates in real time, then execute together.",
    "gameType": "team-tactics",
    "thumbnail": "♟️",
    "featured": false,
    "playable": false,
    "rating": 4.2,
    "plays": 4600
  }
];

// ---------- Lookup helpers ----------

function getGameById(id) {
  return GAMES.find((g) => g.id === id) || null;
}

function getGamesByCategory(category) {
  return GAMES.filter((g) => g.category === category);
}

function getFeaturedGames(limit = 8) {
  return GAMES.filter((g) => g.featured).slice(0, limit);
}

function getRelatedGames(id, limit = 3) {
  const game = getGameById(id);
  if (!game) return [];
  return GAMES.filter((g) => g.category === game.category && g.id !== id).slice(0, limit);
}

// Searches title, category (by its display title), and description.
// Returns [] for an empty/whitespace query rather than the whole database.
function searchGames(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return GAMES.filter((g) => {
    const categoryTitle = (CATEGORY_META[g.category]?.title || g.category).toLowerCase();
    return (
      g.title.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      categoryTitle.includes(q) ||
      g.description.toLowerCase().includes(q)
    );
  });
}

// Formats a play count like 12500 as "12.5K". Numbers under 1000 show as-is.
function formatPlays(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

/*
  HOW TO ADD A NEW GAME
  ----------------------
  1. Add one object to the GAMES array above:

     {
       id: "my-new-game",              // unique, lowercase, hyphenated
       title: "My New Game",
       category: "action",             // must match a key in CATEGORY_META
       description: "One friendly sentence about it.",
       gameType: "my-new-game",        // matches the key you'll register in
                                        // window.GamoraGames (see speed-rush.js)
       thumbnail: "🕹️",                // an emoji for now — swap for a real
                                        // image path later, e.g. "assets/images/my-new-game.jpg"
       featured: false,
       playable: false,                // flip to true once step 2 is done
       rating: 5.0,
       plays: 0,
     }

  2. If you want it actually playable (not just a card), create
     js/my-new-game.js following the same shape as speed-rush.js, register
     it with `window.GamoraGames["my-new-game"] = () => new MyNewGame();`,
     and add a <script src="js/my-new-game.js"></script> to game.html.

  That's it — it will automatically show up on its category page, in
  search, in "You may also like", and in the Trending row if featured.
*/