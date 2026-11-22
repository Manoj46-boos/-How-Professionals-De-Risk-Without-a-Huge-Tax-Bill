/**
 * stage.ts — PHASE 4 (Visual Audit report — FEED THUMB-STOP / premium feel
 * 4.5): "A scrolled viewer sees a mascot, a letter and a big empty field —
 * not a story. The strongest content frames (fundSplit) are the exception,
 * not the system."
 *
 * THE DIAGNOSIS: paintBg laid a flat wash and nothing else — the field a
 * presenter stands in was literally EMPTY. At the 320px feed the film's
 * default frame reduces to figure + letterform + void. fundSplit reads
 * because it owns a full-width structured mass (the 493-household wall);
 * aiDatacenter reads because of its rack field; splitNumbers because of
 * the household band. Those scenes were the exception.
 *
 * THE SYSTEM (this module — called from paintBg, so EVERY scene inherits
 * it): the film is THE DATA DESK, so the empty field becomes THE DESK —
 * a three-plane stage world that survives the 320px gate BY CONSTRUCTION
 * (every element is a large-area structure ≥ 60px at 1080 → ≥ 10px at the
 * feed; the inverse of the Phase 3 furniture whitelist, which deleted
 * sub-gate decoration — this layer only admits gate-surviving structure):
 *
 *   1. THE FLOOR PLANE — a soft horizon band + the desk surface's tone
 *      shift + perspective floor lines. The presenter STANDS ON a ground;
 *      the frame gains a horizon (the deepest depth cue a 2D stage has).
 *   2. THE ARCHITECTURE BAND — large vertical mullion silhouettes in the
 *      upper field: the studio wall behind every scene. Tuned per family:
 *      host 4 mullions, data 3 (quieter — the data owns the frame),
 *      statement 2 whispers (the type owns the frame).
 *   3. THE DESK EDGE — a soft foreground rail at the frame's foot: the
 *      camera looks OVER a desk edge, which grounds the composition.
 *
 * VALUE DISCIPLINE (the Phase 3 value-structure rule holds): every alpha
 * sits at 3-12% ink-on-field — the architecture NEVER forms a competing
 * dark mass or bright mass; it is structure, not content. Scrub-safe:
 * every position is a pure function of (W, H) and a family-seeded hash —
 * no per-frame randomness.
 */

import { rgba, PALETTE } from './theme';
import { hash01 } from './easing';
import { frameContext, type FrameFamily } from './composition';

/** per-family stage tuning: [horizonY, mullionCount, mullionAlpha, floorAlpha] */
const STAGE_TABLE: Record<FrameFamily, {
  horizonY: number;      // fraction of H where the desk begins
  mullions: number;      // how many wall verticals
  mullionAlpha: number;  // the wall band's alpha ceiling
  floorAlpha: number;    // the desk surface's darkening
  floorLines: number;    // perspective lines on the desk surface
}> = {
  // D2 MARKET-STANDARD FIX (review report D2 [P1] — WHISPER-ALPHA MULLION
  // STRIPES AS ENCODING ARTIFACTS): the 2-4 vertical wall bands drew at
  // 0.030-0.055 alpha — plainly visible as dirty stripes behind the
  // headlines in the evidence figures, resolving at feed scale as
  // compression banding, not architecture. The codebase's own C4 verdict
  // deleted ghost panels for exactly this class; the stage system
  // re-introduced it at a LOWER alpha — worse than committing or cutting.
  // The report's binary governs: CUT. mullionAlpha is 0 in every family;
  // the committed room architecture is the horizon, the desk planes and
  // the floor lines (all at committed alphas), and the field stays clean.
  host:      { horizonY: 0.70, mullions: 4, mullionAlpha: 0, floorAlpha: 0.055, floorLines: 4 },
  data:      { horizonY: 0.72, mullions: 3, mullionAlpha: 0, floorAlpha: 0.045, floorLines: 3 },
  statement: { horizonY: 0.74, mullions: 2, mullionAlpha: 0, floorAlpha: 0.050, floorLines: 3 },
};

