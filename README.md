# Darshana Suite

Classical Indian philosophical reasoning tools — a unified Next.js app in [`syadvada-engine/`](syadvada-engine/).

**Live:** [darshana-suite.vercel.app](https://darshana-suite.vercel.app)

### Modules

| Route | Tool |
| --- | --- |
| `/nyaya` | Nyāya-Logic — syllogistic argument analysis |
| `/syadvada` | Syādvāda Engine — seven-fold conditional logic |
| `/pramana` | Prāmāṇa Explorer — epistemic classification |
| `/debate` | Vāda-Katha — classical debate arena |
| `/yoga-analyzer` | Yoga-Sūtra Pattern Analyzer |
| `/dharma` | Dharma Dilemma Solver |
| `/archive` | Darśana Archive — term glossary |

### Run Darshana Suite

```bash
cd syadvada-engine
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Optional: copy `syadvada-engine/.env.example` → `.env.local` and set `GEMINI_API_KEY`.

---

# Paper collage stories

Short, handmade cut-paper animations in [Remotion](https://www.remotion.dev). Scenes are data: edit `src/story.ts` and the film restacks itself.

Default output is **1920×1080 at 30fps**. A **9:16** composition (`StoryVertical`, 1080×1920) is registered for social cuts.

## Install

Needs Node.js 18+.

```bash
npm install
```

`postinstall` generates the placeholder PNG layers in `public/scenes/` so the project renders immediately.

If the placeholders are missing later:

```bash
npm run generate:assets
```

## Preview

```bash
npm start
```

Same thing via the Node wrapper:

```bash
npm run preview
```

Remotion Studio opens in the browser. Pick **Story** (landscape) or **StoryVertical** (portrait).

## Render to MP4

```bash
npm run render
```

Writes `out/story.mp4` (H.264). Vertical:

```bash
npm run render:vertical
```

Writes `out/story-vertical.mp4`.

## Add or reorder a scene

Edit **only** `src/story.ts`. Do not touch `src/components/Scene.tsx` or `src/components/Story.tsx`.

1. Put layer PNGs under `public/scenes/<id>/` (see below).
2. Append (or splice) an object into `story.scenes`:

```ts
{
  id: 'the-river',
  durationInFrames: 150,
  layers: [
    {src: 'scenes/river/background.png', depth: 0.1},
    {src: 'scenes/river/midground.png', depth: 0.5},
    {src: 'scenes/river/foreground.png', depth: 1},
  ],
  caption: {
    text: 'The river kept the secret.',
    startFrame: 18,
    position: 'bottom-left',
  },
  // narrationAudio: 'audio/river.mp3',
}
```

- `depth` is `0` (far, almost still) → `1` (near, full parallax).
- `offset` and `scale` on a layer are optional nudges.
- `caption` and `narrationAudio` are optional.
- Scene order in the array is playback order. Duration of the composition is computed automatically, including the ~10-frame cross-fade.

Optional bed music for the whole piece:

```ts
backgroundMusic: 'audio/bed.mp3',
backgroundMusicVolume: 0.12,
```

Place files under `public/` and reference them without the `public/` prefix.

## Prepare layered PNG cut-outs

Each scene is a stack of transparent PNGs, like a Tiepolo paper cut: background wash, midground silhouettes, foreground scraps.

1. Work at **1920×1920** (or larger). Square assets cover both 16:9 and 9:16; the compositor uses `object-fit: cover` plus a little overscale so pan/zoom never shows edges. The bundled placeholders are 1920×1920 PNGs.
2. Export **PNG with alpha**. Keep torn / deckled edges in the alpha — that is the collage look.
3. Suggested stack:
   - `background.png` — paper sky, distant hills. Mostly opaque. `depth` ≈ `0.05–0.15`.
   - `midground.png` — trees, houses, ridges. Transparent around the silhouette. `depth` ≈ `0.4–0.6`.
   - `foreground.png` — nearest scraps, figures, lamps. Lots of transparency. `depth` ≈ `0.9–1`.
4. Name them however you like; `src` in `story.ts` is the path under `public/`.
5. Replace the generated files in `public/scenes/hillside|flight|home/` or add a new folder and a new scene entry.

Avoid putting important detail in the outer ~8% of the frame — Ken Burns zoom and parallax crop that band.

## Tune motion

`src/motion.ts` holds pan distance, Ken Burns amount, edge overscale, and cross-fade length. Comments there describe the parallax math.

## Change size or fps

Edit `VIDEO` in `src/story.ts` (`width`, `height`, `fps`, plus the vertical pair). Root compositions read those values.

## Scripts

| Script | What it does |
| --- | --- |
| `npm start` / `npm run preview` | Remotion Studio |
| `npm run render` | MP4 of `Story` |
| `npm run render:vertical` | MP4 of `StoryVertical` |
| `npm run generate:assets` | Rebuild placeholder cut-outs |
