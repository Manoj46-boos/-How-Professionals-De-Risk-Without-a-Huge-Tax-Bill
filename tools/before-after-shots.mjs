/**
 * BEFORE/AFTER evidence renderer — renders named evidence shots with a
 * prefix+tag so every engine fix ships a paired frame check.
 *
 * Usage:
 *   node tools/before-after-shots.mjs --out DIR --prefix BEFORE --tag A1 --only payoffDiagram --only drawdown
 *   node tools/before-after-shots.mjs --out DIR --prefix AFTER  --tag A1 --only payoffDiagram
 *
 * The TS build is recompiled on every run (the sources change between runs);
 * fonts, synthetic VO manifest and the timeline builder are identical to
 * tools/preview-frames.mjs so every frame is directly comparable.
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

// args
const args = process.argv.slice(2);
const getArg = (k, d = '') => {
  const i = args.indexOf(k);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : d;
};
const OUT = getArg('--out', path.join(REPO, 'before-after'));
const PREFIX = getArg('--prefix', 'AFTER');
const TAG = getArg('--tag', 'FIX');
const ONLY = args.filter((a, i) => args[i - 1] === '--only');
fs.mkdirSync(OUT, { recursive: true });

// rebuild every run — the engine sources change between BEFORE/AFTER pairs
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

const { resetGuard } = require(path.join(BUILD, 'collision.js'));

// (sceneKey prefix, beat index offset within matches, ms into the beat, shot name)
const SHOTS = [
  ['co-cross', 0, 2600, 'crossChart-build'],
  ['co-cross', 4, 1600, 'crossChart-delta'],
  ['co-cross', 4, 320, 'crossChart-midwalk'], // B9 evidence: mid walk-in
  ['co-truth', 0, 2200, 'bigText'],
  ['co-question', 0, 2600, 'host-premium'],
  ['co-six', 0, 2600, 'exitTiles'],
  ['co-deal', 0, 1800, 'srcCite'],
  ['co-deal', 0, 2200, 'srcCite-ledger'],
  ['c1-jpm', 2, 2600, 'distBars-40pct'],
  ['c1-bess', 0, 2600, 'dotGrid-bess'],
  ['c1-tax', 2, 1800, 'taxStack-total'],
  ['c1-tax', 0, 2200, 'taxStack-rows'],
  ['c1-unh', 1, 2200, 'drawdownChart'],
  ['e1-plan', 1, 2200, 'planConveyor'],
  ['e1-kill', 0, 2200, 'killCard'],
  ['e2-pool', 0, 2600, 'poolFund-contribute'],  // B8 evidence: the coin-stack beat
  ['e2-pool', 1, 2600, 'poolFund-s721'],
  ['e2-drift', 0, 2600, 'driftChart'],          // B1 evidence
  ['e5-obbba', 0, 2600, 'ruleChange'],          // B1 evidence
  ['e6-apple', 0, 2600, 'appleCase'],           // B1 evidence
  ['e2-lock', 0, 2600, 'lockup'],
  ['e3-explode', 2, 2600, 'explodeGrid-harvest'],
  ['e3-napkin', 0, 2600, 'napkin'],
  ['fw-end', 0, 2600, 'endScreen'],
  ['fw-close', 0, 2600, 'close-quote'],
  ['e4-collar', 0, 2200, 'payoffDiagram-floor'],
  ['e4-path', 0, 2600, 'payoffDiagram-path'],
  ['e4-mine', 1, 2200, 'taxMine'],
  ['e5-crt', 0, 2600, 'flowCharity-crt'],
  ['e5-valur', 0, 2600, 'barsCompare-valur'],
  ['e6-ls', 2, 2200, 'lsLeverage-ratios'],
  ['e6-decay', 0, 2600, 'decayCurves-ls200'],
  ['e6-decay', 0, 2640, 'decayCurves-b1'], // A8 evidence: boil phase samples
  ['e6-decay', 0, 2680, 'decayCurves-b2'],
  ['e6-decay', 0, 2720, 'decayCurves-b3'],
  ['fw-table', 3, 2200, 'decisionTable-rows'],
  ['fw-sequence', 0, 2600, 'sequenceStack'],
  ['e1-intro', 0, 2200, 'host-e1-intro-climb'],
  ['e1-out', 0, 2200, 'host-e1-out-reprise1'],
  ['e4-out', 0, 2200, 'host-e4-out-reprise4'],
  ['e6-leverage', 1, 2200, 'host-e6-leverage-wry'],
  ['fw-like', 0, 2200, 'host-fw-like-thumbsup'],
];

for (const [key, beatOff, offset, name] of SHOTS) {
  if (ONLY.length && !ONLY.some((o) => name.includes(o))) continue;
  const matches = tl.beats.filter((b) => String(b.beat.scene.sceneKey || '').startsWith(key));
  const b = matches[Math.min(beatOff, matches.length - 1)];
  if (!b) { console.log('no beat for', key); continue; }
  const t = Math.min(b.startMs + offset, b.endMs - 60);
  if (resetGuard) resetGuard(name);
  drawFrame(ctx, tl, t, OPTS);
  fs.writeFileSync(path.join(OUT, `${PREFIX}_${TAG}_${name}.png`), canvas.toBuffer('image/png'));
  console.log(`rendered ${PREFIX}_${TAG}_${name} @ ${(t / 1000).toFixed(1)}s`);
}
console.log('done ->', OUT);
