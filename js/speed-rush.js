// SPEED RUSH — a vertical-scrolling avoidance game.
//
// This file only knows how to PLAY one run of the game. It doesn't know
// about start screens, countdowns, or "game over" screens — js/game.js
// handles all of that and just calls into the methods below:
//
//   reset()         — set everything back to the start of a new run
//   update(dt)       — advance the simulation by dt seconds
//   render(ctx)      — draw the current frame
//   isOver()         — true once the crash animation has finished playing
//   getScore()       — the current run's score, as a whole number
//   setInput(input)  — tell the game what the player is pressing right now
//   setSoundEnabled(bool)
//
// Coordinates are all in a fixed 400×700 "logical" space — game.js scales
// the canvas to fit any screen size, so this file never has to think
// about actual pixel sizes.

const LOGICAL_WIDTH = 400;
const LOGICAL_HEIGHT = 700;

class SpeedRushGame {
  constructor() {
    this.width = LOGICAL_WIDTH;
    this.height = LOGICAL_HEIGHT;

    // The road sits in the middle of the canvas with a shoulder on each side.
    this.roadLeft = 40;
    this.roadRight = this.width - 40;
    this.roadWidth = this.roadRight - this.roadLeft;

    this.soundEnabled = true;
    this.audioCtx = null;

    this.reset();
  }

  // ---------- Setup ----------

  reset() {
    this.elapsed = 0;
    this.score = 0;
    this.state = "running"; // "running" | "crashing"
    this.crashTimer = 0;

    this.baseSpeed = 220; // pixels per second the road scrolls at the start
    this.maxSpeed = 620;
    this.spawnTimer = 0;
    this.spawnInterval = 1.1; // seconds between enemy spawns, shrinks over time

    this.laneLineOffset = 0;

    this.player = {
      w: 42,
      h: 66,
      x: this.roadLeft + this.roadWidth / 2 - 21,
      y: this.height - 130,
      vx: 0,
    };

    this.enemies = [];
    this.particles = [];
    this.input = { left: false, right: false, pointerX: null };
  }

  setInput(input) {
    this.input = input;
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  // ---------- Sound (Web Audio, no sound files needed) ----------

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
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  playCrashSound() {
    this.playTone(140, 0.35, "sawtooth");
  }

  // ---------- Update ----------

  update(dt) {
    if (this.state === "crashing") {
      this.crashTimer -= dt;
      this.updateParticles(dt);
      return;
    }

    this.elapsed += dt;

    // Difficulty ramps up smoothly with time, capped so it never gets unfair.
    const speed = Math.min(this.maxSpeed, this.baseSpeed + this.elapsed * 9);
    this.spawnInterval = Math.max(0.45, 1.1 - this.elapsed * 0.02);

    this.score += speed * dt * 0.1;

    this.updatePlayer(dt, speed);
    this.updateRoad(dt, speed);
    this.updateEnemies(dt, speed);
    this.checkCollisions();
  }

  updatePlayer(dt, speed) {
    const accel = 900;
    const friction = 0.86;
    const maxVx = 320;

    if (this.input.pointerX !== null) {
      // Direct drag/touch control: ease toward the pointer's x position.
      const target = this.input.pointerX - this.player.w / 2;
      this.player.x += (target - this.player.x) * Math.min(1, dt * 14);
      this.player.vx = 0;
    } else {
      if (this.input.left) this.player.vx -= accel * dt;
      if (this.input.right) this.player.vx += accel * dt;
      this.player.vx *= friction;
      this.player.vx = Math.max(-maxVx, Math.min(maxVx, this.player.vx));
      this.player.x += this.player.vx * dt;
    }

    const minX = this.roadLeft + 6;
    const maxX = this.roadRight - this.player.w - 6;
    if (this.player.x < minX) { this.player.x = minX; this.player.vx = 0; }
    if (this.player.x > maxX) { this.player.x = maxX; this.player.vx = 0; }
  }

  updateRoad(dt, speed) {
    this.laneLineOffset = (this.laneLineOffset + speed * dt) % 60;
  }

  updateEnemies(dt, speed) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.spawnInterval;
      this.spawnEnemy();
    }

