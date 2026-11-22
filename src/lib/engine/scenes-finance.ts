/**
 * GILDED LEDGER scene drawers — the Concentrated-Stock film's own visual
 * language, built on the engine's primitives (charts, cards, chips, the
 * ingot brand glyph, the one-light shadow system).
 *
 * Every drawer is a pure function of (W, H, t, props) — scrub-safe like
 * the rest of the engine. Every data scene carries the lower-third
 * SOURCE chip (`s.src`) — the visual signature of a researched channel.
 * The palette does the differentiating: champagne paper, emerald/oxblood
 * data ink, gold-leaf accents, serif display numerals.
 */

import { clamp01, easeInOutCubic, easeOutBack, easeOutCubic, easeOutQuad, hashStr, lerp, springTo } from './easing';
import { PALETTE, TONE, card, chip, rgba, roundRect, setFont, fitText, FONT_DISPLAY, FONT_UI, CAPTION_ZONE_TOP, scenePlate, paintBg, chapterFamily } from './theme';
import { impactRing, microShake, sparkles, drawK, depthShift } from './effects';
import { SceneCtx } from './scene-context';
import { lineChart, lineChartYBounds, wrapText, SeriesSpec } from './charts';
import { drawStickmanV2, talkAt } from './stickman-v2';
import { POSES, blendPose } from './stickman';
import { registerRect, registerText } from './collision';
import { sourceTag, sceneTitle } from './charts';
// B2 MARKET-STANDARD FIX (review report B2 [P1]): the finance data rooms
// stage the certified side-host presenter (the same figure every other
// data scene uses) — the chart beats stop rendering as a figureless deck.
import { hostSmall } from './scenes-data';
import { resolveProp } from './scene-props';

// ── shared furniture ─────────────────────────────────────────────────────────

/** The room: bg + chapter plate. Every finance scene sits in a room. */
function room(g: SceneCtx, tone: 'up' | 'down' | 'gold' | 'neutral' | undefined = undefined): void {
  paintBg(g.ctx, g.W, g.H, g.t, g.chapterTone);
  scenePlate(g.ctx, g.W, g.H, tone ?? g.chapterTone ?? 'up', 0.95, null, { furniture: false });
}

// ── E1/E2/E4 — THE ANNOTATION COLUMN (review report E1 [P0], E2 [P1], E4 [P2]) ──
// The market bar (review E1): "every third of the frame either carries
// information or is intentionally cropped by a content mass." The data
// scenes owned a left chart and surrendered the right third + the bottom
// band as cream field. The ledger card funds them: a structured stack of
// annotation rows (label + value on hairlines) riding the beat's own
// reveal clocks — the delta-badge / value-label / benchmark-ghost
// vocabulary the premium finance standard annotates with, and the
// full-width structured mass the exitTiles grid already carried (E4's
// bar). Every card registers with the collision guard (E3's law).
function ledgerCard(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
  head: string,
  rows: Array<{ label: string; value: string; tone?: 'up' | 'down' | 'gold' | 'muted' }>,
  t: number, delay = 500, foot?: string
): void {
  const cp = clamp01((t - delay) / 600);
  if (cp <= 0) return;
  ctx.save();
  ctx.globalAlpha = cp;
  ctx.translate(0, (1 - easeOutCubic(cp)) * 18);
  card(ctx, x, y, w, h, { r: 20 });
  registerRect('ledger:' + head.slice(0, 14), x, y, w, h);
  setFont(ctx, 25, 700);
  ctx.fillStyle = PALETTE.goldDeep;
  ctx.textAlign = 'left';
  ctx.fillText(head, x + 30, y + 46);
  ctx.strokeStyle = rgba(PALETTE.gold, 0.5);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 30, y + 60);
  ctx.lineTo(x + w - 30, y + 60);
  ctx.stroke();
  const bodyTop = y + 78;
  const footH = foot ? 64 : 0; // C3: room for the wrapped second foot line
  const rowH = Math.min(58, (h - 78 - footH - 18) / Math.max(1, rows.length));
  rows.forEach((r, i) => {
    const rp = clamp01((t - delay - 130 - i * 150) / 380);
    if (rp <= 0) return;
    ctx.save();
    ctx.globalAlpha = rp;
    const ry = bodyTop + i * rowH;
    setFont(ctx, 26, 600);
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.textAlign = 'left';
    ctx.fillText(r.label, x + 30, ry + 20);
    setFont(ctx, 28, 700, FONT_DISPLAY);
    ctx.fillStyle = r.tone === 'down' ? PALETTE.down : r.tone === 'up' ? PALETTE.up : r.tone === 'gold' ? PALETTE.goldDeep : PALETTE.ink;
    ctx.textAlign = 'right';
    ctx.fillText(r.value, x + w - 30, ry + 20);
    ctx.textAlign = 'left';
    ctx.strokeStyle = rgba(PALETTE.shadow, 0.16);
    ctx.lineWidth = 1.5;
    if (i < rows.length - 1) {
      ctx.beginPath();
      ctx.moveTo(x + 30, ry + rowH - 8);
      ctx.lineTo(x + w - 30, ry + rowH - 8);
      ctx.stroke();
    }
    ctx.restore();
  });
  if (foot) {
    const fp = clamp01((t - delay - 130 - rows.length * 150) / 380);
    if (fp > 0) {
      ctx.save();
      ctx.globalAlpha = fp;
      // C3 MARKET-STANDARD FIX (review report C3 [P0] — the ledger note
      // clipped mid-word at the card edge and again at the frame edge):
      // the foot rides fitText with the wrap path and a width guard —
      // "the fund route defers every line of it" can no longer print past
      // the plate. A two-line foot lifts its first line so both sit
      // INSIDE the card (the reserved footH makes the rows make room).
      setFont(ctx, 24, 600);
      const footLines = ctx.measureText(foot).width > w - 60 ? 2 : 1;
      fitText(ctx, foot, x + 30, y + h - (footLines === 2 ? 52 : 24), w - 60, 24, 600, FONT_UI, PALETTE.goldDeep);
      ctx.restore();
    }
  }
  ctx.restore();
}

/** The lower-third SOURCE chip — the researched-channel signature. */
function srcChip(g: SceneCtx, alpha = 1): void {
  const src = g.s.src as string | undefined;
  if (!src) return;
  sourceTag(g.ctx, g.W, src, g.H * 0.925, alpha);
}

/** Title + gold hairline in the scene's top band. */
function title(g: SceneCtx, text: string, y = 220): void {
  sceneTitle(g.ctx, text, 180, y, clamp01(g.t / 600));
}

/** A serif display numeral — the gilded register. */
function goldNumeral(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, alpha = 1, align: CanvasTextAlign = 'left'): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  setFont(ctx, size, 700, FONT_DISPLAY);
  ctx.fillStyle = PALETTE.goldDisplay;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Progressive reveal: truncate a point list at `frac` (interpolated tip). */
function partialPoints(pts: [number, number][], frac: number): [number, number][] {
  if (frac >= 1) return pts;
  if (frac <= 0) return [];
  const out: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    if (x1 <= frac) out.push([x0, y0]);
    else {
      const f = (frac - x0) / (x1 - x0);
      out.push([x0, y0], [frac, y0 + (y1 - y0) * f]);
      return out;
    }
  }
  return pts;
}

/** The one-light gilded card — warm vellum with a gold hairline top edge. */
function gildedCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, glow?: string): void {
  card(ctx, x, y, w, h, { r: 28, glow });
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.gold, 0.55);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x + 24, y + 2);
  ctx.lineTo(x + w - 24, y + 2);
  ctx.stroke();
  ctx.restore();
}

// ── crossChart — the Ballmer/Gates crossing, XCLR cycles ─────────────────────
// Two wealth lines that cross; the crossing IS the story. Modes carry the
// progressive build the cold open reads over.

const CROSS_A: [number, number][] = [[0, 68], [0.25, 74], [0.5, 82], [0.75, 96], [1, 124]]; // Gates (sold, diversified)
const CROSS_B: [number, number][] = [[0, 18], [0.25, 34], [0.5, 58], [0.75, 92], [1, 139]]; // Ballmer (held)
const XCLR_SPY: [number, number][] = [[0, 100], [0.18, 82], [0.45, 104], [0.72, 122], [1, 152]];
const XCLR_FUND: [number, number][] = [[0, 100], [0.18, 87], [0.45, 103], [0.72, 116], [1, 134]];

export function crossChartScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g);
  title(g, (s.title as string) || 'Two decisions, one company');
  srcChip(g);

  const mode = (s.mode as string) || 'build-a';
  const isXclr = mode.startsWith('xclr');
  const series: SeriesSpec[] = [];
  const aPts = isXclr ? XCLR_SPY : CROSS_A;
  const bPts = isXclr ? XCLR_FUND : CROSS_B;
  const aName = isXclr ? 'S&P 500' : 'Gates — sold for 30 years';
  const bName = isXclr ? 'XCLR (collar 95-110)' : 'Ballmer — held';
  const aTone = isXclr ? 'muted' : 'muted';
  const bTone = isXclr ? 'up' : 'up';

  // progressive build — the line grows as the VO reads
  let pa = mode === 'build-a' || mode === 'hold-chip' ? clamp01(t / 2400) : 1;
  let pb = mode === 'build-a' || mode === 'hold-chip' || mode === 'build-b' || mode === 'xclr-2022'
    ? (mode === 'build-a' || mode === 'hold-chip' ? 0 : clamp01((t - 400) / 2400))
    : 1;
  if (mode === 'build-a') pb = 0;

  const cx = 310, cy = 300, cw = W - 900, ch = H * 0.44;
  series.push({ name: aName, tone: aTone, points: partialPoints(aPts, pa) });
  if (pb > 0) series.push({ name: bName, tone: bTone, points: partialPoints(bPts, pb) });
  lineChart(ctx, {
    x: cx, y: cy, w: cw, h: ch, series, p: 1, t,
    gridLines: 4, showYAxis: true, lineWidth: isXclr ? 6 : 7,
    annotations: [],
  });
  // E2 MARKET-STANDARD FIX (review report E2 [P1] — "crossChart one line"
  // with the right third empty): an always-on LEGEND (premium charts
  // label their series) + the decision ledger funding the right column —
  // the two routes named, the counterfactual ghost noted.
  const lp2 = clamp01((t - 600) / 500);
  if (lp2 > 0 && series.length) {
    ctx.save();
    ctx.globalAlpha = lp2;
    let lgx = cx + 24;
    series.forEach((sr) => {
      ctx.fillStyle = sr.tone === 'up' ? PALETTE.up : sr.tone === 'down' ? PALETTE.down : PALETTE.inkSoft;
      roundRect(ctx, lgx, cy - 30, 22, 22, 5);
      ctx.fill();
      setFont(ctx, 24, 600);
      ctx.fillStyle = PALETTE.inkSoft;
      ctx.textAlign = 'left';
      const nm = isXclr ? (sr.tone === 'up' ? 'XCLR (collar 95–110)' : 'S&P 500') : (sr.tone === 'up' ? 'Ballmer — held' : 'Gates — sold for 30 years');
      ctx.fillText(nm, lgx + 32, cy - 12);
      lgx += 32 + ctx.measureText(nm).width + 44;
    });
    ctx.restore();
  }
  if (!isXclr) {
    ledgerCard(ctx, W - 470 - 80, H * 0.235, 470, 96 + 2 * 58 + 74, 'ONE COMPANY, ONE DECISION', [
      { label: 'the sold route', value: 'GATES', tone: 'muted' },
      { label: 'the held route', value: 'BALLMER', tone: 'up' },
    ], t, 700, 'benchmark ghost: the $100B gap is the decision, not the market');
  }

  // B2 MARKET-STANDARD FIX (review report B2 [P1] — NO PRESENTER IN THE
  // DATA CHAPTERS): the cold-open crossing gets its narrator — the Data
  // Desk presenter stands in the room's free left column at the certified
  // side-host register, his gesture cycle pointing INTO the crossing.
  hostSmall(g, 130, 'pointR', 31, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);

  // the HOLD chip — the thesis in one word
  if (mode === 'hold-chip' || mode === 'build-b' || mode === 'cross-marked' || mode === 'delta') {
    const cp = clamp01((t - 200) / 500);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha = cp;
      const bx = cx + cw * 0.72, by = cy - 64;
      chip(ctx, 'HELD', bx, by, { size: 34, bg: rgba(PALETTE.up, 0.14), fg: PALETTE.up, border: rgba(PALETTE.up, 0.5) });
      ctx.restore();
    }
  }
  // the cross marker + delta chip
  if (mode === 'cross-marked' || mode === 'delta') {
    const mp = clamp01((t - 300) / 600);
    if (mp > 0) {
      ctx.save();
      ctx.globalAlpha = mp;
      const xPx = cx + cw * 0.88;
      const yPx = cy + ch * 0.36;
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(xPx, yPx, 26 + Math.sin(t / 300) * 3, 0, Math.PI * 2);
      ctx.stroke();
      chip(ctx, 'JULY 2024 — THE CROSSING', xPx - 210, yPx + 44, { size: 30, bg: PALETTE.goldWash, fg: PALETTE.goldDeep, border: rgba(PALETTE.gold, 0.6) });
      ctx.restore();
    }
  }
  if (mode === 'delta') {
    const dp = clamp01((t - 900) / 700);
    if (dp > 0) {
      ctx.save();
      ctx.globalAlpha = dp;
      const sx = microShake(t, 1000, 7);
      ctx.translate(sx.dx, sx.dy);
      gildedCard(ctx, W * 0.66, H * 0.555, 470, 210, rgba(PALETTE.gold, 0.35));
      goldNumeral(ctx, '$100B', W * 0.66 + 235, H * 0.60 + 118, 120, 1, 'center');
      setFont(ctx, 34, 600);
      ctx.fillStyle = PALETTE.inkSoft;
      ctx.textAlign = 'center';
      ctx.fillText('the cost of one decision', W * 0.615 + 235, H * 0.60 + 172);
      ctx.restore();
      impactRing(ctx, W * 0.66 + 235, H * 0.60 + 105, t, 1000);
      // E4 MARKET-STANDARD FIX (review report E4 [P1] — THE HOOK STAGED AS
      // A PLAIN CHART): the $100B verdict takes the chapter-card language —
      // the sparkle burst fires AT the card (the old system only fired on
      // line-draw completion), the film's opening argument gets the
      // emphasis register the chapter cards get.
      sparkles(ctx, W * 0.66 + 400, H * 0.555 + 40, t, 1000, { count: 10, radius: 110 });
    }
  }
  // xclr cycle verdict chips
  if (mode === 'xclr-cycle') {
    const dp = clamp01((t - 600) / 700);
    if (dp > 0) {
      ctx.save();
      ctx.globalAlpha = dp;
      goldNumeral(ctx, '+34%', cx + cw * 0.9, cy + ch * 0.42, 92, 1, 'right');
      setFont(ctx, 40, 600);
      ctx.fillStyle = PALETTE.inkSoft;
      ctx.textAlign = 'right';
      ctx.fillText('vs  +52%  the index', cx + cw * 0.9, cy + ch * 0.42 + 60);
      ctx.restore();
    }
  }
}

