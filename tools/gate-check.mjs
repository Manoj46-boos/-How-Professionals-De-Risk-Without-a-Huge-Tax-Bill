/**
 * gate-check.mjs — THE 320px REFEREE (AUDIT-ROUND-3, Fix 3).
 *
 * The external panel's phone-gate verdict on the shipped frames: "mid-tone
 * mush — the figure, the stage and the card all sit in the same band;
 * nothing separates at feed scale... It scrolls past like a hundred other
 * finance explainers." That is a VALUE-STRUCTURE failure, and value
 * structure is checkable: this tool renders checkpoint frames from the
 * real timeline, downsamples them to 320px (the scale where the median
 * high-RPM viewer actually judges the film), and measures the luminance
 * gap between the dark subject band and the bright field behind it.
 *
 * PASS: every checkpoint's subject-vs-background luminance gap >= 28/255
 *       (the threshold under which the panel read the frame as mush).
 * FAIL: exit 1 — do not upload; fix the value plan, not the numbers.
 *
 * Usage (same build/fonts as frame-dump.mjs):
 *   node tools/gate-check.mjs                 # every 8s of the film
 *   node tools/gate-check.mjs --step 4000     # denser sweep
 *   node tools/gate-check.mjs --out gate.json # machine-readable log
 */
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(REPO, '.render-check-build');
const repoRequire = createRequire(path.join(REPO, 'package.json'));
const { createCanvas, registerFont } = repoRequire('canvas');

// ── args ─────────────────────────────────────────────────────────────────────
const arg = (name, def = undefined) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const STEP = Number(arg('step', 8000)); // ms between checkpoints
const OUT = arg('out', undefined);

// ── build (same recipe as frame-dump.mjs) ────────────────────────────────────
if (!fs.existsSync(path.join(BUILD, 'director.js'))) {
  const files = [
    'theme', 'easing', 'effects', 'stickman', 'stickman-v2', 'charts', 'textfx',
    'collision', 'scene-context', 'scene-props', 'scenes-host', 'scenes-data', 'scenes-text',
    'analytics', 'script-data', 'timeline', 'director', 'thumbnail', 'shorts',
  ].map((f) => path.join(REPO, 'src', 'lib', 'engine', f + '.ts'));
  const list = files.filter((f) => fs.existsSync(f));
  execSync(
    ['node_modules/.bin/tsc', ...list,
     '--outDir', BUILD, '--module', 'commonjs', '--moduleResolution', 'node',
     '--target', 'es2022', '--skipLibCheck', '--esModuleInterop', '--resolveJsonModule'].join(' '),
    { stdio: 'inherit', cwd: REPO }
  );
}

for (const [f, family, weight] of [
  ['Inter-400.ttf', 'Inter', 400], ['Inter-600.ttf', 'Inter', 600], ['Inter-700.ttf', 'Inter', 700],
  ['Fraunces-400.ttf', 'Fraunces', 400], ['Fraunces-600.ttf', 'Fraunces', 600], ['Fraunces-700.ttf', 'Fraunces', 700],
]) {
  registerFont(path.join(REPO, 'public', 'fonts', f), { family, weight: String(weight) });
}
globalThis.document = { createElement: () => createCanvas(192, 192) };
globalThis.OffscreenCanvas = class { constructor(w, h) { return createCanvas(w, h); } };

const { SCRIPT } = require(path.join(BUILD, 'script-data.js'));
const { splitSentences } = require(path.join(BUILD, 'easing.js'));
const { buildTimeline } = require(path.join(BUILD, 'timeline.js'));
const { drawFrame } = require(path.join(BUILD, 'director.js'));
// 4.2 + 2.2 GATES (review report §§4.2, 2.2): the occupancy registry (figure
// or hero content per frame) and the prop ledger (resolved-vs-drawn).
const { areaRegistry } = require(path.join(BUILD, 'composition.js'));
const { propUsage, propDraws } = require(path.join(BUILD, 'scene-props.js'));

// the frame-dump estimator manifest (identical word model — the gate only
// needs REAL pixels, and the real pixels come from the real drawers)
const manifest = { lines: {} };
SCRIPT.forEach((ch, ci) => {
  ch.beats.forEach((b, bi) => {
    splitSentences(b.vo).forEach((text, si) => {
      const words = []; let tt = 0;
      for (const w of text.split(/\s+/).filter(Boolean)) {
        const d = Math.min(650, 180 + w.length * 38);
        words.push({ t: Math.round(tt), d: Math.round(d), w });
        tt += d + 45;
      }
      manifest.lines[`${ci}-${bi}-${si}`] = { key: `s-${ci}-${bi}-${si}`, durationMs: Math.round(tt), words };
    });
  });
});
const tl = buildTimeline(manifest, 30);
const OPTS = { captions: 'karaoke', channelName: 'The Data Desk', nextVideoTitle: 'x', watermark: false, progressBar: false };

// ── the gate ─────────────────────────────────────────────────────────────────
const W = 1920, H = 1080;
const FW = 320, FH = 180;           // the phone-feed twin
const GAP_FLOOR = 28;               // /255 — under this the panel read "mush"

const frame = createCanvas(W, H);
const fctx = frame.getContext('2d');
fctx.imageSmoothingQuality = 'high';
const feed = createCanvas(FW, FH);
const fx = feed.getContext('2d');
fx.imageSmoothingQuality = 'high';

const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];

// ── the D1 acceptance (review report §5.1 0.5 — WIRE THE GATE) ───────────────
// The pixel-audit acceptance was written twice in the audit comments — mean
// 180-215 with RMS 40+ per frame — and never enforced. It is enforced here:
// a checkpoint whose mean climbs past 215 (washed light) or whose RMS drops
// under 40 (flat, the champagne-on-champagne failure) FAILS the gate. Mean
// UNDER 180 prints as a DARK row — the kill-card family breaks the band
// deliberately (the film's one dark register), so the low side informs, it
// does not fail.
const MEAN_MAX = 215, RMS_FLOOR = 40, MEAN_MIN = 180;

