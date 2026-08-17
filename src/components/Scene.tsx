import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CROSSFADE_FRAMES, PAPER} from '../motion';
import type {SceneConfig} from '../types';
import {Caption} from './Caption';
import {PaperLayer} from './PaperLayer';

type SceneProps = {
  scene: SceneConfig;
  isFirst: boolean;
  isLast: boolean;
};

export const Scene: React.FC<SceneProps> = ({scene, isFirst, isLast}) => {
  const frame = useCurrentFrame();
  const sorted = [...scene.layers].sort((a, b) => a.depth - b.depth);

  const fadeIn = isFirst
    ? 1
    : interpolate(frame, [0, CROSSFADE_FRAMES], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
  const fadeOut = isLast
    ? interpolate(
        frame,
        [scene.durationInFrames - 18, scene.durationInFrames],
        [1, 0],
        {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        },
      )
    : interpolate(
        frame,
        [scene.durationInFrames - CROSSFADE_FRAMES, scene.durationInFrames],
        [1, 0],
        {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        },
      );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PAPER.background,
        opacity: Math.min(fadeIn, fadeOut),
        overflow: 'hidden',
      }}
    >
      {sorted.map((layer) => (
        <PaperLayer
          key={`${scene.id}-${layer.src}-${layer.depth}`}
          layer={layer}
          durationInFrames={scene.durationInFrames}
        />
      ))}
      {scene.caption ? <Caption caption={scene.caption} /> : null}
      {scene.narrationAudio ? (
        <Audio src={staticFile(scene.narrationAudio)} />
      ) : null}
    </AbsoluteFill>
  );
};
