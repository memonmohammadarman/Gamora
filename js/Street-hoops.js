// STREET HOOPS — a timing-meter shootout.
//
// A marker bounces back and forth along a power bar. Shoot (any control or
// a tap) when it's in the sweet spot for a swish, the wider zone for a
// make, or elsewhere for a miss. 10 attempts, then the run ends and the
// final score stands. Follows the same module shape as speed-rush.js.

const HOOPS_WIDTH = 400;
const HOOPS_HEIGHT = 700;
const TOTAL_ATTEMPTS = 10;

class StreetHoopsGame {
  constructor() {
    this.width = HOOPS_WIDTH;
    this.height = HOOPS_HEIGHT;
    this.soundEnabled = true;
    this.audioCtx = null;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.attempt = 1;
    this.finished = false;
    this.markerPos = 0; // 0..1 along the bar
    this.markerDir = 1;
    this.markerSpeed = 0.55; // cycles per second-ish, ramps up slightly
    this.resultText = "";
    this.resultTimer = 0;
    this.resultColor = "#ffffff";
    this.ballAnim = 0; // 0 = ready, >0 = mid-shot animation
    this.input = { left: false, right: false, pointerX: null };
    this._prevActing = false;
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

    if (this.resultTimer > 0) {
      this.resultTimer -= dt;
      if (this.resultTimer <= 0) {
        if (this.attempt >= TOTAL_ATTEMPTS) {
          this.finished = true;
        } else {
          this.attempt += 1;
          this.markerPos = 0;
          this.markerDir = 1;
        }
      }
      return;
    }

    // Bounce the marker back and forth, speeding up slightly each attempt.
    const speed = this.markerSpeed + (this.attempt - 1) * 0.03;
    this.markerPos += this.markerDir * speed * dt;
    if (this.markerPos >= 1) { this.markerPos = 1; this.markerDir = -1; }
    if (this.markerPos <= 0) { this.markerPos = 0; this.markerDir = 1; }

    const acting = this.isActing();
    const justActed = acting && !this._prevActing;
    this._prevActing = acting;

    if (justActed) {
      this.resolveShot();
    }
  }

  resolveShot() {
    const pos = this.markerPos;
    // Sweet spot centered at 0.5; swish zone narrow, make zone wider.
    const distFromCenter = Math.abs(pos - 0.5);
    let points, text, color;

    if (distFromCenter < 0.06) {
      points = 3; text = "SWISH! +3"; color = "#3ddc97";
      this.playTone(880, 0.15, "sine");
    } else if (distFromCenter < 0.16) {
      points = 2; text = "MAKE! +2"; color = "#4d9dff";
      this.playTone(660, 0.12, "sine");
    } else {
      points = 0; text = "MISS"; color = "#ff3d6b";
      this.playTone(180, 0.2, "sawtooth");
    }

    this.score += points;
    this.resultText = text;
    this.resultColor = color;
    this.resultTimer = 0.7;
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

    // Hoop
    ctx.strokeStyle = "#ff9f4d";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(this.width / 2, 140, 46, 0, Math.PI * 2);
    ctx.stroke();

    // Attempt counter
    ctx.fillStyle = "#a89bb5";
    ctx.font = "14px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Shot ${this.attempt} of ${TOTAL_ATTEMPTS}`, this.width / 2, 230);

    // Power bar
    const barX = 60;
    const barY = 420;
    const barW = this.width - 120;
    const barH = 26;

    ctx.fillStyle = "#211b2e";
    ctx.fillRect(barX, barY, barW, barH);

    // Make zone (wide) then swish zone (narrow), both centered
    ctx.fillStyle = "rgba(77,157,255,0.35)";
    ctx.fillRect(barX + barW * 0.34, barY, barW * 0.32, barH);
    ctx.fillStyle = "rgba(61,220,151,0.55)";
    ctx.fillRect(barX + barW * 0.44, barY, barW * 0.12, barH);

    // Marker
    const markerX = barX + this.markerPos * barW;
    ctx.fillStyle = "#f2a71b";
    ctx.beginPath();
    ctx.roundRect(markerX - 4, barY - 8, 8, barH + 16, 4);
    ctx.fill();

    ctx.fillStyle = "#a89bb5";
    ctx.font = "12px 'Space Grotesk', sans-serif";
    ctx.fillText("Tap when the marker is centered", this.width / 2, barY + barH + 30);

    // Result text
    if (this.resultTimer > 0) {
      ctx.fillStyle = this.resultColor;
      ctx.font = "bold 30px 'Space Grotesk', sans-serif";
      ctx.fillText(this.resultText, this.width / 2, this.height * 0.62);
    }

    ctx.textAlign = "left";
  }
}

window.PlayzoneGames = window.PlayzoneGames || {};
window.PlayzoneGames["street-hoops"] = () => new StreetHoopsGame();