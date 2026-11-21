# 🎬 Concentrated Stock — Video Studio (the "Gilded Ledger" edition)

Renders the complete YouTube script — **"How Professionals De-Risk Without a Huge Tax Bill"** (Concentrated Stock Positions: the six exits) — as a premium stick-man explainer video, **frame by frame**, and saves a YouTube-ready MP4 straight to your laptop.

This is the same proven studio engine as the previous film, with a completely new visual and musical identity built for this script — **not a re-skin**:

- **"GILDED LEDGER" design system** — warm champagne-paper canvas (never black, never flat white), deep green-charcoal ink, **emerald** for up / **oxblood** for down, gold-leaf accents, serif display numerals, and one dramatic register: deep emerald glass panels for the kill-condition cards
- **A new host** — the same articulated stick-man rig, re-costumed as "the managing director": emerald blazer, champagne-gold vest, gold scarf, gold rim light on the head, champagne metal-spine limbs
- **A new brand mark** — struck-gold **INGOT** replaces the old letter glyph everywhere (watermark, sparkle bursts, chapter cards, the 3-D chapter centerpiece)
- **A new transition** — the **Gold Ledger Sweep**: a gold hairline + champagne trail + ingot sparks (replaces the old letter-wipe)
- **A new score** — "The Ledger": 68 BPM, D major, half-note bass stride, ledger-tick backbeat, and the recurring **Six Exits motif** (a rising six-note ladder, one note per exit) stated at the open, the reframe and the close
- **21 new scene drawers** built for this script — the Ballmer/Gates crossing chart, the J.P. Morgan distribution, the UNH drawdown, the $3.7M tax stack, the 10b5-1 conveyor, the exchange-fund pool, the seven-year lock bar, the direct-indexing explode grid, the Cuban collar payoff diagram, the CRT/DAF flow, the 130/30 structure, the Apple case study, the layered-sequence stack, and the framework **decision table** (the save artifact)
- **`[SRC]` lower-thirds everywhere** — every sourced claim carries its on-screen citation chip; the visual signature of a researched channel
- **~40 minutes** of finished video (the full ~5,400-word script, 190 beats, 9 chapters, ~72,000 frames at 1080p/30)
- Human-like neural voiceover (free Microsoft Edge voices — Andrew by default), karaoke captions synced word-by-word, original royalty-free score composed by code with automatic ducking
- Chapter cards with the ledger sweep, animated charts with landing impacts, the ingestible decision table, progress bar, end screen, and a thumbnail generator
- Offline render QA harness — `node tools/preview-frames.mjs` renders representative frames of the new film to `./preview-frames/` without opening the studio

---

## 1 · One-time setup (Windows, 8 GB RAM — fine)

You only need **Node.js** and **Chrome or Edge**. Nothing else.

1. Install **Node.js LTS** from <https://nodejs.org>.
2. Copy this project folder anywhere, e.g. `C:\concentrated-stock-studio`.
3. Open Command Prompt in that folder and run:

   ```
   npm install
   ```

4. Start the studio:

   ```
   npm run dev
   ```

5. Open <http://localhost:3000> in Chrome or Edge (WebCodecs encoding needs Chromium).

> ⚡ Voice generation needs network access the first time; the lines are cached on disk and every render after that is 100% offline.

## 2 · Making the video (3 clicks)

| Step | What you click | What happens | Time |
|---|---|---|---|
| 1 | **Prepare project** | Generates all voice clips (cached), builds the frame-accurate timeline, composes the score and mixes the audio | ~4–6 min first time |
| 2 | *(optional)* **▶ Play** in the preview | Watch the whole video before committing | real time |
| 3 | **Render full MP4** → choose where to save | Renders frame by frame and streams the MP4 to that folder | **60–120 min** — let it run |

Then **upload the MP4 to YouTube**. The Upload kit panel carries this film's title options, description, chapter timestamps (computed from your actual render), tags, and the pinned comment. The **Thumbnail** button builds a 1280×720 PNG.

### Tips

- Keep the tab visible and the laptop plugged in.
- Run **Test render · 6s** first to confirm everything works.
- On a tired laptop, switch **Resolution → 720p** — roughly doubles render speed.

## 3 · What's inside

```
src/app/page.tsx              ← the Studio UI (Next.js + shadcn/ui)
src/app/api/tts/…             ← free neural voiceover service (Edge TTS) + disk cache
src/lib/engine/script-data.ts ← the entire Concentrated-Stock script, 190 beats
src/lib/engine/scenes-finance.ts ← the film's 21 own scene drawers
src/lib/engine/director.ts    ← scene registry, camera, chapter cards, captions
src/lib/engine/stickman-v2.ts ← the host: skeleton, gestures, walk cycle, visemes
src/lib/engine/theme.ts       ← the Gilded Ledger palette + room system
src/lib/engine/effects.ts     ← the ingot brand mark, the ledger sweep, grain/vignette
src/lib/engine/charts.ts      ← animated line charts, pies, bars, counters
src/lib/engine/score.ts       ← "The Ledger" score as data (new key, new motif)
src/lib/engine/audio.ts       ← DSP composer + mixer with ducking
src/lib/engine/encode.ts      ← WebCodecs H.264 + MP4 muxing, streamed to disk
src/lib/engine/timeline.ts    ← audio-driven, frame-accurate edit decision list
```

**Every visual and every sound is generated by code** — stick man, charts, score, captions. Zero copyrighted assets: the video is fully monetizable from day one.

## 4 · Offline frame QA (no browser needed)

```
node tools/preview-frames.mjs        # ~26 representative frames → ./preview-frames/
```

## 5 · Troubleshooting

| Symptom | Fix |
|---|---|
| "voice generation failed" | Network blocked — try another network; cached lines survive. |
| "This browser cannot encode video" | Use Chrome or Edge, latest. |
| Render paused | The tab was hidden — bring it to the front. |
| Want a shorter cut | The script marks the tight-cut blocks; comment those beats out in `script-data.ts` and re-prepare. |

## 6 · The script & sources

`Concentrated_Stock_SCRIPT.md` in this repo is the full shooting script (every `[VISUAL]`, `[SRC]`, `[TONE]` cue). Every factual claim carries an on-screen `[SRC]` lower-third; the full URL list ships in the description block and the pinned comment.
