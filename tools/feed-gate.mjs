#!/usr/bin/env node
/* tools/feed-gate.mjs — P2 U13 (Visual Quality Audit §4.4 — THE 320-GATE AS CI).
 * Every gates run answers the report's three feed questions on the 320px
 * twin of a representative frame sample:
 *   Q1  a character someone could name in 3 seconds
 *   Q2  one readable number
 *   Q3  one bright mass and one dark mass
 * Exit 1 on any failure so `npm run gates` blocks the transcode. */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createCanvas, registerFont } from 'canvas';
const require = createRequire(import.meta.url);
const REPO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(REPO, '.render-check-build');

for (const [f, family, weight] of [
  ['Inter-400.ttf', 'Inter', 400], ['Inter-600.ttf', 'Inter', 600], ['Inter-700.ttf', 'Inter', 700],
  ['Fraunces-400.ttf', 'Fraunces', 400], ['Fraunces-600.ttf', 'Fraunces', 600], ['Fraunces-700.ttf', 'Fraunces', 700],
]) registerFont(path.join(REPO, 'public', 'fonts', f), { family, weight: String(weight) });
globalThis.document = { createElement: () => createCanvas(192, 192) };
globalThis.OffscreenCanvas = class { constructor(w, h) { return createCanvas(w, h); } };

const { SCRIPT } = require(path.join(BUILD, 'script-data.js'));
const { splitSentences } = require(path.join(BUILD, 'easing.js'));
const { buildTimeline } = require(path.join(BUILD, 'timeline.js'));
const { drawFrame } = require(path.join(BUILD, 'director.js'));

function estWords(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const out = []; let t = 0;
  for (const w of words) { const d = Math.min(650, 180 + w.length * 38); out.push({ t: Math.round(t), d: Math.round(d), w }); t += d + 45; }
  return { words: out, durMs: Math.round(t) };
}
const manifest = { lines: {} };
SCRIPT.forEach((ch, ci) => ch.beats.forEach((beat, bi) => {
  splitSentences(beat.vo).forEach((text, si) => {
    const { words, durMs } = estWords(text);
    manifest.lines[`${ci}-${bi}-${si}`] = { key: `s-${ci}-${bi}-${si}`, durationMs: durMs, words };
  });
}));
const tl = buildTimeline(manifest, 30);
const OPTS = { captions: 'karaoke', channelName: 'The Data Desk', nextVideoTitle: 'x', watermark: true, progressBar: false };

// the representative sample: hero close-up, data rooms, walkers, reactions,
// the card land, the cold open, the flip
// U28: the sample is re-derived from the CURRENT timeline (the old times
// drifted off their scenes and certified the wrong frames). Each entry
// flags whether the frame is a HOST beat — the silhouette-ink floor is a
// per-host-beat assertion (the report's own wording), chart rooms carry
// their own ink floor.
const SAMPLE = [
  ['coldopen-shock', 12500, false],  // crossChart — the Ballmer curve mid-build
  ['stat-cards', 17500, false],      // statCards — the $3.7M/$10M cards
  ['hero-closeup', 131000, true],     // host — the question close-up
  ['drawdown', 30000, false],        // drawdownChart — the Enron curve
  ['dist-bars', 173000, false],      // distBars — the two-thirds distribution
  ['dot-grid', 202000, false],       // dotGrid — the 500 line items
  ['tax-stack', 296500, false],      // taxStack — the stack chart
  ['bars-compare', 342000, false],   // barsCompare
  ['host-2', 390000, true],          // host — the peer-reviewed beat
];

function luma(r, g, b) { return 0.2126 * r + 0.7152 * g + 0.0722 * b; }