// ── drawdownChart — Enron to zero, UNH −50% ──────────────────────────────────
// The catastrophic-loss shape, shaded. The downside is not −2%.

const UNH_PATH: [number, number][] = [
  [0, 100], [0.12, 116], [0.22, 108], [0.32, 124], [0.45, 118], [0.56, 96],
  [0.68, 78], [0.8, 62], [0.9, 52], [1, 47],
];
const ENRON_PATH: [number, number][] = [[0, 100], [0.2, 88], [0.4, 62], [0.55, 34], [0.7, 12], [0.85, 3], [1, 0]];

export function drawdownChartScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'down');
  title(g, (s.title as string) || 'The catastrophic shape');
  srcChip(g);
  const mode = (s.mode as string) || 'unh-path';
  const isEnron = mode === 'enron' || mode === 'to-zero';
  const pts = isEnron ? ENRON_PATH : UNH_PATH;
  const drawP = mode === 'unh-path' || mode === 'enron' ? clamp01(t / 2600) : 1;

  const cx = 190, cy = 300, cw = W - 700, ch = H * 0.44;
  // the shaded loss region after the peak
  if (!isEnron && drawP >= 1 && (mode === 'shade-loss' || mode === 'vs-math' || mode === 'punch')) {
    const bp = clamp01((t - 300) / 700);
    if (bp > 0) {
      ctx.save();
      ctx.globalAlpha = bp * 0.28; // D1: the loss region is a MASS, not a whisper
      ctx.fillStyle = PALETTE.down;
      const px = cx + cw * 0.44;
      ctx.beginPath();
      ctx.rect(px, cy, cw * 0.56, ch);
      ctx.fill();
      ctx.restore();
    }
  }
  lineChart(ctx, {
    x: cx, y: cy, w: cw, h: ch,
    series: [{ name: isEnron ? 'Enron' : 'UNH', tone: 'down', points: partialPoints(pts, drawP) }],
    p: 1, t, gridLines: 4, showYAxis: true, lineWidth: 7,
    // U24 (review report U24 — EVERY HERO CHART CARRIES THE STANDARD SET):
    // the endpoint value, the delta badge and the axis dates — the Enron
    // curve is no longer "one line + one dot".
    endpointLabel: isEnron ? '→ 0' : '−50%',
    deltaBadge: { value: isEnron ? '−100%' : '−53%', tone: 'down' },
    xLabels: isEnron
      ? [{ at: 0, label: 'Dec 1999', anchor: 'start' as const }, { at: 1, label: 'Nov 2001', anchor: 'end' as const }]
      : undefined,
  });
  // E2 MARKET-STANDARD FIX (review report E2 [P1] — "the drawdownChart
  // (Enron) is one red curve and one dot" with 60% of the frame empty):
  // THE SHAPE LEDGER (right column) — the peak, the trough, the
  // benchmark ghost curve, and the tax-math punchline the VO lands; plus
  // an always-on legend chip naming the curve (premium charts label).
  const lg4 = clamp01((t - 400) / 450);
  if (lg4 > 0) {
    ctx.save();
    ctx.globalAlpha = lg4;
    ctx.fillStyle = PALETTE.down;
    roundRect(ctx, cx + 24, cy - 30, 22, 22, 5);
    ctx.fill();
    setFont(ctx, 24, 600);
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.textAlign = 'left';
    ctx.fillText(isEnron ? 'ENRON — to zero' : 'UNH — peak to trough', cx + 56, cy - 12);
    ctx.restore();
  }
  ledgerCard(ctx, W - 440 - 80, H * 0.235, 440, 96 + 3 * 58 + 76, 'THE SHAPE OF CATASTROPHE', [
    { label: isEnron ? 'UNH — the milder cousin' : 'the peak', value: isEnron ? '−53%' : '+24%', tone: 'muted' },
    { label: 'the trough', value: isEnron ? '→ 0' : '−50%+', tone: 'down' },
    { label: 'the tax it "saved"', value: '24%', tone: 'gold' },
  ], t, 500, isEnron ? 'zero is a place. there is no harvest at zero.' : 'benchmark ghost: Enron rode the same shape to zero');

  // peak chip + loss chip
  if (!isEnron && (mode === 'shade-loss' || mode === 'vs-math' || mode === 'punch')) {
    const cp = clamp01((t - 700) / 600);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha = cp;
      chip(ctx, 'PEAK', cx + cw * 0.44 - 60, cy + ch * 0.16, { size: 30, bg: PALETTE.white, fg: PALETTE.inkSoft });
      chip(ctx, '−50%+', cx + cw * 0.94 - 90, cy + ch * 0.86, { size: 34, bg: rgba(PALETTE.down, 0.14), fg: PALETTE.down, border: rgba(PALETTE.down, 0.5) });
      ctx.restore();
    }
  }
  if (mode === 'vs-math' || mode === 'punch') {
    const vp = clamp01((t - 900) / 700);
    if (vp > 0) {
      ctx.save();
      ctx.globalAlpha = vp;
      gildedCard(ctx, W * 0.615, H * 0.60, 470, 220, rgba(PALETTE.down, 0.3));
      setFont(ctx, 44, 700, FONT_DISPLAY);
      ctx.fillStyle = PALETTE.ink;
      ctx.textAlign = 'left';
      ctx.fillText('tax "saved":  24%', W * 0.615 + 36, H * 0.60 + 76);
      ctx.fillText('drawdown:  −50%+', W * 0.615 + 36, H * 0.60 + 150);
      setFont(ctx, 30, 600);
      ctx.fillStyle = PALETTE.down;
      ctx.fillText('a rounding error against the risk', W * 0.615 + 36, H * 0.60 + 200);
      ctx.restore();
    }
  }
  if (mode === 'to-zero') {
    const zp = clamp01((t - 500) / 600);
    if (zp > 0) {
      ctx.save();
      ctx.globalAlpha = zp;
      chip(ctx, '$0 — locked out of the plan', cx + cw * 0.72, cy + ch * 0.92 - 20, { size: 32, bg: rgba(PALETTE.down, 0.15), fg: PALETTE.down, border: rgba(PALETTE.down, 0.55) });
      ctx.restore();
    }
  }
  if (mode === 'punch') {
    const pp = clamp01((t - 300) / 600);
    if (pp > 0) {
      ctx.save();
      ctx.globalAlpha = pp;
      goldNumeral(ctx, '−50%+', cx + cw, cy + 60, 110, 1, 'right');
      ctx.restore();
    }
  }

  // B2 MARKET-STANDARD FIX (review report B2 [P1] — NO PRESENTER IN THE
  // DATA CHAPTERS): the drawdown curve gets its narrator — the shape
  // ledger owns the right column, so the presenter stands in the quiet
  // left column, gesture cycle aimed into the curve.
  hostSmall(g, 92, 'pointR', 35, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// ── exitTiles — the six gold tiles ───────────────────────────────────────────
// The cold open's promise and every chapter hand-off: six numbered ingot
// tiles, one per exit; each mode SPOTlights one tile and dims the rest.

const EXITS = [
  ['1', 'The 10b5-1 plan', 'the conveyor belt'],
  ['2', 'Exchange funds', 'the seven-year marriage'],
  ['3', 'Direct indexing', 'tax alpha'],
  ['4', 'Protective collars', 'the Cuban trade'],
  ['5', 'Charitable vehicles', 'the irreversible math'],
  ['6', 'Levered long/short', 'the family-office tool'],
];

export function exitTilesScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'gold');
  const mode = (s.mode as string) || 'all';
  const headP = clamp01(t / 500);
  if (headP > 0) {
    ctx.save();
    ctx.globalAlpha = headP;
    setFont(ctx, 44, 700, FONT_DISPLAY);
    ctx.fillStyle = PALETTE.ink;
    ctx.textAlign = 'left';
    ctx.fillText('THE SIX EXITS', 180, 190);
    ctx.restore();
  }

  const spot = mode.startsWith('spot-') ? Number(mode.slice(5)) : 0;
  const cols = 3, rows = 2;
  const tw = 480, th = 210, gapX = 60, gapY = 66;
  const x0 = (W - (cols * tw + (cols - 1) * gapX)) / 2;
  const y0 = H * 0.30;
  for (let i = 0; i < 6; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const x = x0 + col * (tw + gapX);
    const y = y0 + row * (th + gapY);
    const ap = clamp01((t - 150 - i * 130) / 550);
    if (ap <= 0) continue;
    const dim = spot > 0 && spot !== i + 1 ? 0.35 : 1;
    const lit = (spot === i + 1 || mode === 'all' || mode === 'save-prompt');
    ctx.save();
    ctx.globalAlpha = ap * dim;
    // the tile: lift on spot
    const lift = lit ? -6 : 0;
    gildedCard(ctx, x, y + lift, tw, th, lit ? rgba(PALETTE.gold, 0.4) : undefined);
    // the numeral — serif gold
    goldNumeral(ctx, EXITS[i][0], x + 46, y + lift + 108, 108);
    setFont(ctx, 40, 700);
    ctx.fillStyle = PALETTE.ink;
    ctx.textAlign = 'left';
    ctx.fillText(EXITS[i][1], x + 140, y + lift + 92);
    setFont(ctx, 30, 400);
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.fillText(EXITS[i][2], x + 140, y + lift + 142);
    // the ingot mark — bottom-right corner, clear of the titles
    drawK(ctx, x + tw - 46, y + lift + th - 42, 18, 2.5, PALETTE.gold);
    ctx.restore();
  }
  if (mode === 'save-prompt') {
    const sp = clamp01((t - 400) / 600);
    if (sp > 0) {
      ctx.save();
      ctx.globalAlpha = sp;
      chip(ctx, 'BOOKMARK — THE FRAMEWORK LANDS AT THE END', W / 2 - 430, H * 0.845, { size: 34, bg: PALETTE.goldWash, fg: PALETTE.goldDeep, border: rgba(PALETTE.gold, 0.6) });
      ctx.restore();
    }
  }
}

// ── srcCite — the standalone source / disclaimer beat ────────────────────────
export function srcCiteScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'neutral');
  const ap = clamp01(t / 600);
  const source = (s.source as string) || 'SOURCES LINKED BELOW';
  const detail = (s.detail as string) || '';
  ctx.save();
  ctx.globalAlpha = ap;
  // the gilded citation bar
  const bw = Math.min(W * 0.78, 1420);
  const bx = (W - bw) / 2;
  const by = H * 0.36;
  // C8: the card grows to hold the wrapped source line (C3's wrap path
  // can carry it to a second line) + the detail and kicker rows.
  gildedCard(ctx, bx, by, bw, 344, rgba(PALETTE.gold, 0.28));
  // the ingot seal
  drawK(ctx, bx + 110, by + 150, 44, 4, PALETTE.gold);
  setFont(ctx, 52, 700, FONT_DISPLAY);
  ctx.fillStyle = PALETTE.ink;
  ctx.textAlign = 'left';
  const srcLines = ctx.measureText(source).width > bw - 320 ? 2 : 1;
  fitText(ctx, source, bx + 220, by + 128, bw - 320, 52, 700);
  // F5 (review report F5 [P1] — SRC CITE REPEATS ITS OWN SENTENCE): the
  // co-deal beat's detail prop says "every claim carries its source on
  // screen" and the hardcoded gold kicker says "EVERY NUMBER CARRIES ITS
  // SOURCE ON SCREEN" — the same sentence with one word swapped, printed
  // twice on one card (verified at two timestamps, "a template error").
  // The card's designed element is the gold kicker; when the detail line
  // is the same sentence (token-overlap ≥ 70%), the detail yields — the
  // card reads its sentence once.
  const goldLine = 'EVERY NUMBER CARRIES ITS SOURCE ON SCREEN';
  const toks = (v: string): Set<string> =>
    new Set(v.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  const dt = toks(detail), gt = toks(goldLine);
  let overlap = 0;
  dt.forEach((tk) => { if (gt.has(tk)) overlap++; });
  const sameSentence = detail.length > 0 && overlap / Math.max(1, dt.size) >= 0.7;
  // C8: the rows below the source step DOWN when the source wrapped —
  // no row of the ledger ever prints through another.
  const detailY = by + (srcLines === 2 ? 248 : 200);
  setFont(ctx, 36, 400);
  ctx.fillStyle = PALETTE.inkSoft;
  if (!sameSentence) ctx.fillText(detail, bx + 220, detailY);
  setFont(ctx, 30, 600);
  ctx.fillStyle = PALETTE.goldDeep;
  ctx.fillText(goldLine, bx + 220, detailY + (sameSentence ? 0 : 56));
  // C8 MARKET-STANDARD FIX (review report C8 [P1] — THE SOURCE BEAT IS
  // ~75% EMPTY CANVAS): the citation card stops floating in beige — the
  // beat becomes the source ledger: a kicker above the card and the
  // three source pillars below it. The vertical bands all carry a job.
  setFont(ctx, 30, 700);
  ctx.fillStyle = PALETTE.goldDeep;
  ctx.textAlign = 'center';
  ctx.fillText('THE DATA DESK — SOURCE LEDGER', W / 2, by - 52);
  ctx.textAlign = 'left';
  const pillars = ['IRC §1(h) · §1411', 'CA FTB / NY DTF TOP RATES', 'J.P. MORGAN GUIDE TO THE MARKETS'];
  let px8 = W / 2 - 1290 / 2;
  for (const p of pillars) {
    chip(ctx, p, px8, H * 0.745, { size: 26, bg: PALETTE.white, fg: PALETTE.inkSoft, border: rgba(PALETTE.gold, 0.45) });
    px8 += 440;
  }
  ctx.restore();
}

