/**
 * Camera / parallax knobs — tweak here, not in the Scene component.
 *
 * Virtual camera: over the scene we ease a unit progress 0→1, then
 * map that to a pan (pixels at depth=1) and a Ken Burns zoom.
 *
 * Layer translation:
 *   x = panX * depth + offset.x
 *   y = panY * depth + offset.y
 * Far layers (depth ≈ 0) barely move; near layers (depth ≈ 1) take
 * the full pan. That is the 2.5D parallax.
 *
 * Edge coverage:
 *   overscale ≈ 1 + (2 * max|pan| / min(width,height)) + kenBurnsExtra + margin
 * Layers are drawn larger than the frame so pan + zoom never flash empty edges.
 */
export const MOTION = {
  /** Peak horizontal travel in px for a depth=1 layer (half on each side of center). */
  panX: 28,
  /** Peak vertical travel in px for a depth=1 layer. Keep smaller than panX — handmade, not a flyover. */
  panY: 14,
  /** Ken Burns: start scale → end scale (about 5% push-in). Stay in 1.03–1.06. */
  kenBurnsFrom: 1,
  kenBurnsTo: 1.05,
  /** Extra uniform scale so panning cannot reveal the layer bounds. */
  edgeMargin: 0.08,
} as const;

export const CROSSFADE_FRAMES = 16;

export const PAPER = {
  background: '#e6d9c4',
  label: 'rgba(246, 239, 226, 0.88)',
  ink: '#3a2e24',
  rule: 'rgba(58, 46, 36, 0.12)',
} as const;
