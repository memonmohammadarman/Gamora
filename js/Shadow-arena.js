// SHADOW ARENA — a one-on-one reaction-timing duel.
//
// The opponent periodically winds up a strike (a red telegraph flash).
// Land a parry — press any control or tap the arena — while the telegraph
// is active to land a hit; miss the window and you take damage instead.
// First fighter to zero health loses. Follows the same module shape as
// speed-rush.js: reset/update/render/isOver/getScore/setInput/setSoundEnabled.

const ARENA_WIDTH = 400;
const ARENA_HEIGHT = 700;

class ShadowArenaGame {
  constructor() {
    this.width = ARENA_WIDTH;
    this.height = ARENA_HEIGHT;
    this.soundEnabled = true;
    this.audioCtx = null;
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.playerHP = 100;
    this.opponentHP = 100;
    this.score = 0;
    this.state = "over"; // "over" (finished, waiting for isOver to be checked)
    this.phase = "idle"; // "idle" | "telegraph" | "resolve"
    this.phaseTimer = randomRange(0.9, 1.6);
    this.telegraphWindow = 0.85; // shrinks as the fight goes on
    this.resolveTimer = 0;
    this.resolveText = "";
    this.resolveColor = "#ffffff";
    this.finished = false;
    this.input = { left: false, right: false, pointerX: null };
    this._prevActing = false;
    this.particles = [];
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
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  isActing() {
    return this.input.left || this.input.right || this.input.pointerX !== null;
  }

  update(dt) {
    if (this.finished) return;
    this.elapsed += dt;
    this.updateParticles(dt);

    const acting = this.isActing();
    const justActed = acting && !this._prevActing;
    this._prevActing = acting;

    if (this.phase === "idle") {
      this.phaseTimer -= dt;
      if (justActed) {
        // Acting too early does nothing punishing — keeps input forgiving.
      }
      if (this.phaseTimer <= 0) {
        this.phase = "telegraph";
        // Fight gets harder over time: shorter windows, floor at 0.35s.
        this.telegraphWindow = Math.max(0.35, 0.85 - this.elapsed * 0.015);
        this.phaseTimer = this.telegraphWindow;
        this.playTone(520, 0.08, "square");
      }
      return;
    }

    if (this.phase === "telegraph") {
      this.phaseTimer -= dt;

      if (justActed) {
        // Successful parry.
        const dmg = 12 + Math.floor(Math.random() * 8);
        this.opponentHP = Math.max(0, this.opponentHP - dmg);
        this.score += dmg * 10;
        this.spawnBurst(this.width / 2, this.height * 0.28, "#3ddc97");
        this.playTone(760, 0.12, "sine");
        this.enterResolve("PARRY!", "#3ddc97");
        return;
      }

      if (this.phaseTimer <= 0) {
        // Missed the window — take the hit.
        const dmg = 8 + Math.floor(Math.random() * 8);
        this.playerHP = Math.max(0, this.playerHP - dmg);
        this.spawnBurst(this.width / 2, this.height * 0.72, "#ff3d6b");
        this.playTone(160, 0.25, "sawtooth");
        this.enterResolve("HIT!", "#ff3d6b");
      }
      return;
    }

    if (this.phase === "resolve") {
      this.phaseTimer -= dt;
      if (this.playerHP <= 0 || this.opponentHP <= 0) {
        if (this.phaseTimer <= 0) this.finished = true;
        return;
      }
      if (this.phaseTimer <= 0) {
        this.phase = "idle";
        this.phaseTimer = Math.max(0.5, randomRange(0.9, 1.6) - this.elapsed * 0.01);
      }
    }
  }

  enterResolve(text, color) {
    this.phase = "resolve";
    this.phaseTimer = 0.5;
    this.resolveText = text;
    this.resolveColor = color;
  }

  spawnBurst(x, y, color) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 120;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        size: 2 + Math.random() * 3,
        color,
      });
    }
  }

  updateParticles(dt) {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  isOver() {
    return this.finished;
  }

  getScore() {
    return this.score;
  }

  render(ctx) {
    // Arena backdrop
    ctx.fillStyle = "#14101c";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.strokeStyle = "#35293f";
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 60, this.width - 40, this.height - 130);

    // Health bars
    this.drawHealthBar(ctx, "OPPONENT", this.opponentHP, 30, "#ff3d6b");
    this.drawHealthBar(ctx, "YOU", this.playerHP, this.height - 60, "#3ddc97");

    // Opponent figure
    const oppFlash = this.phase === "telegraph";
    ctx.fillStyle = oppFlash ? "#ff3d6b" : "#5a4a72";
    ctx.beginPath();
    ctx.roundRect(this.width / 2 - 34, this.height * 0.26, 68, 90, 14);
    ctx.fill();

    // Player figure
    ctx.fillStyle = "#f2a71b";
    ctx.beginPath();
    ctx.roundRect(this.width / 2 - 34, this.height * 0.62, 68, 90, 14);
    ctx.fill();

    // Telegraph warning ring
    if (this.phase === "telegraph") {
      const pct = Math.max(0, this.phaseTimer / this.telegraphWindow);
      ctx.strokeStyle = "#ff3d6b";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(this.width / 2, this.height * 0.26 + 45, 60, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
      ctx.stroke();
    }

    // Resolve text
    if (this.phase === "resolve") {
      ctx.fillStyle = this.resolveColor;
      ctx.font = "bold 28px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(this.resolveText, this.width / 2, this.height / 2);
      ctx.textAlign = "left";
    }

    // Particles
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawHealthBar(ctx, label, hp, y, color) {
    const barX = 40;
    const barW = this.width - 80;
    ctx.fillStyle = "#a89bb5";
    ctx.font = "12px 'Space Grotesk', sans-serif";
    ctx.fillText(label, barX, y - 8);
    ctx.fillStyle = "#211b2e";
    ctx.fillRect(barX, y, barW, 10);
    ctx.fillStyle = color;
    ctx.fillRect(barX, y, barW * (hp / 100), 10);
  }
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

window.PlayzoneGames = window.PlayzoneGames || {};
window.PlayzoneGames["shadow-arena"] = () => new ShadowArenaGame();