// ── distBars — the J.P. Morgan outcome distribution ──────────────────────────
export function distBarsScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'down');
  title(g, (s.title as string) || 'The base rates');
  srcChip(g);
  const mode = (s.mode as string) || 'intro';
  const rows = [
    { label: 'underperformed the index', value: 66, tone: 'muted', big: '2/3' },
    { label: 'catastrophic loss — −70%+, never recovered', value: 40, tone: 'down', big: '40%' },
    { label: 'the 2024 update, through 2020', value: 44, tone: 'down', big: '44%' },
  ];
  const idx = mode === 'bar-1' ? 0 : mode === 'bar-2' ? 1 : mode === 'bar-3' ? 2 : -1;
  const showCount = idx < 0 ? 0 : idx + 1;
  const bx = 190, bw = W - 700;
  for (let i = 0; i < showCount; i++) {
    const r = rows[i];
    const bp = clamp01((t - 300 - i * 350) / 800);
    if (bp <= 0) continue;
    // C8 MARKET-STANDARD FIX (review report C8 [P1] — THE DISTRIBUTION
    // FRAME IS ~60% EMPTY): the bar band scales into the frame — taller
    // bars (104 → 130), heavier numerals (84 → 104), the band seated
    // higher (0.28H, pitch 160 keeps the stack clear of the caption zone).
    const y = H * 0.28 + i * 160;
    const tone = TONE(r.tone);
    ctx.save();
    ctx.globalAlpha = bp;
    // the label sits ABOVE its bar — no label/numeral collisions
    setFont(ctx, 34, 600);
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.textAlign = 'left';
    ctx.fillText(r.label, bx + 330, y - 18);
    // track
    ctx.fillStyle = PALETTE.track;
    roundRect(ctx, bx + 330, y, bw - 330, 130, 26);
    ctx.fill();
    // fill — D4 MARKET-STANDARD FIX (review report D4 [P2]): the verdict
    // bars print in the VIVID tone at fill scale — the film's strongest
    // color moment belongs to the frame that carries the number.
    ctx.fillStyle = tone.vivid ?? tone.main;
    roundRect(ctx, bx + 330, y, (bw - 330) * (r.value / 100), 130, 26);
    ctx.fill();
    // serif numeral right of the fill
    setFont(ctx, 104, 700, FONT_DISPLAY);
    ctx.fillStyle = PALETTE.ink;
    ctx.textAlign = 'left';
    ctx.fillText(r.big, bx + 330 + (bw - 330) * (r.value / 100) + 30, y + 92);
    ctx.restore();
    if (bp >= 1 && i === showCount - 1) impactRing(ctx, bx + 330 + (bw - 330) * (r.value / 100), y + 65, t, 300 + i * 350 + 800);
  }
  if (mode === 'intro') {
    const ip = clamp01((t - 300) / 600);
    if (ip > 0) {
      ctx.save();
      ctx.globalAlpha = ip;
      setFont(ctx, 44, 600);
      ctx.fillStyle = PALETTE.inkSoft;
      ctx.textAlign = 'left';
      ctx.fillText('Two findings, forty years of data, every Russell 3000 entrant.', 190, H * 0.32);
      ctx.restore();
    }
  }

  // B2 MARKET-STANDARD FIX (review report B2 [P1] — NO PRESENTER IN THE
  // DATA CHAPTERS): the base-rate bars get their narrator — he stands in
  // the quiet left column, gesture cycle aimed at the bar row.
  hostSmall(g, 110, 'pointR', 32, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// ── taxStack — the $3.7M bill, line by line ──────────────────────────────────
export function taxStackScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'gold');
  title(g, (s.title as string) || 'The bill, line by line');
  srcChip(g);
  const mode = (s.mode as string) || 'row-1';
  const rows = [
    { label: 'Federal long-term capital gains', pct: 20, tone: 'down' },
    { label: 'Net investment income tax', pct: 3.8, tone: 'down' },
    { label: 'California state', pct: 13.3, tone: 'down' },
  ];
  const show = mode === 'row-1' ? 1 : mode === 'row-2' ? 2 : 3;
  const totalMode = mode === 'total';
  const bx = 190, bw = W - 760;
  // in total mode the stack compacts upward so the $3.7M card owns the
  // lower band clear of the caption zone
  const y0 = totalMode ? H * 0.235 : H * 0.30;
  const span = totalMode ? H * 0.22 : H * 0.30;
  let acc = 0;
  for (let i = 0; i < show; i++) {
    const r = rows[i];
    const bp = clamp01((t - 350 - i * 400) / 750);
    if (bp <= 0) continue;
    const y = y0 + acc;
    const hgt = (r.pct / 40) * span;
    ctx.save();
    ctx.globalAlpha = bp;
    ctx.fillStyle = rgba(TONE(r.tone).main, 0.85 - i * 0.12);
    roundRect(ctx, bx, y, bw, hgt, 18);
    ctx.fill();
    // the % numeral rides INSIDE when the bar is tall enough, otherwise
    // just right of it; the label sits above-right in the quiet zone
    setFont(ctx, 40, 700);
    ctx.fillStyle = PALETTE.white;
    ctx.textAlign = 'left';
    if (hgt >= 64) {
      ctx.fillText(`${r.label}  ·  ${r.pct}%`, bx + 34, y + hgt / 2 + 14);
    } else {
      ctx.fillStyle = PALETTE.inkSoft;
      setFont(ctx, 30, 600);
      ctx.textAlign = 'right';
      ctx.fillText(`${r.label}  ·  ${r.pct}%`, bx + bw, y - 12);
      ctx.textAlign = 'left';
    }
    ctx.restore();
    acc += hgt + 16;
  }
  // E1/E4 MARKET-STANDARD FIX (review report E1 [P0] — "lockup is ONE gold
  // bar in a cream field"; E4 [P2] — fund every scene to the exitTiles
  // standard): the stack owned x 190-1350 and the right third was empty.
  // The ledger card translates every layer to DOLLARS on the $10M
  // position, totals it, and carries the fund-route benchmark ghost —
  // information, not decoration, in every third of the frame.
  const lw = 430, lx = W - lw - 80, ly = H * 0.235;
  ledgerCard(ctx, lx, ly, lw, 96 + show * 58 + 76, 'THE LEDGER — ON $10M', [
    ...([
      { label: 'Federal LTCG · 20%', value: '$2.00M', tone: 'down' as const },
      { label: 'NIIT · 3.8%', value: '$380K', tone: 'down' as const },
      { label: 'California · 13.3%', value: '$1.33M', tone: 'down' as const },
    ].slice(0, show)),
    { label: 'TOTAL AT SALE', value: ['$2.00M', '$2.38M', '$3.71M'][show - 1], tone: 'gold' as const },
  ], t, 520, 'the fund route defers every line of it');
  if (mode === 'row-2') {
    const cp = clamp01((t - 1200) / 600);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha = cp;
      chip(ctx, '23.8% before the state', bx + bw, H * 0.30 + (20 / 40) * H * 0.30 + 40, { size: 34, bg: PALETTE.white, fg: PALETTE.inkSoft });
      ctx.restore();
    }
  }
  if (mode === 'total') {
    const tp = clamp01(t / 700);
    const sx = microShake(t, 700, 8);
    ctx.save();
    ctx.globalAlpha = tp;
    ctx.translate(sx.dx, sx.dy);
    const cwid = 760;
    gildedCard(ctx, W / 2 - cwid / 2, H * 0.515, cwid, 200, rgba(PALETTE.gold, 0.45));
    goldNumeral(ctx, '$3,700,000', W / 2, H * 0.515 + 104, 96, 1, 'center');
    setFont(ctx, 34, 600);
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.textAlign = 'center';
    ctx.fillText('out the door — on $10M, near-zero basis, California', W / 2, H * 0.515 + 164);
    ctx.restore();
    impactRing(ctx, W / 2, H * 0.515 + 100, t, 700);
    if (tp >= 1) sparkles(ctx, W / 2 + 290, H * 0.515 + 50, t, 700, { count: 8, radius: 100 });
  }

  // B2 MARKET-STANDARD FIX (review report B2 [P1] — NO PRESENTER IN THE
  // DATA CHAPTERS): the bill's COUNTING beats (row-1/2/3) get their
  // narrator — the presenter stands in the quiet left column with his
  // palm planted ON the bill's left edge (the certified contact solve),
  // the head and gesture aimed at the current line. In total mode the
  // $3.7M verdict card owns the lower band and the camera pushes — the
  // room belongs to the number (the scene's own staging declaration).
  // B3 MARKET-STANDARD FIX (review report B3 [P1] — HOLSTERED VERBS): he
  // BALANCES THE COIN COUNT on the same palm (the ledger-resolved
  // coinStack) — the bill is counted by a person, not floating.
  if (!totalMode) {
    hostSmall(g, 92, 'present', 33, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4,
      undefined, undefined, { x: 196, y: 600, hand: 'palm' }, undefined, undefined,
      resolveProp('taxStack', 'coinStack', true) ? 'coinStack' : undefined);
  }
}

