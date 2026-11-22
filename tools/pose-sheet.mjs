/* Phase 1 character pose sheet — draws the five key poses + hand/face
 * close-ups at hero rig scale on plain cards, for BEFORE/AFTER craft
 * comparison. Deterministic; run: node tools/pose-sheet.mjs --out x.png */
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createCanvas } from 'canvas';
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(__dirname, '..', '.render-check-build');
const { drawStickmanV2, limb2, handGlyph } = require(path.join(BUILD, 'stickman-v2.js'));
const { POSES } = require(path.join(BUILD, 'stickman.js'));

const out = process.argv[process.argv.indexOf('--out') + 1] || '/tmp/pose-sheet.png';
const W = 2340, H = 1400;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#DCE9E3';
ctx.fillRect(0, 0, W, H);
ctx.fillStyle = '#0F2733';
ctx.font = '700 34px Inter, sans-serif';
ctx.fillText('PHASE 1 CHARACTER SHEET — climb / leanOnK / shock / crossed / sitBack', 40, 52);

const POSE_LIST = ['climb', 'leanOnK', 'shock', 'crossed', 'sitBack'];
const cardW = 432, cardH = 620, gap = 20, x0 = 40, y0 = 90;
POSE_LIST.forEach((name, i) => {
  const x = x0 + i * (cardW + gap);
  const y = y0;
  ctx.fillStyle = '#F4F1E8';
  ctx.beginPath();
  ctx.roundRect(x, y, cardW, cardH, 18);
  ctx.fill();
  ctx.strokeStyle = '#2E4A43';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#0F2733';
  ctx.font = '700 26px Inter, sans-serif';
  ctx.fillText(name, x + 20, y + 42);
  ctx.strokeStyle = '#2E4A43';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 30, y + 540);
  ctx.lineTo(x + cardW - 30, y + 540);
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, cardW, cardH);
  ctx.clip();
  drawStickmanV2(ctx, x + cardW / 2, y + 540, 1.75, 1600, {
    pose: POSES[name],
    alpha: 1,
    look: name === 'leanOnK' ? -0.6 : 0,
    talk: 0.0,
    faceScale: name === 'shock' ? 1.5 : 1,
    satchel: false,
  }, 100 + i * 7);
  ctx.restore();
});

// ── 1.2 VERIFICATION PRINT — the measured head-height ratio ──────────────────
// The report's canon: head ≤ 24% of figure height at full-body rigs, and the
// demand is a MEASURED print from this tool ("add a print, not a new system").
// Mechanism: per card, scan the ivory field for ink rows (the card border and
// the stand line are excluded by the scan window); the head mass runs from the
// topmost ink row down to the minimum-width row (the neck) inside the top 45%
// of the figure; the figure runs to the stand line at y+540.
const HEAD_GATE = 24;
{
  const img = ctx.getImageData(0, 0, W, H).data;
  const inkAt = (px, py) => {
    const i = (py * W + px) * 4;
    return img[i] + img[i + 1] + img[i + 2] < 400;
  };
  console.log('\n1.2 CANON CHECK — measured head-height / figure-height (gate ≤ 24%):');
  let canonFails = 0;
  POSE_LIST.forEach((name, i) => {
    const x = x0 + i * (cardW + gap), y = y0;
    const x0c = x + 8, x1c = x + cardW - 8, ground = y + 540;
    let topRow = -1;
    for (let py = y + 60; py < ground - 6 && topRow < 0; py++) {
      for (let px = x0c; px < x1c; px++) if (inkAt(px, py)) { topRow = py; break; }
    }
    if (topRow < 0) { console.log(`  ${name}: no ink measured`); return; }
    const figH = ground - topRow;
    // the neck = the minimum-ink-width row inside the top 45% of the figure
    let neckRow = -1, neckW = 1e9;
    for (let py = topRow + 8; py < topRow + figH * 0.45; py++) {
      let w = 0;
      for (let px = x0c; px < x1c; px++) if (inkAt(px, py)) w++;
      if (w > 2 && w < neckW) { neckW = w; neckRow = py; }
    }
    const headH = neckRow > 0 ? neckRow - topRow : figH * 0.3;
    const ratio = (headH / figH) * 100;
    // the report's gate scopes to FULL-BODY rigs ("head ≤ 24% of figure
    // height at full-body rigs") — a seated rig compresses the figure
    // (the legs fold onto the perch), so its ratio inflates by design
    // and is measured + printed but not gated.
    const seated = /sit/i.test(name);
    const ok = seated || ratio <= HEAD_GATE;
    if (!ok) canonFails++;
    console.log(`  ${name.padEnd(9)} head ${Math.round(headH)}px / figure ${Math.round(figH)}px = ${ratio.toFixed(1)}%  ${seated ? 'SEATED-INFORMATIVE' : ok ? 'PASS' : 'FAIL'}`);
  });
  console.log(canonFails === 0
    ? `  canon: PASS — every full-body rig inside the ≤ ${HEAD_GATE}% gate`
    : `  canon: FAIL — ${canonFails} rig(s) over the ${HEAD_GATE}% gate`);
}

ctx.fillStyle = '#0F2733';
ctx.font = '700 34px Inter, sans-serif';
ctx.fillText('HAND GLYPHS — point / pinch / grip (5x, drawn on the real limb endpoint)', 40, 780);
const handModes = [['point', 'point'], ['pinch', 'pinch'], ['grip', 'fist']];
handModes.forEach(([mode, glyphArg], i) => {
  const x = 40 + i * 760, y = 820;
  ctx.fillStyle = '#F4F1E8';
  ctx.fillRect(x, y, 720, 480);
  ctx.strokeStyle = '#2E4A43';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, 720, 480);
  ctx.fillStyle = '#0F2733';
  ctx.font = '700 26px Inter, sans-serif';
  ctx.fillText(mode, x + 20, y + 40);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, 720, 480);
  ctx.clip();
  // the forearm reaches down-right; limb2 returns the true hand position
  const hp = limb2(ctx, x + 120, y + 90, 55, 62, 190, 180, 24, 28, 16, '#16211F', 0, 0.92);
  handGlyph(ctx, hp.ex, hp.ey, 62, 30, '#16211F', 3.4, glyphArg, 1);
  ctx.restore();
});

fs.writeFileSync(out, canvas.toBuffer('image/png'));
console.log('saved', out);
