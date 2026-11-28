/**
 * Character evidence strips — the C7 (idle variants) and C10 (cast posture)
 * evidence pairs, drawn directly from the engine so the fix is visible
 * without hunting timeline beats.
 *
 * Usage:
 *   node tools/character-strips.mjs --strip idle  --prefix BEFORE --tag C7 --out DIR
 *   node tools/character-strips.mjs --strip cast  --prefix AFTER  --tag C10 --out DIR
 *
 * Same build/fonts/synthetic-VO discipline as tools/before-after-shots.mjs:
 * the TS engine recompiles every run (the sources change between pairs).
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
const OUT = getArg('--out', path.join(REPO, 'before-after'));
const PREFIX = getArg('--prefix', 'BEFORE');
const TAG = getArg('--tag', 'C7');
const STRIP = getArg('--strip', 'idle');
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

const { PALETTE } = require(path.join(BUILD, 'theme.js'));
const { Stickman } = require(path.join(BUILD, 'stickman.js'));
const { drawStickmanV2, groundShadowV2 } = require(path.join(BUILD, 'stickman-v2.js'));

const W = 1920, H = 1080;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
ctx.imageSmoothingQuality = 'high';

function figure(x, groundY, rig, t, variant, sentenceId) {
  const pose = Stickman.poseAt(t, { speaking: false, gesture: 'idle', sentenceId });
  groundShadowV2(ctx, x, groundY, rig, 0, 0);
  drawStickmanV2(ctx, x, groundY, rig, t, {
    pose, shadow: 0, scarf: true, variant,
    faceScale: 1,
  });
}

function label(text, x, y) {
  ctx.save();
  ctx.font = '600 26px Inter';
  ctx.fillStyle = PALETTE.inkSoft;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
  ctx.restore();
}

if (STRIP === 'boil') {
  // C6 evidence: the LINE-BOIL identity at a small rig (1.2 — under the old
  // 1.5 cutoff). The same figure renders at three boil phases (10 Hz clock);
  // the tool stamps the MEAN ABS pixel diff between consecutive phases.
  // BEFORE: clean vectors -> diff 0.0. AFTER: alive ink -> diff > 0.
  paint();
  const rig = 1.2;
  const gy = H * 0.72;
  const t0 = 4200;
  const phases = [t0, t0 + 100, t0 + 200];
  const fx = Math.floor(W * 0.5), band = { x0: fx - 170, x1: fx + 170, y0: Math.floor(gy - 330), y1: Math.floor(gy + 16) };
  const snaps = phases.map((pt) => {
    const c = createCanvas(W, H);
    const cx2 = c.getContext('2d');
    cx2.imageSmoothingQuality = 'high';
    cx2.fillStyle = PALETTE.bgTop;
    cx2.fillRect(0, 0, W, H);
    const pose = Stickman.poseAt(pt, { speaking: false, gesture: 'idle', sentenceId: 'boil' });
    drawStickmanV2(cx2, W * 0.5, gy, rig, pt, { pose, scarf: true, faceScale: 1 });
    return c;
  });
  // the three phases side by side
  const cw = Math.floor(W / 3);
  for (let i = 0; i < 3; i++) {
    ctx.drawImage(snaps[i], i * cw, 0, cw, H, i * cw, 0, cw, H);
    label(`phase ${i + 1}`, i * cw + cw / 2, H * 0.92);
  }
  // mean abs diff between consecutive phase frames, inside the figure band
  // (sway/breathe move the whole figure; the boil WOBBLES the strokes —
  // the band isolates stroke-level change from whole-body drift)
  let acc = 0, n = 0;
  for (let i = 1; i < 3; i++) {
    const ia = snaps[i - 1].getContext('2d').getImageData(band.x0, band.y0, band.x1 - band.x0, band.y1 - band.y0).data;
    const ib = snaps[i].getContext('2d').getImageData(band.x0, band.y0, band.x1 - band.x0, band.y1 - band.y0).data;
    for (let k = 0; k < ia.length; k += 16) { acc += Math.abs(ia[k] - ib[k]); n++; }
  }
  const diff = n ? (acc / n) : 0;
  ctx.save();
  ctx.font = '700 34px Inter';
  ctx.fillStyle = '#92453e';
  ctx.textAlign = 'center';
  ctx.fillText(`mean inter-phase pixel diff: ${diff.toFixed(3)}`, W / 2, 84);
  ctx.restore();
  fs.writeFileSync(path.join(OUT, `${PREFIX}_${TAG}_boil-strip.png`), canvas.toBuffer('image/png'));
  console.log(`rendered ${PREFIX}_${TAG}_boil-strip.png (diff ${diff.toFixed(3)})`);
} else if (STRIP === 'idle') {
  // C7 evidence: the REST pose at four different sentences/windows.
  // BEFORE: every window draws the same POSES.idle. AFTER: four variants,
  // seeded per sentence and cross-blended on 9s windows.
  paint();
  const rig = 2.0;
  const gy = H * 0.78;
  const slots = [W * 0.14, W * 0.38, W * 0.62, W * 0.86];
  const t0 = 4000;
  const seeds = ['s-a', 's-b', 's-c', 's-d'];
  slots.forEach((x, i) => {
    figure(x, gy, rig, t0 + i * 9500, undefined, seeds[i]);
    label(`idle - sentence ${i + 1}`, x, gy + 74);
  });
  label('non-speaking rest poses - one per sentence window', W / 2, 84);
  fs.writeFileSync(path.join(OUT, `${PREFIX}_${TAG}_idle-strip.png`), canvas.toBuffer('image/png'));
  console.log(`rendered ${PREFIX}_${TAG}_idle-strip.png`);
} else {
  // C10 evidence: the cast at the same staging — posture language, not just gear.
  paint();
  const rig = 2.0;
  const gy = H * 0.78;
  const slots = [W * 0.2, W * 0.5, W * 0.8];
  figure(slots[0], gy, rig, 4200, undefined, 'host');
  label('host', slots[0], gy + 74);
  figure(slots[1], gy, rig, 4200, 'prof', 'prof');
  label('prof', slots[1], gy + 74);
  figure(slots[2], gy, rig, 4200, 'worker', 'worker');
  label('worker', slots[2], gy + 74);
  label('cast postures - one body language per person', W / 2, 84);
  fs.writeFileSync(path.join(OUT, `${PREFIX}_${TAG}_cast-strip.png`), canvas.toBuffer('image/png'));
  console.log(`rendered ${PREFIX}_${TAG}_cast-strip.png`);
}

function paint() {
  ctx.fillStyle = PALETTE.bgTop;
  ctx.fillRect(0, 0, W, H);
}
console.log('done ->', OUT);
