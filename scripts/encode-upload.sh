#!/usr/bin/env bash
# U30 (review report U30 — ENCODE): the upload encode is a two-pass x264 run
# at 1080p30, CRF 17-18 with a 12-16 Mbps cap and AAC 256k audio. CPU-only,
# slow-but-fine overnight on the 8GB laptop. Do NOT render 4K: 1080p with
# this film's ink contrast survives the platform transcode better than 4K
# downsampled. The first upload runs the FIRST_UPLOAD_CUT (see
# src/lib/engine/script-data.ts) — render it first, encode it here.
#
# Usage: scripts/encode-upload.sh <input.mp4> [output.mp4]
set -euo pipefail

IN="${1:?usage: encode-upload.sh <input.mp4> [output.mp4]}"
OUT="${2:-${IN%.*}-upload.mp4}"
FPS=30
CRF=17          # 17-18 per the report; 17 keeps the ink edges clean
VBV="14M"       # the 12-16 Mbps cap (peak buffer)
AAC="256k"

command -v ffmpeg >/dev/null 2>&1 || { echo "ffmpeg not found"; exit 1; }
command -v ffprobe >/dev/null 2>&1 || { echo "ffprobe not found"; exit 1; }

# force 30fps and square pixels before the passes (the render may be VFR)
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")

# PASS 1 — analytics (fast, /dev/null out)
ffmpeg -y -i "$IN" -an -c:v libx264 -preset slow -b:v 14M -maxrate "$VBV" \
  -bufsize "$VBV" -r "$FPS" -pass 1 -passlogfile /tmp/x264-pass -f rawvideo /dev/null

# PASS 2 — the upload master (CRF-capped VBR)
ffmpeg -y -i "$IN" -c:v libx264 -preset slow -crf "$CRF" -b:v 14M -maxrate "$VBV" \
  -bufsize "$VBV" -r "$FPS" -pix_fmt yuv420p -profile:v high -pass 2 \
  -passlogfile /tmp/x264-pass -c:a aac -b:a "$AAC" -movflags +faststart "$OUT"

echo "encoded: $OUT ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")s)"
# faststart moves the moov atom front — the platform's first-read matters.
