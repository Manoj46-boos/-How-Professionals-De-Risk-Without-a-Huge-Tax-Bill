/**
 * Render a few seconds of the new "Ledger" score offline (DSP voices) to
 * WAV — the audible proof of the new BGM identity. Also writes 2 loops.
 * Run: node tools/preview-audio.mjs
 */
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createCanvas } from 'canvas';

const require = createRequire(import.meta.url);
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(REPO, '.render-check-build');
const OUT = process.argv[2] || path.join(REPO, 'preview-audio');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

if (!fs.existsSync(path.join(BUILD, 'audio.js'))) {
  const files = [
    'theme', 'easing', 'effects', 'particles', 'stickman', 'stickman-v2', 'charts', 'textfx',
    'scene-context', 'scene-props', 'scale-law', 'scenes-host', 'scenes-data', 'scenes-text',
    'scenes-finance', 'analytics', 'script-data', 'timeline', 'director', 'score', 'audio',
  ].map((f) => path.join(REPO, 'src', 'lib', 'engine', f + '.ts'));
  execSync(
    ['node_modules/.bin/tsc', ...files,
     '--outDir', BUILD, '--module', 'commonjs', '--moduleResolution', 'node',
     '--target', 'es2022', '--skipLibCheck', '--esModuleInterop', '--resolveJsonModule'].join(' '),
    { stdio: 'inherit', cwd: REPO }
  );
}
globalThis.document = { createElement: () => createCanvas(64, 64) };
globalThis.OffscreenCanvas = class { constructor(w, h) { return createCanvas(w, h); } };

const audio = require(path.join(BUILD, 'audio.js'));
const score = require(path.join(BUILD, 'score.js'));
const beds = require(path.join(BUILD, 'beds.js'));

function renderLoopWav(mood, variant, vol, outPath) {
  const loop = audio.renderMoodLoopDsp(mood, variant, vol);
  audio.reverbLoopCircular(loop, 0.22);
  audio.masterGlue(loop.L, loop.R);
  const bytes = beds.encodeWavPcm16(loop.L, loop.R, 24000);
  fs.writeFileSync(outPath, Buffer.from(bytes));
  console.log('wrote', outPath, (bytes.length / 1024).toFixed(0) + 'KB');
}

renderLoopWav('sparse', 0, 0.9, path.join(OUT, 'ledger-sparse-loop.wav'));
renderLoopWav('bright', 0, 0.9, path.join(OUT, 'ledger-bright-loop.wav'));
renderLoopWav('resolve', 0, 0.9, path.join(OUT, 'ledger-resolve-loop.wav'));
console.log('done ->', OUT);