const rows = [];
let fails = 0;
let washed = 0;
// 4.2 GATE STATE (review report §4.2 — FIGURE COVERAGE AS A GATE): at least
// 70% of sampled runtime must carry a REGISTERED figure or hero/content
// area; bare-slide beats longer than the sample step fail structurally.
const COVERAGE_FLOOR = 70;
let coveredCount = 0;
// 2.2 GATE STATE (review report §2.2 — PROP-DRAW COUNT AS A GATE METRIC):
// every prop a scene RESOLVED to true this frame must actually DRAW this
// frame (the renderer reports via notePropDraw). A resolved-but-undrawn
// prop is a dead staging promise.
let propOk = 0, propDead = 0;
const propDeadRows = [];
for (let t = 2000; t < tl.durationMs; t += STEP) {
  drawFrame(fctx, tl, t, OPTS);
  // 4.2: the occupancy registry (reset per frame inside drawFrame) — a
  // figure ('figure') or a registered hero/content mass ('hero') counts
  // as covered runtime.
  const areas = areaRegistry();
  const covered = areas.some((a) => a.kind === 'figure' || a.kind === 'hero');
  if (covered) coveredCount++;
  // 2.2: resolved props must draw.
  const drew = new Set(propDraws());
  const dead = propUsage().filter((u) => u.requested && u.allowed && !drew.has(u.prop));
  if (dead.length === 0) propOk++; else { propDead++; propDeadRows.push({ t, dead: dead.map((d) => `${d.sceneKey}:${d.prop}`) }); }
  // the D1 acceptance measures the FULL frame at the render scale
  const fd = fctx.getImageData(0, 0, W, H).data;
  let sum = 0, sum2 = 0;
  const n = W * H;
  for (let i = 0; i < n * 4; i += 4) {
    const L = lum(fd, i);
    sum += L; sum2 += L * L;
  }
  const mean = sum / n;
  const rms = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
  const darkRow = mean < MEAN_MIN;
  const washedRow = mean > MEAN_MAX || rms < RMS_FLOOR;
  if (washedRow) washed++;
  fx.drawImage(frame, 0, 0, FW, FH);
  const d = fx.getImageData(0, 0, FW, FH).data;
  // the subject band: the center-left/center columns where the host or the
  // content mass lives (the stage grammar keeps the subject near center);
  // the background band: the outer thirds, skipping the caption strip.
  let sMin = 255, bMax = 0;
  for (let y = 36; y < 168; y++) {
    for (let x = 0; x < FW; x++) {
      const L = lum(d, (y * FW + x) * 4);
      const center = x >= FW * 0.30 && x <= FW * 0.70;
      if (center) sMin = Math.min(sMin, L);
      else bMax = Math.max(bMax, L);
    }
  }
  const gap = bMax - sMin;
  const ok = gap >= GAP_FLOOR;
  if (!ok) fails++;
  rows.push({ t, gap: Math.round(gap), mean: Math.round(mean), rms: Math.round(rms), ok, washed: washedRow, dark: darkRow });
  console.log(`t=${(t / 1000).toFixed(1)}s  gap ${Math.round(gap)}/255 ${ok ? 'PASS' : 'FAIL'}  |  mean ${mean.toFixed(1)} rms ${rms.toFixed(1)} ${darkRow ? 'DARK-REGISTER' : washedRow ? 'WASHED-FAIL' : 'IN-BAND'}`);
}
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ gapFloor: GAP_FLOOR, meanBand: [MEAN_MIN, MEAN_MAX], rmsFloor: RMS_FLOOR, step: STEP, rows, fails, washed, coverage: { coveredCount, total: rows.length, pct: rows.length ? Math.round((coveredCount / rows.length) * 100) : 0, floor: COVERAGE_FLOOR }, props: { ok: propOk, dead: propDead, deadRows: propDeadRows } }, null, 2));
const coveragePct = rows.length ? Math.round((coveredCount / rows.length) * 100) : 0;
const coverageOk = coveragePct >= COVERAGE_FLOOR;
const propsOk = propDead === 0;
const totalFails = fails + washed + (coverageOk ? 0 : 1) + (propsOk ? 0 : 1);
console.log(`figure/content coverage: ${coveragePct}% of sampled frames (${coveredCount}/${rows.length}) — floor ${COVERAGE_FLOOR}% ${coverageOk ? 'PASS' : 'FAIL'}`);
console.log(`prop-draw gate: ${propOk}/${propOk + propDead} checkpoints with all resolved props drawn ${propsOk ? 'PASS' : 'FAIL — ' + propDeadRows.slice(0, 5).map((r) => `t=${(r.t / 1000).toFixed(1)}s ${r.dead.join(', ')}`).join('; ')}`);
console.log(totalFails === 0
  ? `\ngate-check: PASS — ${rows.length} checkpoints, gap >= ${GAP_FLOOR}/255, D1 acceptance clean, coverage >= ${COVERAGE_FLOOR}%, prop ledger clean`
  : `\ngate-check: FAIL — gap fails ${fails}/${rows.length}, washed/flat fails ${washed}/${rows.length}${coverageOk ? '' : `, coverage ${coveragePct}% < ${COVERAGE_FLOOR}%`}${propsOk ? '' : `, ${propDead} checkpoints with resolved-but-undrawn props`} (fix the value plan, not the numbers)`);
process.exit(totalFails === 0 ? 0 : 1);
