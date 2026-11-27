/**
 * Phase 4 motion grammar + Phase 5 feed survival evidence.
 *   node tools/p45-evidence.mjs --out DIR --prefix BEFORE
 */
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createCanvas, registerFont, Image as CanvasImage } from 'canvas';

const require = createRequire(import.meta.url);
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(REPO, '.render-check-build');
const args = process.argv.slice(2);
const getArg = (k, d = '') => {
  const i = args.indexOf(k);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : d;
};
const OUT = getArg('--out', path.join(REPO, 'p45-evidence'));
const PREFIX = getArg('--prefix', 'AFTER');
fs.mkdirSync(OUT, { recursive: true });

const files = [
  'theme', 'easing', 'effects', 'particles', 'stickman', 'stickman-v2', 'charts', 'textfx',
  'scene-context', 'scene-props', 'scale-law', 'scenes-host', 'scenes-data', 'scenes-text',
  'scenes-finance', 'analytics', 'script-data', 'timeline', 'director', 'shorts',
].map((f) => path.join(REPO, 'src', 'lib', 'engine', f + '.ts'));
execSync(
  ['node_modules/.bin/tsc', ...files,
   '--outDir', BUILD, '--module', 'commonjs', '--moduleResolution', 'node',
   '--target', 'es2022', '--skipLibCheck', '--esModuleInterop', '--resolveJsonModule'].join(' '),
  { stdio: 'inherit', cwd: REPO }
);

const FONTS = [
  ['Inter-400.ttf', 'Inter', 400], ['Inter-600.ttf', 'Inter', 600], ['Inter-700.ttf', 'Inter', 700],
  ['Fraunces-400.ttf', 'Fraunces', 400], ['Fraunces-600.ttf', 'Fraunces', 600], ['Fraunces-700.ttf', 'Fraunces', 700],
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
const tl = buildTimeline(manifest, 30);
const W = 1920, H = 1080;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
ctx.imageSmoothingQuality = 'high';
const OPTS = {
  captions: 'karaoke', channelName: 'The Data Desk',
  nextVideoTitle: 'The Zero-Cost Collar, Explained',
  watermark: true, progressBar: true,
};

const beatsOf = (key) => tl.beats.filter((b) => String(b.beat.scene.sceneKey || '').startsWith(key));
const renderAt = (t, name) => {
  drawFrame(ctx, tl, t, OPTS);
  fs.writeFileSync(path.join(OUT, `${PREFIX}_${name}.png`), canvas.toBuffer('image/png'));
  console.log(`rendered ${PREFIX}_${name} @ ${(t / 1000).toFixed(1)}s`);
};
const renderBeat = (key, mode, name, off = 0, dt = 1800) => {
  let ms = beatsOf(key);
  if (mode !== undefined) ms = ms.filter((b) => String(b.beat.scene.mode || '') === mode);
  if (!ms.length) { console.log(`SKIP ${name} (${key}:${mode})`); return; }
  const b = ms[Math.min(off, ms.length - 1)];
  renderAt(b.startMs + dt, name);
};

// P4-1: the 40-second metronome strip — 20 thumbs across the J.P. Morgan
// chapter's data beats (intro -> bar-1..3): AFTER must show the pose
// selection following the sentence stream, no 12-second repeats.
{
  const ms = beatsOf('c1-jpm');
  if (ms.length) {
    const t0 = ms[0].startMs, span = Math.max(40000, ms[ms.length - 1].startMs + ms[ms.length - 1].durMs - t0);
    const thumbs = [];
    for (let i = 0; i < 20; i++) {
      const t = t0 + Math.round(((span - 800) * i) / 19);
      drawFrame(ctx, tl, t, OPTS);
      thumbs.push(canvas.toBuffer('image/png'));
    }
    // montage 5x4 at 320-wide thumbs
    const TW = 320, TH = 180, COLS = 4, ROWS = 5;
    const m = createCanvas(TW * COLS, TH * ROWS);
    const mx = m.getContext('2d');
    thumbs.forEach((buf, i) => {
      const img = new CanvasImage();
      img.onload = () => {};
      img.src = buf;
      mx.drawImage(img, (i % COLS) * TW, Math.floor(i / COLS) * TH, TW, TH);
    });
    fs.writeFileSync(path.join(OUT, `${PREFIX}_p4_metronome_strip.png`), m.toBuffer('image/png'));
    console.log(`rendered ${PREFIX}_p4_metronome_strip (20 thumbs over 40s)`);
  }
}

// P4-2: the walk windows — mid-stride samples (the 1200ms floor).
renderBeat('c1-jpm', 'bar-2', 'p4_walk_distBars-midstride', 0, 700);
renderBeat('co-six', 'spot-2', 'p4_walk_exitTiles-midstride', 0, 700);

// P4-3: reaction verbs on numbers — the $3.7M landing (body event window).
renderBeat('c1-tax', 'total', 'p4_number_land-taxTotal', 0, 1050);

// P4-4: the pose budget — reprise + payoff-path frames re-pass the sheet.
renderBeat('fw-table', 'row-4', 'p4_budget_decisionTable-reprise', 0, 2200);
renderBeat('e4-path', undefined, 'p4_budget_payoff-path', 0, 2600);

// P5-5: the save artifact — the framework table (discs + 34/30 register).
renderBeat('fw-table', 'row-2', 'p5_decisionTable-discs', 0, 2200);

// P5-6: ledger values own the card.
renderBeat('c1-tax', 'row-2', 'p5_ledger_taxStack', 0, 2200);
renderBeat('e2-pool', 'redeem', 'p5_ledger_poolFund', 0, 2200);

// P5-7: the persistent brand lockup (bottom-right).
renderBeat('c1-survey', undefined, 'p5_lockup_frame', 0, 2200);

// P5-8: the end-screen host (clear of the card, declared contact).
{
  const es = tl.beats.filter((b) => b.beat.scene.type === 'endScreen');
  if (es.length) renderAt(es[0].startMs + Math.min(Number(es[0].durMs ?? 4200) - 300, 3200), 'p5_endscreen_host');
  else console.log('SKIP p5_endscreen_host');
}
console.log('done ->', OUT);
