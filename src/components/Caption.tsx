import type {CSSProperties} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {PAPER} from '../motion';
import type {Caption as CaptionConfig, CaptionPosition} from '../types';

type CaptionProps = {
  caption: CaptionConfig;
};

const positionStyle = (position: CaptionPosition): CSSProperties => {
  const inset = 56;
  const base: CSSProperties = {
    position: 'absolute',
    maxWidth: '70%',
  };

  switch (position) {
    case 'bottom-center':
      return {...base, bottom: inset, left: '50%', transform: 'translateX(-50%)'};
    case 'bottom-right':
      return {...base, bottom: inset, right: inset};
    case 'top-left':
      return {...base, top: inset, left: inset};
    case 'top-center':
      return {...base, top: inset, left: '50%', transform: 'translateX(-50%)'};
    case 'top-right':
      return {...base, top: inset, right: inset};
    case 'center':
      return {
        ...base,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    case 'bottom-left':
    default:
      return {...base, bottom: inset, left: inset};
  }
};

export const Caption: React.FC<CaptionProps> = ({caption}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const position = caption.position ?? 'bottom-left';

  if (frame < caption.startFrame) {
    return null;
  }

  const appear = spring({
    frame: frame - caption.startFrame,
    fps,
    config: {
      damping: 16,
      mass: 0.65,
      stiffness: 90,
    },
  });

  const opacity = interpolate(appear, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rise = interpolate(appear, [0, 1], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const placed = positionStyle(position);
  const hasTranslate = typeof placed.transform === 'string';

  return (
    <div
      style={{
        ...placed,
        opacity,
        transform: hasTranslate
          ? `${placed.transform} translateY(${rise}px)`
          : `translateY(${rise}px)`,
        zIndex: 20,
      }}
    >
      <div
        style={{
          background: PAPER.label,
          color: PAPER.ink,
          padding: '14px 22px 16px',
          borderRadius: 2,
          boxShadow: `0 1px 0 ${PAPER.rule}, 0 10px 28px rgba(58, 46, 36, 0.08)`,
          fontFamily:
            'Palatino, "Palatino Linotype", "Iowan Old Style", Georgia, serif',
          fontSize: 32,
          lineHeight: 1.35,
          letterSpacing: '0.01em',
          fontWeight: 400,
        }}
      >
        {caption.text}
      </div>
    </div>
  );
};
