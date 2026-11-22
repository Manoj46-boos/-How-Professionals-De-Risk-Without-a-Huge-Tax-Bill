/**
 * seq-dump — render a short SEQUENCE of frames at fixed offsets from an
 * absolute timeline time, for motion-quality before/after evidence.
 * Companion to frame-dump.mjs (same build, same fonts, same manifest).
 *
 * Usage:
 *   node tools/seq-dump.mjs --at 176000 --n 8 --step 150 --out seq/walk
 *   node tools/seq-dump.mjs --list --scene host --nth 0   (print beat times)
 *   → seq/walk-0.png .. seq/walk-7.png  (150ms apart)
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

const arg = (name, def = undefined) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const flag = (name) => process.argv.includes(`--${name}`);

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

const W = 1920, H = 1080;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
const OPTS = {
  captions: 'karaoke', channelName: 'The Data Desk',
  nextVideoTitle: 'The 7 Companies That ARE the Market',
  watermark: true, progressBar: true,
};

// the frame-dump manifest: per-line word timings the karaoke/captions need
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
      manifest.lines[`${ci}-${bi}-${si}`] = { key: `s-${ci}-${bi}-${si}`, durationMs: durMs, words };
    });
  });
});
const tl = buildTimeline(manifest, 30);

if (flag('list')) {
  const type = arg('scene');
  let shown = 0;
  tl.beats.forEach((b, i) => {
    const s = b.beat.scene;
    if (type && s.type !== type) return;
    if (arg('nth') !== undefined && shown < Number(arg('nth'))) { shown++; return; }
    console.log(i, Math.round(b.startMs), (Math.round(b.endMs)-Math.round(b.startMs)), s.type, s.stage || '', (s.headline || s.title || '').slice(0, 34).replace(/\n/g, ' / '));
    shown++;
  });
  console.log(`(timeline: ${(tl.durationMs / 60000).toFixed(1)} min)`);
  process.exit(0);
}

const at = Number(arg('at'));
const n = Number(arg('n', 8));
const step = Number(arg('step', 150));
const out = arg('out', 'seq/frame');

for (let k = 0; k < n; k++) {
  const t = at + k * step;
  drawFrame(ctx, tl, t, OPTS);
  const p = `${out}-${k}.png`;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, canvas.toBuffer('image/png'));
  console.log(`saved ${p} @ +${t}ms`);
}
