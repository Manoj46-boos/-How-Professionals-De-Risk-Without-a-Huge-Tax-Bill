/**
 * Thumbnail generator v3 — "poster logic" (report P0-3 / §4.8).
 *
 * v2 sins (panel CTR review, 4.5-5.5/10): three competing hero objects (K +
 * rocket chart + figure), the punchline white-with-outline on a PASTEL
 * gradient (mush at 320px feed size), the +20% badge teal-on-teal with no
 * plate ("effectively invisible on a phone"), the K's diagonal fusing with
 * the chart arrow into one ambiguous shape, and a 15px face that carries no
 * emotion. The panel's one-line diagnosis: "a diagram; the fix is a poster."
 *
 * v3 rebuilds from poster logic:
 *  - ONE hero object: the gold K, bigger, on a saturated DEEP-TEAL/CORAL
 *    split — high contrast from COLOR, not darkness (no-black rule kept).
 *  - ONE 3-4 word punchline, solid white fill at 132-150px with a heavy
 *    ink stroke, inside the 5% crop-safe margin, auto-sized per wording.
 *  - ONE plated number badge (white plate, teal number) bottom-left.
 *  - Emotion legible at feed size: a chibi worried figure (head 1.7×) with
 *    hands up, on the coral half.
 *  - The rocket chart is GONE (it fused with the K and read as a diagram).
 *
 * Six variants for YouTube Test & Compare (report: "ship 4-6 variants and
 * let the measured race decide").
 *
 * F1 RE-SPEC (Frame Quality Review §F1): the poster now packages THIS
 * film — the emerald/gold split, the INGOT brand tag, the $3.7M-bill /
 * six-exits hook family — not the previous film's "FEELING BROKE?" art.
 */

import { PALETTE, FONT_UI, rgba, roundRect, setFont } from './theme';
import { POSES } from './stickman';
import { drawStickmanV2 } from './stickman-v2';

/** Tapered stroke helper (thick-to-thin polygon with round caps). */
function taper(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, ex: number, ey: number,
  w0: number, w1: number, col: string
): void {
  const dx = ex - x, dy = ey - y;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x + nx * w0 / 2, y + ny * w0 / 2);
  ctx.lineTo(ex + nx * w1 / 2, ey + ny * w1 / 2);
  ctx.lineTo(ex - nx * w1 / 2, ey - ny * w1 / 2);
  ctx.lineTo(x - nx * w0 / 2, y - ny * w0 / 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, w0 / 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(ex, ey, w1 / 2, 0, Math.PI * 2); ctx.fill();
}

export interface ThumbVariant {
  /** punchline lines (rendered top-to-bottom, left-aligned) */
  punch: string[];
  /** plated number badge */
  badge: { big: string; label: string };
}

// ── 100-JUDGE PANEL / PHASE 3 item 3.5 — THE THUMBNAIL GUARD (report §6
// Phase 3: "a 10-line fit-check in thumbnail.ts — measured text width ≤
// plate width − 8% crop margin — kills the v4/v5 clip class permanently")
// The v4/v5 defect: the punch fit-loop gave up at its 80px floor and the
// text CLIPPED past the frame edge — "RICH MARKET." shipped as "RICH
// MARKET". The guard makes fit a hard invariant: every text shrinks until
// its MEASURED width fits its plate minus the 8% crop margin; the floor
// yields to the fit (a complete word at 56px beats a clipped word at 80px).
// Ten lines, applied to every text the thumbnail draws.
const THUMB_CROP_MARGIN = 0.08;
/** Exported for the phase-3 evidence tools: the guard IS the invariant. */
export function fitCheck(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  startSize: number,
  minSize: number,
  plateW: number,
  family?: string
): number {
  const limit = plateW * (1 - THUMB_CROP_MARGIN);
  let size = startSize;
  setFont(ctx, size, 700, family);
  const widest = (): number => Math.max(...lines.map((l) => ctx.measureText(l).width));
  while (size > minSize && widest() > limit) {
    size -= 2;
    setFont(ctx, size, 700, family);
  }
  return size;
}

