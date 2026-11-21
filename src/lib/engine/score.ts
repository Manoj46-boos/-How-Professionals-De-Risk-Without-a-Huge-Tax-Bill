/**
 * THE LEDGER — the score, as data.
 *
 * "GILDED LEDGER" edition: a completely new musical identity for the
 * concentrated-stock film. Where the old score was a 92 BPM C-major
 * morning bed, this is a stately 68 BPM D-major score — the private-bank
 * register: wide voicings (maj9 / m11 / sus2), half-note bass stride,
 * a soft ledger-tick backbeat, and one recurring brand statement —
 * the SIX EXITS motif, a rising six-note ladder (one note per exit)
 * that lands on the tonic and resolves.
 *
 * Single source of truth for the three bed renderers: the deterministic
 * DSP fallback in audio.ts, the MIDI exporter (midi-export.ts), and the
 * offline soundfont bed render (sf2.ts + scripts/render-bed.ts).
 *
 * Pure data + pure functions. No browser APIs, no audio buffers — runs
 * identically in the studio page, the render harness, and node scripts.
 */

import { seededRandom } from './easing';

export const SR_BGM = 24000;
export const BPM = 68;
export const BEAT = 60 / BPM;
export const BAR = BEAT * 4;
export const LOOP_BARS = 4;
export const LOOP_DUR = BAR * LOOP_BARS; // ≈ 14.1 s
export const LOOP_LEN = Math.round(LOOP_DUR * SR_BGM);

// ── Note vocabulary ──────────────────────────────────────────────────────────

const NOTE_VALUES: Record<string, number> = {
  C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5,
  'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11,
};