// ── napkin — the break-even test, written on a gilded card ───────────────────
export function napkinScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'neutral');
  title(g, (s.title as string) || 'The napkin test');
  srcChip(g);
  const formula = (s.formula as string[]) || [];
  const note = s.note as string | undefined;
  const ap = clamp01(t / 600);
  // C8 MARKET-STANDARD FIX (review report C8 [P1] — THE NAPKIN BEAT IS
  // ~50% EMPTY): the card gains the vertical air it deserves (380 → 420)
  // and the method chip rides under it — the lower band carries a job.
  const bw = 1240, bh = 420;
  const bx = (W - bw) / 2, by = H * 0.28;
  ctx.save();
  ctx.globalAlpha = ap;
  gildedCard(ctx, bx, by, bw, bh, rgba(PALETTE.gold, 0.3));
  // F2 (review report F2 [P0] — THE PUNCHLINE NEVER APPEARS): the words
  // marched left-to-right from a fixed origin with no fit check — on the
  // $1M-account beat the line ran past the card edge and "$1,700 of usable
  // losses" (the expression's punchline) was clipped at BOTH sampled
  // timestamps. The formula now WRAPS: a greedy line packer (each word
  // measured at its own size), each line shrunk only as far as it needs
  // (floor 0.62) to fit the card's inner width, baselines stepping down.
  // The word-by-word reveal clocks are untouched — same sequence, same
  // timing, scrub-safe.
  const innerW = bw - 180;
  const measureWord = (word: string): { w: number; isOp: boolean } => {
    const isOp = word.length <= 2 && /[÷=×+\u2192]/.test(word);
    setFont(ctx, isOp ? 96 : 74, isOp ? 400 : 700, FONT_DISPLAY);
    return { w: ctx.measureText(word).width + (isOp ? 44 : 30), isOp };
  };
  type NapLine = { words: string[]; widths: number[]; ops: boolean[]; total: number };
  const lines: NapLine[] = [];
  let cur: NapLine = { words: [], widths: [], ops: [], total: 0 };
  for (const word of formula) {
    const m = measureWord(word);
    if (cur.words.length && cur.total + m.w > innerW) {
      lines.push(cur);
      cur = { words: [], widths: [], ops: [], total: 0 };
    }
    cur.words.push(word);
    cur.widths.push(m.w);
    cur.ops.push(m.isOp);
    cur.total += m.w;
  }
  if (cur.words.length) lines.push(cur);
  const lineH = 118;
  let wi = 0;
  lines.forEach((ln, li) => {
    const fy = by + 150 + li * lineH;
    // shrink this line only as far as it needs
    const k = ln.total > innerW ? Math.max(0.62, innerW / ln.total) : 1;
    let fx = bx + 90 + (innerW - ln.total * k) / 2;
    for (let j = 0; j < ln.words.length; j++, wi++) {
      const wp = clamp01((t - 300 - wi * 330) / 400);
      if (wp <= 0) continue;
      ctx.save();
      ctx.globalAlpha = wp;
      const isOp = ln.ops[j];
      setFont(ctx, (isOp ? 96 : 74) * k, isOp ? 400 : 700, FONT_DISPLAY);
      ctx.fillStyle = isOp ? PALETTE.goldDeep : PALETTE.ink;
      ctx.textAlign = 'left';
      ctx.fillText(ln.words[j], fx, fy);
      fx += ln.widths[j] * k;
      ctx.restore();
    }
  });
  if (note) {
    const np = clamp01((t - 300 + formula.length * 330) / 500);
    if (np > 0) {
      ctx.save();
      ctx.globalAlpha = np;
      setFont(ctx, 34, 600);
      ctx.fillStyle = PALETTE.inkSoft;
      ctx.textAlign = 'left';
      ctx.fillText(note, bx + 90, by + bh - 74);
      ctx.restore();
    }
  }
  ctx.restore();

  // E3 MARKET-STANDARD FIX (review report E3 [P1] — THE MASCOT IS ABSENT
  // FROM THE BEATS THAT CARRY THE FACTS): the exit chapters were
  // figureless — a stick-man channel's retention contract is that the
  // character carries the argument, and here he was a recurring guest.
  // The certified side-host register (the B2 staging: the free left band,
  // gesture cycle aimed INTO the scene's content) joins this drawer.
  hostSmall(g, 92, 'pointR', 33, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// ── lockup — the seven-year marriage bar ─────────────────────────────────────
export function lockupScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'gold');
  title(g, (s.title as string) || 'The seven-year lock');
  const mode = (s.mode as string) || 'intro';
  const ap = clamp01(t / 500);
  const bx = 190, bw = W - 620, by = H * 0.36, bh = 120;
  ctx.save();
  ctx.globalAlpha = ap;
  // the 7-year track with year ticks
  ctx.fillStyle = PALETTE.track;
  roundRect(ctx, bx, by, bw, bh, 24);
  ctx.fill();
  // the gold fill creeping to year 7
  const fp = clamp01((t - 400) / 1800);
  ctx.fillStyle = rgba(PALETTE.gold, 0.75);
  roundRect(ctx, bx, by, bw * fp, bh, 24);
  ctx.fill();
  for (let yr = 1; yr <= 7; yr++) {
    const x = bx + (bw * yr) / 7;
    ctx.strokeStyle = rgba(PALETTE.shadow, 0.35);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, by + 12);
    ctx.lineTo(x, by + bh - 12);
    ctx.stroke();
    setFont(ctx, 30, 600);
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.textAlign = 'center';
    ctx.fillText(`YR ${yr}`, x, by + bh + 44);
  }
  // the seal at year 7
  const sp = clamp01((t - 1900) / 600);
  if (sp > 0) {
    ctx.save();
    ctx.globalAlpha = sp;
    drawK(ctx, bx + bw - 60, by + bh / 2, 34, 3.5, PALETTE.gold);
    ctx.restore();
  }
  ctx.restore();
  // E1/E4 MARKET-STANDARD FIX (review report E1 [P0] — "lockup is ONE gold
  // bar in a cream field"): two structured masses join the track —
  //  1. THE CLIFF STEPS: under the year ticks, seven mini-cards state the
  //     vesting truth the bar only implies (0% liquid for six years, 100%
  //     at the seventh) — the cliff the VO narrates, now drawn as data.
  //  2. THE CATCH CARD (right column): the early-exit clause + the
  //     benchmark ghost (sell-anytime route), so the right third carries
  //     information. The 'marriage' line moves INTO the card — it was a
  //     bare sentence floating in the empty bottom half.
  const stepY = by + bh + 66;
  const stepW = (bw - 6 * 12) / 7;
  for (let yr2 = 1; yr2 <= 7; yr2++) {
    const sp2 = clamp01((t - 800 - yr2 * 90) / 400);
    if (sp2 <= 0) continue;
    ctx.save();
    ctx.globalAlpha = sp2;
    const sx2 = bx + (yr2 - 1) * (stepW + 12);
    const vested = yr2 === 7;
    ctx.fillStyle = vested ? rgba(PALETTE.gold, 0.85) : rgba(PALETTE.card, 0.9);
    roundRect(ctx, sx2, stepY, stepW, 108, 14);
    ctx.fill();
    if (vested) {
      ctx.strokeStyle = rgba(PALETTE.goldDeep, 0.7);
      ctx.lineWidth = 2.5;
      roundRect(ctx, sx2, stepY, stepW, 108, 14);
      ctx.stroke();
    }
    registerRect('lockup:step' + yr2, sx2, stepY, stepW, 108);
    setFont(ctx, 25, 700, FONT_DISPLAY);
    ctx.fillStyle = vested ? PALETTE.white : PALETTE.inkSoft;
    ctx.textAlign = 'center';
    ctx.fillText(vested ? '100%' : '0%', sx2 + stepW / 2, stepY + 46);
    setFont(ctx, 24, 600);
    ctx.fillStyle = vested ? rgba(PALETTE.white, 0.9) : PALETTE.inkSoft;
    ctx.fillText(vested ? 'VESTED' : 'LIQUID', sx2 + stepW / 2, stepY + 78);
    ctx.restore();
  }
  const catchHead = mode === 'marriage' ? 'NOT A PARKING SPOT —' : 'THE CATCH';
  const catchRows = mode === 'marriage'
    ? [{ label: 'seven years, or the deal unwinds', value: '7 YRS', tone: 'gold' as const }]
    : [{ label: 'leave early → stock comes back', value: '+1–2%', tone: 'down' as const },
       { label: 'exit fees on the way out', value: '2 LAYERS', tone: 'down' as const }];
  ledgerCard(ctx, W - 470 - 80, H * 0.235, 470, 128 + catchRows.length * 58 + (mode === 'marriage' ? 40 : 20),
    catchHead, catchRows, t, 700,
    mode === 'marriage' ? 'A marriage. With a pre-nup you cannot sign.' : 'benchmark ghost: the sell-anytime route pays all of these');
  if (mode === 'early') {
    const ep = clamp01((t - 700) / 600);
    if (ep > 0) {
      ctx.save();
      ctx.globalAlpha = ep;
      chip(ctx, 'LEAVE EARLY → your stock comes back + 1\u20132% exit fees', bx + 40, by - 70, { size: 32, bg: rgba(PALETTE.down, 0.14), fg: PALETTE.down, border: rgba(PALETTE.down, 0.5) });
      ctx.restore();
    }
  }

  // E3 MARKET-STANDARD FIX (review report E3 [P1] — THE MASCOT IS ABSENT
  // FROM THE BEATS THAT CARRY THE FACTS): the exit chapters were
  // figureless — a stick-man channel's retention contract is that the
  // character carries the argument, and here he was a recurring guest.
  // The certified side-host register (the B2 staging: the free left band,
  // gesture cycle aimed INTO the scene's content) joins this drawer.
  hostSmall(g, 92, 'pointR', 33, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// ── planConveyor — the 10b5-1 conveyor belt ──────────────────────────────────
export function planConveyorScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'up');
  title(g, (s.title as string) || 'The 10b5-1 plan');
  srcChip(g);
  const mode = (s.mode as string) || 'intro';

  // the conveyor: 4 scheduled sale slots riding a belt
  const beltY = H * 0.44;
  const beltX = 190, beltW = W - 900;
  const bp = clamp01(t / 700);
  ctx.save();
  ctx.globalAlpha = bp;
  // the belt
  ctx.fillStyle = PALETTE.track;
  roundRect(ctx, beltX, beltY, beltW, 96, 24);
  ctx.fill();
  ctx.strokeStyle = rgba(PALETTE.gold, 0.5);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(beltX, beltY - 8);
  ctx.lineTo(beltX + beltW, beltY - 8);
  ctx.stroke();
  // the slots — scheduled sales drift along
  const drift = (t / 2400) % 1;
  for (let i = 0; i < 4; i++) {
    const slotP = ((i + drift) / 4) % 1;
    const x = beltX + slotP * beltW;
    const ap = clamp01((t - 400 - i * 180) / 400) * clamp01(slotP * 8) * clamp01((1 - slotP) * 8);
    if (ap <= 0) continue;
    ctx.save();
    ctx.globalAlpha = ap;
    card(ctx, x - 70, beltY + 10, 140, 76, { r: 16 });
    setFont(ctx, 30, 700);
    ctx.fillStyle = PALETTE.up;
    ctx.textAlign = 'center';
    ctx.fillText('SELL', x, beltY + 44);
    setFont(ctx, 22, 400);
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.fillText('scheduled', x, beltY + 72);
    ctx.restore();
  }
  ctx.restore();

  const chipY = beltY + 160;
  const chipLine = (label: string, x: number, tone: string) => {
    const cp = clamp01((t - 500) / 500);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha = cp;
      chip(ctx, label, x, chipY, { size: 30, bg: tone === 'up' ? rgba(PALETTE.up, 0.13) : PALETTE.white, fg: tone === 'up' ? PALETTE.up : PALETTE.inkSoft, border: tone === 'up' ? rgba(PALETTE.up, 0.45) : PALETTE.cardBorder });
      ctx.restore();
    }
  };

  if (mode === 'no-discretion') chipLine('DISCRETION REMOVED — that is the point', 190, 'up');
  if (mode === 'full-tax') {
    const fp = clamp01((t - 300) / 500);
    if (fp > 0) {
      ctx.save();
      ctx.globalAlpha = fp;
      chip(ctx, 'FULL CAPITAL GAINS ON EVERY SHARE — not a tax strategy', 190, chipY, { size: 32, bg: rgba(PALETTE.down, 0.14), fg: PALETTE.down, border: rgba(PALETTE.down, 0.5) });
      ctx.restore();
    }
  }
  if (mode === 'bezos' || mode === 'plan-timed' || mode === 'commit') {
    const dp = clamp01((t - 300) / 600);
    if (dp > 0) {
      ctx.save();
      ctx.globalAlpha = dp;
      gildedCard(ctx, W * 0.60, H * 0.26, 520, 240, rgba(PALETTE.gold, 0.3));
      goldNumeral(ctx, '$4B', W * 0.60 + 60, H * 0.26 + 100, 104);
      setFont(ctx, 32, 600);
      ctx.fillStyle = PALETTE.inkSoft;
      ctx.textAlign = 'left';
      ctx.fillText('sold August 2026 —', W * 0.60 + 60, H * 0.26 + 160);
      ctx.fillText('plan adopted Nov 14, 2025', W * 0.60 + 60, H * 0.26 + 204);
      ctx.restore();
    }
  }
  if (mode === 'plan-timed') chipLine('HE DID NOT TIME IT. THE PLAN TIMED IT.', 190, 'up');
  if (mode === 'commit') chipLine('COMMIT IN ADVANCE — LET THE SCHEDULE EXECUTE', 190, 'up');
  if (mode === 'sec-tighten' || mode === 'cooling' || mode === 'certify' || mode === 'screened' || mode === 'architecture') {
    // the amendment rail
    const rp = clamp01((t - 300) / 600);
    if (rp > 0) {
      ctx.save();
      ctx.globalAlpha = rp;
      const items = mode === 'cooling' ? ['90\u2013120 day cooling-off', 'no overlapping plans']
        : mode === 'certify' ? ['written good-faith certification', '10-Q/10-K disclosure · Form 4 box']
        : mode === 'screened' ? ['data-driven regulator screens', 'the autopilot is public']
        : mode === 'architecture' ? ['the amendments all stood', 'the pardon changed nothing']
        : ['DEC 2022 — THE SEC AMENDMENTS'];
      let x = 190;
      for (const it of items) {
        chip(ctx, it.toUpperCase(), x, H * 0.68, { size: 30, bg: PALETTE.white, fg: PALETTE.inkSoft, border: rgba(PALETTE.down, 0.4) });
        x += 620;
      }
      ctx.restore();
    }
  }
  if (mode === 'conveyor-punch') {
    const pp = clamp01((t - 300) / 600);
    if (pp > 0) {
      ctx.save();
      ctx.globalAlpha = pp;
      setFont(ctx, 62, 700, FONT_DISPLAY);
      ctx.fillStyle = PALETTE.ink;
      ctx.textAlign = 'left';
      ctx.fillText('The conveyor belt.', 190, H * 0.66);
      setFont(ctx, 38, 600);
      ctx.fillStyle = PALETTE.inkSoft;
      ctx.fillText('The next five strategies are what you do with the warehouse.', 190, H * 0.66 + 64);
      ctx.restore();
    }
  }
  // E3 MARKET-STANDARD FIX (review report E3 [P1] — THE MASCOT IS ABSENT
  // FROM THE BEATS THAT CARRY THE FACTS): the certified side-host register
  // (the B2 staging: the free left band, gesture cycle aimed INTO the
  // scene's content) joins this exit-chapter drawer.
  hostSmall(g, 92, 'pointR', 33, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// ── killCard — the wrong-answer card, in the film's dark emerald glass ───────
// The one deliberately dark register in the film (a deep emerald panel, not
// black): the kill conditions land with weight.
export function killCardScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  paintBg(ctx, W, H, t, g.chapterTone);
  const mode = (s.mode as string) || 'item-1';
  const title = (s.title as string) || 'The kill conditions';
  const ap = clamp01(t / 450);
  const items = [
    'WRONG ANSWER IF — you think it shelters the tax',
    'WRONG ANSWER IF — you need money back early / the principal',
    'WRONG ANSWER IF — the fee or the leverage eats the benefit',
    'WRONG ANSWER IF — you cannot live with the schedule',
  ];
  const n = mode === 'item-1' ? 2 : items.length;
  // C6 MARKET-STANDARD FIX (review report C6 [P1] — THE HALF-EMPTY SLAB):
  // the card's height is CONTENT-DRIVEN — head zone + the item stack that
  // will actually play + tail pad — instead of a fixed 60% slab the
  // item-1 beat filled to barely a third ("the render stopped early").
  const cardH = 336 + (n - 1) * 86;
  // the obsidian-emerald panel — the film's one dramatic register
  ctx.save();
  ctx.globalAlpha = ap;
  ctx.fillStyle = '#0E1F19';
  roundRect(ctx, 150, 190, W - 300, cardH, 34);
  ctx.fill();
  // D4 MARKET-STANDARD FIX (review report D4 [P2] — ONE DARK DRAMATIC
  // REGISTER, DEPLOYED WITH NO DRAMA): the emerald slab gains its inner
  // lighting — a radial deepen toward the lower edges so the panel reads
  // as a lit stage, not a flat rectangle; the gold rule and the red
  // stakes sit ON the light.
  {
    const vg = ctx.createRadialGradient(W / 2, 190 + cardH * 0.32, cardH * 0.18, W / 2, 190 + cardH * 0.42, cardH * 0.95);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(3,10,8,0.55)');
    ctx.fillStyle = vg;
    roundRect(ctx, 150, 190, W - 300, cardH, 34);
    ctx.fill();
  }
  ctx.strokeStyle = rgba(PALETTE.gold, 0.65);
  ctx.lineWidth = 2.5;
  roundRect(ctx, 150, 190, W - 300, cardH, 34);
  ctx.stroke();
  // the seal
  drawK(ctx, 260, 320, 40, 4, PALETTE.gold);
  setFont(ctx, 54, 700, FONT_DISPLAY);
  ctx.fillStyle = '#F1E7CF';
  ctx.textAlign = 'left';
  ctx.fillText(title.toUpperCase(), 340, 338);
  // the hairline
  ctx.strokeStyle = rgba(PALETTE.gold, 0.4);
  ctx.beginPath();
  ctx.moveTo(340, 380);
  ctx.lineTo(W - 340, 380);
  ctx.stroke();
  for (let i = 0; i < n; i++) {
    const ip = clamp01((t - 550 - i * 380) / 500);
    if (ip <= 0) continue;
    ctx.save();
    ctx.globalAlpha = ip;
    // C6: the WRONG ANSWER stakes carry the film's red — a red item
    // keyline plus the red "WRONG ANSWER IF —" prefix; the stakes text
    // itself stays cream. On the dark emerald the prefix prints in the
    // lightened down tone (the base #8E2F3C has no contrast on #0E1F19).
    ctx.strokeStyle = '#D26A77';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(302, 470 + i * 86 - 30);
    ctx.lineTo(302, 470 + i * 86 + 12);
    ctx.stroke();
    setFont(ctx, 42, 700);
    ctx.fillStyle = '#D26A77';
    ctx.fillText('WRONG ANSWER IF —', 340, 470 + i * 86);
    setFont(ctx, 42, 600);
    ctx.fillStyle = i % 2 === 0 ? '#E8D9B0' : 'rgba(241,231,207,0.75)';
    ctx.fillText(items[i].slice(17), 340 + ctx.measureText('WRONG ANSWER IF — ').width, 470 + i * 86);
    // the gold tick
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(300, 458 + i * 86);
    ctx.lineTo(322, 470 + i * 86);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // E3 REGISTER NOTE (review report E3): the kill card is the ONE frame
  // family that deliberately runs figureless — its dramatic register is
  // the emerald slab and the red stakes; the mascot would break it.
}

// ── poolFund — the exchange fund pool ────────────────────────────────────────
export function poolFundScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'up');
  title(g, (s.title as string) || 'The exchange fund');
  srcChip(g);
  const mode = (s.mode as string) || 'contribute';
  // C7 MARKET-STANDARD FIX (review report C7 [P1] — THE DIAGRAM FLOATS
  // TINY): the pool radius scales to the beat it exists to sell — 190 →
  // 245 (+29% linear, the diagram now owns the left two-thirds) and the
  // center shifts left to open the right column for the trade ledger.
  const poolX = W * 0.385, poolY = H * 0.52, poolR = 245;
  const ap = clamp01(t / 500);

  // the pool — a gilded ring
  ctx.save();
  ctx.globalAlpha = ap;
  ctx.strokeStyle = rgba(PALETTE.gold, 0.7);
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(poolX, poolY, poolR * clamp01(t / 900), 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = rgba(PALETTE.goldWash, 0.5);
  ctx.beginPath();
  ctx.arc(poolX, poolY, poolR * clamp01(t / 900), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // the pool's ingot heart
  const iP = clamp01((t - 600) / 600);
  if (iP > 0) drawK(ctx, poolX, poolY, 56, 5, PALETTE.gold, iP);

  // the contributors — C7 MARKET-STANDARD FIX (review report C7 [P1] —
  // THE DIAGRAM CONTRADICTS ITS OWN CAPTION): the caption sells "one pool,
  // one hundred single stocks" and the diagram drew TEN dots ("your stock"
  // read as one of eleven — a finance-literate audience reads count
  // mismatches instantly). The pool now carries ONE HUNDRED stock dots in
  // a golden-angle spiral packing (the inner hole keeps the ingot heart
  // readable), staggered arrival; 'your stock' — the teal dot with the
  // gold owner's ring — reads as one OF THE HUNDRED.
  const contribP = clamp01((t - 300) / 1600);
  const N = 100;
  const GA = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const rr = 95 + (poolR * 0.82 - 95) * Math.sqrt((i + 0.5) / N);
    const ang = i * GA + 0.35;
    const ox = poolX + Math.cos(ang) * 640;
    const oy = poolY + Math.sin(ang) * 360;
    const p = easeInOutCubic(contribP);
    const x = lerp(ox, poolX + Math.cos(ang) * rr, p);
    const y = lerp(oy, poolY + Math.sin(ang) * rr, p);
    const dP = clamp01((t - 300 - (i % 25) * 48) / 500);
    if (dP <= 0) continue;
    ctx.save();
    ctx.globalAlpha = dP;
    ctx.fillStyle = i === 0 ? PALETTE.up : PALETTE.inkSoft;
    ctx.beginPath();
    ctx.arc(x, y, i === 0 ? 15 : 11, 0, Math.PI * 2);
    ctx.fill();
    if (i === 0) {
      // your stock — the one position the viewer actually owns, ringed
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 21, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  // the out-slices
  if (mode === 'redeem' || mode === 'step-up' || mode === 'illiquid' || mode === 'not-chosen') {
    const op = clamp01((t - 400) / 1200);
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2 + 0.35;
      const p = easeInOutCubic(op);
      const x = lerp(poolX + Math.cos(ang) * poolR * 0.5, poolX + Math.cos(ang) * 520, p);
      const y = lerp(poolY + Math.sin(ang) * poolR * 0.5, poolY + Math.sin(ang) * 300, p);
      ctx.save();
      ctx.globalAlpha = op * 0.9;
      ctx.fillStyle = PALETTE.up;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  // C7/C8: the trade ledger owns the right column — the beat's facts
  // (the count, the give-up, the basis) on the ledger card the data rooms
  // share; the right field stops being empty canvas.
  ledgerCard(ctx, W - 470 - 80, H * 0.235, 470, 96 + 3 * 58 + 74, 'THE TRADE — AT A GLANCE', [
    { label: 'your position', value: '1 of 100', tone: 'gold' },
    { label: 'the give-up', value: '20% illiquid', tone: 'down' },
    { label: 'your basis', value: 'carried over', tone: 'muted' },
  ], t, 600, 'a contribution is not a sale — §721');
  const label = (txt: string, y: number, tone: 'gold' | 'ink' | 'down' = 'ink', delay = 400) => {
    const lp = clamp01((t - delay) / 500);
    if (lp > 0) {
      ctx.save();
      ctx.globalAlpha = lp;
      setFont(ctx, 40, 600);
      ctx.fillStyle = tone === 'gold' ? PALETTE.goldDeep : tone === 'down' ? PALETTE.down : PALETTE.ink;
      ctx.textAlign = 'center';
      ctx.fillText(txt, poolX, y);
      ctx.restore();
    }
  };
  if (mode === 's721') label('§721 — A CONTRIBUTION IS NOT A SALE', poolY - poolR - 60, 'gold');
  if (mode === 'swapped') label('SINGLE-STOCK RISK → BROAD-MARKET RISK, ONE TRANSACTION', poolY - poolR - 60, 'ink', 300);
  if (mode === 'redeem') label('REDEEM → A DIVERSIFIED BASKET, YOUR ORIGINAL LOW BASIS', poolY - poolR - 60, 'ink');
  if (mode === 'step-up') label('HOLD TO DEATH → STEPPED-UP BASIS — THE GAIN VANISHES', poolY - poolR - 60, 'gold');
  if (mode === 'illiquid' || mode === 'not-chosen') {
    label('20% OF THE POOL IS ILLIQUID — BY RULE', poolY - poolR - 60, 'down');
    const ip = clamp01((t - 700) / 600);
    if (ip > 0) {
      ctx.save();
      ctx.globalAlpha = ip;
      ctx.fillStyle = rgba(PALETTE.down, 0.22);
      ctx.beginPath();
      ctx.moveTo(poolX, poolY);
      ctx.arc(poolX, poolY, poolR * 0.86, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    if (mode === 'not-chosen') label('assets you did not choose, to satisfy a tax definition', poolY + poolR + 80, 'down', 900);
  }
  if (mode === 'contribute') label('100 investors · 100 single stocks · one pool', poolY - poolR - 60, 'ink');

  // E3 MARKET-STANDARD FIX (review report E3 [P1] — THE MASCOT IS ABSENT
  // FROM THE BEATS THAT CARRY THE FACTS): the exit chapters were
  // figureless — a stick-man channel's retention contract is that the
  // character carries the argument, and here he was a recurring guest.
  // The certified side-host register (the B2 staging: the free left band,
  // gesture cycle aimed INTO the scene's content) joins this drawer.
  hostSmall(g, 92, 'pointR', 33, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// ── driftChart — tracking error drift ────────────────────────────────────────
export function driftChartScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'down');
  title(g, (s.title as string) || 'Tracking error');
  srcChip(g);
  const mode = (s.mode as string) || 'drift';
  const ptsIdx: [number, number][] = [[0, 100], [0.3, 101.2], [0.6, 102.1], [1, 103.4]];
  const ptsFund: [number, number][] = [[0, 100], [0.3, 99.1], [0.6, 97.8], [1, 96.1]];
  lineChart(ctx, {
    x: 190, y: 300, w: W - 700, h: H * 0.42,
    series: [
      { name: 'the index', tone: 'muted', points: ptsIdx },
      { name: 'the basket — cannot sell', tone: 'down', points: partialPoints(ptsFund, clamp01(t / 2200)) },
    ],
    p: 1, t, gridLines: 4, showYAxis: true, lineWidth: 6,
    // U24: the drift chart's own delta badge — the gap, on the plot.
    endpointLabel: '96.1',
    deltaBadge: { value: '−7.3 PTS', tone: 'down' },
  });
  // E2 MARKET-STANDARD FIX (review report E2 [P1] — "driftChart is two
  // thin lines"): THE GAP LEDGER (right column) — endpoint value labels
  // for both series, the delta badge, and the compounding benchmark note;
  // the premium-chart annotation vocabulary, on the beat's own clocks.
  const lw3 = 400, lx3 = W - lw3 - 80, ly3 = H * 0.235;
  ledgerCard(ctx, lx3, ly3, lw3, 96 + 3 * 58 + 74, 'THE GAP — AT YEAR 7', [
    { label: 'the index — endpoint', value: '103.4', tone: 'muted' },
    { label: 'the basket — endpoint', value: '96.1', tone: 'down' },
    { label: 'tracking error', value: '−7.3 PTS', tone: 'gold' },
  ], t, 500, '1.6% a year — and it compounds for seven years');
  // endpoint value labels ride the chart's right edge (the E2 vocabulary:
  // "value labels at the endpoint")
  const ep3 = clamp01((t - 2100) / 500);
  if (ep3 > 0) {
    ctx.save();
    ctx.globalAlpha = ep3;
    setFont(ctx, 26, 700, FONT_DISPLAY);
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.fillText('103.4', 190 + (W - 700) + 14, 300 + H * 0.42 * (1 - (103.4 - 95) / (104 - 95)));
    ctx.fillStyle = PALETTE.down;
    ctx.fillText('96.1', 190 + (W - 700) + 14, 300 + H * 0.42 * (1 - (96.1 - 95) / (104 - 95)));
    ctx.restore();
  }
  if (mode === 'compounds' || mode === 'punch') {
    const dp = clamp01((t - 500) / 600);
    if (dp > 0) {
      ctx.save();
      ctx.globalAlpha = dp;
      chip(ctx, '1.6% TRACKING ERROR — AND IT COMPOUNDS FOR SEVEN YEARS', 190, H * 0.79, { size: 32, bg: rgba(PALETTE.down, 0.13), fg: PALETTE.down, border: rgba(PALETTE.down, 0.5) });
      ctx.restore();
    }
  }
  if (mode === 'punch') {
    const pp = clamp01((t - 300) / 600);
    if (pp > 0) {
      ctx.save();
      ctx.globalAlpha = pp;
      setFont(ctx, 54, 700, FONT_DISPLAY);
      ctx.fillStyle = PALETTE.ink;
      ctx.textAlign = 'left';
      ctx.fillText('Not quite the index. Not customizable. Cannot be left.', 190, H * 0.87);
      ctx.restore();
    }
  }

  // E3 MARKET-STANDARD FIX (review report E3 [P1] — THE MASCOT IS ABSENT
  // FROM THE BEATS THAT CARRY THE FACTS): the exit chapters were
  // figureless — a stick-man channel's retention contract is that the
  // character carries the argument, and here he was a recurring guest.
  // The certified side-host register (the B2 staging: the free left band,
  // gesture cycle aimed INTO the scene's content) joins this drawer.
  hostSmall(g, 92, 'pointR', 33, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// ── explodeGrid — direct indexing ────────────────────────────────────────────
export function explodeGridScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'up');
  title(g, (s.title as string) || 'Direct indexing');
  srcChip(g);
  const mode = (s.mode as string) || 'intro';
  const gx = 190, gy = H * 0.28, gw = W - 700, gh = H * 0.46;
  const cols = 20, rows = 10;
  const cwTile = gw / cols, chTile = gh / rows;
  // one fund tile that explodes into the grid
  const ex = clamp01((t - 300) / 700);
  if (ex < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - ex;
    gildedCard(ctx, gx + gw / 2 - 130, gy + gh / 2 - 80, 260, 160, rgba(PALETTE.gold, 0.3));
    setFont(ctx, 40, 700);
    ctx.fillStyle = PALETTE.ink;
    ctx.textAlign = 'center';
    ctx.fillText('1 ETF', gx + gw / 2, gy + gh / 2 + 4);
    ctx.restore();
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const tp = clamp01((t - 350 - (i % 30) * 22) / 400);
      if (tp <= 0) continue;
      const h = hashStr(`tile-${i}`);
      const loser = h < 0.38;
      const harvested = (mode === 'harvest' || mode === 'offset' || mode === 'wash' || mode === 'alpha') && loser && h < 0.38;
      const x = gx + c * cwTile + 3, y = gy + r * chTile + 3;
      ctx.save();
      ctx.globalAlpha = tp;
      if (harvested && mode !== 'wash') {
        ctx.fillStyle = rgba(PALETTE.down, 0.78);
      } else if (loser) {
        ctx.fillStyle = rgba(PALETTE.down, 0.4);
      } else {
        ctx.fillStyle = rgba(PALETTE.up, 0.34);
      }
      roundRect(ctx, x, y, cwTile - 6, chTile - 6, 8);
      ctx.fill();
      if (harvested && (mode === 'harvest' || mode === 'offset' || mode === 'alpha')) {
        // the harvest tick
        ctx.strokeStyle = PALETTE.white;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + chTile / 2);
        ctx.lineTo(x + cwTile / 2 - 4, y + chTile - 10);
        ctx.lineTo(x + cwTile - 10, y + 8);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  const chipLine = (txt: string, tone: 'down' | 'up', delay = 500) => {
    const cp = clamp01((t - delay) / 500);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha = cp;
      chip(ctx, txt, 190, H * 0.79, { size: 32, bg: tone === 'down' ? rgba(PALETTE.down, 0.13) : rgba(PALETTE.up, 0.13), fg: tone === 'down' ? PALETTE.down : PALETTE.up, border: rgba(tone === 'down' ? PALETTE.down : PALETTE.up, 0.5) });
      ctx.restore();
    }
  };
  if (mode === 'losers') chipLine('EVEN IN AN UP YEAR — SOME CONSTITUENTS ARE DOWN', 'down');
  if (mode === 'harvest') chipLine('SELL THE LOSERS · BOOK THE LOSS · STAY INVESTED', 'up');
  if (mode === 'offset') chipLine('THE LOSSES OFFSET THE GAINS FROM SELLING YOUR POSITION', 'up');
  if (mode === 'wash') chipLine('31 DAYS — OR THE LOSS IS DISALLOWED', 'down');
  if (mode === 'alpha') chipLine('HUNDREDS OF NAMES · YEAR-ROUND · "TAX ALPHA"', 'up');
  // E3 MARKET-STANDARD FIX (review report E3 [P1] — THE MASCOT IS ABSENT
  // FROM THE BEATS THAT CARRY THE FACTS): the certified side-host register
  // (the B2 staging: the free left band, gesture cycle aimed INTO the
  // scene's content) joins this exit-chapter drawer.
  hostSmall(g, 92, 'pointR', 33, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// ── payoffDiagram — the Cuban collar ─────────────────────────────────────────
export function payoffDiagramScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'gold');
  title(g, (s.title as string) || 'The collar');
  srcChip(g);
  const mode = (s.mode as string) || 'floor';
  const cx = 190, cy = 300, cw = W - 700, ch = H * 0.44;
  // the band — floor at 85, ceiling at 205 on a 0..260 range
  const yOf = (v: number) => cy + ch - (v / 260) * ch;
  const bandP = mode === 'floor' ? clamp01((t - 400) / 800) : clamp01(t / 600);
  if (bandP > 0) {
    ctx.save();
    ctx.globalAlpha = bandP * 0.18;
    ctx.fillStyle = PALETTE.up;
    ctx.fillRect(cx, yOf(85), cw, yOf(0) - yOf(85));
    ctx.restore();
  }
  if ((mode === 'ceiling' || mode === 'path' || mode === 'cost')) {
    const cp = clamp01((t - 500) / 800);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha = cp * 0.15;
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(cx, yOf(260), cw, yOf(205) - yOf(260));
      ctx.restore();
    }
  }
  const draw = (mode === 'path' || mode === 'cost') ? 1 : clamp01(t / 1600);
  const FLOOR: [number, number][] = [[0, 85], [1, 85]];
  const CEIL: [number, number][] = [[0, 205], [1, 205]];
  const PATH: [number, number][] = [[0, 95], [0.3, 160], [0.55, 232], [0.75, 180], [1, 26]];
  const series: SeriesSpec[] = [];
  if (mode === 'path' || mode === 'cost') {
    series.push({ name: 'Yahoo', tone: 'down', points: partialPoints(PATH, clamp01(t / 2600)) });
  }
  series.push({ name: 'floor $85', tone: 'up', points: partialPoints(FLOOR, draw) });
  if (mode === 'ceiling' || mode === 'path' || mode === 'cost') series.push({ name: 'ceiling $205', tone: 'gold', points: partialPoints(CEIL, draw) });
  lineChart(ctx, { x: cx, y: cy, w: cw, h: ch, series, p: 1, t, gridLines: 4, showYAxis: true, lineWidth: 6 });
  const markChip = (txt: string, x: number, y: number, tone: string, delay: number) => {
    const cp = clamp01((t - delay) / 500);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha = cp;
      const main = tone === 'up' ? PALETTE.up : tone === 'gold' ? PALETTE.goldDeep : PALETTE.down;
      chip(ctx, txt, x, y, { size: 30, bg: rgba(main, 0.13), fg: main, border: rgba(main, 0.5) });
      ctx.restore();
    }
  };
  if (mode === 'floor') markChip('THE FLOOR — SELL AT $85 NO MATTER WHAT', cx + 40, cy + 16, 'up', 400);
  if (mode === 'ceiling') markChip('THE CEILING — YOU MUST SELL AT $205', cx + cw * 0.55, cy - 40, 'gold', 400);
  if (mode === 'path') markChip('CAPPED ABOVE 205 · HELD AT 85', cx + 40, cy + 16, 'up', 500);
  if (mode === 'cost') {
    const vp = clamp01((t - 600) / 600);
    if (vp > 0) {
      ctx.save();
      ctx.globalAlpha = vp;
      setFont(ctx, 44, 700, FONT_DISPLAY);
      ctx.fillStyle = PALETTE.ink;
      ctx.textAlign = 'left';
      ctx.fillText('The cost: the upside you surrender.', cx, cy - 48);
      ctx.restore();
    }
  }

  // B2 MARKET-STANDARD FIX (review report B2 [P1] — NO PRESENTER IN THE
  // DATA CHAPTERS): the collar's payoff diagram gets its narrator — he
  // stands in the free right column (the chart spans x 190-1410), his
  // gesture cycle pointing back INTO the payoff bands.
  hostSmall(g, 1706, 'pointL', 34, g.H * 0.66, 1.35, 0, 'aha', 1.4, 1, true, 0.4);

  // E3 MARKET-STANDARD FIX (review report E3 [P1] — THE MASCOT IS ABSENT
  // FROM THE BEATS THAT CARRY THE FACTS): the exit chapters were
  // figureless — a stick-man channel's retention contract is that the
  // character carries the argument, and here he was a recurring guest.
  // The certified side-host register (the B2 staging: the free left band,
  // gesture cycle aimed INTO the scene's content) joins this drawer.
  hostSmall(g, 92, 'pointR', 33, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// ── taxMine — the collar tax minefield ───────────────────────────────────────
export function taxMineScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'down');
  title(g, (s.title as string) || 'The tax minefield');
  srcChip(g);
  const mode = (s.mode as string) || 's1259';
  const mineCard = (head: string, sub: string, delay: number, tone = 'down') => {
    const cp = clamp01((t - delay) / 550);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha = cp;
      gildedCard(ctx, 190, H * 0.30, W - 660, 190, rgba(PALETTE.down, 0.25));
      setFont(ctx, 50, 700, FONT_DISPLAY);
      ctx.fillStyle = PALETTE.ink;
      ctx.textAlign = 'left';
      ctx.fillText(head, 240, H * 0.30 + 84);
      setFont(ctx, 34, 400);
      ctx.fillStyle = PALETTE.inkSoft;
      ctx.fillText(sub, 240, H * 0.30 + 146);
      ctx.restore();
    }
  };
  if (mode === 's1259') mineCard('§1259 — CONSTRUCTIVE SALE', 'hedge away substantially all risk = treated as sold. Tax now, on the entire gain.', 300);
  if (mode === 'band') mineCard('NO OFFICIAL SAFE HARBOR', 'practitioners want a 15%+ band between floor and ceiling — a rule of thumb, not law. Facts-and-circumstances; audit risk.', 300);
  if (mode === 's1092' || mode === 'whipsaw') mineCard('§1092 — THE WHIPSAW', 'the call premium is taxable now; the put loss is deferred — you can owe tax and be barred from the matching deduction.', 300);
  if (mode === 'otc') mineCard('THE OTC WORKAROUND', 'one combined contract mitigates the whipsaw — and adds dealer counterparty risk that OCC-cleared listed options do not carry.', 300);
  // E1/E4 MARKET-STANDARD FIX (review report E1 [P0] — "taxMine at mid-beat
  // is one card in a pink field"): THE MINEFIELD MAP — the four hazards as
  // a full-width row of mini-cards under the active rule's card, the
  // active one gold-highlighted, the rest muted. The frame becomes a MAP
  // of the minefield instead of one floating card; the map row replaces
  // the floating 'whipsaw' chip (the highlight carries it).
  const hazards: Array<[string, string]> = [
    ['§1259', 'CONSTRUCTIVE SALE'],
    ['§1092', 'THE WHIPSAW'],
    ['NO SAFE', 'HARBOR'],
    ['OTC', 'COUNTERPARTY'],
  ];
  const activeIdx = mode === 's1259' ? 0 : mode === 'band' ? 2 : mode === 's1092' || mode === 'whipsaw' ? 1 : 3;
  const hzY = H * 0.545, hzH = 118, hzW = (W - 380 - 3 * 20) / 4;
  for (let i = 0; i < hazards.length; i++) {
    const hp2 = clamp01((t - 700 - i * 130) / 420);
    if (hp2 <= 0) continue;
    ctx.save();
    ctx.globalAlpha = hp2;
    const hx2 = 190 + i * (hzW + 20);
    const active = i === activeIdx;
    ctx.fillStyle = active ? rgba(PALETTE.down, 0.22) : rgba(PALETTE.card, 0.85);
    roundRect(ctx, hx2, hzY, hzW, hzH, 16);
    ctx.fill();
    if (active) {
      ctx.strokeStyle = rgba(PALETTE.gold, 0.85);
      ctx.lineWidth = 3;
      roundRect(ctx, hx2, hzY, hzW, hzH, 16);
      ctx.stroke();
    }
    registerRect('taxMine:hz' + i, hx2, hzY, hzW, hzH);
    setFont(ctx, 30, 700, FONT_DISPLAY);
    ctx.fillStyle = active ? PALETTE.ink : PALETTE.inkSoft;
    ctx.textAlign = 'left';
    ctx.fillText(hazards[i][0], hx2 + 26, hzY + 48);
    setFont(ctx, 24, 600);
    ctx.fillStyle = active ? PALETTE.down : PALETTE.inkSoft;
    ctx.fillText(hazards[i][1], hx2 + 26, hzY + 86);
    // the mine glyph — a small oxblood diamond on every card
    ctx.fillStyle = active ? PALETTE.down : rgba(PALETTE.down, 0.4);
    ctx.beginPath();
    ctx.moveTo(hx2 + hzW - 40, hzY + 30);
    ctx.lineTo(hx2 + hzW - 24, hzY + 52);
    ctx.lineTo(hx2 + hzW - 40, hzY + 74);
    ctx.lineTo(hx2 + hzW - 56, hzY + 52);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // E3 MARKET-STANDARD FIX (review report E3 [P1] — THE MASCOT IS ABSENT
  // FROM THE BEATS THAT CARRY THE FACTS): the exit chapters were
  // figureless — a stick-man channel's retention contract is that the
  // character carries the argument, and here he was a recurring guest.
  // The certified side-host register (the B2 staging: the free left band,
  // gesture cycle aimed INTO the scene's content) joins this drawer.
  hostSmall(g, 92, 'pointR', 33, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// ── flowCharity — DAF / CRT flow ─────────────────────────────────────────────
export function flowCharityScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'gold');
  title(g, (s.title as string) || 'Charitable vehicles');
  srcChip(g);
  const mode = (s.mode as string) || 'daf-intro';
  const ap = clamp01(t / 500);
  const isCrt = mode.startsWith('crt') || mode === 's7520' || mode === 'ordering' || mode === 'remainder' || mode === 'gain-gone';
  // three nodes: STOCK → VEHICLE → DIVERSIFIED (+ income / remainder)
  const nx = 220, ny = H * 0.42;
  const vx = W * 0.42, vy = H * 0.42;
  const ox = W * 0.72, oy = H * 0.42;
  const nodeP = clamp01((t - 200) / 500);
  const node = (x: number, y: number, label: string, gold = false, delay = 0) => {
    const np = clamp01((t - 200 - delay) / 500);
    if (np <= 0) return;
    ctx.save();
    ctx.globalAlpha = np;
    gildedCard(ctx, x - 130, y - 74, 260, 148, gold ? rgba(PALETTE.gold, 0.35) : undefined);
    setFont(ctx, 34, 700);
    ctx.fillStyle = PALETTE.ink;
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + 6);
    ctx.restore();
  };
  node(nx, ny, 'APPRECIATED', false, 0);
  node(nx, ny + 46, 'STOCK', false, 0);
  node(vx, vy, isCrt ? 'CRT' : 'DAF', true, 260);
  node(ox, oy, 'DIVERSIFIED', false, 520);
  node(ox, oy + 46, 'PORTFOLIO', false, 520);
  // the flow arrows
  const flow = (x0: number, y0: number, x1: number, y1: number, delay: number, label?: string, gold = false) => {
    const fp = clamp01((t - delay) / 600);
    if (fp <= 0) return;
    ctx.save();
    ctx.globalAlpha = fp;
    ctx.strokeStyle = gold ? PALETTE.gold : PALETTE.up;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + (x1 - x0) * fp, y0 + (y1 - y0) * fp);
    ctx.stroke();
    if (label && fp >= 1) {
      setFont(ctx, 28, 600);
      ctx.fillStyle = gold ? PALETTE.goldDeep : PALETTE.up;
      ctx.textAlign = 'center';
      ctx.fillText(label, (x0 + x1) / 2, y0 - 22);
    }
    ctx.restore();
  };
  flow(nx + 140, ny, vx - 140, vy, 700, 'no tax on the sale', true);
  flow(vx + 140, vy, ox - 140, oy, 1000);
  if (isCrt) {
    flow(vx, vy + 100, vx, H * 0.72, 1200, 'income stream to you — for life or a term', true);
    const rp = clamp01((t - 1500) / 600);
    if (rp > 0) {
      ctx.save();
      ctx.globalAlpha = rp;
      setFont(ctx, 36, 700);
      ctx.fillStyle = PALETTE.down;
      ctx.textAlign = 'center';
      ctx.fillText('remainder → charity. Permanently.', vx, H * 0.80);
      ctx.restore();
    }
  }
  const note = (txt: string, y: number, tone: 'gold' | 'down' = 'gold', delay = 1400) => {
    const np = clamp01((t - delay) / 500);
    if (np > 0) {
      ctx.save();
      ctx.globalAlpha = np;
      setFont(ctx, 36, 600);
      ctx.fillStyle = tone === 'gold' ? PALETTE.goldDeep : PALETTE.down;
      ctx.textAlign = 'left';
      ctx.fillText(txt, 220, y);
      ctx.restore();
    }
  };
  if (mode === 'gain-gone') note('THE GAIN IS NOT DEFERRED. IT IS GONE.', H * 0.72, 'gold', 400);
  if (mode === 'daf-note') note('NO INCOME STREAM BACK — A CHARITABLE CHECKING ACCOUNT WITH A TAX ENGINE', H * 0.68, 'gold', 300);
  if (mode === 's7520') note('§7520 RATE ≈ 6% (NOV 2026) — HIGHER RATE, BIGGER DEDUCTION', H * 0.72, 'gold', 300);
  if (mode === 'ordering') note('TAXED IN ORDER: ORDINARY → GAINS → TAX-FREE → PRINCIPAL', H * 0.72, 'gold', 300);
  if (mode === 'remainder') note('WHAT "WINS" MEANS — THE PRINCIPAL YOU NEVER TOUCH', H * 0.72, 'down', 300);

  // E3 MARKET-STANDARD FIX (review report E3 [P1] — THE MASCOT IS ABSENT
  // FROM THE BEATS THAT CARRY THE FACTS): the exit chapters were
  // figureless — a stick-man channel's retention contract is that the
  // character carries the argument, and here he was a recurring guest.
  // The certified side-host register (the B2 staging: the free left band,
  // gesture cycle aimed INTO the scene's content) joins this drawer.
  hostSmall(g, 92, 'pointR', 33, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// ── ruleChange — the 2026 OBBBA / QSBS rule cards ────────────────────────────
export function ruleChangeScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'gold');
  title(g, (s.title as string) || 'The rule change');
  srcChip(g);
  const mode = (s.mode as string) || 'floor';
  const rows: Record<string, Array<[string, string]>> = {
    floor: [['0.5%-of-AGI FLOOR', 'you lose the deduction on the first half-percent of AGI']],
    cap: [['35¢ ON THE DOLLAR', 'the 37% bracket\u2019s charitable deduction caps at 35 cents']],
    limits: [['30%-OF-AGI LIMIT', 'appreciated-asset deduction · five-year carryforward · model 2026, not a 2023 blog post']],
    qsbs: [['§1202 — THE 2025 TIERS', '50% excluded at 3 yrs · 75% at 4 · 100% at 5 (post-July 4, 2025 stock)']],
    'qsbs-2': [['$15M PER-ISSUER CAP · $75M GROSS-ASSET TEST', 'older stock keeps $10M / 5 yrs / 100% — read §1202 first']],
  };
  const list = rows[mode] || rows.floor;
  let y = H * 0.32;
  for (let i = 0; i < list.length; i++) {
    const ip = clamp01((t - 300 - i * 400) / 550);
    if (ip <= 0) continue;
    ctx.save();
    ctx.globalAlpha = ip;
    gildedCard(ctx, 190, y, W - 640, 170, rgba(PALETTE.gold, 0.3));
    setFont(ctx, 48, 700, FONT_DISPLAY);
    ctx.fillStyle = PALETTE.ink;
    ctx.textAlign = 'left';
    ctx.fillText(list[i][0], 250, y + 76);
    setFont(ctx, 34, 400);
    ctx.fillStyle = PALETTE.inkSoft;
    const lines = wrapText(ctx, list[i][1], W - 780, 34, 600);
    lines.slice(0, 2).forEach((ln, k) => ctx.fillText(ln, 250, y + 126 + k * 42));
    ctx.restore();
    y += 210;
  }
  // E1/E4 MARKET-STANDARD FIX (review report E1 [P0] — "ruleChange is ONE
  // card"): THE WHAT-CHANGED BAND — a full-width old→new pair under the
  // rule card: the old regime muted, the new regime gold-washed, an arrow
  // between. The frame reads BEFORE → AFTER instead of one floating card.
  const change: Record<string, [string, string, string]> = {
    floor: ['THE OLD RULE', '60% of AGI — the old ceiling', '0.5% of AGI — the new floor'],
    cap: ['THE OLD RULE', '37\u00a2 — the old top rate', '35\u00a2 — the new cap'],
    limits: ['THE OLD RULE', 'no asset-class limit', '30% of AGI · 5-yr carryforward'],
    qsbs: ['THE OLD TIERS', '$10M / 5 yrs / 100%', '$15M cap · tiered 50/75/100%'],
    'qsbs-2': ['THE OLD CAP', '$10M per issuer', '$15M per issuer · $75M asset test'],
  };
  const ch2 = change[mode] || change.floor;
  const bp2 = clamp01((t - 900) / 600);
  if (bp2 > 0) {
    ctx.save();
    ctx.globalAlpha = bp2;
    const bandY = H * 0.615, bandH = 116;
    ctx.fillStyle = rgba(PALETTE.card, 0.85);
    roundRect(ctx, 190, bandY, 640, bandH, 16);
    ctx.fill();
    registerRect('ruleChange:old', 190, bandY, 640, bandH);
    setFont(ctx, 22, 700);
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.textAlign = 'left';
    ctx.fillText(ch2[0], 220, bandY + 40);
    setFont(ctx, 30, 700, FONT_DISPLAY);
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.fillText(ch2[1], 220, bandY + 86);
    // the arrow
    ctx.strokeStyle = rgba(PALETTE.goldDeep, 0.9);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(870, bandY + bandH / 2);
    ctx.lineTo(990, bandY + bandH / 2);
    ctx.moveTo(968, bandY + bandH / 2 - 16);
    ctx.lineTo(990, bandY + bandH / 2);
    ctx.lineTo(968, bandY + bandH / 2 + 16);
    ctx.stroke();
    ctx.fillStyle = rgba(PALETTE.gold, 0.16);
    roundRect(ctx, 1030, bandY, 700, bandH, 16);
    ctx.fill();
    ctx.strokeStyle = rgba(PALETTE.gold, 0.75);
    ctx.lineWidth = 2.5;
    roundRect(ctx, 1030, bandY, 700, bandH, 16);
    ctx.stroke();
    registerRect('ruleChange:new', 1030, bandY, 700, bandH);
    setFont(ctx, 22, 700);
    ctx.fillStyle = PALETTE.goldDeep;
    ctx.textAlign = 'left';
    ctx.fillText('OBBBA 2026', 1060, bandY + 40);
    setFont(ctx, 30, 700, FONT_DISPLAY);
    ctx.fillStyle = PALETTE.ink;
    ctx.fillText(ch2[2], 1060, bandY + 86);
    ctx.restore();
  }

  // E3 MARKET-STANDARD FIX (review report E3 [P1] — THE MASCOT IS ABSENT
  // FROM THE BEATS THAT CARRY THE FACTS): the exit chapters were
  // figureless — a stick-man channel's retention contract is that the
  // character carries the argument, and here he was a recurring guest.
  // The certified side-host register (the B2 staging: the free left band,
  // gesture cycle aimed INTO the scene's content) joins this drawer.
  hostSmall(g, 92, 'pointR', 33, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// ── lsLeverage — the 130/30 structure ────────────────────────────────────────
export function lsLeverageScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'up');
  title(g, (s.title as string) || 'The levered long/short');
  srcChip(g);
  const mode = (s.mode as string) || 'intro';
  const ap = clamp01(t / 500);
  const bx = 190, bw = W - 620, by = H * 0.40, bh = 130;
  ctx.save();
  ctx.globalAlpha = ap;
  // the core 100%
  const coreW = bw * 0.5;
  ctx.fillStyle = rgba(PALETTE.up, 0.8);
  roundRect(ctx, bx + bw * 0.25, by, coreW, bh, 20);
  ctx.fill();
  setFont(ctx, 36, 700);
  ctx.fillStyle = PALETTE.white;
  ctx.textAlign = 'center';
  ctx.fillText('YOUR CONCENTRATED CORE', bx + bw * 0.25 + coreW / 2, by + bh / 2 + 12);
  // long extension (left) / short extension (right) slide out
  const ep = clamp01((t - 500) / 900);
  ctx.globalAlpha = ap * ep;
  ctx.fillStyle = rgba(PALETTE.up, 0.45);
  roundRect(ctx, bx + bw * 0.25 - bw * 0.25 * ep, by, bw * 0.25, bh, 20);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.down, 0.5);
  roundRect(ctx, bx + bw * 0.25 + coreW, by, bw * 0.25 * ep, bh, 20);
  ctx.fill();
  setFont(ctx, 30, 700);
  ctx.fillStyle = PALETTE.up;
  ctx.fillText('LONG +', bx + bw * 0.12, by + bh / 2 + 10);
  ctx.fillStyle = PALETTE.down;
  ctx.fillText('SHORT −', bx + bw * 0.88, by + bh / 2 + 10);
  ctx.restore();
  if (mode === 'ratios') {
    const rp = clamp01((t - 900) / 600);
    if (rp > 0) {
      ctx.save();
      ctx.globalAlpha = rp;
      setFont(ctx, 56, 700, FONT_DISPLAY);
      ctx.fillStyle = PALETTE.ink;
      ctx.textAlign = 'left';
      ctx.fillText('130/30 — and the aggressive 200/100', 190, H * 0.66);
      setFont(ctx, 36, 600);
      ctx.fillStyle = PALETTE.inkSoft;
      ctx.fillText('tax-neutral diversification, fast', 190, H * 0.66 + 62);
      ctx.restore();
    }
  } else if (mode === 'extensions') {
    const ep2 = clamp01((t - 700) / 600);
    if (ep2 > 0) {
      ctx.save();
      ctx.globalAlpha = ep2;
      chip(ctx, 'LONG: BOUGHT WITH BORROWED FUNDS · SHORT: BORROWED AND SOLD', 190, H * 0.66, { size: 30, bg: PALETTE.white, fg: PALETTE.inkSoft });
      ctx.restore();
    }
  }

  // E3 MARKET-STANDARD FIX (review report E3 [P1] — THE MASCOT IS ABSENT
  // FROM THE BEATS THAT CARRY THE FACTS): the exit chapters were
  // figureless — a stick-man channel's retention contract is that the
  // character carries the argument, and here he was a recurring guest.
  // The certified side-host register (the B2 staging: the free left band,
  // gesture cycle aimed INTO the scene's content) joins this drawer.
  hostSmall(g, 92, 'pointR', 33, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// ── appleCase — the JAM case study ───────────────────────────────────────────
export function appleCaseScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'down');
  title(g, (s.title as string) || 'The Apple case, 2007\u20132017');
  srcChip(g);
  const mode = (s.mode as string) || 'slow';
  const slowP = mode === 'slow' ? clamp01((t - 400) / 2400) : 1;
  const fastP = mode === 'fast' ? clamp01((t - 400) / 1600) : mode === 'slow' ? 1 : 0;
  // slow: active weight barely falls (80% at year 10)
  const SLOW: [number, number][] = [[0, 100], [0.25, 94], [0.5, 90], [0.75, 85], [1, 80]];
  // fast: collapses to 1% within two years
  const FAST: [number, number][] = [[0, 100], [0.1, 42], [0.2, 8], [1, 1]];
  lineChart(ctx, {
    x: 190, y: 300, w: W - 700, h: H * 0.40,
    series: [
      { name: 'gains budget — sell 5%/yr', tone: 'muted', points: partialPoints(SLOW, slowP) },
      { name: 'LS 200/100', tone: 'up', points: partialPoints(FAST, fastP) },
    ],
    p: 1, t, gridLines: 4, showYAxis: true, lineWidth: 6,
    // U24: the case-study's delta badge — the leveraged route's endpoint.
    deltaBadge: { value: '−99%', tone: 'down' },
  });
  // E2 MARKET-STANDARD FIX (review report E2 [P1] — "one line and a dot
  // with 60% of the frame empty"): the case-study ledger — the two
  // series named, the endpoint delta, and the lesson the VO draws; the
  // legend names both curves (premium-chart vocabulary).
  const lg5 = clamp01((t - 500) / 450);
  if (lg5 > 0) {
    ctx.save();
    ctx.globalAlpha = lg5;
    let ax5 = 190 + 24;
    const names5: Array<[string, string]> = [['gains budget — sell 5%/yr', PALETTE.inkSoft], ['LS 200/100', PALETTE.up]];
    names5.forEach(([nm, col]) => {
      ctx.fillStyle = col;
      roundRect(ctx, ax5, 270, 22, 22, 5);
      ctx.fill();
      setFont(ctx, 24, 600);
      ctx.fillStyle = PALETTE.inkSoft;
      ctx.textAlign = 'left';
      ctx.fillText(nm, ax5 + 32, 288);
      ax5 += 32 + ctx.measureText(nm).width + 44;
    });
    ctx.restore();
  }
  // E3 note: this beat rides the chapter HERO camera (the worst-case
  // envelope is x1.06 push + full drift) — the ledger hugs the chart
  // gutter at 350px so the envelope keeps it inside the frame edge.
  ledgerCard(ctx, 1436, H * 0.235, 350, 96 + 3 * 58 + 76, 'THE CASE, IN THREE LINES', [
    { label: 'still-holder, yr 10', value: '80%', tone: 'muted' },
    { label: 'laddered seller', value: '~1%', tone: 'up' },
    { label: 'the decision gap', value: '79 PTS', tone: 'gold' },
  ], t, 600, 'time in a concentrated position is a position in hope');
  if (mode === 'fast') {
    const cp = clamp01((t - 600) / 500);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha = cp;
      // E3: the stamp sat at H*0.78 (842) — its left half poked out from
      // behind the caption pill (guard: chip depth 62px). Raised to H*0.72
      // and registered.
      chip(ctx, 'APPLE AT ~1% WITHIN TWO YEARS — WITH HINDSIGHT, A CALAMITY', 190, H * 0.72, { size: 32, bg: rgba(PALETTE.down, 0.13), fg: PALETTE.down, border: rgba(PALETTE.down, 0.5) });
      registerRect('appleCase:stamp', 190, H * 0.72 - 30, 900, 56);
      ctx.restore();
    }
  } else {
    const cp = clamp01((t - 600) / 500);
    if (cp > 0) {
      ctx.save();
      ctx.globalAlpha = cp;
      chip(ctx, 'STILL 80% APPLE AFTER TEN YEARS', 190, H * 0.72, { size: 32, bg: rgba(PALETTE.down, 0.13), fg: PALETTE.down, border: rgba(PALETTE.down, 0.5) });
      registerRect('appleCase:stamp', 190, H * 0.72 - 30, 620, 56);
      ctx.restore();
    }
  }
  // E3 MARKET-STANDARD FIX (review report E3 [P1] — THE MASCOT IS ABSENT
  // FROM THE BEATS THAT CARRY THE FACTS): the certified side-host register
  // (the B2 staging: the free left band, gesture cycle aimed INTO the
  // scene's content) joins this exit-chapter drawer.
  hostSmall(g, 92, 'pointR', 33, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// ── decisionTable — THE SAVE ARTIFACT ────────────────────────────────────────
export function decisionTableScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'gold');
  title(g, (s.title as string) || 'The framework');
  const mode = (s.mode as string) || 'intro';
  const ROWS = [
    ['10b5-1 plan', 'Legal, disciplined selling', 'New vests, on autopilot', 'Thinks it shelters tax'],
    ['Exchange fund', 'Instant diversification', 'Big gain, no cash need 7 yrs', 'Needs money inside 7 yrs'],
    ['Direct indexing', 'Year-round loss harvest', 'High bracket · narrow fee gap', 'No gains · IRA · wide fees'],
    ['Protective collar', 'A floor for a window', 'Employer allows hedging', 'Bullish · hedging banned'],
    ['CRT / DAF', 'Gain vanishes, funds giving', 'Genuine intent · spare capital', 'May need the principal'],
    ['Levered L/S', 'Fast, tax-deferred exit', 'Scale · leverage tolerance', 'Fee- or leverage-averse'],
  ];
  const visible = mode === 'intro' ? 0 : mode === 'full' ? 6 : Number(mode.slice(4));
  // F3 (review report F3 [P0] — decisionTable NEVER DRAWS ITS HERO): the
  // 12-second intro beat gated rows to zero — at 60% and 85% of the beat
  // the frame held only the title and four column labels while the VO
  // narrates "six tools, six jobs, six kill conditions". The intro now
  // draws the STRUCTURE: all six rows as a ghost map — the exit names
  // readable, the detail columns as soft placeholder bars the row-N beats
  // then fill in. The beat's entire point is on screen from its first
  // third.
  const ghost = mode === 'intro';
  const colX = [190, 510, 890, 1300];
  const colW = [310, 370, 400, 420];
  const rowY0 = 290, rowH = 100;
  // header row
  const hp = clamp01(t / 500);
  if (hp > 0) {
    ctx.save();
    ctx.globalAlpha = hp;
    const heads = ['EXIT', 'THE ONE JOB', 'CHOOSE IT WHEN', 'KILL CONDITION'];
    for (let c = 0; c < 4; c++) {
      setFont(ctx, 30, 700);
      ctx.fillStyle = PALETTE.goldDeep;
      ctx.textAlign = 'left';
      ctx.fillText(heads[c], colX[c], rowY0 - 24);
    }
    ctx.strokeStyle = rgba(PALETTE.gold, 0.6);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(colX[0], rowY0 - 8);
    ctx.lineTo(colX[3] + colW[3], rowY0 - 8);
    ctx.stroke();
    ctx.restore();
  }
  for (let r = 0; r < (ghost ? 6 : visible); r++) {
    const rpRaw = clamp01((t - 350 - r * 320) / 550);
    const rp = ghost ? rpRaw * 0.55 : rpRaw;
    if (rpRaw <= 0) continue;
    // ghost rows compress (82px pitch) so row 6 bottoms at ~786 — clear of
    // the caption-pill envelope the guard flagged on the first render
    const y = rowY0 + r * (ghost ? 82 : rowH);
    ctx.save();
    ctx.globalAlpha = rp;
    // C4 MARKET-STANDARD FIX (review report C4 [P1] — THE BARE ROW): the
    // zebra banded by SKIPPING rows — rows one and three carried plates,
    // row two shipped bare (read as a dropped element, not a design).
    // Every row now carries its plate; the banding reads through alpha.
    ctx.fillStyle = rgba(PALETTE.card, r % 2 === 0 ? 0.9 : 0.55);
    roundRect(ctx, colX[0] - 16, y - 6, colX[3] + colW[3] - colX[0] + 32, (ghost ? 82 : rowH) - 14, 16);
    ctx.fill();
    setFont(ctx, 32, 700, FONT_DISPLAY);
    ctx.fillStyle = PALETTE.goldDeep;
    ctx.fillText(ROWS[r][0], colX[0], y + 40);
    if (ghost) {
      // the placeholder bars: the row's detail columns await their beats
      ctx.fillStyle = rgba(PALETTE.ink, 0.14);
      for (const c of [1, 2, 3]) {
        roundRect(ctx, colX[c], y + 14, Math.min(colW[c] - 60, 220), 22, 8);
        ctx.fill();
      }
      registerRect('decisionTable:ghostRow' + r, colX[0] - 16, y - 6, colX[3] + colW[3] - colX[0] + 32, (ghost ? 82 : rowH) - 14);
    } else {
      // C4 MARKET-STANDARD FIX (review report C4 [P1] — THE COLUMN
      // COLLISION): the cells printed at fixed x anchors without measuring
      // their own column's extent — row three's third column ran INTO the
      // fourth ("fee gapNo gains"), row two's nearly touched. Each detail
      // cell now wraps WITHIN its column width (two measured lines max,
      // 34px pitch — inside the 100px row band).
      const cell = (txt: string, cx: number, cw: number, col: string): void => {
        const lines = wrapText(ctx, txt, cw - 24, 29, 600).slice(0, 2);
        ctx.fillStyle = col;
        lines.forEach((ln, i) => ctx.fillText(ln, cx, y + 36 + i * 34));
      };
      cell(ROWS[r][1], colX[1], colW[1], PALETTE.ink);
      cell(ROWS[r][2], colX[2], colW[2], PALETTE.inkSoft);
      cell(ROWS[r][3], colX[3], colW[3], PALETTE.down);
    }
    ctx.restore();
  }
  if (mode === 'full') {
    const fp = clamp01((t - 2200) / 700);
    if (fp > 0) {
      ctx.save();
      ctx.globalAlpha = fp;
      chip(ctx, 'SCREENSHOT THIS — OR FIND IT IN THE DESCRIPTION', W / 2 - 420, H * 0.885, { size: 32, bg: PALETTE.goldWash, fg: PALETTE.goldDeep, border: rgba(PALETTE.gold, 0.6) });
      ctx.restore();
    }
  }

  // B2 MARKET-STANDARD FIX (review report B2 [P1] — NO PRESENTER IN THE
  // DATA CHAPTERS): the framework table gets its presenter — he stands
  // left of the row cards (the table's registered left edge is 174), his
  // gesture cycle aimed at the rows. B3 MARKET-STANDARD FIX (review
  // report B3 [P1] — HOLSTERED VERBS): he HOLDS THE FRAMEWORK CARD (the
  // ledger-resolved holdCard) — the verdict someone walks you through,
  // not a plate that floats.
  hostSmall(g, 92, 'pointR', 36, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4,
    undefined, undefined, undefined, undefined, undefined,
    resolveProp('decisionTable', 'holdCard', true) ? 'holdCard' : undefined);

}

