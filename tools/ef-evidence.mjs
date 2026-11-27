/**
 * E/F evidence renderer — Domain E (gesture/motion) + Domain F (brand) pairs.
 *
 *   node tools/ef-evidence.mjs --out DIR --prefix BEFORE --tag E1
 *
 * Shots:
 *   E1  — a 6-frame strip of the distBars host across ~2s (pose answers the
 *         sentence, not the 12s metronome); logs the accent advances.
 *   E2  — a frame at a landing number's onset+150ms (the number take).
 *   E3  — the planConveyor belt perch + the payoff leanOnK.
 *   E5  — mid-chapter walk-ins (distBars intro, payoff floor).
 *   F1  — thumbnail variants 0/3 at 1280x720.
 *   F3  — the end-screen frame.
 *   F4  — room identity frames (taxStack, lockup).
 */
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createCanvas, registerFont } from 'canvas';

const require = createRequire(import.meta.url);
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(REPO, '.render-check-build');

const args = process.argv.slice(2);
const getArg = (k, d = '') => {
  const i = args.indexOf(k);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : d;
};
const OUT = getArg('--out', path.join(REPO, 'ef-evidence'));
const PREFIX = getArg('--prefix', 'AFTER');
fs.mkdirSync(OUT, { recursive: true });

const files = [
  'theme', 'easing', 'effects', 'particles', 'stickman', 'stickman-v2', 'charts', 'textfx',
  'scene-context', 'scene-props', 'scale-law', 'scenes-host', 'scenes-data', 'scenes-text',
  'scenes-finance', 'analytics', 'script-data', 'timeline', 'director', 'thumbnail', 'shorts',
].map((f) => path.join(REPO, 'src', 'lib', 'engine', f + '.ts'));
execSync(
  ['node_modules/.bin/tsc', ...files,
   '--outDir', BUILD, '--module', 'commonjs', '--moduleResolution', 'node',
   '--target', 'es2022', '--skipLibCheck', '--esModuleInterop', '--resolveJsonModule'].join(' '),
  { stdio: 'inherit', cwd: REPO }
);

const FONTS = [
  ['Inter-400.ttf', 'Inter', 400],
  ['Inter-600.ttf', 'Inter', 600],
  ['Inter-700.ttf', 'Inter', 700],
  ['Fraunces-400.ttf', 'Fraunces', 400],
  ['Fraunces-600.ttf', 'Fraunces', 600],
  ['Fraunces-700.ttf', 'Fraunces', 700],
];
for (const [f, family, weight] of FONTS) {
  registerFont(path.join(REPO, 'public', 'fonts', f), { family, weight: String(weight) });
}
globalThis.document = { createElement: () => createCanvas(192, 192) };
globalThis.OffscreenCanvas = class { constructor(w, h) { return createCanvas(w, h); } };

const { SCRIPT } = require(path.join(BUILD, 'script-data.js'));
const { splitSentences } = require(path.join(BUILD, 'easing.js'));
const { buildTimeline } = require(path.join(BUILD, 'timeline.js'));
const { drawFrame } = require(path.join(BUILD, 'director.js'));
const { drawThumbnail } = require(path.join(BUILD, 'thumbnail.js'));
const { resetGuard } = require(path.join(BUILD, 'collision.js'));

function estWords(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const out = [];
  let t = 0;
  for (const w of words) {
    const d = Math.min(650, 180 + w.length * 38);
    out.push({ t: Math.round(t), d: Math.round(d), w });
    t += d + 45;
  }
  return { words: out, durMs: Math.round(t) };
}

const manifest = { lines: {} };
SCRIPT.forEach((chapter, ci) => {
  chapter.beats.forEach((beat, bi) => {
    splitSentences(beat.vo).forEach((text, si) => {
      const { words, durMs } = estWords(text);
      manifest.lines[`${ci}-${bi}-${si}`] = { key: `synthetic-${ci}-${bi}-${si}`, durationMs: durMs, words };
    });
  });
});

const FPS = 30;
const tl = buildTimeline(manifest, FPS);
const W = 1920, H = 1080;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
ctx.imageSmoothingQuality = 'high';

const OPTS = {
  captions: 'karaoke',
  channelName: 'The Data Desk',
  nextVideoTitle: 'The Zero-Cost Collar, Explained',
  watermark: true,
  progressBar: true,
};

