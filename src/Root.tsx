import {Composition} from 'remotion';
import {Story} from './components/Story';
import {getStoryDurationInFrames, VIDEO} from './story';

export const RemotionRoot: React.FC = () => {
  const durationInFrames = getStoryDurationInFrames();

  return (
    <>
      <Composition
        id="Story"
        component={Story}
        durationInFrames={durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id="StoryVertical"
        component={Story}
        durationInFrames={durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.verticalWidth}
        height={VIDEO.verticalHeight}
      />
    </>
  );
};