/** 'C3' → MIDI 48 (C4 = 60). Unknown names fall back to 60. */
export function midiOf(note: string): number {
  const m = note.match(/^([A-G]#?)(-?\d)$/);
  if (!m) return 60;
  return NOTE_VALUES[m[1]] + (Number(m[2]) + 1) * 12;
}

/** Wide, warm voicings — the D-major harmonic language of this film. */
export const CHORDS: Record<string, { root: string; notes: string[] }> = {
  Dmaj9:  { root: 'D2',  notes: ['D2', 'A2', 'F#3', 'E4'] },
  Gmaj9:  { root: 'G2',  notes: ['G2', 'D3', 'B3', 'E4'] },
  Bm11:   { root: 'B2',  notes: ['B2', 'F#3', 'A3', 'D4'] },
  Amaj9:  { root: 'A2',  notes: ['A2', 'E3', 'C#4', 'B3'] },
  Em9:    { root: 'E2',  notes: ['E2', 'B2', 'D3', 'F#3'] },
  Asus2:  { root: 'A2',  notes: ['A2', 'E3', 'B3', 'E4'] },
};

export type Mood = 'sparse' | 'bright' | 'reflective' | 'curious' | 'lift' | 'resolve';

export const PROGRESSIONS: Record<Mood, string[]> = {
  sparse:     ['Dmaj9', 'Gmaj9', 'Bm11', 'Em9'],
  bright:     ['Dmaj9', 'Amaj9', 'Gmaj9', 'Dmaj9'],
  reflective: ['Bm11', 'Gmaj9', 'Dmaj9', 'Asus2'],
  curious:    ['Em9', 'Bm11', 'Asus2', 'Asus2'],
  lift:       ['Em9', 'Gmaj9', 'Asus2', 'Dmaj9'],
  resolve:    ['Gmaj9', 'Asus2', 'Dmaj9', 'Dmaj9'],
};

/** All distinct moods used by the chapter map (bed render covers these). */
export const MOODS: Mood[] = ['sparse', 'bright', 'reflective', 'curious', 'lift', 'resolve'];

/** The film's nine chapters — the ledger travels from a quiet open to a
 *  resolved close, with the "trap" chapters in the minor episodes. */
export const CHAPTER_MOODS: Mood[] = [
  'sparse',     // cold open — the two fortunes
  'bright',     // ch1 — the math of the trap
  'reflective', // exit 1 — the 10b5-1 plan
  'curious',    // exit 2 — the seven-year marriage
  'reflective', // exit 3 — direct indexing
  'curious',    // exit 4 — the Cuban collar
  'lift',       // exit 5 — charitable vehicles
  'bright',     // exit 6 — levered long/short
  'resolve',    // the framework
];

export function levelFor(mood: Mood, vol: number): number {
  const base = 0.5 * vol;
  switch (mood) {
    case 'sparse': return base * 0.55;
    case 'reflective': return base * 0.85;
    case 'curious': return base * 0.9;
    case 'bright': return base;
    case 'lift': return base * 1.12;
    case 'resolve': return base * 0.95;
  }
}

// ── The score ────────────────────────────────────────────────────────────────

export type VoiceName = 'pad' | 'piano' | 'bass' | 'shaker' | 'kick';

export interface ScoreNote {
  voice: VoiceName;
  midi: number;
  startSec: number;
  durSec: number;
  vel: number;
  pan: number;
}

/** General MIDI mapping for the soundfont render. */
export const GM_MAP: Record<VoiceName, { bank: number; program: number; drum: boolean }> = {
  pad:   { bank: 0,   program: 48, drum: false }, // String Ensemble 1
  piano: { bank: 0,   program: 0,  drum: false }, // Acoustic Grand
  bass:  { bank: 0,   program: 33, drum: false }, // Electric Bass (finger)
  shaker:{ bank: 128, program: 0,  drum: true  }, // GM kit · closed hi-hat (key 42)
  kick:  { bank: 128, program: 0,  drum: true  }, // GM kit · bass drum 1 (key 36)
};

/** Percussion keys for the drum voices (ignored for melodic voices). */
export const DRUM_KEYS: Record<'shaker' | 'kick', number> = {
  shaker: 42, // Closed Hi-Hat
  kick: 36,   // Bass Drum 1
};

/** DSP score velocity → musical MIDI velocity (1..127), per voice. */
export function midiVelocityFor(n: ScoreNote): number {
  let v: number;
  switch (n.voice) {
    case 'pad':    v = 28 + n.vel * 90;  break;
    case 'piano':  v = 38 + n.vel * 260; break;
    case 'bass':   v = 42 + n.vel * 180; break;
    case 'shaker': v = 22 + n.vel * 350; break;
    case 'kick':   v = 46 + n.vel * 200; break;
  }
  return Math.max(1, Math.min(127, Math.round(v)));
}

/**
 * One 4-bar loop of a mood as note events — THE LEDGER's own feel:
 * half-note bass stride, slow broken-chord piano with wide stereo,
 * the ledger tick on the backbeats. Deterministic per (mood, variant).
 */
export function moodScore(mood: Mood, variant: number): ScoreNote[] {
  const notes: ScoreNote[] = [];
  const rng = seededRandom(variant * 977 + mood.length * 131 + 29);
  const prog = PROGRESSIONS[mood];
  const eighth = BEAT * 0.5;
  const half = BEAT * 2;

  for (let bar = 0; bar < LOOP_BARS; bar++) {
    const barT = bar * BAR;
    const chordName = prog[bar % 4];
    const chord = CHORDS[chordName];

    // pad — full bar, every chord tone, softer than the old score so the
    // piano-forward mix reads "concert hall", not "elevator"
    chord.notes.forEach((n) => {
      notes.push({ voice: 'pad', midi: midiOf(n), startSec: barT, durSec: BAR * 1.05, vel: 0.26, pan: 0 });
    });

    // bass — the STRIDE: root on beat 1, root-or-fifth on beat 3 (a pulse
    // the old score's static whole-note root never had). Bright/lift lift
    // the beat-3 note to the fifth; the minor moods hold the root.
    const fifth = chord.notes[1];
    const beat3 = mood === 'bright' || mood === 'lift' ? fifth : chord.root;
    notes.push({ voice: 'bass', midi: midiOf(chord.root), startSec: barT, durSec: half * 0.94, vel: 0.4, pan: 0 });
    notes.push({ voice: 'bass', midi: midiOf(beat3), startSec: barT + half, durSec: half * 0.94, vel: 0.34, pan: 0 });

    // the LEDGER TICK — this film's percussion signature. Not a busy shaker
    // bed: a soft tick on beats 2 & 4 (the backbeat a pocket watch keeps),
    // plus a heart-throb kick on beat 1 for bright/lift only.
    if (mood === 'bright' || mood === 'lift') {
      notes.push({ voice: 'kick', midi: DRUM_KEYS.kick, startSec: barT, durSec: 0.3, vel: 0.34, pan: 0 });
      notes.push({ voice: 'shaker', midi: DRUM_KEYS.shaker, startSec: barT + BEAT, durSec: 0.12, vel: 0.3, pan: 0.25 });
      notes.push({ voice: 'shaker', midi: DRUM_KEYS.shaker, startSec: barT + BEAT * 3, durSec: 0.12, vel: 0.26, pan: -0.25 });
      // one soft pickup eighth before the bar turn
      notes.push({ voice: 'shaker', midi: DRUM_KEYS.shaker, startSec: barT + BEAT * 3.5, durSec: 0.12, vel: 0.14, pan: 0.1 });
    } else if (mood === 'curious') {
      notes.push({ voice: 'shaker', midi: DRUM_KEYS.shaker, startSec: barT + BEAT * 2.5, durSec: 0.12, vel: 0.2, pan: 0 });
    }

    // felt-piano BROKEN CHORD — the melody of the bed. Slow quarter-note
    // roll through the upper voicing (sparse/reflective/curious), gentle
    // eighths on bright/lift bars. Wide pan, soft swing.
    const upper = chord.notes.slice(1);
    const density = mood === 'sparse' ? 0.5 : mood === 'reflective' ? 0.6 : mood === 'curious' ? 0.55 : 0.8;
    const steps = mood === 'bright' || mood === 'lift' ? 8 : 4;
    for (let step = 0; step < steps; step++) {
      if (rng() < density) {
        const ni = (step + bar * 2 + variant) % upper.length;
        let note = upper[ni];
        if (rng() < 0.18) {
          note = note.replace(/(\d)$/, (d) => String(Number(d) + 1));
        }
        const swing = (rng() - 0.5) * 0.035;
        const vel = 0.4 + rng() * 0.24;
        const pan = (rng() - 0.5) * 1.3;
        const startSec = Math.max(0, barT + step * (BAR / steps) + swing);
        notes.push({ voice: 'piano', midi: midiOf(note), startSec, durSec: 2.4, vel, pan });
      }
    }
  }

  return notes;
}

/** Absolute DSP velocities for a mood loop at a given mix volume. */
export function scaledScore(mood: Mood, variant: number, vol: number): ScoreNote[] {
  const lv = levelFor(mood, vol);
  return moodScore(mood, variant).map((n) => ({ ...n, vel: n.vel * lv }));
}

// ── THE SIX EXITS THEME — 8 bars, stated three times ────────────────────────
// The brand statement: a rising six-note ladder — one note per exit —
// D4 E4 F#4 A4 B4 D5, landing on the tonic and resolving. Stated at the
// cold open, the reframe, and the end screen. D major, 68 BPM, fully
// deterministic — pure data, no rng, so every statement is identical.

export const THEME_BARS = 8;
export const THEME_DUR = BAR * THEME_BARS; // ≈ 28.2 s

/** The theme's own progression — question in the minor, answer in D. */
const THEME_PROGRESSION = ['Dmaj9', 'Gmaj9', 'Bm11', 'Gmaj9', 'Em9', 'Asus2', 'Dmaj9', 'Dmaj9'];

/** [midi, bar, beat, durBeats, vel, pan] — the melody, phrase by phrase. */
const THEME_MELODY: Array<[number, number, number, number, number, number]> = [
  // phrase 1 — THE SIX EXITS MOTIF, rising: D4 E4 F#4 | A4 B4 D5
  [62, 0, 0, 1.5, 0.46, -0.15],
  [64, 0, 1.5, 0.5, 0.4, 0.1],
  [66, 0, 2, 2, 0.44, 0.2],
  [69, 1, 0, 1.5, 0.46, -0.1],
  [71, 1, 1.5, 0.5, 0.4, 0.15],
  [74, 1, 2, 2, 0.5, 0.2],
  // phrase 2 — the answer descends: B4 A4 F#4 | E4 … D4
  [71, 2, 0, 1, 0.4, -0.2],
  [69, 2, 1, 1, 0.38, 0.15],
  [66, 2, 2, 2, 0.42, 0.0],
  [64, 3, 0, 1.5, 0.4, 0.1],
  [62, 3, 1.5, 2.5, 0.44, -0.15],
  // phrase 3 — the question returns in the minor: G4 F#4 E4 | B4 C#5
  [67, 4, 0, 2, 0.44, -0.1],
  [66, 4, 2, 1, 0.38, 0.1],
  [64, 4, 3, 1, 0.4, -0.15],
  [71, 5, 0, 1.5, 0.42, 0.15],
  [73, 5, 1.5, 1.5, 0.4, -0.1],
  // phrase 4 — the walk home, then the resolution on D5
  [69, 6, 0, 1.5, 0.42, 0.0],
  [66, 6, 1.5, 1, 0.38, 0.2],
  [64, 6, 2.5, 1.5, 0.4, -0.1],
  [74, 7, 0, 4, 0.5, 0.0],
];

/**
 * The theme as note events, truncated to `bars` (2 = the signature ladder,
 * 4 = the statement, 8 = the full arc). Melody in the felt-piano voice,
 * soft pad chords, half-note bass, ledger tick in the back half only —
 * the theme is a foreground gesture over the bed, never a second bed.
 */
export function themeScore(bars: number = THEME_BARS): ScoreNote[] {
  const notes: ScoreNote[] = [];
  const nBars = Math.max(1, Math.min(THEME_BARS, bars));
  for (let bar = 0; bar < nBars; bar++) {
    const barT = bar * BAR;
    const chord = CHORDS[THEME_PROGRESSION[bar]];
    // pad — chord tones, one bar, soft support (melody-forward balance)
    chord.notes.forEach((n) => {
      notes.push({ voice: 'pad', midi: midiOf(n), startSec: barT, durSec: BAR * 1.05, vel: 0.09, pan: 0 });
    });
    // bass — the half-note stride
    notes.push({ voice: 'bass', midi: midiOf(chord.root), startSec: barT, durSec: BEAT * 1.9, vel: 0.16, pan: 0 });
    notes.push({ voice: 'bass', midi: midiOf(chord.root), startSec: barT + BEAT * 2, durSec: BEAT * 1.9, vel: 0.12, pan: 0 });
    // ledger tick — bars 5-8 only, backbeats, light
    if (bar >= 4) {
      notes.push({ voice: 'shaker', midi: DRUM_KEYS.shaker, startSec: barT + BEAT, durSec: 0.12, vel: 0.16, pan: 0.25 });
      notes.push({ voice: 'shaker', midi: DRUM_KEYS.shaker, startSec: barT + BEAT * 3, durSec: 0.12, vel: 0.12, pan: -0.25 });
    }
  }
  // melody — the phrases, cut at the requested bar count
  for (const [midi, bar, beat, durBeats, vel, pan] of THEME_MELODY) {
    const startSec = bar * BAR + beat * BEAT;
    if (startSec >= nBars * BAR - 0.05) continue;
    notes.push({ voice: 'piano', midi, startSec, durSec: durBeats * BEAT, vel, pan });
  }
  return notes;
}

/** The coda — bar 8 alone (the held D5 over Dmaj9): appended after a 4-bar
 *  statement so the end screen both quotes the theme AND resolves it. */
export function themeCoda(): ScoreNote[] {
  return themeScore(THEME_BARS).filter((n) => n.startSec >= 7 * BAR - 0.05)
    .map((n) => ({ ...n, startSec: n.startSec - 7 * BAR }));
}