/** The six v3 variants — A/B/C keep v2's proven wordings as controls.
 *  Panel re-review notes: badge sub-lines must stay ≤ 10 chars to read at
 *  320px feed size ("OF PROFIT GROWTH · 7 STOCKS" was mush); v5 earns its
 *  slot only with the short form.
 *  AUDIT-2 / §10.5 (report Phase 4): variant 0 becomes the CONTRADICTION
 *  PAIR the panel asked to bake in — "MARKET +20%. FEELING BROKE?" — the
 *  hook that survives 320px because each line is 3 words. */
// F1 RE-SPEC (Frame Quality Review §F1 — THE THUMBNAIL SHIPS THIS FILM):
// the six variants carry THIS film's hook — the $3.7M bill on the
// concentrated sale and the six exits — with the film's own verified
// numbers ($10M sale, ~37% to the tax, the $100B Ballmer decision gap).
// The old film's wordings ("FEELING BROKE?", the +20% market badge) are
// gone: the click is the first retention decision and it is now made on
// the right film's art.
export const THUMB_VARIANTS: ThumbVariant[] = [
  { punch: ['THE $3.7M', 'TAX BILL'],        badge: { big: '6',     label: 'WAYS OUT' } },
  { punch: ['SIX EXITS.', 'PICK ONE'],       badge: { big: '$3.7M', label: 'the bill' } },
  { punch: ['CONCENTRATED', 'STOCK?'],       badge: { big: '6',     label: 'EXITS' } },
  { punch: ['SELL $10M.', 'PAY $3.7M?'],     badge: { big: '37%',   label: 'TO THE TAX' } },
  { punch: ['THE DECISION,', 'NOT THE MARKET'], badge: { big: '$100B', label: 'LEFT BEHIND' } },
  { punch: ['ONE SALE.', 'ONE BILL.'],       badge: { big: '37%',   label: 'OF $10M' } },
];

/**
 * Thumbnail generator v4 — "THE POSTER" (audit-round-2, fix 5).
 *
 * v3's scan order read backwards — number (the +20% badge), then
 * question (the punchline), then character (the chibi inside the K) —
 * and +20% appeared TWICE (punchline AND badge), the S&P sub-badge fed
 * the feed's crop, the K read as a watermark, and the figure floated with
 * no contact shadow on the orange side. The audit's prescription: "scan
 * order becomes character, question, number". v4:
 *  - CHARACTER first: the worried host LARGE on the left, standing ACROSS
 *    the teal/coral seam — one foot in each economy — with a CONTACT
 *    shadow that reads on BOTH color fields.
 *  - QUESTION loudest: "FEELING BROKE?" carries the frame at 168px.
 *  - NUMBER once, incomplete and alarming: the badge says "+20%" with
 *    the sub-line "...for who?" — the S&P label is gone; the number
 *    completes IN THE VIDEO, which is the click.
 *  - the K shrinks to a small branded tag (top-right corner mark).
 */
