/**
 * Default render settings. Width / height / fps for compositions
 * live in `src/story.ts` (`VIDEO`) so both Studio and duration math stay in sync.
 *
 * All options: https://www.remotion.dev/docs/config
 */
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');
