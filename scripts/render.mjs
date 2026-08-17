#!/usr/bin/env node
import {spawn} from 'node:child_process';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const vertical = process.argv.includes('--vertical');
const composition = vertical ? 'StoryVertical' : 'Story';
const outFile = vertical ? 'out/story-vertical.mp4' : 'out/story.mp4';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const child = spawn(
  'npx',
  ['remotion', 'render', composition, outFile],
  {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  },
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