// ── sequenceStack — the layered answer ───────────────────────────────────────
export function sequenceStackScene(g: SceneCtx): void {
  const { ctx, W, H, t, s } = g;
  room(g, 'gold');
  title(g, (s.title as string) || 'The sequence');
  const ap = clamp01(t / 500);
  const layers = [
    ['$6M', 'EXCHANGE FUND — the core', PALETTE.up],
    ['10b5-1', 'A LADDER FOR EVERY NEW VEST', PALETTE.ink],
    ['$1M', 'DONOR-ADVISED FUND — if charitably inclined', PALETTE.goldDeep],
    ['$1M', 'COLLAR — the upside you cannot let go of', PALETTE.muted ?? PALETTE.inkSoft],
  ];
  // E3 MARKET-STANDARD FIX (review report E3 [P0] — LAYERING COLLISIONS):
  // four rows at a 158px pitch from H*0.30 put row 4 at y 798..926 — the
  // caption pill plated its top 69px (the guard: card@280,798 depth 69px).
  // The stack compresses into the 260-820 band: pitch 158 -> 136, cards
  // 128 -> 118, start H*0.30 -> H*0.272. Row 4 now bottoms at ~815, clear
  // of the 2-row pill envelope, and every row registers with the collision
  // guard so this call path can never silently regress again.
  let y = H * 0.272;
  for (let i = 0; i < layers.length; i++) {
    const lp = clamp01((t - 350 - i * 380) / 550);
    if (lp <= 0) continue;
    ctx.save();
    ctx.globalAlpha = lp;
    const w = W * 0.62 - i * 60;
    const x = 190 + i * 30;
    gildedCard(ctx, x, y, w, 118, i === 0 ? rgba(PALETTE.gold, 0.3) : undefined);
    registerRect('sequenceStack:row' + i, x, y, w, 118);
    setFont(ctx, 42, 700, FONT_DISPLAY);
    ctx.fillStyle = layers[i][2];
    ctx.textAlign = 'left';
    ctx.fillText(layers[i][0], x + 40, y + 72);
    setFont(ctx, 29, 600);
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.fillText(layers[i][1], x + 240, y + 68);
    ctx.restore();
    y += 136;
  }

  // E3 MARKET-STANDARD FIX (review report E3 [P1] — THE MASCOT IS ABSENT
  // FROM THE BEATS THAT CARRY THE FACTS): the exit chapters were
  // figureless — a stick-man channel's retention contract is that the
  // character carries the argument, and here he was a recurring guest.
  // The certified side-host register (the B2 staging: the free left band,
  // gesture cycle aimed INTO the scene's content) joins this drawer.
  hostSmall(g, 92, 'pointR', 33, g.H * 0.66, 1.3, 0, 'aha', 1.4, 1, true, 0.4);
}

// [[MORE]]

