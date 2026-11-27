/**
 * Phase 2 patterns + Phase 3 composition evidence — one named frame per fix.
 *   node tools/p2-evidence.mjs --out DIR --prefix BEFORE
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
const OUT = getArg('--out', path.join(REPO, 'p2-evidence'));
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
const { resetGuard, armAuditReport } = require(path.join(BUILD, 'collision.js'));

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

const renderBeat = (key, mode, name, off = 0) => {
  const ms = tl.beats.filter((b) => String(b.beat.scene.sceneKey || '').startsWith(key)
    && (mode === undefined || String(b.beat.scene.mode || '') === mode));
  if (!ms.length) { console.log(`SKIP ${name} (${key}:${mode})`); return; }
  const b = ms[Math.min(off, ms.length - 1)];
  if (resetGuard) resetGuard(name);
  const t = b.startMs + 1800;
  drawFrame(ctx, tl, t, OPTS);
  fs.writeFileSync(path.join(OUT, `${PREFIX}_${name}.png`), canvas.toBuffer('image/png'));
  console.log(`rendered ${PREFIX}_${name} @ ${(t / 1000).toFixed(1)}s`);
};

// ON THE DATA
renderBeat('c1-jpm', 'bar-2', 'otd_distBars-bar40');
renderBeat('co-six', 'spot-2', 'otd_exitTiles-spot2');
renderBeat('e3-explode', 'harvest', 'otd_explodeGrid');
// HOLDS THE OBJECT
renderBeat('c1-tax', 'row-2', 'holds_taxStack-rows');
renderBeat('e2-pool', 'redeem', 'holds_poolFund');
renderBeat('e2-drift', 'drift', 'holds_driftChart');
renderBeat('e6-apple', 'slow', 'holds_appleCase');
renderBeat('e5-obbba', 'floor', 'holds_ruleChange');
// BALANCES THE NUMBER
renderBeat('c1-tax', 'total', 'bal_taxStack-total');
renderBeat('e2-lock', undefined, 'bal_lockup-seal');
renderBeat('e4-xclr', 'xclr-cycle', 'bal_xclr-verdict');
// WALKS THE LINE
renderBeat('co-cross', 'build-a', 'walk_crossChart-build');
renderBeat('c1-unh', 'unh-path', 'walk_drawdown-build');
renderBeat('fw-sequence', undefined, 'walk_sequenceStack');
// LEAN ON FRAME
renderBeat('e1-pattern', undefined, 'lean_srcCite');
renderBeat('e5-kill', 'item-1', 'lean_killCard');
renderBeat('fw-table', 'row-2', 'lean_decisionTable-reprise');
// caption pill + rig band
renderBeat('c1-survey', undefined, 'pill_rig_survey-frame');
