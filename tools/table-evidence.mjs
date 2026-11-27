/**
 * Fix-table evidence renderer — the rows from this turn's fix table.
 *
 *   node tools/table-evidence.mjs --out DIR --prefix BEFORE
 *
 * Renders: all SIX thumbnail variants (+ 320 twins), the hero hand
 * close-up frames, and the three re-marked host scenes.
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
const OUT = getArg('--out', path.join(REPO, 'table-evidence'));
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
const { drawThumbnail, THUMB_VARIANTS } = require(path.join(BUILD, 'thumbnail.js'));
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

// all SIX thumbnail variants + 320 twins (the acceptance test)
THUMB_VARIANTS.forEach((v, i) => {
  const tc = createCanvas(1280, 720);
  const tx = tc.getContext('2d');
  tx.imageSmoothingQuality = 'high';
  drawThumbnail(tx, 1280, 720, i);
  fs.writeFileSync(path.join(OUT, `${PREFIX}_thumb_v${i}.png`), tc.toBuffer('image/png'));
  const tw = createCanvas(320, 180);
  const tx2 = tw.getContext('2d');
  tx2.imageSmoothingQuality = 'high';
  tx2.drawImage(tc, 0, 0, 1280, 720, 0, 0, 320, 180);
  fs.writeFileSync(path.join(OUT, `${PREFIX}_thumb_twin_v${i}.png`), tw.toBuffer('image/png'));
  console.log(`thumb v${i}: "${v.punch.join(' ')}" | badge ${v.badge.big} ${v.badge.label}`);
});

// the hero hand frames (close-up crops come from the panel pass)
{
  const hb = beatBy('e4-collar', 3); // payoff cost — leanOnK grip at 1.35
  if (hb) renderAt(hb.startMs + 1400, 'hand_payoff-lean');
  const db = beatBy('fw-table', 3); // decisionTable full — holdCard grip at 1.3
  if (db) renderAt(db.startMs + 2200, 'hand_holdCard');
  const qb = beatBy('co-question', 0); // the hero-scale host
  if (qb) renderAt(qb.startMs + 2600, 'hand_hero');
}

// the three re-marked hosts
{
  const tm = beatBy('e4-mine', 1);
  if (tm) renderAt(tm.startMs + 2200, 'mark_taxMine');
  const rc = beatBy('e5-obbba', 0);
  if (rc) renderAt(rc.startMs + 2200, 'mark_ruleChange');
  const ls = beatBy('e6-ls', 2);
  if (ls) renderAt(ls.startMs + 2200, 'mark_lsLeverage');
}

const av = armAuditReport ? armAuditReport() : [];
console.log(`ARM-AUDIT: ${av.length} violation(s) on the sampled set`);
av.forEach((v) => console.log(`  ${v.frame} ${v.id} ratio ${v.ratio}`));
console.log('done ->', OUT);
