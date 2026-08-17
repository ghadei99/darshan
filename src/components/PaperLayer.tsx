import type {CSSProperties} from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {MOTION} from '../motion';
import type {Layer} from '../types';

type PaperLayerProps = {
  layer: Layer;
  durationInFrames: number;
};

export const PaperLayer: React.FC<PaperLayerProps> = ({
  layer,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const lastFrame = Math.max(durationInFrames - 1, 1);

  const progress = interpolate(frame, [0, lastFrame], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Camera pan at depth=1; this layer takes a fraction equal to `depth`.
  const panX = interpolate(progress, [0, 1], [-MOTION.panX, MOTION.panX]);
  const panY = interpolate(progress, [0, 1], [-MOTION.panY * 0.25, MOTION.panY]);
  const kenBurns = interpolate(progress, [0, 1], [
    MOTION.kenBurnsFrom,
    MOTION.kenBurnsTo,
  ]);

  const minSide = Math.min(width, height);
  const panPad =
    (2 * Math.max(Math.abs(MOTION.panX), Math.abs(MOTION.panY))) / minSide;
  const kenBurnsPad = MOTION.kenBurnsTo - 1;
  const overscale = 1 + panPad + kenBurnsPad + MOTION.edgeMargin;

  const offsetX = layer.offset?.x ?? 0;
  const offsetY = layer.offset?.y ?? 0;
  const layerScale = layer.scale ?? 1;

  const style: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: [
      `translate(${panX * layer.depth + offsetX}px, ${panY * layer.depth + offsetY}px)`,
      `scale(${overscale * kenBurns * layerScale})`,
    ].join(' '),
    transformOrigin: 'center center',
  };

  return (
    <AbsoluteFill>
      <Img src={staticFile(layer.src)} style={style} />
    </AbsoluteFill>
  );
};