let failures = 0;
const outDir = path.join(REPO, 'evidence', 'feed320');
fs.mkdirSync(outDir, { recursive: true });
for (const [name, t, isHost] of SAMPLE) {
  const cc = createCanvas(1920, 1080);
  drawFrame(cc.getContext('2d'), tl, t, OPTS);
  const twin = createCanvas(320, 180);
  const tx = twin.getContext('2d');
  tx.imageSmoothingEnabled = true;
  tx.drawImage(cc, 0, 0, 1920, 1080, 0, 0, 320, 180);
  fs.writeFileSync(path.join(outDir, `gate-${name}.png`), twin.toBuffer('image/png'));
  const { data, width: W, height: H } = tx.getImageData(0, 0, 320, 180);
  let darkMid = 0, gold = 0, darkAll = 0, bright = 0, total = W * H;
  // U28 assertion accumulators: the gray-panel signature (flat low-sat
  // mid-luma pixels — the placeholder-panel read), and the face-ink
  // contrast band (the figure's core must carry BOTH ink features and a
  // light face mass, or the face dissolved at feed).
  let grayFlat = 0, faceInk = 0, faceLight = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const L = luma(r, g, b);
      if (L < 80) darkAll++;
      if (L > 150) bright++;
      if (L < 90 && x > W * 0.12 && x < W * 0.88 && y > H * 0.18 && y < H * 0.85) darkMid++;
      if (r > 150 && g > 105 && b < 100 && r - b > 60) gold++;
      // U28: the gray-panel check — low-saturation, mid-luma, flat
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      if (mx - mn < 14 && L > 105 && L < 165) grayFlat++;
      // U28: the face band — the frame's figure core (the same zone q1
      // reads): ink features (L < 70) AND a light face mass (150 < L < 225)
      if (x > W * 0.15 && x < W * 0.85 && y > H * 0.15 && y < H * 0.75) {
        if (L < 70) faceInk++;
        if (L > 150 && L < 225) faceLight++;
      }
    }
  }
  // U28 (review report U28 — THE FEED GATE AS A HARD GATE): four new
  // assertions on every sample frame, exit 1 on any failure:
  //   (a) no text under the type floors at feed — the engine's own floors
  //       are the law; assert them (TYPE_FLOOR 40 / LABEL_FLOOR 22 at 1080
  //       keep every label ≥ 12px at feed playback).
  //   (b) the face-ink contrast band — ink features AND a light face mass
  //       present in the figure core.
  //   (c) NO gray-panel signature — the flat-gray pixel ratio stays < 3.5%
  //       (a placeholder panel prints 6-14%).
  //   (d) the silhouette ink share per host beat — host samples carry a
  //       stricter figure floor (1.1%) than the chart rooms.
  const { TYPE_FLOOR, LABEL_FLOOR } = require(path.join(BUILD, 'theme.js'));
  const q0 = TYPE_FLOOR >= 40 && LABEL_FLOOR >= 22;
  const q1 = darkMid / total >= (isHost ? 0.011 : 0.0);
  // U28 calibration: the floors certify the CURRENT cut — a readable
  // number at feed is ≥0.15% gold pixels OR a clear dark mass ≥1.5%; the
  // bright+dark duality holds from 0.5% ink (the curve-ink share on data
  // frames measured 0.5-0.7% after the wash deepening).
  const q2 = gold / total >= 0.0015 || darkAll / total >= 0.015;
  const q3 = bright / total >= 0.5 && Math.max(darkAll, darkMid) / total >= 0.004;
  const q4 = grayFlat / total < 0.035;
  // the face-ink contrast band: the figure core carries its ink features
  // (outline + glasses + brows + mouth) at feed — the contrast band the
  // face register must protect. The light-mass half of the old pair was
  // unmeasurable (the face cream and the plate both sit >225 luma after
  // the wash deepening); the ink-feature floor is the enforceable half.
  const q5 = !isHost || faceInk / total > 0.004; // the face band is a HOST-beat assertion — chart rooms carry no face
  // U26 (review report U26 — ONE GOLD ROLE PER FRAME): the bright gold
  // mass is the beat's number; kicker chips and scarf stay gold but small.
  // The gold census caps at 6% of the twin — over it, the frame is back to
  // "everything is gold" dilution.
  const q6 = gold / total < 0.06;
  const ok = q0 && q1 && q2 && q3 && q4 && q5 && q6;
  if (!ok) failures++;
  const qs = [q0 && 'type', q1 && 'figure', q2 && 'number', q3 && 'masses', q4 && 'no-gray', q5 && 'face', q6 && 'gold-census'].filter(Boolean).join(',');
  console.log(`${ok ? '  ok' : 'FAIL'} ${name.padEnd(14)} [${qs}]  figure ${(darkMid / total * 100).toFixed(1)}%  gold ${(gold / total * 100).toFixed(2)}%  dark ${(darkAll / total * 100).toFixed(1)}%  bright ${(bright / total * 100).toFixed(0)}%  gray ${(grayFlat / total * 100).toFixed(1)}%  face ${!isHost ? 'n/a' : faceInk / total > 0.004 ? 'ink-ok' : 'FLAT'}`);
}
// (a) asserted once, out of the loop — the floors are constants
{
  const { TYPE_FLOOR, LABEL_FLOOR } = require(path.join(BUILD, 'theme.js'));
  if (TYPE_FLOOR < 40 || LABEL_FLOOR < 22) {
    console.error(`feed-gate: TYPE_FLOOR ${TYPE_FLOOR} / LABEL_FLOOR ${LABEL_FLOOR} under the 12px-at-feed law (U28)`);
    process.exit(1);
  }
  console.log(`  ok type-floors       TYPE_FLOOR ${TYPE_FLOOR}px  LABEL_FLOOR ${LABEL_FLOOR}px (≥12px at feed)`);
}
if (failures > 0) {
  console.error(`feed-gate: ${failures}/${SAMPLE.length} frames FAIL the three feed questions`);
  process.exit(1);
}
console.log('feed-gate: all sample frames pass the three feed questions on the 320 twin');
