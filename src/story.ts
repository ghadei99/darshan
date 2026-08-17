import type {StoryConfig} from './types';
import {CROSSFADE_FRAMES} from './motion';

/**
 * Change composition size / frame rate here (Root reads these).
 * 16:9 defaults; StoryVertical uses the vertical pair.
 */
export const VIDEO = {
  fps: 30,
  width: 1920,
  height: 1080,
  verticalWidth: 1080,
  verticalHeight: 1920,
} as const;

/**
 * Siddhartha meets Gotama — three shots.
 * Add, remove, or reorder scenes here — no component edits required.
 */
export const story: StoryConfig = {
  // backgroundMusic: 'audio/bed.mp3',
  backgroundMusicVolume: 0.1,
  scenes: [
    {
      id: 'the-dialogue',
      durationInFrames: 210,
      layers: [
        {src: 'scenes/dialogue/background.png', depth: 0.08},
        {src: 'scenes/dialogue/midground.png', depth: 0.55, offset: {x: 0, y: 12}},
        {src: 'scenes/dialogue/foreground.png', depth: 1, offset: {x: -8, y: 0}, scale: 1.04},
      ],
      caption: {
        text: 'Neither bowed. Silence stood between them.',
        startFrame: 28,
        position: 'bottom-left',
      },
    },
    {
      id: 'the-recognition',
      durationInFrames: 210,
      layers: [
        {src: 'scenes/recognition/background.png', depth: 0.1},
        {src: 'scenes/recognition/midground.png', depth: 0.6, offset: {x: 0, y: 18}, scale: 1.06},
        {src: 'scenes/recognition/foreground.png', depth: 1, scale: 1.03},
      ],
      caption: {
        text: 'The seeker. The awakened.',
        startFrame: 24,
        position: 'bottom-center',
      },
    },
    {
      id: 'the-departure',
      durationInFrames: 240,
      layers: [
        {src: 'scenes/departure/background.png', depth: 0.06},
        {src: 'scenes/departure/midground.png', depth: 0.5, offset: {x: 10, y: 8}},
        {src: 'scenes/departure/foreground.png', depth: 1, offset: {x: 0, y: 10}, scale: 1.05},
      ],
      caption: {
        text: 'He walked on. The smile was only knowing.',
        startFrame: 32,
        position: 'bottom-left',
      },
    },
  ],
};

export const getStoryDurationInFrames = (
  scenes: StoryConfig['scenes'] = story.scenes,
  crossfade = CROSSFADE_FRAMES,
): number => {
  if (scenes.length === 0) {
    return 1;
  }

  return scenes.reduce((total, scene, index) => {
    const overlap = index === 0 ? 0 : Math.min(crossfade, scene.durationInFrames - 1);
    return total + scene.durationInFrames - overlap;
  }, 0);
};