    for (const enemy of this.enemies) {
      enemy.y += (speed + enemy.speedOffset) * dt;
    }
    this.enemies = this.enemies.filter((e) => e.y < this.height + 100);
  }

  spawnEnemy() {
    const w = 42;
    const h = 66;
    const minX = this.roadLeft + 6;
    const maxX = this.roadRight - w - 6;
    const x = minX + Math.random() * (maxX - minX);
    const colors = ["#4d9dff", "#ffd166", "#c17bff", "#3ddc97", "#ff9f4d"];
    this.enemies.push({
      x, y: -h - 20, w, h,
      speedOffset: Math.random() * 60,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  checkCollisions() {
    const p = this.player;
    for (const e of this.enemies) {
      const hit =
        p.x < e.x + e.w &&
        p.x + p.w > e.x &&
        p.y < e.y + e.h &&
        p.y + p.h > e.y;
      if (hit) {
        this.crash();
        return;
      }
    }
  }

  crash() {
    this.state = "crashing";
    this.crashTimer = 0.8;
    this.playCrashSound();
    const cx = this.player.x + this.player.w / 2;
    const cy = this.player.y + this.player.h / 2;
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 160;
      this.particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9,
        size: 2 + Math.random() * 3,
        color: Math.random() > 0.5 ? "#ff9f4d" : "#ff3d6b",
      });
    }
  }

  updateParticles(dt) {
    for (const particle of this.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 200 * dt; // slight gravity for a nicer arc
      particle.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  isOver() {
    return this.state === "crashing" && this.crashTimer <= 0;
  }

  getScore() {
    return Math.floor(this.score);
  }

  // ---------- Render ----------

  render(ctx) {
    this.drawRoad(ctx);
    this.drawEnemies(ctx);
    if (this.state !== "crashing" || this.crashTimer > 0.5) {
      this.drawCar(ctx, this.player.x, this.player.y, "#f2a71b");
    }
    this.drawParticles(ctx);
  }

  drawRoad(ctx) {
    ctx.fillStyle = "#0c0912";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = "#211b2e";
    ctx.fillRect(this.roadLeft, 0, this.roadWidth, this.height);

    // Shoulder edge lines
    ctx.strokeStyle = "#f2a71b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.roadLeft, 0); ctx.lineTo(this.roadLeft, this.height);
    ctx.moveTo(this.roadRight, 0); ctx.lineTo(this.roadRight, this.height);
    ctx.stroke();

    // Scrolling dashed lane lines (two lines dividing the road into 3 lanes)
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 3;
    ctx.setLineDash([22, 18]);
    ctx.lineDashOffset = -this.laneLineOffset;
    const laneX1 = this.roadLeft + this.roadWidth / 3;
    const laneX2 = this.roadLeft + (this.roadWidth * 2) / 3;
    ctx.beginPath();
    ctx.moveTo(laneX1, 0); ctx.lineTo(laneX1, this.height);
    ctx.moveTo(laneX2, 0); ctx.lineTo(laneX2, this.height);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawCar(ctx, x, y, color) {
    const w = this.player.w;
    const h = this.player.h;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();

    ctx.fillStyle = "rgba(12,9,18,0.55)";
    ctx.beginPath();
    ctx.roundRect(x + 6, y + 10, w - 12, 18, 4);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 5, y + h - 12, 8, 6);
    ctx.fillRect(x + w - 13, y + h - 12, 8, 6);
  }

  drawEnemies(ctx) {
    for (const e of this.enemies) {
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.roundRect(e.x, e.y, e.w, e.h, 8);
      ctx.fill();

      ctx.fillStyle = "rgba(12,9,18,0.5)";
      ctx.beginPath();
      ctx.roundRect(e.x + 6, e.y + e.h - 26, e.w - 12, 16, 4);
      ctx.fill();
    }
  }

  drawParticles(ctx) {
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// Register this game so game.js can find it by slug.
window.GamoraGames = window.GamoraGames || {};
window.GamoraGames["speed-rush"] = () => new SpeedRushGame();