const renderAt = (t, name) => {
  if (resetGuard) resetGuard(name);
  drawFrame(ctx, tl, t, OPTS);
  fs.writeFileSync(path.join(OUT, `${PREFIX}_${name}.png`), canvas.toBuffer('image/png'));
  console.log(`rendered ${PREFIX}_${name} @ ${(t / 1000).toFixed(1)}s`);
};

const beatBy = (key, off = 0) => {
  const matches = tl.beats.filter((b) => String(b.beat.scene.sceneKey || '').startsWith(key));
  return matches[Math.min(off, matches.length - 1)];
};

// ── E1: the pose-strip — six frames across the distBars bar-1 beat ──────────
const eb = beatBy('c1-jpm', 1); // bar-1
if (eb) {
  for (let i = 0; i < 6; i++) {
    renderAt(eb.startMs + 700 + i * 350, `E1_strip_${i}`);
  }
}

// ── E2: the number take — find a number word in the distBars bar-2 caption ──
const nb = beatBy('c1-jpm', 2);
if (nb) {
  const lines = tl.captionLines.filter((l) => l.end > nb.startMs && l.start < nb.endMs);
  const NUM_RE = /[\d$%]|million|billion|percent|two|three|four|five|six|seven|eight|nine|ten/i;
  let hit = null;
  for (const l of lines) {
    for (const w of l.words) {
      if (NUM_RE.test(w.w) && w.t >= nb.startMs + 600) { hit = w; break; }
    }
    if (hit) break;
  }
  if (hit) {
    console.log(`E2 number word "${hit.w}" @ ${(hit.t / 1000).toFixed(2)}s`);
    renderAt(hit.t + 150, 'E2_number-take');
    renderAt(hit.t + 700, 'E2_number-hold');
  } else {
    console.log('E2: no number word found in the beat captions');
    renderAt(nb.startMs + 1600, 'E2_number-take');
    renderAt(nb.startMs + 2100, 'E2_number-hold');
  }
}

// ── E3: the belt perch + the weary lean ─────────────────────────────────────
const pb = beatBy('e1-plan', 1); // no-discretion
if (pb) renderAt(pb.startMs + 1500, 'E3_belt-perch');
const cb = beatBy('e4-collar', 3); // cost
if (cb) renderAt(cb.startMs + 1400, 'E3_payoff-lean');

// ── E5: mid-chapter walk-ins ────────────────────────────────────────────────
const db = beatBy('c1-jpm', 0); // distBars intro
if (db) renderAt(db.startMs + 480, 'E5_walk-distBars');
const fb = beatBy('e4-collar', 0); // payoff floor
if (fb) renderAt(fb.startMs + 500, 'E5_walk-payoff');

// ── F1: the thumbnails (this film's package) ────────────────────────────────
{
  const tc = createCanvas(1280, 720);
  const tx = tc.getContext('2d');
  tx.imageSmoothingQuality = 'high';
  drawThumbnail(tx, 1280, 720, 0);
  fs.writeFileSync(path.join(OUT, `${PREFIX}_F1_thumb_v0.png`), tc.toBuffer('image/png'));
  drawThumbnail(tx, 1280, 720, 3);
  fs.writeFileSync(path.join(OUT, `${PREFIX}_F1_thumb_v3.png`), tc.toBuffer('image/png'));
  // the 320px feed read
  const tw2 = createCanvas(320, 180);
  const tx2 = tw2.getContext('2d');
  tx2.imageSmoothingQuality = 'high';
  tx2.drawImage(tc, 0, 0, 1280, 720, 0, 0, 320, 180);
  fs.writeFileSync(path.join(OUT, `${PREFIX}_F1_thumb_twin.png`), tw2.toBuffer('image/png'));
  console.log('rendered F1 thumbnails (v0, v3, twin)');
}

// ── F3: the end screen ──────────────────────────────────────────────────────
{
  const eb3 = beatBy('fw-end', 0);
  if (eb3) renderAt(eb3.startMs + 2600, 'F3_endScreen');
}

// ── F4: the room identity frames ────────────────────────────────────────────
{
  const tb = beatBy('c1-tax', 0);
  if (tb) renderAt(tb.startMs + 2200, 'F4_taxStack-room');
  const lb = beatBy('e2-lock', 0);
  if (lb) renderAt(lb.startMs + 2600, 'F4_lockup-room');
  const jb = beatBy('c1-jpm', 2);
  if (jb) renderAt(jb.startMs + 2600, 'F4_distBars-room');
}

console.log('done ->', OUT);
