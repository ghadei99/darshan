export type CaptionPosition =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center';

export type Layer = {
  /** Path relative to /public, e.g. "scenes/hillside/background.png" */
  src: string;
  /** 0 = farthest (moves least), 1 = nearest (moves most) */
  depth: number;
  offset?: {x: number; y: number};
  scale?: number;
};

export type Caption = {
  text: string;
  startFrame: number;
  position?: CaptionPosition;
};

export type SceneConfig = {
  id: string;
  durationInFrames: number;
  layers: Layer[];
  caption?: Caption;
  /** Path relative to /public, e.g. "audio/hillside.mp3" */
  narrationAudio?: string;
};

export type StoryConfig = {
  scenes: SceneConfig[];
  /** Path relative to /public. Played under the whole piece at low volume. */
  backgroundMusic?: string;
  backgroundMusicVolume?: number;
};
