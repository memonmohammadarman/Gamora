// BLOCK MASTER — classic falling-block stacking.
//
// A 10×17 grid inside the same fixed 400×700 logical canvas every game
// uses. Move with left/right, rotate with a tap/click. Clearing multiple
// lines at once scores a bonus, and gravity speeds up as you clear more
// lines. Follows the same module shape as speed-rush.js.

const COLS = 10;
const ROWS = 17;
const CELL = 40; // 10*40 = 400 wide, 17*40 = 680 tall — fits the canvas with a margin

const SHAPES = {
  I: { cells: [[0, 1], [1, 1], [2, 1], [3, 1]], color: "#3ddccb" },
  O: { cells: [[1, 0], [2, 0], [1, 1], [2, 1]], color: "#f2a71b" },
  T: { cells: [[1, 0], [0, 1], [1, 1], [2, 1]], color: "#c17bff" },
  S: { cells: [[1, 0], [2, 0], [0, 1], [1, 1]], color: "#3ddc97" },
  Z: { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], color: "#ff3d6b" },
  J: { cells: [[0, 0], [0, 1], [1, 1], [2, 1]], color: "#4d9dff" },
  L: { cells: [[2, 0], [0, 1], [1, 1], [2, 1]], color: "#ff9f4d" },
};
const SHAPE_KEYS = Object.keys(SHAPES);

class BlockMasterGame {
  constructor() {
    this.width = 400;
    this.height = 700;
    this.soundEnabled = true;
    this.audioCtx = null;
    this.reset();
  }

  reset() {
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    this.score = 0;
    this.linesCleared = 0;
    this.dropInterval = 0.8;
    this.dropTimer = 0;
    this.finished = false;
    this.input = { left: false, right: false, pointerX: null };
    this._prevPointerActive = false;
    this._moveCooldown = 0;
    this.flashRows = [];
    this.flashTimer = 0;
    this.spawnPiece();
  }

  setInput(input) {
    this.input = input;
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  playTone(freq, duration, type = "sine") {
    if (!this.soundEnabled) return;
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  spawnPiece() {
    const key = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
    const shape = SHAPES[key];
    this.piece = {
      cells: shape.cells.map(([x, y]) => ({ x, y })),
      color: shape.color,
      x: 3,
      y: 0,
    };
    if (this.collides(this.piece, 0, 0)) {
      this.finished = true;
    }
  }

  collides(piece, dx, dy, cells = piece.cells) {
    for (const c of cells) {
      const gx = piece.x + c.x + dx;
      const gy = piece.y + c.y + dy;
      if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
      if (gy >= 0 && this.grid[gy][gx]) return true;
    }
    return false;
  }

  rotate() {
    // Rotate around the piece's local center (1,1) — simple and good enough
    // for a puzzle of this scope; O piece rotates to itself harmlessly.
    const rotated = this.piece.cells.map(({ x, y }) => ({ x: 2 - y, y: x }));
    if (!this.collides(this.piece, 0, 0, rotated)) {
      this.piece.cells = rotated;
      this.playTone(440, 0.05, "square");
    }
  }

  update(dt) {
    if (this.finished) return;

    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) this.finishLineClear();
      return; // pause gameplay briefly while cleared rows flash
    }

    this._moveCooldown -= dt;
    if (this._moveCooldown <= 0) {
      if (this.input.left && !this.collides(this.piece, -1, 0)) {
        this.piece.x -= 1;
        this._moveCooldown = 0.13;
      } else if (this.input.right && !this.collides(this.piece, 1, 0)) {
        this.piece.x += 1;
        this._moveCooldown = 0.13;
      }
    }

    const pointerActive = this.input.pointerX !== null;
    if (pointerActive && !this._prevPointerActive) {
      this.rotate();
    }
    this._prevPointerActive = pointerActive;

    this.dropTimer += dt;
    if (this.dropTimer >= this.dropInterval) {
      this.dropTimer = 0;
      if (!this.collides(this.piece, 0, 1)) {
        this.piece.y += 1;
      } else {
        this.lockPiece();
      }
    }
  }

  lockPiece() {
    for (const c of this.piece.cells) {
      const gx = this.piece.x + c.x;
      const gy = this.piece.y + c.y;
      if (gy >= 0) this.grid[gy][gx] = this.piece.color;
    }
    this.playTone(220, 0.08, "triangle");

    const fullRows = [];
    for (let row = 0; row < ROWS; row++) {
      if (this.grid[row].every((cell) => cell)) fullRows.push(row);
    }

    if (fullRows.length > 0) {
      this.flashRows = fullRows;
      this.flashTimer = 0.25;
      this.playTone(700, 0.15, "sine");
    } else {
      this.spawnPiece();
    }
  }

  finishLineClear() {
    const cleared = this.flashRows.length;
    this.grid = this.grid.filter((_, row) => !this.flashRows.includes(row));
    while (this.grid.length < ROWS) this.grid.unshift(Array(COLS).fill(null));

    const points = [0, 100, 300, 500, 800][cleared] || 800;
    this.score += points;
    this.linesCleared += cleared;
    this.dropInterval = Math.max(0.18, 0.8 - this.linesCleared * 0.04);
    this.flashRows = [];
    this.spawnPiece();
  }

  isOver() {
    return this.finished;
  }

  getScore() {
    return this.score;
  }

  render(ctx) {
    ctx.fillStyle = "#0c0912";
    ctx.fillRect(0, 0, this.width, this.height);

    const offsetY = 10;

    // Locked grid
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = this.grid[row][col];
        const flashing = this.flashRows.includes(row) && this.flashTimer > 0;
        if (cell) {
          ctx.fillStyle = flashing ? "#ffffff" : cell;
          ctx.fillRect(col * CELL + 1, row * CELL + offsetY + 1, CELL - 2, CELL - 2);
        }
      }
    }

    // Falling piece
    if (!this.finished && this.flashTimer <= 0) {
      ctx.fillStyle = this.piece.color;
      for (const c of this.piece.cells) {
        const gx = this.piece.x + c.x;
        const gy = this.piece.y + c.y;
        if (gy >= 0) {
          ctx.fillRect(gx * CELL + 1, gy * CELL + offsetY + 1, CELL - 2, CELL - 2);
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let col = 0; col <= COLS; col++) {
      ctx.beginPath();
      ctx.moveTo(col * CELL, offsetY);
      ctx.lineTo(col * CELL, offsetY + ROWS * CELL);
      ctx.stroke();
    }
  }
}

window.PlayzoneGames = window.PlayzoneGames || {};
window.PlayzoneGames["block-master"] = () => new BlockMasterGame();