export function drawThumbnail(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  variant: 0 | 1 | 2 | 3 | 4 | 5 = 0
): void {
  const { up: UP, down: DOWN, gold: GOLD, goldDeep: GOLDD, ink: INK } = PALETTE;
  const v = THUMB_VARIANTS[Math.min(variant, THUMB_VARIANTS.length - 1) as 0 | 1 | 2 | 3 | 4 | 5];

  // ── background: saturated deep-teal / coral diagonal split ────────────────
  // Poster contrast from COLOR, not darkness. Teal deepened one step from
  // PALETTE.up (#0B6E63 → #0A5F55) so white type carries ~6:1; coral kept
  // at PALETTE.down. Both stay in the light brand's hue families — no
  // black, no brown.
  // F1 RE-SPEC: the poster splits on THIS film's two registers — the
  // dramatic emerald (the kill-card family) and the deep gold (the
  // winner-data family). The previous film's teal/coral split is gone.
  const gl = ctx.createLinearGradient(0, 0, W * 0.6, H);
  gl.addColorStop(0, '#14352C');
  gl.addColorStop(1, '#0E1F19');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W * 0.62, 0);
  ctx.lineTo(W * 0.50, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
  const gr = ctx.createLinearGradient(W * 0.45, 0, W, H);
  gr.addColorStop(0, '#A67F1E');
  gr.addColorStop(1, '#8F6E12');
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.moveTo(W * 0.62, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, H);
  ctx.lineTo(W * 0.50, H);
  ctx.closePath();
  ctx.fill();
  // soft white seam on the diagonal
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 13;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(W * 0.615, -8);
  ctx.lineTo(W * 0.495, H + 8);
  ctx.stroke();
  ctx.restore();

  // ── CHARACTER FIRST (fix 5): the worried host, LARGE, standing ACROSS the
  // seam — one foot on the teal field, one on the coral — his contact
  // shadow crossing both color fields. The split IS the K-shape; the man
  // standing astride it is the film. Chibi head (r 62) so the worry reads
  // at 100px feed height; hands up; brows up; mouth open.
  // ── CHARACTER FIRST (fix 5) — 100-JUDGE PANEL REPORT (fix F — SAME
  // BRAND): the generic white stick man was a stranger — "the viewer who
  // clicks meets a different character." The thumbnail now renders the
  // FILM's host with the real rig (drawStickmanV2) in the re-keyed shock
  // pose, astride the seam, waist-up staging (the legs run below the
  // canvas edge): the face carries the worry at feed size, and the
  // character matches the first frame of the video.
  {
    const fx = W * 0.52;
    const fy = H * 1.08; // pelvis below the bottom edge: waist-up framing
    const SC = 3.2;      // head ≈ 145px at 1280×720 — the worry reads at 320px
    ctx.save();
    ctx.translate(fx, fy);
    ctx.scale(SC, SC);
    drawStickmanV2(ctx, 0, 0, 1, 4000, {
      pose: POSES.shock,
      // PHASE 4 (audit §7 — THUMBNAIL PARITY PASS): "the host's thumbnail
      // face = the film face." The thumbnail ran its own face register
      // (1.35 / jaw 1.6) — a face the film never shows. The film's shock
      // close-up register (the gasp: jaw2x 2, faceScale 1.8) is the face
      // the viewer actually meets in the first frames — the thumbnail now
      // renders THAT face, so the click lands on the same character read.
      talk: 0.8, jaw2x: 2, faceScale: 1.8,
      look: 0.15, parallax: false, scarf: true,
    }, 7);
    ctx.restore();
    // the contact shadow — astride the seam at the canvas edge
    // PHASE-0 (§7-D4): joins the one-light rule — (−4, 0) like every
    // ground contact shadow in the film.
    ctx.fillStyle = 'rgba(15, 40, 34, 0.35)';
    ctx.beginPath();
    ctx.ellipse(W * 0.52 - 4, H - 6, 200, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── QUESTION LOUDEST (fix 5): the question line carries the frame —
  // solid white fill, heavy ink stroke, crop-safe, 168px down to fit.
  // The A/B family keeps its alternate wordings; the shipped variant (0)
  // is the pure question, the first thing the eye reads after the man.
  {
    // Panel round 2: the question sits top-right — clear of the figure's
    // raised right hand (x≈0.57W) and of the badge (now bottom-right). It
    // auto-fits the quadrant at up to 150px and never leaves the crop-safe
    // margin.
    const px0 = Math.round(W * 0.592);        // right of the raised hand
    const maxLineW = W - 45 - px0;
    // 3.5 THE GUARD — measured width ≤ plate − 8% crop margin, floor yields
    // (the v4/v5 clip class died here: the old loop stopped at 80px and let
    // the text run past the frame)
    let pSize = fitCheck(ctx, v.punch, 150, 44, maxLineW, FONT_UI);
    const strokeW = Math.max(9, Math.round(pSize * 0.085));
    ctx.save();
    ctx.translate(px0, H * 0.33);
    ctx.rotate(-0.012);
    ctx.textAlign = 'left';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.lineWidth = strokeW;
    ctx.strokeStyle = INK;
    v.punch.forEach((line, i) => {
      const y = i * (pSize * 1.02);
      ctx.strokeText(line, 0, y);
    });
    ctx.fillStyle = '#FFFFFF';
    v.punch.forEach((line, i) => {
      const y = i * (pSize * 1.02);
      ctx.fillText(line, 0, y);
    });
    ctx.restore();
  }

  // ── NUMBER, ONCE — incomplete and alarming (fix 5): the badge carries
  // the number and the question it leaves hanging ("...for who?"). The
  // S&P sub-label is gone — the number completes IN the video.
  {
    // 3.5 THE GUARD on the badge too — the numeral and its completion line
    // fit the plate interior (52px pad each side) minus the 8% margin, so
    // no variant wording can ever cross its own plate again
    const bigSize = fitCheck(ctx, [v.badge.big], 117, 84, 640, FONT_UI);
    setFont(ctx, bigSize, 700, FONT_UI);
    const bigW = ctx.measureText(v.badge.big).width;
    // F1 RE-SPEC: the completion line is per-variant (this film's hooks)
    const sub = v.badge.label;
    const subSize = fitCheck(ctx, [sub], 44, 30, 640, FONT_UI);
    setFont(ctx, subSize, 600, FONT_UI);
    const subW = ctx.measureText(sub).width;
    const plateW = Math.max(bigW, subW) + 110;
    const plateH = 225;
    // Panel round 2: the badge moves to the BOTTOM-right — the scan order
    // ends on the number (character → question → number), and the top-right
    // quadrant belongs to the question. Bottom edge 675 keeps the 5% crop
    // margin (720·0.95 = 684).
    const bx = W - plateW - 36; // bottom-right, crop-safe
    const by = H - plateH - 45;
    ctx.save();
    // PHASE-0 (§7-D4): the badge's drop shadow used to fall (+7, +11) —
    // lower-RIGHT, contradicting the film's upper-right key light. Same
    // magnitude, corrected direction: lower-left like every plate.
    ctx.fillStyle = 'rgba(15, 40, 34, 0.42)';
    roundRect(ctx, bx - 7, by + 11, plateW, plateH, 38);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, bx, by, plateW, plateH, 38);
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = rgba(INK, 0.85);
    roundRect(ctx, bx, by, plateW, plateH, 38);
    ctx.stroke();
    setFont(ctx, bigSize, 700, FONT_UI);
    ctx.fillStyle = PALETTE.goldNumeral; // F1: this film's number register
    ctx.textAlign = 'left';
    ctx.fillText(v.badge.big, bx + 52, by + 128);
    setFont(ctx, subSize, 600, FONT_UI);
    ctx.fillStyle = INK;
    ctx.fillText(sub, bx + 52, by + 192);
    ctx.restore();
  }

  // ── THE INGOT — this film's owned mark, top-left corner (F1 RE-SPEC):
  // the previous film's gold K retires; the tag is the two-tier ingot the
  // watermark, seals and caption bullets all carry — one brand object.
  {
    ctx.save();
    const ix = 96, iy = 112, iw = 66, ih = 26;
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.moveTo(ix - iw, iy - ih);
    ctx.lineTo(ix + iw, iy - ih);
    ctx.lineTo(ix + iw * 0.72, iy + ih);
    ctx.lineTo(ix - iw * 0.72, iy + ih);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = rgba(GOLDD, 0.85);
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.stroke();
    // the one-light top face — the film's key light from upper right
    ctx.fillStyle = rgba('#F7EFD8', 0.5);
    ctx.beginPath();
    ctx.moveTo(ix - iw, iy - ih);
    ctx.lineTo(ix + iw, iy - ih);
    ctx.lineTo(ix + iw * 0.82, iy - ih * 0.28);
    ctx.lineTo(ix - iw * 0.82, iy - ih * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  void DOWN;
  void GOLDD;
}

/**
 * A/B/C/D/E/F thumbnail generator for YouTube's Test & Compare — the v3
 * poster family. Convenience wrapper over drawThumbnail(v).
 */
export function drawThumbnailVariant(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  variant: 0 | 1 | 2 | 3 | 4 | 5 = 0
): void {
  drawThumbnail(ctx, W, H, variant);
}