/**
 * SCENE OVERRIDES — scenes that own their own ground system keep the
 * stage's atmosphere (wall bands, tone shift) but surrender the stage's
 * perspective floor lines: aiDatacenter draws its own perspective grid,
 * gasPump forks its two-roads diagram across the desk, splitNumbers
 * grounds the household band. Two floor systems on one desk is a
 * double-exposure — the scene's ground WINS, the stage yields.
 */
const STAGE_SCENE_OVERRIDES: Record<string, Partial<{ floorLines: number; floorAlpha: number; horizonY: number }>> = {
  aiDatacenter: { floorLines: 0, floorAlpha: 0.018 },
  gasPump: { floorLines: 0 },
  splitNumbers: { floorLines: 2, floorAlpha: 0.03 },
};

export function drawStageWorld(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number
): void {
  const family = frameContext().family;
  const sceneType = frameContext().sceneType;
  const ov = STAGE_SCENE_OVERRIDES[sceneType] ?? {};
  const base = STAGE_TABLE[family];
  const st = {
    horizonY: ov.horizonY ?? base.horizonY,
    floorAlpha: ov.floorAlpha ?? base.floorAlpha,
    floorLines: ov.floorLines ?? base.floorLines,
  };
  const horizonY = H * st.horizonY;
  const ink = PALETTE.inkDeep;

  // ── 1. THE FLOOR PLANE ────────────────────────────────────────────────
  // the desk surface darkens gently below the horizon — a large-area tone
  // shift that survives the feed trivially and gives every figure a GROUND
  let g = ctx.createLinearGradient(0, horizonY - H * 0.02, 0, H);
  g.addColorStop(0, rgba(ink, 0));
  g.addColorStop(0.28, rgba(ink, st.floorAlpha * 0.55));
  g.addColorStop(1, rgba(ink, st.floorAlpha));
  ctx.fillStyle = g;
  ctx.fillRect(0, horizonY - H * 0.02, W, H - horizonY + H * 0.02);
  // the horizon band — a soft 18px gradient crest (never a hard line: at
  // the 320px gate a 3px rule is half a pixel; a band is a PLANE)
  g = ctx.createLinearGradient(0, horizonY - H * 0.016, 0, horizonY + H * 0.004);
  g.addColorStop(0, rgba(ink, 0));
  g.addColorStop(0.6, rgba(ink, st.floorAlpha * 1.8));
  g.addColorStop(1, rgba(ink, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, horizonY - H * 0.016, W, H * 0.02);
  // perspective floor lines — soft, ≥10px, converging to the vanishing
  // point under the frame centre (the aiDatacenter floor grammar,
  // generalised to every family's stage)
  const vpx = W * 0.5;
  const vpy = horizonY;
  ctx.strokeStyle = rgba(ink, st.floorAlpha * 1.25);
  ctx.lineWidth = Math.max(8, W * 0.005);
  for (let i = 0; i < st.floorLines; i++) {
    const spread = 0.28 + hash01(i * 7.3 + 11) * 0.9;    // deterministic x at the frame foot
    const footX = W * (0.06 + spread * 0.88);
    ctx.beginPath();
    ctx.moveTo(vpx + (footX - vpx) * 0.18, vpy + H * 0.008);
    ctx.lineTo(footX, H);
    ctx.stroke();
  }

  // ── 2. THE ARCHITECTURE BAND — DELETED ────────────────────────────────
  // 0.4 (review report §5.1 Phase 0 — RETIRE OR COMMIT THE WHISPER
  // STRIPES): the mullion band loop is DELETED, the panel's own
  // recommendation. The D2 register cut (mullionAlpha → 0) silenced the
  // bands but the loop still cost per-frame time on every scene; now the
  // cost is gone too. The room composes from the planes that carry real
  // mass — the floor plane, the horizon band, the perspective lines and
  // the desk edge — and the upper field stays clean for the content.

  // ── 3. THE DESK EDGE ──────────────────────────────────────────────────
  // the frame's foot: a soft foreground rail the camera looks over
  g = ctx.createLinearGradient(0, H - H * 0.075, 0, H);
  g.addColorStop(0, rgba(ink, 0));
  g.addColorStop(1, rgba(ink, st.floorAlpha * 1.6));
  ctx.fillStyle = g;
  ctx.fillRect(0, H - H * 0.075, W, H * 0.075);
}
