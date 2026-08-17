import {AbsoluteFill, Audio, Series, staticFile} from 'remotion';
import {CROSSFADE_FRAMES, PAPER} from '../motion';
import {story} from '../story';
import {Scene} from './Scene';

export const Story: React.FC = () => {
  const {scenes, backgroundMusic, backgroundMusicVolume} = story;

  return (
    <AbsoluteFill style={{backgroundColor: PAPER.background}}>
      {backgroundMusic ? (
        <Audio
          src={staticFile(backgroundMusic)}
          volume={() => backgroundMusicVolume ?? 0.12}
        />
      ) : null}
      <Series>
        {scenes.map((scene, index) => (
          <Series.Sequence
            key={scene.id}
            durationInFrames={scene.durationInFrames}
            offset={index === 0 ? 0 : -CROSSFADE_FRAMES}
          >
            <Scene
              scene={scene}
              isFirst={index === 0}
              isLast={index === scenes.length - 1}
            />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
